import { NextRequest, NextResponse } from 'next/server';
import { auth, getDb } from '@/lib/firebase-admin';

// GET: Retrieve a user's role
export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify the user exists in Firebase Auth
    try {
      await auth.getUser(uid);
    } catch (error) {
      return NextResponse.json(
        { error: 'User not found in authentication system' },
        { status: 404 }
      );
    }

    // Get user data from Firestore
    const db = getDb();

    try {
      const userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        // If no document exists in Firestore yet, create one with default role
        const defaultUserData = {
          uid,
          role: 'user',
          createdAt: new Date().toISOString()
        };

        await db.collection('users').doc(uid).set(defaultUserData);

        return NextResponse.json(defaultUserData);
      }

      const userData = userDoc.data();
      console.log('User data retrieved:', userData);
      return NextResponse.json({
        uid,
        role: userData?.role || 'user',
        ...userData
      });
    } catch (error) {
      console.error('Error accessing Firestore:', error);
      return NextResponse.json(
        { error: 'Database error while fetching user data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}

// PATCH: Update a user's role
export async function PATCH(request: NextRequest) {
  try {
    const { uid, role } = await request.json();

    if (!uid || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Verify the user exists in Firebase Auth
    try {
      await auth.getUser(uid);
    } catch (error) {
      return NextResponse.json(
        { error: 'User not found in authentication system' },
        { status: 404 }
      );
    }

    // Update user role in Firestore
    const db = getDb();

    try {
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      // If document doesn't exist, create it with provided role
      if (!userDoc.exists) {
        await userRef.set({
          uid,
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Otherwise just update the role
        await userRef.update({
          role,
          updatedAt: new Date().toISOString()
        });
      }

      return NextResponse.json({
        success: true,
        message: 'User role updated successfully',
        uid,
        role
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
      return NextResponse.json(
        { error: 'Database error while updating user role' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
