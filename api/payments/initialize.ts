import { verifyFirebaseBearerToken } from '../_lib/auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const caller = await verifyFirebaseBearerToken(req.headers.authorization);
  if (!caller || !caller.emailVerified) {
    return res.status(401).json({ error: 'Verified sign-in required to initialize payment.' });
  }

  const { gateway, market, currency, amount, reference, orderNumber, callbackUrl } = req.body || {};
  if (
    typeof gateway !== 'string' ||
    typeof currency !== 'string' ||
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof reference !== 'string' ||
    reference.length < 8
  ) {
    return res.status(400).json({ error: 'Invalid payment initialization payload.' });
  }

  try {
    if (gateway === 'korapay') {
      const secret = process.env.KORAPAY_SECRET_KEY;
      if (!secret) {
        return res.status(503).json({
          configured: false,
          gateway: 'korapay',
          message: 'Korapay is integrated, but KORAPAY_SECRET_KEY is not configured in Vercel.',
        });
      }
      const appUrl = typeof callbackUrl === 'string' && callbackUrl.startsWith('https://')
        ? callbackUrl
        : process.env.APP_URL || 'https://samsara-choice-new.vercel.app';
      const redirect = new URL(appUrl);
      redirect.searchParams.set('reference', reference);
      redirect.searchParams.set('gateway', 'korapay');

      const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100) / 100,
          currency: currency === 'AUD' ? 'AUD' : 'NGN',
          reference,
          redirect_url: redirect.toString(),
          notification_url: `${appUrl.replace(/\/$/, '')}/api/payments/korapay/webhook`,
          narration: `Samsara Choice order ${String(orderNumber || reference)}`,
          merchant_bears_cost: false,
          customer: { name: caller.displayName || caller.email, email: caller.email },
          metadata: {
            orderNumber: String(orderNumber || reference).slice(0, 20),
            userId: caller.uid.slice(0, 20),
          },
        }),
      });
      const payload = await response.json() as {
        status?: boolean;
        message?: string;
        data?: { reference?: string; checkout_url?: string };
      };
      if (!response.ok || !payload.status || !payload.data?.checkout_url) {
        return res.status(502).json({ error: payload.message || 'Korapay checkout initialization failed.' });
      }
      return res.status(200).json({
        configured: true,
        gateway: 'korapay',
        authorizationUrl: payload.data.checkout_url,
        reference: payload.data.reference || reference,
      });
    }

    if (gateway === 'paystack') {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (!secret) return res.status(503).json({ configured: false, gateway, message: 'PAYSTACK_SECRET_KEY is not configured.' });
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: caller.email,
          amount: Math.round(amount * 100),
          currency: currency === 'AUD' ? 'AUD' : 'NGN',
          reference,
          callback_url: typeof callbackUrl === 'string' && callbackUrl.startsWith('http') ? callbackUrl : undefined,
          metadata: { userId: caller.uid, market, orderNumber },
        }),
      });
      const payload = await response.json() as { status?: boolean; message?: string; data?: { authorization_url?: string; access_code?: string; reference?: string } };
      if (!response.ok || !payload.status || !payload.data?.authorization_url) {
        return res.status(502).json({ error: payload.message || 'Paystack initialization failed.' });
      }
      return res.status(200).json({ configured: true, gateway, authorizationUrl: payload.data.authorization_url, accessCode: payload.data.access_code, reference: payload.data.reference });
    }

    if (gateway === 'stripe') {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) return res.status(503).json({ configured: false, gateway, message: 'STRIPE_SECRET_KEY is not configured.' });
      const appUrl = typeof callbackUrl === 'string' && callbackUrl.startsWith('http') ? callbackUrl : process.env.APP_URL || 'http://localhost:3000';
      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('customer_email', caller.email);
      params.append('client_reference_id', reference);
      params.append('success_url', `${appUrl}?payment_ref=${encodeURIComponent(reference)}&gateway=stripe&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${appUrl}?payment_cancelled=1`);
      params.append('line_items[0][price_data][currency]', currency.toLowerCase());
      params.append('line_items[0][price_data][product_data][name]', `Samsara Choice Ltd (${orderNumber || reference})`);
      params.append('line_items[0][price_data][unit_amount]', String(Math.round(amount * 100)));
      params.append('line_items[0][quantity]', '1');
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const payload = await response.json() as { id?: string; url?: string; error?: { message?: string } };
      if (!response.ok || !payload.url) return res.status(502).json({ error: payload.error?.message || 'Stripe checkout initialization failed.' });
      return res.status(200).json({ configured: true, gateway, sessionId: payload.id, authorizationUrl: payload.url, reference });
    }

    if (gateway === 'flutterwave') {
      const secret = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secret) return res.status(503).json({ configured: false, gateway, message: 'FLUTTERWAVE_SECRET_KEY is not configured.' });
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_ref: reference,
          amount: Math.round(amount * 100) / 100,
          currency,
          redirect_url: typeof callbackUrl === 'string' && callbackUrl.startsWith('http') ? callbackUrl : process.env.APP_URL || 'http://localhost:3000',
          customer: { email: caller.email, name: caller.displayName || caller.email },
          customizations: { title: 'Samsara Choice Ltd', description: `Order ${orderNumber || reference}` },
        }),
      });
      const payload = await response.json() as { status?: string; message?: string; data?: { link?: string } };
      if (!response.ok || payload.status !== 'success' || !payload.data?.link) return res.status(502).json({ error: payload.message || 'Flutterwave initialization failed.' });
      return res.status(200).json({ configured: true, gateway, authorizationUrl: payload.data.link, reference });
    }

    return res.status(400).json({ error: 'Unsupported payment gateway.' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Payment initialization error.' });
  }
}
