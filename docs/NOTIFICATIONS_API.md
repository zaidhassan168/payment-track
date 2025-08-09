# Notification API Documentation

This document describes the notification API implemented in the payment-track Next.js application to send push notifications to mobile app users.

## Overview

The notification system sends push notifications to users based on procurement request status changes. It automatically determines the appropriate recipients based on the status and user roles.

## Environment Variables

Add the following environment variable to your `.env` file:

```bash
# Expo Push Notifications
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

You can get your Expo access token from:
1. Go to https://expo.dev/
2. Sign in to your account
3. Go to Account Settings → Access Tokens
4. Create a new token

## API Endpoints

### 1. Send Notification

**Endpoint:** `POST /api/notifications`

**Description:** Sends push notifications to appropriate users based on procurement request status.

**Request Body:**
```json
{
  "requestId": "string",
  "status": "pending|quantity_checked|approved|rejected|ordered|processing|shipped|arrived",
  "projectName": "string",
  "materialName": "string",
  "createdByUid": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications sent successfully",
  "data": {
    "requestId": "string",
    "status": "string",
    "sentCount": 5,
    "errorCount": 0
  }
}
```

**Example Usage:**
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "req123",
    "status": "pending",
    "projectName": "Mall Construction",
    "materialName": "Steel Bars",
    "createdByUid": "user123"
  }'
```

### 2. Health Check

**Endpoint:** `GET /api/notifications`

**Description:** Checks if the notification service is running.

**Response:**
```json
{
  "success": true,
  "message": "Notification service is healthy",
  "data": {
    "timestamp": "2025-08-03T18:30:00.000Z",
    "service": "payment-track-notifications"
  }
}
```

### 3. Test Endpoints

**Endpoint:** `GET /api/notifications/test`

**Description:** Lists available test endpoints.

**Available Test Actions:**

#### Get Users by Role
```bash
GET /api/notifications/test?action=users&role=manager
```

#### Get User by UID
```bash
GET /api/notifications/test?action=user&uid=USER_ID
```

#### Get Recipients for Status
```bash
GET /api/notifications/test?action=recipients&status=pending&createdBy=USER_ID
```

#### Send Test Notification
```bash
POST /api/notifications/test
Content-Type: application/json

{
  "createdByUid": "user123",
  "status": "pending",
  "projectName": "Test Project",
  "materialName": "Test Material"
}
```

## User Roles and Notification Logic

### Pending Status
- **Recipients:** All managers and quantity surveyors
- **Purpose:** Notify that a new request needs review

### Quantity Checked Status
- **Recipients:** All managers + the engineer who created the request
- **Purpose:** Notify that quantity check is complete and manager approval is needed

### Approved/Rejected Status
- **Recipients:** The engineer who created the request
- **Purpose:** Notify about the manager's decision

### Ordered/Processing/Shipped Status
- **Recipients:** The engineer who created the request
- **Purpose:** Keep the engineer informed about order progress

### Arrived Status
- **Recipients:** The engineer who created the request + all managers
- **Purpose:** Notify that materials are ready for pickup

## Database Requirements

### Users Collection

Each user document should have the following structure:

```javascript
{
  uid: "string",
  displayName: "string",
  email: "string",
  role: "manager|quantity_surveyor|engineer",
  expoPushToken: "string" // Required for notifications
}
```

### Procurement Requests Collection

Each procurement request document should have:

```javascript
{
  id: "string",
  materialName: "string",
  projectName: "string",
  status: "pending|quantity_checked|approved|rejected|ordered|processing|shipped|arrived",
  createdBy: "string", // User UID
  createdByName: "string",
  // ... other fields
}
```

## Automatic Integration

The notification system is automatically integrated with the existing procurement APIs:

1. **New Request Creation:** When a new procurement request is created via `POST /api/procurement`, a notification is automatically sent to managers and quantity surveyors.

2. **Status Updates:** When a procurement request status is updated via `PATCH /api/procurement/[id]`, a notification is automatically sent to the appropriate recipients.

## Error Handling

- Notifications that fail to send won't break the main procurement request flow
- Invalid expo push tokens are filtered out automatically
- Detailed error logging is provided for debugging

## Testing

Use the test endpoints to verify your setup:

1. **Check if users exist:**
   ```bash
   GET /api/notifications/test?action=users&role=manager
   ```

2. **Verify a specific user:**
   ```bash
   GET /api/notifications/test?action=user&uid=YOUR_USER_ID
   ```

3. **Test notification sending:**
   ```bash
   POST /api/notifications/test
   {
     "createdByUid": "YOUR_USER_ID",
     "status": "pending"
   }
   ```

## Mobile App Integration

The mobile app should register expo push tokens when users log in and store them in the user's Firestore document under the `expoPushToken` field.

Example mobile app code:
```javascript
import * as Notifications from 'expo-notifications';

// Register for push notifications
const { status } = await Notifications.requestPermissionsAsync();
if (status === 'granted') {
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to user document in Firestore
  await updateDoc(doc(db, 'users', user.uid), {
    expoPushToken: token
  });
}
```

## Troubleshooting

1. **No notifications received:**
   - Verify EXPO_ACCESS_TOKEN is set correctly
   - Check that users have valid expoPushToken values
   - Check server logs for errors

2. **API returns 500 error:**
   - Verify Firebase Admin SDK configuration
   - Check that all required environment variables are set
   - Ensure Firestore collections exist with correct structure

3. **Notifications sent but not received:**
   - Verify expo push tokens are valid
   - Check mobile app notification permissions
   - Test with Expo's push notification tool
