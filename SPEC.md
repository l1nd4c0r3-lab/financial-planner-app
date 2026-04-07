# Financial Planner — Product Specification

## 1. Concept & Vision

**Annual Financial Planner** is a mobile-first annual planner that transforms how people relate to their money — not with anxiety, but with intention. It's the feeling of a beautifully designed paper planner, but alive: it tracks your goals, shows you where your money goes, celebrates your wins, and holds space for honest reflection.

The personality is **warm, confident, and encouraging** — like a financially-savvy friend who keeps you on track without judgment. The tone is human: specific, honest, and positive without being naive.

---

## 2. Design Language

### Aesthetic Direction
**"Warm Professional"** — Navy authority meets gold warmth. The palette feels like a leather-bound planner that costs €200, not a free spreadsheet. Clean lines, generous whitespace, thoughtful micro-interactions. The kind of app that makes you want to open it.

### Color Palette
| Token | Hex | Use |
|---|---|---|
| Navy | `#1E2D4F` | Primary CTAs, headings, nav |
| Navy Light | `#D8DDE8` | Borders, subtle dividers |
| Gold | `#C8A96E` | Highlights, pro badges, celebrations |
| Gold Light | `#DBC49A` | Progress fills, hover states |
| Teal | `#2A9D8F` | Positive indicators, savings, in-progress |
| Teal Light | `#5BC4B6` | Habit done, goal achieved |
| Rose | `#C0576B` | Alerts, over-budget, missed habits |
| Cream | `#FAF8F5` | Page background (warm off-white) |
| Mid Gray | `#D8D3CC` | Secondary text, borders |

### Typography
- **Display / Hero headings**: Playfair Display (700) — gives elegance and weight
- **UI / Body**: Inter (300–700) — crisp, highly legible at small sizes
- **Numbers / Mono**: JetBrains Mono (400, 500) — aligns financial figures beautifully
- **Fallbacks**: Helvetica Neue, Arial, sans-serif

### Spatial System
- Base unit: 4px
- Card padding: 16px (p-4)
- Section spacing: 24px (py-6)
- Touch targets: minimum 44px height
- Border radius: cards 16px (rounded-2xl), buttons 12px (rounded-xl), badges 999px (rounded-full)

### Motion Philosophy
- **Entrance**: fade-in + slide-up (opacity 0→1, translateY 8px→0, 300ms ease-out)
- **Tab transitions**: slide-right (translateX 100%→0, 300ms ease-out)
- **Progress fills**: fill-up (scaleY 0→1 from bottom, 600ms ease-out) — makes progress feel earned
- **Button press**: scale 0.95 (150ms ease-in-out)
- **Thermometer fill**: animate on mount with fillUp keyframe
- **Stagger delay**: 50ms between list items for natural cascade

### Visual Assets
- **Icons**: Lucide React — consistent 22px stroke icons, weight varies per context
- **Charts**: Recharts — Bar (emergency fund), Line (savings trend)
- **Decorative**: Subtle navy/teal gradients on hero cards, gold shimmer on celebrations
- **No emoji** in UI — SVG icons only

---

## 3. Layout & Structure

### Navigation
- **Bottom tab bar** (fixed, 5 tabs): Home · Goals · Budget · Reflect · More
- Active tab: navy fill + semibold label; inactive: mid-gray
- Safe area padding on iOS (env safe-area-inset-bottom)

### Page Structure
Each page follows a consistent rhythm:
1. **Sticky header** — page title + month selector arrows where applicable
2. **Scrollable content** — cards and sections with generous padding
3. **No bottom sheet modals** — inline editing preferred for mobile clarity

### Responsive Strategy
- Mobile-first (375px baseline)
- Max-width container: 448px (max-w-lg) centered on larger screens
- Cards stretch full-width on mobile, fixed width on desktop

---

## 4. Features & Interactions

### Dashboard (Home)
- **Greeting** with time-of-day awareness (Good morning/afternoon/evening)
- **Monthly snapshot card**: income total, expense total, net savings, savings rate %
- **Savings thermometer**: vertical fill bar from bottom (0%→100%)
- **Debt countdown**: if debts exist, shows months-remaining estimate
- **Quick stats grid**: savings rate (teal), check-in streak (gold), transaction count (navy)
- **Recent transactions**: last 5, amount + category + date, "See all" link
- **FAB (+)** bottom-right: opens quick-add transaction modal (amount, category, note, week selector)

### Calendar View
- **Horizontal month picker**: scrollable 12-month strip, current month centered/highlighted
- **3 goal rows per month**: title + progress bar + percentage
- **Milestone badges**: 25%=🥉, 50%=🥈, 75%=🥇, 100%=🏆 (shown as SVG/text, not emoji)
- **Add goal inline**: + button per row, inline form (title, target, date, color)
- **Monthly note**: collapsible textarea at bottom of each month

### Goal Commitment Page
- **Hero statement card**: large serif text — "My financial goal is [X] by [Y date]"
- **5 goal rows**: progress %, color-coded bar, target vs current amounts
- **Milestone tracker**: 4-step badges (25/50/75/100%) with completed checkmarks
- **"Why this matters"**: expandable textarea per goal, saved to Supabase on blur

### Monthly Budget
- **Month nav arrows**: prev/next, current month label
- **Top progress bar**: total budgeted vs total spent, % fill
- **11 category rows**: category icon + name | budgeted input | spent input | remaining (calculated)
- **Color coding**: green (≤80%), yellow (80-100%), red (>100%)
- **Total row**: bold, shows overall budgeted/spent/remaining
- **Pro badge**: "Upgrade" prompt for free tier users on categories >3

### Weekly Spending Tracker
- **Week tabs**: Week 1 | Week 2 | Week 3 | Week 4 (active underline)
- **Per-category rows**: category | Week 1 | Week 2 | Week 3 | Week 4 | Total
- **Quick-add**: bottom FAB, adds transaction to selected week
- **Running totals**: week-by-week subtotals at bottom

### Monthly Reflection
- **Month selector** with nav arrows
- **12 prompt cards**: question text + tall textarea (auto-grow), auto-save on blur
- **Scrollable**: all 12 questions visible in scroll container
- **Highlight of the month**: special callout box at top for the proudest decision

### Habit Tracker
- **52-week grid**: 7 columns (habits) × 52 columns (weeks), scrollable horizontally
- **Cell states**: ☐ (none) → ✅ (done) → ❌ (missed) → ☐ cycling on tap
- **Streak counter**: current streak + longest streak displayed in card above grid
- **Weeks done**: count of weeks with 100% habit completion
- **Add habit**: + button, name + color picker

### Debt Snowball Tracker
- **Debt list**: ordered by snowball (smallest first), each row shows name, balance, rate, min payment
- **Pay Extra button**: opens payment modal (amount, date)
- **Snowball math**: extra payment "snowballs" to next debt when one is paid off
- **Debt-free date**: calculated estimate based on current snowball payment
- **Payment history**: per-debt log, last 5 entries

### Emergency Fund Tracker
- **Status card**: months of coverage (e.g. "3.2 months"), color-coded badge (red/yellow/green)
- **Progress bar**: current balance vs target (months_target × monthly_expense_estimate)
- **12-month bar chart**: monthly ending balances as vertical bars
- **Contribution log**: date + amount + balance after, inline add form
- **Target editor**: edit target amount and monthly expense estimate inline

### Year-End Review
- **Annual snapshot**: total income, total expenses, net savings (big numbers)
- **Goal achievement**: X of Y goals completed, visual progress
- **Habit scorecard**: average weekly check-in rate, best streak
- **Spending reflection**: biggest expense category, biggest saving win
- **Impulse estimate**: optional self-estimate slider (€0–500)
- **Letter to Future Me**: tall textarea, encouraged and warm in tone
- **Next year priorities**: 2 priority inputs for the coming year
- **Export as PDF**: button (Pro) — generates summary page

### Settings
- **Profile card**: name (editable), email, avatar placeholder
- **Subscription card**: current plan badge, "Upgrade to Pro" button if free, manage billing link
- **PIN Lock**: toggle switch for app lock (4-digit PIN entry on first enable)
- **Notifications**: toggle for weekly reminder, toggle for budget alerts
- **Data**: "Export My Data" button (JSON download)
- **About**: version, privacy policy, support email

### Freemium Gating
- Free tier: 1 goal, 3 budget categories, 30 transactions/month, no habit tracker, no PDF export
- Pro tier (€7.99/month): unlimited everything, PDF export, cloud sync
- Gating implemented as: feature-flag checks in each screen + UpgradeModal component

### Transactions (Quick-Add Modal)
- Fields: Amount (€), Category (dropdown), Description (optional), Week (1-4)
- Validation: amount required >0, category required
- On save: adds to transactions table + updates monthly_budgets.spent for that category
- On close: animation out, no persistence if fields empty

---

## 5. Component Inventory

### Cards
- **Base card**: white bg, 16px radius, 8px shadow, 16px padding
- **Hover state**: shadow lifts to 16px, 4px translateY up
- **Active state**: scale 0.98

### Inputs
- **Text input**: full-width, 16px padding, 12px radius, navy border on focus, gold ring
- **Number input**: right-aligned, monospace font, no spinners
- **Textarea**: auto-grow, min 80px height, resize: none

### Buttons
- **Primary**: navy bg, white text, 12px radius, semibold, active scale 0.95
- **Secondary**: white bg, navy border, navy text
- **Gold**: gold bg, navy text (accent/celebration)
- **Ghost**: transparent bg, navy text, 8px radius
- **Disabled**: opacity 0.4, pointer-events none

### Progress Bar
- Height: 8px (small), 12px (default), 20px (thermometer)
- Background: navy/10
- Fill: gradient left→right (teal→teal-light) for positive, rose for negative
- Border radius: full (rounded-full)

### Badges
- **Free**: navy/10 bg, navy text, 2xs, uppercase, bold, rounded-full
- **Pro**: gold/20 bg, gold-dark text
- **Status**: teal/20 for 'on-track', gold/20 for 'at-risk', rose/20 for 'over-budget'

### Thermometer (Savings)
- Vertical bar, 20px wide, 200px tall, navy/10 bg
- Fill from bottom, teal gradient
- Tick marks at 0%, 25%, 50%, 75%, 100%
- Percentage label at top of fill

### Toast Notifications
- Fixed bottom-center, above tab bar
- 3 types: success (teal bg), error (rose bg), info (navy bg)
- slide-up animation, auto-dismiss 3s

### Upgrade Modal
- Full-screen overlay, centered card
- Shows Pro features list, price, CTA button
- Dismissible with X or swipe down

---

## 6. Technical Approach

### Stack
- **Frontend**: React 18 + TypeScript + Vite 5
- **Styling**: TailwindCSS 3.4 + custom design tokens
- **State**: Zustand 4 (persist middleware → localStorage for guest/demo users)
- **Routing**: React Router v6 (file-based via App.tsx routes)
- **Backend**: Supabase (Auth + Postgres + RLS)
- **Mobile**: Capacitor 6 (iOS + Android shells)
- **Charts**: Recharts 2.12
- **Dates**: date-fns 3
- **Icons**: lucide-react

### Data Model (Supabase/Postgres)

```
profiles         — id, email, display_name, avatar_url, subscription_tier, stripe_*
goals            — id, user_id, title, target_amount, current_amount, target_date, status, color, order_index
monthly_budgets  — id, user_id, month(DATE), category, budgeted, spent, notes
transactions     — id, user_id, amount, category, description, date, week_of_month, month, type
habits           — id, user_id, name, color
habit_logs       — id, user_id, habit_id, week_number, year, status
debts            — id, user_id, name, original_amount, current_balance, min_payment, interest_rate
debt_payments    — id, user_id, debt_id, amount, date
emergency_fund   — id, user_id, target_amount, monthly_expense_estimate, months_target
emergency_fund_logs — id, user_id, month(DATE), starting_balance, contributions, withdrawals, ending_balance
reflections      — id, user_id, month(DATE), question_key, answer
subscriptions    — id, user_id, stripe_subscription_id, tier, status, current_period_end
```

### Auth Strategy
- Supabase Auth: email/password + Google OAuth
- JWT stored in localStorage via Supabase client
- RLS enforced at database level — users can only read/write their own rows
- Demo mode: when `VITE_SUPABASE_URL` is absent, all data goes to Zustand + localStorage

### API Design
All data access via Supabase client SDK (no custom API layer):
- Reads: `supabase.from('table').select().eq('user_id', uid)` per page load
- Writes: `supabase.from('table').upsert(row)` on form save
- Real-time: optional Supabase realtime subscriptions for multi-device sync (Pro)

### Capacitor Integration
- `npx cap add ios` + `npx cap add android` in project root
- App ID: `com.financialplanner.app`
- App name: "Financial Planner"
- LocalServer config for dev (optional)
- Android: minSdkVersion 22
- iOS: deployment target 13

### Environment Variables
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_APP_NAME="Financial Planner"
```
