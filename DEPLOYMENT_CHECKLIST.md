# 📋 Pre-Competition Deployment Checklist

## ⚙️ Configuration

- [ ] Update Firebase config in `.env` with production credentials
- [ ] Change all default PINs in `src/config/demo.ts`
- [ ] Customize faculty names and colors
- [ ] Update competition name and branding
- [ ] Review scoring criteria and max points

## 🔒 Security

- [ ] Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- [ ] Verify rules in Firebase Console (test read/write permissions)
- [ ] Disable Firestore test mode in production
- [ ] Remove or disable seed script access in production
- [ ] Change all test PINs to secure values

## 🧪 Testing

- [ ] Test Admin dashboard: create faculty, participant, event
- [ ] Test Invigilator flow: login → select event → score participant
- [ ] Test Display screen: verify real-time updates
- [ ] Test on mobile device (invigilator view)
- [ ] Test on projector/large screen (display view)
- [ ] Test with poor network conditions
- [ ] Verify score calculations are accurate
- [ ] Test simultaneous scoring by multiple judges

## 📱 Hardware Setup

- [ ] Assign mobile devices to each invigilator
- [ ] Connect display screen to projector
- [ ] Test WiFi connectivity at venue
- [ ] Prepare backup devices (phones/tablets)
- [ ] Print PIN cards for all users
- [ ] Test with venue's network bandwidth

## 🚀 Deployment

- [ ] Build production bundle: `npm run build`
- [ ] Test production build locally: `npm run preview`
- [ ] Deploy to Firebase Hosting: `firebase deploy`
- [ ] Verify live site works at `https://your-project.web.app`
- [ ] Test all PINs on live site
- [ ] Bookmark URLs on all devices

## 📊 Data Preparation

- [ ] Run seed script or manually create entities via Admin
- [ ] Verify all faculties are created
- [ ] Verify all participants are registered
- [ ] Verify all events and templates exist
- [ ] Verify invigilators are assigned to events
- [ ] Create test scores and delete before competition

## 🎭 Day-of-Competition

- [ ] Brief all invigilators on app usage
- [ ] Distribute PIN cards
- [ ] Login all devices 30 minutes early
- [ ] Keep Admin logged in for quick adjustments
- [ ] Monitor Display screen throughout event
- [ ] Have backup paper scorecards ready
- [ ] Assign someone to troubleshoot tech issues

## 📈 Post-Competition

- [ ] Export final scores (screenshot or CSV)
- [ ] Backup Firestore data (Firebase Console → Export)
- [ ] Create final report/summary
- [ ] Collect feedback from users
- [ ] Document any issues for future improvements

## 🆘 Emergency Contacts

- Firebase Support: https://firebase.google.com/support
- Technical Admin: [Add contact info]
- Network Admin: [Add contact info]
- Competition Organizer: [Add contact info]

## 📞 Quick Troubleshooting

**Display not updating?**
→ Refresh page, check internet connection

**Can't login with PIN?**
→ Verify PIN in Admin dashboard or Firestore Console

**Scores not saving?**
→ Check Firestore rules, verify invigilator assignment

**App slow/laggy?**
→ Check WiFi signal, reduce photo sizes, clear cache

---

✅ All checked? You're ready to go! Good luck with your competition! 🥊
