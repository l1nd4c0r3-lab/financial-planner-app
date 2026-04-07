import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Plus, X, DollarSign } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { getTransactions, upsertTransaction } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastProvider'
import type { Transaction, BudgetCategory, WeekNumber } from '@/types'

const CATEGORIES: BudgetCategory[] = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance',
  'Healthcare', 'Personal', 'Entertainment', 'Debt Payments', 'Savings', 'Other',
]

interface WeekCategoryTotal {
  category: BudgetCategory
  week1: number
  week2: number
  week3: number
  week4: number
  total: number
  budget: number
}

function QuickAddModal({ weekOfMonth, month, onClose }: {
  weekOfMonth: WeekNumber; month: string; onClose: () => void
}) {
  const auth = useAuthStore()
  const { user } = auth
  const isDemo = !user
  const { addTransaction } = usePlannerStore()
  const { addToast } = useToast()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<BudgetCategory>('Other')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !description) return

    const now = new Date()
    const tx: Transaction = {
      id: Math.random().toString(36).slice(2),
      user_id: user?.id || 'demo',
      amount: parseFloat(amount),
      category: type === 'income' ? 'Income' as BudgetCategory : category,
      description,
      date: format(now, 'yyyy-MM-dd'),
      week_of_month: weekOfMonth,
      month,
      type,
      created_at: now.toISOString(),
    }

    if (!isDemo) {
      await upsertTransaction({ ...tx, user_id: user!.id })
    }
    addTransaction(tx)
    addToast({ message: `${type === 'income' ? 'Income' : 'Expense'} added!`, type: 'success' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-navy">Add — Week {weekOfMonth}</h2>
          <button onClick={onClose} className="text-mid-gray hover:text-navy"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-cream rounded-xl p-1">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense' ? 'bg-rose text-white' : 'text-mid-gray'}`}>Expense</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income' ? 'bg-teal text-white' : 'text-mid-gray'}`}>Income</button>
          </div>
          <div>
            <label className="section-title">Amount</label>
            <input type="number" className="input-field font-mono" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="section-title">Description</label>
            <input type="text" className="input-field" placeholder="What was this for?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {type === 'expense' && (
            <div>
              <label className="section-title">Category</label>
              <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value as BudgetCategory)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <button type="submit" className="btn-primary w-full mt-2" disabled={!amount || !description}>Add Transaction</button>
        </form>
      </div>
    </div>
  )
}

export function WeeklyTrackerPage() {
  const auth = useAuthStore()
  const { user } = auth
  const isDemo = !user
  const { selectedMonth, transactions, setTransactions } = usePlannerStore()
  const { addToast } = useToast()
  const [activeWeek, setActiveWeek] = useState<WeekNumber>(1)
  const [showAdd, setShowAdd] = useState(false)

  const monthTxs = transactions.filter((t) => t.month === selectedMonth)

  const weekTotals = CATEGORIES.map((cat): WeekCategoryTotal => {
    const w1 = monthTxs.filter((t) => t.category === cat && t.week_of_month === 1 && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const w2 = monthTxs.filter((t) => t.category === cat && t.week_of_month === 2 && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const w3 = monthTxs.filter((t) => t.category === cat && t.week_of_month === 3 && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const w4 = monthTxs.filter((t) => t.category === cat && t.week_of_month === 4 && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { category: cat, week1: w1, week2: w2, week3: w3, week4: w4, total: w1 + w2 + w3 + w4, budget: 0 }
  })

  const weekTotalSpent = weekTotals.reduce((s, w) => s + Number(w[`week${activeWeek}` as keyof WeekCategoryTotal]), 0)

  useEffect(() => {
    if (!isDemo && user?.id) {
      getTransactions(user.id, selectedMonth).then((data) => setTransactions(data))
    }
  }, [user?.id, selectedMonth, isDemo])

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="page-title mb-1">Weekly Tracker</h1>
        <p className="text-sm text-mid-gray">{format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</p>
      </div>

      {/* Week Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {([1, 2, 3, 4] as WeekNumber[]).map((w) => {
          const weekSpent = weekTotals.reduce((s, wt) => s + Number(wt[`week${w}` as keyof WeekCategoryTotal]), 0)
          const isActive = w === activeWeek
          return (
            <button
              key={w}
              onClick={() => setActiveWeek(w)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-navy text-white shadow-card' : 'bg-white text-navy shadow-card card-hover'
              }`}
            >
              <span className="text-xs font-bold">Week {w}</span>
              <span className={`font-mono text-2xs mt-0.5 ${isActive ? 'text-white/70' : 'text-mid-gray'}`}>
                €{weekSpent.toLocaleString('en-EU')}
              </span>
            </button>
          )
        })}
        <button
          onClick={() => setShowAdd(true)}
          className="flex-shrink-0 w-14 h-full rounded-xl bg-teal text-white shadow-card flex flex-col items-center justify-center gap-1"
        >
          <Plus size={16} />
          <span className="text-2xs font-bold">Add</span>
        </button>
      </div>

      {/* Week Total */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-mid-gray uppercase tracking-widest">Week {activeWeek} Total</div>
            <div className="font-mono text-2xl font-bold text-navy mt-1">€{weekTotalSpent.toLocaleString('en-EU')}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-mid-gray">{monthTxs.filter((t) => t.week_of_month === activeWeek).length} transactions</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <div className="section-title mb-3">By Category</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-mid-gray">
                <th className="text-left font-medium pb-2">Category</th>
                <th className="text-center font-medium pb-2">W1</th>
                <th className="text-center font-medium pb-2">W2</th>
                <th className="text-center font-medium pb-2">W3</th>
                <th className="text-center font-medium pb-2">W4</th>
                <th className="text-right font-medium pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {weekTotals.filter((w) => w.total > 0).map((wt) => (
                <tr key={wt.category} className="border-t border-mid-gray/20">
                  <td className="py-2 text-navy font-medium">{wt.category}</td>
                  {[1, 2, 3, 4].map((w) => {
                    const val = wt[`week${w}` as keyof WeekCategoryTotal] as number
                    const isActive = w === activeWeek
                    return (
                      <td key={w} className={`text-center font-mono py-2 ${isActive ? 'font-bold text-navy' : 'text-mid-gray'}`}>
                        {val > 0 ? `€${val}` : '-'}
                      </td>
                    )
                  })}
                  <td className="text-right font-mono font-semibold text-navy py-2">
                    €{wt.total.toLocaleString('en-EU')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy/20 font-bold">
                <td className="pt-2 text-navy">Total</td>
                {[1, 2, 3, 4].map((w) => {
                  const total = weekTotals.reduce((s, wt) => s + (wt[`week${w}` as keyof WeekCategoryTotal] as number), 0)
                  return (
                    <td key={w} className="text-center font-mono text-navy pt-2">
                      €{total.toLocaleString('en-EU')}
                    </td>
                  )
                })}
                <td className="text-right font-mono text-navy pt-2">
                  €{weekTotals.reduce((s, wt) => s + wt.total, 0).toLocaleString('en-EU')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {showAdd && <QuickAddModal weekOfMonth={activeWeek} month={selectedMonth} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
