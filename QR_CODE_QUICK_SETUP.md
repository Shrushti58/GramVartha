# QR Code Feature - Quick Setup Guide

## What Was Implemented

A complete QR code feature has been added to GramVartha that allows citizens to:
- Scan village QR codes using their phone or web camera
- Access village notices without logging in
- Store scanned village info locally (no need to scan again)
- Browse notices by category with pagination

## Files Created/Modified

### Backend Changes
1. ✅ `Village.js` - Added QR code fields
2. ✅ `villageController.js` - QR lookup functions
3. ✅ `villageRoutes.js` - QR API endpoints
4. ✅ `noticeController.js` - Get notices by village
5. ✅ `noticeRoutes.js` - Notice endpoint

### Frontend Changes
1. ✅ `QRScanner.jsx` - Scanner component
2. ✅ `QRNotices.jsx` - Notice display page
3. ✅ `Api.js` - QR API functions
4. ✅ `App.jsx` - Routes added

### Mobile App Changes
1. ✅ `qr-scanner.tsx` - Camera scanner screen
2. ✅ `qr-notices/[villageId].tsx` - Notices screen
3. ✅ `qrStorage.ts` - Local storage utility
4. ✅ `index.tsx` - Added QR button
5. ✅ `package.json` - Added expo-camera

## Installation Steps

### Backend Setup
```bash
cd backend

# Install uuid if not already present
npm install uuid

# Package should already have this in dependency
npm start
```

### Frontend Setup
```bash
cd frontend

# install dependencies (html5-qrcode already in package)
npm install

# Start development server  
npm run dev
```

### Mobile App Setup
```bash
cd CitizenNoticeApp

# Install dependencies (includes expo-camera)
npm install

# Start app
npm start

# Then press 'a' for Android or 'i' for iOS
```

## How to Use

### For Web Users (Frontend)

1. **Access QR Scanner**:
   - Navigate to `http://localhost:5173/qr-scanner`
   - Or from home page, look for QR scanner link

2. **Scan QR Code**:
   - Click "Scan Village QR Code"
   - Allow camera access
   - Point at QR code with uniqueId

3. **Alternative - Manual Entry**:
   - Scroll down to "Manual Entry" section
   - Paste the QR code ID
   - Click Submit

4. **View Notices**:
   - Automatically redirected to `/qr-notices/{villageId}`
   - Filter by category
   - Village info saved in localStorage

### For Mobile Users (Expo App)

1. **Access QR Scanner**:
   - From home screen, tap "Scan QR" in Quick Access
   - Or navigate directly within app

2. **Scan QR Code**:
   - App requests camera permission (grant it)
   - Point camera at QR code
   - Automatically verifies and loads

3. **View Notices**:
   - See all village notices
   - Filter by category
   - Scroll and paginate
   - Data saved in AsyncStorage

4. **Previous Scans**:
   - Tap "Scan Another QR" to return to scanner
   - History maintained locally

## How to Generate QR Codes for Villages

### Option 1: Using Online Tool (Quick)
1. Get the village's `qrCode.uniqueId` from API
2. Visit: https://qr-server.com/ or https://www.qr-code-generator.com/
3. Enter the `uniqueId` (just the UUID string)
4. Generate and download QR code image
5. Print and post in village

### Option 2: Using API
```bash
# Get the unique ID first
GET /villages/{villageId}/qrcode

# Response will contain qrCode.uniqueId
# Then use that ID in a QR code generator
```

### Option 3: Server-Side (Recommended for Future)
The system is designed to support server-side QR code image generation and storage in Cloudinary (future enhancement).

## API Endpoints Reference

### Public Endpoints (No Auth Required)

**Get Village by QR Code**
```
GET /villages/qr/{qrCodeId}

Example:
GET /villages/qr/550e8400-e29b-41d4-a716-446655440000

Response:
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

**Get Notices by Village**
```
GET /notice/village/{villageId}?page=1&limit=10&category=all

Query Parameters:
- page: 1, 2, 3... (default: 1)
- limit: 10, 20, 50... (default: 10)
- category: all, development, health, etc.

Response:
{
  "notices": [...],
  "village": {...},
  "totalPages": 5,
  "currentPage": 1,
  "total": 47
}
```

### Admin Endpoints (Requires Auth)

**Get QR Code for Village**
```
GET /villages/{villageId}/qrcode

Headers: Authorization: Bearer {token}

Response:
{
  "message": "Village QR code retrieved",
  "village": {..., "qrCode": {...}}
}
```

## Testing

### Test QR Code UUIDs (use these for testing)
```
550e8400-e29b-41d4-a716-446655440000
123e4567-e89b-12d3-a456-426614174000
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (any valid UUID)
```

### Manual API Testing with cURL

```bash
# Test 1: Get village by QR code
curl -X GET \
  'http://localhost:3000/villages/qr/550e8400-e29b-41d4-a716-446655440000' \
  -H 'Accept: application/json'

# Test 2: Get notices by village
curl -X GET \
  'http://localhost:3000/notice/village/507f1f77bcf86cd799439011?page=1&limit=10&category=all' \
  -H 'Accept: application/json'
```

## Storage Details

### Frontend (Browser)
```javascript
// Key in localStorage
localStorage.getItem('scannedVillage')

// Returns:
{
  "villageId": "507f1f77bcf86cd799439011",
  "villageName": "Kasaba",
  "district": "Pune",
  "state": "Maharashtra",
  "pincode": "410206",
  "scannedAt": "2025-02-24T10:30:00.000Z",
  "qrCodeId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Mobile (AsyncStorage)
```typescript
// Keys in AsyncStorage
await AsyncStorage.getItem('scannedVillage')       // Current scan
await AsyncStorage.getItem('scannedVillagesHistory')  // Last 10 scans
```

## Troubleshooting

### Backend Issues
- Q: QR endpoints not found?
  - A: Restart backend server, check routes are imported
  - A: Verify `/villages/qr/` comes before `/villages/:id`

- Q: Missing uuid package?
  - A: Run `npm install uuid` in backend
  - A: Check `const { v4: uuidv4 } = require("uuid")` imported

### Frontend Issues
- Q: Camera not working?
  - A: Check browser permissions
  - A: Try manual entry instead
  - A: Test on different browser/device

- Q: Data not persisting?
  - A: Check browser's private/incognito mode
  - A: Clear browser cache and localStorage
  - A: Try different browser

- Q: html5-qrcode not found?
  - A: CDN is loaded dynamically, check network tab
  - A: Try manual entry if CDN fails

### Mobile Issues
- Q: Camera permission denied?
  - A: Check app permissions in phone settings
  - A: Use manual entry as fallback

- Q: AsyncStorage not persisting?
  - A: Clear app cache in device settings
  - A: Reinstall app
  - A: Check device storage available

## Next Steps

### To Test the Feature

1. **Login as Admin/Official** and create some test notices
2. **Get a village's QR code**:
   ```
   Visit backend: GET /villages/{villageId}/qrcode
   Note the qrCode.uniqueId
   ```
3. **Generate QR code** with that uniqueId
4. **Test on Web**:
   - Go to /qr-scanner
   - Scan or manually enter the ID
   - Should see the notices
5. **Test on Mobile**:
   - Open mobile app
   - Tap "Scan QR"
   - Test scanning and viewing

### To Deploy

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   # Upload to Vercel or host
   ```

2. **Deploy Mobile App**:
   ```bash
   cd CitizenNoticeApp
   eas build
   eas submit
   ```

## Additional Resources

- **QR Code Specification**: https://en.wikipedia.org/wiki/QR_code
- **html5-qrcode Library**: https://github.com/mebjas/html5-qrcode
- **Expo Camera Docs**: https://docs.expo.dev/versions/latest/sdk/camera/
- **AsyncStorage Docs**: https://react-native-async-storage.github.io/

## Support

For issues or questions:
1. Check the comprehensive `QR_CODE_FEATURE_DOCUMENTATION.md`
2. Check API responses in browser console
3. Review implementation in relevant files
4. Test with different QR code IDs

---

**Last Updated**: February 24, 2025
**Feature Status**: ✅ Complete and Ready for Testing
