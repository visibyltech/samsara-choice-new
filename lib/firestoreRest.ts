import { createSign } from 'node:crypto';
import firebaseConfig from '../firebase-applet-config.json';

type FirestoreValue = string | number | boolean | null | FirestoreValue[] | { [key: string]: FirestoreValue } | { __timestamp: string };
type FirestoreDocument = {
  name: string;
  fields: Record<string, any>;
  updateTime: string;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured in Vercel.');
  const account = JSON.parse(raw) as { project_id?: string; client_email?: string; private_key?: string; token_uri?: string };
  if (!account.project_id || !account.client_email || !account.private_key) {
    throw new Error('Firebase service-account JSON is missing project_id, client_email or private_key.');
  }
  if (account.project_id !== firebaseConfig.projectId) {
    throw new Error('Firebase service account does not match the website Firebase project.');
  }
  return { ...account, private_key: account.private_key.replace(/\\n/g, '\n') };
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const account = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: account.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(account.private_key, 'base64url')}`;
  const response = await fetch(account.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });
  const payload = await response.json() as { access_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || 'Could not obtain Firebase service-account access token.');
  }
  cachedToken = { value: payload.access_token, expiresAt: Date.now() + (payload.expires_in || 3600) * 1000 };
  return cachedToken.value;
}

const documentsUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${encodeURIComponent(firebaseConfig.firestoreDatabaseId)}/documents`;

function toValue(value: FirestoreValue): any {
  if (value && typeof value === 'object' && !Array.isArray(value) && '__timestamp' in value) {
    return { timestampValue: value.__timestamp };
  }
  if (value === null) return { nullValue: 'NULL_VALUE' };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toValue(item)])) } };
}

function fromValue(value: any): any {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromValue);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, fromValue(item)]));
  return null;
}

export function decodeFields(fields: Record<string, any> = {}): Record<string, any> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromValue(value)]));
}

async function firestoreRequest(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const response = await fetch(`${documentsUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || `Firestore request failed (${response.status}).`);
  return payload;
}

export async function getFirestoreDocument(collection: string, id: string): Promise<FirestoreDocument | null> {
  try {
    return await firestoreRequest(`/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('(404)')) return null;
    throw error;
  }
}

export async function findFirestoreDocument(collection: string, fieldPath: string, value: string): Promise<FirestoreDocument | null> {
  const payload = await firestoreRequest(':runQuery', {
    method: 'POST',
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath },
            op: 'EQUAL',
            value: toValue(value),
          },
        },
        limit: 1,
      },
    }),
  }) as Array<{ document?: FirestoreDocument }>;
  return payload.find((item) => item.document)?.document || null;
}

export async function commitFirestoreUpdates(
  updates: Array<{ document: FirestoreDocument; fields: Record<string, FirestoreValue> }>
): Promise<void> {
  if (!updates.length) return;
  await firestoreRequest(':commit', {
    method: 'POST',
    body: JSON.stringify({
      writes: updates.map(({ document, fields }) => ({
        update: {
          name: document.name,
          fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, toValue(value)])),
        },
        updateMask: { fieldPaths: Object.keys(fields) },
        currentDocument: { updateTime: document.updateTime },
      })),
    }),
  });
}
