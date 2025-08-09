"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getProcurementStats,
    getProcurementProjects,
    getProcurementRequests,
    updateProcurementRequestStatus as apiUpdateStatus,
    createProcurementRequest as apiCreateRequest,
} from '@/app/services/procurement';
import { ProcurementRequest, ProcurementStats, ProcurementFilters } from '@/types/procurement';
import { Project } from '@/types';
import { showSuccessToast, showErrorToast } from '@/lib/taost-utils';

/**
 * Hook to fetch and manage procurement statistics.
 * Caches the stats to avoid redundant API calls.
 */
export function useProcurementStats() {
    const [stats, setStats] = useState<ProcurementStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const statsData = await getProcurementStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error loading procurement stats:', error);
            showErrorToast('Failed to load procurement statistics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, refreshStats: fetchStats };
}


/**
 * Hook to fetch and manage procurement-related projects.
 * Caches the project list.
 */
export function useProcurementProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            const projectsData = await getProcurementProjects();
            setProjects(projectsData);
        } catch (error) {
            console.error('Error loading projects:', error);
            showErrorToast('Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return { projects, loading };
}


/**
 * A comprehensive hook to manage procurement requests, including fetching,
 * filtering, searching, pagination, and status updates.
 */
export function useProcurementRequests(initialFilters: ProcurementFilters = {}) {
    const [requests, setRequests] = useState<ProcurementRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filters, setFilters] = useState<ProcurementFilters>(initialFilters);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [lastDocId, setLastDocId] = useState<string | null>(null);

    const fetchRequests = useCallback(async (reset = false) => {
        setLoading(true);
        try {
            const { requests: newRequests, hasMore: moreAvailable, lastDocId: newLastDocId } =
                await getProcurementRequests(filters, 20, reset ? undefined : lastDocId || undefined);

            setRequests(prev => (reset ? newRequests : [...prev, ...newRequests]));
            setHasMore(moreAvailable);
            setLastDocId(newLastDocId);
        } catch (error) {
            showErrorToast('Failed to load procurement requests');
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, lastDocId]);

    // Effect for initial load and filter changes
    useEffect(() => {
        fetchRequests(true);
    }, [filters]);

    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        fetchRequests(false);
    }, [hasMore, loadingMore, fetchRequests]);

    const filteredRequests = useMemo(() => {
        if (!searchQuery) {
            return requests;
        }
        const query = searchQuery.toLowerCase();
        return requests.filter(req =>
            (req.materialName?.toLowerCase().includes(query)) ||
            (req.projectName?.toLowerCase().includes(query)) ||
            (req.createdByName?.toLowerCase().includes(query))
        );
    }, [requests, searchQuery]);

    const updateStatus = async (requestId: string, newStatus: ProcurementRequest['status'], managerNote?: string) => {
        try {
            await apiUpdateStatus(requestId, newStatus, 'web-user', 'Web User', managerNote);
            showSuccessToast('Status updated successfully');
            fetchRequests(true); // Refetch the list
            return true;
        } catch (error) {
            showErrorToast('Failed to update status');
            console.error('Error updating status:', error);
            return false;
        }
    };

    const createRequest = async (data: Omit<ProcurementRequest, 'id' | 'createdAt' | 'updatedAt' | 'managerNotes' | 'statusHistory'>) => {
        try {
            await apiCreateRequest(data);
            showSuccessToast('Request created successfully');
            fetchRequests(true); // Refetch the list
            return true;
        } catch (error) {
            showErrorToast('Failed to create request');
            console.error('Error creating request:', error);
            return false;
        }
    };

    const refresh = () => {
        fetchRequests(true);
    }

    return {
        requests: filteredRequests,
        loading,
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
    };
}
