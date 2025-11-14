# 📊 Official Scoring Criteria - Interfaculty Boxing Freshers 2024

This document defines the **exact scoring criteria** for all events. These criteria are implemented in the application and used by invigilators for judging.

---

## 🥊 EVENT 1: Shadow Boxing

**Total Maximum Score: 95 points**

| Criteria                  | Maximum Points | Description                                               |
| ------------------------- | -------------- | --------------------------------------------------------- |
| Head Position             | 10             | Proper head positioning and protection throughout routine |
| Boxing Stance             | 10             | Correct stance, balance, and body positioning             |
| Leg Position and Distance | 10             | Footwork, distance management, and leg positioning        |
| Defense                   | 10             | Defensive movements including slips, blocks, and parries  |
| Correct Punches           | 20             | Proper form and technique for all punch types             |
| Punches Combination       | 20             | Flow, variety, and execution of combination punches       |
| Endurance                 | 15             | Stamina, consistency, and energy throughout routine       |

**Judging Notes:**

- Focus on technical execution and form
- Observe continuous movement and transitions
- Evaluate power generation from proper mechanics

---

## 💥 EVENT 2: Punching Bag

**Total Maximum Score: 100 points**

| Criteria            | Maximum Points | Description                                      |
| ------------------- | -------------- | ------------------------------------------------ |
| Power               | 20             | Impact force and weight transfer into punches    |
| Speed               | 20             | Punch velocity and hand speed                    |
| Technique & Tactics | 30             | Proper form, accuracy, and strategic approach    |
| Combination Punches | 20             | Fluidity and effectiveness of punch combinations |
| Endurance           | 10             | Sustained performance and consistency            |

**Judging Notes:**

- Technique & Tactics carries highest weight (30 points)
- Power and speed should not compromise form
- Look for clean, controlled combinations

---

## 🪢 EVENT 3: Skipping

**Total Maximum Score: 110 points**

| Criteria        | Maximum Points | Description                                 |
| --------------- | -------------- | ------------------------------------------- |
| Coordination    | 20             | Hand-eye-foot coordination and rhythm       |
| Balance         | 10             | Body control and stability during skipping  |
| Endurance       | 20             | Ability to maintain performance over time   |
| Speed           | 20             | Rope rotation velocity and foot speed       |
| Continuity      | 30             | Consistency without breaks or mistakes      |
| Skill Variation | 10             | Variety of skipping techniques demonstrated |

**Judging Notes:**

- Continuity is most heavily weighted (30 points)
- Breaks or rope catches significantly impact continuity score
- Speed should not sacrifice coordination

---

## 🥊 EVENT 4: Boxing Combat

**Total Maximum Score: 100 points**

| Criteria                     | Maximum Points | Description                                     |
| ---------------------------- | -------------- | ----------------------------------------------- |
| Stance & Balance             | 10             | Proper boxing stance and equilibrium            |
| Punching Technique & Tactics | 20             | Technical execution and strategic approach      |
| Defense                      | 10             | Blocking, slipping, parrying opponent's attacks |
| Footwork                     | 5              | Movement, positioning, and agility              |
| Combination Punching         | 10             | Linking punches effectively in combat           |
| Endurance                    | 10             | Stamina maintenance throughout rounds           |
| Distance Management          | 10             | Control of range and positioning                |
| Reading the Opponent         | 5              | Anticipation and reaction to opponent           |
| Domination                   | 10             | Control and aggression in the ring              |
| Protecting the Head          | 10             | Head movement and defensive awareness           |

**Judging Notes:**

- Most comprehensive criteria set (10 categories)
- Punching Technique & Tactics highest weighted (20 points)
- Safety (Protecting the Head) is scored independently

---

## 📱 How Scoring Works in the App

### For Invigilators:

1. **Event Assignment**: Each judge sees ONLY their assigned event's criteria
2. **Participant Selection**: Choose faculty and participant to score
3. **Criteria Input**: Enter scores for each criterion (0 to max points)
4. **Validation**: App prevents entering scores above maximum
5. **Auto-Calculation**: Total is automatically calculated as sum of all criteria
6. **Submit**: Scores are saved to database in real-time

### For Admin:

- Can view all templates and criteria
- Can edit templates (add/remove/modify criteria)
- Can create new templates for additional events
- Assigns invigilators to specific events

### For Display Screen:

- Shows live updates as scores are submitted
- Calculates faculty totals across all events
- Displays both detailed (per-event) and summary views
- Rankings updated automatically based on total scores

---

## 🎯 Scoring Guidelines for Judges

### General Principles:

- **Objectivity**: Score based on observable criteria only
- **Consistency**: Apply same standards to all participants
- **Fairness**: Avoid bias toward any faculty
- **Accuracy**: Use full range of scores (0 to max)

### Score Ranges:

- **0-25% of max**: Poor/Inadequate performance
- **26-50% of max**: Below Average/Needs Improvement
- **51-75% of max**: Average/Good performance
- **76-95% of max**: Above Average/Excellent
- **96-100% of max**: Outstanding/Near Perfect

### Tips:

1. Read criteria before event starts
2. Observe entire performance before scoring
3. Compare participants mentally to establish baseline
4. Use notes or references for consistency
5. Submit scores promptly after each performance

---

## 📊 Event Total Maximums

| Event           | Total Max Points | Number of Criteria |
| --------------- | ---------------- | ------------------ |
| Shadow Boxing   | 95               | 7                  |
| Punching Bag    | 100              | 5                  |
| Skipping        | 110              | 6                  |
| Boxing Combat   | 100              | 10                 |
| **Grand Total** | **405**          | **28 criteria**    |

---

## 🔄 Aggregation and Ranking

### Faculty Totals:

Faculty scores are calculated by summing all participants' totals across all events:

```
Faculty Total = Σ (Participant Scores for all events)
```

### Ranking:

Faculties are ranked by total score (highest to lowest):

1. 1st Place: Highest total across all events
2. 2nd Place: Second highest
3. 3rd Place: Third highest
4. 4th Place: Lowest total

### Tie-Breaking:

In case of tied total scores:

1. Compare Boxing Combat totals (highest wins)
2. If still tied, compare Shadow Boxing totals
3. If still tied, declared co-winners

---

## ✅ Validation and Quality Control

The app automatically enforces:

- ✓ Score cannot exceed maximum for each criterion
- ✓ Score cannot be negative
- ✓ All criteria must be scored before submission
- ✓ Invigilators can only score their assigned events
- ✓ Scores are locked after submission (admin can unlock)

---

## 🆘 Common Questions

**Q: Can I give half points (e.g., 7.5)?**
A: Yes, the app supports decimal scoring if needed.

**Q: What if I make a mistake?**
A: Contact the admin immediately. Admin can unlock and allow re-scoring.

**Q: Can I see other judges' scores?**
A: No, invigilators only see their own event. Display screen shows final totals.

**Q: What if a participant doesn't complete the event?**
A: Score only what was performed. Assign 0 for incomplete criteria.

**Q: How are multiple participants from same faculty handled?**
A: Each participant is scored individually. Faculty total is sum of all their participants.

---

## 📞 Technical Support

For scoring system issues:

- Admin Dashboard: Check template assignments
- Invigilator Login: Verify PIN and event assignment
- Display Not Updating: Refresh browser, check internet

For judging clarifications:

- Consult head judge or event organizer
- Reference this criteria document
- Use consistent standards across all participants

---

**Last Updated:** November 14, 2025
**Version:** 1.0
**Competition:** Interfaculty Boxing Freshers 2024
