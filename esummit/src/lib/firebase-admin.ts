import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    return null;
  }

  const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8')) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };

  if (!credentials.project_id || !credentials.client_email || !credentials.private_key) {
    return null;
  }

  return {
    projectId: credentials.project_id,
    clientEmail: credentials.client_email,
    privateKey: credentials.private_key
  };
}

if (!admin.apps.length) {
  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
