import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '8mb' }));

// Load public Firebase Web Config to verify Firebase ID tokens via Google Identity Toolkit REST API
let firebaseApiKey = '';
try {
  const fbConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(fbConfigPath)) {
    const raw = JSON.parse(fs.readFileSync(fbConfigPath, 'utf-8'));
    firebaseApiKey = raw.apiKey || '';
  }
} catch {
  firebaseApiKey = '';
}

interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
}

async function verifyFirebaseBearerToken(authHeader?: string): Promise<VerifiedFirebaseUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ') || !firebaseApiKey) {
    return null;
  }
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 4096) return null;

  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      users?: Array<{
        localId?: string;
        email?: string;
        emailVerified?: boolean;
        displayName?: string;
      }>;
    };
    const user = data.users?.[0];
    if (!user?.localId || !user?.email) return null;
    return {
      uid: user.localId,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
      displayName: user.displayName,
    };
  } catch {
    return null;
  }
}

function isPrimaryAdminEmail(user: VerifiedFirebaseUser | null): boolean {
  return Boolean(user && user.emailVerified && user.email.toLowerCase() === 'usitakatelvin@gmail.com');
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'samsara-choice-ltd' });
});

// Public gateway & service availability status (never returns secret keys)
app.get('/api/config/gateways', (_req, res) => {
  res.json({
    korapayConfigured: Boolean(process.env.KORAPAY_SECRET_KEY),
    paystackConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    flutterwaveConfigured: Boolean(process.env.FLUTTERWAVE_SECRET_KEY),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    cloudinaryConfigured: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
    emailConfigured: Boolean(process.env.RESEND_API_KEY),
  });
});

// Payment gateway initialization (Paystack for NG / Stripe for AU / Flutterwave)
app.post('/api/payments/initialize', async (req, res) => {
  const caller = await verifyFirebaseBearerToken(req.headers.authorization);
  if (!caller || !caller.emailVerified) {
    res.status(401).json({ error: 'Verified sign-in required to initialize payment.' });
    return;
  }

  const { gateway, market, currency, amount, reference, orderNumber, callbackUrl } = req.body || {};
  if (
    typeof gateway !== 'string' ||
    typeof currency !== 'string' ||
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof reference !== 'string' ||
    reference.length < 4
  ) {
    res.status(400).json({ error: 'Invalid payment initialization payload.' });
    return;
  }

  try {
    if (gateway === 'korapay') {
      const secret = process.env.KORAPAY_SECRET_KEY;
      if (!secret) {
        res.json({
          configured: false,
          gateway: 'korapay',
          message: 'KORAPAY_SECRET_KEY is not configured in Vercel environment variables.',
        });
        return;
      }

      const appUrl = typeof callbackUrl === 'string' && callbackUrl.startsWith('https://')
        ? callbackUrl
        : process.env.APP_URL || 'https://samsara-choice-new.vercel.app';
      const redirect = new URL(appUrl);
      redirect.searchParams.set('reference', reference);
      redirect.searchParams.set('gateway', 'korapay');

      const koraResp = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
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
          narration: `Samsara Choice order ${orderNumber || reference}`,
          merchant_bears_cost: false,
          customer: {
            name: caller.displayName || caller.email,
            email: caller.email,
          },
          metadata: { orderNumber: String(orderNumber || reference).slice(0, 20), userId: caller.uid.slice(0, 20) },
        }),
      });
      const koraJson = await koraResp.json() as {
        status?: boolean;
        message?: string;
        data?: { reference?: string; checkout_url?: string };
      };
      if (!koraResp.ok || !koraJson.status || !koraJson.data?.checkout_url) {
        res.status(502).json({ error: koraJson.message || 'Korapay checkout initialization failed.' });
        return;
      }
      res.json({
        configured: true,
        gateway: 'korapay',
        authorizationUrl: koraJson.data.checkout_url,
        reference: koraJson.data.reference || reference,
      });
      return;
    }

    if (gateway === 'paystack') {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (!secret) {
        res.json({
          configured: false,
          gateway: 'paystack',
          message: 'PAYSTACK_SECRET_KEY is not configured in environment secrets. Please use Bank Transfer or configure Paystack secrets.',
        });
        return;
      }

      const initResp = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: caller.email,
          amount: Math.round(amount * 100),
          currency: currency === 'AUD' ? 'AUD' : 'NGN',
          reference,
          callback_url: typeof callbackUrl === 'string' && callbackUrl.startsWith('http') ? callbackUrl : undefined,
          metadata: { userId: caller.uid, market, orderNumber },
        }),
      });
      const initJson = (await initResp.json()) as {
        status?: boolean;
        message?: string;
        data?: { authorization_url?: string; access_code?: string; reference?: string };
      };
      if (!initResp.ok || !initJson.status || !initJson.data?.authorization_url) {
        res.status(502).json({ error: initJson.message || 'Paystack initialization failed.' });
        return;
      }
      res.json({
        configured: true,
        gateway: 'paystack',
        authorizationUrl: initJson.data.authorization_url,
        accessCode: initJson.data.access_code,
        reference: initJson.data.reference,
      });
      return;
    }

    if (gateway === 'stripe') {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) {
        res.json({
          configured: false,
          gateway: 'stripe',
          message: 'STRIPE_SECRET_KEY is not configured in environment secrets. Please use PayID Transfer or configure Stripe secrets.',
        });
        return;
      }

      const appUrl =
        typeof callbackUrl === 'string' && callbackUrl.startsWith('http')
          ? callbackUrl
          : process.env.APP_URL || 'http://localhost:3000';
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

      const stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      const stripeJson = (await stripeResp.json()) as {
        id?: string;
        url?: string;
        error?: { message?: string };
      };
      if (!stripeResp.ok || !stripeJson.url) {
        res.status(502).json({ error: stripeJson.error?.message || 'Stripe checkout initialization failed.' });
        return;
      }
      res.json({
        configured: true,
        gateway: 'stripe',
        sessionId: stripeJson.id,
        authorizationUrl: stripeJson.url,
        reference,
      });
      return;
    }

    if (gateway === 'flutterwave') {
      const secret = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secret) {
        res.json({
          configured: false,
          gateway: 'flutterwave',
          message: 'FLUTTERWAVE_SECRET_KEY is not configured in environment secrets. Please use Bank Transfer or configure Flutterwave secrets.',
        });
        return;
      }

      const flwResp = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: reference,
          amount: Math.round(amount * 100) / 100,
          currency,
          redirect_url: typeof callbackUrl === 'string' && callbackUrl.startsWith('http') ? callbackUrl : process.env.APP_URL || 'http://localhost:3000',
          customer: { email: caller.email, name: caller.displayName || caller.email },
          customizations: { title: 'Samsara Choice Ltd', description: `Order ${orderNumber || reference}` },
        }),
      });
      const flwJson = (await flwResp.json()) as { status?: string; message?: string; data?: { link?: string } };
      if (!flwResp.ok || flwJson.status !== 'success' || !flwJson.data?.link) {
        res.status(502).json({ error: flwJson.message || 'Flutterwave initialization failed.' });
        return;
      }
      res.json({
        configured: true,
        gateway: 'flutterwave',
        authorizationUrl: flwJson.data.link,
        reference,
      });
      return;
    }

    res.status(400).json({ error: 'Unsupported gateway.' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Payment initialization error.' });
  }
});

// Server-side gateway transaction verification
app.post('/api/payments/verify', async (req, res) => {
  const caller = await verifyFirebaseBearerToken(req.headers.authorization);
  if (!caller || !caller.emailVerified) {
    res.status(401).json({ error: 'Verified sign-in required.' });
    return;
  }

  const { gateway, reference, sessionId } = req.body || {};
  if (typeof gateway !== 'string' || typeof reference !== 'string') {
    res.status(400).json({ error: 'Missing gateway or reference.' });
    return;
  }

  try {
    if (gateway === 'korapay') {
      const secret = process.env.KORAPAY_SECRET_KEY;
      if (!secret) {
        res.status(503).json({ verified: false, error: 'Korapay secret key is not configured.' });
        return;
      }
      const resp = await fetch(
        `https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${secret}` } }
      );
      const data = await resp.json() as {
        status?: boolean;
        data?: { reference?: string; status?: string; amount?: string | number; amount_paid?: string | number; currency?: string; transaction_status?: string };
      };
      const expectedAmount = Number(data.data?.amount);
      const paidAmount = Number(data.data?.amount_paid ?? data.data?.amount);
      const isPaid = Boolean(
        resp.ok &&
        data.status &&
        data.data?.status === 'success' &&
        (!data.data?.transaction_status || data.data.transaction_status === 'success') &&
        Number.isFinite(expectedAmount) &&
        Number.isFinite(paidAmount) &&
        expectedAmount > 0 &&
        paidAmount >= expectedAmount
      );
      res.json({
        verified: isPaid,
        gateway: 'korapay',
        reference: data.data?.reference || reference,
        amount: Number.isFinite(paidAmount) ? paidAmount : undefined,
        currency: data.data?.currency,
      });
      return;
    }

    if (gateway === 'paystack') {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (!secret) {
        res.status(503).json({ verified: false, error: 'Paystack secret key not configured.' });
        return;
      }
      const resp = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = (await resp.json()) as { status?: boolean; data?: { status?: string; amount?: number; currency?: string } };
      const isPaid = Boolean(resp.ok && data.status && data.data?.status === 'success');
      res.json({
        verified: isPaid,
        gateway: 'paystack',
        reference,
        amount: data.data?.amount ? data.data.amount / 100 : undefined,
        currency: data.data?.currency,
      });
      return;
    }

    if (gateway === 'stripe') {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret || typeof sessionId !== 'string') {
        res.status(503).json({ verified: false, error: 'Stripe secret key or sessionId missing.' });
        return;
      }
      const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = (await resp.json()) as { payment_status?: string; amount_total?: number; currency?: string };
      const isPaid = Boolean(resp.ok && data.payment_status === 'paid');
      res.json({
        verified: isPaid,
        gateway: 'stripe',
        reference,
        amount: data.amount_total ? data.amount_total / 100 : undefined,
        currency: data.currency?.toUpperCase(),
      });
      return;
    }

    if (gateway === 'flutterwave') {
      const secret = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secret) {
        res.status(503).json({ verified: false, error: 'Flutterwave secret key not configured.' });
        return;
      }
      const resp = await fetch(
        `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${secret}` } }
      );
      const data = (await resp.json()) as { status?: string; data?: { status?: string; amount?: number; currency?: string } };
      const isPaid = Boolean(resp.ok && data.status === 'success' && data.data?.status === 'successful');
      res.json({
        verified: isPaid,
        gateway: 'flutterwave',
        reference,
        amount: data.data?.amount,
        currency: data.data?.currency,
      });
      return;
    }

    res.status(400).json({ verified: false, error: 'Unsupported gateway for verification.' });
  } catch (err) {
    res.status(500).json({ verified: false, error: err instanceof Error ? err.message : 'Verification error.' });
  }
});

// Korapay signed webhook endpoint. Browser return verification remains server-to-server.
app.post('/api/payments/korapay/webhook', (req, res) => {
  const secret = process.env.KORAPAY_SECRET_KEY;
  const signature = req.headers['x-korapay-signature'];
  if (!secret || typeof signature !== 'string' || !req.body?.data) {
    res.status(401).json({ received: false });
    return;
  }
  const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body.data)).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');
  const valid = expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  if (!valid) {
    res.status(401).json({ received: false });
    return;
  }
  res.status(200).json({ received: true });
});

// Cloudinary image upload (Admin only)
app.post('/api/cloudinary/upload', async (req, res) => {
  const caller = await verifyFirebaseBearerToken(req.headers.authorization);
  if (!isPrimaryAdminEmail(caller)) {
    res.status(403).json({ error: 'Admin authorization required for product image uploads.' });
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    res.status(503).json({
      configured: false,
      error: 'Cloudinary secrets (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not set in environment secrets.',
    });
    return;
  }

  const { imageDataUrl, folder } = req.body || {};
  if (typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
    res.status(400).json({ error: 'Valid base64 image data URL required.' });
    return;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const targetFolder = typeof folder === 'string' && /^[a-zA-Z0-9_\-/]+$/.test(folder) ? folder : 'samsara-choice/products';
    const signaturePayload = `folder=${targetFolder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

    const form = new URLSearchParams();
    form.append('file', imageDataUrl);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('folder', targetFolder);
    form.append('signature', signature);

    const uploadResp = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const uploadJson = (await uploadResp.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };
    if (!uploadResp.ok || !uploadJson.secure_url) {
      res.status(502).json({ error: uploadJson.error?.message || 'Cloudinary upload failed.' });
      return;
    }

    res.json({
      configured: true,
      url: uploadJson.secure_url,
      publicId: uploadJson.public_id,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Cloudinary upload error.' });
  }
});

// Automated payment / subscription renewal reminder dispatch
app.post('/api/reminders/send', async (req, res) => {
  const caller = await verifyFirebaseBearerToken(req.headers.authorization);
  if (!caller || !caller.emailVerified) {
    res.status(401).json({ error: 'Verified sign-in required.' });
    return;
  }

  const { toEmail, subject, body } = req.body || {};
  const recipient = isPrimaryAdminEmail(caller) && typeof toEmail === 'string' ? toEmail : caller.email;
  if (typeof subject !== 'string' || typeof body !== 'string' || !subject.trim() || !body.trim()) {
    res.status(400).json({ error: 'Subject and message body are required.' });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    res.json({
      sent: false,
      configured: false,
      message: 'RESEND_API_KEY is not configured in environment secrets. Reminder saved in customer account notifications.',
    });
    return;
  }

  try {
    const emailFrom = process.env.EMAIL_FROM || 'Samsara Choice Ltd <orders@samsarachoice.com>';
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [recipient],
        subject: subject.slice(0, 160),
        text: body.slice(0, 2000),
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      res.status(502).json({ sent: false, error: errText });
      return;
    }
    res.json({ sent: true, configured: true, provider: 'resend', recipient });
  } catch (err) {
    res.status(500).json({ sent: false, error: err instanceof Error ? err.message : 'Email dispatch error.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Samsara Choice Ltd server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
