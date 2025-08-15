import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin'; // Use admin SDK for production database

// GET: Retrieve projects from the production database (production-959fd)
export async function GET() {
    try {
        const db = getDb();
        const snapshot = await db.collection('projects').get();

        const projects = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects from production database:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
