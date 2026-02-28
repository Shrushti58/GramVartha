# QR Code Feature - Complete Testing Guide

## Step 1: Verify Backend is Running

```bash
# Terminal 1 - Start Backend
cd c:\GramVartha\backend
npm start

# Expected output:
# 🚀 Server running on port 3000
# ✅ MongoDB connected successfully
```

Check that you see NO errors about routes or missing modules.

---

## Step 2: Verify Frontend is Running

```bash
# Terminal 2 - Start Frontend
cd c:\GramVartha\frontend
npm run dev

# Expected output:
# Local:   http://localhost:5173/
```

---

## Step 3: Get an Existing Village ID

### Option A: From Database (Recommended)

1. Open MongoDB Compass or MongoDB Atlas
2. Navigate to `GramVartha` > `villages` collection
3. Find any village with status "approved"
4. Copy its `_id` field

Example: `507f1f77bcf86cd799439011`

### Option B: Create a Test Village via API

```bash
# Get auth token first (login as superadmin)
# Then create village:

curl -X POST http://localhost:3000/villages/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Village QR",
    "district": "Pune",
    "state": "Maharashtra",
    "pincode": "410206",
    "latitude": 18.5204,
    "longitude": 73.8567
  }'
```

If you don't have a token, skip and use existing villages.

---

## Step 4: Verify QR Code Exists for Village

Open Postman or use browser console:

```bash
# Replace VILLAGE_ID with actual ID from Step 3
curl -X GET http://localhost:3000/villages/VILLAGE_ID/qrcode

# Example:
curl -X GET http://localhost:3000/villages/507f1f77bcf86cd799439011/qrcode
```

**Expected Response:**
```json
{
  "message": "Village QR code retrieved",
  "village": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test Village QR",
    "qrCode": {
      "uniqueId": "550e8400-e29b-41d4-a716-446655440000",
      "imageUrl": null,
      "generatedAt": null
    }
  }
}
```

**Copy the `uniqueId` value** - you'll need this for testing.

---

## Step 5: Create Test Notices for the Village

### Via Postman:

```bash
POST http://localhost:3000/notice/upload

Headers:
- Authorization: Bearer YOUR_OFFICIAL_TOKEN
- Content-Type: multipart/form-data

Body (form-data):
- villageId: VILLAGE_ID
- title: "Test Notice for QR Scanning"
- content: "This is a test notice to verify QR code feature"
- category: "development"
- file: (upload any PDF or image)
```

Create at least 3-5 test notices with different categories:
- "development"
- "health"
- "education"
- "general"

If you can't upload via Postman, you can:
1. Login as Official on web frontend
2. Create notices directly in the application
3. Make sure they're associated with the village

---

## Step 6: Verify Notices Exist

```bash
# Replace VILLAGE_ID with your test village ID
curl -X GET "http://localhost:3000/notice/village/VILLAGE_ID?page=1&limit=10&category=all"

# Example:
curl -X GET "http://localhost:3000/notice/village/507f1f77bcf86cd799439011?page=1&limit=10&category=all"
```

**Expected Response:**
```json
{
  "notices": [
    {
      "_id": "...",
      "title": "Test Notice",
      "content": "...",
      "category": "development",
      "villageId": "507f1f77bcf86cd799439011"
    },
    // ... more notices
  ],
  "village": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test Village QR"
  },
  "totalPages": 1,
  "currentPage": 1,
  "total": 5
}
```

If you get an empty array, go back to Step 5 and create notices.

---

## Step 7: Generate a Testable QR Code

### Option A: Online QR Code Generator (Fastest)

1. Go to: https://www.qr-code-generator.com/
2. Select "URL" as input type
3. Enter the `uniqueId` from Step 4
   - Example: `550e8400-e29b-41d4-a716-446655440000`
4. Click "Generate"
5. Click "Download" to save the QR code image
6. Print or display on screen for testing

### Option B: Use QR Code API

```bash
# Generate via URL - open in browser
https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=550e8400-e29b-41d4-a716-446655440000

# This will display a QR code image with your uniqueId encoded
```

### Option C: Generate Using Online Tool Results

1. Visit https://qr-code-generator.com/
2. Text/URL: `550e8400-e29b-41d4-a716-446655440000` (your uniqueId)
3. Click Download
4. Use the saved image for testing

---

## Step 8: Test on Web Frontend

### Test Web QR Scanner:

1. Open browser: http://localhost:5173/qr-scanner

2. **Test Option A - Manual Entry (Easiest First)**:
   - Click "Manual Entry" button
   - Paste the `uniqueId` from Step 4
   - Click "Submit"
   - Expected: Should navigate to notices page showing village details

3. **Test Option B - Camera Scan**:
   - Go to http://localhost:5173/qr-scanner
   - Click "Scan Village QR Code"
   - Allow camera access
   - Hold up the QR code image (from Step 7) to camera
   - Expected: Should automatically detect and navigate

### Verify Notice Display:

After successful QR scan, you should see:
- ✅ Village name and details at top
- ✅ List of notices in cards
- ✅ Category filter tabs
- ✅ Notice count and pagination
- ✅ "Scan Another QR" button

### Test Category Filtering:

- Click on different category tabs (Health, Education, etc.)
- Notices should filter accordingly
- Empty categories should show "No notices found"

### Test Data Persistence:

1. Refresh the page (F5)
2. The village info should still be there from localStorage
3. The notices should reload

---

## Step 9: Test Mobile App

### Setup Mobile App:

```bash
# Terminal 3 - Start Mobile App
cd c:\GramVartha\CitizenNoticeApp
npm start

# Wait for Metro bundler to start
# Then press 'w' for web, 'a' for Android emulator, or 'i' for iOS simulator
```

### Test on Mobile Web:

1. Press 'w' in terminal to open web version
2. Navigate to QR Scanner
3. Test manual entry (same as Step 8, Test A)
4. Verify notices display correctly

### Test QR Scanning on Device:

1. Make sure camera permission is granted
2. Tap "Scan QR" from home screen
3. Point at QR code image
4. Verify it detects and navigates to notices
5. View and filter notices

---

## Step 10: Verify Local Storage

### Check Browser (Web):

1. Open browser console (F12)
2. Go to Application > LocalStorage
3. Find `scannedVillage` key
4. Should contain:
```json
{
  "villageId": "507f1f77bcf86cd799439011",
  "villageName": "Test Village QR",
  "district": "Pune",
  "state": "Maharashtra",
  "pincode": "410206",
  "scannedAt": "2025-02-24T...",
  "qrCodeId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Check Mobile (React Native):

1. Open React Native debugger or console
2. Should see logs confirming AsyncStorage save
3. Close and reopen app
4. Data should persist

---

## Step 11: Test Error Cases

### Test Invalid QR Code:

1. Go to QR scanner
2. Manual entry: Enter invalid UUID: `invalid-qr-code-12345`
3. Expected: Error message "Invalid QR code. Please try again."

### Test Non-Existent Village:

1. Manual entry: Enter valid UUID format but non-existent ID:
   `00000000-0000-0000-0000-000000000000`
2. Expected: Error message from backend

### Test Missing Notices:

1. If village has no notices
2. Should show: "No notices found"
3. Categories should be grayed out

---

## Troubleshooting During Testing

### Problem: "village not found" error

**Solution:**
1. Verify village ID is correct (check MongoDB)
2. Make sure village status is "approved"
3. Restart backend

### Problem: QR code uniqueId is null/undefined

**Solution:**
1. The UUID should auto-generate on village creation
2. If not, check Village model has qrCode field with default() function
3. Create a new village and check again

### Problem: No notices appearing

**Solution:**
1. Verify notices were created with that villageId
2. Check API endpoint: GET /notice/village/{villageId}
3. Make sure notices have status "published" or similar
4. Check notice category is valid

### Problem: Camera not working on web

**Solution:**
1. Use HTTPS (QR scanner may require it for camera access)
2. Check browser permissions for camera
3. Try different browser (Chrome recommended)
4. Use manual entry as fallback

### Problem: Mobile app won't scan

**Solution:**
1. Grant camera permission on device
2. Ensure good lighting
3. Hold QR code steady for 2-3 seconds
4. Try manual entry on mobile

---

## Quick Test Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Village ID obtained
- [ ] QR uniqueId retrieved
- [ ] Test notices created (3+)
- [ ] QR code image generated
- [ ] Web manual entry working
- [ ] Web camera scan working
- [ ] Notice display verified
- [ ] Category filtering working
- [ ] localStorage has village data
- [ ] Mobile app loads QR screen
- [ ] Mobile manual entry working
- [ ] Mobile camera scan tested
- [ ] Error messages showing correctly

---

## Expected Behavior Summary

| Test Case | Web | Mobile |
|-----------|-----|--------|
| Manual QR Entry | ✅ Shows notices | ✅ Shows notices |
| Camera QR Scan | ✅ Auto-detects | ✅ Auto-detects |
| Notice Display | ✅ 3+ cards | ✅ 3+ cards |
| Category Filter | ✅ Works | ✅ Works |
| Data Persist | ✅ localStorage | ✅ AsyncStorage |
| Error Handling | ✅ Error alerts | ✅ Error alerts |

---

## Next Steps After Testing

✅ If all tests pass, feature is ready for:
- Deployment to production
- User training
- QR code printing and distribution
- Integration with official portals

❌ If tests fail:
1. Check error messages in console
2. Verify API responses with curl
3. Check database for data
4. Review troubleshooting section
5. Restart backend/frontend

---

**Testing Date**: ________________
**Tested By**: ________________
**Status**: ✅ Pass / ❌ Fail
**Notes**: ___________________

