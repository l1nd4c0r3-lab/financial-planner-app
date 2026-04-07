import { useEffect, useState } from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { getBudgets, upsertBudget, getTransactions } from '@/lib/supabase'
import type { BudgetRow, MonthlyBudget, BudgetCategory, Transaction } from '@/types'

const CATEGORIES: BudgetCategory[] = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance',
  'Healthcare', 'Personal', 'Entertainment', 'Debt Payments', 'Savings', 'Other',
]

function rowColor(spent: number, budgeted: number): string {
  if (budgeted === 0) return 'text-mid-gray'
  const pct = spent / budgeted
  if (pct >= 1) return 'text-rose'
  if (pct >= 0.85) return 'text-gold'
  return 'text-teal'
}

function BudgetRowItem({ row, onBudgetChange, onSpentChange }: {
  row: BudgetRow
  onBudgetChange: (v: number) => void
  onSpentChange: (v: number) => void
}) {
  const [editBudget, setEditBudget] = useState(false)
  const [budgetVal, setBudgetVal] = useState(String(row.budgeted))
  const remaining = row.budgeted - row.spent
  const pct = row.budgeted > 0 ? Math.min(100, Math.round((row.spent / row.budgeted) * 100)) : 0

  return (
    <div className="flex items-center gap-3 py-3 border-b border-mid-gray/20 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-navy">{row.category}</div>
        <div className="h-1 bg-mid-gray/20 rounded-full overflow-hidden mt-1.5">
          <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-rose' : pct >= 85 ? 'bg-gold' : 'bg-teal'}`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 justify-end">
          {editBudget ? (
            <input
              type="number"
              className="w-20 h-6 text-xs font-mono input-field text-right px-1"
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              onBlur={() => { onBudgetChange(parseFloat(budgetVal) || 0); setEditBudget(false) }}
              autoFocus
            />
          ) : (
            <button onClick={() => { setBudgetVal(String(row.budgeted)); setEditBudget(true) }}
              className="text-xs font-mono text-mid-gray hover:text-navy">
              €{row.budgeted.toLocaleString('en-EU')}
            </button>
          )}
          <span className="text-xs text-mid-gray">/</span>
          <span className={`text-xs font-mono font-semibold ${rowColor(row.spent, row.budgeted)}`}>
            €{row.spent.toLocaleString('en-EU')}
          </span>
        </div>
        <div className={`text-2xs font-mono mt-0.5 ${remaining >= 0 ? 'text-teal' : 'text-rose'}`}>
          {remaining >= 0 ? '+€' : '-€'}{Math.abs(remaining).toLocaleString('en-EU')} left
        </div>
      </div>
    </div>
  )
}

export function MonthlyBudgetPage() {
  const auth = useAuthStore()
  const isDemo = !auth.user
  const { user } = auth
  const { selectedMonth, setSelectedMonth, prevMonth, nextMonth, transactions, setTransactions } = usePlannerStore()
  const [budget, setBudget] = useState<MonthlyBudget | null>(null)
  const [loading, setLoading] = useState(false)

  const monthDate = new Date(selectedMonth + '-01')
  const monthLabel = format(monthDate, 'MMMM yyyy')

  useEffect(() => {
    if (!isDemo && user?.id) {
      setLoading(true)
      Promise.all([
        getBudgets(user.id, selectedMonth),
        getTransactions(user.id, selectedMonth),
      ]).then(([budgetData, txData]) => {
        setTransactions(txData)
        if (budgetData.length > 0) {
          setBudget(budgetData[0] as MonthlyBudget)
        } else {
          // Initialize empty budget
          const empty: MonthlyBudget = {
            month: selectedMonth,
            rows: CATEGORIES.map((cat) => ({ category: cat, budgeted: 0, spent: 0, notes: '' })),
            total_budgeted: 0,
            total_spent: 0,
          }
          setBudget(empty)
        }
        setLoading(false)
      }).catch(() => setLoading(false))
    } else {
      // Demo mode
      const demoBudget: MonthlyBudget = {
        month: selectedMonth,
        rows: CATEGORIES.map((cat) => ({
          category: cat,
          budgeted: getDemoBudget(cat),
          spent: getDemoSpent(cat, transactions),
          notes: '',
        })),
        total_budgeted: 0,
        total_spent: 0,
      }
      demoBudget.total_budgeted = demoBudget.rows.reduce((s, r) => s + r.budgeted, 0)
      demoBudget.total_spent = demoBudget.rows.reduce((s, r) => s + r.spent, 0)
      setBudget(demoBudget)
    }
  }, [selectedMonth, user?.id, isDemo])

  function handleBudgetChange(category: BudgetCategory, value: number) {
    if (!budget) return
    const rows = budget.rows.map((r) => r.category === category ? { ...r, budgeted: value } : r)
    const total_budgeted = rows.reduce((s, r) => s + r.budgeted, 0)
    setBudget({ ...budget, rows, total_budgeted })
  }

  function handleSpentChange(category: BudgetCategory, value: number) {
    if (!budget) return
    const rows = budget.rows.map((r) => r.category === category ? { ...r, spent: value } : r)
    const total_spent = rows.reduce((s, r) => s + r.spent, 0)
    setBudget({ ...budget, rows, total_spent })
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center max-w-lg mx-auto">
        <div className="text-mid-gray">Loading budget...</div>
      </div>
    )
  }

  const totalBudgeted = budget.rows.reduce((s, r) => s + r.budgeted, 0)
  const totalSpent = budget.rows.reduce((s, r) => s + r.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent
  const overallPct = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Month selector */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft size={20} /></button>
        <h1 className="page-title">{monthLabel}</h1>
        <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight size={20} /></button>
      </div>

      {/* Overview */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="section-title mb-0">Monthly Budget</div>
          <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${
            overallPct < 85 ? 'bg-teal/15 text-teal' : overallPct < 100 ? 'bg-gold/15 text-gold' : 'bg-rose/15 text-rose'
          }`}>{overallPct}% used</span>
        </div>
        <div className="h-3 bg-mid-gray/20 rounded-full overflow-hidden mb-3">
          <div className={`h-full rounded-full transition-all duration-500 ${
            overallPct < 85 ? 'bg-teal' : overallPct < 100 ? 'bg-gold' : 'bg-rose'
          }`} style={{ width: `${overallPct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="font-mono text-sm font-bold text-navy">€{totalBudgeted.toLocaleString('en-EU')}</div>
            <div className="text-2xs text-mid-gray">Budgeted</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-sm font-bold text-rose">€{totalSpent.toLocaleString('en-EU')}</div>
            <div className="text-2xs text-mid-gray">Spent</div>
          </div>
          <div className="text-center">
            <div className={`font-mono text-sm font-bold ${totalRemaining >= 0 ? 'text-teal' : 'text-rose'}`}>
              €{Math.abs(totalRemaining).toLocaleString('en-EU')}
            </div>
            <div className="text-2xs text-mid-gray">{totalRemaining >= 0 ? 'Left' : 'Over'}</div>
          </div>
        </div>
      </div>

      {/* Category rows */}
      <div className="card">
        <div className="flex items-center justify-between pb-2 border-b border-mid-gray/30 mb-1">
          <span className="text-xs text-mid-gray font-bold uppercase tracking-wider">Category</span>
          <span className="text-xs text-mid-gray font-bold uppercase tracking-wider">Budgeted / Spent</span>
        </div>
        {budget.rows.map((row) => (
          <BudgetRowItem key={row.category} row={row}
            onBudgetChange={(v) => handleBudgetChange(row.category, v)}
            onSpentChange={(v) => handleSpentChange(row.category, v)}
          />
        ))}
      </div>
    </div>
  )
}

function getDemoBudget(cat: BudgetCategory): number {
  const defaults: Record<string, number> = {
    Housing: 1200, Transportation: 300, Food: 500, Utilities: 200,
    Insurance: 150, Healthcare: 100, Personal: 200, Entertainment: 150,
    'Debt Payments': 300, Savings: 500, Other: 100,
  }
  return defaults[cat] || 200
}

function getDemoSpent(cat: BudgetCategory, txs: Transaction[]): number {
  return txs.filter((t) => t.category === cat && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
}
