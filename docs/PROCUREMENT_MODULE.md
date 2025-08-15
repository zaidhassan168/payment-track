# Procurement Module for Payment Track Web Application

This procurement module provides a comprehensive web interface for managing procurement requests that were originally created through the PRC Flow mobile application.

## Overview

The procurement module allows users to:
- View all procurement requests in a centralized dashboard
- Track procurement request statuses across the entire workflow
- Update request statuses and add manager notes
- Filter and search through procurement requests
- Monitor procurement statistics and metrics
- Create new procurement requests from the web interface

## Features

### 📊 Dashboard Overview
- Real-time statistics showing total, pending, approved, and ordered requests
- Recent procurement requests with status indicators
- Integration with the main payment-track dashboard

### 🔍 Request Management
- Comprehensive table view with filtering and search capabilities
- Detailed request modal with full information including:
  - Material details and images
  - Project information
  - Status history timeline
  - Manager notes
  - Request creator information

### ⚙️ Status Management
- Update request statuses through the web interface
- Add manager notes when changing statuses
- Complete audit trail of all status changes
- Support for all workflow statuses:
  - `pending` - Initial state when request is created
  - `quantity_checked` - Quantity surveyor has reviewed
  - `approved` - Manager has approved the request
  - `rejected` - Request has been rejected
  - `ordered` - Materials have been ordered
  - `processing` - Order is being processed
  - `shipped` - Materials have been shipped
  - `arrived` - Materials have arrived on site

### 🚀 API Integration
- RESTful API endpoints for all procurement operations
- Firebase Admin SDK integration for secure data access
- Comprehensive error handling and validation
- Pagination support for large datasets

## File Structure

```
app/
├── dashboard/
│   ├── procurement/
│   │   ├── page.tsx                          # Main procurement dashboard
│   │   └── components/
│   │       ├── ProcurementRequestModal.tsx   # Request details modal
│   │       └── CreateProcurementModal.tsx    # Create new request modal
│   └── components/
│       └── ProcurementOverview.tsx           # Dashboard widget
├── api/
│   └── procurement/
│       ├── route.ts                          # Main procurement API endpoints
│       ├── stats/
│       │   └── route.ts                      # Statistics endpoint
│       └── [id]/
│           └── route.ts                      # Single request operations
├── services/
│   └── procurement.ts                        # Client-side service functions
├── types/
│   └── procurement.ts                        # TypeScript type definitions
└── lib/
    └── schemas/
        └── procurement.ts                    # Zod validation schemas
```

## API Endpoints

### GET `/api/procurement`
Retrieve procurement requests with optional filtering and pagination.

**Query Parameters:**
- `status` - Filter by status (optional)
- `projectId` - Filter by project ID (optional)
- `createdBy` - Filter by creator (optional)
- `pageSize` - Number of results per page (default: 20)
- `lastDocId` - For pagination (optional)

**Response:**
```json
{
  "requests": [...],
  "hasMore": boolean,
  "lastDocId": string | null
}
```

### POST `/api/procurement`
Create a new procurement request.

**Request Body:**
```json
{
  "materialName": "string",
  "quantity": "string",
  "projectId": "string",
  "projectName": "string",
  "createdBy": "string",
  "createdByName": "string",
  "imageUrl": "string (optional)"
}
```

### GET `/api/procurement/stats`
Get procurement statistics.

**Response:**
```json
{
  "total": number,
  "pending": number,
  "quantity_checked": number,
  "approved": number,
  "rejected": number,
  "ordered": number,
  "arrived": number,
  "processing": number,
  "shipped": number
}
```

### GET `/api/procurement/[id]`
Get a single procurement request by ID.

### PATCH `/api/procurement/[id]`
Update a procurement request status.

**Request Body:**
```json
{
  "status": "string",
  "changedBy": "string",
  "changedByName": "string (optional)",
  "managerNote": "string (optional)"
}
```

### DELETE `/api/procurement/[id]`
Delete a procurement request.

## Data Model

### ProcurementRequest
```typescript
interface ProcurementRequest {
  id?: string;
  materialName: string;
  imageUrl?: string;
  quantity: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'quantity_checked' | 'approved' | 'rejected' | 'ordered' | 'arrived' | 'processing' | 'shipped';
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  managerNotes: ManagerNote[];
  statusHistory: StatusHistoryEntry[];
}
```

### StatusHistoryEntry
```typescript
interface StatusHistoryEntry {
  status: ProcurementRequest['status'];
  changedBy: string;
  changedByName?: string;
  changedAt: Date;
}
```

### ManagerNote
```typescript
interface ManagerNote {
  id: string;
  note: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}
```

## Database Structure

The procurement module uses the same Firestore collections as the mobile app:

### Collection: `procurementRequests`
- Document ID: Auto-generated
- Fields match the ProcurementRequest interface
- Indexed on: `createdAt`, `status`, `projectId`, `createdBy`

## Authentication & Authorization

The module integrates with the existing payment-track authentication system:
- Uses the same Firebase Admin SDK configuration
- Respects user roles and permissions
- Audit trail tracks all user actions

## UI Components

### Main Dashboard (`page.tsx`)
- Material-UI inspired design using shadcn/ui components
- Responsive grid layout
- Real-time statistics cards
- Advanced filtering and search
- Infinite scroll pagination

### Request Modal (`ProcurementRequestModal.tsx`)
- Comprehensive request details view
- Status update functionality with dropdown
- Manager notes section
- Status history timeline
- Material image display

### Create Modal (`CreateProcurementModal.tsx`)
- Form validation using React Hook Form
- Project selection dropdown
- Image URL input
- Success/error messaging

### Overview Widget (`ProcurementOverview.tsx`)
- Dashboard integration widget
- Mini statistics display
- Recent requests preview
- Quick navigation to full module

## Integration with Existing System

The procurement module seamlessly integrates with the existing payment-track application:

1. **Navigation**: Added to the sidebar with Package icon
2. **Dashboard**: Overview widget appears on main dashboard
3. **Projects**: Links procurement requests to existing projects
4. **Styling**: Uses the same UI component library and theming
5. **Authentication**: Uses existing Clerk authentication
6. **Database**: Uses the same Firebase configuration

## Usage

### Viewing Procurement Requests
1. Navigate to "Procurement" in the sidebar
2. Use filters to narrow down results by status or project
3. Use the search bar to find specific materials or creators
4. Click "View" on any request to see full details

### Updating Request Status
1. Open a request in the detail modal
2. Select a new status from the dropdown
3. Optionally add a manager note
4. Click "Update Request" to save changes

### Creating New Requests
1. Click "New Request" button on the procurement dashboard
2. Fill in material name, quantity, and select a project
3. Optionally add an image URL
4. Specify creator information
5. Click "Create Request" to submit

## Performance Considerations

- **Pagination**: Large datasets are paginated to prevent performance issues
- **Lazy Loading**: Components use React Suspense for better loading experience
- **Optimistic Updates**: UI updates immediately while server processes changes
- **Caching**: Statistics are cached and refreshed periodically
- **Efficient Queries**: Firestore queries are optimized with proper indexing

## Future Enhancements

Potential improvements for the procurement module:

1. **Bulk Operations**: Select multiple requests for batch status updates
2. **Email Notifications**: Send notifications when status changes occur
3. **File Upload**: Direct file upload for material images
4. **Reporting**: Generate PDF reports for procurement activities
5. **Mobile Sync**: Real-time synchronization with mobile app
6. **Approval Workflows**: Configure custom approval workflows per project
7. **Material Catalog**: Pre-defined material catalog with standard quantities
8. **Vendor Integration**: Connect with vendor systems for automated ordering

## Troubleshooting

### Common Issues

1. **Requests not loading**: Check Firebase configuration and permissions
2. **Status updates failing**: Verify user authentication and database rules
3. **Images not displaying**: Confirm image URLs are accessible and valid
4. **Slow performance**: Check Firestore indexes and query optimization

### Development Tips

1. Use the browser developer tools to monitor API calls
2. Check the console for any JavaScript errors
3. Verify Firebase security rules allow the operations
4. Test with different user roles to ensure proper permissions

## Contributing

When contributing to the procurement module:

1. Follow the existing code style and patterns
2. Add proper TypeScript types for new features
3. Include error handling for all API calls
4. Update this documentation for any changes
5. Test all CRUD operations thoroughly
6. Ensure mobile responsiveness
