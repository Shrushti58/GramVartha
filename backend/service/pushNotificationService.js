const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
} catch (e) {
  console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not configured - push notifications disabled');
}

if (Object.keys(serviceAccount).length > 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function sendPushNotification(pushTokens, title, body, data = {}) {
  if (!admin.apps.length || !pushTokens || pushTokens.length === 0) {
    console.log('⚠️ No push tokens or Firebase not initialized');
    return { success: false, message: 'Firebase not configured or no tokens provided' };
  }

  try {
    const message = {
      notification: {
        title: title,
        body: body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      tokens: pushTokens
    };

    const response = await admin.messaging().sendMulticast(message);

    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(pushTokens[idx]);
        }
      });
      console.log(`✅ Push sent to ${response.successCount}/${pushTokens.length} | Failed: ${failedTokens.join(', ')}`);
    } else {
      console.log(`✅ Push notification sent to ${response.successCount} devices`);
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens: response.responses
        .map((r, i) => r.success ? null : pushTokens[i])
        .filter(t => t)
    };
  } catch (err) {
    console.error('❌ Push notification error:', err.message);
    return { success: false, error: err.message };
  }
}

async function notifyVillageCitizens(citizens, title, body, data = {}) {
  const pushTokens = [];
  for (const citizen of citizens) {
    if (citizen.pushTokens && citizen.pushTokens.length > 0) {
      pushTokens.push(...citizen.pushTokens);
    }
  }

  return await sendPushNotification(pushTokens, title, body, data);
}

module.exports = {
  sendPushNotification,
  notifyVillageCitizens
};
