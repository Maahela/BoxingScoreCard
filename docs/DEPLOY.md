# Deployment Guide - Firebase Hosting

## Quick Deploy

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Hosting (One-time setup)

```bash
firebase init hosting
```

**Configuration prompts:**

- Use existing project: Select your boxing scorecard project
- Public directory: `dist`
- Single-page app: `Yes`
- Overwrite index.html: `No`
- Setup GitHub actions: `No` (optional)

### Step 4: Build Your App

```bash
npm run build
```

This creates the `dist/` folder with optimized production files.

### Step 5: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**Deployment output:**

```
Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project-id.web.app
```

---

## Access URLs for Competition Day

### For Administrators:

```
URL: https://your-project-id.web.app/login
PIN: 123456
Role: Full control (add/edit data)
```

### For Judges:

```
URL: https://your-project-id.web.app/login

Shadow Boxing Judge:
PIN: 111111

Punching Bag Judge:
PIN: 222222

Skipping Judge:
PIN: 333333

Boxing Combat Judge:
PIN: 444444
```

### For Display Screen (Projector):

```
URL: https://your-project-id.web.app/display
No PIN required - loads automatically
Full screen mode: Press F11
```

---

## Update Deployment

To redeploy after making changes:

```bash
# 1. Make code changes
# 2. Build production assets
npm run build

# 3. Deploy to hosting
firebase deploy --only hosting
```

Deployment completes in approximately 30 seconds and is live immediately.

---

## Custom Domain Configuration (Optional)

To use a custom domain such as `boxing.youruni.lk`:

1. Navigate to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Follow the provided DNS setup instructions
5. Wait for automatic SSL certificate provisioning

Firebase Hosting includes free SSL certificates for custom domains.

---

## Pre-Competition Testing

### Verification Steps

```bash
# Deploy to production
firebase deploy --only hosting

# Test on mobile devices
# Login with each PIN
# Verify all features work correctly
```

### QR Code Generation

Generate QR codes for each role to simplify access:

- Admin: Link to `/login` with PIN reference
- Judges: Individual QR codes per judge
- Display: Link to `/display`

Recommended tool: https://www.qr-code-generator.com/

### Preparation Materials

**Judge Instructions Example:**

```
┌─────────────────────────────────┐
│   SHADOW BOXING JUDGE           │
├─────────────────────────────────┤
│ 1. Scan QR or visit:            │
│    boxing.web.app/login         │
│                                 │
│ 2. Enter PIN: 111111            │
│                                 │
│ 3. Select Event → Participant   │
│    → Score each criterion       │
│                                 │
│ 4. Submit when complete         │
└─────────────────────────────────┘
```

### Contingency Planning

- Capture periodic screenshots of all scores
- Ensure devices remain plugged in during competition
- Have mobile hotspot available as backup connectivity
- Maintain printed blank score sheets as fallback

---

## Security Checklist

Pre-competition verification:

- [ ] Deploy Firestore security rules:

  ```bash
  firebase deploy --only firestore:rules
  ```

- [ ] Verify PIN authentication for all roles

- [ ] Confirm display screen real-time updates

- [ ] Test on mobile devices used by judges

- [ ] Verify projector display resolution compatibility

---

## Event Monitoring

### Firebase Console Access:

```
https://console.firebase.google.com
→ Firestore Database
→ Monitor real-time data entries
```

### Usage Monitoring:

```
Firebase Console → Usage and billing
→ Track database reads/writes
→ Free tier limits: 50K reads + 20K writes per day
```

---

## Troubleshooting

### Firebase CLI not recognized

```bash
npm install -g firebase-tools
firebase --version
```

### Build errors

```bash
# Verify .env file exists with all required variables
npm run build
```

### Deployment failures

```bash
# Re-authenticate with Firebase
firebase logout
firebase login
firebase deploy --only hosting
```

### Application runtime errors

```bash
# Check browser console for errors (F12)
# Verify Firestore security rules are deployed:
firebase deploy --only firestore:rules
```


---

## Firebase Free Tier Resources

**Firebase Hosting:**

- 10 GB storage
- 360 MB/day bandwidth
- Free SSL certificate
- Custom domain support

**Firebase Firestore:**

- 50,000 document reads per day
- 20,000 document writes per day
- 1 GB storage

**Typical Competition Usage:**

- Approximately 1000 reads (display screen updates)
- Approximately 200 writes (score submissions)
- Approximately 1 MB storage

This usage is well within the Firebase free tier limits.

---

## Pre-Competition Checklist

Verification steps before event day:

- [ ] Application deployed to Firebase Hosting
- [ ] Custom domain configured (if applicable)
- [ ] All PIN codes tested and functional
- [ ] Display screen tested on projector hardware
- [ ] Mobile devices tested for judge interfaces
- [ ] Firestore security rules deployed
- [ ] Initial data seeded to database
- [ ] QR codes generated and printed
- [ ] Instruction materials prepared
- [ ] Backup connectivity tested

---

## Quick Deployment

Complete deployment in three commands:

```bash
firebase login
npm run build
firebase deploy --only hosting
```

The application will be live in approximately 60 seconds.

---

For additional support, consult the Firebase Console for your hosting URL and configuration details.
