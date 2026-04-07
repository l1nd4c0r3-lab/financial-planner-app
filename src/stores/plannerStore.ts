import { create } from 'zustand'
import type {
  Goal, MonthlyBudget, Transaction, HabitGrid,
  Debt, EmergencyFundLog, Reflection, YearEndReview,
  BudgetCategory
} from '@/types'
import { format, startOfMonth, subMonths, addMonths } from 'date-fns'

// Default budget categories
export const DEFAULT_CATEGORIES: BudgetCategory[] = [
  'Housing', 'Transportation', 'Food', 'Utilities',
  'Insurance', 'Healthcare', 'Personal', 'Entertainment',
  'Debt Payments', 'Savings', 'Other',
]

interface PlannerState {
  // Current selection
  selectedMonth: string // "YYYY-MM"
  selectedYear: number

  // Data
  goals: Goal[]
  budgets: MonthlyBudget | null
  transactions: Transaction[]
  habitGrids: HabitGrid[]
  debts: Debt[]
  emergencyFundLogs: EmergencyFundLog[]
  reflections: Reflection[]
  yearEndReview: YearEndReview | null

  // Loading / error
  isLoading: boolean
  error: string | null

  // Actions
  setSelectedMonth: (month: string) => void
  setSelectedYear: (year: number) => void
  prevMonth: () => void
  nextMonth: () => void

  setGoals: (goals: Goal[]) => void
  upsertGoal: (goal: Goal) => void
  removeGoal: (id: string) => void

  setBudgets: (budgets: MonthlyBudget | null) => void
  setTransactions: (txs: Transaction[]) => void
  addTransaction: (tx: Transaction) => void
  removeTransaction: (id: string) => void

  setHabitGrids: (grids: HabitGrid[]) => void
  setDebts: (debts: Debt[]) => void
  setEmergencyFundLogs: (logs: EmergencyFundLog[]) => void
  setReflections: (refs: Reflection[]) => void
  setYearEndReview: (review: YearEndReview | null) => void

  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
}

function monthOffset(year: number, month: string, delta: number): { year: number; month: string } {
  const d = new Date(parseInt(month.slice(0, 4)), parseInt(month.slice(5, 7)) - 1 + delta, 1)
  return { year: d.getFullYear(), month: format(d, 'yyyy-MM') }
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  selectedMonth: format(new Date(), 'yyyy-MM'),
  selectedYear: new Date().getFullYear(),

  goals: [],
  budgets: null,
  transactions: [],
  habitGrids: [],
  debts: [],
  emergencyFundLogs: [],
  reflections: [],
  yearEndReview: null,

  isLoading: false,
  error: null,

  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSelectedYear: (year) => set({ selectedYear: year }),

  prevMonth: () => {
    const { selectedMonth, selectedYear } = get()
    const { year, month } = monthOffset(selectedYear, selectedMonth, -1)
    set({ selectedYear: year, selectedMonth: month })
  },

  nextMonth: () => {
    const { selectedMonth, selectedYear } = get()
    const { year, month } = monthOffset(selectedYear, selectedMonth, 1)
    set({ selectedYear: year, selectedMonth: month })
  },

  setGoals: (goals) => set({ goals }),
  upsertGoal: (goal) => {
    const existing = get().goals.findIndex((g) => g.id === goal.id)
    if (existing >= 0) {
      set((s) => ({ goals: [...s.goals.slice(0, existing), goal, ...s.goals.slice(existing + 1)] }))
    } else {
      set((s) => ({ goals: [...s.goals, goal] }))
    }
  },
  removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

  setBudgets: (budgets) => set({ budgets }),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
  removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

  setHabitGrids: (habitGrids) => set({ habitGrids }),
  setDebts: (debts) => set({ debts }),
  setEmergencyFundLogs: (emergencyFundLogs) => set({ emergencyFundLogs }),
  setReflections: (reflections) => set({ reflections }),
  setYearEndReview: (yearEndReview) => set({ yearEndReview }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
