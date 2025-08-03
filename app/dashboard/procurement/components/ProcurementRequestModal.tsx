"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProcurementRequest } from '@/types/procurement';
import { Project } from '@/types';
import { format } from 'date-fns';
import { Clock, User, Calendar, Package, MapPin, MessageSquare, History } from 'lucide-react';

interface ProcurementRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: ProcurementRequest;
    onStatusUpdate: (requestId: string, status: ProcurementRequest['status'], managerNote?: string) => Promise<void>;
    projects: Project[];
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    quantity_checked: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    ordered: 'bg-purple-100 text-purple-800',
    arrived: 'bg-indigo-100 text-indigo-800',
    processing: 'bg-orange-100 text-orange-800',
    shipped: 'bg-cyan-100 text-cyan-800',
};

export default function ProcurementRequestModal({
    isOpen,
    onClose,
    request,
    onStatusUpdate,
    projects
}: ProcurementRequestModalProps) {
    const [newStatus, setNewStatus] = useState<ProcurementRequest['status']>(request.status);
    const [managerNote, setManagerNote] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleStatusUpdate = async () => {
        if (newStatus === request.status && !managerNote.trim()) return;

        setUpdating(true);
        try {
            await onStatusUpdate(request.id!, newStatus, managerNote.trim() || undefined);
            setManagerNote(''); // Clear the note after successful update
            onClose();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const project = projects.find(p => p.id === request.projectId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Procurement Request Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Material Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Material Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">Material:</span>
                                        <span>{request.materialName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Quantity:</span>
                                        <span>{request.quantity}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">Project:</span>
                                        <span>{request.projectName}</span>
                                    </div>
                                </div>
                            </div>

                            {request.imageUrl && (
                                <div>
                                    <h4 className="font-medium mb-2">Material Image</h4>
                                    <img
                                        src={request.imageUrl}
                                        alt={request.materialName}
                                        className="w-full max-w-sm rounded-lg border"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Request Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Status:</span>
                                        <Badge className={statusColors[request.status]}>
                                            {request.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">Created by:</span>
                                        <span>{request.createdByName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">Created:</span>
                                        <span>{format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">Last updated:</span>
                                        <span>{format(new Date(request.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status History */}
                    {request.statusHistory && request.statusHistory.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Status History
                            </h3>
                            <div className="space-y-2">
                                {request.statusHistory.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Badge className={statusColors[entry.status]}>
                                                {entry.status.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                by {entry.changedByName || entry.changedBy}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {format(new Date(entry.changedAt), 'MMM dd, yyyy HH:mm')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Manager Notes */}
                    {request.managerNotes && request.managerNotes.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Manager Notes
                            </h3>
                            <div className="space-y-3">
                                {request.managerNotes.map((note) => (
                                    <div key={note.id} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                        <p className="text-gray-800 mb-2">{note.note}</p>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>by {note.createdByName}</span>
                                            <span>{format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Update Status Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-3">Update Request</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="status">Change Status</Label>
                                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ProcurementRequest['status'])}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="quantity_checked">Quantity Checked</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="ordered">Ordered</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="arrived">Arrived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="note">Add Manager Note (Optional)</Label>
                                <Textarea
                                    id="note"
                                    placeholder="Add a note about this status change..."
                                    value={managerNote}
                                    onChange={(e) => setManagerNote(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleStatusUpdate}
                        disabled={updating || (newStatus === request.status && !managerNote.trim())}
                    >
                        {updating ? 'Updating...' : 'Update Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
