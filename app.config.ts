import 'dotenv/config';

export default {
  expo: {
    name: 'PatientAppPushNotification',
    slug: 'patient-app-push-notification',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'patientapppushnotification',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yourcompany.patientapppushnotification',
      buildNumber: '1',
      runtimeVersion: '1.0.0',
      icon: './assets/icon.png',
      googleServicesFile: './google-services/GoogleService-Info.plist',
      infoPlist: {
        UIBackgroundModes: ['remote-notification', 'background-processing'],
        NSCameraUsageDescription: 'This app needs access to your camera to take photos.',
        NSPhotoLibraryUsageDescription:
          'This app needs access to your photo library to pick images.',
        NSPhotoLibraryAddUsageDescription: 'This app needs access to save cropped images.',
        NSUserNotificationsUsageDescription: 'This app needs to send you notifications about your health and appointments.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.yourcompany.patientapppushnotification',
      googleServicesFile: './google-services/google-services.json',
      versionCode: 1,
      runtimeVersion: '1.0.0',
      userInterfaceStyle: 'light',
      softwareKeyboardLayoutMode: 'pan',
      permissions: [
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.VIBRATE',
        'android.permission.WAKE_LOCK',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE'
      ]
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      apiUrl: process.env.API_URL,
      env: process.env.ENV,
    },
    plugins: [
      ['expo-router'],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#ffffff',
          image: './assets/splash-icon.png',
          imageResizeMode: 'contain',
          imageWidth: 200,
        },
      ],
      [
        '@react-native-firebase/app',
        {
          ios: {
            googleServicesFile: './google-services/GoogleService-Info.plist',
          },
          android: {
            googleServicesFile: './google-services/google-services.json',
          },
        },
      ],
      [
        '@react-native-firebase/messaging',
        {
          ios: {
            googleServicesFile: './google-services/GoogleService-Info.plist',
          },
          android: {
            googleServicesFile: './google-services/google-services.json',
          },
        },
      ],
    ],
    privacy: 'public',
    analytics: {
      enabled: false,
    },
  },
}; 