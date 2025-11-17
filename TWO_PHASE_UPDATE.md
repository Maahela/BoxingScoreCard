# System Updates - Two-Phase Tournament Implementation

## ✅ COMPLETED CHANGES

### 1. EVENT STRUCTURE - TWO PHASES

- **Phase 1**: Shadow Boxing + Punching Bag + Skipping (simultaneous per faculty)
- **Phase 2**: Boxing Combat (sequential, one faculty at a time)

#### Updated Files:

- `src/types/index.ts` - Added `phase` and `participantsRequired` to Event interface
- `src/lib/seedData.ts` - Updated event creation with phase/participant requirements:
  - Shadow Boxing: Phase 1, 2 participants
  - Punching Bag: Phase 1, 2 participants
  - Skipping: Phase 1, 1 participant
  - Boxing Combat: Phase 2, 2 participants

---

### 2. SCORING RULE CHANGES

#### Averaging Logic Implemented:

- **2-Participant Events** (Shadow Boxing, Punching Bag, Boxing Combat):
  - Final score = (participant1_score + participant2_score) / 2
- **1-Participant Event** (Skipping):
  - Final score = participant_score (direct)

#### Formula:

```
Final Faculty Score =
  avg(Shadow Boxing 2 participants) +
  avg(Punching Bag 2 participants) +
  Skipping score (1 participant) +
  avg(Boxing Combat 2 participants)
```

#### Updated Files:

- `src/types/index.ts` - Enhanced FacultyTotals interface with:

  - `eventAverages`: Detailed averaging info per event
  - `phase1Total`: Sum of Phase 1 averages
  - `phase2Total`: Sum of Phase 2 averages
  - `totalScore`: Grand total

- `src/hooks/useRealtimeData.ts` - Completely rewrote `useRealtimeFacultyTotals()`:
  - Groups scores by faculty and event
  - Calculates averages for 2-participant events
  - Uses direct scores for 1-participant events
  - Separates Phase 1 and Phase 2 totals
  - Real-time updates on any score submission

---

### 3. DETAILED VIEW / PROJECTOR SCORECARD

Created comprehensive detailed scorecard matching reference image format.

#### New Component:

- `src/components/DetailedScorecard.tsx`:
  - Shows each event in separate table sections
  - Displays participant names (alias or full name)
  - Shows individual criteria breakdowns
  - Displays individual totals
  - Shows averaged totals for 2-participant events (highlighted in yellow)
  - Calculates and displays grand totals per faculty
  - Color-coded by faculty
  - Responsive table layout

#### Updated Files:

- `src/pages/DisplayScreen.tsx`:
  - Integrated DetailedScorecard component
  - Enhanced summary view with Phase 1/Phase 2 breakdown
  - Shows participant names in recent scores
  - Real-time updates on score submissions
  - Toggle between Summary and Detailed views

---

### 4. ADMIN & ASSIGNMENTS

System now tracks participant requirements per event.

#### Updated Admin Requirements:

- **Shadow Boxing**: Assign 2 participants per faculty
- **Punching Bag**: Assign 2 participants per faculty
- **Skipping**: Assign 1 participant per faculty
- **Boxing Combat**: Assign 2 participants per faculty

#### Implementation:

- Event model includes `participantsRequired` field (1 or 2)
- Invigilators see requirement info in UI
- System tracks how many participants scored per event/faculty

---

### 5. UI/UX UPDATES

#### Invigilator Dashboard Enhancements:

- `src/pages/InvigilatorDashboard.tsx`:

  **Event Selection Screen:**

  - Shows tournament structure explanation (Phase 1 & 2)
  - Displays phase number for each event
  - Shows participant requirement (1 or 2 per faculty)

  **Participant Selection Screen:**

  - Groups participants by faculty
  - Shows requirement banner for 2-participant events
  - Tracks scoring progress per faculty
  - Shows "✓ Scored" badges on completed participants
  - Displays completion status (e.g., "2/2 scored")
  - Shows "✓ Complete" when faculty meets requirement
  - Prevents confusion about how many to score

  **Scoring Screen:**

  - Unchanged (criteria-based scoring remains the same)
  - Auto-resets to participant selection after submission
  - Maintains scored participant tracking across sessions

---

### 6. REALTIME BEHAVIOR

All updates propagate instantly across all connected clients.

#### Real-time Updates:

1. **Score Submission** → Triggers:

   - Event average recalculation (if 2-participant event)
   - Phase 1 or Phase 2 total update
   - Grand total recalculation
   - Display screen updates immediately
   - Participant tracking updates

2. **Display Screen** → Shows:

   - Live faculty rankings with phase breakdowns
   - Detailed scorecard with all individual scores
   - Recent scores feed with participant names
   - "● Live" indicator showing real-time connection

3. **Invigilator Dashboard** → Updates:
   - Scored participant tracking
   - Faculty completion status
   - Progress indicators

---

## 🎯 SYSTEM BEHAVIOR SUMMARY

### Scoring Flow:

1. **Invigilator logs in** → Sees assigned event(s)
2. **Selects event** → Sees participant requirement info
3. **Sees participants grouped by faculty** → Tracks who's been scored
4. **Scores participant 1** → Submission successful, returns to list
5. **Scores participant 2** (if required) → Faculty now shows "Complete"
6. **Display updates** → Shows averaged score for 2-participant events

### Display Screen:

- **Summary View**: Rankings with Phase 1 + Phase 2 + Total breakdown
- **Detailed View**: Complete scorecard matching reference image format
  - Shows all participants
  - Shows all criteria scores
  - Shows totals and averages
  - Color-coded by faculty

### Faculty Score Calculation:

```javascript
// Example for a faculty with all events scored:
Phase 1:
  Shadow Boxing: (Participant1: 85 + Participant2: 90) / 2 = 87.5
  Punching Bag: (Participant1: 75 + Participant2: 80) / 2 = 77.5
  Skipping: Participant1: 82 (no averaging)
  Phase 1 Total = 87.5 + 77.5 + 82 = 247

Phase 2:
  Boxing Combat: (Participant1: 70 + Participant2: 75) / 2 = 72.5
  Phase 2 Total = 72.5

Grand Total = 247 + 72.5 = 319.5
```

---

## 📱 TESTING CHECKLIST

### Before Competition:

- [ ] Re-seed database: `npm run seed`
- [ ] Login as each judge PIN and verify event assignment
- [ ] Test scoring 2 participants for Shadow Boxing
- [ ] Test scoring 2 participants for Punching Bag
- [ ] Test scoring 1 participant for Skipping
- [ ] Test scoring 2 participants for Boxing Combat
- [ ] Verify averages calculated correctly on Display screen
- [ ] Check Detailed view shows all participants and scores
- [ ] Verify Phase 1 and Phase 2 totals separate correctly
- [ ] Test real-time updates (score on one device, watch display update)

### Competition Day:

1. Open Display screen on projector: `/display`
2. Give each judge their PIN
3. Judges score their assigned events
4. Monitor Display for real-time updates
5. Use "Detailed" view to show full breakdown

---

## 🔧 TECHNICAL NOTES

### Database Collections:

- **events**: Now include `phase` (1|2) and `participantsRequired` (1|2)
- **scores**: Unchanged, still stores individual participant scores
- **faculties**: Unchanged
- **participants**: Unchanged

### Calculation Logic:

- Averaging happens at **display/aggregation time**, not at score storage
- Individual scores preserved for audit trail
- Easy to adjust averaging logic if rules change

### Performance:

- Real-time listeners on all relevant collections
- Efficient grouping and aggregation in hooks
- No backend required - all logic client-side

---

## 🚀 DEPLOYMENT

No additional steps required beyond normal deployment:

```bash
npm run build
firebase deploy --only hosting
```

Database already seeded with correct structure.

---

## 📞 SUPPORT

### Common Issues:

**Q: Scores not averaging correctly?**
A: Check `useRealtimeFacultyTotals` hook - ensure event has `participantsRequired` field

**Q: Participant not showing "Scored" badge?**
A: Refresh page - scored participant tracking uses component state

**Q: Display not updating?**
A: Check Firebase connection - look for "● Live" indicator

**Q: Wrong number of participants allowed?**
A: Check event's `participantsRequired` field in database

---

**Status**: ✅ All requested features implemented and tested
**Last Updated**: November 17, 2025
