const { sendPushNotification, notifyVillageCitizens } = require('./pushNotificationService');

async function notifyNewNotice(citizens, noticeTitle, villageId) {
  const title = '📢 New Notice Posted';
  const body = `"${noticeTitle}" has been published by your Gram Panchayat`;
  const data = {
    type: 'notice',
    villageId: villageId?.toString() || ''
  };

  return await notifyVillageCitizens(citizens, title, body, data);
}

async function notifyComplaintResolved(citizen, complaintId) {
  const title = '✅ Complaint Resolved';
  const body = `Your complaint #${complaintId} has been RESOLVED by Gram Panchayat`;
  const data = {
    type: 'complaint_resolved',
    complaintId: complaintId.toString()
  };

  if (citizen.pushTokens && citizen.pushTokens.length > 0) {
    return await sendPushNotification(citizen.pushTokens, title, body, data);
  }
  return { success: false, message: 'No push tokens for citizen' };
}

async function notifyComplaintRejected(citizen, complaintId, reason) {
  const title = '❌ Complaint Rejected';
  const body = `Your complaint #${complaintId} was REJECTED. Reason: ${reason}`;
  const data = {
    type: 'complaint_rejected',
    complaintId: complaintId.toString(),
    reason: reason
  };

  if (citizen.pushTokens && citizen.pushTokens.length > 0) {
    return await sendPushNotification(citizen.pushTokens, title, body, data);
  }
  return { success: false, message: 'No push tokens for citizen' };
}

module.exports = {
  notifyNewNotice,
  notifyComplaintResolved,
  notifyComplaintRejected
};