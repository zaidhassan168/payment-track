'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FirebaseUser, UpdateUserData } from '@/types/user';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: FirebaseUser;
    onUserUpdated: () => void;
}

export function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
    const [formData, setFormData] = useState<UpdateUserData>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            console.log('Editing user:', user);
            setFormData({
                email: user.email,
                displayName: user.displayName,
                disabled: user.disabled,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch(`/api/users/${user.uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error);
            }

            onUserUpdated();
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input id="email" name="email" value={formData.email || ''} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="displayName" className="text-right">
                                Display Name
                            </Label>
                            <Input id="displayName" name="displayName" value={formData.displayName || ''} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="disabled" className="text-right">
                                Disabled
                            </Label>
                            <Input id="disabled" name="disabled" type="checkbox" checked={formData.disabled || false} onChange={handleChange} />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
