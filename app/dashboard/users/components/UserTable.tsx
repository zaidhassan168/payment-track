'use client';

import { FirebaseUser } from '@/types/user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface UserTableProps {
    users: FirebaseUser[];
}

export function UserTable({ users }: UserTableProps) {
    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                        <tr key={user.uid} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12">
                                        <Avatar className="h-12 w-12 border border-gray-200">
                                            <AvatarImage
                                                src={user.photoURL || ""}
                                                alt={user.displayName || "User"}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="text-lg">{getInitials(user.displayName)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.displayName || "Unnamed User"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    {user.disabled ? (
                                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                            <XCircle className="h-3.5 w-3.5 mr-1" />
                                            Disabled
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                            Active
                                        </Badge>
                                    )}
                                    {user.emailVerified && (
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link href={`/dashboard/users/${user.uid}`} passHref legacyBehavior>
                                    <Button variant="outline" size="sm" asChild>
                                        <a>View Details</a>
                                    </Button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
