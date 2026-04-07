import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing — using demo mode')
}

export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// ─── Auth helpers ──────────────────────────────────────────────────────────
export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

// ─── Profile helpers ──────────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function upsertProfile(userId: string, profile: Partial<{ display_name: string; subscription_tier: string }>) {
  return supabase
    .from('profiles')
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() })
    .select()
    .single()
}

// ─── Goals ──────────────────────────────────────────────────────────────────
export async function getGoals(userId: string) {
  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('order_index')
  return data || []
}

export async function upsertGoal(goal: Partial<import('@/types').Goal> & { user_id: string }) {
  return supabase
    .from('goals')
    .upsert(goal)
    .select()
    .single()
}

export async function deleteGoal(id: string) {
  return supabase.from('goals').delete().eq('id', id)
}

// ─── Budget ────────────────────────────────────────────────────────────────
export async function getBudgets(userId: string, month: string) {
  const { data } = await supabase
    .from('monthly_budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
  return data || []
}

export async function upsertBudget(budget: Partial<import('@/types').BudgetRow> & { user_id: string; month: string }) {
  return supabase
    .from('monthly_budgets')
    .upsert(budget)
    .select()
    .single()
}

// ─── Transactions ─────────────────────────────────────────────────────────
export async function getTransactions(userId: string, month: string) {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .order('date', { ascending: false })
  return data || []
}

export async function upsertTransaction(tx: Partial<import('@/types').Transaction> & { user_id: string }) {
  return supabase
    .from('transactions')
    .upsert(tx)
    .select()
    .single()
}

export async function deleteTransaction(id: string) {
  return supabase.from('transactions').delete().eq('id', id)
}

// ─── Habits ───────────────────────────────────────────────────────────────
export async function getHabits(userId: string) {
  const { data } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
  return data || []
}

export async function upsertHabit(habit: Partial<import('@/types').Habit> & { user_id: string }) {
  return supabase.from('habits').upsert(habit).select().single()
}

export async function getHabitLogs(userId: string, year: number) {
  const { data } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
  return data || []
}

export async function upsertHabitLog(log: Partial<import('@/types').HabitLog> & { user_id: string }) {
  return supabase.from('habit_logs').upsert(log).select().single()
}

// ─── Debt ────────────────────────────────────────────────────────────────
export async function getDebts(userId: string) {
  const { data } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
  return data || []
}

export async function upsertDebt(debt: Partial<import('@/types').Debt> & { user_id: string }) {
  return supabase.from('debts').upsert(debt).select().single()
}

export async function deleteDebt(id: string) {
  return supabase.from('debts').delete().eq('id', id)
}

// ─── Emergency Fund ─────────────────────────────────────────────────────
export async function getEmergencyFund(userId: string) {
  const { data } = await supabase
    .from('emergency_fund')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export async function upsertEmergencyFund(fund: Partial<import('@/types').EmergencyFund> & { user_id: string }) {
  return supabase.from('emergency_fund').upsert(fund).select().single()
}

export async function getEmergencyFundLogs(userId: string) {
  const { data } = await supabase
    .from('emergency_fund_logs')
    .select('*')
    .eq('user_id', userId)
    .order('month')
  return data || []
}

export async function upsertEmergencyFundLog(log: Partial<import('@/types').EmergencyFundLog> & { user_id: string }) {
  return supabase.from('emergency_fund_logs').upsert(log).select().single()
}

// ─── Reflections ────────────────────────────────────────────────────────
export async function getReflections(userId: string, month: string) {
  const { data } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
  return data || []
}

export async function upsertReflection(ref: Partial<import('@/types').Reflection> & { user_id: string }) {
  return supabase.from('reflections').upsert(ref).select().single()
}
