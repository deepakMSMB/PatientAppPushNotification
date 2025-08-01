const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// Configuration
const FCM_TOKEN = 'cok5-rUhQM-SeDN_3a6IzH:APA91bG46PX42g_vSGpyMMrsfx3Gg_qESBL0TCdGNUtdtjcZll76S0RbqEMqX3uBxZPgOl_EabkOWBpa4vSL0inr2hhaY-ecw-6isfcZQNlnKqZMsXc9ltE'; // Your actual FCM token from app
const FCM_PROJECT_ID = 'patientapppushnotification'; // Your Firebase project ID
const API_BASE_URL = 'https://dev.api.doctorondial.com'; // Your API base URL

// Load service account credentials from file
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account-key.json');

// FCM V1 API endpoint
const FCM_V1_URL = `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`;

// Initialize Google Auth
let auth;

try {
  const serviceAccountCredentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
  auth = new GoogleAuth({
    credentials: serviceAccountCredentials,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging']
  });
  console.log('✅ Service account credentials loaded successfully');
} catch (error) {
  console.error('❌ Error loading service account credentials:', error.message);
  console.log('Please ensure service-account-key.json exists in the project root');
  process.exit(1);
}

// Function to get patient details from dashboard API
async function getPatientDetails(authToken) {
  try {
    const response = await axios.get(`${API_BASE_URL}/patients/dashboard`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.data.success && response.data.data.patientDetails) {
      return response.data.data.patientDetails;
    } else {
      console.log('⚠️ No patient details found in dashboard response');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching patient details:', error.response?.data || error.message);
    return null;
  }
}

// Function to get access token
async function getAccessToken() {
  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    return accessToken.token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Function to send a personalized notification using FCM V1 API
async function sendPersonalizedNotification(title, body, data = {}, token = FCM_TOKEN, authToken = null) {
  // Get patient details if auth token is provided
  let patientName = 'Patient';
  if (authToken) {
    const patientDetails = await getPatientDetails(authToken);
    if (patientDetails) {
      patientName = `${patientDetails.relation_first_name} ${patientDetails.relation_sur_name}`.trim();
      console.log(`👤 Using patient name: ${patientName}`);
    }
  }

  // Personalize the notification
  const personalizedTitle = title.replace('{patientName}', patientName);
  const personalizedBody = body.replace('{patientName}', patientName);

  const message = {
    message: {
      token: token,
      notification: {
        title: personalizedTitle,
        body: personalizedBody
      },
      data: {
        ...data,
        patientName: patientName
      },
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
    }
  };

  try {
    // Get fresh access token
    const accessToken = await getAccessToken();
    
    const response = await axios.post(FCM_V1_URL, message, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ Personalized FCM notification sent: ${personalizedTitle}`);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to send personalized FCM notification: ${personalizedTitle}`);
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Function to send a single notification using FCM V1 API (legacy function)
async function sendNotification(title, body, data = {}, token = FCM_TOKEN) {
  const message = {
    message: {
      token: token,
      notification: {
        title: title,
        body: body
      },
      data: data,
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
    }
  };

  try {
    // Get fresh access token
    const accessToken = await getAccessToken();
    
    const response = await axios.post(FCM_V1_URL, message, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ FCM notification sent: ${title}`);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to send FCM notification: ${title}`);
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Function to send topic notification
async function sendTopicNotification(title, body, data = {}, topic = 'patient-updates') {
  const message = {
    message: {
      topic: topic,
      notification: {
        title: title,
        body: body
      },
      data: data,
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
    }
  };

  try {
    // Get fresh access token
    const accessToken = await getAccessToken();
    
    const response = await axios.post(FCM_V1_URL, message, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ Topic notification sent to ${topic}: ${title}`);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to send topic notification to ${topic}: ${title}`);
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Personalized test notification payloads
const personalizedTestNotifications = [
  {
    title: 'Welcome {patientName}!',
    body: 'Welcome to Patient App, {patientName}! Your account has been set up successfully.',
    data: { 
      type: 'welcome', 
      userId: '12345',
      deepLink: 'patientapppushnotification://profile'
    }
  },
  {
    title: 'Appointment Reminder for {patientName}',
    body: 'Hi {patientName}, you have an appointment tomorrow at 2:00 PM with Dr. Smith.',
    data: { 
      type: 'appointment', 
      appointmentId: 'apt_001', 
      time: '14:00',
      deepLink: 'patientapppushnotification://appointments/apt_001'
    }
  },
  {
    title: 'Health Update for {patientName}',
    body: '{patientName}, your lab results are ready. Tap to view your latest health report.',
    data: { 
      type: 'health_update', 
      reportId: 'lab_123',
      deepLink: 'patientapppushnotification://reports/lab_123'
    }
  },
  {
    title: 'Medication Reminder - {patientName}',
    body: 'Time for your medication, {patientName}. Please take your prescribed dose now.',
    data: { 
      type: 'medication_reminder', 
      medicationId: 'med_001',
      deepLink: 'patientapppushnotification://medications/med_001'
    }
  }
];

// Function to send all personalized test notifications
async function sendAllPersonalizedNotifications(authToken) {
  console.log('🚀 Starting personalized FCM notification tests...\n');
  
  for (let i = 0; i < personalizedTestNotifications.length; i++) {
    const notification = personalizedTestNotifications[i];
    console.log(`📱 Sending personalized FCM notification ${i + 1}/${personalizedTestNotifications.length}: ${notification.title}`);
    
    try {
      await sendPersonalizedNotification(notification.title, notification.body, notification.data, FCM_TOKEN, authToken);
      
      // Wait 2 seconds between notifications
      if (i < personalizedTestNotifications.length - 1) {
        console.log('⏳ Waiting 2 seconds before next notification...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Failed to send personalized FCM notification ${i + 1}`);
    }
  }
  
  console.log('\n✅ All personalized FCM test notifications completed!');
}

// Function to send all test notifications (legacy)
async function sendAllTestNotifications() {
  console.log('🚀 Starting FCM notification tests...\n');
  
  const testNotifications = [
    {
      title: 'Welcome to Patient App',
      body: 'Welcome! Your account has been set up successfully.',
      data: { 
        type: 'welcome', 
        userId: '12345',
        deepLink: 'patientapppushnotification://profile'
      }
    },
    {
      title: 'Appointment Reminder',
      body: 'You have an appointment tomorrow at 2:00 PM with Dr. Smith.',
      data: { 
        type: 'appointment', 
        appointmentId: 'apt_001', 
        time: '14:00',
        deepLink: 'patientapppushnotification://appointments/apt_001'
      }
    },
    {
      title: 'Test FCM Notification',
      body: 'This is a test FCM notification with deep linking support.',
      data: { 
        type: 'test', 
        timestamp: Date.now().toString(),
        deepLink: 'patientapppushnotification://notifications'
      }
    },
    {
      title: 'Health Update',
      body: 'Your lab results are ready. Tap to view.',
      data: { 
        type: 'health_update', 
        reportId: 'lab_123',
        deepLink: 'patientapppushnotification://reports/lab_123'
      }
    }
  ];
  
  for (let i = 0; i < testNotifications.length; i++) {
    const notification = testNotifications[i];
    console.log(`📱 Sending FCM notification ${i + 1}/${testNotifications.length}: ${notification.title}`);
    
    try {
      await sendNotification(notification.title, notification.body, notification.data);
      
      // Wait 2 seconds between notifications
      if (i < testNotifications.length - 1) {
        console.log('⏳ Waiting 2 seconds before next notification...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Failed to send FCM notification ${i + 1}`);
    }
  }
  
  console.log('\n✅ All FCM test notifications completed!');
}

// Function to send topic notifications
async function sendTopicNotifications() {
  console.log('🚀 Starting topic notification tests...\n');
  
  const topicNotifications = [
    {
      title: 'General Health Update',
      body: 'Important health information for all patients.',
      data: { type: 'general_update', deepLink: 'patientapppushnotification://notifications' }
    },
    {
      title: 'Appointment System Update',
      body: 'New appointment booking features are now available.',
      data: { type: 'system_update', deepLink: 'patientapppushnotification://appointments' }
    }
  ];

  for (let i = 0; i < topicNotifications.length; i++) {
    const notification = topicNotifications[i];
    console.log(`📱 Sending topic notification ${i + 1}/${topicNotifications.length}: ${notification.title}`);
    
    try {
      await sendTopicNotification(notification.title, notification.body, notification.data);
      
      // Wait 2 seconds between notifications
      if (i < topicNotifications.length - 1) {
        console.log('⏳ Waiting 2 seconds before next notification...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Failed to send topic notification ${i + 1}`);
    }
  }
  
  console.log('\n✅ All topic notifications completed!');
}

// Function to send a custom notification
async function sendCustomNotification(title, body, data = {}, token = FCM_TOKEN) {
  console.log(`📱 Sending custom FCM notification: ${title}`);
  return await sendNotification(title, body, data, token);
}

// Function to send a custom personalized notification
async function sendCustomPersonalizedNotification(title, body, data = {}, token = FCM_TOKEN, authToken = null) {
  console.log(`📱 Sending custom personalized FCM notification: ${title}`);
  return await sendPersonalizedNotification(title, body, data, token, authToken);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node backend-test-fcm.js all                                    # Send all test notifications');
    console.log('  node backend-test-fcm.js personalized <auth_token>             # Send personalized notifications');
    console.log('  node backend-test-fcm.js topic                                  # Send topic notifications');
    console.log('  node backend-test-fcm.js custom "Title" "Body"                  # Send custom notification');
    console.log('  node backend-test-fcm.js personalized-custom "Title" "Body" <auth_token>  # Send custom personalized notification');
    console.log('\nMake sure to:');
    console.log('  1. Save your service account JSON as "service-account-key.json" in the project root');
    console.log('  2. Update FCM_TOKEN with your actual FCM token from the app');
    console.log('  3. Provide auth token for personalized notifications');
    return;
  }

  if (FCM_TOKEN === 'YOUR_FCM_TOKEN_HERE') {
    console.error('❌ Please update FCM_TOKEN with your actual FCM token from the app!');
    return;
  }

  const command = args[0];

  if (command === 'all') {
    await sendAllTestNotifications();
  } else if (command === 'personalized') {
    const authToken = args[1];
    if (!authToken) {
      console.error('❌ Please provide auth token for personalized notifications!');
      console.log('Usage: node backend-test-fcm.js personalized <auth_token>');
      return;
    }
    await sendAllPersonalizedNotifications(authToken);
  } else if (command === 'topic') {
    await sendTopicNotifications();
  } else if (command === 'custom') {
    const title = args[1] || 'Custom Notification';
    const body = args[2] || 'This is a custom FCM notification';
    const data = args[3] ? JSON.parse(args[3]) : {};
    
    await sendCustomNotification(title, body, data);
  } else if (command === 'personalized-custom') {
    const title = args[1] || 'Custom Personalized Notification';
    const body = args[2] || 'This is a custom personalized FCM notification';
    const authToken = args[3];
    const data = args[4] ? JSON.parse(args[4]) : {};
    
    if (!authToken) {
      console.error('❌ Please provide auth token for personalized notifications!');
      console.log('Usage: node backend-test-fcm.js personalized-custom "Title" "Body" <auth_token>');
      return;
    }
    
    await sendCustomPersonalizedNotification(title, body, data, FCM_TOKEN, authToken);
  } else {
    console.log('Unknown command. Use "all", "personalized", "topic", "custom", or "personalized-custom"');
  }
}

// Export functions for use in other modules
module.exports = {
  sendNotification,
  sendPersonalizedNotification,
  sendTopicNotification,
  sendAllTestNotifications,
  sendAllPersonalizedNotifications,
  sendTopicNotifications,
  sendCustomNotification,
  sendCustomPersonalizedNotification,
  getPatientDetails
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
} 