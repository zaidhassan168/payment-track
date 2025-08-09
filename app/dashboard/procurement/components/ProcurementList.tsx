"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Package, Clock, CheckCircle, XCircle, Truck, ClipboardCheck, PackageCheck } from 'lucide-react';
import { ProcurementRequest } from '@/types/procurement';
import { format } from 'date-fns';

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

const statusIcons: { [key: string]: React.ElementType } = {
    pending: Clock,
    quantity_checked: ClipboardCheck,
    approved: CheckCircle,
    rejected: XCircle,
    ordered: Package,
    arrived: PackageCheck,
    processing: Package,
    shipped: Truck,
};

interface ProcurementListProps {
    requests: ProcurementRequest[];
    loading: boolean;
    viewMode: 'table' | 'cards';
    onViewRequest: (request: ProcurementRequest) => void;
    onClearFilters: () => void;
}

export default function ProcurementList({
    requests,
    loading,
    viewMode,
    onViewRequest,
    onClearFilters,
}: ProcurementListProps) {
    if (loading && requests.length === 0) {
        return viewMode === 'table' ? <TableSkeleton /> : <CardSkeleton />;
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-24 text-gray-500 dark:text-gray-400">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <h3 className="text-lg font-semibold">No requests found</h3>
                <p>There are no requests matching your current filters.</p>
                <Button variant="link" onClick={onClearFilters} className="mt-2">Clear filters</Button>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {viewMode === 'table' ? (
                    <TableView requests={requests} onViewRequest={onViewRequest} />
                ) : (
                    <CardView requests={requests} onViewRequest={onViewRequest} />
                )}
            </motion.div>
        </AnimatePresence>
    );
}

function TableView({ requests, onViewRequest }: { requests: ProcurementRequest[], onViewRequest: (r: ProcurementRequest) => void }) {
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {requests.map(request => (
                                <TableRowItem key={request.id} request={request} onViewRequest={onViewRequest} />
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function TableRowItem({ request, onViewRequest }: { request: ProcurementRequest, onViewRequest: (r: ProcurementRequest) => void }) {
    const StatusIcon = statusIcons[request.status];
    return (
        <motion.tr
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-b last:border-b-0"
        >
            <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    {request.imageUrl && <img src={request.imageUrl} alt={request.materialName} className="w-10 h-10 rounded-md object-cover" />}
                    <span className="truncate">{request.materialName}</span>
                </div>
            </TableCell>
            <TableCell>{request.quantity}</TableCell>
            <TableCell>{request.projectName}</TableCell>
            <TableCell>
                <Badge className={`capitalize ${statusColors[request.status]}`}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                    {request.status.replace(/_/g, ' ')}
                </Badge>
            </TableCell>
            <TableCell className="text-sm text-gray-500">
                <div>{request.createdByName}</div>
                <div>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</div>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onViewRequest(request)}>
                    <Eye className="w-4 h-4 mr-1" /> View
                </Button>
            </TableCell>
        </motion.tr>
    );
}

function CardView({ requests, onViewRequest }: { requests: ProcurementRequest[], onViewRequest: (r: ProcurementRequest) => void }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
                {requests.map((request, i) => (
                    <CardItem key={request.id} request={request} i={i} onViewRequest={onViewRequest} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function CardItem({ request, i, onViewRequest }: { request: ProcurementRequest, i: number, onViewRequest: (r: ProcurementRequest) => void }) {
    const StatusIcon = statusIcons[request.status];
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
        >
            <Card className="h-full hover:shadow-xl transition-shadow duration-300 group">
                {request.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                        <img src={request.imageUrl} alt={request.materialName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                )}
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-base">{request.materialName}</CardTitle>
                        <p className="text-sm text-gray-500">{request.quantity} • {request.projectName}</p>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge className={`capitalize ${statusColors[request.status]}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{request.status.replace('_', ' ')}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardHeader>
                <CardContent className="flex justify-between items-end">
                    <div className="text-sm text-gray-500">
                        <span className="block">By {request.createdByName}</span>
                        <span>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onViewRequest(request)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function TableSkeleton() {
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function CardSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-8 w-1/4" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
