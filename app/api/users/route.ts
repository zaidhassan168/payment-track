// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import {auth} from '@clerk/nextjs/server';
// const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function GET() {
  try {
    const user = await auth();
    console.log('user', user);
    const users = await clerkClient.users.getUserList({ limit: 10 });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      role: user.publicMetadata?.role || null,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, role } = await req.json();

    if (!userId || !['manager', 'engineer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
