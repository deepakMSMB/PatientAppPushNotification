import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useFCMNotifications } from '../components/FCMPushNotificationHOC';
import { clearAllAuthData } from '../utils/mmkvStore';
import { useAuth } from '../components/AuthProvider';
import { useDashboard } from '../api/auth/useDashboard';

export default function HomeScreen() {
  const { fcmToken, sendPushNotification, sendPersonalizedNotification, getNotificationPermissions, subscribeToTopic, unsubscribeFromTopic, patientName } = useFCMNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const { checkAuth } = useAuth();
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboard();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            clearAllAuthData();
            checkAuth();
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    if (!fcmToken) {
      Alert.alert('Error', 'FCM token not available. Please check permissions.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPushNotification(
        fcmToken,
        'Test FCM Notification',
        'This is a test FCM push notification from your app!',
        { type: 'test', timestamp: Date.now(), deepLink: 'patientapppushnotification://notifications' }
      );
      Alert.alert('Success', 'Test FCM notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPersonalizedNotification = async () => {
    if (!fcmToken) {
      Alert.alert('Error', 'FCM token not available. Please check permissions.');
      return;
    }

    if (!patientName || patientName === 'Patient') {
      Alert.alert('Error', 'Patient details not available. Please wait for dashboard data to load.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPersonalizedNotification(
        fcmToken,
        'Hello {patientName}!',
        'This is a personalized test notification for {patientName}.',
        { type: 'personalized_test', timestamp: Date.now(), deepLink: 'patientapppushnotification://notifications' }
      );
      Alert.alert('Success', `Personalized test notification sent to ${patientName}!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send personalized notification: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    try {
      const granted = await getNotificationPermissions();
      if (granted) {
        Alert.alert('Success', 'Notification permissions granted!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request permissions: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToNotifications = () => {
    // This will be handled by the router
  };

  const handleSubscribeToTopic = async () => {
    try {
      await subscribeToTopic('patient-updates');
      Alert.alert('Success', 'Subscribed to patient updates topic!');
    } catch (error) {
      Alert.alert('Error', 'Failed to subscribe to topic: ' + error);
    }
  };

  const handleUnsubscribeFromTopic = async () => {
    try {
      await unsubscribeFromTopic('patient-updates');
      Alert.alert('Success', 'Unsubscribed from patient updates topic!');
    } catch (error) {
      Alert.alert('Error', 'Failed to unsubscribe from topic: ' + error);
    }
  };

  // Get patient name for display
  const getPatientName = () => {
    if (dashboardData?.data?.patientDetails) {
      const { relation_first_name, relation_sur_name } = dashboardData.data.patientDetails;
      return `${relation_first_name} ${relation_sur_name}`.trim();
    }
    return 'Patient';
  };

  // Get patient email for display
  const getPatientEmail = () => {
    return dashboardData?.data?.patientDetails?.patient_email || 'Not available';
  };

  // Get patient mobile for display
  const getPatientMobile = () => {
    const details = dashboardData?.data?.patientDetails;
    if (details) {
      return `${details.patient_country_code} ${details.patient_mobile}`;
    }
    return 'Not available';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Patient App Push Notification</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        {/* Patient Details Section */}
        {isDashboardLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading patient details...</Text>
          </View>
        ) : dashboardError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load patient details</Text>
            <Text style={styles.errorSubtext}>Please try again later</Text>
          </View>
        ) : dashboardData?.data?.patientDetails ? (
          <View style={styles.patientDetailsContainer}>
            <Text style={styles.patientDetailsTitle}>Welcome, {getPatientName()}! 👋</Text>
            <View style={styles.patientInfoRow}>
              <Text style={styles.patientInfoLabel}>Email:</Text>
              <Text style={styles.patientInfoValue}>{getPatientEmail()}</Text>
            </View>
            <View style={styles.patientInfoRow}>
              <Text style={styles.patientInfoLabel}>Mobile:</Text>
              <Text style={styles.patientInfoValue}>{getPatientMobile()}</Text>
            </View>
            <View style={styles.patientInfoRow}>
              <Text style={styles.patientInfoLabel}>Patient ID:</Text>
              <Text style={styles.patientInfoValue}>{dashboardData.data.patientDetails.patient_id}</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.subtitle}>Test your push notification setup</Text>

        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>FCM Token:</Text>
          <Text style={styles.tokenText} numberOfLines={3}>
            {fcmToken || 'Not available'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRequestPermissions}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Requesting...' : 'Request Permissions'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleTestNotification}
            disabled={isLoading || !fcmToken}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.personalizedButton]}
            onPress={handleTestPersonalizedNotification}
            disabled={isLoading || !fcmToken || !patientName || patientName === 'Patient'}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send Personalized Notification'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={handleNavigateToNotifications}
          >
            <Text style={styles.buttonText}>View Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSubscribeToTopic}
          >
            <Text style={styles.buttonText}>Subscribe to Updates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleUnsubscribeFromTopic}
          >
            <Text style={styles.buttonText}>Unsubscribe from Updates</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Testing Instructions:</Text>
          <Text style={styles.infoText}>
            1. Request notification permissions first{'\n'}
            2. Copy the push token above{'\n'}
            3. Send a test notification{'\n'}
            4. Send a personalized notification{'\n'}
            5. Test with app in foreground{'\n'}
            6. Test with app in background{'\n'}
            7. Test with app completely closed
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 5,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
  },
  patientDetailsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientDetailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  patientInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  patientInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  patientInfoValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  tokenContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  tertiaryButton: {
    backgroundColor: '#FF9500',
  },
  personalizedButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
}); 