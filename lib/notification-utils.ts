import { sendPushNotifications } from '@/lib/notification-service';
import { getRecipientsForStatus } from '@/lib/user-service';
import { ProcurementRequestStatus } from '@/types/notifications';

/**
 * Trigger notifications for procurement request status changes
 */
export async function triggerProcurementNotification(
    requestId: string,
    status: ProcurementRequestStatus,
    projectName: string,
    materialName: string,
    createdByUid: string
): Promise<void> {
    try {
        console.log(`Triggering notification for request ${requestId} with status ${status}`);

        // Get recipients based on status
        const recipients = await getRecipientsForStatus(status, createdByUid);

        if (recipients.length === 0) {
            console.warn(`No recipients found for status: ${status}`);
            return;
        }

        // Send push notifications
        await sendPushNotifications(
            recipients,
            status,
            projectName,
            materialName,
            requestId
        );

        console.log(`Successfully sent notifications for request ${requestId}`);
    } catch (error) {
        console.error(`Error sending notifications for request ${requestId}:`, error);
        // Don't throw error to avoid breaking the main request flow
    }
}

/**
 * Helper function to call the notification API internally
 */
export async function callNotificationAPI(
    requestId: string,
    status: ProcurementRequestStatus,
    projectName: string,
    materialName: string,
    createdByUid: string
): Promise<void> {
    try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                request_id: requestId,
                status,
                project_name: projectName,
                material_name: materialName,
                created_by_uid: createdByUid,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Notification API error:', errorData);
        } else {
            const result = await response.json();
            console.log('Notification sent successfully:', result);
        }
    } catch (error) {
        console.error('Error calling notification API:', error);
    }
}
