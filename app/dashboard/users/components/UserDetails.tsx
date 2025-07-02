"use client";

import { FirebaseUser } from "@/types/user";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface UserDetailsProps {
    user: FirebaseUser;
}

export function UserDetails({ user }: UserDetailsProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [role, setRole] = useState(user.role || "user");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const roles = [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
        { value: "manager", label: "Manager" },
    ];

    const updateUserRole = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uid: user.uid,
                    role,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update user role");
            }

            toast({
                title: "Role updated",
                description: `User role has been updated to ${role}`,
            });

            // Close the dialog
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error("Error updating role:", error);
            toast({
                title: "Error",
                description: "Failed to update user role",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

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
        <div className="p-8 space-y-6">
            <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback className="text-lg">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold">{user.displayName || "Unnamed User"}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="flex space-x-2 mt-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {user.role || "user"}
                        </span>
                        {user.emailVerified && (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">User Details</h3>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                        Edit Role
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="font-semibold">User ID:</span>
                    </div>
                    <div>
                        <span>{user.uid}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Email:</span>
                    </div>
                    <div>
                        <span>{user.email || "—"}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Display Name:</span>
                    </div>
                    <div>
                        <span>{user.displayName || "—"}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Phone Number:</span>
                    </div>
                    <div>
                        <span>{user.phoneNumber || "—"}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Email Verified:</span>
                    </div>
                    <div>
                        <span>{user.emailVerified ? "Yes" : "No"}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Role:</span>
                    </div>
                    <div>
                        <span>{user.role || "user"}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Disabled:</span>
                    </div>
                    <div>
                        <span>{user.disabled ? "Yes" : "No"}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Created At:</span>
                    </div>
                    <div>
                        <span>{user.metadata?.creationTime || "—"}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Last Sign In:</span>
                    </div>
                    <div>
                        <span>{user.metadata?.lastSignInTime || "—"}</span>
                    </div>
                </div>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={updateUserRole} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
