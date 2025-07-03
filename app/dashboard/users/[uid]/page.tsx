import { UserDetails } from "@/app/dashboard/users/components/UserDetails";
import { FirebaseUser } from "@/types/user";
import { getCompleteUserData } from "@/lib/user-service-server";

interface UserDetailsPageProps {
    params: Promise<{ uid: string }>;
}
export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
    try {
        // Await params to properly handle dynamic params in Next.js
        const resolvedParams = await Promise.resolve(params);
        const uid = resolvedParams.uid;
        const user = await getCompleteUserData(uid);

        if (!user) {
            return (
                <div className="p-8">
                    <h2 className="text-xl font-bold mb-4">User Not Found</h2>
                    <p>No user found with the provided ID.</p>
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
