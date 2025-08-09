import { getDb } from '@/lib/firebase-admin';
import { User } from '@/types/notifications';

/**
 * Fetch all users with a specific role
 */
export async function getUsersByRole(role: string): Promise<User[]> {
    const operationId = `getUsersByRole_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const startTime = Date.now();
    
    try {
        console.log(`[${operationId}] User Service - Fetching users with role: ${role}`, {
            timestamp: new Date().toISOString(),
        });
        
        const db = getDb();
        const snapshot = await db
            .collection('users')
            .where('role', '==', role)
            .get();
            
        const users: User[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                uid: doc.id,
                displayName: data.displayName || '',
                email: data.email || '',
                role: data.role,
                expoPushToken: data.expoPushToken,
            });
        });
        
        console.log(`[${operationId}] User Service - Users fetched successfully`, {
            role,
            userCount: users.length,
            duration: Date.now() - startTime,
            users: users.map(u => ({
                uid: u.uid,
                email: u.email,
                hasExpoPushToken: !!u.expoPushToken,
            })),
        });
        
        return users;
    } catch (error) {
        console.error(`[${operationId}] User Service - Error fetching users by role`, {
            role,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            duration: Date.now() - startTime,
        });
        throw error;
    }
}/**
 * Fetch a specific user by UID
 */
export async function getUserByUid(uid: string): Promise<User | null> {
    try {
        console.log(`Fetching user with UID: ${uid}`);
        const db = getDb();
        const doc = await db.collection('users').doc(uid).get();

        if (!doc.exists) {
            console.warn(`User not found with UID: ${uid}`);
            return null;
        }

        const data = doc.data()!;
        const user: User = {
            uid: doc.id,
            displayName: data.displayName || '',
            email: data.email || '',
            role: data.role,
            expoPushToken: data.expoPushToken,
        };

        console.log(`Found user: ${user.displayName} (${user.email})`);
        return user;
    } catch (error) {
        console.error(`Error fetching user by UID ${uid}:`, error);
        throw error;
    }
}

/**
 * Get users with valid expo push tokens by role
 */
export async function getUsersWithPushTokensByRole(role: string): Promise<User[]> {
    const users = await getUsersByRole(role);
    return users.filter(user => user.expoPushToken && user.expoPushToken.trim() !== '');
}

/**
 * Get user with valid expo push token by UID
 */
export async function getUserWithPushTokenByUid(uid: string): Promise<User | null> {
    const user = await getUserByUid(uid);
    if (!user || !user.expoPushToken || user.expoPushToken.trim() === '') {
        console.warn(`User ${uid} does not have a valid expo push token`);
        return null;
    }
    return user;
}

/**
 * Determine recipients based on procurement request status
 */
export async function getRecipientsForStatus(
    status: string,
    createdByUid: string
): Promise<User[]> {
    const operationId = `getRecipients_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const startTime = Date.now();
    const recipients: User[] = [];
    
    console.log(`[${operationId}] Recipient Service - Determining recipients`, {
        status,
        createdByUid,
        timestamp: new Date().toISOString(),
    });
    
    try {
        switch (status) {
            case 'pending': {
                console.log(`[${operationId}] Recipient Service - Fetching managers and quantity surveyors for pending status`);
                const managers = await getUsersWithPushTokensByRole('manager');
                const quantitySurveyors = await getUsersWithPushTokensByRole('quantity_surveyor');
                recipients.push(...managers, ...quantitySurveyors);
                
                console.log(`[${operationId}] Recipient Service - Pending recipients found`, {
                    managersCount: managers.length,
                    quantitySurveyorsCount: quantitySurveyors.length,
                    managers: managers.map(m => m.email),
                    quantitySurveyors: quantitySurveyors.map(q => q.email),
                });
                break;
            }
            
            case 'quantity_checked': {
                console.log(`[${operationId}] Recipient Service - Fetching managers and original engineer for quantity_checked status`);
                const managersForQC = await getUsersWithPushTokensByRole('manager');
                const engineer = await getUserWithPushTokenByUid(createdByUid);
                recipients.push(...managersForQC);
                if (engineer) recipients.push(engineer);
                
                console.log(`[${operationId}] Recipient Service - Quantity checked recipients found`, {
                    managersCount: managersForQC.length,
                    engineerFound: !!engineer,
                    engineer: engineer ? engineer.email : null,
                    managers: managersForQC.map(m => m.email),
                });
                break;
            }
            
            case 'approved':
            case 'rejected': {
                console.log(`[${operationId}] Recipient Service - Fetching original engineer for ${status} status`);
                const requestEngineer = await getUserWithPushTokenByUid(createdByUid);
                if (requestEngineer) recipients.push(requestEngineer);
                
                console.log(`[${operationId}] Recipient Service - ${status} recipient found`, {
                    engineerFound: !!requestEngineer,
                    engineer: requestEngineer ? requestEngineer.email : null,
                });
                break;
            }
            
            case 'ordered':
            case 'processing':
            case 'shipped': {
                console.log(`[${operationId}] Recipient Service - Fetching original engineer for ${status} status`);
                const requestEngineer = await getUserWithPushTokenByUid(createdByUid);
                if (requestEngineer) recipients.push(requestEngineer);
                
                console.log(`[${operationId}] Recipient Service - ${status} recipient found`, {
                    engineerFound: !!requestEngineer,
                    engineer: requestEngineer ? requestEngineer.email : null,
                });
                break;
            }
            
            case 'arrived': {
                console.log(`[${operationId}] Recipient Service - Fetching engineer and managers for arrived status`);
                const engineerForArrival = await getUserWithPushTokenByUid(createdByUid);
                const managersForArrival = await getUsersWithPushTokensByRole('manager');
                if (engineerForArrival) recipients.push(engineerForArrival);
                recipients.push(...managersForArrival);
                
                console.log(`[${operationId}] Recipient Service - Arrived recipients found`, {
                    engineerFound: !!engineerForArrival,
                    managersCount: managersForArrival.length,
                    engineer: engineerForArrival ? engineerForArrival.email : null,
                    managers: managersForArrival.map(m => m.email),
                });
                break;
            }
            
            default:
                console.warn(`[${operationId}] Recipient Service - Unknown status for notification: ${status}`);
        }
        
        // Remove duplicates based on UID
        const uniqueRecipients = recipients.filter((recipient, index, array) =>
            array.findIndex(r => r.uid === recipient.uid) === index
        );
        
        const duplicatesRemoved = recipients.length - uniqueRecipients.length;
        
        console.log(`[${operationId}] Recipient Service - Operation completed`, {
            status,
            createdByUid,
            totalRecipients: recipients.length,
            uniqueRecipients: uniqueRecipients.length,
            duplicatesRemoved,
            duration: Date.now() - startTime,
            finalRecipients: uniqueRecipients.map(r => ({
                uid: r.uid,
                email: r.email,
                role: r.role,
                hasExpoPushToken: !!r.expoPushToken,
            })),
        });
        
        return uniqueRecipients;
    } catch (error) {
        console.error(`[${operationId}] Recipient Service - Error getting recipients`, {
            status,
            createdByUid,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            duration: Date.now() - startTime,
        });
        throw error;
    }
}