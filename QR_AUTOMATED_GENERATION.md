# Automated QR Code Generation - Admin Guide

## What's New

✅ **One-click QR code generation**
✅ **Automatic image creation and upload to Cloudinary**
✅ **Downloadable PNG images**
✅ **Share directly with citizens**

---

## How to Use (Step-by-Step)

### Method 1: Auto-Generate on First Access (Easiest)

Admins/Officials just need to call the QR code endpoint and it will automatically generate if not already done.

**Via API:**
```bash
GET http://localhost:3000/villages/{villageId}/qrcode
```

**What happens:**
1. System checks if QR code image exists
2. If NOT: Automatically generates and uploads to Cloudinary
3. If YES: Returns existing image URL
4. Either way: You get the image URL to download/share

**Example:**
```bash
curl -X GET http://localhost:3000/villages/507f1f77bcf86cd799439011/qrcode

# Response:
{
  "message": "Village QR code retrieved",
  "village": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Kasaba",
    "qrCode": {
      "uniqueId": "550e8400-e29b-41d4-a716-446655440000",
      "imageUrl": "https://res.cloudinary.com/.../.../qr_507f1f77.png",
      "generatedAt": "2025-02-24T10:30:00.000Z"
    }
  }
}
```

✅ **Click on `imageUrl` to download the PNG image!**

---

### Method 2: Manual Generation Endpoint

If you want to explicitly generate/regenerate the QR code:

**Via API:**
```bash
POST http://localhost:3000/villages/{villageId}/qrcode/generate

Headers:
- Authorization: Bearer YOUR_TOKEN
- Content-Type: application/json
```

**Requires:** Superadmin login token

**Example:**
```bash
curl -X POST http://localhost:3000/villages/507f1f77bcf86cd799439011/qrcode/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Response:
{
  "message": "QR code generated successfully",
  "village": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Kasaba",
    "qrCode": {
      "uniqueId": "550e8400-e29b-41d4-a716-446655440000",
      "imageUrl": "https://res.cloudinary.com/.../.../qr_507f1f77.png",
      "generatedAt": "2025-02-24T10:30:00.000Z"
    },
    "downloadUrl": "https://res.cloudinary.com/.../.../qr_507f1f77.png"
  }
}
```

---

### Method 3: Download Existing QR Code

Get the QR code image URL if already generated:

**Via API:**
```bash
GET http://localhost:3000/villages/{villageId}/qrcode/download

Headers:
- Authorization: Bearer YOUR_TOKEN
```

**Requires:** Superadmin login token

---

## Complete Workflow for Admins

### Step 1: Login
Go to backend admin panel or authenticate via API

### Step 2: Get Village ID
```bash
curl -X GET http://localhost:3000/villages

# Find your village, copy its _id
```

### Step 3: Generate QR Code (One-Click)
```bash
# Option A: Just call the get endpoint (auto-generates if needed)
curl -X GET http://localhost:3000/villages/VILLAGE_ID/qrcode

# Option B: Explicitly generate
curl -X POST http://localhost:3000/villages/VILLAGE_ID/qrcode/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Step 4: Get Image URL
Response includes: `"imageUrl": "https://res.cloudinary.com/.../qr_507f1f77.png"`

### Step 5: Download & Share
- **Click the URL** to download/view the PNG
- **Print the image** (300x300 pixels, good quality)
- **Share on WhatsApp** with village officials
- **Post in village office** on bulletin board

---

## QR Code Properties

Each generated QR code has:

| Property | Description |
|----------|-------------|
| `uniqueId` | UUID encoded in the QR code (text) |
| `imageUrl` | Cloudinary URL to download PNG image |
| `generatedAt` | Timestamp when QR was generated |

**Image Specifications:**
- Format: PNG
- Size: 300x300 pixels
- Error Correction: High
- Color: Black on White
- Quality: Print-ready

---

## Where is My QR Code Image?

Once generated, your QR code image is stored in **Cloudinary** (cloud storage).

### To Access:
1. Go to API response
2. Find `imageUrl` field
3. Click the link to view/download

### Direct URL Format:
```
https://res.cloudinary.com/{your-cloud-name}/image/upload/gramvartha/qr-codes/qr_{villageId}_{uuid}.png
```

### To Share:
- Copy the URL and send to officials
- Or download and print
- Or embed in documents

---

## Using in Admin Dashboard (Frontend)

### Option 1: Manual Implementation
Admins can:
1. Login to frontend
2. Go to "Manage Villages"
3. Click on village
4. Click "Generate QR Code" button
5. Image appears
6. Click "Download" to save PNG

(This would need frontend button - contact developer if needed)

### Option 2: Direct API Access
Use Postman/cURL to generate, get the URL, download manually.

---

## Troubleshooting

### Problem: "QR code not yet generated"
**Solution:** Call the endpoint - it auto-generates on first access

### Problem: Image URL is null
**Solution:** 
1. Call the generate endpoint explicitly
2. Wait 2-3 seconds
3. Retry the get endpoint

### Problem: Can't download the image
**Solution:**
1. Copy the imageUrl from API response
2. Paste directly in browser
3. Or right-click and "Save image as"

### Problem: QR code doesn't scan
**Solution:**
1. Make sure you're using the correct uniqueId
2. Print at high quality
3. Ensure good lighting when scanning
4. Try with different phone/QR scanner app

---

## API Endpoints Summary

### For Getting QR Code (Auto-generates)
```
GET /villages/{villageId}/qrcode
```
✅ Easiest - auto-generates if needed
✅ No auth required for internal use
✅ Returns image URL immediately

### For Explicit Generation
```
POST /villages/{villageId}/qrcode/generate
```
✅ Requires superadmin token
✅ Regenerates every time
✅ Good for testing/troubleshooting

### For Downloading
```
GET /villages/{villageId}/qrcode/download
```
✅ Requires superadmin token
✅ Returns image URL
✅ Similar to get endpoint

---

## Example: Complete Workflow

```bash
# 1. Get all villages
curl -X GET http://localhost:3000/villages

# 2. Copy village ID: 507f1f77bcf86cd799439011

# 3. Get QR code (auto-generates)
curl -X GET http://localhost:3000/villages/507f1f77bcf86cd799439011/qrcode

# 4. In response, find: "imageUrl": "https://res.cloudinary.com/.../qr_507f1f77.png"

# 5. Open image URL in browser or download

# 6. Print and share!
```

---

## FAQ

**Q: Do I need to manually create QR codes?**
A: No! The system does it automatically. Just call the endpoint.

**Q: Where is the image stored?**
A: In Cloudinary (cloud storage). Access via the URL in the API response.

**Q: Can I regenerate a QR code?**
A: Yes, call POST /generate endpoint to regenerate anytime.

**Q: What if generation fails?**
A: Try again. System will still show the uniqueId (can be used with external QR generators as fallback).

**Q: Can I get QR code without token?**
A: GET endpoint works, but POST/download need superadmin token.

**Q: How long are URLs valid?**
A: Cloudinary URLs are permanent. They won't expire.

---

## What Citizens See

When a citizen scans the QR code:

1. Their phone opens the app/browser
2. App reads the UUID from QR code image  
3. App sends UUID to backend
4. Backend finds village by UUID
5. Shows all village notices
6. ✅ No login needed!

---

## Testing the Feature

```bash
# Get a test village
curl -X GET http://localhost:3000/villages | jq '.villages[0]._id'

# Generate QR code
curl -X GET "http://localhost:3000/villages/VILLAGE_ID/qrcode"

# Check response - should have imageUrl
# Open imageUrl in browser
# You should see the QR code PNG!

# Test scanning:
# Print or display on screen
# Scan with phone camera
# Should navigate to village notices
```

---

**Status**: ✅ Automated QR code generation ready
**Last Updated**: February 24, 2026
