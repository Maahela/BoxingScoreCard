# 🚀 Quick Start Guide

## Get Running in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Firebase

1. Go to https://console.firebase.google.com/
2. Create new project
3. Enable Firestore Database (test mode)
4. Add web app and copy config

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials.

### 4. Deploy Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase init  # Select Firestore only
firebase deploy --only firestore:rules
```

### 5. Seed Sample Data

```bash
npm run seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## 🔑 Test Logins

- **Admin**: PIN `123456`
- **Display**: PIN `999999`
- **Shadow Judge**: PIN `111111`
- **Bag Judge**: PIN `222222`
- **Skip Judge**: PIN `333333`
- **Combat Judge**: PIN `444444`

## 📱 Test Flow

1. Open 3 browser windows:

   - Window 1: Login as Admin (123456)
   - Window 2: Login as Invigilator (111111)
   - Window 3: Login as Display (999999)

2. In Invigilator window:

   - Select "Shadow Boxing" event
   - Select a participant
   - Enter scores (use +/- buttons)
   - Submit

3. Watch Display window update in real-time!

## 🏗️ Build for Production

```bash
npm run build
firebase deploy --only hosting
```

---

Need help? Check the full [README.md](README.md)
