import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceiptId } from 'expo-server-sdk';
import { ProcurementRequestStatus, User, PushNotificationPayload } from '@/types/notifications';

// Initialize Expo SDK
const expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN,
    useFcmV1: true,
});

/**
 * Generate notification content based on status and recipients
 */
export function generateNotificationContent(
    status: ProcurementRequestStatus,
    projectName: string,
    materialName: string,
    recipientRole: string
): { title: string; body: string; icon: string } {
    const icon = getIconForStatus(status);

    switch (status) {
        case 'pending':
            if (recipientRole === 'manager') {
                return {
                    title: 'New Procurement Request',
                    body: `A new procurement request for ${materialName} (Project: ${projectName}) has been created and is pending your review.`,
                    icon,
                };
            } else if (recipientRole === 'quantity_surveyor') {
                return {
                    title: 'Quantity Check Required',
                    body: `A new procurement request for ${materialName} (Project: ${projectName}) is pending your quantity check.`,
                    icon,
                };
            }
            break;

        case 'quantity_checked':
            if (recipientRole === 'manager') {
                return {
                    title: 'Ready for Manager Review',
                    body: `Procurement request for ${materialName} (Project: ${projectName}) has been checked by the quantity surveyor and is ready for your action.`,
                    icon,
                };
            } else if (recipientRole === 'engineer') {
                return {
                    title: 'Quantity Check Complete',
                    body: `Your procurement request for ${materialName} (Project: ${projectName}) has been checked by the quantity surveyor and is ready for manager review.`,
                    icon,
                };
            }
            break;

        case 'approved':
            return {
                title: 'Request Approved',
                body: `Your procurement request for ${materialName} (Project: ${projectName}) has been approved by the manager.`,
                icon,
            };

        case 'rejected':
            return {
                title: 'Request Rejected',
                body: `Your procurement request for ${materialName} (Project: ${projectName}) has been rejected by the manager.`,
                icon,
            };

        case 'ordered':
            return {
                title: 'Materials Ordered',
                body: `Materials for ${materialName} (Project: ${projectName}) have been ordered.`,
                icon,
            };

        case 'processing':
            return {
                title: 'Order Processing',
                body: `Your order for ${materialName} (Project: ${projectName}) is being processed.`,
                icon,
            };

        case 'shipped':
            return {
                title: 'Materials Shipped',
                body: `Your materials for ${materialName} (Project: ${projectName}) have been shipped.`,
                icon,
            };

        case 'arrived':
            if (recipientRole === 'engineer') {
                return {
                    title: 'Materials Arrived',
                    body: `The ${materialName} for ${projectName} has arrived and is ready for pickup!`,
                    icon,
                };
            } else if (recipientRole === 'manager') {
                return {
                    title: 'Materials Delivered',
                    body: `Materials for ${materialName} for ${projectName} have arrived.`,
                    icon,
                };
            }
            break;

        default:
            console.warn(`Unknown status: ${status}`);
            break;
    }

    // Fallback content
    return {
        title: 'Procurement Update',
        body: `Update for ${materialName} (Project: ${projectName})`,
        icon: 'default',
    };
}

/**
 * Get appropriate icon for status
 */
function getIconForStatus(status: ProcurementRequestStatus): string {
    const iconMap: Record<ProcurementRequestStatus, string> = {
        pending: 'clock',
        quantity_checked: 'checkmark',
        approved: 'thumbs-up',
        rejected: 'thumbs-down',
        ordered: 'shopping-cart',
        processing: 'cog',
        shipped: 'truck',
        arrived: 'package',
    };
    return iconMap[status] || 'default';
}

/**
 * Create push notification payload
 */
export function createPushNotificationPayload(
    recipient: User,
    status: ProcurementRequestStatus,
    projectName: string,
    materialName: string,
    requestId: string
): PushNotificationPayload {
    const content = generateNotificationContent(
        status,
        projectName,
        materialName,
        recipient.role
    );

    return {
        to: recipient.expoPushToken!,
        title: content.title,
        body: content.body,
        sound: 'default',
        data: {
            requestId,
            status,
            type: 'procurement_request',
            icon: content.icon,
        },
    };
}

/**
 * Send push notifications to multiple recipients
 */
export async function sendPushNotifications(
    recipients: User[],
    status: ProcurementRequestStatus,
    projectName: string,
    materialName: string,
    requestId: string
): Promise<{ success: boolean; sentCount: number; errorCount: number }> {
    const operationId = `notify_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const startTime = Date.now();
    
    console.log(`[${operationId}] Push Notifications - Starting operation`, {
        requestId,
        status,
        projectName,
        materialName,
        totalRecipients: recipients.length,
        timestamp: new Date().toISOString(),
    });

    if (recipients.length === 0) {
        console.warn(`[${operationId}] Push Notifications - No recipients provided`, {
            requestId,
            status,
        });
        return { success: true, sentCount: 0, errorCount: 0 };
    }

    // Filter recipients with valid expo push tokens
    const validRecipients = recipients.filter(recipient =>
        recipient.expoPushToken && Expo.isExpoPushToken(recipient.expoPushToken)
    );
    
    console.log(`[${operationId}] Push Notifications - Token validation completed`, {
        totalRecipients: recipients.length,
        validRecipients: validRecipients.length,
        invalidTokens: recipients.length - validRecipients.length,
        invalidRecipients: recipients
            .filter(r => !r.expoPushToken || !Expo.isExpoPushToken(r.expoPushToken))
            .map(r => ({
                uid: r.uid,
                email: r.email,
                role: r.role,
                hasToken: !!r.expoPushToken,
                tokenValid: r.expoPushToken ? Expo.isExpoPushToken(r.expoPushToken) : false,
            })),
    });
    
    if (validRecipients.length === 0) {
        console.warn(`[${operationId}] Push Notifications - No valid expo push tokens`, {
            requestId,
            totalRecipients: recipients.length,
            recipientDetails: recipients.map(r => ({
                uid: r.uid,
                email: r.email,
                role: r.role,
                hasToken: !!r.expoPushToken,
            })),
        });
        return { success: true, sentCount: 0, errorCount: 0 };
    }

    // Create push notification messages
    console.log(`[${operationId}] Push Notifications - Creating notification messages`);
    const messages: ExpoPushMessage[] = validRecipients.map(recipient => {
        const payload = createPushNotificationPayload(
            recipient,
            status,
            projectName,
            materialName,
            requestId
        );
        
        console.log(`[${operationId}] Push Notifications - Message created for ${recipient.email}`, {
            recipientUid: recipient.uid,
            recipientRole: recipient.role,
            title: payload.title,
            bodyPreview: payload.body.substring(0, 50) + '...',
            expoPushTokenPreview: payload.to.substring(0, 20) + '...',
        });
        
        return {
            to: payload.to,
            title: payload.title,
            body: payload.body,
            sound: payload.sound,
            data: payload.data,
        };
    });

    try {
        console.log(`[${operationId}] Push Notifications - Sending ${messages.length} notifications via Expo`, {
            requestId,
            status,
            messageCount: messages.length,
            recipients: validRecipients.map(r => r.email),
        });
        
        // Send notifications in chunks
        const chunks = expo.chunkPushNotifications(messages);
        console.log(`[${operationId}] Push Notifications - Split into ${chunks.length} chunks`);
        
        const tickets: ExpoPushTicket[] = [];
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            try {
                console.log(`[${operationId}] Push Notifications - Sending chunk ${i + 1}/${chunks.length}`, {
                    chunkSize: chunk.length,
                });
                
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
                
                console.log(`[${operationId}] Push Notifications - Chunk ${i + 1} sent successfully`, {
                    chunkSize: chunk.length,
                    ticketsReceived: ticketChunk.length,
                });
            } catch (error) {
                console.error(`[${operationId}] Push Notifications - Chunk ${i + 1} failed`, {
                    chunkSize: chunk.length,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
            }
        }

        // Count results
        let successCount = 0;
        let errorCount = 0;
        
        console.log(`[${operationId}] Push Notifications - Processing ${tickets.length} tickets`);

        tickets.forEach((ticket, index) => {
            const recipient = validRecipients[index];
            if (ticket.status === 'ok') {
                successCount++;
                console.log(`[${operationId}] Push Notifications - Success for ${recipient.email}`, {
                    recipientUid: recipient.uid,
                    recipientRole: recipient.role,
                    ticketId: ticket.id,
                });
            } else {
                errorCount++;
                console.error(`[${operationId}] Push Notifications - Failed for ${recipient.email}`, {
                    recipientUid: recipient.uid,
                    recipientRole: recipient.role,
                    error: ticket.message,
                    details: ticket.details,
                });
            }
        });

        console.log(`[${operationId}] Push Notifications - Operation completed`, {
            requestId,
            status,
            totalSent: successCount,
            totalFailed: errorCount,
            totalProcessed: tickets.length,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
        });

        // Handle receipts for delivery confirmation (optional)
        if (tickets.length > 0) {
            console.log(`[${operationId}] Push Notifications - Scheduling receipt check`);
            handleNotificationReceipts(tickets, operationId);
        }

        return {
            success: true,
            sentCount: successCount,
            errorCount
        };
    } catch (error) {
        console.error(`[${operationId}] Push Notifications - Operation failed`, {
            requestId,
            status,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
        });
        throw error;
    }
}

/**
 * Handle notification receipts for delivery confirmation
 */
function handleNotificationReceipts(tickets: ExpoPushTicket[], operationId: string): void {
    const receiptIds: ExpoPushReceiptId[] = tickets
        .filter(ticket => ticket.status === 'ok')
        .map(ticket => ticket.id);

    console.log(`[${operationId}] Receipt Check - Preparing to check receipts`, {
        totalTickets: tickets.length,
        successfulTickets: receiptIds.length,
        receiptIds: receiptIds.slice(0, 5), // Log first 5 for debugging
    });

    if (receiptIds.length === 0) {
        console.log(`[${operationId}] Receipt Check - No successful tickets to check`);
        return;
    }

    // Check receipts after a delay
    setTimeout(async () => {
        console.log(`[${operationId}] Receipt Check - Starting delayed receipt check`);
        try {
            const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
            console.log(`[${operationId}] Receipt Check - Processing ${receiptIdChunks.length} chunks`);
            
            for (let i = 0; i < receiptIdChunks.length; i++) {
                const chunk = receiptIdChunks[i];
                console.log(`[${operationId}] Receipt Check - Processing chunk ${i + 1}/${receiptIdChunks.length}`);
                
                const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                for (const receiptId in receipts) {
                    const receipt = receipts[receiptId];
                    if (receipt.status === 'ok') {
                        console.log(`[${operationId}] Receipt Check - Delivery confirmed`, {
                            receiptId,
                            status: 'delivered',
                        });
                    } else if (receipt.status === 'error') {
                        console.error(`[${operationId}] Receipt Check - Delivery failed`, {
                            receiptId,
                            status: 'error',
                            error: receipt.message,
                            details: receipt.details,
                        });
                    }
                }
            }
            console.log(`[${operationId}] Receipt Check - Completed successfully`);
        } catch (error) {
            console.error(`[${operationId}] Receipt Check - Failed`, {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            });
        }
    }, 15000); // Check receipts after 15 seconds
}
