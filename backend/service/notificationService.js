const { sendSMS } = require('../service/smsService');

// 1. New notice uploaded → notify ALL citizens
async function notifyNewNotice(citizens, noticeTitle) {
  const message = `📢 Gram Panchayat Notice: "${noticeTitle}" has been uploaded. Visit the portal to read it.`;

  for (const citizen of citizens) {
    await sendSMS(citizen.phone, message);
  }
}

// 2. Complaint resolved → notify THAT citizen
async function notifyComplaintResolved(citizen, complaintId) {
  const message = `✅ Your complaint #${complaintId} has been RESOLVED by Gram Panchayat. Thank you for your patience.`;
  await sendSMS(citizen.phone, message);
}

// 3. Complaint rejected → notify THAT citizen
async function notifyComplaintRejected(citizen, complaintId, reason) {
  const message = `❌ Your complaint #${complaintId} was REJECTED. Reason: ${reason}. Contact the office for more info.`;
  await sendSMS(citizen.phone, message);
}

module.exports = {
  notifyNewNotice,
  notifyComplaintResolved,
  notifyComplaintRejected
};