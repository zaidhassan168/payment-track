import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotifications } from '@/lib/notification-service';
import { getRecipientsForStatus } from '@/lib/user-service';
import { ApiResponse, ProcurementRequestStatus } from '@/types/notifications';

interface NotificationRequestSnakeCase {
    status: ProcurementRequestStatus;
    project_name: string;
    material_name: string;
    created_by_uid: string;
    request_id: string;
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[${requestId}] Notification API - Request started`, {
        timestamp: new Date().toISOString(),
        method: 'POST',
        url: request.url,
        userAgent: request.headers.get('user-agent'),
    });

    try {
        const body = await request.json();
        
        console.log(`[${requestId}] Notification API - Request body received`, {
            bodyKeys: Object.keys(body),
            bodySize: JSON.stringify(body).length,
        });

        // Validate the notification request
        const validationError = validateNotificationRequest(body);
        if (validationError) {
            console.error(`[${requestId}] Notification API - Validation failed`, {
                error: validationError,
                body,
                duration: Date.now() - startTime,
            });
            return NextResponse.json({
                success: false,
                message: 'Validation error',
                error: validationError,
            } as ApiResponse, { status: 400 });
        }

        const { status, project_name, material_name, created_by_uid, request_id } = body as NotificationRequestSnakeCase;

        console.log(`[${requestId}] Notification API - Valid request received`, {
            procurementRequestId: request_id,
            status,
            project_name,
            material_name,
            created_by_uid,
            timestamp: new Date().toISOString(),
        });

        // Return immediate success response (async processing)
        const response = NextResponse.json({
            success: true,
            message: 'Notification job enqueued successfully',
            data: {
                request_id,
                status,
                job_id: requestId,
            },
        } as ApiResponse);

        // Process notifications asynchronously (non-blocking)
        console.log(`[${requestId}] Notification API - Enqueueing async processing for ${request_id}`);
        processNotificationAsync(status, project_name, material_name, created_by_uid, request_id, requestId);

        console.log(`[${requestId}] Notification API - Request completed successfully`, {
            duration: Date.now() - startTime,
            response: 'immediate_success',
        });

        return response;

    } catch (error) {
        console.error(`[${requestId}] Notification API - Request failed`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
        });
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: 'Failed to process notification request',
        } as ApiResponse, { status: 500 });
    }
}

/**
 * Process notifications asynchronously (non-blocking)
 */
async function processNotificationAsync(
    status: ProcurementRequestStatus,
    project_name: string,
    material_name: string,
    created_by_uid: string,
    request_id: string,
    jobId: string
): Promise<void> {
    const processingStartTime = Date.now();
    
    console.log(`[${jobId}] Async Processing - Started`, {
        procurementRequestId: request_id,
        status,
        project_name,
        material_name,
        created_by_uid,
        timestamp: new Date().toISOString(),
    });

    try {
        // Get recipients based on status
        console.log(`[${jobId}] Async Processing - Fetching recipients for status: ${status}`);
        const recipients = await getRecipientsForStatus(status, created_by_uid);

        console.log(`[${jobId}] Async Processing - Recipients found`, {
            recipientCount: recipients.length,
            recipients: recipients.map(r => ({
                uid: r.uid,
                email: r.email,
                role: r.role,
                hasExpoPushToken: !!r.expoPushToken,
                expoPushTokenPreview: r.expoPushToken ? `${r.expoPushToken.substring(0, 20)}...` : null,
            })),
        });

        if (recipients.length === 0) {
            console.warn(`[${jobId}] Async Processing - No recipients found`, {
                status,
                created_by_uid,
                duration: Date.now() - processingStartTime,
            });
            return;
        }

        // Send push notifications
        console.log(`[${jobId}] Async Processing - Sending push notifications`, {
            recipientCount: recipients.length,
            status,
            project_name,
            material_name,
        });

        const result = await sendPushNotifications(
            recipients,
            status,
            project_name,
            material_name,
            request_id
        );

        console.log(`[${jobId}] Async Processing - Completed successfully`, {
            procurementRequestId: request_id,
            status,
            sentCount: result.sentCount,
            errorCount: result.errorCount,
            duration: Date.now() - processingStartTime,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error(`[${jobId}] Async Processing - Failed`, {
            procurementRequestId: request_id,
            status,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            duration: Date.now() - processingStartTime,
            timestamp: new Date().toISOString(),
        });
    }
}

/**
 * Health check endpoint
 */
export async function GET() {
    const healthCheckId = `health_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    console.log(`[${healthCheckId}] Health Check - Request received`, {
        timestamp: new Date().toISOString(),
        service: 'payment-track-notifications',
    });
    
    try {
        const healthData = {
            timestamp: new Date().toISOString(),
            service: 'payment-track-notifications',
            status: 'healthy',
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'unknown',
            expoTokenConfigured: !!process.env.EXPO_ACCESS_TOKEN,
        };
        
        console.log(`[${healthCheckId}] Health Check - Service is healthy`, healthData);
        
        return NextResponse.json({
            success: true,
            message: 'Notification service is healthy',
            data: healthData,
        } as ApiResponse);
    } catch (error) {
        console.error(`[${healthCheckId}] Health Check - Service check failed`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        });
        
        return NextResponse.json({
            success: false,
            message: 'Health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        } as ApiResponse, { status: 500 });
    }
}

/**
 * Validate notification request
 */
function validateNotificationRequest(body: any): string | null {
    const { status, project_name, material_name, created_by_uid, request_id } = body;

    // Check required fields
    if (!status) {
        return 'Missing required field: status';
    }
    if (!project_name) {
        return 'Missing required field: project_name';
    }
    if (!material_name) {
        return 'Missing required field: material_name';
    }
    if (!created_by_uid) {
        return 'Missing required field: created_by_uid';
    }
    if (!request_id) {
        return 'Missing required field: request_id';
    }

    // Validate status
    const validStatuses: ProcurementRequestStatus[] = [
        'pending',
        'quantity_checked',
        'approved',
        'rejected',
        'ordered',
        'processing',
        'shipped',
        'arrived',
    ];

    if (!validStatuses.includes(status)) {
        return `Invalid status. Must be one of: ${validStatuses.join(', ')}`;
    }

    // Validate string fields are not empty
    if (typeof project_name !== 'string' || project_name.trim() === '') {
        return 'project_name must be a non-empty string';
    }
    if (typeof material_name !== 'string' || material_name.trim() === '') {
        return 'material_name must be a non-empty string';
    }
    if (typeof created_by_uid !== 'string' || created_by_uid.trim() === '') {
        return 'created_by_uid must be a non-empty string';
    }
    if (typeof request_id !== 'string' || request_id.trim() === '') {
        return 'request_id must be a non-empty string';
    }

    return null; // No validation errors
}
