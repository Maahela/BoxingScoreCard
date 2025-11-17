# 🚀 Deployment Guide - Firebase Hosting (FREE)

## Quick Deploy (5 minutes)

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

**When prompted, answer:**

- ✅ **Use existing project** → Select your boxing scorecard project
- ✅ **Public directory:** `dist` (type: dist)
- ✅ **Single-page app:** `Yes`
- ✅ **Overwrite index.html:** `No`
- ✅ **Setup GitHub actions:** `No` (optional)

### Step 4: Build Your App

```bash
npm run build
```

This creates the `dist/` folder with optimized production files.

### Step 5: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**Done!** You'll see output like:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project-id.web.app
```

---

## 📱 Share These URLs on Competition Day

### For Admins:

```
URL: https://your-project-id.web.app/login
PIN: 123456
Role: Full control (add/edit data)
```

### For Invigilators:

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
No PIN needed - auto-loads
Full screen mode: Press F11
```

---

## 🔄 Update Your App Later

If you make changes and want to redeploy:

```bash
# 1. Make your changes in code

# 2. Build
npm run build

# 3. Deploy
firebase deploy --only hosting
```

**Takes 30 seconds!** Live immediately.

---

## 🌐 Custom Domain (Optional)

Want a custom domain like `boxing.youruni.lk`?

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain
4. Follow DNS setup instructions
5. Wait for SSL certificate (automatic)

**Still FREE!** Firebase Hosting includes free SSL.

---

## 💡 Pro Tips for Competition Day

### 1. Test Before Event

```bash
# Deploy to test
firebase deploy --only hosting

# Visit URL on mobile
# Login with each PIN
# Verify all features work
```

### 2. Create QR Codes

Generate QR codes for each role:

- Admin QR: Link to `/login` with PIN printed below
- Invigilator QRs: One per judge
- Display QR: Link to `/display`

Use: https://www.qr-code-generator.com/

### 3. Print Instruction Cards

**For Invigilators:**

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

### 4. Backup Plan

- Screenshot all scores periodically
- Keep laptop plugged in
- Have mobile hotspot ready
- Print blank score sheets as backup

---

## 🔒 Security Checklist

Before competition day:

- [ ] Deploy Firestore security rules:

  ```bash
  firebase deploy --only firestore:rules
  ```

- [ ] Verify PINs work (login test)

- [ ] Check display screen auto-refreshes

- [ ] Test on mobile devices (judges' phones)

- [ ] Verify projector resolution (1920x1080)

---

## 📊 Monitoring During Event

### Firebase Console:

```
https://console.firebase.google.com
→ Firestore Database
→ See real-time data as it's entered
```

### Check Usage:

```
Firebase Console → Usage and billing
→ Monitor database reads/writes
→ Free tier: 50K reads + 20K writes/day
(More than enough for your event!)
```

---

## 🆘 Troubleshooting

### "Firebase command not found"

```bash
npm install -g firebase-tools
firebase --version
```

### Build fails

```bash
# Check .env file exists
# Verify all Firebase config values are set
npm run build
```

### Deploy fails

```bash
# Re-authenticate
firebase logout
firebase login
firebase deploy --only hosting
```

### App shows errors

```bash
# Check browser console (F12)
# Verify Firestore rules deployed:
firebase deploy --only firestore:rules
```

---

## 💰 Cost Breakdown (FREE Tier)

**Firebase Hosting:**

- 10 GB storage ✅
- 360 MB/day data transfer ✅
- Free SSL certificate ✅
- Custom domain support ✅

**Firebase Firestore:**

- 50,000 reads/day ✅
- 20,000 writes/day ✅
- 1 GB storage ✅

**Your Competition Needs:**

- ~1000 reads (display screen)
- ~200 writes (score submissions)
- ~1 MB storage

**Result:** Well within free tier! 💚

---

## 🎯 Final Checklist

Before competition day:

- [ ] App deployed to Firebase Hosting
- [ ] Custom URL working (if using)
- [ ] All PINs tested
- [ ] Display screen tested on projector
- [ ] Mobile devices tested (invigilators)
- [ ] Firestore rules deployed
- [ ] Seed data populated
- [ ] QR codes printed
- [ ] Instruction cards ready
- [ ] Backup internet connection tested

---

## 🚀 Deploy Now!

```bash
# Complete deployment in 3 commands:
firebase login
npm run build
firebase deploy --only hosting
```

**Your app will be live in ~60 seconds!** 🎉

---

**Questions?** Check Firebase Console for your live URL!
