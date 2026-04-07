import { useEffect, useState } from 'react'
import { format, subMonths } from 'date-fns'
import { Shield, TrendingUp, Plus, X, DollarSign, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { getEmergencyFund, upsertEmergencyFund, getEmergencyFundLogs, upsertEmergencyFundLog } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastProvider'
import type { EmergencyFundLog } from '@/types'

const DEMO_LOGS: EmergencyFundLog[] = Array.from({ length: 12 }, (_, i) => {
  const month = format(subMonths(new Date(), 11 - i), 'yyyy-MM')
  const starting = i === 0 ? 0 : 1000 + i * 200 + Math.random() * 500
  const contributions = i === 0 ? 2000 : 200 + Math.random() * 300
  const withdrawals = Math.random() > 0.8 ? Math.random() * 200 : 0
  return {
    id: `demo-${i}`,
    user_id: 'demo',
    month,
    starting_balance: starting,
    contributions,
    withdrawals,
    ending_balance: starting + contributions - withdrawals,
  }
})

function AddContributionModal({ onClose, onAdd }: { onClose: () => void; onAdd: (amount: number, note: string) => void }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return
    onAdd(parseFloat(amount), note)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-navy">Add Contribution</h2>
          <button onClick={onClose} className="text-mid-gray hover:text-navy"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="section-title">Amount (€)</label>
            <input type="number" className="input-field font-mono" placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="section-title">Note (optional)</label>
            <input type="text" className="input-field" placeholder="Monthly contribution" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={!amount}>Add Contribution</button>
        </form>
      </div>
    </div>
  )
}

export function EmergencyFundPage() {
  const auth = useAuthStore()
  const isDemo = !auth.user
  const { user } = auth
  const { emergencyFundLogs, setEmergencyFundLogs } = usePlannerStore()
  const { addToast } = useToast()
  const [targetAmount] = useState(10000)
  const [showAdd, setShowAdd] = useState(false)

  const currentBalance = emergencyFundLogs.length > 0
    ? emergencyFundLogs[emergencyFundLogs.length - 1].ending_balance
    : 0
  const pct = Math.min(100, Math.round((currentBalance / targetAmount) * 100))

  const monthsOfSafety = currentBalance > 0 ? Math.round((currentBalance / 1500) * 10) / 10 : 0 // assume €1500/mo expenses

  useEffect(() => {
    if (!isDemo && user?.id) {
      Promise.all([
        getEmergencyFund(user.id),
        getEmergencyFundLogs(user.id),
      ]).then(([fund, logs]) => {
        setEmergencyFundLogs(logs)
      })
    } else {
      setEmergencyFundLogs(DEMO_LOGS)
    }
  }, [user?.id, isDemo])

  const chartData = emergencyFundLogs.map((log) => ({
    month: format(new Date(log.month + '-01'), 'MMM'),
    balance: log.ending_balance,
    contributions: log.contributions,
  }))

  async function handleAddContribution(amount: number, note: string) {
    const now = new Date()
    const month = format(now, 'yyyy-MM')
    const existing = emergencyFundLogs.find((l) => l.month === month)
    const prevBalance = existing?.ending_balance || (emergencyFundLogs.length > 0 ? emergencyFundLogs[emergencyFundLogs.length - 1].ending_balance : 0)

    const log: EmergencyFundLog = {
      id: existing?.id || Math.random().toString(36).slice(2),
      user_id: user?.id || 'demo',
      month,
      starting_balance: prevBalance,
      contributions: amount,
      withdrawals: 0,
      ending_balance: prevBalance + amount,
    }

    if (!isDemo) {
      await upsertEmergencyFundLog({ ...log, user_id: user!.id })
    }

    if (existing) {
      setEmergencyFundLogs(emergencyFundLogs.map((l) => l.month === month ? log : l))
    } else {
      setEmergencyFundLogs([...emergencyFundLogs, log].sort((a, b) => a.month.localeCompare(b.month)))
    }
    addToast({ message: 'Contribution added!', type: 'success' })
  }

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Emergency Fund</h1>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-1 text-xs px-3 py-1.5">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Status Card */}
      <div className="card bg-navy text-white mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Shield size={24} className="text-gold" />
          </div>
          <div>
            <div className="text-xs text-white/60 uppercase tracking-widest">Your Safety Net</div>
            <div className="font-mono text-2xl font-bold mt-0.5">€{currentBalance.toLocaleString('en-EU')}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/60">{pct}% of €{targetAmount.toLocaleString('en-EU')} goal</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            pct >= 100 ? 'bg-teal/30 text-teal' : pct >= 50 ? 'bg-gold/30 text-gold' : 'bg-rose/30 text-rose'
          }`}>
            {pct >= 100 ? '✓ Fully Funded!' : pct >= 50 ? 'Halfway there' : 'Building up'}
          </span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-3">
          <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-teal' : pct >= 50 ? 'bg-gold' : 'bg-rose'}`}
            style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <Calendar size={12} />
          <span>{monthsOfSafety.toFixed(1)} months of expenses covered</span>
        </div>
      </div>

      {/* 12-Month Chart */}
      <div className="card mb-6">
        <div className="section-title mb-3">12-Month Balance</div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={2}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1E2D4F', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
                formatter={(value: number) => [`€${value.toLocaleString('en-EU')}`, 'Balance']}
              />
              <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.balance >= targetAmount ? '#2A9D8F' : '#C8A96E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-44 flex items-center justify-center text-mid-gray text-sm">
            No contribution history yet
          </div>
        )}
      </div>

      {/* Contribution Log */}
      <div className="card">
        <div className="section-title mb-3">Contribution Log</div>
        {emergencyFundLogs.length === 0 ? (
          <div className="text-center text-sm text-mid-gray py-6">
            No contributions yet. Add your first one!
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[...emergencyFundLogs].reverse().slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-mid-gray/20 last:border-0">
                <div>
                  <div className="text-sm font-medium text-navy">{format(new Date(log.month + '-01'), 'MMMM yyyy')}</div>
                  <div className="text-2xs text-mid-gray">
                    {log.contributions > 0 && <span className="text-teal">+€{log.contributions.toLocaleString('en-EU')}</span>}
                    {log.withdrawals > 0 && <span className="text-rose ml-1">-€{log.withdrawals.toLocaleString('en-EU')}</span>}
                  </div>
                </div>
                <div className="font-mono text-sm font-semibold text-navy">
                  €{log.ending_balance.toLocaleString('en-EU')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddContributionModal onClose={() => setShowAdd(false)} onAdd={handleAddContribution} />}
    </div>
  )
}
