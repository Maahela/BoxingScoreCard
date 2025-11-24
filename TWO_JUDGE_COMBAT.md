# Two-Judge Combat System Implementation

## Overview

The Boxing Combat event now supports **two judges scoring simultaneously**, with automatic averaging of their scores for display.

## How It Works

### Judge Configuration

- **Judge 1 (Combat Judge 1)**: PIN `444444`
- **Judge 2 (Combat Judge 2)**: PIN `555555`

Both judges have access to the Boxing Combat event when Phase 2 is active.

### Scoring Workflow

1. **Admin selects combat participants**: Selects Fighter A and Fighter B in Active Participants panel
2. **Both judges log in**: Judge 1 and Judge 2 log in with their respective PINs
3. **Simultaneous scoring**: Both judges score the same bout independently
4. **Automatic averaging**: System automatically averages the two judges' scores

### Score Calculation

For each criterion:

```
averageScore = (judge1Score + judge2Score) / 2
```

The averaged score is **rounded** to the nearest integer.

### Display Behavior

- **Only averaged scores are shown** on the display screens (PhaseScorecard and DetailedScorecard)
- Individual judge scores are **never displayed** to maintain fairness
- If only one judge has scored, their score is shown until the second judge submits

## Technical Implementation

### Score Storage

- Each judge's scores are stored separately in the database with their unique `invigilatorId`
- Judge 1 scores: `invigilatorId: 'Judge 4 - Combat'`
- Judge 2 scores: `invigilatorId: 'Judge 5 - Combat Judge 2'`

### Score Averaging Logic

The averaging happens in the display components (`PhaseScorecard.tsx` and `DetailedScorecard.tsx`):

1. Combat scores are grouped by `participantId` (not by `invigilatorId`)
2. For each participant, find scores from both judges
3. Calculate average of criteria scores and totals
4. Display only the averaged values

### Already Scored Check

Each judge's "Already Scored" status is tracked independently:

- Judge 1 can only score once per bout
- Judge 2 can only score once per bout
- Both judges must score for complete results

## Testing

### Dummy Data

The seed script (`npm run seed`) automatically creates scores from both judges for testing:

- Judge 1 scores all combat bouts
- Judge 2 scores the same bouts with slightly varied scores (±1-3 points)
- Display shows averaged results

### Manual Testing

1. Run `npm run seed` to populate database
2. Log in as Admin (PIN: 123456)
3. Set Phase 2 and select combat participants
4. Log in as Judge 1 (PIN: 444444) and score
5. Log in as Judge 2 (PIN: 555555) and score
6. View Display Screen (PIN: 999999) to see averaged scores

## Key Points

✅ **No UI changes required** - Existing UI works perfectly for two-judge system
✅ **Real-time updates** - Averaging happens automatically as judges submit
✅ **Independent scoring** - Judges cannot see each other's scores
✅ **Automatic averaging** - No manual calculation needed
✅ **Fair display** - Only averaged scores visible to maintain impartiality

## Files Modified

1. `src/components/PhaseScorecard.tsx` - Added combat score averaging logic
2. `src/components/DetailedScorecard.tsx` - Added combat score averaging logic
3. `src/lib/seedData.ts` - Added Judge 5 and duplicate combat scores
4. `ADMIN_GUIDE.md` - Updated with two-judge workflow
5. `QUICK_GUIDE.md` - Updated with two-judge information

## Production Deployment

To deploy the two-judge combat system:

```bash
npm run build
firebase deploy --only hosting
```

The system is backwards compatible - existing single-judge scores will continue to display correctly.
