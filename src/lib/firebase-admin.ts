import 'server-only';

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

type ServiceAccountShape = {
  project_id?: string;
  projectId?: string;
  client_email?: string;
  clientEmail?: string;
  private_key?: string;
  privateKey?: string;
};

let adminApp: App | null = null;

function readServiceAccount(): { projectId: string; clientEmail: string; privateKey: string } {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (encoded) {
    const parsed = JSON.parse(encoded) as ServiceAccountShape;
    const projectId = parsed.project_id || parsed.projectId;
    const clientEmail = parsed.client_email || parsed.clientEmail;
    const privateKey = parsed.private_key || parsed.privateKey;
    if (projectId && clientEmail && privateKey) {
      return { projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') };
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials are not configured');
  }

  return { projectId, clientEmail, privateKey };
}

function getAdminApp() {
  if (adminApp) return adminApp;
  const existing = getApps()[0];
  if (existing) {
    adminApp = existing;
    return adminApp;
  }

  const serviceAccount = readServiceAccount();
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
  return adminApp;
}

export async function verifyFirebaseIdToken(token: string): Promise<DecodedIdToken> {
  return getAuth(getAdminApp()).verifyIdToken(token, true);
}

export function isFirebaseAdminConfigured() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return true;
  return Boolean(
    (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}
