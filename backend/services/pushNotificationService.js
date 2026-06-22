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
  const notificationType = data?.type || "default";

  if (invalidFormatTokens.length > 0) {
    console.warn("[expo-push] Invalid Expo token format skipped", {
      type: notificationType,
      invalidCount: invalidFormatTokens.length,
      invalidTokens: invalidFormatTokens,
    });
  }

  console.log("[expo-push] Sending notification", {
    type: notificationType,
    title,
    tokenCount: allTokens.length,
    validTokenCount: tokens.length,
  });

  if (tokens.length === 0) {
    console.warn("[expo-push] No valid Expo push tokens", {
      type: notificationType,
      providedCount: allTokens.length,
      invalidCount: invalidFormatTokens.length,
    });

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

      console.log("[expo-push] Expo response", {
        type: notificationType,
        status: response.status,
        data: response.data,
      });

      tickets.forEach((ticket, index) => {
        if (ticket.status === "ok") {
          successCount += 1;
          return;
        }

        const failedToken = tokenBatch[index];
        failedTokens.push(failedToken);
        console.error("[expo-push] Ticket failed", {
          error: ticket.details?.error,
          message: ticket.message,
        });

        if (ticket.details?.error === "DeviceNotRegistered") {
          void removeInvalidPushTokens([failedToken]).catch((cleanupError) => {
            console.error("[expo-push] Failed to remove unregistered token", {
              error: cleanupError.message,
            });
          });
        }
      });
    } catch (error) {
      failedTokens.push(...tokenBatch);
      console.error("[expo-push] Expo request failed", {
        type: notificationType,
        title,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    }
  }

  const uniqueFailedTokens = [...new Set(failedTokens)];
  const result = {
    success: successCount > 0,
    successCount,
    failureCount: uniqueFailedTokens.length,
    failedTokens: uniqueFailedTokens,
  };

  console.log("[expo-push] Send result", {
    type: notificationType,
    title,
    successCount: result.successCount,
    failureCount: result.failureCount,
  });

  return result;
}

async function notifyVillageCitizens(citizens, title, body, data = {}) {
  const pushTokens = [];

  for (const citizen of citizens) {
    if (Array.isArray(citizen.pushTokens)) {
      pushTokens.push(...citizen.pushTokens);
    }
  }

  console.log("[notice-push] Citizens and tokens found", {
    citizensFound: citizens.length,
    totalTokens: pushTokens.length,
  });

  const result = await sendPushNotification(pushTokens, title, body, data);

  console.log("[notice-push] Send result", result);

  return result;
}

module.exports = {
  sendPushNotification,
  notifyVillageCitizens,
  removeInvalidPushTokens,
};
