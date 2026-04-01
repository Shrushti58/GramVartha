# Push Notifications - API Reference

## Backend API Endpoints

### 1. Register Push Token
**Register a device's push token with the backend**

```
POST /auth/register-push-token
```

**Authentication:** Required (Bearer Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Request Body:**
```json
{
  "pushToken": "ExponentPushToken[xxxxx...]"
}
```

**Success Response (200):**
```json
{
  "message": "Push token registered successfully",
  "tokensCount": 1
}
```

**Error Responses:**

400 - Missing token:
```json
{
  "message": "Push token is required"
}
```

401 - Unauthorized:
```json
{
  "message": "Unauthorized"
}
```

404 - Citizen not found:
```json
{
  "message": "Citizen not found"
}
```

500 - Server error:
```json
{
  "message": "Failed to register push token"
}
```

**Example Usage:**
```bash
curl -X POST http://localhost:5000/auth/register-push-token \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pushToken": "ExponentPushToken[xxxxx...]"
  }'
```

---

## Firebase Cloud Messaging (FCM)

### Notification Structure

All notifications sent through FCM follow this structure:

```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification Body Text"
  },
  "data": {
    "type": "notification_type",
    "timestamp": "2026-04-01T10:30:00.000Z",
    ... additional fields
  },
  "tokens": ["token1", "token2", "token3"]
}
```

---

## Notification Types

### 1. New Notice Posted
**Sent when:** Official creates and publishes a new notice  
**Recipients:** All citizens in the notice's village

**Notification:**
```json
{
  "title": "📢 New Notice Posted",
  "body": "\"Notice Title Here\" has been published by your Gram Panchayat"
}
```

**Data Payload:**
```json
{
  "type": "notice",
  "villageId": "65d8f3a2c1b2e4f5a6b7c8d9",
  "timestamp": "2026-04-01T10:30:00.000Z"
}
```

**Implementation:**
```javascript
// Called from noticeController.js - uploadNotice()
await notifyNewNotice(citizens, title, req.user.village);
```

**Trigger Code (Backend):**
```javascript
// In uploadNotice controller
const citizens = await Citizen.find({ village: req.user.village });
await notifyNewNotice(citizens, title, req.user.village);
```

---

### 2. Complaint Resolved
**Sent when:** Official marks a complaint as resolved  
**Recipients:** The citizen who filed the complaint

**Notification:**
```json
{
  "title": "✅ Complaint Resolved",
  "body": "Your complaint #COMPLAINT_ID has been RESOLVED by Gram Panchayat"
}
```

**Data Payload:**
```json
{
  "type": "complaint_resolved",
  "complaintId": "65d8f3a2c1b2e4f5a6b7c8d9",
  "timestamp": "2026-04-01T10:30:00.000Z"
}
```

**Implementation:**
```javascript
// Called when complaint status updated to "resolved"
await notifyComplaintResolved(citizen, complaintId);
```

---

### 3. Complaint Rejected
**Sent when:** Official rejects a complaint with a reason  
**Recipients:** The citizen who filed the complaint

**Notification:**
```json
{
  "title": "❌ Complaint Rejected",
  "body": "Your complaint #COMPLAINT_ID was REJECTED. Reason: Does not meet criteria"
}
```

**Data Payload:**
```json
{
  "type": "complaint_rejected",
  "complaintId": "65d8f3a2c1b2e4f5a6b7c8d9",
  "reason": "Does not meet criteria",
  "timestamp": "2026-04-01T10:30:00.000Z"
}
```

**Implementation:**
```javascript
// Called when complaint status updated to "rejected"
await notifyComplaintRejected(citizen, complaintId, reason);
```

---

## Mobile Push Notification Utilities

### Function Reference

#### `registerForPushNotificationsAsync()`
**Purpose:** Request notification permissions and get Expo push token  
**Returns:** `Promise<string | null>` - Push token or null if failed

```typescript
const token = await registerForPushNotificationsAsync();
// Returns: "ExponentPushToken[xxxxx...]" or null
```

**What it does:**
1. Checks if running on physical device
2. Requests notification permissions (Android 13+, iOS)
3. Gets push token from Expo servers
4. Returns token to caller

---

#### `savePushTokenToBackend(expoPushToken)`
**Purpose:** Send push token to backend server  
**Parameters:** `expoPushToken: string` - Token to register  
**Returns:** `Promise<any>` - Backend response

```typescript
await savePushTokenToBackend("ExponentPushToken[xxxxx...]");
// Sends to: POST /auth/register-push-token
```

**What it does:**
1. Saves token to local AsyncStorage
2. Sends token to backend via API
3. Returns server response

---

#### `setupNotificationListeners()`
**Purpose:** Setup handlers for incoming notifications  
**Returns:** `Function` - Unsubscribe function

```typescript
const unsubscribe = setupNotificationListeners();
// ... later ...
unsubscribe(); // Cleanup listeners
```

**What it does:**
1. Listens for foreground notifications
2. Listens for notification taps
3. Routes notifications based on type
4. Returns cleanup function

---

#### `getOrCreatePushToken()`
**Purpose:** Get or create push token for device  
**Returns:** `Promise<string | null>` - Push token

```typescript
const token = await getOrCreatePushToken();
// Returns existing token or creates new one
```

**What it does:**
1. Checks if token exists in local storage
2. If not, requests new token from system
3. Registers token with backend
4. Returns token string

---

## Integration Examples

### Example 1: Send Notice Push Notification

**Backend Code (noticeController.js):**
```javascript
const uploadNotice = async (req, res) => {
  // ... notice creation code ...
  
  // Notify citizens after notice is created
  try {
    const citizens = await Citizen.find({
      village: req.user.village
    });
    
    if (citizens && citizens.length > 0) {
      await notifyNewNotice(citizens, title, req.user.village);
      console.log(`📬 Push notifications sent to ${citizens.length} citizens`);
    }
  } catch (notifErr) {
    console.error("Push notification error:", notifErr.message);
  }
  
  res.status(201).json({
    message: "Notice published successfully",
    notice
  });
};
```

---

### Example 2: Setup Notifications on Login

**Mobile Code (login.tsx):**
```typescript
const handleLogin = async () => {
  try {
    // Login request
    const res = await apiService.loginCitizen({ phone, password });
    await AsyncStorage.setItem("token", res.token);
    
    // Setup push notifications AFTER login
    const pushToken = await getOrCreatePushToken();
    if (pushToken) {
      console.log('✅ Push notification setup completed');
    }
    
    // Navigate to home
    router.replace("/complaints/my-complaints");
  } catch (err) {
    console.error('Login failed:', err);
  }
};
```

---

### Example 3: Handle Received Notification

**Mobile Code (pushNotifications.ts):**
```typescript
function handleNotificationTap(notification) {
  const data = notification.request.content.data;
  
  // Route based on notification type
  if (data?.type === 'notice') {
    // Navigate to notice list
    router.push('/notice/index');
  } else if (data?.type === 'complaint_resolved') {
    // Navigate to complaint detail
    router.push(`/complaints/${data.complaintId}`);
  } else if (data?.type === 'complaint_rejected') {
    // Show rejection message
    router.push(`/complaints/${data.complaintId}`);
  }
}
```

---

## Database Schema

### Citizens Collection - Updated Schema

```javascript
{
  _id: ObjectId,
  name: String,
  phone: String (unique),
  password: String (hashed),
  village: ObjectId (ref: Village),
  pushTokens: [String],  // NEW FIELD
  createdAt: Date,
  updatedAt: Date
}
```

**Example Document:**
```json
{
  "_id": "65d8f3a2c1b2e4f5a6b7c8d9",
  "name": "John Doe",
  "phone": "9876543210",
  "password": "$2a$10$...",
  "village": "65d8f3a2c1b2e4f5a6b7c8d0",
  "pushTokens": [
    "ExponentPushToken[sampletoken123]",
    "ExponentPushToken[sampletoken456]"
  ],
  "createdAt": "2026-04-01T10:20:00Z",
  "updatedAt": "2026-04-01T10:30:00Z"
}
```

---

## Error Responses

### Common Error Scenarios

**1. Firebase Not Initialized**
```
Log: ⚠️ Firebase not initialized - push notifications disabled
Result: Notifications silently fail, app continues
```

**2. No Push Tokens**
```
Log: ⚠️ No push tokens or Firebase not initialized
Result: Returns success but no notifications sent
```

**3. Token Already Exists**
```
Code: Returns 200 OK
Result: Token not duplicated, tokensCount unchanged
```

**4. Invalid Token Format**
```json
{
  "message": "Push token is required"
}
```

**5. Firebase Multicast Failure**
```javascript
{
  "success": true,
  "successCount": 2,
  "failureCount": 1,
  "failedTokens": ["ExponentPushToken[oldtoken]"]
}
```

---

## Performance Considerations

### Notification Throttling
- Each citizen can have multiple push tokens (different devices)
- Duplicate tokens are not added to prevent spam
- Firebase handles deduplication automatically

### Database Impact
- `pushTokens` array stored atomically in Citizens document
- No separate collection needed
- Indexes on `village` field for fast queries

### Firebase Quotas
- Free tier: 10,000 messages per day
- Standard: Unlimited (with billing)
- Batch operations use Multicast API (efficient)

---

## Status Codes Reference

| Code | Scenario | Action |
|------|----------|--------|
| 200 | Success | Token registered |
| 400 | Bad request | Missing/invalid token |
| 401 | Unauthorized | Invalid/expired JWT |
| 404 | Not found | Citizen doesn't exist |
| 500 | Server error | Database/Firebase error |

---

## Monitoring & Debugging

### Backend Logs to Watch For

```
✅ Push notification sent to 5 devices
   → Success: 5 tokens reached

⚠️ Firebase not initialized
   → Check FIREBASE_SERVICE_ACCOUNT env var

❌ Push notification error: [error message]
   → Check Firebase credentials and limits

📬 Push notifications sent to 3 citizens
   → Notice notification queue started

📱 Push token registered for citizen [id]
   → Token successfully stored
```

### Client Logs

```
✅ Push notification token obtained: ExponentPushToken[...]
   → Device has valid token

✅ Push token registered with backend
   → Backend received token

📬 Notification received (foreground): [data]
   → App got notification while open

👆 Notification tapped: [data]
   → User interacted with notification
```

---

## Migration Guide (SMS → Push)

### What Changed
- SMS service still exists but not called
- Push notifications are now primary
- No database migration required
- Backwards compatible

### Removed SMS Calls
- `noticeController.js` - No longer sends SMS
- `complaintController.js` - Uses push instead
- `notificationService.js` - Converted to FCM

### Optional Cleanup
```bash
# If removing SMS completely:
rm backend/service/smsService.js
npm uninstall twilio
```

---

## References

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Expo Notifications API](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Expo Router Navigation](https://docs.expo.dev/routing/introduction/)
