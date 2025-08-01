import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { withFCMPushNotifications } from '../components/FCMPushNotificationHOC';
import { APIProvider } from '../api/common/APIProvider';
import { AuthProvider } from '../components/AuthProvider';
import { View, Text, ActivityIndicator } from 'react-native';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10, fontSize: 16 }}>Loading...</Text>
    </View>
  );
}

function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="appointments" options={{ title: 'Appointments' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
    </Stack>
  );
}

// Create the wrapped component
const RootLayoutWithFCM = withFCMPushNotifications(RootLayout);

// Wrap the entire app with providers in the correct order
function AppWithProviders() {
  return (
    <APIProvider>
      <AuthProvider>
        <RootLayoutWithFCM />
      </AuthProvider>
    </APIProvider>
  );
}

export default AppWithProviders; 