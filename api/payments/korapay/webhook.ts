import { createHmac, timingSafeEqual } from 'node:crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ received: false });
  }
  const secret = process.env.KORAPAY_SECRET_KEY;
  const signature = req.headers['x-korapay-signature'];
  if (!secret || typeof signature !== 'string' || !req.body?.data) {
    return res.status(401).json({ received: false });
  }
  const expected = createHmac('sha256', secret).update(JSON.stringify(req.body.data)).digest('hex');
  const expectedBytes = Buffer.from(expected, 'hex');
  const receivedBytes = Buffer.from(signature, 'hex');
  const valid = expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
  if (!valid) return res.status(401).json({ received: false });
  return res.status(200).json({ received: true });
}
