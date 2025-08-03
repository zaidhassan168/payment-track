"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProcurementRequest } from '@/app/services/procurement';
import { Project } from '@/types';
import { showSuccessToast, showErrorToast } from '@/lib/taost-utils';

interface CreateProcurementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projects: Project[];
}

export default function CreateProcurementModal({
    isOpen,
    onClose,
    onSuccess,
    projects
}: CreateProcurementModalProps) {
    const [formData, setFormData] = useState({
        materialName: '',
        quantity: '',
        projectId: '',
        imageUrl: '',
        createdBy: 'web-user',
        createdByName: 'Web User',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.materialName || !formData.quantity || !formData.projectId) {
            showErrorToast('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const selectedProject = projects.find(p => p.id === formData.projectId);

            await createProcurementRequest({
                materialName: formData.materialName,
                quantity: formData.quantity,
                projectId: formData.projectId,
                projectName: selectedProject?.name || '',
                imageUrl: formData.imageUrl,
                status: 'pending',
                createdBy: formData.createdBy,
                createdByName: formData.createdByName,
            });

            showSuccessToast('Procurement request created successfully');
            onSuccess();
            resetForm();
        } catch (error) {
            console.error('Error creating procurement request:', error);
            showErrorToast('Failed to create procurement request');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            materialName: '',
            quantity: '',
            projectId: '',
            imageUrl: '',
            createdBy: 'web-user',
            createdByName: 'Web User',
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Procurement Request</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="materialName">Material Name *</Label>
                            <Input
                                id="materialName"
                                value={formData.materialName}
                                onChange={(e) => handleChange('materialName', e.target.value)}
                                placeholder="Enter material name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                value={formData.quantity}
                                onChange={(e) => handleChange('quantity', e.target.value)}
                                placeholder="e.g., 100 kg, 50 pieces"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="projectId">Project *</Label>
                        <Select value={formData.projectId} onValueChange={(value) => handleChange('projectId', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(project => (
                                    <SelectItem key={project.id} value={project.id!}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                        <Input
                            id="imageUrl"
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => handleChange('imageUrl', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="createdBy">Created By (User ID)</Label>
                            <Input
                                id="createdBy"
                                value={formData.createdBy}
                                onChange={(e) => handleChange('createdBy', e.target.value)}
                                placeholder="User ID"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="createdByName">Created By (Display Name)</Label>
                            <Input
                                id="createdByName"
                                value={formData.createdByName}
                                onChange={(e) => handleChange('createdByName', e.target.value)}
                                placeholder="Display name"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
