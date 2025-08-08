"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Plus,
    Search,
    Download,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    Package,
    Truck,
    ClipboardCheck,
    PackageCheck,
    LayoutGrid,
    List,
    Filter,
    X,
} from 'lucide-react';
import { useProcurementStats, useProcurementProjects, useProcurementRequests } from '@/hooks/useProcurement';
import { ProcurementRequest } from '@/types/procurement';
import { format } from 'date-fns';
import { showErrorToast } from '@/lib/taost-utils';
import ProcurementRequestModal from './components/ProcurementRequestModal';
import CreateProcurementModal from './components/CreateProcurementModal';
import ProcurementList from './components/ProcurementList';

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

function StatsPanel({ stats, loading }: { stats: any; loading: boolean }) {
    const statCards = [
        { title: 'Total Requests', value: stats?.total, icon: Package, color: 'text-blue-500' },
        { title: 'Pending', value: stats?.pending, icon: Clock, color: 'text-yellow-500' },
        { title: 'Checked', value: stats?.quantity_checked, icon: ClipboardCheck, color: 'text-blue-500' },
        { title: 'Approved', value: stats?.approved, icon: CheckCircle, color: 'text-green-500' },
        { title: 'Ordered', value: stats?.ordered, icon: Truck, color: 'text-purple-500' },
        { title: 'Arrived', value: stats?.arrived, icon: PackageCheck, color: 'text-indigo-500' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <AnimatePresence>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Card>
                                <CardContent className="p-4">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-8 w-1/2" />
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4" style={{ borderLeftColor: stat.color }}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value ?? 0}</p>
                                        </div>
                                        <stat.icon className={`h-7 w-7 ${stat.color}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ProcurementDashboard() {
    const { stats, loading: statsLoading, refreshStats } = useProcurementStats();
    const { projects, loading: projectsLoading } = useProcurementProjects();
    const {
        requests,
        loading: requestsLoading,
        loadingMore,
        hasMore,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        loadMore,
        updateStatus,
        createRequest,
        refresh,
    } = useProcurementRequests();

    const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    const handleStatusUpdate = async (requestId: string, newStatus: ProcurementRequest['status'], managerNote?: string) => {
        const success = await updateStatus(requestId, newStatus, managerNote);
        if (success) {
            refreshStats();
            setRequestModalOpen(false);
        }
    };

    const handleCreateSuccess = () => {
        setCreateModalOpen(false);
        refresh();
        refreshStats();
    };

    const handleExportCsv = (rows: ProcurementRequest[]) => {
        try {
            const headers = ['ID', 'Material', 'Quantity', 'Project', 'Status', 'Created By', 'Created At'];
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

    const getProjectName = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return project?.name || projectId;
    };

    const clearFilters = () => {
        setSearchQuery('');
        setFilters({});
    };

    if (projectsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-bounce" />
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Procurement Module...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-8xl mx-auto space-y-6">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">Procurement Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage and track procurement requests across all projects.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => handleExportCsv(requests)}>
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Export current view to CSV</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button onClick={() => setCreateModalOpen(true)} size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            New Request
                        </Button>
                    </div>
                </header>

                {/* Stats Cards */}
                <StatsPanel stats={stats} loading={statsLoading} />

                {/* Filters and View Toggles */}
                <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm sticky top-0 z-20 border-b">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by material, project, or creator..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white dark:bg-gray-900"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(f => ({ ...f, status: value === 'all' ? undefined : value }))}>
                                <SelectTrigger className="w-full sm:w-[160px] bg-white dark:bg-gray-900">
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
                            <Select value={filters.projectId || 'all'} onValueChange={(value) => setFilters(f => ({ ...f, projectId: value === 'all' ? undefined : value }))}>
                                <SelectTrigger className="w-full sm:w-[160px] bg-white dark:bg-gray-900">
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
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('table')}>
                                            <List className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Table View</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={viewMode === 'cards' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('cards')}>
                                            <LayoutGrid className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Grid View</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                    {(filters.status || filters.projectId || searchQuery) && (
                        <div className="p-4 border-t flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">Active Filters:</span>
                            {searchQuery && <Badge variant="secondary" className="px-2 py-1">Search: {searchQuery}</Badge>}
                            {filters.status && <Badge variant="secondary" className="px-2 py-1">Status: {filters.status.replace('_', ' ')}</Badge>}
                            {filters.projectId && <Badge variant="secondary" className="px-2 py-1">Project: {getProjectName(filters.projectId)}</Badge>}
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1 text-red-500 hover:text-red-600">
                                <X className="h-4 w-4" /> Clear All
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Requests List */}
                <ProcurementList
                    requests={requests}
                    loading={requestsLoading}
                    viewMode={viewMode}
                    onViewRequest={(request) => {
                        setSelectedRequest(request);
                        setRequestModalOpen(true);
                    }}
                    onClearFilters={clearFilters}
                />

                {hasMore && (
                    <div className="flex justify-center mt-6">
                        <Button onClick={loadMore} disabled={loadingMore || requestsLoading} variant="outline">
                            {loadingMore ? 'Loading More...' : 'Load More'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedRequest && (
                    <ProcurementRequestModal
                        isOpen={isRequestModalOpen}
                        onClose={() => { setRequestModalOpen(false); setSelectedRequest(null); }}
                        request={selectedRequest}
                        onStatusUpdate={handleStatusUpdate}
                        projects={projects}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <CreateProcurementModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                        onSuccess={handleCreateSuccess}
                        projects={projects}
                        createRequest={createRequest}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
