# Test Automated QR Code Generation - Quick Guide

## Simple 3-Step Test

### Step 1: Get a Village ID
```bash
curl -X GET http://localhost:3000/villages
```

Copy any village's `_id` (24-character hex string)
Example: `507f1f77bcf86cd799439011`

---

### Step 2: Generate QR Code (Auto-Generates)
```bash
curl -X GET http://localhost:3000/villages/507f1f77bcf86cd799439011/qrcode
```

**Expected Response:**
```json
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

✅ **Key**: `imageUrl` now contains the generated QR code image!

---

### Step 3: Download & Verify
1. Copy the `imageUrl` from response
2. Paste in browser to view the PNG image
3. You should see the QR code!
4. Right-click and "Save image as..." to download

---

## What Changed

### Before (Manual Process)
❌ Get UUID from API → Manually go to QR generator website → Generate → Download

### After (Automated)
✅ Call API → Get image URL directly → Download PNG instantly

---

## What's Generated

- **Format**: PNG image
- **Size**: 300x300 pixels  
- **Storage**: Cloudinary (cloud)
- **Access**: Direct URL (permanent)
- **Generation**: Automatic on first access

---

## Test Workflow

```bash
# 1. List villages
curl http://localhost:3000/villages | head -20

# 2. Copy first village ID from output
# Example: "507f1f77bcf86cd799439011"

# 3. Generate QR code
curl -X GET http://localhost:3000/villages/507f1f77bcf86cd799439011/qrcode

# 4. Look for imageUrl in response
# 5. Copy imageUrl and paste in browser to download

# Done! You have a print-ready QR code!
```

---

## Endpoints Available

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/villages/{id}/qrcode` | GET | Get/Auto-generate QR code | No |
| `/villages/{id}/qrcode/generate` | POST | Explicitly generate QR | Yes (Superadmin) |
| `/villages/{id}/qrcode/download` | GET | Get QR download URL | Yes (Superadmin) |

---

## System Architecture

```
Admin calls GET /villages/{id}/qrcode
         ↓
System checks if image exists
         ↓
If NOT: Generate PNG → Upload to Cloudinary → Save URL
         ↓
If YES: Return existing URL
         ↓
Admin gets imageUrl → Downloads PNG → Prints → Distributes
         ↓
Citizens scan → See village notices!
```

---

## Verification Checklist

- [ ] Backend running (`npm start`)
- [ ] Got village ID from /villages
- [ ] Called /qrcode endpoint
- [ ] Got response with imageUrl
- [ ] Opened imageUrl in browser
- [ ] Saw QR code PNG image
- [ ] Downloaded the PNG file
- ✅ Automated QR generation works!

---

**Status**: ✅ Ready to test
**Next**: Try the 3-step test above!
