import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { triggerProcurementNotification } from '@/lib/notification-utils';
import { ProcurementRequestStatus } from '@/types/notifications';

// GET: Retrieve a single procurement request by ID
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const db = getDb();

        const doc = await db.collection('procurementRequests').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: 'Procurement request not found' },
                { status: 404 }
            );
        }

        const data = doc.data()!;
        const procurementRequest = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            managerNotes: data.managerNotes?.map((note: any) => ({
                ...note,
                createdAt: note.createdAt?.toDate() || new Date(),
            })) || [],
            statusHistory: data.statusHistory?.map((entry: any) => ({
                ...entry,
                changedAt: entry.changedAt?.toDate() || new Date(),
            })) || [],
        };

        return NextResponse.json(procurementRequest);
    } catch (error) {
        console.error('Error fetching procurement request:', error);
        return NextResponse.json(
            { error: 'Failed to fetch procurement request' },
            { status: 500 }
        );
    }
}

// PATCH: Update procurement request status
export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { status, changedBy, changedByName, managerNote } = body;

        if (!status || !changedBy) {
            return NextResponse.json(
                { error: 'Status and changedBy are required' },
                { status: 400 }
            );
        }

        const db = getDb();
        const docRef = db.collection('procurementRequests').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: 'Procurement request not found' },
                { status: 404 }
            );
        }

        const now = new Date();
        const updateData: any = {
            status,
            updatedAt: now,
        };

        // Add status history entry
        const statusHistoryEntry = {
            status,
            changedBy,
            changedByName: changedByName || '',
            changedAt: now,
        };

        const currentData = doc.data()!;
        const currentStatusHistory = currentData.statusHistory || [];
        updateData.statusHistory = [...currentStatusHistory, statusHistoryEntry];

        // Add manager note if provided
        if (managerNote) {
            const noteEntry = {
                id: `note_${Date.now()}`,
                note: managerNote,
                createdBy: changedBy,
                createdByName: changedByName || '',
                createdAt: now,
            };

            const currentNotes = currentData.managerNotes || [];
            updateData.managerNotes = [...currentNotes, noteEntry];
        }

        await docRef.update(updateData);

        // Trigger notification for status change
        try {
            await triggerProcurementNotification(
                id,
                status as ProcurementRequestStatus,
                currentData.projectName || 'Unknown Project',
                currentData.materialName || 'Unknown Material',
                currentData.createdBy || ''
            );
        } catch (notificationError) {
            console.error('Failed to send notification:', notificationError);
            // Don't fail the main request if notification fails
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating procurement request:', error);
        return NextResponse.json(
            { error: 'Failed to update procurement request' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a procurement request
export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const db = getDb();

        const doc = await db.collection('procurementRequests').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: 'Procurement request not found' },
                { status: 404 }
            );
        }

        await db.collection('procurementRequests').doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting procurement request:', error);
        return NextResponse.json(
            { error: 'Failed to delete procurement request' },
            { status: 500 }
        );
    }
}
