/**
 * Server-side user service utility functions
 */

import { auth, getDb } from '@/lib/firebase-admin';
import { FirebaseUser } from '@/types/user';

// Common structure for default user document
export interface DefaultUserData {
  uid: string;
  role: string;
  email?: string;
  displayName?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create a default user document in Firestore if it doesn't exist
 * or update the role if it's provided and different from the existing one
 * @param uid User ID
 * @param role Default role (defaults to 'user')
 * @param email User's email
 * @param displayName User's display name
 * @returns The user data object
 */
export async function ensureUserDocument(
  uid: string,
  role: string = 'user',
  email?: string,
  displayName?: string
): Promise<DefaultUserData> {
  const db = getDb();
  const userRef = db.collection('users').doc(uid);

  console.log(`ensureUserDocument called with uid=${uid}, role=${role}, email=${email}, displayName=${displayName}`);

  const userDoc = await userRef.get();
  const timestamp = new Date().toISOString();

  if (!userDoc.exists) {
    // Create default user document if it doesn't exist
    const defaultUserData: DefaultUserData = {
      uid,
      role,
      email,
      displayName,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await userRef.set(defaultUserData);
    return defaultUserData;
  }

  // If a document exists, update it with new data if provided
  const userData = userDoc.data() as DefaultUserData;
  const updateData: any = {
    updatedAt: timestamp
  };

  if (role && role !== userData.role) {
    updateData.role = role;
  }
  if (email && email !== userData.email) {
    updateData.email = email;
  }
  if (displayName && displayName !== userData.displayName) {
    updateData.displayName = displayName;
  }

  if (Object.keys(updateData).length > 1) {
    console.log(`Updating user document for ${uid}:`, updateData);
    await userRef.update(updateData);
    return { ...userData, ...updateData };
  }

  return userData;
}

/**
 * Just get the user document from Firestore without modifying it
 * @param uid User ID
 * @returns The user data object or null if it doesn't exist
 */
export async function getUserDocument(uid: string): Promise<DefaultUserData | null> {
  const db = getDb();
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data() as DefaultUserData;
}

/**
 * Get complete user data from both Auth and Firestore
 * @param uid User ID
 * @returns Combined user data or null if user doesn't exist
 */
export async function getCompleteUserData(uid: string): Promise<FirebaseUser | null> {
  try {
    // Get user from Firebase Auth
    const userRecord = await auth.getUser(uid);

    // Get additional user data from Firestore
    let firestoreData: any = {};
    try {
      // Don't pass a role parameter here, just get the existing document without modifying it
      firestoreData = await getUserDocument(uid);
      if (!firestoreData) {
        // Only create a default document if it doesn't exist
        firestoreData = await ensureUserDocument(uid);
      }
    } catch (error) {
      console.error('Error accessing Firestore for user data:', error);
      // Continue with just Auth data if Firestore fails
    }

    // Combine both data sources
    const user: FirebaseUser = {
      uid: userRecord.uid,
      email: userRecord.email || undefined,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName || undefined,
      phoneNumber: userRecord.phoneNumber || undefined,
      photoURL: userRecord.photoURL || undefined,
      disabled: userRecord.disabled,
      role: firestoreData?.role || 'user',
      metadata: {
        creationTime: userRecord.metadata?.creationTime,
        lastSignInTime: userRecord.metadata?.lastSignInTime
      }
    };

    return user;
  } catch (error) {
    if ((error as any).code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}
