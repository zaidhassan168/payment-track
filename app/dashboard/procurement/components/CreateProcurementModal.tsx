"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types';
import { ProcurementRequest } from '@/types/procurement';
import { showErrorToast } from '@/lib/taost-utils';
import { PackagePlus } from 'lucide-react';

interface CreateProcurementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projects: Project[];
    createRequest: (data: Omit<ProcurementRequest, 'id' | 'createdAt' | 'updatedAt' | 'managerNotes' | 'statusHistory'>) => Promise<boolean>;
}

export default function CreateProcurementModal({
    isOpen,
    onClose,
    onSuccess,
    projects,
    createRequest
}: CreateProcurementModalProps) {
    const [formData, setFormData] = useState({
        materialName: '',
        quantity: '',
        projectId: '',
        imageUrl: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.materialName || !formData.quantity || !formData.projectId) {
            showErrorToast('Please fill in all required fields');
            return;
        }

        setLoading(true);
        const selectedProject = projects.find(p => p.id === formData.projectId);
        const success = await createRequest({
            ...formData,
            projectName: selectedProject?.name || '',
            status: 'pending',
            createdBy: 'web-user',
            createdByName: 'Web User',
        });

        if (success) {
            onSuccess();
            resetForm();
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({ materialName: '', quantity: '', projectId: '', imageUrl: '' });
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent asChild>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="sm:max-w-2xl bg-white dark:bg-gray-800 rounded-lg"
                >
                    <DialogHeader className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <PackagePlus className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">New Procurement Request</DialogTitle>
                                <DialogDescription>Fill in the details to create a new request.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="materialName">Material Name *</Label>
                                    <Input id="materialName" value={formData.materialName} onChange={(e) => handleChange('materialName', e.target.value)} placeholder="e.g., Cement Bags" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <Input id="quantity" value={formData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} placeholder="e.g., 100 units" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="projectId">Project *</Label>
                                <Select value={formData.projectId} onValueChange={(value) => handleChange('projectId', value)}>
                                    <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                                    <SelectContent>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id!}>{project.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                                <Input id="imageUrl" type="url" value={formData.imageUrl} onChange={(e) => handleChange('imageUrl', e.target.value)} placeholder="https://example.com/image.jpg" />
                            </div>
                        </div>
                        <DialogFooter className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 rounded-b-lg">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
