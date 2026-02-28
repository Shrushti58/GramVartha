# QR Code Setup Guide for Officials & Village Admins

## Overview
This guide explains how to generate, distribute, and manage village QR codes for GramVartha. Once a village QR code is scanned by citizens, they can view all notices without logging in.

---

## Step 1: Get Your Village's QR Code ID

### For Village Admins/Officials

1. **Login to Admin/Official Dashboard**
   - Go to your dashboard
   - Select your village

2. **Get the QR Code Unique ID**
   - Contact your superadmin or use the API endpoint:
   ```
   GET /villages/{villageId}/qrcode
   ```
   - Note down the `qrCode.uniqueId` value
   - Example: `550e8400-e29b-41d4-a716-446655440000`

3. **Save the ID**
   - Keep this ID safe - it's your village's unique identifier
   - This ID is generated automatically when the village is created
   - It never changes

---

## Step 2: Generate QR Code Images

### Option A: Quick Online Tool (Recommended)

1. **Visit a QR Code Generator**:
   - Go to: https://www.qr-code-generator.com/
   - Or: https://www.qrcode-monkey.com/
   - Or: https://qr-code-generator.com/

2. **Enter Your Village's QR Code ID**:
   - Copy your `uniqueId` from Step 1
   - Paste it into the QR generator
   - Make sure it's just the ID string (no extra text)

3. **Generate the QR Code**:
   - Click "Generate" or "Create QR Code"
   - Preview the code
   - Make sure it scans properly

4. **Download the Image**:
   - Choose PNG or SVG format (PNG recommended)
   - Download high resolution (at least 300x300 pixels)
   - Save with a clear name like: `Village_Name_QR.png`

### Option B: Using Code (For Developers)

```javascript
// Node.js example
const QRCode = require('qrcode');

const villageId = '550e8400-e29b-41d4-a716-446655440000'; // Your QR code ID

QRCode.toFile('village_qr.png', villageId, {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  width: 300,
  margin: 1,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
}, (err) => {
  if (err) throw err;
  console.log('QR code generated!');
});
```

### Option C: Future - Server-Side Generation
- Once implemented, you'll be able to generate QR codes directly from the admin dashboard
- They will be stored in Cloudinary
- You can download from admin panel

---

## Step 3: Print & Post QR Codes

### Printing Guidelines

**Recommended Specifications**:
- Size: At least 4 cm × 4 cm (1.6" × 1.6")
- Larger is better (5 cm × 5 cm or 7 cm × 7 cm)
- Resolution: 300 DPI minimum
- Paper: Matte white paper (glossy reduces scannability)
- Margin: At least 4 mm white space around QR code

**Printing Process**:
1. Open the PNG file in any image viewer
2. Print (Ctrl+P / Cmd+P)
3. Adjust print settings:
   - Scale: 100% (don't resize)
   - Paper size: Standard
   - Margins: Minimal
4. Print on quality paper
5. Let ink dry completely

### Locations to Post QR Codes

**High Traffic Areas**:
- Panchayat office entrance
- Village notice board
- Community center
- School/College gates
- Hospital/Health center
- Market area
- Bus stop
- Public announcements area

**Suggested Placements**:
- At eye level (1.5m - 2m high)
- In protected areas (under covered structures)
- Away from direct sunlight
- In well-lit areas
- Near existing notice boards
- Multiple copies in different locations

**Protection Tips**:
- Use plastic covers to protect from weather
- Mount on sturdy boards
- Use weatherproof adhesive
- Replace if damaged
- Keep records of where QR codes are placed

---

## Step 4: Distribute QR Codes Digitally

### For Officials & Village Leaders

**Email Distribution**:
```
Dear Village Officials,

Please find attached your village's QR code and instructions.
Share this with your community through:
- Email
- SMS
- WhatsApp groups
- Social media
- Facebook groups
- Community Telegram channels

QR Code ID: 550e8400-e29b-41d4-a716-446655440000

Instructions:
1. Use your phone camera or the GramVartha app
2. Point at the QR code
3. Click the link or notification
4. View all village notices instantly
5. No login required!
```

**Digital Share Format**:
- PNG file (for emailing)
- PDF with instructions
- WhatsApp sticker (future)
- Social media posts

---

## Step 5: Create User Instructions

### Instructions for Citizens

#### On Smartphone

**Method 1: Using GramVartha Mobile App** (Recommended for regulars)
1. Open GramVartha app
2. From home screen, tap "Scan QR" in Quick Access (📱 icon)
3. Allow camera access
4. Point camera at the village QR code
5. Wait for it to scan
6. Your village info is automatically saved
7. View all notices from that village
8. You won't need to scan again!

**Method 2: Using Phone Camera** (Quick for one-time access)
1. Open your phone's Camera app
2. Point at the QR code
3. A notification will appear with a link
4. Tap to open GramVartha website
5. View notices in browser

#### On Computer/Laptop

**Using Website**
1. Go to GramVartha website
2. Click "Scan QR Code"
3. Allow camera access
4. Point your computer camera at the QR code
5. Or manually enter the QR code ID
6. View all village notices

### Sample Instruction Poster

```
═══════════════════════════════════════════════════════════════
                    📋 VILLAGE NOTICES 📋
                        SCAN TO VIEW
═══════════════════════════════════════════════════════════════

1. USE YOUR PHONE CAMERA
   ↓ Point at QR code below ↓

   [QR CODE IMAGE HERE]

2. TAP THE NOTIFICATION THAT APPEARS

3. INSTANT ACCESS TO ALL VILLAGE NOTICES!
   ✓ No login needed
   ✓ All important announcements
   ✓ Emergency alerts
   ✓ Schemes & benefits
   ✓ Events & meetings

4. OR USE GRAMVARTHA APP
   Download from your app store
   Tap "Scan QR" button

═══════════════════════════════════════════════════════════════
          For support: contact@gramvartha.in
═══════════════════════════════════════════════════════════════
```

---

## Step 6: Track Usage (If Needed)

### Admin Dashboard (Future Feature)
Once implemented, the admin dashboard will show:
- Number of times QR code was scanned
- Popular notices by village
- Peak scan times
- Device types used
- Geographic access patterns

### Manual Tracking
For now, you can manually track:
- How many citizens approach the QR code
- If they successfully view notices
- Feedback from community

---

## Best Practices

### DO ✅

✅ **Place multiple QR codes**
- Different locations in village
- Increases awareness
- Ensures accessibility

✅ **Make it visible**
- Large size
- Clear, clean image
- Protected from weather
- Well-lit area

✅ **Provide instructions**
- Print instructions nearby
- Use known languages
- Simple 3-step process
- Include IT support number

✅ **Maintain QR codes**
- Replace damaged codes
- Keep areas around codes clean
- Check regularly (weekly)
- Update if moved

✅ **Promote regularly**
- Mention in meetings
- Include in official communications
- Social media posts
- Word of mouth

### DON'T ❌

❌ **Don't print tiny QR codes**
- Minimum 4cm × 4cm
- Otherwise hard to scan

❌ **Don't place in dark areas**
- Won't scan properly
- Citizens will get frustrated

❌ **Don't ignore damaged QR codes**
- Replace immediately
- Reflects poorly on village

❌ **Don't share QR code ID widely**
- Not secret, but not needed publicly
- Citizens need QR code image, not the ID

❌ **Don't change QR code frequently**
- It never changes
- Once printed, it stays the same

---

## Troubleshooting

### QR Code Won't Scan
**Problem**: Camera shows error
- **Solution**: 
  - Ensure good lighting
  - Clean camera lens
  - Try from different angle
  - Use manual entry instead (citizen types in the ID)

### Notices Not Showing
**Problem**: Citizens scan but see "No notices"
- **Solution**:
  - Check if notices are published
  - Verify they're visible to "all" audience
  - Refresh the page
  - Clear app cache

### Too Many People Gathering
**Problem**: QR code location attracts crowds
- **Solution**:
  - Place additional QR codes in other areas
  - Provide instructions to reduce confusion
  - Schedule times if needed
  - Use digital distribution

### Technical Questions
**Problem**: Don't know how to get QR code ID
- **Solution**:
  - Contact your superadmin
  - Use the backend API: `GET /villages/{villageId}/qrcode`
  - Email support team

---

## Communication Templates

### Email Template to Citizens

```
Subject: 📱 Easy Access to Village Notices - Scan QR Code

Dear Residents of [Village Name],

Great news! You can now access all important village notices instantly by scanning a QR code.

📍 QR CODE LOCATIONS:
- Panchayat office entrance
- Community center notice board
- Market area (east side)

📱 HOW TO USE:

On Your Smartphone:
1. Point your camera at the QR code
2. Tap the notification that appears
3. View all village notices instantly!

Using GramVartha App:
1. Download the app from your app store
2. Tap "Scan QR" 
3. Point at QR code
4. Instant access!

On Your Computer:
1. Visit [website]
2. Click "Scan QR Code"
3. Point your computer camera at QR code

✅ NO LOGIN REQUIRED
✅ NO CHARGES
✅ FREE TO USE
✅ AVAILABLE 24/7

Benefits:
- Instant notifications
- Emergency alerts
- Important announcements
- Government schemes
- Events and meetings
- Birth certificates & more

Questions? Contact us at [contact info]

Regards,
[Village Name] Administration
```

### WhatsApp Message Template

```
📱 *VILLAGE NOTICES - SCAN QR CODE* 📱

Easy access to all village notices!

🔸 Just scan the QR code
🔸 No login needed
🔸 Instant information
🔸 Always available

📍 Find QR codes at:
✓ Panchayat office
✓ Community center  
✓ Market area

Or download GramVartha app and tap "Scan QR"!

Questions? Call: [number]
```

---

## Summary Checklist

- [ ] Get village QR Code ID from admin dashboard
- [ ] Generate QR code image (min 4cm × 4cm)
- [ ] Print on quality paper (300 DPI)
- [ ] Protect with plastic cover
- [ ] Place in 3-5 high-traffic locations
- [ ] Create instruction poster
- [ ] Share digital QR code with officials
- [ ] Announce in meetings/communications
- [ ] Monitor placement and upkeep
- [ ] Gather feedback from citizens
- [ ] Report issues to technical team

---

## Support & Resources

**Documentation**:
- QR Code Feature Guide: `QR_CODE_FEATURE_DOCUMENTATION.md`
- Quick Setup Guide: `QR_CODE_QUICK_SETUP.md`

**Support Contacts**:
- Email: support@gramvartha.in
- Phone: [Contact Number]
- Portal: [Support Website]

**Video Tutorials** (Coming Soon):
- How to generate QR codes
- How to use GramVartha QR scanner
- Troubleshooting common issues

---

**Document Version**: 1.0
**Last Updated**: February 24, 2025
**Created for**: Village Admins, Officials, and Community Leaders
