# DevPath — SDE Learning Tracker

A gamified full-stack web app to help aspiring software engineers track their daily learning progress, earn XP, maintain streaks, and unlock achievements.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS 3    |
| Auth + DB  | Supabase (Auth, Postgres, Realtime) |
| Routing    | React Router v6                     |
| Charts     | Recharts                            |
| Icons      | Lucide React                        |
| Confetti   | canvas-confetti                     |
| Fonts      | Syne (display) + DM Sans (body)     |

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd devpath
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → paste the contents of `supabase_schema.sql` → Run
3. This creates all 4 tables with RLS enabled + the auto-profile trigger

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase → **Settings → API**.

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 5. Build for production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx       — Desktop sidebar nav
│   │   ├── Navbar.jsx        — Mobile top bar
│   │   └── BottomTab.jsx     — Mobile bottom tab bar
│   ├── ui/
│   │   ├── Button.jsx        — Primary/secondary/danger/ghost variants
│   │   ├── Card.jsx          — Surface card container
│   │   ├── Modal.jsx         — Accessible modal with Escape key support
│   │   ├── Toast.jsx         — Toast notifications + useToast hook
│   │   ├── Skeleton.jsx      — Shimmer skeleton loaders
│   │   ├── ProgressBar.jsx   — Animated progress bar
│   │   └── Badge.jsx         — Category badges
│   ├── charts/
│   │   ├── WeeklyHeatmap.jsx — Last 7 days activity grid
│   │   └── index.jsx         — Line, Bar, Donut recharts components
│   └── forms/
│       ├── LogForm.jsx       — Study session log form (handles XP + streak)
│       └── TopicForm.jsx     — Add/edit topic form
├── pages/
│   ├── Login.jsx             — Email/password sign in
│   ├── Signup.jsx            — Registration with email confirmation
│   ├── Dashboard.jsx         — Main home with stats, heatmap, topics
│   ├── Topics.jsx            — Full CRUD for topics + log history
│   ├── Log.jsx               — Standalone log session page
│   ├── Stats.jsx             — Charts: line, bar, donut + summary stats
│   └── Achievements.jsx      — Achievement grid (locked/unlocked)
├── context/
│   └── AuthContext.jsx       — Global auth state + profile
├── lib/
│   ├── supabase.js           — Supabase client + ALL query functions
│   ├── xp.js                 — XP/level/streak calculation utilities
│   └── achievements.js       — Achievement definitions + unlock logic
├── hooks/
│   ├── useProfile.js         — Profile data hook
│   ├── useLogs.js            — Daily logs data hook
│   └── useTopics.js          — Topics data hook
├── App.jsx                   — Router, layout shell, toast provider
├── main.jsx                  — React entry point
└── index.css                 — Tailwind directives + global styles
```

---

## Database Schema

```sql
profiles      — user XP, streak, last_active
topics        — learning topics with progress tracking
daily_logs    — individual study sessions
achievements  — unlocked achievements per user
```

All tables have Row Level Security (RLS) — users can only access their own data.

---

## Gamification System

| Mechanic     | Rule                                                        |
|--------------|-------------------------------------------------------------|
| XP           | 1 XP per minute studied                                     |
| Streak Bonus | +50 XP if you logged a session yesterday                    |
| Streak       | Increments on consecutive days, resets to 1 if day skipped |
| Levels       | Every 500 XP = 1 level (10 levels total)                    |
| Confetti     | Fires on level-up via canvas-confetti                       |
| Achievements | Auto-checked and unlocked after each session log            |

### Level Names

| Level | Name                 |
|-------|----------------------|
| 1     | Code Newbie          |
| 2     | JS Explorer          |
| 3     | React Builder        |
| 4     | Full Stack Apprentice|
| 5     | API Crafter          |
| 6     | Database Wrangler    |
| 7     | System Thinker       |
| 8     | Interview Ready      |
| 9     | Offer Getter         |
| 10    | SDE Unlocked         |

### Achievements

| Achievement    | Unlock Condition                    |
|----------------|-------------------------------------|
| First Step     | Log first session                   |
| On Fire        | 3-day streak                        |
| Week Warrior   | 7-day streak                        |
| Century        | 100 total XP                        |
| React Rookie   | Complete a React topic              |
| Night Owl      | Single session ≥ 120 minutes        |
| Consistent     | 5-day streak                        |
| Halfway There  | Reach Level 5                       |
| SDE Unlocked   | Reach Level 10                      |

---

## Supabase Setup Notes

- **Email confirmation** is handled by Supabase automatically. Users must confirm before logging in.
- **Profile auto-creation**: The `handle_new_user` trigger creates a `profiles` row on signup. No manual step needed.
- **Realtime**: The `daily_logs` table is added to `supabase_realtime` publication so the dashboard updates live.
- **RLS**: All tables enforce `auth.uid() = user_id` (or `id` for profiles). Never expose service-role key on the frontend.

---

## Environment Variables

| Variable               | Description              |
|------------------------|--------------------------|
| `VITE_SUPABASE_URL`    | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key  |

---

## Deploying

Works on any static host (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
# Deploy the /dist folder
```

Set the same `.env` variables in your hosting provider's dashboard.

---

## License

MIT
