// Procurement Request Types for the payment-track web module
export interface ProcurementRequest {
    id?: string;
    materialName: string;
    imageUrl?: string;
    quantity: string;
    projectId: string;
    projectName: string;
    status:
    | 'pending'
    | 'quantity_checked'
    | 'approved'
    | 'rejected'
    | 'ordered'
    | 'arrived'
    | 'processing'
    | 'shipped';
    createdBy: string; // user ID of the engineer
    createdByName: string; // engineer display name
    createdAt: Date;
    updatedAt: Date;
    managerNotes: ManagerNote[];
    statusHistory: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
    status: ProcurementRequest['status'];
    changedBy: string;
    changedByName?: string;
    changedAt: Date;
}

export interface ManagerNote {
    id: string;
    note: string;
    createdBy: string; // manager user ID
    createdByName: string; // manager display name
    createdAt: Date;
}

export interface ProcurementStats {
    total: number;
    pending: number;
    quantity_checked: number;
    approved: number;
    ordered: number;
    arrived: number;
    rejected: number;
    processing: number;
    shipped: number;
}

export interface ProcurementFilters {
    status?: ProcurementRequest['status'] | 'all';
    projectId?: string;
    createdBy?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
}
