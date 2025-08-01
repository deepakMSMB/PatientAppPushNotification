import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { useFCMNotifications } from '../components/FCMPushNotificationHOC';
import { router } from 'expo-router';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  data?: any;
  type: 'received' | 'sent';
  topic?: string;
}

export default function NotificationsScreen() {
  const { fcmToken, sendPushNotification, notificationHistory, clearNotificationHistory } = useFCMNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendForegroundNotification = async () => {
    if (!fcmToken) {
      Alert.alert('Error', 'FCM token not available.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPushNotification(
        fcmToken,
        'Foreground FCM Test',
        'This FCM notification should appear while the app is open',
        { 
          type: 'foreground', 
          timestamp: Date.now(),
          deepLink: 'patientapppushnotification://notifications'
        }
      );
      Alert.alert('Success', 'Foreground FCM notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBackgroundNotification = async () => {
    if (!fcmToken) {
      Alert.alert('Error', 'FCM token not available.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPushNotification(
        fcmToken,
        'Background FCM Test',
        'This FCM notification should appear when app is in background',
        { 
          type: 'background', 
          timestamp: Date.now(),
          deepLink: 'patientapppushnotification://appointments'
        }
      );
      Alert.alert('Sent', 'Background FCM notification sent. Put app in background to test.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendDataNotification = async () => {
    if (!fcmToken) {
      Alert.alert('Error', 'FCM token not available.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPushNotification(
        fcmToken,
        'Data-Only FCM Test',
        'This FCM notification contains custom data',
        { 
          type: 'data_only', 
          timestamp: Date.now(),
          userId: '12345',
          appointmentId: 'apt_001',
          deepLink: 'patientapppushnotification://appointments/apt_001'
        }
      );
      Alert.alert('Success', 'Data-only FCM notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendDeepLinkNotification = async () => {
    if (!fcmToken) {
      Alert.alert('Error', 'FCM token not available.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPushNotification(
        fcmToken,
        'Deep Link FCM Test',
        'Tap this notification to navigate to profile',
        { 
          type: 'deep_link', 
          timestamp: Date.now(),
          deepLink: 'patientapppushnotification://profile'
        }
      );
      Alert.alert('Success', 'Deep link FCM notification sent! Tap it to test navigation.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearNotifications = () => {
    clearNotificationHistory();
    Alert.alert('Cleared', 'Notification history cleared.');
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={[styles.notificationType, { color: item.type === 'received' ? '#4CAF50' : '#2196F3' }]}>
          {item.type.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
      <Text style={styles.notificationTime}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      {item.topic && (
        <Text style={styles.notificationTopic}>Topic: {item.topic}</Text>
      )}
      {item.data && Object.keys(item.data).length > 0 && (
        <Text style={styles.notificationData}>
          Data: {JSON.stringify(item.data)}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FCM Notifications</Text>
        <Text style={styles.subtitle}>Test and view FCM push notifications</Text>
      </View>

      <View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>FCM Token:</Text>
        <Text style={styles.tokenText} numberOfLines={3}>
          {fcmToken || 'Not available'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSendForegroundNotification}
          disabled={isLoading || !fcmToken}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send Foreground FCM'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleSendBackgroundNotification}
          disabled={isLoading || !fcmToken}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send Background FCM'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={handleSendDataNotification}
          disabled={isLoading || !fcmToken}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send Data-Only FCM'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSendDeepLinkNotification}
          disabled={isLoading || !fcmToken}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send Deep Link FCM'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClearNotifications}
        >
          <Text style={styles.buttonText}>Clear History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>
          Notification History ({notificationHistory.length})
        </Text>
        {notificationHistory.length > 0 ? (
          <FlatList
            data={notificationHistory}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.notificationList}
          />
        ) : (
          <Text style={styles.emptyText}>No notifications yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  tokenContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
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
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  notificationList: {
    maxHeight: 400,
  },
  notificationItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  notificationType: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  notificationTopic: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 3,
  },
  notificationData: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 3,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
  },
}); 