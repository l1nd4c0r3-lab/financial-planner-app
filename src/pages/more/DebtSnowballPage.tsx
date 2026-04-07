import { useEffect, useState } from 'react'
import { format, addMonths } from 'date-fns'
import { TrendingDown, Plus, X, CreditCard, Calendar, DollarSign } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { getDebts, upsertDebt } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastProvider'
import type { Debt, DebtPayment } from '@/types'

function DebtCard({ debt, onPayExtra, onUpdate }: {
  debt: Debt; onPayExtra: () => void; onUpdate: (d: Debt) => void
}) {
  const [showPay, setShowPay] = useState(false)
  const [extraAmount, setExtraAmount] = useState('')
  const pct = debt.original_amount > 0 ? Math.round(((debt.original_amount - debt.current_balance) / debt.original_amount) * 100) : 0

  function handlePayExtra() {
    const amount = parseFloat(extraAmount)
    if (!amount || amount <= 0) return
    const newBalance = Math.max(0, debt.current_balance - amount)
    onUpdate({ ...debt, current_balance: newBalance })
    setExtraAmount('')
    setShowPay(false)
  }

  return (
    <div className="card mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-navy/10 flex items-center justify-center">
            <CreditCard size={16} className="text-navy" />
          </div>
          <div>
            <div className="font-semibold text-sm text-navy">{debt.name}</div>
            <div className="text-2xs text-mid-gray">{debt.interest_rate}% APR · Min €{debt.min_payment}/mo</div>
          </div>
        </div>
        <span className={`font-mono text-sm font-bold ${pct >= 100 ? 'text-teal' : 'text-rose'}`}>{pct}% paid</span>
      </div>

      {/* Progress */}
      <div className="h-2 bg-mid-gray/20 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-teal' : 'bg-rose'}`}
          style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-mid-gray">Remaining</span>
        <span className="font-mono font-bold text-navy">€{debt.current_balance.toLocaleString('en-EU')}</span>
      </div>

      {showPay ? (
        <div className="flex gap-2">
          <input type="number" className="input-field h-9 text-sm font-mono flex-1" placeholder="Extra amount"
            value={extraAmount} onChange={(e) => setExtraAmount(e.target.value)} autoFocus />
          <button onClick={handlePayExtra} className="btn-primary h-9 px-4 text-xs">Pay</button>
          <button onClick={() => setShowPay(false)} className="btn-secondary h-9 px-3 text-xs">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setShowPay(true)} className="btn-gold w-full text-xs py-2 flex items-center justify-center gap-1">
          <Plus size={14} /> Pay Extra
        </button>
      )}
    </div>
  )
}

function AddDebtModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: Omit<Debt, 'id' | 'user_id' | 'created_at'>) => void }) {
  const [name, setName] = useState('')
  const [originalAmount, setOriginalAmount] = useState('')
  const [currentBalance, setCurrentBalance] = useState('')
  const [minPayment, setMinPayment] = useState('')
  const [interestRate, setInterestRate] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !originalAmount || !currentBalance) return
    onAdd({
      name,
      original_amount: parseFloat(originalAmount),
      current_balance: parseFloat(currentBalance),
      min_payment: parseFloat(minPayment) || 50,
      interest_rate: parseFloat(interestRate) || 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-navy">Add Debt</h2>
          <button onClick={onClose} className="text-mid-gray hover:text-navy"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="section-title">Debt Name</label>
            <input type="text" className="input-field" placeholder="e.g. Credit Card, Car Loan" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-title">Original Amount (€)</label>
              <input type="number" className="input-field font-mono" placeholder="10,000" value={originalAmount} onChange={(e) => setOriginalAmount(e.target.value)} />
            </div>
            <div>
              <label className="section-title">Current Balance (€)</label>
              <input type="number" className="input-field font-mono" placeholder="8,500" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-title">Min Payment (€)</label>
              <input type="number" className="input-field font-mono" placeholder="200" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} />
            </div>
            <div>
              <label className="section-title">Interest Rate (%)</label>
              <input type="number" className="input-field font-mono" placeholder="18.9" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={!name || !originalAmount || !currentBalance}>Add Debt</button>
        </form>
      </div>
    </div>
  )
}

function calculateDebtFreeDate(debts: Debt[]): string {
  if (debts.length === 0) return 'No debts!'
  // Snowball: pay minimums on all, extra goes to smallest balance
  const sorted = [...debts].sort((a, b) => a.current_balance - b.current_balance)
  let monthCount = 0
  let balance = sorted.reduce((s, d) => s + d.current_balance, 0)
  const monthlyPayment = sorted.reduce((s, d) => s + d.min_payment, 0)
  if (balance <= 0) return 'Debt free!'
  while (balance > 0 && monthCount < 600) {
    balance -= monthlyPayment
    monthCount++
  }
  return format(addMonths(new Date(), monthCount), 'MMMM yyyy')
}

export function DebtSnowballPage() {
  const auth = useAuthStore()
  const isDemo = !auth.user
  const { user } = auth
  const { debts, setDebts } = usePlannerStore()
  const { addToast } = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState<DebtPayment[]>([])

  const sortedDebts = [...debts].sort((a, b) => a.current_balance - b.current_balance)
  const totalRemaining = debts.reduce((s, d) => s + d.current_balance, 0)
  const totalOriginal = debts.reduce((s, d) => s + d.original_amount, 0)
  const totalPaid = totalOriginal - totalRemaining
  const overallPct = totalOriginal > 0 ? Math.round((totalPaid / totalOriginal) * 100) : 100
  const debtFreeDate = calculateDebtFreeDate(debts)

  useEffect(() => {
    if (!isDemo && user?.id) {
      getDebts(user.id).then((data) => setDebts(data))
    }
  }, [user?.id, isDemo])

  async function handleUpdateDebt(debt: Debt) {
    const updated = debts.map((d) => d.id === debt.id ? debt : d)
    setDebts(updated)
    if (!isDemo) {
      await upsertDebt({ ...debt, user_id: user!.id })
    }
    addToast({ message: 'Payment recorded!', type: 'success' })
  }

  async function handleAddDebt(debtData: Omit<Debt, 'id' | 'user_id' | 'created_at'>) {
    const debt: Debt = {
      ...debtData,
      id: Math.random().toString(36).slice(2),
      user_id: user?.id || 'demo',
      created_at: new Date().toISOString(),
    }
    if (!isDemo) {
      await upsertDebt({ ...debt, user_id: user!.id })
    }
    setDebts([...debts, debt])
    addToast({ message: 'Debt added!', type: 'success' })
  }

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Debt Snowball</h1>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-1 text-xs px-3 py-1.5">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Overview */}
      <div className="card bg-navy text-white mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-white/60 mb-1">Total Remaining</div>
            <div className="font-mono text-2xl font-bold">€{totalRemaining.toLocaleString('en-EU')}</div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Total Paid Off</div>
            <div className="font-mono text-2xl font-bold text-teal">€{totalPaid.toLocaleString('en-EU')}</div>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <Calendar size={12} />
          <span>Estimated debt-free: <strong className="text-gold">{debtFreeDate}</strong></span>
        </div>
      </div>

      {/* Snowball Order Info */}
      {sortedDebts.length > 0 && (
        <div className="card mb-4">
          <div className="section-title mb-3">Snowball Order</div>
          <p className="text-xs text-mid-gray mb-3">Pay minimums on all debts. Put extra toward the smallest balance first.</p>
          <div className="space-y-2">
            {sortedDebts.map((debt, idx) => (
              <div key={debt.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold ${
                  idx === 0 ? 'bg-gold/20 text-gold' : 'bg-mid-gray/20 text-mid-gray'
                }`}>{idx + 1}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-navy">{debt.name}</div>
                  <div className="text-2xs text-mid-gray">€{debt.current_balance.toLocaleString('en-EU')} remaining</div>
                </div>
                {idx === 0 && <span className="text-2xs text-gold font-bold">← Focus here</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debt Cards */}
      {sortedDebts.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-sm font-semibold text-navy mb-1">No debts recorded</div>
          <div className="text-xs text-mid-gray mb-4">Add your debts to start tracking your snowball progress</div>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs">Add First Debt</button>
        </div>
      ) : (
        sortedDebts.map((debt) => (
          <DebtCard key={debt.id} debt={debt} onUpdate={handleUpdateDebt} onPayExtra={() => {}} />
        ))
      )}

      {showAdd && <AddDebtModal onClose={() => setShowAdd(false)} onAdd={handleAddDebt} />}
    </div>
  )
}
