# 📋 Boxing Scorecard System - Admin Guide

## 🎯 Quick Start

**Admin Login:**

- URL: https://boxing-scorecard-new-1a819.web.app
- PIN: `123456`

---

## 🏗️ Tournament Setup (One-Time)

### Step 1: Initial Data Setup

Run the seed script to populate the database:

```bash
npm run seed
```

This creates:

- 6 Faculties (UCSC, Management, Technology, Science, Nursing, Medicine)
- 4 Events (Shadow Boxing, Punching Bag, Skipping, Boxing Combat)
- 4 Scoring Templates (one per event)
- 4 Invigilators (one per event)
- 12 Participants (2 per faculty)
- Sample scores for testing

### Step 2: Verify Data (Optional)

1. Login as Admin
2. Check each tab:
   - **Faculties Tab**: Should show 6 faculties
   - **Events Tab**: Should show 4 events
   - **Templates Tab**: Should show 4 templates
   - **Participants Tab**: Should show 12 participants
   - **Invigilators Tab**: Should show 4 invigilators

---

## 🎮 Running the Tournament

### Phase 1: Simultaneous Events (Shadow Boxing, Punching Bag, Skipping)

#### 1. Set Active Phase

1. Go to **Active Participants** tab
2. At the top, click **Phase 1** button
3. The button will turn blue to indicate Phase 1 is active

#### 2. Select Participants for Each Event

**For Shadow Boxing:**

- Select 1 of 2 participants per faculty
- Example: If UCSC has "Thunder" and "Lightning", choose one

**For Punching Bag:**

- Select 1 of 2 participants per faculty
- Can be same or different from Shadow Boxing

**For Skipping:**

- Select 1 participant per faculty (only 1 assigned per faculty)

#### 3. Set Skipping Round

- Below the Phase selector, you'll see **Active Skipping Round** section (yellow box)
- Click **Round 1** to start
- Invigilators will only be able to score Round 1

#### 4. Click "Update Active Participants"

- This broadcasts your selections to all invigilators
- Invigilators will see the selected participants automatically

#### 5. Inform Invigilators to Start Scoring

Invigilators will:

- Open their dashboard (they'll see only Phase 1 events)
- Select their assigned event
- See the active participant you selected
- Score them

#### 6. Switch to Skipping Round 2

When all faculties have completed Round 1:

1. Go back to **Active Participants** tab
2. Click **Round 2** in the Skipping Round selector
3. Click "Update Active Participants"
4. Invigilators will now score Round 2 for the same participants

**Important:** The same participant scores both rounds - don't change the participant!

---

### Phase 2: Boxing Combat (Sequential)

#### 1. Complete Phase 1 First

Make sure all Phase 1 scores are submitted:

- Shadow Boxing: All faculties scored
- Punching Bag: All faculties scored
- Skipping: All faculties scored R1 and R2

#### 2. Switch to Phase 2

1. Go to **Active Participants** tab
2. Click **Phase 2** button (will turn red)
3. Confirm the popup warning

#### 3. Select Combat Participants

Under **Phase 2 Event** section:

- **Participant 1**: Select first fighter
- **Participant 2**: Select second fighter (usually from different faculty)

**Important Rules:**

- BOTH participants must be selected
- System will not allow scoring if only one is selected
- These should be fighters who will compete against each other

#### 4. Click "Update Active Participants"

#### 5. Combat Invigilator Scores

The Combat judge will:

- See BOTH participants on their screen
- Score both simultaneously using the split-screen interface
- Submit scores for both fighters at once

#### 6. Select Next Combat Bout

After scores are submitted:

1. Go back to **Active Participants**
2. Select the next pair of fighters
3. Click "Update Active Participants"
4. Repeat until all combat bouts are complete

---

## 📊 Monitoring Scores

### View Live Scores

1. Open the **Display Screen** on a projector/TV

   - Login PIN: `999999`
   - This is read-only and updates in real-time

2. Toggle between views:
   - **Summary View**: Faculty rankings with Phase 1 + Phase 2 + Total
   - **Detailed View**: Complete breakdown by event

### Understanding Score Display

**Phase 1 Events (Shadow, Bag, Skipping):**

- Shows 2 participants per faculty (except Skipping = 1)
- Displays average of both participants as faculty score

**Skipping Specific:**

- Shows "Faculty R1" and "Faculty R2" columns
- R1 column appears first, then R2
- Yellow "AVERAGE (R1+R2)/2" row shows the final score used in totals

**Phase 2 (Combat):**

- Shows 2 participants per faculty
- Average of both combat scores = faculty total for Combat

**Faculty Totals:**

- Phase 1 Total = Shadow + Bag + Skipping averages
- Phase 2 Total = Combat average
- Grand Total = Phase 1 + Phase 2

---

## 🔧 Admin Tools

### Clear All Scores

Use when you need to restart scoring:

1. Go to **Settings/Debug** section (bottom of any admin tab)
2. Click **Clear All Scores**
3. Confirm the action
4. This deletes ALL scores but keeps participants/events/faculties intact

### Populate Dummy Scores

For testing the display:

1. Click **Populate Dummy Scores**
2. Enter security code: `POPULATE`
3. System generates random scores for all participants across all events
4. Respects participant requirements:
   - Shadow/Bag/Combat: 2 per faculty
   - Skipping: 1 per faculty with R1 and R2

---

## 🎓 Invigilator Instructions

Share these login details with judges:

**Shadow Boxing Judge:**

- PIN: `111111`
- Will see only Shadow Boxing event when Phase 1 is active

**Punching Bag Judge:**

- PIN: `222222`
- Will see only Punching Bag event when Phase 1 is active

**Skipping Judge:**

- PIN: `333333`
- Will see only Skipping event when Phase 1 is active
- Will see Round indicator (R1 or R2) that you control

**Combat Judge:**

- PIN: `444444`
- Will see ONLY Combat event when Phase 2 is active
- Scores both fighters simultaneously

### Invigilator Workflow

1. Login with PIN
2. Select event (automatically filtered by active phase)
3. See active participant(s) - updated automatically by admin
4. If already scored: Shows "✓ Already Scored" message
5. If not scored: Shows scoring interface
6. Enter scores for each criterion using +/- buttons
7. Click Submit
8. Returns to event selection
9. Wait for admin to select next participant

---

## ⚠️ Important Rules

### Phase Management

✅ **DO:**

- Start with Phase 1
- Complete ALL Phase 1 events before switching to Phase 2
- Keep Phase 1 active during Shadow/Bag/Skipping scoring
- Switch to Phase 2 only when ready for Combat

❌ **DON'T:**

- Jump to Phase 2 before Phase 1 is complete
- Switch phases while invigilators are scoring
- Select Combat participants during Phase 1

### Participant Selection

✅ **DO:**

- Select correct number per event (1 or 2 based on event)
- Update selections between each round/bout
- Select BOTH combat participants before updating

❌ **DON'T:**

- Change Skipping participant between R1 and R2
- Select only 1 Combat participant
- Select participants not assigned to the event

### Skipping Two-Round System

✅ **DO:**

- Start with Round 1 for all faculties
- Switch to Round 2 after all complete R1
- Keep the SAME participant for both rounds

❌ **DON'T:**

- Switch participants between rounds
- Mix R1 and R2 (all faculties should be on same round)
- Forget to switch from R1 to R2

---

## 🐛 Troubleshooting

### Issue: Invigilator sees "Waiting for Admin Selection"

**Solution:**

- Go to Active Participants tab
- Select participant(s) for their event
- Click "Update Active Participants"

### Issue: Combat shows "Incomplete Combat Setup"

**Solution:**

- You selected only 1 participant
- Select BOTH Participant 1 and Participant 2
- Click "Update Active Participants"

### Issue: Invigilator doesn't see their event

**Solution:**

- Check Active Phase setting
- Phase 1 events only show in Phase 1
- Combat only shows in Phase 2

### Issue: Invigilator sees "Already Scored"

**Solution:**

- They already scored those participants
- Select new participants in Active Participants tab
- Or clear scores if testing

### Issue: Skipping shows wrong round

**Solution:**

- Check Active Skipping Round setting in Active Participants tab
- Click correct round button (Round 1 or Round 2)
- Click "Update Active Participants"

### Issue: Display not updating

**Solution:**

- Scores update in real-time automatically
- Try refreshing the browser
- Check internet connection

### Issue: Too many scores per faculty

**Solution:**

- Use "Clear All Scores" button
- Then use "Populate Dummy Scores" (respects correct participant counts)
- Or manually delete extra scores

---

## 📱 Display Screen Setup

### For Projector/Large Display

1. Open browser on display device
2. Go to: https://boxing-scorecard-new-1a819.web.app
3. Login with PIN: `999999`
4. Press F11 for fullscreen
5. Toggle between Summary/Detailed views as needed

### Tips

- Summary View: Best for showing rankings during event
- Detailed View: Best for final results with full breakdown
- Screen updates automatically - no refresh needed
- Yellow "LIVE" indicator shows real-time status

---

## 🎯 Event Day Checklist

**Before Event:**

- [ ] Verify all participants entered in system
- [ ] Test all invigilator PINs
- [ ] Test display screen on projector
- [ ] Clear old scores if needed
- [ ] Set Phase 1 active
- [ ] Set Skipping Round 1 active

**Phase 1 Start:**

- [ ] Select first participants for Shadow/Bag/Skipping
- [ ] Click "Update Active Participants"
- [ ] Inform invigilators to begin
- [ ] Monitor Display Screen

**Between Participants:**

- [ ] Wait for invigilator to complete scoring
- [ ] Select next participants
- [ ] Click "Update Active Participants"

**Skipping Round 2:**

- [ ] Verify all R1 scores complete
- [ ] Click "Round 2" button
- [ ] Click "Update Active Participants"
- [ ] DO NOT change participants

**Phase 2 (Combat):**

- [ ] Verify all Phase 1 complete
- [ ] Click "Phase 2" button
- [ ] Confirm popup
- [ ] Select first combat pair (Participant 1 + 2)
- [ ] Click "Update Active Participants"
- [ ] Inform Combat judge to begin

**After Event:**

- [ ] View final rankings on Display Screen
- [ ] Export scores if needed
- [ ] Keep data for records

---

## 💡 Pro Tips

1. **Test Before Event Day**: Use dummy scores to test full workflow
2. **Print Backup**: Take screenshots of final scores
3. **Keep Admins Logged In**: Have 2 devices with admin access as backup
4. **Announce Phase Changes**: Tell invigilators when switching phases
5. **Combat Scheduling**: Pre-plan combat bout order to save time
6. **Display Visibility**: Test projector visibility from audience area
7. **Internet Backup**: Have mobile hotspot ready if WiFi fails
8. **Score Verification**: Check Display Screen after each submission

---

## 📞 Quick Reference

| Role                | PIN    | Access                   |
| ------------------- | ------ | ------------------------ |
| Admin               | 123456 | Full control             |
| Shadow Boxing Judge | 111111 | Score Shadow Boxing only |
| Punching Bag Judge  | 222222 | Score Punching Bag only  |
| Skipping Judge      | 333333 | Score Skipping only      |
| Combat Judge        | 444444 | Score Combat only        |
| Display Screen      | 999999 | View-only scoreboard     |

**Website:** https://boxing-scorecard-new-1a819.web.app

---

## 🎉 Summary Workflow

1. **Setup**: Run seed script, verify data
2. **Phase 1 Start**: Set Phase 1, select participants, update
3. **Scoring**: Invigilators score as you select participants
4. **Skipping R2**: Switch round, update (same participants)
5. **Phase 2 Start**: Set Phase 2, select first combat pair
6. **Combat**: Score each bout sequentially
7. **Results**: View final rankings on Display Screen

**The system handles all calculations, averages, and real-time updates automatically!**
