# Push Notifications - Quick Implementation Checklist

## Backend Setup (5 minutes)

- [ ] Install Firebase Admin SDK
  ```bash
  npm install firebase-admin
  ```

- [ ] Get Firebase Service Account Key from [Firebase Console](https://console.firebase.google.com)
  - Project Settings → Service Accounts → Generate Private Key

- [ ] Add to `.env` file
  ```env
  FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
  ```

- [ ] Verify files were updated:
  - [✓] `backend/models/Citizens.js` - Added `pushTokens` field
  - [✓] `backend/service/pushNotificationService.js` - NEW Firebase service
  - [✓] `backend/service/notificationService.js` - Updated to use push
  - [✓] `backend/controllers/citizenAuth.js` - Added `registerPushToken()`
  - [✓] `backend/routes/citizenAuth.js` - Added push token endpoint
  - [✓] `backend/controllers/noticeController.js` - Sends push on notice
  - [✓] `backend/package.json` - Added firebase-admin

- [ ] Restart backend service
  ```bash
  npm run dev
  ```

---

## Mobile App Setup (5 minutes)

- [ ] Verify dependencies in `CitizenNoticeApp/package.json`:
  - [✓] `expo-notifications` v0.32.16+
  - [✓] `expo-device` v8.0.10+
  - [✓] `expo-constants` v18.0.13+

- [ ] Install EAS CLI (if not already)
  ```bash
  npm install -g eas-cli
  ```

- [ ] Initialize EAS in your project
  ```bash
  cd CitizenNoticeApp
  eas init
  ```

- [ ] Verify files were updated:
  - [✓] `CitizenNoticeApp/utils/pushNotifications.ts` - NEW utility functions
  - [✓] `CitizenNoticeApp/app/auth/login.tsx` - Setup notifications on login

---

## Testing (5 minutes)

### Prerequisites
- Real Android/iOS device (notifications won't work on emulator)
- App installed on device
- User logged in from same village as official creating notices

### Test Steps

1. **Confirm token registration**
   ```bash
   # Check logs for: ✅ Push notification token obtained
   # And: ✅ Push token registered with backend
   ```

2. **Post a notice**
   - Log in as official for a village
   - Create and post a new notice
   - Check backend logs for: `📬 Push notifications sent to X citizens`

3. **Check device notification**
   - Look for notification with:
     - Title: "📢 New Notice Posted"
     - Body: Notice title

4. **Test complaint updates** (optional)
   - Create a complaint
   - Mark it resolved
   - Should receive notification

---

## Verification Checklist

### Backend
- [ ] Firebase Admin SDK installed (`npm list firebase-admin`)
- [ ] `FIREBASE_SERVICE_ACCOUNT` set in `.env`
- [ ] Backend logs show "✅ Push notification sent" when notice posted
- [ ] Database shows `pushTokens` array in Citizens collection

### Mobile App
- [ ] App requests notification permissions on first login
- [ ] Backend logs show token received via `/auth/register-push-token`
- [ ] Notifications appear on device lock screen
- [ ] Tapping notification doesn't crash app

---

## Troubleshooting

### Issue: "Firebase not initialized"
**Solution:** 
- Check `FIREBASE_SERVICE_ACCOUNT` exists in `.env`
- Ensure it's a valid JSON string (no line breaks)
- Restart backend service

### Issue: "No notifications received"
**Solution:**
- Verify `pushTokens` array in database isn't empty
- Check device notification settings allow app notifications
- Test on real device, not emulator
- Check Firebase project has billing enabled

### Issue: "Permission denied for push notifications"
**Solution:**
- App will ask for permission on Android 13+ and iOS
- User must grant permission
- Permission is requested again if previously denied

### Issue: "Invalid token" errors in backend logs
**Solution:**
- Tokens change frequently; this is normal
- System will reject old tokens automatically
- User device must be online to receive notifications

---

## Files Modified/Created

### New Files
- `backend/service/pushNotificationService.js` - Firebase messaging handler
- `CitizenNoticeApp/utils/pushNotifications.ts` - Expo notification client
- `PUSH_NOTIFICATIONS_SETUP.md` - Detailed setup guide

### Modified Files
- `backend/models/Citizens.js` - Added pushTokens array
- `backend/service/notificationService.js` - Use push instead of SMS
- `backend/controllers/citizenAuth.js` - Added registerPushToken()
- `backend/routes/citizenAuth.js` - Added push token route
- `backend/controllers/noticeController.js` - Call notifyNewNotice()
- `backend/package.json` - Added firebase-admin dependency
- `CitizenNoticeApp/app/auth/login.tsx` - Setup notifications on login

---

## What Happens Now

### When User Logs In
```
Login Success
  ↓
Request Notification Permissions
  ↓
Get Expo Push Token
  ↓
Send Token to Backend (/auth/register-push-token)
  ↓
Token Stored in Citizens.pushTokens
```

### When Notice is Posted
```
Official Posts Notice
  ↓
Backend Fetches All Citizens in Village
  ↓
Collects All Their Push Tokens
  ↓
Sends Firebase Message to All Tokens
  ↓
Notifications Appear on User Devices
```

---

## Support

**Complete Setup Guide:** [PUSH_NOTIFICATIONS_SETUP.md](PUSH_NOTIFICATIONS_SETUP.md)

**Firebase Docs:** https://firebase.google.com/docs/cloud-messaging

**Expo Docs:** https://docs.expo.dev/versions/latest/sdk/notifications/

---

**Status:** ✅ Implementation Complete - Ready for Testing
