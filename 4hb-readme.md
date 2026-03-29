# 4HB Operator — Architecture & Deployment Guide

## What This Is

A complete Progressive Web App (PWA) implementing Tim Ferriss' 4-Hour Body protocols. Single HTML file, zero backend, zero cost.

---

## Architecture

```
4hb-app.html  (single file, ~1400 lines)
│
├── DATA LAYER: localStorage (JSON)
│   ├── settings          — all user config, toggles, goals
│   ├── workouts          — strength + posterior chain sessions
│   ├── running_log       — all run data
│   ├── measurements      — weekly body measurements (Ferriss TI system)
│   ├── nutrition_log     — daily meals, calories, protein, water
│   ├── ingredients       — ingredient database (importable from CSV)
│   ├── meals             — built meals referencing ingredients
│   ├── meal_plan         — weekly meal assignments
│   ├── sleep_log         — sleep hours + quality
│   └── weekly_plan       — auto-generated 7-day schedule
│
├── SCHEDULING ENGINE
│   ├── generateWeeklySchedule() — assigns components to days
│   ├── getTodaySchedule()       — returns today's workout
│   └── regenerateSchedule()     — rebuilds on settings change
│
├── PROGRESSION ENGINE
│   ├── getNextWeight()          — G2F weight progression (10+ reps = +increment; <5 reps = -10%)
│   ├── getCurrentRunDistance()  — MAF distance progression (+10%/week)
│   └── getMAFHR()               — 180 - age
│
├── NUTRITION ENGINE
│   ├── calcAutoNutrition()      — auto-calc calories/protein from bodyweight
│   ├── calcMealMacros()         — compute macros from ingredient database
│   └── getOrCreateTodayNutrition() — idempotent daily log creation
│
└── UI LAYER: 5 pages
    ├── Today   — daily workout + nutrition snapshot
    ├── Log     — workout history + measurements
    ├── Nutrition — meal database + daily log
    ├── Progress  — charts, trends, body comp
    └── Settings  — all configuration
```

---

## Data Model

```js
// Settings (stored in db.settings)
{
  name, bodyweight, heightIn, bodyFatPct, age,
  trainingDays: [1,2,4,5,6],  // Mon-Fri by default (no Sunday)
  
  // Component toggles
  useStrength, useRunning, useCore, usePosterior, useMobility, useNutrition,
  
  // Strength
  strengthProgram: 'g2f',
  g2fCurrentWeek, g2fTestDone,
  
  // Running (MAF method)
  runningPlan: 'maf',
  age,                     // used for MAF = 180 - age
  runningStartDistance,
  runningProgressionPct,   // default 10%
  runningProgressionType,  // 'distance' | 'time'
  
  // Nutrition
  nutritionPlan: 'slowcarb',
  calorieGoal, proteinGoal,
  cheatDay,
  
  // Mobility
  mobilityAreas: ['shoulders','hips','wrists'],
  
  // Supplements (booleans)
  supPolicosanol, supALA, supGarlic, supGlutamine,
  supCreatine, supCissus, supCashews, supAirSquats,
}

// Workout log entry (db.workouts[])
{
  id, date, type: 'strength' | 'posterior',
  data: [{ name, weight, reps, sets }],
  notes, time, completed,
}

// Run log entry (db.running_log[])
{
  id, date,
  type: 'easy' | 'easy2' | 'intervals',
  distance, duration, avgHR, maxHR, notes, time,
}

// Measurement (db.measurements[])
{
  date, weight, bodyFat,
  neck, chest, waist, hips,
  rightArm, leftArm, rightThigh, leftThigh,
  rightCalf, leftCalf, notes,
}

// Nutrition log (db.nutrition_log[])
{
  date,
  meals: [{ name, calories, protein, carbs, fat, mealId, quick, time }],
  water, calories, protein, compliant, notes,
}

// Ingredient (db.ingredients[])
{
  id, name, store,
  servingSize, servingUnit,
  protein, carbs, fat, sodium, fiber, sugars, satFat,
  unitPrice,
}

// Meal (db.meals[])
{
  id, name, notes,
  ingredients: [{ ingredientId, servings }],
}
```

---

## Ferriss Protocols Implemented

### Geek to Freak (Strength)
- 1 set per exercise to absolute failure
- 5-second concentric, 5-second eccentric cadence
- 5 exercises: Yates Row, Overhead Press, Chest-Supported Incline, Leg Press
- 3-5 day rest between sessions (2x/week scheduling)
- Test day for initial weights
- Progression: ≥10 reps → increase weight; <5 reps → deload 10%
- Caloric target: bodyweight × 24 × 1.1; Protein: BW × 1.25g

### 6-Minute Abs (Core)
- Myotatic Crunch on exercise ball (4 sec down, 2 sec up)
- Cat Vomit (Ab Vacuum): exhale, navel to spine, 10-sec hold × 8-12 reps
- Side Plank: 30-60 sec each side × 2 sets
- Video links included for each exercise

### 75 Kettlebell Swings (Posterior Chain)
- 5 sets × 15 reps = 75 total
- Hip hinge, not squat
- 60-sec rest between sets
- 2x/week aligned with strength days

### MAF Running (Endurance)
- 3x/week: 2 easy aerobic + 1 interval session
- MAF Heart Rate = 180 minus age
- Stay at or below MAF HR the entire easy run
- 10% weekly distance progression
- Intervals: 6 × 400m hard / 400m recovery

### Slow-Carb Diet
- Same 4-5 meals repeated
- No white carbs, no dairy, no fruit, no liquid calories
- Beans/legumes at every meal
- One cheat day/week (Saturday default)
- Cheat day protocol: ALA, policosanol, air squats before/after meals

### Ferriss Measurements
- Weekly tracking: weight + 10 body measurements
- Total Inches (TI) calculation
- Body fat % (manual entry)
- Tracks trends to show real body composition change

---

## Scheduling Logic

```
Week starts Monday.
Training days: configurable (default Mon,Tue,Thu,Fri,Sat).
Sunday excluded by default.

Strength days = first 2 training days of week (Mon+Tue)
Running days = remaining training days (Thu,Fri,Sat)
  - Day 1: Easy run
  - Day 2: Easy run #2
  - Day 3: Interval run

Core = added to strength days
Posterior = added to strength days
Mobility = added to non-strength, non-run days OR easy run days
```

---

## Running on Your Phone

### Option A: GitHub Pages (Recommended, Free)

1. Create a free GitHub account at github.com
2. Create a new repository (e.g. `my-4hb-app`)
3. Upload `4hb-app.html` as `index.html`
4. Go to Settings → Pages → Deploy from main branch
5. Your URL: `https://yourusername.github.io/my-4hb-app`
6. Visit on your iPhone/Android, tap Share → "Add to Home Screen"
7. App installs as a PWA (works offline, full-screen, icon on home screen)

### Option B: Netlify (Free, Drag & Drop)

1. Go to netlify.com
2. Drag and drop your `4hb-app.html` file (rename to `index.html` first)
3. Get a URL like `https://abc123.netlify.app`
4. Add to Home Screen on your phone

### Option C: Local (just your phone)

1. Host from your own computer using `python3 -m http.server 8000`
2. Access from phone on same WiFi: `http://192.168.x.x:8000/4hb-app.html`

### Option D: File directly in browser

Just open the HTML file directly in your phone's browser. Most features work.
Note: Service worker (offline mode) won't work without HTTPS.

---

## Sharing With Others

Each person needs their own copy of the file. The data is stored locally (localStorage) per device/browser, so each user has their own independent data. To share:

1. Share the GitHub Pages URL — anyone can access it
2. Each user's data is stored privately on their own device
3. For family members: they visit the same URL on their device, get their own clean data

---

## Importing Your Ingredient Spreadsheet

In the app: Nutrition → Import CSV

**Expected format** (one row per ingredient):
```
name, store, unitPrice, servings, protein, carbs, sugars, fiber, fat, satFat, sodium, servingUnit, servingSize
Chicken Breast,Costco,0.50,4,25,0,0,0,3,1,60,oz,4
Black Beans,TJ's,0.25,0.5,7,20,0,7,0.5,0,400,cup,0.5
```

Export your spreadsheet as CSV, open in a text editor, copy the rows, paste into the import box.

---

## Updating the App

1. Download/edit the `4hb-app.html` file
2. Replace the old file in your GitHub repo
3. The update deploys automatically in ~30 seconds
4. Users' data is preserved in localStorage (not affected by updates)
5. If you add new settings fields, the app merges with defaults automatically

---

## Data Backup

- Progress → Export JSON → saves a complete backup file
- Progress → Import JSON → restores from backup
- Back up weekly or before any update
- Can also export to CSV from the Ingredients section

---

## Future Enhancements (roadmap ideas)

- [ ] Push notifications for workout reminders (requires HTTPS)
- [ ] Barcode scanner for food logging
- [ ] Heart rate monitor integration (Web Bluetooth)
- [ ] Multi-device sync (would require a simple backend — Supabase free tier)
- [ ] AI meal suggestions based on ingredients on hand
- [ ] Photo progress tracking
- [ ] Garmin/Strava run import
- [ ] More strength programs (5/3/1, Starting Strength, etc.)
