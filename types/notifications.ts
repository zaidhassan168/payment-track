// Notification types for mobile push notifications
export interface User {
    uid: string;
    displayName: string;
    email: string;
    role: 'manager' | 'quantity_surveyor' | 'engineer';
    expoPushToken?: string;
}

export interface NotificationRequest {
    status: ProcurementRequestStatus;
    projectName: string;
    materialName: string;
    createdByUid: string;
    requestId: string;
}

// Snake case version for API compatibility
export interface NotificationRequestSnakeCase {
    status: ProcurementRequestStatus;
    project_name: string;
    material_name: string;
    created_by_uid: string;
    request_id: string;
}

export interface PushNotificationPayload {
    to: string;
    title: string;
    body: string;
    sound: 'default';
    data: {
        requestId: string;
        status: ProcurementRequestStatus;
        type: 'procurement_request';
        icon: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export type ProcurementRequestStatus =
    | 'pending'
    | 'quantity_checked'
    | 'approved'
    | 'rejected'
    | 'ordered'
    | 'arrived'
    | 'processing'
    | 'shipped';
