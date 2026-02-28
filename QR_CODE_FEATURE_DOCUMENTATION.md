# GramVartha QR Code Feature Implementation

## Overview
This document describes the QR Code feature implementation for GramVartha that allows citizens to scan village QR codes and access notices without any login requirements.

## Feature Benefits
- **No Login Required**: Citizens can scan a QR code to instantly access village notices
- **Offline Access**: Village and scanned data stored locally for offline browsing
- **Easy Distribution**: Officials can print/post QR codes at various village locations
- **Quick Access**: Citizens don't need to scan again once saved on their device
- **Location Independent**: Works across web and mobile platforms

## Architecture Overview

### Backend Components

#### 1. Village Model Updates
**File**: `backend/models/Village.js`

Added QR Code fields:
```javascript
qrCode: {
  uniqueId: {
    type: String,
    unique: true,
    sparse: true,
    default: () => uuidv4()  // Auto-generated unique ID
  },
  imageUrl: { type: String },  // Cloudinary URL for QR image
  generatedAt: { type: Date }
}
```

#### 2. New Backend Endpoints

**Village Routes** (`backend/routes/villageRoutes.js`):
- `GET /villages/qr/:qrCodeId` - Get village by QR code ID (Public)
- `GET /villages/:id/qrcode` - Get QR code for a village (Admin/Officials)

**Notice Routes** (`backend/routes/noticeRoutes.js`):
- `GET /notice/village/:villageId` - Get notices for a village (Public)

#### 3. New Controller Functions

**Village Controller** (`backend/controllers/villageController.js`):
```javascript
getVillageQRCode()      // Retrieve QR code details
getVillageByQRCode()    // Lookup village by scanning QR
```

**Notice Controller** (`backend/controllers/noticeController.js`):
```javascript
getNoticesByVillage()   // Get paginated notices for a village
```

### Frontend Components

#### 1. QR Scanner Component
**File**: `frontend/src/components/QRScanner.jsx`

Features:
- Real-time QR code scanning using html5-qrcode library
- Camera access and fallback manual entry
- Village verification
- Local storage persistence

#### 2. QR-Based Notices Page
**File**: `frontend/src/pages/QRNotices.jsx`

Features:
- Display notices filtered by scanned village
- Category filtering
- Pagination support
- "Scan Another QR" functionality

#### 3. API Service Updates
**File**: `frontend/src/services/api.js`

New API functions:
```javascript
getVillageByQRCode(qrCodeId)        // Verify QR code
getVillageQRCode(villageId)         // Get QR details
getNoticesByVillage(villageId, params)  // Fetch village notices
```

#### 4. Routing
**File**: `frontend/src/App.jsx`

New routes:
- `/qr-scanner` - QR scanner interface
- `/qr-notices/:villageId` - Village-specific notices
- `/notice/:id` - Notice detail (updated)

### Mobile App Components

#### 1. QR Scanner Screen
**File**: `CitizenNoticeApp/app/qr-scanner.tsx`

Features:
- Camera-based QR scanning using expo-camera
- Manual QR code entry fallback
- Permission handling
- Async storage integration

#### 2. QR Notices Screen
**File**: `CitizenNoticeApp/app/qr-notices/[villageId].tsx`

Features:
- Village-specific notice listing
- Category filtering
- Pagination
- Swipe-to-refresh
- Local village info display

#### 3. Local Storage Utility
**File**: `CitizenNoticeApp/utils/qrStorage.ts`

Functions:
```typescript
getScannedVillage()          // Get current scanned village
saveScannedVillage()         // Save village data locally
clearScannedVillage()        // Clear active scan
getScanHistory()             // Get scanning history
clearScanHistory()           // Clear all history
removeFromHistory()          // Remove specific village
isVillageScanned()           // Check if village is already scanned
getAllScannedVillages()      // Get all scanned villages
```

#### 4. Home Screen Update
**File**: `CitizenNoticeApp/app/index.tsx`

Added "Scan QR" button in Quick Access section:
- Direct link to QR scanner
- Positioned alongside other quick actions
- Special icon (📱) for easy identification

#### 5. Package Dependencies
**File**: `CitizenNoticeApp/package.json`

Added:
- `expo-camera@~15.1.0` - For QR scanning on mobile

## Data Flow

### QR Scanning Flow

1. **Frontend/Mobile**: User scans QR code
   ```
   Camera captures QR → Extract uniqueId from QR code
   ```

2. **Verify with Backend**:
   ```
   GET /villages/qr/{qrCodeId}
   → Backend finds village by qrCode.uniqueId
   → Returns village data
   ```

3. **Store Locally**:
   ```
   localStorage/AsyncStorage stores:
   {
     villageId: MongoDB ObjectId,
     villageName: "Village Name",
     district: "...",
     state: "...",
     pincode: "...",
     qrCodeId: "UUID from QR",
     scannedAt: ISO timestamp
   }
   ```

4. **Access Notices**:
   ```
   GET /notice/village/{villageId}?page=1&limit=10&category=all
   → Returns paginated notices for that village
   ```

5. **Resume Later**:
   ```
   User can access scanned village from:
   - History on scanner page
   - Recently scanned in localStorage
   - Without needing to scan again
   ```

## QR Code Generation

### How to Generate QR Codes for Villages

The QR code should encode the `uniqueId` from the village's `qrCode.uniqueId` field.

#### For Officials/Admin:

1. **Get Village QR Code**:
   ```
   GET /villages/{villageId}/qrcode
   Response: { village: { _id, name, qrCode: { uniqueId } } }
   ```

2. **Generate QR Code Image**:
   - Use online tool or library with the `uniqueId`
   - Example: `https://qr-server.com/api/qr?url={uniqueId}`
   - Recommended: Server-side generation and storage

3. **Print/Post**:
   - Print QR codes and place in village
   - Share digitally with officials
   - Include instructions for citizens

### QR Code Content
The QR code should encode:
```
{uniqueId}  // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

## Usage Instructions for Citizens

### On Web Frontend:
1. Navigate to `/qr-scanner`
2. Click "Scan Village QR Code"
3. Allow camera access
4. Point camera at QR code
5. Or manually enter code
6. View village notices
7. `scannedVillage` saved in localStorage

### On Mobile App:
1. Tap "Scan QR" from Quick Access
2. Allow camera permission
3. Scan village QR code
4. Village info saved in AsyncStorage
5. View notices immediately
6. Access history from storage

## Data Storage

### Frontend (Browser)
- **Storage**: `localStorage`
- **Key**: `scannedVillage`
- **Persistence**: Until cleared

### Mobile App
- **Storage**: React Native AsyncStorage
- **Keys**: 
  - `scannedVillage` - Current active scan
  - `scannedVillagesHistory` - Last 10 scans
- **Persistence**: Until cleared

## Security & Privacy

1. **No Authentication Required**: By design for accessibility
2. **No Personal Data Stored**: Only village ID and QR code
3. **Public Data Only**: Notices are already public
4. **Optional Tracking**: QR scan history is optional
5. **Local Storage Only**: No server-side tracking of scans

## API Response Examples

### Get Village by QR Code
```javascript
GET /villages/qr/550e8400-e29b-41d4-a716-446655440000

Response:
{
  message: "Village found",
  village: {
    _id: "507f1f77bcf86cd799439011",
    name: "Kasaba",
    district: "Pune",
    state: "Maharashtra",
    pincode: "410206",
    latitude: 18.5204,
    longitude: 73.8567
  }
}
```

### Get Notices by Village
```javascript
GET /notice/village/507f1f77bcf86cd799439011?page=1&limit=10&category=all

Response:
{
  notices: [
    {
      _id: "...",
      title: "Gram Sabha Meeting",
      description: "...",
      category: "general",
      priority: "high",
      views: 245,
      createdBy: { name: "Official Name" },
      ...
    },
    ...
  ],
  village: { _id, name, district, state, pincode },
  totalPages: 5,
  currentPage: 1,
  total: 47
}
```

## Future Enhancements

1. **QR Code Generation Service**:
   - Server-side QR image generation
   - Store generated images in Cloudinary
   - Admin dashboard QR download

2. **QR Analytics**:
   - Track which QR codes are scanned
   - Count scans per village
   - Popular notice tracking

3. **Dynamic QR Updates**:
   - Update QR code validity periods
   - Disable old QR codes
   - QR code refresh strategy

4. **Multi-Village Support**:
   - Toggle between scanned villages
   - Compare notices across villages
   - Regional notice aggregation

5. **Batch QR Generation**:
   - Generate QR codes for multiple villages
   - Export as PDF for printing
   - QR code template customization

## Testing

### Manual Testing Checklist

- [ ] **Backend**:
  - [ ] Village QR endpoints return correct data
  - [ ] Notice filtering works by village
  - [ ] Pagination works correctly

- [ ] **Frontend (Web)**:
  - [ ] QR scanner permissions work
  - [ ] Manual entry fallback works
  - [ ] LocalStorage persists data
  - [ ] Notices display correctly
  - [ ] Category filtering works

- [ ] **Mobile**:
  - [ ] Camera permissions granted
  - [ ] QR code scanning captures correctly
  - [ ] AsyncStorage saves village data
  - [ ] Notices load and display
  - [ ] Category filtering works
  - [ ] History is maintained

### QR Code Testing
Generate test QR codes with sample UUIDs:
- `550e8400-e29b-41d4-a716-446655440000`
- Can use online generators or qrcode libraries

## Troubleshooting

### QR Not Scanning
- Check camera permissions
- Ensure sufficient lighting
- Try manual entry instead
- Verify QR code isn't damaged

### Notices Not Loading
- Check internet connection
- Verify village ID is correct
- Check backend API health
- Look at network tab for errors

### Data Not Persisting
- Clear localStorage/AsyncStorage
- Check browser privacy settings
- Verify storage quota available
- Check browser console for errors

## Files Modified/Created

### Backend
- ✅ `backend/models/Village.js` - Added QR code fields
- ✅ `backend/controllers/villageController.js` - Added QR functions
- ✅ `backend/routes/villageRoutes.js` - Added QR endpoints
- ✅ `backend/controllers/noticeController.js` - Added village notices function
- ✅ `backend/routes/noticeRoutes.js` - Added notice route

### Frontend
- ✅ `frontend/src/components/QRScanner.jsx` - New
- ✅ `frontend/src/components/Html5QrcodePlugin.jsx` - New
- ✅ `frontend/src/pages/QRNotices.jsx` - New
- ✅ `frontend/src/services/api.js` - Added QR functions
- ✅ `frontend/src/App.jsx` - Added routes

### Mobile App
- ✅ `CitizenNoticeApp/app/qr-scanner.tsx` - New
- ✅ `CitizenNoticeApp/app/qr-notices/[villageId].tsx` - New
- ✅ `CitizenNoticeApp/utils/qrStorage.ts` - New
- ✅ `CitizenNoticeApp/app/index.tsx` - Added QR button
- ✅ `CitizenNoticeApp/package.json` - Added expo-camera

## Installation & Setup

### Backend
```bash
cd backend
npm install uuid  # If not already installed
npm start
```

### Frontend
```bash
cd frontend
npm install  # html5-qrcode is included
npm run dev
```

### Mobile App
```bash
cd CitizenNoticeApp
npm install  # Installs expo-camera
npm start
```

## License & Contributing
Part of GramVartha project. Follow project guidelines for contributions.
