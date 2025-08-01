# FCM Push Notification HOC - Complete Guide

A comprehensive, reusable Firebase Cloud Messaging (FCM) push notification component for React Native applications. This HOC provides a complete notification system with duplicate prevention, user preferences, deep linking, and more.

## 🚀 Features

- ✅ **Duplicate Prevention**: Prevents duplicate notifications using message IDs
- ✅ **User Preferences**: Respects user notification settings
- ✅ **Deep Linking**: Handles both custom deep links and reference-based navigation
- ✅ **Topic Management**: Subscribe/unsubscribe to notification topics
- ✅ **Notification History**: Track received and sent notifications
- ✅ **Permission Management**: Handle notification permissions gracefully
- ✅ **Background/Foreground Handling**: Proper handling in all app states
- ✅ **Token Management**: Automatic FCM token refresh and backend sync
- ✅ **TypeScript Support**: Fully typed with comprehensive interfaces
- ✅ **Customizable**: Configurable through props and callbacks
- ✅ **Debug Support**: Optional debug logging for development
- ✅ **Personalized Notifications**: Dynamic content with patient data
- ✅ **Error Handling**: Comprehensive error handling and fallbacks

## 📋 Prerequisites

### Required Dependencies
```bash
npm install @react-native-firebase/messaging
# or
yarn add @react-native-firebase/messaging
```

### Firebase Configuration
1. **Android**: Add `google-services.json` to `android/app/`
2. **iOS**: Add `GoogleService-Info.plist` to your iOS project
3. **Service Account**: Generate and add `service-account-key.json` for backend testing

## 🛠️ Installation & Setup

### 1. Basic Setup

#### Wrap Your App
```tsx
// App.tsx
import { FCMNotificationProvider } from './components/FCMPushNotificationHOC';

export default function App() {
  return (
    <FCMNotificationProvider>
      <YourAppContent />
    </FCMNotificationProvider>
  );
}
```

#### Use in Components
```tsx
// AnyComponent.tsx
import { useFCMNotifications } from './components/FCMPushNotificationHOC';

export function MyComponent() {
  const {
    fcmToken,
    notificationHistory,
    getNotificationPermissions,
    subscribeToTopic,
    isNotificationsEnabled,
    toggleNotifications,
    sendPushNotification,
    sendPersonalizedNotification,
  } = useFCMNotifications();

  const handleSubscribeToUpdates = async () => {
    await subscribeToTopic('app_updates');
  };

  const handleTestNotification = async () => {
    if (fcmToken) {
      await sendPushNotification(
        fcmToken,
        'Test Notification',
        'This is a test notification',
        { type: 'test', deepLink: 'patientapppushnotification://notifications' }
      );
    }
  };

  return (
    <View>
      <Text>FCM Token: {fcmToken}</Text>
      <Button title="Request Permissions" onPress={getNotificationPermissions} />
      <Button title="Toggle Notifications" onPress={toggleNotifications} />
      <Button title="Subscribe to Updates" onPress={handleSubscribeToUpdates} />
      <Button title="Send Test Notification" onPress={handleTestNotification} />
    </View>
  );
}
```

### 2. Advanced Configuration

#### Custom Configuration
```tsx
<FCMNotificationProvider
  maxHistorySize={100}
  enableDebugLogs={__DEV__}
  customDeepLinkHandler={(data) => {
    // Custom deep link handling
    console.log('Custom deep link:', data);
    if (data.customPath) {
      router.push(data.customPath);
    }
  }}
  onTokenUpdate={async (token) => {
    // Update token on your backend
    try {
      await fetch('/api/fcm-token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          fcmToken: token,
          deviceId: getDeviceIdentifier(),
          userId: currentUser.id 
        }),
      });
    } catch (error) {
      console.error('Failed to update token:', error);
    }
  }}
  onNotificationReceived={(notification) => {
    // Custom notification received handler
    console.log('Notification received:', notification);
  }}
  onNotificationOpened={(notification) => {
    // Custom notification opened handler
    console.log('Notification opened:', notification);
  }}
>
  <YourAppContent />
</FCMNotificationProvider>
```

#### Using HOC Pattern
```tsx
import { withFCMPushNotifications } from './components/FCMPushNotificationHOC';

const MyComponent = () => {
  // Your component logic
};

export default withFCMPushNotifications(MyComponent, {
  enableDebugLogs: true,
  maxHistorySize: 50,
});
```

## 📚 API Reference

### FCMNotificationProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | App content to wrap |
| `maxHistorySize` | number | 50 | Maximum number of notifications to keep in history |
| `enableDebugLogs` | boolean | false | Enable debug logging |
| `customDeepLinkHandler` | function | - | Custom deep link handler |
| `onTokenUpdate` | function | - | Callback when FCM token updates |
| `onNotificationReceived` | function | - | Callback when notification received |
| `onNotificationOpened` | function | - | Callback when notification opened |

### useFCMNotifications Hook

#### Core Properties

| Property | Type | Description |
|----------|------|-------------|
| `fcmToken` | string \| undefined | Current FCM token |
| `notification` | any \| null | Latest received notification |
| `isInitialized` | boolean | Whether FCM is initialized |
| `hasPermission` | boolean | Whether notification permission is granted |
| `isNotificationsEnabled` | boolean | Whether notifications are enabled |
| `patientName` | string | Patient name for personalization |

#### Notification Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `notificationHistory` | - | NotificationItem[] | Array of notification history |
| `clearNotificationHistory` | - | void | Clear notification history |

#### Permission Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getNotificationPermissions` | - | Promise<boolean> | Request notification permissions |

#### Topic Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `subscribeToTopic` | topic: string | Promise<void> | Subscribe to notification topic |
| `unsubscribeFromTopic` | topic: string | Promise<void> | Unsubscribe from notification topic |

#### Notification Sending (Development)

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `sendPushNotification` | fcmToken, title, body, data? | Promise<void> | Send test notification |
| `sendPersonalizedNotification` | fcmToken, title, body, data? | Promise<void> | Send personalized notification |

#### User Preferences

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `toggleNotifications` | - | Promise<void> | Toggle notifications on/off |

#### Utilities

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getDeviceIdentifier` | - | string | Get device identifier |

## 🏗️ Types and Interfaces

### NotificationData
```typescript
interface NotificationData {
  referenceId?: string;
  referenceType?: string;
  deepLink?: string;
  type?: string;
  timestamp?: string;
  [key: string]: any;
}
```

### NotificationItem
```typescript
interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  data?: NotificationData;
  type: 'received' | 'sent';
  topic?: string;
  messageId?: string;
}
```

### NotificationReferenceTypes
```typescript
const NOTIFICATION_REFERENCE_TYPES = {
  APPOINTMENT: 'appointment',
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  ORDER_DETAIL: 'orderDetail',
  BACK_IN_STOCK: 'backInStock',
  CUSTOM: 'custom',
} as const;
```

## 🔗 Deep Linking

### Default Deep Link Format
```
patientapppushnotification://appointments/123
patientapppushnotification://profile
patientapppushnotification://notifications
patientapppushnotification://reports/lab_123
```

### Reference-Based Navigation
```typescript
// Notification data structure for reference-based navigation
{
  referenceType: 'appointment',
  referenceId: '123',
  // or
  referenceType: 'profile',
  // or
  referenceType: 'orderDetail',
  referenceId: 'order_456'
}
```

### Custom Deep Link Handler
```tsx
<FCMNotificationProvider
  customDeepLinkHandler={(data) => {
    // Your custom navigation logic
    if (data.customPath) {
      router.push(data.customPath);
    } else if (data.referenceType) {
      // Handle reference-based navigation
      switch (data.referenceType) {
        case 'appointment':
          router.push(`/appointments/${data.referenceId}`);
          break;
        case 'profile':
          router.push('/profile');
          break;
        default:
          router.push('/notifications');
      }
    }
  }}
>
  <YourAppContent />
</FCMNotificationProvider>
```

## 📨 Notification Examples

### 1. Basic Notifications
```typescript
// Simple notification
await sendPushNotification(
  fcmToken,
  'Welcome to Patient App',
  'Your account has been set up successfully.',
  { 
    type: 'welcome', 
    deepLink: 'patientapppushnotification://profile' 
  }
);
```

### 2. Personalized Notifications
```typescript
// Personalized notification with patient name
await sendPersonalizedNotification(
  fcmToken,
  'Hello {patientName}!',
  'Welcome back, {patientName}. You have 3 new messages.',
  { 
    type: 'welcome', 
    deepLink: 'patientapppushnotification://notifications' 
  }
);
```

### 3. Appointment Reminders
```typescript
// Appointment reminder with personalization
await sendPersonalizedNotification(
  fcmToken,
  'Appointment Reminder for {patientName}',
  'Hi {patientName}, your appointment with Dr. Smith is in 30 minutes.',
  { 
    type: 'appointment', 
    appointmentId: 'apt_001',
    deepLink: 'patientapppushnotification://appointments/apt_001'
  }
);
```

### 4. Health Updates
```typescript
// Health update notification
await sendPersonalizedNotification(
  fcmToken,
  'Health Update for {patientName}',
  '{patientName}, your lab results are ready. Tap to view.',
  { 
    type: 'health_update', 
    reportId: 'lab_123',
    deepLink: 'patientapppushnotification://reports/lab_123'
  }
);
```

## 🔧 Backend Integration

### Token Update
```tsx
<FCMNotificationProvider
  onTokenUpdate={async (token) => {
    try {
      await fetch('/api/fcm-token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          fcmToken: token,
          deviceId: getDeviceIdentifier(),
          userId: currentUser.id 
        }),
      });
    } catch (error) {
      console.error('Failed to update token:', error);
    }
  }}
>
  <YourAppContent />
</FCMNotificationProvider>
```

### Sending Notifications (Backend)
```typescript
// Backend example (Node.js)
const admin = require('firebase-admin');

const sendNotification = async (fcmToken, title, body, data = {}) => {
  const message = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      timestamp: Date.now().toString(),
    },
    token: fcmToken,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channel_id: 'default',
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1
        }
      },
      headers: {
        'apns-priority': '10'
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
```

### Personalized Notifications (Backend)
```typescript
// Backend personalized notification
const sendPersonalizedNotification = async (fcmToken, title, body, data = {}, authToken) => {
  // Get patient details from dashboard API
  const patientDetails = await getPatientDetails(authToken);
  const patientName = patientDetails ? 
    `${patientDetails.relation_first_name} ${patientDetails.relation_sur_name}`.trim() : 
    'Patient';

  // Personalize the notification
  const personalizedTitle = title.replace('{patientName}', patientName);
  const personalizedBody = body.replace('{patientName}', patientName);

  const message = {
    notification: {
      title: personalizedTitle,
      body: personalizedBody,
    },
    data: {
      ...data,
      patientName: patientName,
      timestamp: Date.now().toString(),
    },
    token: fcmToken,
  };

  return await admin.messaging().send(message);
};
```

## 🧪 Testing

### Frontend Testing
```typescript
// Test basic notification
const testBasicNotification = async () => {
  if (fcmToken) {
    await sendPushNotification(
      fcmToken,
      'Test Notification',
      'This is a test notification',
      { type: 'test', deepLink: 'patientapppushnotification://notifications' }
    );
  }
};

// Test personalized notification
const testPersonalizedNotification = async () => {
  if (fcmToken && patientName) {
    await sendPersonalizedNotification(
      fcmToken,
      'Hello {patientName}!',
      'This is a personalized test for {patientName}.',
      { type: 'personalized_test', deepLink: 'patientapppushnotification://notifications' }
    );
  }
};

// Test topic subscription
const testTopicSubscription = async () => {
  await subscribeToTopic('app_updates');
  console.log('Subscribed to app_updates topic');
};
```

### Backend Testing
```bash
# Test all notification types
node backend-test-fcm.js all

# Test personalized notifications
node backend-test-fcm.js personalized <auth_token>

# Test custom notifications
node backend-test-fcm.js custom "Custom Title" "Custom Message"

# Test topic notifications
node backend-test-fcm.js topic
```

### Manual Testing Checklist
- [ ] FCM token is generated and displayed
- [ ] Notification permissions can be granted
- [ ] Test notifications are received in foreground
- [ ] Test notifications are received in background
- [ ] Test notifications are received when app is killed
- [ ] Personalized notifications show patient name
- [ ] Deep links navigate to correct screens
- [ ] Topic subscription works correctly
- [ ] Notification history is maintained
- [ ] Token updates are sent to backend

## 🐛 Error Handling

The component includes comprehensive error handling:

### Permission Errors
```typescript
// Graceful permission handling
const handlePermissionRequest = async () => {
  try {
    const granted = await getNotificationPermissions();
    if (granted) {
      console.log('Notification permissions granted');
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in settings to receive updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() }
        ]
      );
    }
  } catch (error) {
    console.error('Permission request failed:', error);
  }
};
```

### Token Refresh Errors
```typescript
// Automatic token refresh with retry
const handleTokenUpdate = async (token) => {
  let retries = 3;
  while (retries > 0) {
    try {
      await updateTokenOnBackend(token);
      break;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('Failed to update token after retries:', error);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
};
```

### Network Errors
```typescript
// Network error handling
const handleNetworkError = (error) => {
  if (error.code === 'NETWORK_ERROR') {
    console.log('Network error, will retry when connection is restored');
    // Implement retry logic
  } else {
    console.error('Unexpected error:', error);
  }
};
```

## 🔍 Debugging

### Enable Debug Logs
```tsx
<FCMNotificationProvider enableDebugLogs={__DEV__}>
  <YourAppContent />
</FCMNotificationProvider>
```

### Debug Information
Debug logs will show:
- FCM initialization steps
- Token updates and refresh attempts
- Notification events (received, opened, etc.)
- Deep link handling
- Error messages and stack traces
- Permission status changes
- Topic subscription events

### Common Debug Commands
```typescript
// Check FCM token
console.log('FCM Token:', fcmToken);

// Check notification history
console.log('Notification History:', notificationHistory);

// Check permission status
console.log('Has Permission:', hasPermission);

// Check if notifications are enabled
console.log('Notifications Enabled:', isNotificationsEnabled);
```

## 📱 Platform-Specific Notes

### iOS
- Requires `GoogleService-Info.plist` in iOS project
- Background modes configured for notifications
- APNs integration for push notifications
- Notification permissions must be requested explicitly

### Android
- Requires `google-services.json` in Android project
- Notification channels configured
- Background processing permissions enabled
- Foreground service for reliable delivery

## 🔄 Best Practices

### 1. Permission Handling
```typescript
// Always request permissions early
useEffect(() => {
  getNotificationPermissions();
}, []);
```

### 2. Token Management
```typescript
// Update backend when token changes
useEffect(() => {
  if (fcmToken) {
    updateTokenOnBackend(fcmToken);
  }
}, [fcmToken]);
```

### 3. Error Handling
```typescript
// Implement proper error handling
const handleNotificationError = (error) => {
  console.error('Notification error:', error);
  // Show user-friendly error message
  Alert.alert('Error', 'Failed to send notification. Please try again.');
};
```

### 4. User Experience
```typescript
// Respect user preferences
const handleNotificationToggle = async () => {
  if (isNotificationsEnabled) {
    // Show confirmation before disabling
    Alert.alert(
      'Disable Notifications',
      'Are you sure you want to disable notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disable', onPress: toggleNotifications }
      ]
    );
  } else {
    await toggleNotifications();
  }
};
```

### 5. Testing
```typescript
// Test all notification states
const testAllNotificationStates = async () => {
  // Test foreground
  await sendTestNotification();
  
  // Test background (put app in background)
  await sendTestNotification();
  
  // Test killed state (force close app)
  await sendTestNotification();
};
```

## 🚀 Migration Guide

### From Previous Version

1. **Remove old imports**: Remove any old FCM-related imports
2. **Update provider**: Replace old provider with new `FCMNotificationProvider`
3. **Update hooks**: Use `useFCMNotifications` instead of old hooks
4. **Test functionality**: Verify all notification features work correctly
5. **Update backend**: Ensure backend integration is compatible

### Breaking Changes
- Hook name changed from `useFCM` to `useFCMNotifications`
- Provider name changed to `FCMNotificationProvider`
- Some method signatures may have changed

## 🐛 Troubleshooting

### Common Issues

#### Notifications Not Received
```bash
# Check Firebase configuration
# Verify notification permissions
# Ensure FCM token is valid
# Check network connectivity
# Verify app is not in battery optimization mode
```

#### Deep Links Not Working
```bash
# Verify deep link configuration in app
# Check notification data structure
# Ensure customDeepLinkHandler is implemented
# Test deep links manually
```

#### Token Not Updating
```bash
# Check backend integration
# Verify network connectivity
# Check authentication token
# Review error logs
```

#### Duplicate Notifications
```bash
# Ensure message IDs are unique
# Check duplicate prevention logic
# Verify notification history management
```

### Debug Steps

1. **Enable debug logs**: `enableDebugLogs={true}`
2. **Check console**: Look for error messages
3. **Verify Firebase**: Ensure configuration is correct
4. **Test platforms**: Test on both iOS and Android
5. **Check permissions**: Verify notification permissions
6. **Review logs**: Check Firebase console logs

## 📄 License

This component is provided as-is for educational and development purposes. Modify as needed for your specific use case.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review Firebase documentation
- Check React Native FCM documentation
- Open an issue in the repository 