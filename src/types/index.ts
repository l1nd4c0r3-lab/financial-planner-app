// ─── Auth ────────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  subscription_tier: 'free' | 'pro'
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

// ─── Goals ────────────────────────────────────────────────────────────────
export interface Goal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string
  status: 'not_started' | 'in_progress' | 'completed'
  color: string
  order_index: number
  created_at: string
}

export interface GoalMonth {
  month: string // "YYYY-MM"
  label: string // "Gennaio 2025"
  goals: Goal[]
  note: string
}

// ─── Budget ──────────────────────────────────────────────────────────────
export type BudgetCategory =
  | 'Housing'
  | 'Transportation'
  | 'Food'
  | 'Utilities'
  | 'Insurance'
  | 'Healthcare'
  | 'Personal'
  | 'Entertainment'
  | 'Debt Payments'
  | 'Savings'
  | 'Other'
  | 'Income'

export interface BudgetRow {
  category: BudgetCategory
  budgeted: number
  spent: number
  notes: string
}

export interface MonthlyBudget {
  month: string // "YYYY-MM"
  rows: BudgetRow[]
  total_budgeted: number
  total_spent: number
}

// ─── Transactions ────────────────────────────────────────────────────────
export type WeekNumber = 1 | 2 | 3 | 4
export type TransactionType = 'expense' | 'income'

export interface Transaction {
  id: string
  user_id: string
  amount: number
  category: BudgetCategory
  description: string
  date: string
  week_of_month: WeekNumber
  month: string
  type: TransactionType
  created_at: string
}

export interface WeekCategoryTotal {
  category: BudgetCategory
  week1: number
  week2: number
  week3: number
  week4: number
  total: number
  budget: number
}

// ─── Habits ──────────────────────────────────────────────────────────────
export type HabitStatus = 'done' | 'missed' | 'none'

export interface Habit {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  week_number: number
  year: number
  status: HabitStatus
}

export interface HabitGrid {
  habit: Habit
  logs: Record<number, HabitStatus> // week_number → status
  current_streak: number
  longest_streak: number
  weeks_done: number
}

// ─── Debt ────────────────────────────────────────────────────────────────
export interface Debt {
  id: string
  user_id: string
  name: string
  original_amount: number
  current_balance: number
  min_payment: number
  interest_rate: number
  created_at: string
}

export interface DebtPayment {
  id: string
  user_id: string
  debt_id: string
  amount: number
  date: string
}

// ─── Emergency Fund ─────────────────────────────────────────────────────
export interface EmergencyFund {
  id: string
  user_id: string
  target_amount: number
  monthly_expense_estimate: number
  months_target: number
}

export interface EmergencyFundLog {
  id: string
  user_id: string
  month: string
  starting_balance: number
  contributions: number
  withdrawals: number
  ending_balance: number
}

// ─── Reflections ────────────────────────────────────────────────────────
export const REFLECTION_QUESTIONS = [
  'What money decision are you most proud of this month?',
  'If you could redo one spending decision this month, what would it be?',
  'What is one thing you learned about your spending habits?',
  'What did you prioritize this month and why?',
  'How did your spending align with your values?',
  'What surprised you most about your finances this month?',
  'What is one financial habit you want to build next month?',
  'Who or what influenced your spending this month?',
  'What progress did you make toward your goals?',
  'How do you feel about your financial progress overall?',
  'What would make next month even better financially?',
  'Gratitude moment: what financial thing are you grateful for?',
]

export interface Reflection {
  id: string
  user_id: string
  month: string
  question_key: number // 0-indexed into REFLECTION_QUESTIONS
  answer: string
}

// ─── Year-End Review ────────────────────────────────────────────────────
export interface YearEndReview {
  total_income: number
  total_expenses: number
  net_savings: number
  total_debt_paid: number
  emergency_fund_change: number
  biggest_win: string
  biggest_challenge: string
  goals_completed: number
  goals_total: number
  weeks_checked_in: number
  longest_streak: number
  most_consistent_habit: string
  habit_to_improve: string
  biggest_expense: string
  biggest_saving: string
  impulse_estimate: number
  spending_to_change: string
  spending_to_keep: string
  next_year_priority_1: string
  next_year_priority_2: string
  new_goal_amount: number
  new_debt_to_pay: string
  ef_target: number
  letter_to_future_me: string
}

// ─── UI State ───────────────────────────────────────────────────────────
export type TabRoute = 'home' | 'goals' | 'budget' | 'reflect' | 'more'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}
