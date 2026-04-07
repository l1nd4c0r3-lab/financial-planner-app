import { useEffect, useState } from 'react'
import { Target, Award, Heart, TrendingUp, Plus, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { getGoals, upsertGoal } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastProvider'
import type { Goal } from '@/types'

const MILESTONES = [25, 50, 75, 100]

const GOAL_COLORS = ['#2A9D8F', '#C8A96E', '#C0576B', '#1E2D4F', '#7B9E89', '#9B7EBD']

function MilestoneBadge({ milestone, achieved }: { milestone: number; achieved: boolean }) {
  const labels: Record<number, string> = { 25: '25%', 50: '50%', 75: '75%', 100: '100%' }
  return (
    <div className={`flex flex-col items-center gap-0.5 ${achieved ? '' : 'opacity-30 grayscale'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-2xs font-mono font-bold ${
        achieved ? 'bg-gold/20 text-gold-dark' : 'bg-mid-gray/20 text-mid-gray'
      }`}>
        {labels[milestone]}
      </div>
      <span className="text-2xs font-mono">{milestone}%</span>
    </div>
  )
}

function GoalRow({ goal, onUpdate, onDelete }: {
  goal: Goal; onUpdate: (g: Goal) => void; onDelete: () => void
}) {
  const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
  const achievedMilestones = MILESTONES.filter((m) => pct >= m)
  const [editing, setEditing] = useState(false)
  const [currentAmount, setCurrentAmount] = useState(String(goal.current_amount))

  function handleSaveAmount() {
    const amt = parseFloat(currentAmount)
    if (!isNaN(amt) && amt !== goal.current_amount) {
      onUpdate({ ...goal, current_amount: amt, status: amt >= goal.target_amount ? 'completed' : 'in_progress' })
    }
    setEditing(false)
  }

  return (
    <div className="card mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full mt-0.5" style={{ backgroundColor: goal.color }} />
          <div>
            <div className="font-semibold text-sm text-navy">{goal.title}</div>
            <div className="text-xs text-mid-gray">Target: €{goal.target_amount.toLocaleString('en-EU')}</div>
          </div>
        </div>
        <button onClick={onDelete} className="text-mid-gray hover:text-rose text-xs px-2 py-1">✕</button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-mid-gray/20 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: goal.color }}
        />
      </div>

      {/* Current / Target */}
      <div className="flex items-center justify-between mb-3">
        <div>
          {editing ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-mid-gray">€</span>
              <input
                type="number"
                className="input-field w-28 h-8 text-sm font-mono"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                onBlur={handleSaveAmount}
                autoFocus
              />
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-left">
              <span className="font-mono text-lg font-bold text-navy">€{goal.current_amount.toLocaleString('en-EU')}</span>
              <span className="text-xs text-mid-gray"> / €{goal.target_amount.toLocaleString('en-EU')}</span>
            </button>
          )}
        </div>
        <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded-full ${
          pct >= 100 ? 'bg-teal/20 text-teal' : pct >= 75 ? 'bg-gold/20 text-gold' : pct >= 50 ? 'bg-navy/10 text-navy' : 'bg-mid-gray/20 text-mid-gray'
        }`}>{pct}%</span>
      </div>

      {/* Milestones */}
      <div className="flex items-center justify-between px-2">
        {MILESTONES.map((m) => (
          <MilestoneBadge key={m} milestone={m} achieved={pct >= m} />
        ))}
      </div>
    </div>
  )
}

function AddGoalModal({ onClose, onAdd }: { onClose: () => void; onAdd: (g: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => void }) {
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [color, setColor] = useState(GOAL_COLORS[0])
  const [why, setWhy] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !targetAmount) return
    onAdd({
      title,
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      target_date: targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'not_started',
      color,
      order_index: 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-navy">New Financial Goal</h2>
          <button onClick={onClose} className="text-mid-gray hover:text-navy"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="section-title">What are you saving for?</label>
            <input type="text" className="input-field" placeholder="e.g. Emergency Fund, Vacation" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-title">Target Amount (€)</label>
              <input type="number" className="input-field font-mono" placeholder="10,000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
            <div>
              <label className="section-title">Target Date</label>
              <input type="date" className="input-field" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="section-title">Why does this matter to you?</label>
            <textarea className="input-field resize-none h-20 text-xs" placeholder="This goal matters because..." value={why} onChange={(e) => setWhy(e.target.value)} />
          </div>
          <div>
            <label className="section-title">Color</label>
            <div className="flex gap-2">
              {GOAL_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-navy scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={!title || !targetAmount}>Set Goal</button>
        </form>
      </div>
    </div>
  )
}

export function GoalCommitmentPage() {
  const auth = useAuthStore()
  const isDemo = !auth.user
  const { user } = auth
  const { goals, setGoals, upsertGoal: storeUpsertGoal, removeGoal } = usePlannerStore()
  const { addToast } = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const [whyText, setWhyText] = useState('')

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const totalCurrent = goals.reduce((s, g) => s + g.current_amount, 0)
  const overallPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

  useEffect(() => {
    if (!isDemo && user?.id) {
      getGoals(user.id).then((data) => setGoals(data))
    }
  }, [user?.id, isDemo])

  async function handleUpdateGoal(goal: Goal) {
    if (!isDemo) {
      await upsertGoal({ ...goal, user_id: user!.id })
    }
    storeUpsertGoal(goal)
  }

  async function handleDeleteGoal(id: string) {
    removeGoal(id)
    addToast({ message: 'Goal removed', type: 'info' })
  }

  async function handleAddGoal(goalData: Omit<Goal, 'id' | 'user_id' | 'created_at'>) {
    const goal: Goal = {
      ...goalData,
      id: Math.random().toString(36).slice(2),
      user_id: user?.id || 'demo',
      created_at: new Date().toISOString(),
    }
    if (!isDemo) {
      await upsertGoal({ ...goal, user_id: user!.id })
    }
    storeUpsertGoal(goal)
    addToast({ message: 'Goal created!', type: 'success' })
  }

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Hero Statement */}
      <div className="card bg-navy text-white mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Target size={24} className="text-gold" />
          </div>
          <div>
            <div className="text-xs text-white/60 uppercase tracking-widest">This Year's Commitment</div>
            <div className="font-display text-xl font-bold mt-0.5">{goals.length} Active Goals</div>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-white/70 mb-1">
            <span>Overall Progress</span>
            <span className="font-mono">{overallPct}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="text-xs text-white/60 mt-1">
            €{totalCurrent.toLocaleString('en-EU')} saved of €{totalTarget.toLocaleString('en-EU')} total target
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <Heart size={12} className="text-rose" />
          <span>Stay committed — every euro brings you closer.</span>
        </div>
      </div>

      {/* Goals List */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-navy">My Goals</h2>
          <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-1 text-xs px-3 py-1.5">
            <Plus size={14} /> Add
          </button>
        </div>
        {goals.length === 0 ? (
          <div className="card text-center py-10">
            <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-3">
              <Target size={24} className="text-navy" />
            </div>
            <div className="text-sm font-semibold text-navy mb-1">No goals yet</div>
            <div className="text-xs text-mid-gray mb-4">Set your first financial goal to get started</div>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-xs">Create Goal</button>
          </div>
        ) : (
          goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} onUpdate={handleUpdateGoal} onDelete={() => handleDeleteGoal(goal.id)} />
          ))
        )}
      </div>

      {/* Why This Matters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-rose" />
          <h3 className="font-semibold text-sm text-navy">Why This Matters</h3>
        </div>
        <textarea
          className="input-field resize-none h-24 text-xs"
          placeholder="Write about why your financial goals matter to you and your family..."
          value={whyText}
          onChange={(e) => setWhyText(e.target.value)}
          onBlur={() => {
            if (whyText.trim()) addToast({ message: 'Saved!', type: 'success' })
          }}
        />
        <div className="text-2xs text-mid-gray mt-2 text-right">{whyText.length} characters</div>
      </div>

      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} onAdd={handleAddGoal} />}
    </div>
  )
}
