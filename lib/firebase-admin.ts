import admin from 'firebase-admin';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    // Validate environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase environment variables:');
      console.error('FIREBASE_PROJECT_ID:', projectId ? '✓' : '✗');
      console.error('FIREBASE_CLIENT_EMAIL:', clientEmail ? '✓' : '✗');
      console.error('FIREBASE_PRIVATE_KEY:', privateKey ? '✓' : '✗');
      throw new Error('Missing Firebase environment variables. Please check your .env.local file and ensure all required variables are set.');
    }

    // Validate private key format
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
      throw new Error('FIREBASE_PRIVATE_KEY appears to be malformed. It should include the full private key with BEGIN and END markers.');
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
    // Don't throw the error here to prevent the app from crashing
    // Instead, we'll handle this in the API routes
  }
}

// Export functions that check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return admin.apps.length > 0;
};

export const getAuth = () => {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase Admin is not properly initialized. Please check your environment variables.');
  }
  return admin.auth();
};

export const getDb = () => {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase Admin is not properly initialized. Please check your environment variables.');
  }
  return admin.firestore();
};

// Keep the old exports for backward compatibility, but add safety checks
export const auth = {
  listUsers: (maxResults?: number) => {
    if (!isFirebaseInitialized()) {
      return Promise.reject(new Error('Firebase Admin is not properly initialized. Please check your environment variables.'));
    }
    return admin.auth().listUsers(maxResults);
  },
  getUser: (uid: string) => {
    if (!isFirebaseInitialized()) {
      return Promise.reject(new Error('Firebase Admin is not properly initialized. Please check your environment variables.'));
    }
    return admin.auth().getUser(uid);
  },
  createUser: (data: any) => {
    if (!isFirebaseInitialized()) {
      return Promise.reject(new Error('Firebase Admin is not properly initialized. Please check your environment variables.'));
    }
    return admin.auth().createUser(data);
  },
  updateUser: (uid: string, data: any) => {
    if (!isFirebaseInitialized()) {
      return Promise.reject(new Error('Firebase Admin is not properly initialized. Please check your environment variables.'));
    }
    return admin.auth().updateUser(uid, data);
  },
  deleteUser: (uid: string) => {
    if (!isFirebaseInitialized()) {
      return Promise.reject(new Error('Firebase Admin is not properly initialized. Please check your environment variables.'));
    }
    return admin.auth().deleteUser(uid);
  }
};

export const db = {
  collection: (name: string) => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase Admin is not properly initialized. Please check your environment variables.');
    }
    return admin.firestore().collection(name);
  }
};

export default admin;
