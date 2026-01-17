# Component Testing Guide - Phase 3 Integration
**Status:** Ready for Manual Testing  
**Date:** January 17, 2026  
**Test Environment:** Microsoft Edge, localhost:3000 & localhost:8000

---

## Prerequisites
✅ Backend running on `http://localhost:8000`  
✅ Frontend running on `http://localhost:3000`  
✅ Both servers running and connected  

---

## Test 1: Lessons Component ✅

### Setup:
1. Open `http://localhost:3000` in Microsoft Edge
2. Login with test credentials
3. Navigate to **"Lessons"** page or **"सिकाइ पाठहरू"**

### Test Steps:

#### 1.1 Verify Lessons Load from Backend
- **Expected:** Page shows "पाठहरू लोड गर्दै..." briefly then displays lessons
- **Verify:**
  - [ ] Loading state appears for 1-2 seconds
  - [ ] Lessons list loads successfully
  - [ ] Multiple lessons visible (at least 10)
  - [ ] No JavaScript errors in console

#### 1.2 Check Difficulty Mapping
- **Expected:** Difficulty displays in Nepali
- **Verify:**
  - [ ] Lessons show difficulty: सजिलो (Easy), मध्यम (Medium), कठिन (Hard)
  - [ ] Colors correct: Green for easy, Orange for medium, Red for hard
  - [ ] All lessons have duration shown (e.g., "⏱️ 15 मिनेट")

#### 1.3 Test Prerequisite Locking
- **Expected:** First lesson unlocked, second locked
- **Verify:**
  - [ ] First lesson has play button (not locked)
  - [ ] Second lesson shows 🔒 lock icon
  - [ ] Locked lesson can't be clicked to open
  - [ ] Lock tooltip or message appears when hovering

#### 1.4 Test Lesson Completion
- **Expected:** Clicking lesson opens content, can mark complete
- **Verify:**
  - [ ] Click first lesson opens lesson content
  - [ ] Content displays correctly
  - [ ] Find "पूर्ण गर्नुहोस्" (Complete) button
  - [ ] Click complete button
  - [ ] Next lesson unlocks (lock icon disappears)
  - [ ] First lesson now shows ✅ checkmark

#### 1.5 Test Data Transformation
- **Backend Format → Frontend Format Check**
- **Verify in Browser DevTools (F12 → Console):**
  - [ ] Lessons have `id` field (not `slug`)
  - [ ] Lessons have `title` field in Nepali
  - [ ] Lessons have `duration` field (not `estimated_time`)
  - [ ] Topics display correctly from content

#### 1.6 Test Fallback
- **Expected:** Works even if API fails
- **Test:**
  - [ ] Open DevTools Network tab
  - [ ] Throttle to offline or stop backend
  - [ ] Refresh page
  - [ ] Should show hardcoded 22 lessons
  - [ ] No crash or infinite loading

---

## Test 2: Quest Modal Component ✅

### Setup:
1. Navigate to **"Village"** page or **"गाँव"**
2. Find and click the "शुरु गर्नुहोस्" or quest button

### Test Steps:

#### 2.1 Verify Quests Load from Backend
- **Expected:** Modal shows "क्वेस्टहरू लोड गर्दै..." then displays quests
- **Verify:**
  - [ ] Loading state appears briefly
  - [ ] Quest modal displays with cards
  - [ ] At least 5 quest cards visible
  - [ ] No console errors

#### 2.2 Check Quest Details
- **Expected:** Each quest shows correct data
- **Verify:**
  - [ ] Quest icons visible (Book 📖, Target 🎯, PenTool ✏️)
  - [ ] Quest colors match difficulty
  - [ ] Quest names in Nepali (e.g., "व्याकरण मास्टर")
  - [ ] Difficulty levels visible
  - [ ] Reward info shown (coins 🪙, knowledge 📚, books 📖)

#### 2.3 Test Quest Completion
- **Expected:** Can start and complete quests
- **Verify:**
  - [ ] Click on incomplete quest card
  - [ ] Quest modal opens with details
  - [ ] Start quest or complete quest button appears
  - [ ] Click complete button
  - [ ] Quest completion syncs to backend (check console Network tab)
  - [ ] Rewards awarded (see points increase if game display exists)
  - [ ] localStorage updates (`F12 → Application → localStorage → completed-quests`)

#### 2.4 Test Quest Filtering by Level
- **Expected:** Only available quests for current level shown
- **Verify:**
  - [ ] Village level 1: Only easy quests available
  - [ ] Increase village level if possible
  - [ ] More quests become available
  - [ ] Locked quests show lock icon or disabled state

#### 2.5 Test Completed Quest Display
- **Expected:** Completed quests show differently
- **Verify:**
  - [ ] Completed quest has ✅ checkmark or disabled appearance
  - [ ] Can't click completed quest again
  - [ ] Quest remains in list but grayed out
  - [ ] Completed status persists in localStorage

#### 2.6 Test Data Persistence
- **Expected:** Completed quests saved to localStorage
- **Verify:**
  - [ ] Open DevTools (F12)
  - [ ] Go to Application → localStorage
  - [ ] Find key "completed-quests"
  - [ ] Should contain array of quest IDs: `[1, 2, 3]`
  - [ ] Refresh page - completed quests still show as completed

---

## Test 3: Writing Component ✅

### Setup:
1. Navigate to **"Writing"** page or **"लेखन"**
2. Should see writing practice interface

### Test Steps:

#### 3.1 Verify Writing Prompts Load
- **Expected:** "लेखन प्रश्नहरू लोड गर्दै..." then prompts display
- **Verify:**
  - [ ] Loading state appears
  - [ ] Multiple writing type cards visible
  - [ ] Cards show: कथा (Story), निबन्ध (Essay), etc.
  - [ ] No console errors

#### 3.2 Test Prompt Selection
- **Expected:** Different prompts load when type changes
- **Verify:**
  - [ ] Click on "कथा" (Story) card
  - [ ] Prompt changes to story prompt
  - [ ] Editor appears with placeholder text
  - [ ] Click "निबन्ध" (Essay) card
  - [ ] Prompt changes to essay prompt
  - [ ] Editor text clears

#### 3.3 Test Writing Submission
- **Expected:** Can write and submit to backend
- **Verify:**
  - [ ] Type some Nepali text in editor (at least 20 words)
  - [ ] Check word count updates dynamically
  - [ ] Click "सुरक्षित गर्नुहोस्" (Save/Submit) button
  - [ ] Check Network tab - POST request to `/api/v1/writing/submit/`
  - [ ] Should receive response with points and coins
  - [ ] Success message appears: "तपाईंको लेखन सुरक्षित भयो! +20 अंक प्राप्त!"

#### 3.4 Test Reward Distribution
- **Expected:** Points and coins awarded
- **Verify:**
  - [ ] Look for reward display (if visible)
  - [ ] Total points increase after submission
  - [ ] Total coins increase after submission
  - [ ] Different prompts might give different rewards
  - [ ] Check Network response includes `points_earned` and `coins_earned`

#### 3.5 Test Saved Works Persistence
- **Expected:** Submitted works saved locally
- **Verify:**
  - [ ] Open DevTools (F12)
  - [ ] Go to Application → localStorage
  - [ ] Find key "nepali-writing-works"
  - [ ] Should contain array of submitted works
  - [ ] Refresh page - saved works still visible

#### 3.6 Test Multiple Submissions
- **Expected:** Can submit to different types
- **Verify:**
  - [ ] Write story and submit
  - [ ] Write essay and submit
  - [ ] Both appear in saved works
  - [ ] Each has correct type and timestamp

---

## Test 4: Grammar Shooter Game ✅

### Setup:
1. Navigate to **"Games"** page or **"खेलहरू"**
2. Click on **"Grammar Shooter"** or **"व्याकरण शूटर"**

### Test Steps:

#### 4.1 Verify Questions Load
- **Expected:** Loading state appears, then questions load
- **Verify:**
  - [ ] Loading message: "प्रश्नहरू लोड गर्दै..." appears
  - [ ] After 1-2 seconds, menu appears
  - [ ] Menu shows "खेल सुरु गर्नुहोस्" (Start Game) button
  - [ ] No console errors

#### 4.2 Test Game Start
- **Expected:** Game starts only when questions are loaded
- **Verify:**
  - [ ] Before loading: clicking start shows alert "कृपया प्रतीक्षा गर्नुहोस्..."
  - [ ] After loading: clicking start launches game
  - [ ] Game screen appears with:
    - [ ] Question in Nepali (e.g., "कुन शब्द संज्ञा हो?")
    - [ ] 4 answer options
    - [ ] Crosshair cursor visible
    - [ ] Score display: "अंक: 0"
    - [ ] Lives display: 3 hearts ❤️

#### 4.3 Test Answer Validation
- **Expected:** Correct and incorrect answers handled
- **Verify:**
  - [ ] Click correct answer
  - [ ] Shows success feedback (green or +10 अंक)
  - [ ] Score increases: "अंक: 10"
  - [ ] Next question auto-loads
  - [ ] Click wrong answer on new question
  - [ ] Shows wrong feedback (red or "गलत!")
  - [ ] Heart disappears: 2 hearts remain
  - [ ] Next question loads

#### 4.4 Test Scoring System
- **Expected:** Points calculated correctly
- **Verify:**
  - [ ] Each correct answer: +10 points
  - [ ] Start with 0 points
  - [ ] After 5 correct: 50 points total
  - [ ] Score displays correctly throughout game

#### 4.5 Test Lives Mechanism
- **Expected:** Game ends when lives = 0
- **Verify:**
  - [ ] Start with 3 lives (3 hearts)
  - [ ] Answer 3 questions wrong
  - [ ] After 3rd wrong: Game Over screen appears
  - [ ] Shows final score
  - [ ] "पुनः खेल्नुहोस्" (Play Again) button visible

#### 4.6 Test Game Over State
- **Expected:** Game Over screen shows results
- **Verify:**
  - [ ] Title: "खेल समाप्त!" (Game Over!)
  - [ ] Final score displayed
  - [ ] Performance message based on score
  - [ ] Options to play again or go back
  - [ ] No crash or errors

#### 4.7 Test Multiple Games
- **Expected:** Can play multiple rounds
- **Verify:**
  - [ ] Play game, get game over
  - [ ] Click "पुनः खेल्नुहोस्" (Play Again)
  - [ ] Game resets: Score 0, Lives 3
  - [ ] New questions appear (or same if hardcoded)
  - [ ] Can play without page refresh

---

## API Verification Checklist

### For Each Component:

1. **Network Requests (F12 → Network tab)**
   - [ ] GET requests for data loading show status 200
   - [ ] POST requests for submissions show status 200 or 201
   - [ ] Response payloads contain correct data structure
   - [ ] No 401 (unauthorized) errors - token working

2. **Console Errors (F12 → Console)**
   - [ ] No red error messages
   - [ ] Only info/warning messages acceptable
   - [ ] API errors logged but handled gracefully

3. **localStorage (F12 → Application → localStorage)**
   - [ ] completed-quests: array of quest IDs
   - [ ] nepali-writing-works: array of submitted works
   - [ ] Both persist across page refreshes

---

## Common Issues & Solutions

### Issue: Components Not Loading (Blank Page)
- **Solution:** Check backend is running on port 8000
- **Command:** `python manage.py runserver 8000`

### Issue: "Network Error" Messages
- **Solution:** Check CORS settings in Django
- **Check:** `CORS_ALLOWED_ORIGINS` in settings.py includes `http://localhost:3000`

### Issue: Token Expired / 401 Errors
- **Solution:** Login again to get new token
- **Verify:** Token stored in localStorage under key "auth_token"

### Issue: No Data Displaying
- **Solution:** Check database has data
- **Command:** Backend terminal should show API requests being made
- **Check Network tab:** Should see API calls to `/api/v1/...`

### Issue: Fallback Data Not Showing
- **Solution:** Fallback only works if API fails
- **Test:** Temporarily disconnect network or stop backend
- **Expected:** Should still show hardcoded data

---

## Test Results Template

For each component, record:

```
Component: [Name]
Date: [Date]
Tester: [Name]
Backend: ✅ Running / ❌ Not Running
Frontend: ✅ Running / ❌ Not Running

Test Results:
- Data Loading: ✅ Pass / ❌ Fail
- Difficulty Mapping: ✅ Pass / ❌ Fail
- API Sync: ✅ Pass / ❌ Pass
- localStorage: ✅ Pass / ❌ Fail
- Error Handling: ✅ Pass / ❌ Fail

Issues Found:
[List any issues]

Notes:
[Additional observations]
```

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - ✅ Integration complete and verified
   - Update status to Production Ready
   - Deploy to staging environment

2. **If Issues Found:**
   - Document issue details
   - Check logs: Backend console and Browser DevTools
   - Fix issues in code
   - Re-run relevant tests

3. **Performance Testing (Optional):**
   - Measure API response times
   - Check for unnecessary re-renders
   - Optimize if needed

---

## Contact & Support

If tests fail or issues found:
1. Check this guide for common issues
2. Review backend logs: `Backend/nepali_vyakaran_learning/`
3. Check frontend console: `F12 → Console tab`
4. Review Network requests: `F12 → Network tab`

---

**Document Generated:** January 17, 2026  
**Last Updated:** Integration Complete  
**Status:** Ready for Testing
