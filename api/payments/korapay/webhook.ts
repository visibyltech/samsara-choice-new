import { createHmac, timingSafeEqual } from 'node:crypto';
import { settleKoraPayment } from '../../../lib/koraSettlement';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ received: false });
  }

  const secret = process.env.KORAPAY_SECRET_KEY;
  const signature = req.headers['x-korapay-signature'];
  const data = req.body?.data;
  if (!secret || typeof signature !== 'string' || !data || typeof data !== 'object') {
    return res.status(401).json({ received: false });
  }

  const expected = createHmac('sha256', secret).update(JSON.stringify(data)).digest('hex');
  const expectedBytes = Buffer.from(expected, 'hex');
  const receivedBytes = Buffer.from(signature, 'hex');
  const valid = expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
  if (!valid) return res.status(401).json({ received: false });

  // Acknowledge non-charge events; only successful charge events can credit orders.
  if (req.body.event !== 'charge.success' || data.status !== 'success') {
    return res.status(200).json({ received: true, processed: false });
  }

  const reference = typeof data.reference === 'string' ? data.reference : '';
  if (!reference) return res.status(400).json({ received: false, error: 'Missing payment reference.' });

  try {
    // Verify with Kora's API as well as the signed webhook before releasing any value.
    const response = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const payload = await response.json() as {
      status?: boolean;
      data?: { reference?: string; status?: string; amount?: number | string; amount_paid?: number | string; currency?: string; transaction_status?: string };
    };
    const amount = Number(payload.data?.amount_paid ?? payload.data?.amount);
    const verified = Boolean(
      response.ok &&
      payload.status &&
      payload.data?.status === 'success' &&
      (!payload.data?.transaction_status || payload.data.transaction_status === 'success') &&
      Number.isFinite(amount) &&
      amount > 0
    );
    if (!verified) return res.status(200).json({ received: true, processed: false, reason: 'Kora verification is not successful.' });

    const result = await settleKoraPayment({
      reference: payload.data?.reference || reference,
      amount,
      currency: String(payload.data?.currency || data.currency || ''),
    });
    return res.status(200).json({ received: true, processed: true, alreadyProcessed: result.alreadyProcessed });
  } catch (error) {
    // Non-200 causes Kora to retry; this is intentional until the ledger update succeeds.
    return res.status(503).json({
      received: false,
      error: error instanceof Error ? error.message : 'Payment settlement failed; retry required.',
    });
  }
}
