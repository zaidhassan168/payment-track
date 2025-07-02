import { UserDetails } from "@/app/dashboard/users/components/UserDetails";
import { FirebaseUser } from "@/types/user";
import { auth, getDb } from "@/lib/firebase-admin";
import { getUserData } from "@/app/services/users";

interface UserDetailsPageProps {
    params: { uid: string };
}

async function getUser(uid: string): Promise<FirebaseUser | null> {
    try {
        console.log(`Attempting to fetch user with UID: ${uid}`);

        // Get user from Firebase Auth
        let userRecord;
        try {
            userRecord = await auth.getUser(uid);
            console.log('User record from Auth:', JSON.stringify({
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                // Log enough info for debugging without exposing sensitive data
            }, null, 2));
        } catch (authError: any) {
            console.error(`Auth error (${authError.code}):`, authError.message);
            throw new Error(`Authentication error: ${authError.message}`);
        }

        // Get additional user data from Firestore using Admin SDK
        const db = getDb();
        let userData: any = {};

        try {
            const userDoc = await db.collection('users').doc(uid).get();

            if (!userDoc.exists) {
                console.log('No Firestore document exists for user. Creating default document.');

                // Create a default user document if none exists
                const defaultUserData = {
                    uid: userRecord.uid,
                    role: 'user',
                    createdAt: new Date().toISOString()
                };

                await db.collection('users').doc(uid).set(defaultUserData);
                userData = defaultUserData;
            } else {
                userData = userDoc.data() || {};
                console.log('User data from Firestore:', JSON.stringify(userData, null, 2));
            }
        } catch (firestoreError) {
            console.error('Error accessing Firestore:', firestoreError);
            // Continue with just Auth data if Firestore fails
        }

        // Serialize the Firebase user object to a plain object with only the properties we need
        const user: FirebaseUser = {
            uid: userRecord.uid,
            email: userRecord.email || undefined,
            emailVerified: userRecord.emailVerified,
            displayName: userRecord.displayName || undefined,
            phoneNumber: userRecord.phoneNumber || undefined,
            photoURL: userRecord.photoURL || undefined,
            disabled: userRecord.disabled,
            role: userData?.role || 'user',
            metadata: {
                creationTime: userRecord.metadata?.creationTime,
                lastSignInTime: userRecord.metadata?.lastSignInTime
            }
        };

        console.log('Final serialized user object:', JSON.stringify(user, null, 2));
        return user;
    } catch (error) {
        console.error("Error fetching user with admin SDK:", error);

        // As a fallback, try to fetch from our API endpoint which also uses admin SDK
        try {
            console.log("Attempting to fetch user data using API endpoint as fallback...");
            const apiUserData = await getUserData(uid);
            console.log("API returned user data:", apiUserData);

            if (!apiUserData) {
                return null;
            }

            // Convert API data to FirebaseUser format
            const user: FirebaseUser = {
                uid: apiUserData.uid,
                email: apiUserData.email,
                emailVerified: apiUserData.emailVerified || false,
                displayName: apiUserData.displayName,
                phoneNumber: apiUserData.phoneNumber,
                photoURL: apiUserData.photoURL,
                disabled: apiUserData.disabled || false,
                role: apiUserData.role || 'user',
                metadata: {
                    creationTime: apiUserData.createdAt,
                    lastSignInTime: apiUserData.lastSignInTime || apiUserData.createdAt
                }
            };

            return user;
        } catch (apiError) {
            console.error("Fallback API also failed:", apiError);
            return null;
        }
    }
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
    try {
        const { uid } = params;
        const user = await getUser(uid);

        if (!user) {
            return (
                <div className="p-8">
                    <h2 className="text-xl font-bold mb-4">User Not Found</h2>
                    <p>No user found with the provided ID.</p>
                    <p className="mt-4 text-sm text-gray-500">Debug: UID = {uid}</p>
                </div>
            );
        }

        return <UserDetails user={user} />;
    } catch (error) {
        console.error("Error in UserDetailsPage:", error);
        return (
            <div className="p-8">
                <h2 className="text-xl font-bold mb-4 text-red-600">Error Loading User</h2>
                <p>There was an error loading the user details.</p>
                <p className="mt-4 text-sm text-gray-500">Please try again later or contact support.</p>
            </div>
        );
    }
}
