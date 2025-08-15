import { z } from 'zod';

export const procurementRequestSchema = z.object({
    id: z.string().optional(),
    materialName: z.string().min(1, 'Material name is required'),
    imageUrl: z.string().url().optional(),
    quantity: z.string().min(1, 'Quantity is required'),
    projectId: z.string().min(1, 'Project ID is required'),
    projectName: z.string().min(1, 'Project name is required'),
    status: z.enum([
        'pending',
        'quantity_checked',
        'approved',
        'rejected',
        'ordered',
        'arrived',
        'processing',
        'shipped'
    ]),
    createdBy: z.string().min(1, 'Created by is required'),
    createdByName: z.string().min(1, 'Created by name is required'),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const managerNoteSchema = z.object({
    id: z.string(),
    note: z.string().min(1, 'Note is required'),
    createdBy: z.string().min(1, 'Created by is required'),
    createdByName: z.string().min(1, 'Created by name is required'),
    createdAt: z.date(),
});

export const statusHistorySchema = z.object({
    status: z.enum([
        'pending',
        'quantity_checked',
        'approved',
        'rejected',
        'ordered',
        'arrived',
        'processing',
        'shipped'
    ]),
    changedBy: z.string().min(1, 'Changed by is required'),
    changedByName: z.string().optional(),
    changedAt: z.date(),
});
