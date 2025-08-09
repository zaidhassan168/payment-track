"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProcurementRequest } from '@/types/procurement';
import { Project } from '@/types';
import { format } from 'date-fns';
import { Clock, User, Calendar, Package, MapPin, MessageSquare, History, Edit } from 'lucide-react';

interface ProcurementRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: ProcurementRequest;
    onStatusUpdate: (requestId: string, status: ProcurementRequest['status'], managerNote?: string) => Promise<void>;
    projects: Project[];
}

const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    quantity_checked: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    ordered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    arrived: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    processing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
};

export default function ProcurementRequestModal({
    isOpen,
    onClose,
    request,
    onStatusUpdate,
}: ProcurementRequestModalProps) {
    const [newStatus, setNewStatus] = useState<ProcurementRequest['status']>(request.status);
    const [managerNote, setManagerNote] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleUpdate = async () => {
        if (newStatus === request.status && !managerNote.trim()) return;
        setUpdating(true);
        await onStatusUpdate(request.id!, newStatus, managerNote.trim() || undefined);
        setUpdating(false);
        setManagerNote('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent asChild>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-lg"
                >
                    <DialogHeader className="p-6">
                        <DialogTitle className="text-xl font-semibold">{request.materialName}</DialogTitle>
                        <DialogDescription>
                            Request ID: {request.id}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                        {/* Material & Request Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Details</h3>
                                <InfoItem icon={Package} label="Quantity" value={request.quantity} />
                                <InfoItem icon={MapPin} label="Project" value={request.projectName} />
                                <InfoItem icon={User} label="Created by" value={request.createdByName} />
                                <InfoItem icon={Calendar} label="Created on" value={format(new Date(request.createdAt), 'PPpp')} />
                                <InfoItem icon={Clock} label="Last updated" value={format(new Date(request.updatedAt), 'PPpp')} />
                            </div>
                            {request.imageUrl && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Material Image</h4>
                                    <img src={request.imageUrl} alt={request.materialName} className="w-full rounded-lg border object-cover aspect-video" />
                                </div>
                            )}
                        </div>

                        {/* Status History */}
                        <Section title="Status History" icon={History}>
                            <div className="space-y-2">
                                {request.statusHistory?.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Badge className={`capitalize ${statusColors[entry.status]}`}>{entry.status.replace('_', ' ')}</Badge>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">by {entry.changedByName || entry.changedBy}</span>
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(entry.changedAt), 'PPp')}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* Manager Notes */}
                        {request.managerNotes && request.managerNotes.length > 0 && (
                            <Section title="Manager Notes" icon={MessageSquare}>
                                <div className="space-y-3">
                                    {request.managerNotes.map((note) => (
                                        <div key={note.id} className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-400">
                                            <p className="text-gray-800 dark:text-gray-200 mb-2">{note.note}</p>
                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                                <span>by {note.createdByName}</span>
                                                <span>{format(new Date(note.createdAt), 'PPp')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Update Status Section */}
                        <Section title="Update Request" icon={Edit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="status">Change Status</Label>
                                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                                    <Textarea id="note" placeholder="Add a note about this status change..." value={managerNote} onChange={(e) => setManagerNote(e.target.value)} rows={3} />
                                </div>
                            </div>
                        </Section>
                    </div>

                    <DialogFooter className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 rounded-b-lg mt-auto">
                        <Button variant="outline" onClick={onClose} disabled={updating}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={updating || (newStatus === request.status && !managerNote.trim())}>
                            {updating ? 'Updating...' : 'Update Request'}
                        </Button>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

function Section({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) {
    return (
        <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon className="h-5 w-5 text-gray-500" />
                {title}
            </h3>
            {children}
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-gray-400 mt-1" />
            <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
                <p className="text-gray-600 dark:text-gray-400">{value}</p>
            </div>
        </div>
    );
}
