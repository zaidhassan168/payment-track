import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

// GET: Retrieve procurement statistics
export async function GET() {
    try {
        const db = getDb();
        const snapshot = await db.collection('procurementRequests').get();

        const stats = {
            total: snapshot.size,
            pending: 0,
            quantity_checked: 0,
            approved: 0,
            rejected: 0,
            ordered: 0,
            arrived: 0,
            processing: 0,
            shipped: 0,
        };

        snapshot.docs.forEach((doc: any) => {
            const status = doc.data().status;
            if (stats.hasOwnProperty(status)) {
                (stats as any)[status]++;
            }
        });

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching procurement stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch procurement statistics' },
            { status: 500 }
        );
    }
}
