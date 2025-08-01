import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, Alert, AppState, AppStateStatus } from 'react-native';
import messaging from '@react-native-firebase/messaging';

// Types and Interfaces
export interface NotificationData {
  [key: string]: any;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  data?: NotificationData;
  type: 'received' | 'sent';
  messageId?: string;
}

export interface FCMNotificationContextType {
  // Core FCM functionality
  fcmToken: string | undefined;
  notification: any | null;
  isInitialized: boolean;
  
  // Notification management
  notificationHistory: NotificationItem[];
  clearNotificationHistory: () => void;
  
  // Permission management
  getNotificationPermissions: () => Promise<boolean>;
  hasPermission: boolean;
  
  // Topic management
  subscribeToTopic: (topic: string) => Promise<void>;
  unsubscribeFromTopic: (topic: string) => Promise<void>;
  
  // User preferences
  isNotificationsEnabled: boolean;
  toggleNotifications: () => Promise<void>;
}

const MAX_NOTIFICATION_HISTORY = 50;

// Context
const FCMNotificationContext = React.createContext<FCMNotificationContextType | undefined>(undefined);

// Hook for using the context
export const useFCMNotifications = () => {
  const context = React.useContext(FCMNotificationContext);
  if (!context) {
    throw new Error('useFCMNotifications must be used within a FCMNotificationProvider');
  }
  return context;
};

const requestUserPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Main Provider Component
interface FCMNotificationProviderProps {
  children: React.ReactNode;
  // Optional props for customization
  maxHistorySize?: number;
  enableDebugLogs?: boolean;
  onTokenUpdate?: (token: string) => Promise<void>;
  onNotificationReceived?: (notification: NotificationItem) => void;
  onNotificationOpened?: (notification: NotificationItem) => void;
}

export const FCMNotificationProvider: React.FC<FCMNotificationProviderProps> = ({
  children,
  maxHistorySize = MAX_NOTIFICATION_HISTORY,
  enableDebugLogs = false,
  onTokenUpdate,
  onNotificationReceived,
  onNotificationOpened,
}) => {
  // State management
  const [fcmToken, setFcmToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<any | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  
  // Refs
  const appState = useRef(AppState.currentState);
  const prevFCMMessageId = useRef<string | undefined>('');
  const initializationComplete = useRef(false);

  // Debug logging
  const log = useCallback((message: string, data?: any) => {
    if (enableDebugLogs) {
      console.log(`[FCM] ${message}`, data || '');
    }
  }, [enableDebugLogs]);

  // Initialize FCM
  const initializeFCM = useCallback(async () => {
    if (initializationComplete.current) return;
    
    try {
      log('Initializing FCM...');
      
      // Request permission
      const permissionGranted = await requestUserPermission();
      setHasPermission(permissionGranted);
      
      if (!permissionGranted) {
        log('Notification permission denied');
        setIsInitialized(true);
        return;
      }

      // Get FCM token
      const token = await messaging().getToken();
      setFcmToken(token);
      log('FCM Token obtained:', token);

      // Update token on backend if callback provided
      if (onTokenUpdate) {
        try {
          await onTokenUpdate(token);
          log('Token updated on backend successfully');
        } catch (error) {
          log('Failed to update token on backend:', error);
        }
      }

      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        setFcmToken(newToken);
        log('FCM Token refreshed:', newToken);
        
        if (onTokenUpdate) {
          try {
            await onTokenUpdate(newToken);
            log('Refreshed token updated on backend');
          } catch (error) {
            log('Failed to update refreshed token on backend:', error);
          }
        }
      });

      initializationComplete.current = true;
      setIsInitialized(true);
      log('FCM initialization completed');
      
    } catch (error) {
      log('Error initializing FCM:', error);
      setIsInitialized(true);
    }
  }, [log, onTokenUpdate]);

  // Setup notification listeners
  const setupNotificationListeners = useCallback(() => {
    log('Setting up notification listeners...');

    // Handle foreground messages
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      // Prevent duplicate notifications
      if (prevFCMMessageId.current === remoteMessage.messageId) {
        log('Duplicate message ignored:', remoteMessage.messageId);
        return;
      }
      
      prevFCMMessageId.current = remoteMessage.messageId;
      log('Foreground message received:', remoteMessage);
      
      setNotification(remoteMessage);
      
      // Create notification item
      const newNotification: NotificationItem = {
        id: Date.now().toString(),
        title: remoteMessage.notification?.title || 'Notification',
        body: remoteMessage.notification?.body || '',
        timestamp: Date.now(),
        data: remoteMessage.data as NotificationData,
        type: 'received',
        messageId: remoteMessage.messageId,
      };
      
      // Add to history
      setNotificationHistory(prev => [newNotification, ...prev.slice(0, maxHistorySize - 1)]);
      
      // Call custom callback if provided
      if (onNotificationReceived) {
        onNotificationReceived(newNotification);
      }
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      log('Background message received:', remoteMessage);
      
      const newNotification: NotificationItem = {
        id: Date.now().toString(),
        title: remoteMessage.notification?.title || 'Notification',
        body: remoteMessage.notification?.body || '',
        timestamp: Date.now(),
        data: remoteMessage.data as NotificationData,
        type: 'received',
        messageId: remoteMessage.messageId,
      };
      
      setNotificationHistory(prev => [newNotification, ...prev.slice(0, maxHistorySize - 1)]);
      
      if (onNotificationReceived) {
        onNotificationReceived(newNotification);
      }
    });

    // Handle notification open when app is in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      log('Notification opened app:', remoteMessage);
      
      const notificationItem: NotificationItem = {
        id: Date.now().toString(),
        title: remoteMessage.notification?.title || 'Notification',
        body: remoteMessage.notification?.body || '',
        timestamp: Date.now(),
        data: remoteMessage.data as NotificationData,
        type: 'received',
        messageId: remoteMessage.messageId,
      };
      
      if (onNotificationOpened) {
        onNotificationOpened(notificationItem);
      }
    });

    // Handle notification open when app is killed
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          log('Notification opened killed app:', remoteMessage);
          
          const notificationItem: NotificationItem = {
            id: Date.now().toString(),
            title: remoteMessage.notification?.title || 'Notification',
            body: remoteMessage.notification?.body || '',
            timestamp: Date.now(),
            data: remoteMessage.data as NotificationData,
            type: 'received',
            messageId: remoteMessage.messageId,
          };
          
          if (onNotificationOpened) {
            onNotificationOpened(notificationItem);
          }
        }
      });

    return () => {
      unsubscribeForeground();
    };
  }, [log, maxHistorySize, onNotificationReceived, onNotificationOpened]);

  // Setup app state listener
  const setupAppStateListener = useCallback(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        log('App has come to the foreground!');
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [log]);

  // Public methods
  const getNotificationPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const permissionGranted = await requestUserPermission();
      setHasPermission(permissionGranted);
      
      if (!permissionGranted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive important updates.',
          [{ text: 'OK' }]
        );
      }
      
      return permissionGranted;
    } catch (error) {
      log('Error requesting notification permissions:', error);
      return false;
    }
  }, [log]);

  const subscribeToTopic = useCallback(async (topic: string) => {
    try {
      await messaging().subscribeToTopic(topic);
      log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      log(`Error subscribing to topic ${topic}:`, error);
    }
  }, [log]);

  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    try {
      await messaging().unsubscribeFromTopic(topic);
      log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      log(`Error unsubscribing from topic ${topic}:`, error);
    }
  }, [log]);

  const clearNotificationHistory = useCallback(() => {
    setNotificationHistory([]);
    log('Notification history cleared');
  }, [log]);

  const toggleNotifications = useCallback(async () => {
    if (isNotificationsEnabled) {
      setIsNotificationsEnabled(false);
      await messaging().deleteToken();
      log('Notifications disabled');
    } else {
      setIsNotificationsEnabled(true);
      await initializeFCM();
      log('Notifications enabled');
    }
  }, [isNotificationsEnabled, initializeFCM, log]);

  // Effects
  useEffect(() => {
    if (isNotificationsEnabled) {
      initializeFCM();
      const unsubscribe = setupNotificationListeners();
      const appStateUnsubscribe = setupAppStateListener();
      
      return () => {
        unsubscribe();
        appStateUnsubscribe();
      };
    }
  }, [isNotificationsEnabled, initializeFCM, setupNotificationListeners, setupAppStateListener]);

  // Context value
  const value: FCMNotificationContextType = {
    fcmToken,
    notification,
    isInitialized,
    notificationHistory,
    clearNotificationHistory,
    getNotificationPermissions,
    hasPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
    isNotificationsEnabled,
    toggleNotifications,
  };

  return (
    <FCMNotificationContext.Provider value={value}>
      {children}
    </FCMNotificationContext.Provider>
  );
};

// HOC for wrapping components
export const withFCMPushNotifications = <P extends object>(
  Component: React.ComponentType<P>,
  providerProps?: Partial<FCMNotificationProviderProps>
): React.ComponentType<P> => {
  return (props: P) => (
    <FCMNotificationProvider {...providerProps}>
      <Component {...props} />
    </FCMNotificationProvider>
  );
}; 