import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { ProcurementRequest, ProcurementStats } from '@/types/procurement';

// GET: Retrieve procurement requests with filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const projectId = searchParams.get('projectId');
        const createdBy = searchParams.get('createdBy');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');
        const lastDocId = searchParams.get('lastDocId');

        const db = getDb();

        // For now, fetch all requests and filter client-side to avoid index issues
        let procurementQuery: any = db.collection('procurementRequests')
            .orderBy('createdAt', 'desc')
            .limit(100); // Reasonable limit to avoid fetching too much data

        // Pagination
        if (lastDocId) {
            const lastDoc = await db.collection('procurementRequests').doc(lastDocId).get();
            if (lastDoc.exists) {
                procurementQuery = procurementQuery.startAfter(lastDoc);
            }
        }

        procurementQuery = procurementQuery.limit(pageSize);

        const snapshot = await procurementQuery.get();
        let requests: ProcurementRequest[] = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            managerNotes: doc.data().managerNotes?.map((note: any) => ({
                ...note,
                createdAt: note.createdAt?.toDate() || new Date(),
            })) || [],
            statusHistory: doc.data().statusHistory?.map((entry: any) => ({
                ...entry,
                changedAt: entry.changedAt?.toDate() || new Date(),
            })) || [],
        })) as ProcurementRequest[];

        // Apply client-side filtering if Firestore filters failed
        if (status && status !== 'all') {
            requests = requests.filter(req => req.status === status);
        }
        if (projectId) {
            requests = requests.filter(req => req.projectId === projectId);
        }
        if (createdBy) {
            requests = requests.filter(req => req.createdBy === createdBy);
        }

        // Apply pagination on filtered results
        const startIndex = lastDocId ? requests.findIndex(req => req.id === lastDocId) + 1 : 0;
        const paginatedRequests = requests.slice(startIndex, startIndex + pageSize);
        const hasMore = startIndex + pageSize < requests.length;
        const lastDocIdResponse = paginatedRequests.length > 0 ? paginatedRequests[paginatedRequests.length - 1].id : null;

        return NextResponse.json({
            requests: paginatedRequests,
            hasMore,
            lastDocId: lastDocIdResponse,
        });
    } catch (error) {
        console.error('Error fetching procurement requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch procurement requests' },
            { status: 500 }
        );
    }
}

// POST: Create a new procurement request
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            materialName,
            quantity,
            projectId,
            projectName,
            createdBy,
            createdByName,
            imageUrl,
        } = body;

        if (!materialName || !quantity || !projectId || !createdBy) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = getDb();
        const now = new Date();

        const procurementData = {
            materialName,
            quantity,
            projectId,
            projectName: projectName || '',
            imageUrl: imageUrl || '',
            status: 'pending',
            createdBy,
            createdByName: createdByName || '',
            createdAt: now,
            updatedAt: now,
            managerNotes: [],
            statusHistory: [
                {
                    status: 'pending',
                    changedBy: createdBy,
                    changedByName: createdByName || '',
                    changedAt: now,
                },
            ],
        };

        const docRef = await db.collection('procurementRequests').add(procurementData);

        return NextResponse.json({
            id: docRef.id,
            ...procurementData,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating procurement request:', error);
        return NextResponse.json(
            { error: 'Failed to create procurement request' },
            { status: 500 }
        );
    }
}
