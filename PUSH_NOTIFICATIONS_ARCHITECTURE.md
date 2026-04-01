# Push Notifications Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GRAMVARTHA SYSTEM                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌──────────────────┐     ┌─────────────┐
│  Mobile App         │       │   Backend Server │     │   Firebase  │
│  (Expo)             │       │   (Express)      │     │   Cloud     │
│                     │       │                  │     │   Messaging │
├─────────────────────┤       ├──────────────────┤     ├─────────────┤
│ Login Screen        │<──────│ /auth/login      │     │             │
│ - Phone + Password  │       │ - Verify user    │     │             │
└─────────────────────┘       └──────────────────┘     └─────────────┘
         ↓
┌─────────────────────┐       ┌──────────────────┐
│ Request Notif       │       │                  │
│ Permissions         │       │                  │
└─────────────────────┘       └──────────────────┘
         ↓
┌─────────────────────┐       ┌──────────────────┐
│ Get Expo Push Token │       │                  │
│ ExponentPushToken   │       │                  │
│ [xxxxx...]          │       │                  │
└─────────────────────┘       └──────────────────┘
         ↓
         │ POST /auth/register-push-token
         │ { pushToken: "ExponentPushToken[...]" }
         │
         ├──────────────────→ ┌──────────────────┐
                              │ registerPushToken│
                              │ - Validate token │
                              │ - Store in DB    │
                              └──────────────────┘
                                       ↓
                              ┌──────────────────┐
                              │ Citizens{        │
                              │  pushTokens: [   │
                              │    "token123"    │
                              │  ]               │
                              │ }                │
                              └──────────────────┘


NOTICE POSTING FLOW
═════════════════════════════════════════════════════════════════

1. Official Logs In
   └─→ Posts New Notice
       └─→ http://backend:5000/notice/upload
           ├─ Verify authorization
           ├─ Save notice to DB
           └─ Trigger notification


2. Backend Processes Notification
   └─→ Find all citizens in village
       └─→ Collect their push tokens
           └─→ [token1, token2, token3, ...]


3. Send via Firebase
   └─→ POST to Firebase Cloud Messaging
       ├─ title: "📢 New Notice Posted"
       ├─ body: "Notice title here"
       ├─ data: {
       │  "type": "notice",
       │  "villageId": "village_id"
       │ }
       └─ recipients: [token1, token2, token3]


4. User Receives Notification
   └─→ Notification appears on device
       ├─ Lock screen
       ├─ Notification center
       └─ Optional: App opens if user taps


DATA FLOW DIAGRAM
═════════════════════════════════════════════════════════════════

User Device                Backend Server              Firebase
    │                           │                         │
    │──Login──────────────────→ │                         │
    │                      Verify creds                   │
    │←─Token returned────────── │                         │
    │                           │                         │
    │─Request Notifications    │                         │
    │      Permissions         │                         │
    │(OS Level)                │                         │
    │                           │                         │
    │─Get Expo Push Token      │                         │
    │ (Local Device)           │                         │
    │                           │                         │
    │─Send /register-push-token│                         │
    │────────────────────────→ │                         │
    │                      Store in DB                    │
    │                      Citizens.pushTokens[]          │
    │                           │                         │
    │                    [Official Posts Notice]          │
    │                           │                         │
    │                    Fetch all citizens               │
    │                    in village                       │
    │                           │                         │
    │                    Collect their tokens             │
    │                           │                         │
    │                    Send to Firebase─────────────→  │ 
    │                           │                  Broadcast
    │                           │                    to tokens
    │←─Receive Notification─────────────────────────── │
    │  (Lock screen/Center)                              │
    │                                                     │


VILLAGE-BASED NOTIFICATION
═════════════════════════════════════════════════════════════════

Citizen A (Village 1)
├─ Scanned Village 1 QR
├─ Logged in
├─ Token: Token_A1
└─ Receives: Notices from Village 1 ✓


Citizen B (Village 1)
├─ Scanned Village 1 QR
├─ Logged in
├─ Token: Token_B1
└─ Receives: Notices from Village 1 ✓


Citizen C (Village 2)
├─ Scanned Village 2 QR
├─ Logged in
├─ Token: Token_C2
└─ Receives: Notices from Village 2 ✓


When Official from Village 1 Posts Notice:
└─ Fetch: Citizens where village == Village_1
   ├─ Find: Citizen A (Token_A1) ✓
   ├─ Find: Citizen B (Token_B1) ✓
   └─ Ignore: Citizen C (Different village) ✗

Send: {{title: "New Notice", tokens: [Token_A1, Token_B1]}}
Result: Only A & B get notified (same village)


ERROR HANDLING
═════════════════════════════════════════════════════════════════

Token Errors:
  ├─ Invalid token → Firebase removes automatically
  ├─ Expired token → User must login again
  └─ Device offline → Message queued until online

Firebase Errors:
  ├─ No Firebase config → Warnings logged, app continues
  ├─ Auth failure → Error logged, no crash
  └─ Network error → Retry logic in notification library

App Errors:
  ├─ Permission denied → Offer settings redirect
  ├─ No device → Skip notifications gracefully
  └─ Notification handler error → Logged but contained


NOTIFICATION TYPES
═════════════════════════════════════════════════════════════════

Notice Notification
├─ Title: 📢 New Notice Posted
├─ Body: "[Notice Title] has been published"
├─ Data: {
│   type: "notice"
│   villageId: "village_id"
│ }
└─ Trigger: New notice created

Complaint Resolved
├─ Title: ✅ Complaint Resolved
├─ Body: "#Complaint_ID has been RESOLVED"
├─ Data: {
│   type: "complaint_resolved"
│   complaintId: "id"
│ }
└─ Trigger: Complaint status changed to resolved

Complaint Rejected
├─ Title: ❌ Complaint Rejected
├─ Body: "#Complaint_ID was rejected. Reason: [reason]"
├─ Data: {
│   type: "complaint_rejected"
│   complaintId: "id"
│   reason: "reason_text"
│ }
└─ Trigger: Complaint status changed to rejected
