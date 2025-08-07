"use client";

import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    Package,
    Truck,
    AlertCircle,
    ClipboardCheck,
    PackageCheck,
    LayoutGrid,
    List,
} from 'lucide-react';
import {
    getProcurementRequests,
    getProcurementStats,
    updateProcurementRequestStatus,
    getProcurementProjects
} from '@/app/services/procurement';
// import { getProjects } from '@/app/services/projects';
import { ProcurementRequest, ProcurementStats } from '@/types/procurement';
import { Project } from '@/types';
import { format } from 'date-fns';
import { showSuccessToast, showErrorToast } from '@/lib/taost-utils';
import ProcurementRequestModal from './components/ProcurementRequestModal';
import CreateProcurementModal from './components/CreateProcurementModal';

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

const statusIcons = {
    pending: Clock,
    quantity_checked: ClipboardCheck,
    approved: CheckCircle,
    rejected: XCircle,
    ordered: Package,
    arrived: PackageCheck,
    processing: Package,
    shipped: Truck,
};

// Memoized stats panel to avoid re-rendering on filter changes
const StatsPanel = memo(function StatsPanel({ stats }: { stats: ProcurementStats }) {
    const hasMountedRef = useRef(false);
    useEffect(() => {
        hasMountedRef.current = true;
    }, []);

    const AnimatedStatCard = ({ title, value, icon: Icon, color }: {
        title: string; value: number; icon: any; color: string;
    }) => (
        <motion.div
            initial={hasMountedRef.current ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{title}</p>
                            <p className="text-2xl font-bold">{value}</p>
                        </div>
                        <Icon className={`h-8 w-8 ${color}`} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <AnimatedStatCard title="Total Requests" value={stats.total} icon={Package} color="text-blue-600" />
            <AnimatedStatCard title="Pending" value={stats.pending} icon={Clock} color="text-yellow-600" />
            <AnimatedStatCard title="Quantity Checked" value={stats.quantity_checked} icon={ClipboardCheck} color="text-blue-600" />
            <AnimatedStatCard title="Approved" value={stats.approved} icon={CheckCircle} color="text-green-600" />
            <AnimatedStatCard title="Ordered" value={stats.ordered} icon={Truck} color="text-purple-600" />
            <AnimatedStatCard title="Arrived" value={stats.arrived} icon={PackageCheck} color="text-indigo-600" />
        </div>
    );
}, (prevProps, nextProps) => {
    const a = prevProps.stats;
    const b = nextProps.stats;
    return (
        a.total === b.total &&
        a.pending === b.pending &&
        a.quantity_checked === b.quantity_checked &&
        a.approved === b.approved &&
        a.ordered === b.ordered &&
        a.arrived === b.arrived &&
        a.rejected === b.rejected &&
        a.processing === b.processing &&
        a.shipped === b.shipped
    );
});

export default function ProcurementDashboard() {
    const [requests, setRequests] = useState<ProcurementRequest[]>([]);
    const [stats, setStats] = useState<ProcurementStats | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lastDocId, setLastDocId] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    // Memoized element to avoid hook order issues and unnecessary re-renders
    const statsPanel = useMemo(() => (stats ? <StatsPanel stats={stats} /> : null), [stats]);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Only refetch the requests list on filter changes; do not refetch stats here
    useEffect(() => {
        loadRequests();
    }, [statusFilter, projectFilter]);

    const loadInitialData = async () => {
        try {
            const [statsData, projectsData] = await Promise.all([
                getProcurementStats(),
                getProcurementProjects(),
            ]);

            setStats(statsData);
            setProjects(projectsData);
            await loadRequests();
        } catch (error) {
            console.error('Error loading initial data:', error);
            showErrorToast('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const loadRequests = async (reset = true) => {
        try {
            const filters: any = {};
            if (statusFilter !== 'all') filters.status = statusFilter;
            if (projectFilter !== 'all') filters.projectId = projectFilter;

            const { requests: newRequests, hasMore: moreAvailable, lastDocId: newLastDocId } =
                await getProcurementRequests(filters, 20, reset ? undefined : lastDocId || undefined);

            if (reset) {
                setRequests(newRequests);
            } else {
                setRequests(prev => [...prev, ...newRequests]);
            }

            setHasMore(moreAvailable);
            setLastDocId(newLastDocId);
        } catch (error) {
            console.error('Error loading requests:', error);
            showErrorToast('Failed to load procurement requests');
        } finally {
            setLoadingMore(false);
        }
    };

    const loadMore = async () => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        await loadRequests(false);
    };

    const handleStatusUpdate = async (requestId: string, newStatus: ProcurementRequest['status'], managerNote?: string) => {
        try {
            await updateProcurementRequestStatus(requestId, newStatus, 'web-user', 'Web User', managerNote);
            showSuccessToast('Status updated successfully');

            // Refresh list quickly; refresh stats independently to avoid double renders
            await loadRequests();
            getProcurementStats().then(setStats).catch(() => { });
        } catch (error) {
            console.error('Error updating status:', error);
            showErrorToast('Failed to update status');
        }
    };

    const filteredRequests = requests.filter(request => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            try {
                return (
                    (request.materialName?.toLowerCase().includes(query)) ||
                    (request.projectName?.toLowerCase().includes(query)) ||
                    (request.createdByName?.toLowerCase().includes(query))
                );
            } catch (error) {
                console.error('Error filtering request:', error, request);
                return false;
            }
        }
        return true;
    });

    const getProjectName = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return project?.name || projectId;
    };

    const handleExportCsv = (rows: ProcurementRequest[]) => {
        try {
            const headers = [
                'ID',
                'Material',
                'Quantity',
                'Project',
                'Status',
                'Created By',
                'Created At',
            ];
            const escape = (value: unknown) => {
                const str = String(value ?? '');
                const needsQuote = /[",\n]/.test(str);
                const escaped = str.replace(/"/g, '""');
                return needsQuote ? `"${escaped}"` : escaped;
            };
            const csv = [
                headers.join(','),
                ...rows.map(r => [
                    r.id || '',
                    r.materialName,
                    r.quantity,
                    r.projectName,
                    r.status,
                    r.createdByName,
                    format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm')
                ].map(escape).join(','))
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `procurement-requests-${Date.now()}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('CSV export failed', error);
            showErrorToast('Failed to export CSV');
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div>
                        <div className="h-8 w-72 mb-2"><Skeleton className="h-8 w-72" /></div>
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Procurement Management</h1>
                        <p className="text-gray-600">Manage and track procurement requests across all projects</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => handleExportCsv(filteredRequests)}
                                    >
                                        <Download className="h-4 w-4" />
                                        Export CSV
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Export current view to CSV</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                                    >
                                        {viewMode === 'table' ? (
                                            <>
                                                <LayoutGrid className="h-4 w-4" /> Grid
                                            </>
                                        ) : (
                                            <>
                                                <List className="h-4 w-4" /> Table
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Toggle view</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            New Request
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                {statsPanel}

                {/* Filters and Search */}
                <div className="sticky top-0 z-20">
                    <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/60">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search by material, project, or creator..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="quantity_checked">Quantity Checked</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="ordered">Ordered</SelectItem>
                                        <SelectItem value="arrived">Arrived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={projectFilter} onValueChange={setProjectFilter}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Filter by project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Projects</SelectItem>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id!}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {(statusFilter !== 'all' || projectFilter !== 'all' || searchQuery) && (
                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                    {searchQuery && (
                                        <Badge variant="secondary" className="px-3 py-1">Search: {searchQuery}</Badge>
                                    )}
                                    {statusFilter !== 'all' && (
                                        <Badge variant="secondary" className="px-3 py-1">Status: {statusFilter.replace('_', ' ')}</Badge>
                                    )}
                                    {projectFilter !== 'all' && (
                                        <Badge variant="secondary" className="px-3 py-1">Project: {getProjectName(projectFilter)}</Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setStatusFilter('all');
                                            setProjectFilter('all');
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Requests Table / Cards */}
                {viewMode === 'table' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Procurement Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredRequests.length === 0 ? (
                                <div className="text-center py-16 text-gray-500">
                                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="mb-2">No requests match your filters</p>
                                    <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setProjectFilter('all'); }}>
                                        Reset filters
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created By</TableHead>
                                            <TableHead>Created Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRequests.map(request => {
                                            const StatusIcon = statusIcons[request.status];
                                            return (
                                                <motion.tr
                                                    key={request.id}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="border-b last:border-b-0"
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            {request.imageUrl && (
                                                                <img
                                                                    src={request.imageUrl}
                                                                    alt={request.materialName}
                                                                    className="w-10 h-10 rounded object-cover"
                                                                />
                                                            )}
                                                            {request.materialName}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{request.quantity}</TableCell>
                                                    <TableCell>{request.projectName}</TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[request.status]}>
                                                            <StatusIcon className="w-4 h-4 mr-1" />
                                                            {request.status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{request.createdByName}</TableCell>
                                                    <TableCell>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setModalOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </motion.tr>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}

                            {hasMore && (
                                <div className="flex justify-center mt-6">
                                    <Button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        variant="outline"
                                    >
                                        {loadingMore ? 'Loading...' : 'Load More'}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRequests.length === 0 ? (
                            <Card className="col-span-full">
                                <CardContent className="text-center py-16 text-gray-500">
                                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No requests match your filters</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredRequests.map((request) => {
                                const StatusIcon = statusIcons[request.status];
                                return (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="h-full hover:shadow-md transition-shadow">
                                            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                                <div>
                                                    <CardTitle className="text-base">{request.materialName}</CardTitle>
                                                    <p className="text-sm text-gray-500">{request.quantity} • {request.projectName}</p>
                                                </div>
                                                <Badge className={statusColors[request.status]}>
                                                    <StatusIcon className="w-4 h-4 mr-1" />
                                                    {request.status.replace('_', ' ')}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {request.imageUrl && (
                                                    <img
                                                        src={request.imageUrl}
                                                        alt={request.materialName}
                                                        className="w-full h-40 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-500">
                                                        <span className="block">By {request.createdByName}</span>
                                                        <span>On {format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" /> View
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                        {hasMore && (
                            <div className="col-span-full flex justify-center">
                                <Button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    variant="outline"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedRequest && (
                <ProcurementRequestModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedRequest(null);
                    }}
                    request={selectedRequest}
                    onStatusUpdate={handleStatusUpdate}
                    projects={projects}
                />
            )}

            <CreateProcurementModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    loadRequests();
                    if (stats) {
                        getProcurementStats().then(setStats);
                    }
                }}
                projects={projects}
            />
        </div>
    );
}
