# Annual Financial Planner

A beautiful, mobile-first annual financial planner for iOS and Android — built with React, TypeScript, TailwindCSS, Supabase, and Capacitor.

## Features

- **12-Month Calendar View** with goal tracking per month
- **Monthly Budget Spread** with 11 spending categories and progress indicators
- **Weekly Spending Tracker** with week-by-week breakdown
- **Monthly Reflection Prompts** — 12 guided prompts to understand your money story
- **Goal Commitment Page** with visual progress thermometer
- **Habit Tracker** — 52-week grid for weekly finance check-ins
- **Debt Snowball Tracker** with payoff projection
- **Emergency Fund Tracker** with months-of-safety-net indicator
- **Year-End Review** with annual snapshot and letter to future self

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite 5 |
| Styling | TailwindCSS 3.4 |
| State | Zustand 4 (persist) |
| Routing | React Router v6 |
| Backend | Supabase (Auth + Postgres + RLS) |
| Mobile | Capacitor 8 (iOS + Android) |
| Charts | Recharts 2.12 |
| Dates | date-fns 3 |
| Icons | Lucide React |

## Project Structure

```
src/
├── components/ui/      # TabLayout, ToastProvider, reusable UI
├── lib/supabase.ts     # Supabase client + all data helpers
├── pages/
│   ├── auth/           # LoginPage, OnboardingPage
│   ├── home/           # DashboardPage
│   ├── goals/          # CalendarPage, GoalCommitmentPage
│   ├── budget/         # MonthlyBudgetPage, WeeklyTrackerPage
│   ├── reflect/        # MonthlyReflectionPage, HabitTrackerPage
│   ├── more/           # DebtSnowballPage, EmergencyFundPage, YearEndReviewPage, SettingsPage
│   └── landing/        # LandingPage (public)
├── stores/             # Zustand stores (auth, planner)
├── types/index.ts      # All TypeScript interfaces
├── App.tsx             # Routing + auth bootstrap
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account (free tier works)
- Xcode (for iOS build)
- Android Studio (for Android build)

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Enable **Google OAuth** in Authentication → Providers (optional)
4. Copy your Project URL and `anon` public key to `.env`

### 4. Run Locally

```bash
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build → dist/
```

### 5. Add Mobile Platforms

```bash
npx cap add ios      # iOS (requires Xcode)
npx cap add android  # Android (requires Android Studio)
npx cap sync         # Sync web assets to native
npx cap open ios     # Open in Xcode
npx cap open android # Open in Android Studio
```

## Database Schema

All tables use **Row Level Security (RLS)** — users can only access their own data.

| Table | Purpose |
|---|---|
| `profiles` | User profile + subscription tier |
| `goals` | Savings goals with target dates |
| `monthly_budgets` | Per-category monthly budget/spent |
| `transactions` | Income and expense entries |
| `habits` | Custom habit definitions |
| `habit_logs` | Weekly habit check-ins |
| `debts` | Debt accounts |
| `debt_payments` | Payment history |
| `emergency_fund` | Fund configuration |
| `emergency_fund_logs` | Monthly balance history |
| `reflections` | Monthly reflection answers |
| `subscriptions` | Stripe subscription status |

## Subscription Tiers

| Feature | Free | Pro (€7.99/mo) |
|---|---|---|
| Goals | 1 | Unlimited |
| Budget categories | 3 | 11 |
| Transactions/mo | 30 | Unlimited |
| Habit tracker | ❌ | ✅ |
| Year-end PDF export | ❌ | ✅ |
| Cloud sync | ❌ | ✅ |

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run cap:ios      # Add iOS platform
npm run cap:android  # Add Android platform
npm run cap:sync     # Sync to native platforms
```

## Design System

- **Primary**: Navy `#1E2D4F`
- **Accent**: Gold `#C8A96E`
- **Positive**: Teal `#2A9D8F`
- **Alert**: Rose `#C0576B`
- **Background**: Cream `#FAF8F5`
- **Fonts**: Inter (UI), Playfair Display (display), JetBrains Mono (numbers)

---

Built with by Christian & the OpenClaw team.
