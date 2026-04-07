-- ============================================================
-- Financial Planner — Supabase Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ───────────────────────────────────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email         TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  stripe_customer_id TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: users see own row"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── Goals ────────────────────────────────────────────────────
CREATE TABLE goals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  target_date   DATE,
  status        TEXT NOT NULL DEFAULT 'not_started'
                 CHECK (status IN ('not_started', 'in_progress', 'completed')),
  color         TEXT DEFAULT '#2A9D8F',
  order_index   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals: users manage own" ON goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Monthly Budgets ─────────────────────────────────────────
CREATE TABLE monthly_budgets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month         DATE NOT NULL,
  category      TEXT NOT NULL,
  budgeted      NUMERIC NOT NULL DEFAULT 0,
  spent         NUMERIC NOT NULL DEFAULT 0,
  notes         TEXT,
  UNIQUE (user_id, month, category)
);

ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monthly_budgets: own" ON monthly_budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Transactions ─────────────────────────────────────────────
CREATE TABLE transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount        NUMERIC NOT NULL,
  category      TEXT NOT NULL,
  description   TEXT DEFAULT '',
  date          DATE NOT NULL,
  week_of_month INTEGER NOT NULL CHECK (week_of_month BETWEEN 1 AND 4),
  month         DATE NOT NULL,
  type          TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions: own" ON transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Index for fast monthly lookups
CREATE INDEX transactions_user_month_idx ON transactions(user_id, month);
CREATE INDEX transactions_user_month_category_idx ON transactions(user_id, month, category);

-- ─── Habits ────────────────────────────────────────────────────
CREATE TABLE habits (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#2A9D8F',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits: own" ON habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Habit Logs ────────────────────────────────────────────────
CREATE TABLE habit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id    UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
  year        INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'none' CHECK (status IN ('done', 'missed', 'none')),
  UNIQUE (habit_id, week_number, year)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habit_logs: own" ON habit_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Debts ─────────────────────────────────────────────────────
CREATE TABLE debts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  original_amount NUMERIC NOT NULL,
  current_balance NUMERIC NOT NULL,
  min_payment     NUMERIC NOT NULL DEFAULT 0,
  interest_rate   NUMERIC NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debts: own" ON debts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Debt Payments ─────────────────────────────────────────────
CREATE TABLE debt_payments (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  debt_id   UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount    NUMERIC NOT NULL,
  date      DATE NOT NULL
);

ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debt_payments: own" ON debt_payments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Emergency Fund ────────────────────────────────────────────
CREATE TABLE emergency_fund (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_amount           NUMERIC NOT NULL DEFAULT 0,
  monthly_expense_estimate NUMERIC NOT NULL DEFAULT 0,
  months_target           INTEGER NOT NULL DEFAULT 3
);

ALTER TABLE emergency_fund ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emergency_fund: own" ON emergency_fund FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Emergency Fund Logs ────────────────────────────────────────
CREATE TABLE emergency_fund_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month            DATE NOT NULL,
  starting_balance NUMERIC NOT NULL DEFAULT 0,
  contributions    NUMERIC NOT NULL DEFAULT 0,
  withdrawals      NUMERIC NOT NULL DEFAULT 0,
  ending_balance   NUMERIC NOT NULL DEFAULT 0,
  UNIQUE (user_id, month)
);

ALTER TABLE emergency_fund_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emergency_fund_logs: own" ON emergency_fund_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Reflections ───────────────────────────────────────────────
CREATE TABLE reflections (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month        DATE NOT NULL,
  question_key INTEGER NOT NULL CHECK (question_key BETWEEN 0 AND 11),
  answer       TEXT NOT NULL DEFAULT '',
  UNIQUE (user_id, month, question_key)
);

ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reflections: own" ON reflections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Subscriptions ──────────────────────────────────────────────
CREATE TABLE subscriptions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  tier                   TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions: own" ON subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Auto-create profile on signup ───────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
