# GramVartha Play Store Readiness

## Required Before Production Submission

- Host `PRIVACY_POLICY.md` at a public HTTPS URL.
- Add that URL in Play Console > App content > Privacy policy.
- Complete Play Console > App content > Data safety.
- Provide app access instructions for reviewer accounts if login is required to test complaint features.
- Confirm the production API base URL uses HTTPS.

## Data Safety Draft

Declare collection for:

- Personal info: name, phone number.
- User IDs: citizen account ID or backend user identifier.
- Location: approximate and precise location, only when the user files a complaint with location.
- Photos and videos: photos, only when the user attaches complaint evidence.
- Device or other IDs: Expo push notification token/device notification identifier.
- App activity: complaint submissions, notice interactions, scheme assistant queries if stored or sent to the backend.
- Other user-generated content: complaint text, category, and related user-submitted details.

Declare purposes:

- App functionality.
- Account management.
- Developer communications for notifications.
- Fraud prevention, security, and compliance, if backend logs/security checks are used.
- Analytics only if analytics is actually collected.

Security practices:

- Data is encrypted in transit only when production API URLs use HTTPS.
- Account deletion is available in the app.
- Data is not sold.

## Permission Declaration Notes

Current Android permissions are for:

- Camera: QR scan and complaint evidence capture.
- Location: complaint location attachment.
- Photos: selected complaint evidence attachment.
- Notifications: village notices and complaint updates.
- Internet: backend API access.
- Vibrate: QR scan/user feedback.

Do not request audio, video, broad storage, overlay, or legacy external storage permissions.
