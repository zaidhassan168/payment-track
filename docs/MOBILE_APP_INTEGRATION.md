# Mobile App Integration Example

This example shows how to integrate the notification API with your React Native/Expo mobile app.

## 1. Install Required Dependencies

```bash
npm install expo-notifications
```

## 2. Register for Push Notifications

Add this to your app's initialization code:

```javascript
import * as Notifications from 'expo-notifications';
import { updateDoc, doc } from 'firebase/firestore';
import { db, auth } from './firebase-config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications() {
  try {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission for notifications denied');
      return;
    }

    // Get the push token
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;

    console.log('Expo push token:', expoPushToken);

    // Save token to user document in Firestore
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        expoPushToken: expoPushToken,
        lastTokenUpdate: new Date()
      });
      console.log('Push token saved to Firestore');
    }

    return expoPushToken;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }
}
```

## 3. Handle Notification Responses

```javascript
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export function useNotificationHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle notification tap when app is running
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;

      if (data.type === 'procurement_request') {
        // Navigate to the specific procurement request
        navigation.navigate('ProcurementDetail', {
          requestId: data.requestId
        });
      }
    });

    // Handle notification when app is launched from notification
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        const { data } = response.notification.request.content;

        if (data.type === 'procurement_request') {
          // Navigate to the specific procurement request
          navigation.navigate('ProcurementDetail', {
            requestId: data.requestId
          });
        }
      }
    });

    return () => subscription.remove();
  }, [navigation]);
}
```

## 4. Test API Connection

```javascript
// Test function to verify API connectivity
export async function testNotificationAPI() {
  try {
    // Replace with your actual API URL
    const API_URL = 'http://localhost:3000'; // or your production URL

    // Test health check
    const healthResponse = await fetch(`${API_URL}/api/notifications`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);

    // Test user retrieval (replace with actual user UID)
    const testResponse = await fetch(`${API_URL}/api/notifications/test?action=user&uid=YOUR_USER_UID`);
    const testData = await testResponse.json();
    console.log('User test:', testData);

    return { success: true, healthData, testData };
  } catch (error) {
    console.error('API test failed:', error);
    return { success: false, error };
  }
}
```

## 5. Send Test Notification

```javascript
// Function to send a test notification
export async function sendTestNotification(createdByUid) {
  try {
    const API_URL = 'http://localhost:3000'; // Replace with your API URL

    const response = await fetch(`${API_URL}/api/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        createdByUid: createdByUid,
        status: 'pending',
        projectName: 'Test Project from Mobile',
        materialName: 'Test Material',
        requestId: 'mobile-test-' + Date.now()
      }),
    });

    const data = await response.json();
    console.log('Test notification result:', data);
    return data;
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
}
```

## 6. App.js Integration

```javascript
import React, { useEffect } from 'react';
import { registerForPushNotifications, useNotificationHandler } from './notification-utils';

export default function App() {
  // Initialize notifications when app starts
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  // Handle notification responses
  useNotificationHandler();

  return (
    // Your app components
    <YourAppNavigator />
  );
}
```

## 7. User Document Structure

Ensure your user documents in Firestore have this structure:

```javascript
// Example user document in Firestore
{
  uid: "user123",
  displayName: "John Engineer",
  email: "john@example.com",
  role: "engineer", // or "manager" or "quantity_surveyor"
  expoPushToken: "ExponentPushToken[xxxxxxxxxx]", // Added by mobile app
  lastTokenUpdate: "2025-08-03T18:30:00.000Z"
}
```

## 8. Testing Steps

1. **Install and run your mobile app**
2. **Login with a test user**
3. **Ensure the push token is saved to Firestore**
4. **Test the notification API:**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/test \
     -H "Content-Type: application/json" \
     -d '{
       "createdByUid": "YOUR_TEST_USER_UID",
       "status": "pending"
     }'
   ```
5. **Create/update a procurement request in the web app**
6. **Verify notifications are received on mobile**

## 9. Production Configuration

For production, update the API URL in your mobile app:

```javascript
const API_URL = __DEV__
  ? 'http://localhost:3000'  // Development
  : 'https://your-domain.com'; // Production
```

Make sure your production server has the correct EXPO_ACCESS_TOKEN configured.
