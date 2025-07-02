// app/api/users/route.ts
import { auth } from '@/lib/firebase-admin';
import { CreateUserData, FirebaseUser } from '@/types/user';
import { NextRequest, NextResponse } from 'next/server';

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
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userData: CreateUserData = await req.json();
    const newUser = await auth.createUser(userData);
    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
