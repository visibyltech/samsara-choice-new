import { createHash } from 'node:crypto';
import { verifyFirebaseBearerToken } from '../../lib/firebaseAuth';

const ADMIN_EMAIL = 'usitakatelvin@gmail.com';

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

function signParams(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  return createHash('sha1').update(payload + apiSecret).digest('hex');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const caller = await verifyFirebaseBearerToken(req.headers.authorization);
  if (!caller?.emailVerified || caller.email.toLowerCase() !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Primary store-admin authorization required.' });
  }
  const config = cloudinaryConfig();
  if (!config) return res.status(503).json({ configured: false, error: 'Cloudinary credentials are missing from Vercel environment variables.' });

  const { imageDataUrl, folder } = req.body || {};
  if (typeof imageDataUrl !== 'string' || !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(imageDataUrl) || imageDataUrl.length > 12_000_000) {
    return res.status(400).json({ error: 'Provide a valid image (maximum 8 MB).' });
  }
  const timestamp = String(Math.floor(Date.now() / 1000));
  const safeFolder = typeof folder === 'string' && /^samsara-choice\/[a-zA-Z0-9_\-/]+$/.test(folder)
    ? folder
    : 'samsara-choice/products';
  const params = { folder: safeFolder, timestamp };
  const form = new URLSearchParams({ ...params, api_key: config.apiKey, signature: signParams(params, config.apiSecret), file: imageDataUrl });
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = await response.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
    if (!response.ok || !data.secure_url) return res.status(502).json({ error: data.error?.message || 'Cloudinary upload failed.' });
    return res.status(200).json({ configured: true, url: data.secure_url, publicId: data.public_id });
  } catch {
    return res.status(502).json({ error: 'Cloudinary could not be reached. Please retry.' });
  }
}
