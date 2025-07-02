import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Validate environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase environment variables. Check your .env file.');
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Handle the private key formatting - ensure newlines are properly converted
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

/**
 * Check if Firebase Admin is properly initialized
 */
export function isFirebaseInitialized() {
  return admin.apps.length > 0;
}

/**
 * Get Firebase Auth instance with initialization check
 */
export function getAuth() {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase Admin is not properly initialized. Check your environment variables.');
  }
  return admin.auth();
}

/**
 * Get Firebase Firestore instance with initialization check
 */
export function getDb() {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase Admin is not properly initialized. Check your environment variables.');
  }
  return admin.firestore();
}

/**
 * Firebase Auth methods with error handling
 */
export const auth = {
  listUsers: async (maxResults?: number) => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase Admin is not properly initialized');
    }
    return admin.auth().listUsers(maxResults);
  },

  getUser: async (uid: string) => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase Admin is not properly initialized');
    }
    return admin.auth().getUser(uid);
  },

  createUser: async (data: any) => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase Admin is not properly initialized');
    }
    return admin.auth().createUser(data);
  },

  updateUser: async (uid: string, data: any) => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase Admin is not properly initialized');
    }
    return admin.auth().updateUser(uid, data);
  },

  deleteUser: async (uid: string) => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase Admin is not properly initialized');
    }
    return admin.auth().deleteUser(uid);
  }
};

export default admin;
