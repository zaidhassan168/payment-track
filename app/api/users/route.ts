// app/api/users/route.ts
import { auth } from '@/lib/firebase-admin';
import { CreateUserData, FirebaseUser } from '@/types/user';
import { NextRequest } from 'next/server';
import { errorResponse, successResponse, handleFirebaseAuthError } from '@/lib/api-utils';

export async function GET() {
  try {
    const userRecords = await auth.listUsers();
    const users: FirebaseUser[] = userRecords.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    }));
    return successResponse(users);
  } catch (error: any) {
    return errorResponse('Failed to fetch users', 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userData: CreateUserData = await req.json();
    const newUser = await auth.createUser(userData);
    return successResponse(newUser);
  } catch (error: any) {
    return handleFirebaseAuthError(error);
  }
}
