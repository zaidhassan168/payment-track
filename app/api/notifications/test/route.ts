import { NextRequest, NextResponse } from 'next/server';
import { getUsersByRole, getUserByUid, getRecipientsForStatus } from '@/lib/user-service';
import { sendPushNotifications } from '@/lib/notification-service';
import { ApiResponse } from '@/types/notifications';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        switch (action) {
            case 'users':
                const role = searchParams.get('role');
                if (!role) {
                    return NextResponse.json({
                        success: false,
                        error: 'Role parameter is required',
                    } as ApiResponse, { status: 400 });
                }

                const users = await getUsersByRole(role);
                return NextResponse.json({
                    success: true,
                    message: `Found ${users.length} users with role: ${role}`,
                    data: users,
                } as ApiResponse);

            case 'user':
                const uid = searchParams.get('uid');
                if (!uid) {
                    return NextResponse.json({
                        success: false,
                        error: 'UID parameter is required',
                    } as ApiResponse, { status: 400 });
                }

                const user = await getUserByUid(uid);
                return NextResponse.json({
                    success: true,
                    message: user ? 'User found' : 'User not found',
                    data: user,
                } as ApiResponse);

            case 'recipients':
                const status = searchParams.get('status');
                const createdBy = searchParams.get('createdBy');

                if (!status || !createdBy) {
                    return NextResponse.json({
                        success: false,
                        error: 'Status and createdBy parameters are required',
                    } as ApiResponse, { status: 400 });
                }

                const recipients = await getRecipientsForStatus(status, createdBy);
                return NextResponse.json({
                    success: true,
                    message: `Found ${recipients.length} recipients for status: ${status}`,
                    data: recipients,
                } as ApiResponse);

            default:
                return NextResponse.json({
                    success: true,
                    message: 'Notification test endpoints',
                    data: {
                        endpoints: [
                            'GET /api/notifications/test?action=users&role=manager',
                            'GET /api/notifications/test?action=user&uid=USER_ID',
                            'GET /api/notifications/test?action=recipients&status=pending&createdBy=USER_ID',
                            'POST /api/notifications/test - Send test notification',
                        ],
                    },
                } as ApiResponse);
        }
    } catch (error) {
        console.error('Error in notification test:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        } as ApiResponse, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            testType = 'simple',
            status = 'pending',
            project_name = 'Test Project',
            material_name = 'Test Material',
            created_by_uid,
            request_id = 'test-request-123'
        } = body;

        if (!created_by_uid) {
            return NextResponse.json({
                success: false,
                error: 'created_by_uid is required for testing',
            } as ApiResponse, { status: 400 });
        }

        // Get recipients for the test
        const recipients = await getRecipientsForStatus(status, created_by_uid);

        if (recipients.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No recipients found for test notification',
                data: { recipients: [], sentCount: 0, errorCount: 0 },
            } as ApiResponse);
        }

        // Send test notification
        const result = await sendPushNotifications(
            recipients,
            status,
            project_name,
            material_name,
            request_id
        );

        return NextResponse.json({
            success: true,
            message: 'Test notification sent',
            data: {
                recipients: recipients.map(r => ({ uid: r.uid, email: r.email, role: r.role })),
                ...result,
            },
        } as ApiResponse);

    } catch (error) {
        console.error('Error sending test notification:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        } as ApiResponse, { status: 500 });
    }
}
