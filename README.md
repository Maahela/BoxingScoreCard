# Boxing Scoreboard - Interfaculty Boxing Freshers 2024

A real-time scoring web application for boxing competitions with mobile-first design, built with React, TypeScript, Tailwind CSS, and Firebase Firestore.

## 🥊 Features

### Three Role-Based Dashboards

1. **Admin Dashboard**

   - Create and manage faculties, participants, events, and scoring templates
   - Assign invigilators to events
   - Create rounds and manage competition flow
   - Full CRUD operations on all entities

2. **Invigilator Dashboard (Mobile-Optimized)**

   - PIN-based authentication
   - Event-specific assignment
   - Faculty and participant selection
   - Large touch-friendly score input with +/- buttons
   - Criteria-based scoring with max point validation
   - Two-step submit with preview

3. **Display Screen (Projector-Optimized)**
   - Real-time score updates via Firestore listeners
   - Toggle between Summary and Detailed views
   - Large typography and high contrast
   - Auto-scaling for projector resolution
   - Live indicator

### Technical Highlights

- **Real-time Updates**: Firestore `onSnapshot` listeners for instant score synchronization
- **Mobile-First Design**: Optimized touch interactions for invigilators
- **Type-Safe**: Full TypeScript implementation
- **PIN Authentication**: Secure role-based access without email/password
- **Offline-Ready**: Firebase handles connection drops gracefully
- **Client-Side Aggregation**: Faculty totals computed in real-time

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **Database**: Firebase Firestore
- **Routing**: React Router v6
- **Hosting**: Firebase Hosting (optional)

## 📦 Prerequisites

- Node.js 18+ and npm
- Firebase account (free Spark plan works)
- Modern browser (Chrome, Firefox, Safari, Edge)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
cd BoxingScoreCard
npm install
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Firestore Database**:

   - Go to Firestore Database → Create Database
   - Start in **Test Mode** (we'll update rules later)
   - Choose your region

4. Register a Web App:
   - Go to Project Settings → Your Apps → Add App → Web
   - Register app name: `Boxing Scoreboard`
   - Copy the Firebase config object

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase config from step 2:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

### 4. Deploy Firestore Security Rules

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select:
# - Firestore
# - Use existing project
# - Accept default firestore.rules and firestore.indexes.json

# Deploy security rules
firebase deploy --only firestore:rules
```

### 5. Seed Sample Data

Update `src/lib/seedData.ts` with your Firebase config (same as .env), then run:

```bash
npm run seed
```

This creates:

- 4 Faculties: UCSC, Management, Technology, Science
- 4 Events: Shadow Boxing, Punching Bag, Skipping, Boxing Combat
- 4 Scoring Templates with criteria
- 8 Participants (2 per faculty)
- 4 Invigilators (1 per event)
- PIN authentication records

**Sample PINs** (created by seed script):

- Admin: `123456`
- Display Screen: `999999`
- Shadow Boxing Judge: `111111`
- Punching Bag Judge: `222222`
- Skipping Judge: `333333`
- Combat Judge: `444444`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎯 Usage Guide

### For Administrators

1. Login with PIN: `123456`
2. Navigate through tabs: Faculties, Participants, Events, Templates
3. Add/Edit entities using the forms
4. Assign invigilators to events

### For Invigilators (Mobile Judging)

1. Login with assigned PIN (e.g., `111111` for Shadow Boxing)
2. Select your assigned event
3. Select participant to score
4. Enter scores for each criterion (use +/- buttons or keyboard)
5. Review total and submit
6. Move to next participant

### For Display Screen (Projector)

1. Login with PIN: `999999`
2. Toggle between Summary and Detailed views
3. Screen auto-updates as scores are submitted

## 📊 Data Models

### Official Scoring Criteria

The application implements the **official Interfaculty Boxing Freshers 2024 scoring criteria**:

- **Shadow Boxing**: 7 criteria, 95 max points
- **Punching Bag**: 5 criteria, 100 max points
- **Skipping**: 6 criteria, 110 max points
- **Boxing Combat**: 10 criteria, 100 max points

📄 See [SCORING_CRITERIA.md](SCORING_CRITERIA.md) for complete details on all criteria, maximum points, and judging guidelines.

### Firestore Collections

- **`pins`**: PIN authentication mapping to roles
- **`faculties`**: Faculty information with colors and order
- **`participants`**: Participant details linked to faculties
- **`events`**: Competition events with templates
- **`templates`**: Scoring criteria definitions
- **`invigilators`**: Judge assignments to events
- **`scores`**: Individual score submissions
- **`assignments`**: Round management (optional, for admin control)

### Scoring Flow

1. Invigilator selects Event → Faculty → Participant
2. Enters scores per criterion (validated against max points)
3. System calculates total: `sum(criteriaScores)`
4. Submits to Firestore with `invigilatorId`, `eventId`, `participantId`
5. Display screen updates in real-time via listener
6. Faculty aggregates computed client-side from all scores

## 🔒 Security Rules Summary

- **Public Read**: Faculties, participants, events, templates, scores (for display)
- **Admin Write**: All collections except scores
- **Invigilator Write**: Scores only for assigned events
- **PIN Read**: Allowed for authentication purposes

See `firestore.rules` for full implementation.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ScoreInput.tsx   # +/- score input with validation
│   ├── CriteriaList.tsx # List of scoring criteria
│   ├── ParticipantCard.tsx
│   └── TotalsTable.tsx  # Faculty rankings table
├── contexts/
│   └── AuthContext.tsx  # PIN authentication state
├── hooks/
│   └── useRealtimeData.ts # Firestore listeners
├── lib/
│   ├── firebase.ts      # Firebase initialization
│   ├── firestoreHelpers.ts # CRUD utilities
│   └── seedData.ts      # Sample data generator
├── pages/
│   ├── Login.tsx        # PIN entry
│   ├── AdminDashboard.tsx
│   ├── InvigilatorDashboard.tsx
│   └── DisplayScreen.tsx
├── styles/
│   └── index.css        # Tailwind + custom styles
├── types/
│   └── index.ts         # TypeScript interfaces
├── App.tsx              # Routes and protected routes
└── main.tsx             # Entry point
```

## 🚢 Deployment (Firebase Hosting)

### Option 1: Firebase Hosting

```bash
# Build for production
npm run build

# Initialize hosting (if not done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

### Option 2: Other Platforms

The `dist/` folder after `npm run build` contains static files. Deploy to:

- Vercel: `vercel --prod`
- Netlify: Drag `dist/` folder to netlify.com/drop
- GitHub Pages: Push `dist/` to `gh-pages` branch

**Note**: Update `.env` or build-time environment variables for production Firebase config.

## 🎨 Customization

### Add New Scoring Criteria

1. Go to Admin Dashboard → Templates tab
2. Create new template or edit existing
3. Add criteria with labels and max points
4. Assign template to event

### Change Faculty Colors

1. Admin Dashboard → Faculties tab
2. Edit faculty and pick new color
3. Color updates across all views

### Adjust Mobile Touch Targets

Edit `src/styles/index.css`:

```css
.score-button {
  @apply text-3xl px-8 py-6; /* Increase size */
}
```

## 🐛 Troubleshooting

### "Cannot find module 'firebase/app'" errors

Run `npm install` to ensure dependencies are installed.

### Scores not appearing on Display Screen

- Check Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Verify `.env` file has correct Firebase config
- Check browser console for errors

### PIN login fails

- Ensure seed data ran successfully (`npm run seed`)
- Check Firestore database has `pins` collection
- Verify PIN matches exactly (case-sensitive)

### Mobile scoring laggy

- Reduce image sizes for participant photos
- Check network connection (Firestore needs internet)
- Clear browser cache

## 📝 Implementation Notes

### Design Decisions

1. **Client-Side Aggregation**: Faculty totals calculated in-browser using Firestore listeners. For large datasets, consider Cloud Functions.

2. **Scoring Mode C**: Uses assigned invigilator's scores directly (no averaging). To implement scoring averaging, modify `useRealtimeFacultyTotals` hook to group by `participantId` + `eventId` and average.

3. **No Backend Server**: All logic runs client-side with Firestore security rules. For advanced features (undo, audit logs), add Cloud Functions.

4. **PIN Storage**: PINs stored in Firestore for simplicity. For production, consider Firebase Authentication with custom claims.

### Future Enhancements

- [ ] Admin undo/adjust scores within time window
- [ ] Export results to PDF/CSV
- [ ] Weight class brackets and match pairing
- [ ] Multi-round tournaments with elimination
- [ ] Photo upload for participants
- [ ] Push notifications for invigilators
- [ ] Cloud Functions for server-side aggregation
- [ ] Audit logs for all changes

## 📄 License

MIT License - feel free to use for your competition!

## 🤝 Contributing

Issues and pull requests welcome. For major changes, please open an issue first.

## 📧 Support

For questions or issues:

1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Review Firestore console for data integrity
3. Open GitHub issue with error details

---

**Built with ❤️ for Interfaculty Boxing Freshers 2024**
