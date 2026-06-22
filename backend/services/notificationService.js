const { sendPushNotification, notifyVillageCitizens } = require("./pushNotificationService");

async function notifyNewNotice(citizens, noticeTitle, villageId) {
  const title = "New Notice Posted";
  const body = `"${noticeTitle}" has been published by your Gram Panchayat`;
  const data = {
    type: "notice",
    villageId: villageId?.toString() || "",
  };

  return notifyVillageCitizens(citizens, title, body, data);
}

async function notifyComplaintResolved(citizen, complaintId) {
  const title = "Complaint Resolved";
  const body = `Your complaint #${complaintId} has been RESOLVED by Gram Panchayat`;
  const data = {
    type: "complaint_resolved",
    complaintId: complaintId.toString(),
  };

  console.log("[complaint-push] Notification triggered", {
    type: data.type,
    citizenId: citizen?._id,
    tokenCount: citizen?.pushTokens?.length || 0,
  });

  if (citizen.pushTokens && citizen.pushTokens.length > 0) {
    return sendPushNotification(citizen.pushTokens, title, body, data);
  }

  return { success: false, message: "No push tokens for citizen" };
}

async function notifyComplaintRejected(citizen, complaintId, reason) {
  const title = "Complaint Rejected";
  const body = `Your complaint #${complaintId} was REJECTED. Reason: ${reason}`;
  const data = {
    type: "complaint_rejected",
    complaintId: complaintId.toString(),
    reason,
  };

  console.log("[complaint-push] Notification triggered", {
    type: data.type,
    citizenId: citizen?._id,
    tokenCount: citizen?.pushTokens?.length || 0,
  });

  if (citizen.pushTokens && citizen.pushTokens.length > 0) {
    return sendPushNotification(citizen.pushTokens, title, body, data);
  }

  return { success: false, message: "No push tokens for citizen" };
}

async function notifyComplaintStatusUpdated(citizen, complaintId, status) {
  const readableStatus = status.replace("-", " ");
  const title = "Complaint Status Updated";
  const body = `Your complaint #${complaintId} is now ${readableStatus}`;
  const data = {
    type: "complaint_status_updated",
    complaintId: complaintId.toString(),
    status,
  };

  console.log("[complaint-push] Notification triggered", {
    type: data.type,
    citizenId: citizen?._id,
    tokenCount: citizen?.pushTokens?.length || 0,
  });

  if (citizen.pushTokens && citizen.pushTokens.length > 0) {
    return sendPushNotification(citizen.pushTokens, title, body, data);
  }

  return { success: false, message: "No push tokens for citizen" };
}

module.exports = {
  notifyNewNotice,
  notifyComplaintResolved,
  notifyComplaintRejected,
  notifyComplaintStatusUpdated,
};
