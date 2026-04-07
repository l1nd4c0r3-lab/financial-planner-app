import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  TrendingUp, TrendingDown, PiggyBank, CreditCard,
  Plus, ChevronRight, Flame, Receipt, DollarSign
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { getTransactions, upsertTransaction } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastProvider'
import type { Transaction, BudgetCategory } from '@/types'

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: '1', user_id: 'demo', amount: 4200, category: 'Income', description: 'Salary deposit', date: format(new Date(), 'yyyy-MM-01'), week_of_month: 1, month: format(new Date(), 'yyyy-MM'), type: 'income', created_at: new Date().toISOString() },
  { id: '2', user_id: 'demo', amount: 1200, category: 'Housing', description: 'Rent payment', date: format(new Date(), 'yyyy-MM-03'), week_of_month: 1, month: format(new Date(), 'yyyy-MM'), type: 'expense', created_at: new Date().toISOString() },
  { id: '3', user_id: 'demo', amount: 340, category: 'Food', description: 'Groceries', date: format(new Date(), 'yyyy-MM-05'), week_of_month: 1, month: format(new Date(), 'yyyy-MM'), type: 'expense', created_at: new Date().toISOString() },
  { id: '4', user_id: 'demo', amount: 89, category: 'Transportation', description: 'Gas station', date: format(new Date(), 'yyyy-MM-07'), week_of_month: 2, month: format(new Date(), 'yyyy-MM'), type: 'expense', created_at: new Date().toISOString() },
  { id: '5', user_id: 'demo', amount: 65, category: 'Entertainment', description: 'Netflix + Spotify', date: format(new Date(), 'yyyy-MM-08'), week_of_month: 2, month: format(new Date(), 'yyyy-MM'), type: 'expense', created_at: new Date().toISOString() },
  { id: '6', user_id: 'demo', amount: 210, category: 'Utilities', description: 'Electric bill', date: format(new Date(), 'yyyy-MM-10'), week_of_month: 2, month: format(new Date(), 'yyyy-MM'), type: 'expense', created_at: new Date().toISOString() },
]

function SavingsRing({ rate }: { rate: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const fill = (rate / 100) * circ
  return (
    <div className="relative w-20 h-20">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#D8D3CC" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="#2A9D8F" strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={circ - fill}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-sm font-bold text-navy">{rate}%</span>
        <span className="text-2xs text-mid-gray">saved</span>
      </div>
    </div>
  )
}

function QuickAddModal({ onClose }: { onClose: () => void }) {
  const auth = useAuthStore()
  const { user } = auth
  const isDemo = !user
  const { addTransaction } = usePlannerStore()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<BudgetCategory>('Other')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')

  const categories: BudgetCategory[] = [
    'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance',
    'Healthcare', 'Personal', 'Entertainment', 'Debt Payments', 'Savings', 'Other',
  ]

  // Demo mode: require sign-in
  if (isDemo) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
        <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-navy">Sign in to track</h2>
            <button onClick={onClose} className="text-mid-gray hover:text-navy">✕</button>
          </div>
          <p className="text-sm text-mid-gray mb-4">Create a free account to start adding your own transactions and goals.</p>
          <button
            onClick={() => { onClose(); navigate('/login') }}
            className="btn-primary w-full"
          >
            Sign In / Register
          </button>
          <button onClick={onClose} className="w-full text-center text-sm text-mid-gray mt-3 py-2">
            Continue browsing demo
          </button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !description) return

    const now = new Date()
    const month = format(now, 'yyyy-MM')
    const day = parseInt(format(now, 'd'))
    const week: 1 | 2 | 3 | 4 = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4

    const tx: Transaction = {
      id: Math.random().toString(36).slice(2),
      user_id: user?.id || 'demo',
      amount: parseFloat(amount),
      category: type === 'income' ? 'Income' as BudgetCategory : category,
      description,
      date: format(now, 'yyyy-MM-dd'),
      week_of_month: week,
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
          <h2 className="font-display text-xl text-navy">Quick Add</h2>
          <button onClick={onClose} className="text-mid-gray hover:text-navy">✕</button>
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
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <button type="submit" className="btn-primary w-full mt-2" disabled={!amount || !description}>Add Transaction</button>
        </form>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const auth = useAuthStore()
  const { user, profile } = auth
  const isDemo = !user
  const { transactions, setTransactions, selectedMonth } = usePlannerStore()
  const [showAdd, setShowAdd] = useState(false)
  const { addToast } = useToast()

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there'
  const today = new Date()
  const monthStr = format(today, 'MMMM d, yyyy')

  const allTxs = isDemo ? DEMO_TRANSACTIONS : transactions
  const monthTxs = allTxs.filter((t) => t.month === selectedMonth)

  const totalIncome = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0

  const recentTxs = monthTxs.slice(0, 5)

  useEffect(() => {
    if (!isDemo && user?.id) {
      getTransactions(user.id, selectedMonth).then((data) => setTransactions(data))
    }
  }, [user?.id, selectedMonth, isDemo])

  const categoryColor: Record<string, string> = {
    Housing: 'text-navy', Transportation: 'text-teal', Food: 'text-gold', Utilities: 'text-rose',
    Insurance: 'text-navy/70', Healthcare: 'text-teal/80', Personal: 'text-gold/80',
    Entertainment: 'text-rose/80', 'Debt Payments': 'text-navy/50', Savings: 'text-teal', Other: 'text-mid-gray',
  }

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-mid-gray text-xs uppercase tracking-widest font-bold mb-1">{monthStr}</p>
        <h1 className="font-display text-3xl text-navy">Good {getTimeOfDay()}, {displayName}.</h1>
      </div>

      {/* This Month's Snapshot */}
      <div className="card mb-4">
        <div className="section-title mb-3">This Month's Snapshot</div>
        <div className="flex items-center gap-6">
          <SavingsRing rate={savingsRate} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-navy/70">
                <TrendingUp size={14} className="text-teal" /> Income
              </div>
              <span className="font-mono text-sm font-semibold text-teal">+€{totalIncome.toLocaleString('en-EU', { minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-navy/70">
                <TrendingDown size={14} className="text-rose" /> Expenses
              </div>
              <span className="font-mono text-sm font-semibold text-rose">-€{totalExpenses.toLocaleString('en-EU', { minimumFractionDigits: 0 })}</span>
            </div>
            <div className="border-t border-mid-gray/30 pt-2 flex items-center justify-between">
              <span className="text-sm text-navy font-medium">Net Savings</span>
              <span className={`font-mono text-sm font-bold ${netSavings >= 0 ? 'text-teal' : 'text-rose'}`}>
                {netSavings >= 0 ? '+' : ''}€{netSavings.toLocaleString('en-EU', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { Icon: PiggyBank, label: 'Savings Rate', value: `${savingsRate}%`, color: 'text-teal' },
          { Icon: Flame, label: 'Streak', value: '6 wks', color: 'text-gold' },
          { Icon: Receipt, label: 'Transactions', value: String(monthTxs.length), color: 'text-navy' },
        ].map(({ Icon, label, value, color }) => (
          <div key={label} className="card text-center">
            <Icon size={18} className={`mx-auto mb-1 ${color}`} />
            <div className={`font-mono text-base font-bold ${color}`}>{value}</div>
            <div className="text-2xs text-mid-gray mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="section-title mb-0">Recent Transactions</div>
          <Link to="/weekly" className="flex items-center gap-0.5 text-xs text-teal font-semibold">
            See all <ChevronRight size={12} />
          </Link>
        </div>
        {recentTxs.length === 0 ? (
          <div className="text-center py-6 text-mid-gray text-sm">
            No transactions yet. Tap + to add one!
          </div>
        ) : (
          <div className="space-y-3">
            {recentTxs.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    tx.type === 'income' ? 'bg-teal/15 text-teal' : 'bg-rose/15 text-rose'
                  }`}>
                    {tx.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-navy">{tx.description}</div>
                    <div className="text-2xs text-mid-gray">{tx.category} · {formatDate(tx.date)}</div>
                  </div>
                </div>
                <span className={`font-mono text-sm font-semibold ${tx.type === 'income' ? 'text-teal' : 'text-navy'}`}>
                  {tx.type === 'income' ? '+' : '-'}€{tx.amount.toLocaleString('en-EU', { minimumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-4 w-14 h-14 bg-navy text-white rounded-full shadow-card flex items-center justify-center active:scale-95 transition-transform z-30"
      >
        <Plus size={24} />
      </button>

      {showAdd && <QuickAddModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d')
  } catch {
    return dateStr
  }
}
