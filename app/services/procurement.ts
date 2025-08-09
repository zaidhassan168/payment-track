/**
 * Client-side service for managing procurement requests
 */
import { ProcurementRequest, ProcurementStats, ProcurementFilters } from '@/types/procurement';
import { API_URL } from "@/app/config/api";

const API_BASE = API_URL ? `${API_URL}/api/procurement` : '/api/procurement';

/**
 * Generic API request handler
 */
async function apiRequest<T>(
    url: string,
    method: string = 'GET',
    body?: any
): Promise<T> {
    try {
        console.log(`Making ${method} request to:`, url);
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            ...(body ? { body: JSON.stringify(body) } : {})
        };

        const response = await fetch(url, {
            ...options,
            cache: 'no-store'
        });
        console.log(`Response status for ${url}:`, response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`API Error for ${url}:`, errorData);
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log(`Success response for ${url}:`, data);
        return data;
    } catch (error) {
        console.error(`Error in ${method} request to ${url}:`, error);
        throw error;
    }
}

/**
 * Get procurement requests with filters and pagination
 */
export async function getProcurementRequests(
    filters: ProcurementFilters = {},
    pageSize: number = 20,
    lastDocId?: string
): Promise<{
    requests: ProcurementRequest[];
    hasMore: boolean;
    lastDocId: string | null;
}> {
    const searchParams = new URLSearchParams();

    if (filters.status) searchParams.set('status', filters.status);
    if (filters.projectId) searchParams.set('projectId', filters.projectId);
    if (filters.createdBy) searchParams.set('createdBy', filters.createdBy);
    searchParams.set('pageSize', pageSize.toString());
    if (lastDocId) searchParams.set('lastDocId', lastDocId);

    return apiRequest(`${API_BASE}?${searchParams.toString()}`);
}

/**
 * Get procurement statistics
 */
export async function getProcurementStats(): Promise<ProcurementStats> {
    console.log('Fetching procurement stats from:', `${API_BASE}/stats`);
    return apiRequest(`${API_BASE}/stats`);
}

/**
 * Get a single procurement request by ID
 */
export async function getProcurementRequestById(id: string): Promise<ProcurementRequest> {
    return apiRequest(`${API_BASE}/${id}`);
}

/**
 * Create a new procurement request
 */
export async function createProcurementRequest(
    data: Omit<ProcurementRequest, 'id' | 'createdAt' | 'updatedAt' | 'managerNotes' | 'statusHistory'>
): Promise<ProcurementRequest> {
    return apiRequest(`${API_BASE}`, 'POST', data);
}

/**
 * Update procurement request status
 */
export async function updateProcurementRequestStatus(
    id: string,
    status: ProcurementRequest['status'],
    changedBy: string,
    changedByName?: string,
    managerNote?: string
): Promise<{ success: boolean }> {
    return apiRequest(`${API_BASE}/${id}`, 'PATCH', {
        status,
        changedBy,
        changedByName,
        managerNote,
    });
}

/**
 * Delete a procurement request
 */
export async function deleteProcurementRequest(id: string): Promise<{ success: boolean }> {
    return apiRequest(`${API_BASE}/${id}`, 'DELETE');
}

/**
 * Get procurement requests by project ID
 */
export async function getProcurementRequestsByProject(
    projectId: string,
    pageSize: number = 20,
    lastDocId?: string
): Promise<{
    requests: ProcurementRequest[];
    hasMore: boolean;
    lastDocId: string | null;
}> {
    return getProcurementRequests({ projectId }, pageSize, lastDocId);
}

/**
 * Get recent procurement requests (last 10 days)
 */
export async function getRecentProcurementRequests(): Promise<ProcurementRequest[]> {
    const { requests } = await getProcurementRequests({}, 50);
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    return requests.filter(request =>
        new Date(request.createdAt) >= tenDaysAgo
    ).slice(0, 20);
}

/**
 * Get procurement projects (from the same database as procurement requests)
 */
export async function getProcurementProjects(): Promise<any[]> {
    console.log('Fetching procurement projects from:', `${API_BASE}/projects`);
    return apiRequest(`${API_BASE}/projects`);
}
