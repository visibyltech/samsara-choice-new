import { createHash } from 'node:crypto';
import { verifyFirebaseBearerToken } from '../../lib/firebaseAuth';

const ADMIN_EMAIL = 'usitakatelvin@gmail.com';

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

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(503).json({ configured: false, error: 'Cloudinary credentials are missing from Vercel environment variables.' });
  }

  const urls = req.body?.urls;
  if (!Array.isArray(urls) || urls.length < 1 || urls.length > 4 ||
      urls.some((url: unknown) => typeof url !== 'string' || url.length > 1200 || (() => {
        try { const parsed = new URL(url); return parsed.protocol !== 'https:' || parsed.hostname !== 'cdn.shopify.com'; }
        catch { return true; }
      })())) {
    return res.status(400).json({ error: 'Send 1–4 valid HTTPS Supermart Shopify product-image URLs.' });
  }

  const results: Array<{ sourceUrl: string; url: string; publicId: string }> = [];
  const errors: Array<{ sourceUrl: string; error: string }> = [];
  for (const sourceUrl of [...new Set(urls as string[])]) {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const folder = 'samsara-choice/products';
    const publicId = `supermart_${createHash('sha256').update(sourceUrl).digest('hex').slice(0, 24)}`;
    const params = { folder, public_id: publicId, timestamp };
    const form = new URLSearchParams({
      ...params,
      api_key: apiKey,
      signature: signParams(params, apiSecret),
      file: sourceUrl,
      overwrite: 'false',
    });
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const data = await response.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
      if (!response.ok || !data.secure_url) {
        // A deterministic public ID makes retries safe; if already uploaded, retrieve the asset.
        if (response.status === 409) {
          const lookup = await fetch(`https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/${folder}/${publicId}`);
          if (lookup.ok) {
            results.push({ sourceUrl, url: lookup.url, publicId });
            continue;
          }
        }
        errors.push({ sourceUrl, error: data.error?.message || 'Cloudinary upload failed.' });
        continue;
      }
      results.push({ sourceUrl, url: data.secure_url, publicId: data.public_id || publicId });
    } catch {
      errors.push({ sourceUrl, error: 'Cloudinary request failed.' });
    }
  }

  return res.status(errors.length && !results.length ? 502 : 200).json({ configured: true, results, errors });
}
