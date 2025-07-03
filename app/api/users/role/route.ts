import { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { errorResponse, successResponse, handleFirebaseAuthError } from '@/lib/api-utils';
import { ensureUserDocument, getUserDocument } from '@/lib/user-service-server';

// GET: Retrieve a user's role
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uid = searchParams.get('uid');

  if (!uid) {
    return errorResponse('User ID is required', 400);
  }

  try {
    // Verify the user exists in Firebase Auth
    try {
      await auth.getUser(uid);
    } catch (error: any) {
      return handleFirebaseAuthError(error, uid);
    }

    // Get or create user document with role
    try {
      // Just get the user document without modifying it
      const userData = await getUserDocument(uid);

      // If user document doesn't exist, create a default one
      if (!userData) {
        const defaultUserData = await ensureUserDocument(uid);
        return successResponse({
          ...defaultUserData
        });
      }

      return successResponse({
        ...userData
      });
    } catch (error) {
      return errorResponse('Database error while fetching user data', 500, error);
    }
  } catch (error) {
    return errorResponse('Failed to fetch user role', 500, error);
  }
}

// PATCH: Update a user's role
export async function PATCH(request: NextRequest) {
  try {
    const { uid, role } = await request.json();

    console.log(`PATCH /api/users/role received:`, { uid, role });

    if (!uid || !role) {
      return errorResponse('User ID and role are required', 400);
    }

    // Verify the user exists in Firebase Auth
    try {
      await auth.getUser(uid);
    } catch (error: any) {
      return handleFirebaseAuthError(error, uid);
    }

    // Update user role in Firestore
    try {
      console.log(`Calling ensureUserDocument with uid=${uid}, role=${role}`);

      // Update or create user document with the new role
      const userData = await ensureUserDocument(uid, role);

      console.log('User role updated, response userData:', userData);

      return successResponse({
        success: true,
        message: 'User role updated successfully',
        uid,
        role: userData.role
      });
    } catch (error) {
      return errorResponse('Database error while updating user role', 500, error);
    }
  } catch (error) {
    return errorResponse('Failed to update user role', 500, error);
  }
}
