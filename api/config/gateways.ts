export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json({
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
}
