// app/api/users/[uid]/route.ts
import { auth } from '@/lib/firebase-admin';
import { UpdateUserData } from '@/types/user';
// ...existing code...
import { errorResponse, handleFirebaseAuthError, successResponse } from '@/lib/api-utils';
import { getCompleteUserData } from '@/lib/user-service-server';

export async function GET(
  req: Request,
  context: { params: Promise<{ uid: string }> }
) {
  const { uid } = await context.params;
  try {
    const user = await getCompleteUserData(uid);
    if (!user) {
      return errorResponse('User not found', 404);
    }
    return successResponse(user);
  } catch (error: any) {
    return handleFirebaseAuthError(error, uid);
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ uid: string }> }
) {
  const { uid } = await context.params;
  try {
    const userData: UpdateUserData = await req.json();
    const updatedUser = await auth.updateUser(uid, userData);
    return successResponse(updatedUser);
  } catch (error: any) {
    return handleFirebaseAuthError(error, uid);
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ uid: string }> }
) {
  const { uid } = await context.params;
  try {
    await auth.deleteUser(uid);
    return successResponse({ message: 'User deleted successfully' });
  } catch (error: any) {
    return handleFirebaseAuthError(error, uid);
  }
}
