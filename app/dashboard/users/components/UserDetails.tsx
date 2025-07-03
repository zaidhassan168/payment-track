"use client";

import { FirebaseUser, UpdateUserData } from "@/types/user";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { updateUser, deleteUser, updateUserRole } from "@/app/services/users";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Edit, Trash2, UserCog } from "lucide-react";

interface UserDetailsProps {
    user: FirebaseUser;
}

export function UserDetails({ user }: UserDetailsProps) {
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [role, setRole] = useState(user.role || "user");
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState<UpdateUserData>({
        displayName: user.displayName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        disabled: user.disabled,
        emailVerified: user.emailVerified,
    });
    const { toast } = useToast();
    const router = useRouter();

    const roles = [
        { value: "user", label: "User" },
        { value: "manager", label: "Manager" },
        { value: "quantity_surveyor", label: "Quantity Surveyor" },
        { value: "engineer", label: "Engineer" },
    ];

    const handleUpdateUserRole = async () => {
        setIsLoading(true);
        try {
            console.log(`Updating user ${user.uid} role to: ${role}`);
            await updateUserRole(user.uid, role);

            toast({
                title: "Role updated",
                description: `User role has been updated to ${role}`,
            });

            // Close the dialog
            setIsRoleDialogOpen(false);

            // Refresh the page to show updated data
            router.refresh();
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

    const handleUpdateUser = async () => {
        setIsLoading(true);
        try {
            await updateUser(user.uid, userData);

            toast({
                title: "User updated",
                description: "User details have been updated successfully",
            });

            // Close the dialog
            setIsEditDialogOpen(false);

            // Refresh the page to show updated data
            router.refresh();
        } catch (error) {
            console.error("Error updating user:", error);
            toast({
                title: "Error",
                description: "Failed to update user details",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setIsLoading(true);
        try {
            await deleteUser(user.uid);

            toast({
                title: "User deleted",
                description: "User has been deleted successfully",
            });

            // Redirect to users list page
            router.push('/dashboard/users');
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                title: "Error",
                description: "Failed to delete user",
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
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                        <AvatarFallback className="text-lg bg-primary/10">{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold">{user.displayName || "Unnamed User"}</h1>
                        <p className="text-muted-foreground text-lg">{user.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                                {user.role || "user"}
                            </Badge>
                            {user.emailVerified ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    Verified
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">
                                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                                    Not Verified
                                </Badge>
                            )}
                            {user.disabled && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300">
                                    Disabled
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 self-end md:self-start">
                    <Button
                        variant="outline"
                        onClick={() => setIsRoleDialogOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <UserCog className="h-4 w-4" />
                        Change Role
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        Edit User
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">User Details</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">User ID</Label>
                                <p className="text-sm font-medium break-all">{user.uid}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Email</Label>
                                <p className="text-sm font-medium">{user.email || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Display Name</Label>
                                <p className="text-sm font-medium">{user.displayName || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Phone Number</Label>
                                <p className="text-sm font-medium">{user.phoneNumber || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Email Verified</Label>
                                <p className="text-sm font-medium">{user.emailVerified ? "Yes" : "No"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Role</Label>
                                <p className="text-sm font-medium">{user.role || "user"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Account Status</Label>
                                <p className="text-sm font-medium">{user.disabled ? "Disabled" : "Active"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Created At</Label>
                                <p className="text-sm font-medium">{user.metadata?.creationTime || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Last Sign In</Label>
                                <p className="text-sm font-medium">{user.metadata?.lastSignInTime || "—"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="activity" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">No recent activity to display.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Role Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {user.displayName || user.email || "this user"}.
                        </DialogDescription>
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
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateUserRole} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User Details</DialogTitle>
                        <DialogDescription>
                            Make changes to the user's profile here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="displayName" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="displayName"
                                value={userData.displayName || ""}
                                onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                value={userData.email || ""}
                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phoneNumber" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phoneNumber"
                                value={userData.phoneNumber || ""}
                                onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Status</Label>
                            <div className="flex items-center space-x-2 col-span-3">
                                <Select
                                    value={userData.disabled ? "disabled" : "active"}
                                    onValueChange={(value) => setUserData({ ...userData, disabled: value === "disabled" })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="disabled">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Email Verification</Label>
                            <div className="flex items-center space-x-2 col-span-3">
                                <Select
                                    value={userData.emailVerified ? "verified" : "not-verified"}
                                    onValueChange={(value) => setUserData({ ...userData, emailVerified: value === "verified" })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select verification status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="not-verified">Not Verified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateUser} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm font-medium mb-2">User Information:</p>
                        <p className="text-sm"><span className="font-semibold">Name:</span> {user.displayName || "—"}</p>
                        <p className="text-sm"><span className="font-semibold">Email:</span> {user.email || "—"}</p>
                        <p className="text-sm"><span className="font-semibold">User ID:</span> {user.uid}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
