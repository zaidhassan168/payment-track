'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CreateUserData } from '@/types/user';
import { showSuccessToast, showErrorToast } from '@/lib/taost-utils';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

export function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
    const [formData, setFormData] = useState<CreateUserData>({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (!formData.email || !formData.password) {
            setError('Email and password are required.');
            showErrorToast('Email and password are required.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const { error } = await res.json();
                showErrorToast(error || 'Failed to create user');
                throw new Error(error);
            }

            showSuccessToast('User created successfully');
            onUserCreated();
            onClose();
        } catch (err: any) {
            setError(err.message);
            showErrorToast(err.message || 'Failed to create user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input id="email" name="email" value={formData.email} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="displayName" className="text-right">
                                Display Name
                            </Label>
                            <Input id="displayName" name="displayName" value={formData.displayName || ''} onChange={handleChange} className="col-span-3" />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
