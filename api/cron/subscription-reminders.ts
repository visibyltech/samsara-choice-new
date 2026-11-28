import {
  commitFirestoreUpdates,
  createFirestoreDocument,
  decodeFields,
  queryFirestoreDocuments,
} from '../../lib/firestoreRest';

function isDueWithinReminderWindow(nextRenewalDate: string, now: Date): boolean {
  const due = new Date(nextRenewalDate);
  if (Number.isNaN(due.getTime())) return false;
  const daysUntil = (due.getTime() - now.getTime()) / 86_400_000;
  return daysUntil >= -1 && daysUntil <= 3;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized cron request.' });
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return res.status(503).json({ error: 'FIREBASE_SERVICE_ACCOUNT_JSON is not configured.' });
  }

  try {
    const now = new Date();
    const docs = await queryFirestoreDocuments('subscriptions', 'status', 'active', 200);
    let remindersCreated = 0;
    let emailsSent = 0;
    let skipped = 0;

    for (const document of docs) {
      const subscription = decodeFields(document.fields);
      if (!subscription.userId || !subscription.customerEmail ||
          !isDueWithinReminderWindow(String(subscription.nextRenewalDate || ''), now)) {
        skipped += 1;
        continue;
      }

      if (Number(subscription.remindersSent || 0) >= 1) {
        skipped += 1;
        continue;
      }
      const lastReminder = subscription.lastReminderAt ? new Date(subscription.lastReminderAt) : null;
      if (lastReminder && !Number.isNaN(lastReminder.getTime()) && now.getTime() - lastReminder.getTime() < 20 * 60 * 60 * 1000) {
        skipped += 1;
        continue;
      }

      const renewalDate = new Date(subscription.nextRenewalDate);
      const dateLabel = renewalDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' });
      const title = `Your Samsara Choice ${subscription.frequency} foodstuff renewal is approaching`;
      const message = `Hello ${subscription.customerName || 'Customer'}, your ${subscription.planName} foodstuff subscription is due for renewal on ${dateLabel}. Your current cycle is ${subscription.currency} ${Number(subscription.pricePerCycle || 0).toLocaleString()}. Please renew from your Samsara Choice account to keep your deliveries on schedule.`;
      const notificationId = `sub-reminder-${String(subscription.id).replace(/[^a-zA-Z0-9_-]/g, '-')}-${renewalDate.toISOString().slice(0, 10)}`;

      try {
        await createFirestoreDocument('notifications', notificationId, {
          id: notificationId,
          targetRole: 'customer',
          userId: subscription.userId,
          type: 'subscription_renewal',
          title: title.slice(0, 160),
          message: message.slice(0, 600),
          relatedId: subscription.id,
          read: false,
          createdAt: { __timestamp: now.toISOString() },
        });
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('(409)')) throw error;
      }

      if (process.env.RESEND_API_KEY) {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'Samsara Choice Ltd <orders@samsarachoice.com>',
            to: [subscription.customerEmail],
            subject: title,
            text: message,
          }),
        });
        if (emailResponse.ok) emailsSent += 1;
      }

      await commitFirestoreUpdates([{
        document,
        fields: {
          remindersSent: Number(subscription.remindersSent || 0) + 1,
          lastReminderAt: now.toISOString(),
          updatedAt: { __timestamp: now.toISOString() },
        },
      }]);
      remindersCreated += 1;
    }

    return res.status(200).json({ ok: true, remindersCreated, emailsSent, skipped });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Subscription reminder job failed.' });
  }
}
