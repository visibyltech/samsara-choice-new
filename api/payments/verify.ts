import { verifyFirebaseBearerToken } from '../_lib/auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const caller = await verifyFirebaseBearerToken(req.headers.authorization);
  if (!caller || !caller.emailVerified) return res.status(401).json({ error: 'Verified sign-in required.' });

  const { gateway, reference, sessionId } = req.body || {};
  if (typeof gateway !== 'string' || typeof reference !== 'string') {
    return res.status(400).json({ error: 'Missing gateway or reference.' });
  }

  try {
    if (gateway === 'korapay') {
      const secret = process.env.KORAPAY_SECRET_KEY;
      if (!secret) return res.status(503).json({ verified: false, error: 'Korapay secret key is not configured.' });
      const response = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const payload = await response.json() as {
        status?: boolean;
        data?: { reference?: string; status?: string; amount?: string | number; amount_paid?: string | number; currency?: string; transaction_status?: string };
      };
      const expectedAmount = Number(payload.data?.amount);
      const amount = Number(payload.data?.amount_paid ?? payload.data?.amount);
      const verified = Boolean(
        response.ok &&
        payload.status &&
        payload.data?.status === 'success' &&
        (!payload.data?.transaction_status || payload.data.transaction_status === 'success') &&
        Number.isFinite(expectedAmount) &&
        Number.isFinite(amount) &&
        expectedAmount > 0 &&
        amount >= expectedAmount
      );
      return res.status(200).json({
        verified,
        gateway,
        reference: payload.data?.reference || reference,
        amount: Number.isFinite(amount) ? amount : undefined,
        currency: payload.data?.currency,
      });
    }

    if (gateway === 'paystack') {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (!secret) return res.status(503).json({ verified: false, error: 'Paystack secret key not configured.' });
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const payload = await response.json() as { status?: boolean; data?: { status?: string; amount?: number; currency?: string } };
      return res.status(200).json({
        verified: Boolean(response.ok && payload.status && payload.data?.status === 'success'),
        gateway, reference,
        amount: payload.data?.amount ? payload.data.amount / 100 : undefined,
        currency: payload.data?.currency,
      });
    }

    if (gateway === 'stripe') {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret || typeof sessionId !== 'string') return res.status(503).json({ verified: false, error: 'Stripe secret key or sessionId missing.' });
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const payload = await response.json() as { payment_status?: string; amount_total?: number; currency?: string };
      return res.status(200).json({
        verified: Boolean(response.ok && payload.payment_status === 'paid'),
        gateway, reference,
        amount: payload.amount_total ? payload.amount_total / 100 : undefined,
        currency: payload.currency?.toUpperCase(),
      });
    }

    if (gateway === 'flutterwave') {
      const secret = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secret) return res.status(503).json({ verified: false, error: 'Flutterwave secret key not configured.' });
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const payload = await response.json() as { status?: string; data?: { status?: string; amount?: number; currency?: string } };
      return res.status(200).json({
        verified: Boolean(response.ok && payload.status === 'success' && payload.data?.status === 'successful'),
        gateway, reference, amount: payload.data?.amount, currency: payload.data?.currency,
      });
    }
    return res.status(400).json({ verified: false, error: 'Unsupported gateway for verification.' });
  } catch (error) {
    return res.status(500).json({ verified: false, error: error instanceof Error ? error.message : 'Verification error.' });
  }
}
