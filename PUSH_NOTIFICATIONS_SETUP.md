# Push Notifications Implementation Guide

## Overview
This guide explains how to implement push notifications for your GramVartha application, replacing SMS with Firebase Cloud Messaging (FCM). Users who scan their village's QR code and log in will receive push notifications for new notices and complaint updates.

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install firebase-admin
```

### 2. Configure Firebase
You need to set up Firebase Admin SDK credentials:

1. **Get Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project (or create one)
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate new private key**
   - Save the JSON file

2. **Add to Environment Variables:**
   - Add the JSON content to your `.env` file as `FIREBASE_SERVICE_ACCOUNT`:
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
   ```
   - Or set it as a JSON string without line breaks

### 3. Updated Files

#### Models - [backend/models/Citizens.js](backend/models/Citizens.js)
- Added `pushTokens` array to store user's push tokens

#### Services
- **[backend/service/pushNotificationService.js](backend/service/pushNotificationService.js)** (NEW)
  - Handles Firebase Cloud Messaging
  - `sendPushNotification()` - Send to specific tokens
  - `notifyVillageCitizens()` - Broadcast to all village citizens

- **[backend/service/notificationService.js](backend/service/notificationService.js)** (UPDATED)
  - Replaced SMS with push notifications
  - `notifyNewNotice()` - Triggered when notice posted
  - `notifyComplaintResolved()` - Triggered when complaint resolved
  - `notifyComplaintRejected()` - Triggered when complaint rejected

#### Controllers - [backend/controllers/citizenAuth.js](backend/controllers/citizenAuth.js)
- Added `registerPushToken()` endpoint for token registration

#### Routes - [backend/routes/citizenAuth.js](backend/routes/citizenAuth.js)
- Added POST `/auth/register-push-token` endpoint

#### Notice Controller - [backend/controllers/noticeController.js](backend/controllers/noticeController.js)
- Updated `uploadNotice()` to send push notifications instead of SMS

---

## Mobile App Setup

### 1. Install Dependencies
The required packages are already in `package.json`:
- `expo-notifications` - For push notifications
- `expo-device` - To check if device supports notifications
- `expo-constants` - For project configuration

### 2. Configure EAS (Expo Application Services)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Initialize EAS in your project:**
   ```bash
   cd CitizenNoticeApp
   eas init
   ```
   - This creates `eas.json` configuration file

3. **Add project ID to app.json:**
   The EAS setup will add a `projectId` to your `app.json` file in the `expo.extra` section

4. **Link Firebase Project:**
   - In [Firebase Console](https://console.firebase.google.com), go to Project Settings
   - Copy your project ID
   - Update EAS configuration with your Firebase details

### 3. Updated Files

#### Utilities - [CitizenNoticeApp/utils/pushNotifications.ts](CitizenNoticeApp/utils/pushNotifications.ts) (NEW)
- `registerForPushNotificationsAsync()` - Request permissions & get token
- `savePushTokenToBackend()` - Send token to backend
- `setupNotificationListeners()` - Handle incoming notifications
- `getOrCreatePushToken()` - Manage token lifecycle

#### Login Screen - [CitizenNoticeApp/app/auth/login.tsx](CitizenNoticeApp/app/auth/login.tsx)
- Added push notification setup on successful login
- Notifications setup is initialized when component mounts

---

## How It Works

### 1. User Registration/Login Flow
```
User logs in → 
  ↓
Request notification permissions → 
  ↓
Get Expo Push Token → 
  ↓
Send token to backend (/auth/register-push-token) → 
  ↓
Token stored in Citizens.pushTokens array
```

### 2. Notice Posted Flow
```
Official posts notice → 
  ↓
Backend fetches all citizens in village → 
  ↓
Collect all their push tokens → 
  ↓
Send FCM message to all tokens → 
  ↓
Users receive notification on their devices
```

### 3. Complaint Status Update Flow
```
Complaint marked resolved/rejected → 
  ↓
Backend fetches citizen's push tokens → 
  ↓
Send notification to their tokens → 
  ↓
User receives notification with complaint details
```

---

## Notification Data Structure

Notifications include the following data:

### Notice Notification
```json
{
  "title": "📢 New Notice Posted",
  "body": "\"Title\" has been published by your Gram Panchayat",
  "data": {
    "type": "notice",
    "villageId": "village_id_here",
    "timestamp": "2026-04-01T10:30:00Z"
  }
}
```

### Complaint Resolved Notification
```json
{
  "title": "✅ Complaint Resolved",
  "body": "Your complaint #ID has been RESOLVED",
  "data": {
    "type": "complaint_resolved",
    "complaintId": "complaint_id_here",
    "timestamp": "2026-04-01T10:30:00Z"
  }
}
```

### Complaint Rejected Notification
```json
{
  "title": "❌ Complaint Rejected",
  "body": "Your complaint #ID was rejected",
  "data": {
    "type": "complaint_rejected",
    "complaintId": "complaint_id_here",
    "reason": "reason_text",
    "timestamp": "2026-04-01T10:30:00Z"
  }
}
```

---

## Testing Notifications

### Test with Backend API
Use Postman or curl to test:

```bash
POST /auth/register-push-token
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "pushToken": "ExponentPushToken[xxxxx...]"
}
```

### Manual Testing
1. Download your app on a real device (tests won't work on emulator)
2. Log in with your account
3. Grant notification permissions when prompted
4. Post a notice as an official for the same village
5. Check if notification appears on the device

---

## Troubleshooting

### No Notifications Received
1. **Check Firebase Configuration:**
   - Verify `FIREBASE_SERVICE_ACCOUNT` is set in `.env`
   - Ensure Firebase project credentials are correct

2. **Check Token Registration:**
   - Verify token was sent to backend via `/auth/register-push-token`
   - Check database to see if `pushTokens` array contains tokens

3. **Check Permissions:**
   - Ensure user granted notification permissions on device
   - Check OS-level notification settings

4. **Check Logs:**
   - Backend: `console.log` statements show notification status
   - Mobile: Check Expo app logs for token issues

### Tokens Not Being Stored
- Ensure user is logged in before posting notice
- Check that `Citizens.pushTokens` field was added to the database model
- Restart backend service after model changes

### Firebase Admin SDK Errors
- Verify environment variable format (single line JSON)
- Check Firebase project still has active credentials
- Ensure Firebase billing is enabled for FCM

---

## Environment Variables (.env)

```env
# Firebase Admin SDK (from Firebase Console)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

# Other existing variables remain unchanged
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
# ... rest of variables
```

---

## Next Steps

1. **Install Firebase Admin SDK** in backend
2. **Get Firebase credentials** from Firebase Console
3. **Add credentials** to `.env` file
4. **Run backend** with `npm start` or `npm run dev`
5. **Test on physical device** (not emulator)
6. **Monitor logs** for "✅ Push notification sent" messages

---

## Migration from SMS

All SMS functionality has been replaced but not removed. To fully remove SMS:

1. Can keep `backend/service/smsService.js` for backwards compatibility
2. SMS sending is no longer called in any controllers
3. To remove SMS completely, delete the smsService.js file and remove twilio dependency

### Database Migration
No data migration needed. Push tokens are stored separately from phone numbers.

---

## API Reference

### Register Push Token
```
POST /auth/register-push-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "pushToken": "ExponentPushToken[...]"
}

Response:
{
  "message": "Push token registered successfully",
  "tokensCount": 1
}
```

---

## Support Channels

For Firebase issues: [Firebase Documentation](https://firebase.google.com/docs/cloud-messaging)
For Expo notifications: [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
For Project issues: Check GitHub issues or contact development team
