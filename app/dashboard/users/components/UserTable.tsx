'use client';

import { FirebaseUser } from '@/types/user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UserTableProps {
    users: FirebaseUser[];
    onEdit: (user: FirebaseUser) => void;
    onDelete: (uid: string) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
    return (
        <table className="min-w-full bg-white">
            <thead>
                <tr>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Display Name</th>
                    <th className="py-2 px-4 border-b">Verified</th>
                    <th className="py-2 px-4 border-b">Disabled</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.uid}>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-2 px-4 border-b">{user.displayName}</td>
                        <td className="py-2 px-4 border-b">{user.emailVerified ? 'Yes' : 'No'}</td>
                        <td className="py-2 px-4 border-b">{user.disabled ? 'Yes' : 'No'}</td>
                        <td className="py-2 px-4 border-b">
                            <Link href={`/dashboard/users/${user.uid}`} passHref legacyBehavior>
                                <Button className="mr-2" variant="secondary" asChild>
                                    <a>View Details</a>
                                </Button>
                            </Link>
                            <Button onClick={() => onEdit(user)} className="mr-2">Edit</Button>
                            <Button onClick={() => onDelete(user.uid)} variant="destructive">Delete</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
