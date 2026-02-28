# QR Feature - Quick API Testing Commands

## 1. Get All Villages

```bash
curl -X GET http://localhost:3000/villages
```

Copy a village `_id` from the response.

---

## 2. Get QR Code for a Village

Replace `VILLAGE_ID` with actual ID from step 1:

```bash
curl -X GET http://localhost:3000/villages/VILLAGE_ID/qrcode
```

Example:
```bash
curl -X GET http://localhost:3000/villages/507f1f77bcf86cd799439011/qrcode
```

Look for the `qrCode.uniqueId` in the response - **copy this value**.

---

## 3. Get Village by QR Code (Test Scanning)

Replace `QR_CODE_ID` with the uniqueId from step 2:

```bash
curl -X GET http://localhost:3000/villages/qr/QR_CODE_ID
```

Example:
```bash
curl -X GET http://localhost:3000/villages/qr/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response:**
```json
{
  "message": "Village found",
  "village": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Kasaba",
    "district": "Pune",
    "state": "Maharashtra",
    "pincode": "410206"
  }
}
```

If you get an error, the QR code ID doesn't exist. Go back and verify.

---

## 4. Get Notices for a Village

```bash
# Basic - all notices
curl -X GET http://localhost:3000/notice/village/VILLAGE_ID

# With pagination
curl -X GET "http://localhost:3000/notice/village/VILLAGE_ID?page=1&limit=10"

# With category filter
curl -X GET "http://localhost:3000/notice/village/VILLAGE_ID?page=1&limit=10&category=health"
```

Examples:
```bash
# Get all notices for village
curl -X GET http://localhost:3000/notice/village/507f1f77bcf86cd799439011

# Get only health notices
curl -X GET "http://localhost:3000/notice/village/507f1f77bcf86cd799439011?category=health"

# Get second page with 5 items per page
curl -X GET "http://localhost:3000/notice/village/507f1f77bcf86cd799439011?page=2&limit=5"
```

**Expected Response:**
```json
{
  "notices": [
    {
      "_id": "...",
      "title": "Notice Title",
      "content": "Notice content...",
      "category": "health",
      "villageId": "507f1f77bcf86cd799439011",
      "views": 0
    }
  ],
  "village": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Kasaba"
  },
  "totalPages": 3,
  "currentPage": 1,
  "total": 24
}
```

---

## 5. Test Data Flow (Complete User Journey)

### Step 1: Start with a village ID
```bash
curl -X GET http://localhost:3000/villages | grep -o '"_id":"[^"]*"' | head -1
```

### Step 2: Get its QR code
```bash
curl -X GET http://localhost:3000/villages/507f1f77bcf86cd799439011/qrcode
```

### Step 3: Verify QR code works
```bash
curl -X GET http://localhost:3000/villages/qr/550e8400-e29b-41d4-a716-446655440000
```

Should return the same village from step 2.

### Step 4: Get its notices
```bash
curl -X GET http://localhost:3000/notice/village/507f1f77bcf86cd799439011
```

If no notices, the feature will show "No notices" on frontend (this is expected).

---

## API Categories

### Public Endpoints (No Auth)
- GET /villages/qr/{qrCodeId} - Get village by QR code
- GET /notice/village/{villageId} - Get village notices

### Admin Endpoints (Requires Auth)
- GET /villages/{id}/qrcode - Get QR code details
- POST /notice/upload - Create notice
- PUT /notice/update/{id} - Edit notice

---

## Testing QR Code IDs

You can use these formats for testing:

```
550e8400-e29b-41d4-a716-446655440000  (valid UUID format)
123e4567-e89b-12d3-a456-426614174001  (valid UUID format)
00000000-0000-0000-0000-000000000000  (all zeros - should not exist)
invalid-qr-code                        (invalid format - will error)
```

First two should work if they exist in DB. Last two should error properly.

---

## Using Postman (Alternative)

If you prefer Postman over curl:

1. Create new request
2. Method: GET
3. URL: `http://localhost:3000/villages/qr/550e8400-e29b-41d4-a716-446655440000`
4. Click Send
5. See formatted response

---

## Common Issues

**Issue: "Village not found"**
- The QR code ID doesn't exist in the database
- Verify the UUID is correct
- Check a different village

**Issue: "Cast to ObjectId failed"**
- Backend route ordering issue (should be fixed)
- Restart backend server if this appears

**Issue: Empty notices array**
- Village exists but has no notices
- Create test notices via admin panel
- This is OK - frontend will show "No notices"

**Issue: CORS error**
- This is expected for browser requests from different origin
- Backend should handle CORS
- Mobile app and direct curl should have no issues

---

## Quick Copy-Paste Commands

### Test 1: Get all villages
```
curl -X GET http://localhost:3000/villages
```

### Test 2: Get QR code (replace VILLAGE_ID)
```
curl -X GET http://localhost:3000/villages/VILLAGE_ID/qrcode
```

### Test 3: Scan QR code (replace QR_ID)
```
curl -X GET http://localhost:3000/villages/qr/QR_ID
```

### Test 4: Get notices (replace VILLAGE_ID)
```
curl -X GET http://localhost:3000/notice/village/VILLAGE_ID
```

---

**Last Updated**: February 24, 2026
