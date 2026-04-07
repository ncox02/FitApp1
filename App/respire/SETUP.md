# Respire — Setup Guide
## From zero to running on your phone in ~30 minutes

---

## What you need before starting
- A computer (Mac, Windows, or Linux)
- A GitHub account (github.com — free)
- A Supabase account (supabase.com — free, no credit card)
- A Vercel account (vercel.com — free, sign up with GitHub)
- Node.js installed (nodejs.org — download the LTS version)

---

## STEP 1 — Install Node.js

1. Go to **nodejs.org**
2. Download the **LTS** (Long Term Support) version
3. Run the installer, click through all defaults
4. To verify it worked, open Terminal (Mac) or Command Prompt (Windows) and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`. That's it.

---

## STEP 2 — Create your Supabase project

1. Go to **supabase.com** and sign up (free)
2. Click **New Project**
3. Name it `respire` (or anything)
4. Set a database password — save it somewhere safe
5. Choose the region closest to you
6. Wait ~2 minutes for it to spin up

### Run the database schema

1. In Supabase, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy everything in that file
5. Paste it into the SQL editor
6. Click **Run** (green button)
7. You should see "Success. No rows returned."

### Get your API keys

1. In Supabase, go to **Settings → API**
2. Copy these two values — you'll need them in Step 4:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## STEP 3 — Put the code on GitHub

1. Go to **github.com** and click **New repository**
2. Name it `respire` (or anything you want)
3. Make it **Private** (your health data stays yours)
4. Don't add a README or .gitignore — leave them unchecked
5. Click **Create repository**
6. GitHub will show you commands to push code. Open Terminal and run:

```bash
# Navigate to the respire folder (wherever you saved it)
cd /path/to/respire

# Initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/respire.git
git push -u origin main
```

Replace `YOURUSERNAME` with your actual GitHub username.

---

## STEP 4 — Deploy on Vercel

1. Go to **vercel.com** and sign up with your GitHub account
2. Click **Add New → Project**
3. Find your `respire` repository and click **Import**
4. Vercel will auto-detect it's a Vite project. Leave everything as-is.
5. Click **Environment Variables** and add these two:
   - Name: `VITE_SUPABASE_URL` · Value: your Supabase Project URL
   - Name: `VITE_SUPABASE_ANON_KEY` · Value: your Supabase anon key
6. Click **Deploy**
7. Wait ~60 seconds. Vercel gives you a URL like `https://respire-abc123.vercel.app`

That's your live app. Share this URL with anyone you want to have access.

---

## STEP 5 — Install on your iPhone

1. Open **Safari** on your iPhone (must be Safari, not Chrome)
2. Go to your Vercel URL
3. Tap the **Share** button (square with arrow pointing up)
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **Add**
6. The app icon appears on your home screen — tap it to open full-screen

### For Android

1. Open **Chrome** on your Android phone
2. Go to your Vercel URL
3. Tap the **three-dot menu** (top right)
4. Tap **"Add to Home Screen"** or **"Install App"**
5. Tap **Install**

---

## STEP 6 — Set up your account

1. Open the app
2. Tap **Create Account** — use your email and a password
3. Walk through the onboarding (takes ~2 min)
4. Start training

---

## Running locally (for development)

If you want to run the app on your computer to make changes:

```bash
# In the respire folder:
cp .env.local.example .env.local
# Edit .env.local and add your Supabase keys

npm install
npm run dev
# Opens at http://localhost:5173
```

---

## Updating the app

Whenever you or I make changes to the code:

```bash
git add .
git commit -m "describe what changed"
git push
```

Vercel picks up the push and deploys automatically in ~30 seconds.
Your users' data is never affected by updates.

---

## Sharing with others

Anyone who visits your Vercel URL can create their own account.
Each account has completely separate, private data.
You can share the URL freely — data is secured per user by Supabase.

---

## Changing the app name

Open `src/lib/constants.js` and change:
```js
export const APP_NAME = 'Respire'
```
to whatever you want. Push to GitHub, Vercel redeploys, done.

---

## Troubleshooting

**"Missing Supabase env vars" in console**
→ Check that your `.env.local` has the correct keys. Restart `npm run dev`.

**"relation does not exist" error**
→ The SQL schema wasn't run. Go to Supabase SQL Editor and run `001_initial_schema.sql` again.

**App doesn't load on Vercel**
→ Check Vercel dashboard → Deployments → click the failed build → read the error log.

**Push notifications not working on iPhone**
→ You must install the app to your Home Screen first. Notifications don't work in the browser tab, only in the installed PWA.

---

## File structure quick reference

```
src/
  lib/
    constants.js      ← All Ferriss protocols, exercise data, supplement info
    scheduling.js     ← Scheduling + date logic
    progression.js    ← Weight/distance progression + nutrition math
  pages/
    Today.jsx         ← Main daily dashboard (most important screen)
    Settings.jsx      ← All configuration
    Nutrition.jsx     ← Meals, ingredients, daily log
    Log.jsx           ← Workout history + measurements
    Progress.jsx      ← Charts and trends
  contexts/
    AuthContext.jsx   ← Login state
    SettingsContext.jsx ← User settings (synced to Supabase)
    ThemeContext.jsx  ← Light/dark theme
supabase/
  migrations/
    001_initial_schema.sql  ← Run this once in Supabase SQL Editor
```
