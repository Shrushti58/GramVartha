# GramVartha — Village Notices (QR-first)

Comprehensive README for the GramVartha repository (backend, frontend, mobile).

---

## Project Overview
GramVartha is a minimal village notice distribution platform where officials publish notices for a village and citizens access those notices by scanning a village-specific QR code. The system uses QR codes as the single, public, anonymous access mechanism (no citizen registration required).

This workspace contains:
- `backend/` — Node.js + Express API and MongoDB models/controllers
- `frontend/` — React (Vite) web UI with QR scanner and notices pages
- `CitizenNoticeApp/` — React Native (Expo) mobile app (already QR-first)
- Documentation and helper scripts at the repository root

Key decisions:
- QR codes are the sole public entry point for citizens to view village notices.
- Location-based discovery and ward-specific targeting were removed.
- Citizen login/register/dashboard flows were removed from the web app.

---

## Architecture (high level)
- Backend: Express, Mongoose (MongoDB), Cloudinary integration for QR images, `qrcode` library to generate QR images.
- Frontend (web): React + Vite, Tailwind CSS, `html5-qrcode` used for scanning in-browser.
- Mobile: Expo (React Native) app provides the same QR-first UX.

Important files
- [backend/controllers/villageController.js](backend/controllers/villageController.js)
- [backend/controllers/noticeController.js](backend/controllers/noticeController.js)
- [backend/models/Village.js](backend/models/Village.js)
- [frontend/src/components/QRScanner.jsx](frontend/src/components/QRScanner.jsx)
- [frontend/src/pages/QRNotices.jsx](frontend/src/pages/QRNotices.jsx)
- [QR_SCANNING_TEST_GUIDE.md](QR_SCANNING_TEST_GUIDE.md)

---

## Quick Start / Development
Prerequisites
- Node.js (16+ recommended)
- npm
- MongoDB (local or remote)
- Cloudinary account (optional — for QR uploads)

Environment variables (create a `.env` in `backend/`):

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gramvartha
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
JWT_SECRET=some_secret_here
```

Start backend

```bash
cd backend
npm install
npm run dev   # or `node app.js` depending on your scripts
```

Start frontend

```bash
cd frontend
npm install
npm run dev
# Vite usually runs on http://localhost:5173
```

Start mobile app

```bash
cd CitizenNoticeApp
npm install
npx expo start
```

---

## Important Endpoints
- GET `/villages/qr/:qrCodeId` — resolve village by QR unique ID (public)
- GET `/villages/debug/qr-codes` — debug endpoint returning villages and their QR IDs (added for troubleshooting)
- POST `/villages/:id/qrcode/generate` — generate QR image (protected, admin)
- GET `/notice/village/:villageId` — fetch notices for a village (public)
- POST `/notice/upload` — upload a new notice (officials)

See [backend/routes/villageRoutes.js](backend/routes/villageRoutes.js) and [backend/routes/noticeRoutes.js](backend/routes/noticeRoutes.js) for full routes.

---

## QR Workflow (User-facing)
1. Officials generate a unique QR code for each village. The QR payload is the village `qrCode.uniqueId`.
2. Citizens open the web app or mobile app and scan the QR code.
3. The app resolves the village via `/villages/qr/:qrCodeId`, saves minimal village info to browser `localStorage` and navigates to `/qr-notices/:villageId`.
4. The web app reuses the saved `scannedVillage` so users do not have to scan every time. They can "Use Saved Village", "Scan New", or "Clear".

Files that implement scan/save logic:
- [frontend/src/components/QRScanner.jsx](frontend/src/components/QRScanner.jsx)
- [frontend/src/pages/QRNotices.jsx](frontend/src/pages/QRNotices.jsx)

---

## Troubleshooting & Debugging
- If scanning succeeds but notices page shows an error, open browser devtools Console and Network tabs.
- Use the debug endpoint to confirm which villages and QR IDs exist:

```bash
curl http://localhost:3000/villages/debug/qr-codes
```

- If the backend returns "Village is not approved yet" ensure the village document has `status: "approved"`.
- If the scanner emits `Cannot stop, scanner is not running or paused.`, update to the latest `html5-qrcode` and check console logs — the web component now includes guards and a `stopScanner()` helper to handle race conditions.

For hands-on step-by-step scanning and debug steps see: [QR_SCANNING_TEST_GUIDE.md](QR_SCANNING_TEST_GUIDE.md)

---

## Notes on Removed Features
The codebase was simplified to the QR-first model. Following features were intentionally removed:
- Location-based discovery (`getNoticesByLocation`) and related UI
- Ward-specific targeting fields in `Notice` schema
- Citizen registration/login/dashboard flow in the web app

This is intentional to keep citizen access anonymous and frictionless via QR.

---

## Development Tips
- When testing scanning on desktop use the manual entry textbox on the QR scanner page to submit a `qrCode.uniqueId` directly.
- Use the `/villages/debug/qr-codes` endpoint to get the list of QR IDs for testing without generating images.
- If you need to regenerate a QR image for a village (admin only): call the generate endpoint and ensure Cloudinary credentials are configured in `.env`.

---

## Contributing
- Create feature branches from `main`.
- Run backend and frontend locally and ensure linting/tests pass (if present).
- Keep changes minimal and focused; this repository has cross-cutting changes touching both mobile and web scanning logic.

---

## License
Add your preferred license here (e.g., MIT). If the project already has a license, keep that.

---

## Contact
For questions about setup or the QR-first workflow, consult the `QR_SCANNING_TEST_GUIDE.md` or open an issue in the repo.

---

(README generated: 2026-02-28)
