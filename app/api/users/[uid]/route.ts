// app/api/users/[uid]/route.ts
import { auth } from '@/lib/firebase-admin';
import { UpdateUserData } from '@/types/user';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { uid: string } }) {
  try {
    console.log(`Fetching user with UID: ${params.uid}`);
    const user = await auth.getUser(params.uid);
    return NextResponse.json(user);
  } catch (error: any) {
    console.error(`Failed to fetch user ${params.uid}:`, error);
    // Firebase admin throws error with code 'auth/user-not-found'
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: `Failed to fetch user` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const userData: UpdateUserData = await req.json();
    const updatedUser = await auth.updateUser(params.uid, userData);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Failed to update user ${params.uid}:`, error);
    return NextResponse.json({ error: `Failed to update user` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { uid: string } }) {
  try {
    await auth.deleteUser(params.uid);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete user ${params.uid}:`, error);
    return NextResponse.json({ error: `Failed to delete user` }, { status: 500 });
  }
}
