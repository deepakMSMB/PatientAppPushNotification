# Patient App Push Notification

A complete React Native application with Firebase Cloud Messaging (FCM) push notifications, featuring personalized notifications, authentication, and a comprehensive testing suite.

## 🚀 Features

- **🔐 Authentication System** - JWT-based login with secure token storage
- **📱 FCM Push Notifications** - Real-time notifications for all app states
- **👤 Personalized Notifications** - Dynamic content using patient dashboard data
- **🎯 Deep Linking** - Navigate to specific screens via notifications
- **📊 Patient Dashboard** - Display patient information and health data
- **🧪 Testing Suite** - Comprehensive backend testing tools
- **🔄 Real-time Updates** - Background, foreground, and killed state handling
- **🎨 Modern UI** - Clean, responsive interface with loading states

## 📋 Prerequisites

- Node.js (v16 or higher)
- React Native development environment
- Firebase project with FCM enabled
- Backend API with authentication endpoints
- iOS Simulator / Android Emulator or physical device

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd PatientAppPushNotification
npm install
# or
yarn install
```

### 2. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Cloud Messaging (FCM)

#### Download Configuration Files
1. **Android**: Download `google-services.json` and place in `android/app/`
2. **iOS**: Download `GoogleService-Info.plist` and place in `ios/PatientAppPushNotification/`

#### Service Account Setup
1. In Firebase Console, go to Project Settings > Service Accounts
2. Generate new private key
3. Save as `service-account-key.json` in project root

### 3. Environment Configuration

#### Update API URL
Edit `api/common/axios.ts`:
```typescript
const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://dev.api.doctorondial.com';
```

#### Update FCM Token
1. Run the app and get FCM token from home screen
2. Update `FCM_TOKEN` in `backend-test-fcm.js`

### 4. Build and Run

#### iOS
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS
npm run start:ios
# or
yarn start:ios
```

#### Android
```bash
# Run on Android
npm run start:android
# or
yarn start:android
```

## 📱 App Usage

### 1. Authentication
- Open the app and login with your credentials
- JWT tokens are automatically stored and managed
- Session persists across app restarts

### 2. Notification Permissions
- Grant notification permissions when prompted
- View current permission status on home screen
- Request permissions manually if needed

### 3. Testing Notifications

#### Frontend Testing
- **Test Notification**: Send basic FCM notification
- **Personalized Notification**: Send notification with patient name
- **Topic Subscription**: Subscribe to topic-based notifications
- **View History**: Check notifications screen for received messages

#### Backend Testing
```bash
# Send all test notifications
node backend-test-fcm.js all

# Send personalized notifications (requires auth token)
node backend-test-fcm.js personalized <auth_token>

# Send custom notification
node backend-test-fcm.js custom "Title" "Message"

# Send topic notifications
node backend-test-fcm.js topic
```

### 4. Patient Dashboard
- Patient details automatically load after login
- View name, email, mobile, and patient ID
- Data is used for personalized notifications

## 🏗️ Project Structure

```
PatientAppPushNotification/
├── 📁 app/                          # Main app screens
│   ├── _layout.tsx                  # App layout and navigation
│   ├── index.tsx                    # Home screen with patient details
│   ├── login.tsx                    # Authentication screen
│   └── notifications.tsx            # Notification history
├── 📁 components/                   # Reusable components
│   ├── AuthProvider.tsx             # Authentication context
│   └── FCMPushNotificationHOC.tsx  # FCM notification provider
├── 📁 api/                          # API integration
│   ├── auth/                        # Authentication APIs
│   │   ├── useDashboard.ts          # Patient dashboard data
│   │   ├── useLogin.ts              # Login functionality
│   │   └── useFCMToken.ts           # FCM token management
│   └── common/                      # Shared API utilities
│       └── axios.ts                 # HTTP client configuration
├── 📁 utils/                        # Utility functions
│   └── mmkvStore.ts                 # Secure local storage
├── 📁 android/                      # Android-specific files
├── 📁 ios/                          # iOS-specific files
├── 📁 google-services/              # Firebase configuration
├── backend-test-fcm.js              # Backend testing script
├── service-account-key.json         # Firebase service account
└── app.config.ts                    # Expo configuration
```

## 🔧 Key Components

### FCM Notification Provider (`FCMPushNotificationHOC.tsx`)
- **Token Management**: Automatic FCM token refresh and backend sync
- **Notification Handling**: Processes notifications in all app states
- **Personalization**: Replaces `{patientName}` placeholders with actual data
- **Deep Linking**: Handles navigation via notification data
- **History Tracking**: Maintains notification history with deduplication

### Authentication Provider (`AuthProvider.tsx`)
- **JWT Management**: Secure token storage and refresh
- **Session Persistence**: Maintains login state across app restarts
- **API Integration**: Handles authentication with backend

### Dashboard Integration (`useDashboard.ts`)
- **Patient Data**: Fetches and displays patient information
- **Error Handling**: Graceful handling of API failures
- **Loading States**: Provides loading indicators for better UX

## 🔗 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/check-email` - Email validation

### Patient Data
- `GET /patients/dashboard` - Patient dashboard information
- `POST /patients/fcm-token` - Update FCM token

## 📨 Notification Types

### 1. Basic Notifications
```typescript
{
  title: "Welcome to Patient App",
  body: "Your account has been set up successfully.",
  data: { type: "welcome", deepLink: "patientapppushnotification://profile" }
}
```

### 2. Personalized Notifications
```typescript
{
  title: "Hello {patientName}!",
  body: "Welcome back, {patientName}. You have 3 new messages.",
  data: { type: "welcome", deepLink: "patientapppushnotification://notifications" }
}
```

### 3. Appointment Reminders
```typescript
{
  title: "Appointment Reminder for {patientName}",
  body: "Hi {patientName}, your appointment with Dr. Smith is in 30 minutes.",
  data: { type: "appointment", appointmentId: "apt_001" }
}
```

## 🧪 Testing

### Frontend Testing
1. **Permission Testing**: Verify notification permissions work
2. **Token Testing**: Check FCM token generation and display
3. **Notification Testing**: Send test notifications from app
4. **Personalization Testing**: Verify patient name replacement
5. **Deep Link Testing**: Test navigation via notifications

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
- [ ] App launches without errors
- [ ] Login works with valid credentials
- [ ] FCM token is generated and displayed
- [ ] Notification permissions can be granted
- [ ] Test notifications are received
- [ ] Personalized notifications show patient name
- [ ] Deep links navigate to correct screens
- [ ] Notifications work in background/killed state
- [ ] Patient dashboard data loads correctly

## 🐛 Troubleshooting

### Common Issues

#### FCM Token Not Available
```bash
# Check notification permissions
# Verify Firebase configuration
# Ensure internet connectivity
```

#### Patient Details Not Loading
```bash
# Check authentication token
# Verify API endpoint accessibility
# Check network connectivity
```

#### Notifications Not Received
```bash
# Verify FCM token is valid
# Check notification permissions
# Ensure app is not in battery optimization mode
```

#### Backend Testing Fails
```bash
# Verify service-account-key.json exists
# Check FCM_TOKEN is updated
# Ensure auth token is valid for personalized tests
```

### Debug Information
- Check console logs for detailed error messages
- Verify FCM token is being sent to backend
- Ensure all API endpoints are responding correctly
- Test on both iOS and Android platforms

## 📱 Platform-Specific Notes

### iOS
- Requires `GoogleService-Info.plist` in iOS project
- Background modes configured for notifications
- APNs integration for push notifications

### Android
- Requires `google-services.json` in Android project
- Notification channels configured
- Background processing permissions enabled

## 🔄 Development Workflow

1. **Setup**: Configure Firebase and environment
2. **Development**: Use `npm start` for development server
3. **Testing**: Use provided testing scripts
4. **Building**: Use Expo build commands for production
5. **Deployment**: Follow platform-specific deployment guides

## 📄 License

This project is licensed under the MIT License.

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