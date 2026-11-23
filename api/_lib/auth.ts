import fs from 'node:fs';
import path from 'node:path';

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
}

function getFirebaseApiKey(): string {
  if (process.env.FIREBASE_API_KEY) return process.env.FIREBASE_API_KEY;
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as { apiKey?: string };
      return config.apiKey || '';
    }
  } catch {
    return '';
  }
  return '';
}

export async function verifyFirebaseBearerToken(authHeader?: string): Promise<VerifiedFirebaseUser | null> {
  const apiKey = getFirebaseApiKey();
  if (!authHeader?.startsWith('Bearer ') || !apiKey) return null;
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 4096) return null;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!response.ok) return null;
    const payload = await response.json() as {
      users?: Array<{ localId?: string; email?: string; emailVerified?: boolean; displayName?: string }>;
    };
    const user = payload.users?.[0];
    if (!user?.localId || !user.email) return null;
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
