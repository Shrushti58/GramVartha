const axios = require("axios");
const Citizens = require("../models/Citizens");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_PUSH_BATCH_SIZE = 100;

function isExpoPushToken(token) {
  return /^Expo(nent)?PushToken\[[\w-]+\]$/.test(token);
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function removeInvalidPushTokens(tokens) {
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  if (uniqueTokens.length === 0) return;

  await Citizens.updateMany(
    { pushTokens: { $in: uniqueTokens } },
    { $pull: { pushTokens: { $in: uniqueTokens } } }
  );
}

async function sendPushNotification(pushTokens, title, body, data = {}) {
  const allTokens = pushTokens || [];
  const tokens = [...new Set(allTokens.filter(isExpoPushToken))];
  const invalidFormatTokens = allTokens.filter((token) => !isExpoPushToken(token));

  if (invalidFormatTokens.length > 0) {
    await removeInvalidPushTokens(invalidFormatTokens);
  }

  if (tokens.length === 0) {
    return {
      success: false,
      message: "No valid Expo push tokens provided",
      successCount: 0,
      failureCount: invalidFormatTokens.length,
      failedTokens: invalidFormatTokens,
    };
  }

  let successCount = 0;
  const failedTokens = [...invalidFormatTokens];

  for (const tokenBatch of chunk(tokens, EXPO_PUSH_BATCH_SIZE)) {
    const messages = tokenBatch.map((to) => ({
      to,
      sound: "default",
      title,
      body,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      channelId:
        data?.type === "notice"
          ? "notices"
          : data?.type === "complaint_resolved" || data?.type === "complaint_rejected"
          ? "complaints"
          : "default",
      priority: "high",
    }));

    try {
      const response = await axios.post(EXPO_PUSH_URL, messages, {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      const tickets = Array.isArray(response.data?.data) ? response.data.data : [];

      tickets.forEach((ticket, index) => {
        if (ticket.status === "ok") {
          successCount += 1;
          return;
        }

        const failedToken = tokenBatch[index];
        failedTokens.push(failedToken);

        if (ticket.details?.error === "DeviceNotRegistered") {
          void removeInvalidPushTokens([failedToken]);
        }
      });
    } catch (error) {
      failedTokens.push(...tokenBatch);
      console.error("Expo push notification error:", error.response?.data || error.message);
    }
  }

  const uniqueFailedTokens = [...new Set(failedTokens)];

  return {
    success: successCount > 0,
    successCount,
    failureCount: uniqueFailedTokens.length,
    failedTokens: uniqueFailedTokens,
  };
}

async function notifyVillageCitizens(citizens, title, body, data = {}) {
  const pushTokens = [];

  for (const citizen of citizens) {
    if (Array.isArray(citizen.pushTokens)) {
      pushTokens.push(...citizen.pushTokens);
    }
  }

  return sendPushNotification(pushTokens, title, body, data);
}

module.exports = {
  sendPushNotification,
  notifyVillageCitizens,
  removeInvalidPushTokens,
};
