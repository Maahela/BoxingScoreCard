# Two-Judge Combat System - Testing Checklist

## Pre-Test Setup

- [ ] Run `npm run seed` to populate database with test data
- [ ] Verify Judge 5 appears in Firebase invigilators collection
- [ ] Verify combat scores exist from both Judge 4 and Judge 5

## Test 1: Verify Judge Configuration

**Admin Dashboard (PIN: 123456)**
- [ ] Navigate to Active Participants panel
- [ ] Verify both combat judges are configured in system
- [ ] Set Phase to "Phase 2" 
- [ ] Select two combat participants (Fighter A and Fighter B)
- [ ] Click "Update Active Participants"

## Test 2: Judge 1 Scoring

**Judge 1 Login (PIN: 444444)**
- [ ] Log in successfully
- [ ] Verify only "Boxing Combat" event appears (Phase 2 filter)
- [ ] Click on Boxing Combat event
- [ ] Verify both selected participants appear
- [ ] Enter scores for all criteria (use +/- buttons)
- [ ] Click "Submit"
- [ ] Verify "Already Scored" message appears on returning

## Test 3: Judge 2 Scoring

**Judge 2 Login (PIN: 555555)**
- [ ] Log in successfully
- [ ] Verify only "Boxing Combat" event appears (Phase 2 filter)
- [ ] Click on Boxing Combat event
- [ ] Verify both selected participants appear
- [ ] Enter DIFFERENT scores for all criteria (to test averaging)
- [ ] Click "Submit"
- [ ] Verify "Already Scored" message appears on returning

## Test 4: Display Verification

**Display Screen (PIN: 999999)**

### Phase 2 Summary View
- [ ] Navigate to display screen
- [ ] Click "Phase 2 Summary" tab
- [ ] Verify combat event shows TWO participants per faculty
- [ ] **CRITICAL:** Verify scores shown are AVERAGES of Judge 1 and Judge 2
- [ ] Manually calculate expected average and compare with display
- [ ] Verify total score is averaged correctly

### Detailed Scorecard View
- [ ] Click "Detailed Scorecard" tab
- [ ] Locate Boxing Combat section
- [ ] Verify each criterion shows AVERAGED score
- [ ] Verify total row shows AVERAGED total
- [ ] Confirm individual judge scores are NOT visible anywhere

## Test 5: Averaging Calculation

**Manual Verification:**

Example test case:
- Judge 1 scores Fighter A: Stance Balance = 9 points
- Judge 2 scores Fighter A: Stance Balance = 7 points
- Expected display: Stance Balance = 8 points (rounded average)

Verify for each criterion:
```
displayedScore = round((judge1Score + judge2Score) / 2)
```

## Test 6: Incomplete Scoring Scenarios

### Scenario A: Only Judge 1 Scored
- [ ] Admin selects NEW combat bout (different participants)
- [ ] Only Judge 1 (444444) submits scores
- [ ] Check Display: Should show Judge 1's scores
- [ ] Judge 2 (555555) logs in and submits
- [ ] Check Display: Should NOW show averaged scores

### Scenario B: Judge 1 Scored Already
- [ ] Judge 1 attempts to score same bout again
- [ ] Verify "Already Scored" message prevents duplicate
- [ ] Verify Judge 2 can still score (independent tracking)

## Test 7: Faculty Totals

**Display Screen - Detailed Scorecard**
- [ ] Verify each faculty's total includes averaged combat scores
- [ ] Manually calculate: Phase 1 Total + Phase 2 Total = Grand Total
- [ ] Verify combat contributes correctly to Phase 2 total
- [ ] Verify faculty rankings reflect averaged combat scores

## Test 8: Real-Time Updates

**Two Browser Windows:**
- [ ] Window 1: Display Screen (999999)
- [ ] Window 2: Judge 2 Dashboard (555555)
- [ ] In Window 2: Submit scores
- [ ] In Window 1: Verify display updates automatically
- [ ] Confirm no page refresh required

## Test 9: Data Integrity

**Firebase Console Check:**
- [ ] Open Firebase Console → Firestore Database
- [ ] Navigate to `scores` collection
- [ ] Filter by `eventId` for Boxing Combat
- [ ] Verify TWO score documents per participant (one from each judge)
- [ ] Verify `invigilatorId` is different for each (Judge 4 vs Judge 5)
- [ ] Verify criteria scores differ between judges

## Test 10: Edge Cases

### Multiple Bouts Sequentially
- [ ] Admin selects Bout 1 (Fighter A vs B)
- [ ] Both judges score
- [ ] Admin selects Bout 2 (Fighter C vs D)
- [ ] Both judges score
- [ ] Verify Display shows both bouts with correct averages

### Same Participants, Different Order
- [ ] Score Fighter A and Fighter B
- [ ] Admin selects Fighter B and Fighter A (reversed)
- [ ] Verify system treats as new bout (if supported)
- [ ] OR verify "Already Scored" prevents re-scoring

## Expected Results

### ✅ Pass Criteria
- Both judges can log in and score independently
- "Already Scored" works for each judge separately
- Display shows ONLY averaged scores
- Averaging calculation is correct: `(j1 + j2) / 2` rounded
- Real-time updates work instantly
- Individual judge scores never visible on display
- Faculty totals include averaged combat scores

### ❌ Fail Criteria
- Individual judge scores visible anywhere
- Judges can see each other's scores
- Averaging calculation incorrect
- Only one judge's score shown after both scored
- "Already Scored" blocks wrong judge
- Display doesn't update in real-time

## Troubleshooting

If averaging not working:
1. Check `PhaseScorecard.tsx` - averaging logic present?
2. Check `DetailedScorecard.tsx` - averaging logic present?
3. Check Firebase: Are there 2 score docs per participant?
4. Check invigilatorIds: Are they different (Judge 4 vs Judge 5)?

If judges can't log in:
1. Check `seedData.ts`: Is Judge 5 created?
2. Check Firebase invigilators collection: Judge 5 exists?
3. Check PIN: Must be exactly `555555`

If "Already Scored" issues:
1. Check `checkExistingScore()`: Uses invigilatorId?
2. Each judge should only block themselves, not each other

## Post-Test Verification

- [ ] All test cases pass
- [ ] No console errors
- [ ] UI remains unchanged from original
- [ ] Documentation matches implementation
- [ ] Ready for production deployment

---

**Test Date:** _____________
**Tester:** _____________
**Result:** ⬜ PASS / ⬜ FAIL
**Notes:** _____________________________________________
