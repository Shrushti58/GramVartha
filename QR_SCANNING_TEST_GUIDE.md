# QR Code Scanning Test Guide

## Overview
This guide helps you test and troubleshoot QR code scanning functionality in the web version.

## Setup Requirements

Before testing QR scanning, ensure you have:
1. A village created and **approved** in the database
2. A QR code generated and associated with that village
3. Backend running on `http://localhost:3000`
4. Frontend running on `http://localhost:5173` (or your Vite port)

## Step 1: Create and Approve a Test Village

### Via Backend Admin Endpoint (Fastest)
```bash
# Create a village as superadmin
curl -X POST http://localhost:3000/villages/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -d {
    "name": "Test Village",
    "district": "Test District",
    "state": "Test State",
    "pincode": "123456",
    "latitude": 20.5937,
    "longitude": 78.9629,
    "status": "approved"
  }
```

This will return something like:
```json
{
  "_id": "65xyz123...",
  "name": "Test Village",
  "qrCode": {
    "uniqueId": "fb69eb12-c37d-4fba-ab8b-d3383909d3f2",
    ...
  }
}
```

**Save the `qrCode.uniqueId` value - you'll need this for scanning.**

### Via Web Admin Interface
1. Log in as superadmin
2. Go to Admin Dashboard
3. Create a new village with:**
   - Name: Test Village
   - District, State, Pincode: Any values
   - Latitude: 20.5937
   - Longitude: 78.9629
4. Make sure the village status is **"approved"** (not pending)

## Step 2: Generate QR Code for Village

```bash
# Generate QR code image
curl -X POST http://localhost:3000/villages/65xyz123.../qrcode/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

The QR code is now generated and uploaded to Cloudinary. The QR code contains the unique ID.

## Step 3: Verify Village QR Codes (Debug)

Check all villages and their QR codes:

```bash
curl http://localhost:3000/villages/debug/qr-codes
```

Response:
```json
{
  "message": "All villages with QR code info",
  "count": 1,
  "villages": [
    {
      "_id": "65xyz123...",
      "name": "Test Village",
      "district": "Test District",
      "state": "Test State",
      "pincode": "123456",
      "status": "approved",
      "qrCodeId": "fb69eb12-c37d-4fba-ab8b-d3383909d3f2"
    }
  ]
}
```

**The `qrCodeId` value must match your scanned QR code.**

## Step 4: Test QR Scanning

### Option A: Generate Test QR Code Manually

```bash
# Generate a test QR code with a specific ID
# Use: https://www.qr-code-generator.com/
# Or use any QR code generator with data: fb69eb12-c37d-4fba-ab8b-d3383909d3f2
```

### Option B: Scan Real QR Code

If you have the actual QR code image:
1. Open http://localhost:5173/#/qr-scanner
2. Click on camera permission prompt (if shown)
3. Point camera at QR code
4. Once scanned, the code ID should appear in the console

## Step 5: Monitor and Debug

### Check Browser Console for Logs

When scanning, look for console messages like:
```javascript
Scanned QR Code: fb69eb12-c37d-4fba-ab8b-d3383909d3f2
API Response: {data: {message: "Village found", village: {...}}}
Village Data: {_id: "65xyz123...", name: "Test Village", ...}
Saved to localStorage: {...}
```

### Check Backend Logs

You should see logs like:
```
Getting village by QR code: fb69eb12-c37d-4fba-ab8b-d3383909d3f2
Village found: Yes
```

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Village not found with this QR code" | QR code ID doesn't exist in DB | Verify QR code ID matches village in debug endpoint |
| "Village is not approved yet" | Village status is 'pending' not 'approved' | Create new village with status: 'approved' or approve existing village |
| "Cannot stop, scanner is not running" | Scanner race condition | Wait, scanner should be fixed now - report if still occurring |
| localStorage not saving | API call succeeded but data not persisted | Check browser console for errors, verify localStorage is enabled |

## Step 6: Full Test Workflow

1. Backend running: `npm start` (in backend/)
2. Frontend running: `npm run dev` (in frontend/)
3. Create test village (status: approved)
4. Generate QR code for that village
5. Open http://localhost:5173/#/qr-scanner
6. Scan or manually enter the QR code ID
7. Check console logs
8. Verify village data appears on notices page

## Debugging Checklist

- [ ] Backend is running on port 3000
- [ ] Frontend is running on port 5173
- [ ] Test village exists and is **approved** (not pending)
- [ ] QR code is generated for the village
- [ ] Browser console shows detailed logs
- [ ] Browser allows camera access to `/qr-scanner`
- [ ] localStorage is enabled in browser
- [ ] Network tab shows `/villages/qr/{id}` request succeeds (200 status)

## Manual Test with QR Code ID

Instead of scanning, you can manually enter the QR code ID:

1. Go to http://localhost:5173/#/qr-scanner
2. Scroll to "Manual Entry" section
3. Enter the QR code ID: `fb69eb12-c37d-4fba-ab8b-d3383909d3f2`
4. Click Submit
5. Should redirect to notices page showing village name and notices

## Need Help?

If scanning still fails:
1. Check browser console (F12 Dev Tools)
2. Check backend console for error logs
3. Use `/villages/debug/qr-codes` endpoint to verify village data
4. Verify village status is "approved"
5. Try manual entry instead of camera scan to isolate the issue

---

**Last Updated**: 2026-02-28
