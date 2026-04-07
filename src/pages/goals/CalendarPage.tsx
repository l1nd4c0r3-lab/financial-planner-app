import { useState, useEffect } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, X, Target } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { getGoals, upsertGoal } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastProvider'
import type { Goal } from '@/types'

const GOAL_COLORS = ['#2A9D8F', '#C8A96E', '#C0576B', '#1E2D4F', '#7B9E89', '#9B7EBD']

function MonthGoals({ month, goals, onUpdate }: { month: string; goals: Goal[]; onUpdate: (g: Goal) => void }) {
  const visible = goals.slice(0, 3)
  const remaining = goals.length - visible.length

  return (
    <div className="space-y-3">
      {visible.map((goal) => {
        const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
        return (
          <div key={goal.id} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-navy truncate">{goal.title}</span>
                <span className="text-2xs font-mono text-mid-gray ml-2 shrink-0">{pct}%</span>
              </div>
              <div className="h-1.5 bg-mid-gray/30 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
              </div>
              <div className="text-2xs text-mid-gray mt-0.5">
                €{goal.current_amount.toLocaleString('en-EU')} / €{goal.target_amount.toLocaleString('en-EU')}
              </div>
            </div>
          </div>
        )
      })}
      {remaining > 0 && (
        <div className="text-xs text-mid-gray text-center py-1">+{remaining} more goal{remaining > 1 ? 's' : ''}</div>
      )}
      {goals.length === 0 && (
        <div className="text-center text-sm text-mid-gray py-4">No goals set for this month</div>
      )}
    </div>
  )
}

function GoalNote({ note, onSave }: { note: string; onSave: (n: string) => void }) {
  return (
    <div className="mt-4 pt-4 border-t border-mid-gray/30">
      <label className="section-title">Monthly Note</label>
      <textarea
        className="input-field resize-none h-20 text-xs"
        placeholder="What mattered most this month?"
        defaultValue={note}
        onBlur={(e) => onSave(e.target.value)}
      />
    </div>
  )
}

function AddGoalModal({ month, onClose, onAdd }: {
  month: string; onClose: () => void
  onAdd: (g: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => void
}) {
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [color, setColor] = useState(GOAL_COLORS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !targetAmount) return
    onAdd({
      title,
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      target_date: targetDate || format(addMonths(new Date(month + '-01'), 6), 'yyyy-MM-dd'),
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
          <h2 className="font-display text-xl text-navy">Add Goal</h2>
          <button onClick={onClose} className="text-mid-gray hover:text-navy"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="section-title">Goal Title</label>
            <input type="text" className="input-field" placeholder="e.g. Vacation Fund" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="section-title">Target Amount (€)</label>
            <input type="number" className="input-field font-mono" placeholder="5000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
          </div>
          <div>
            <label className="section-title">Target Date</label>
            <input type="date" className="input-field" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
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
          <button type="submit" className="btn-primary w-full mt-2" disabled={!title || !targetAmount}>Create Goal</button>
        </form>
      </div>
    </div>
  )
}

export function CalendarPage() {
  const { user, isDemo } = useAuthStore()
  const { goals, setGoals, upsertGoal: storeUpsertGoal } = usePlannerStore()
  const { addToast } = useToast()

  const [viewDate, setViewDate] = useState(new Date())
  const months = Array.from({ length: 12 }, (_, i) => addMonths(new Date(viewDate.getFullYear(), 0), i))
  const selected = format(viewDate, 'yyyy-MM')

  useEffect(() => {
    if (!isDemo && user?.id) {
      getGoals(user.id).then((data) => setGoals(data))
    }
  }, [user?.id, isDemo])

  function prevYear() { setViewDate((d) => new Date(d.getFullYear() - 1, d.getMonth())) }
  function nextYear() { setViewDate((d) => new Date(d.getFullYear() + 1, d.getMonth())) }

  const selectedMonthGoals = goals.filter((g) => {
    const gd = g.target_date.slice(0, 7)
    return gd === selected
  })

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Goal Calendar</h1>
        <div className="flex items-center gap-1">
          <button onClick={prevYear} className="btn-ghost p-2"><ChevronLeft size={18} /></button>
          <span className="text-sm font-semibold text-navy px-2">{viewDate.getFullYear()}</span>
          <button onClick={nextYear} className="btn-ghost p-2"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Month Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
        {months.map((m) => {
          const key = format(m, 'yyyy-MM')
          const isSelected = key === selected
          const monthGoals = goals.filter((g) => g.target_date?.startsWith(key))
          return (
            <button
              key={key}
              onClick={() => setViewDate(m)}
              className={`flex-shrink-0 w-20 py-3 rounded-xl text-center transition-all ${
                isSelected ? 'bg-navy text-white shadow-card' : 'bg-white text-navy shadow-card card-hover'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="text-2xs uppercase tracking-wider opacity-60">{format(m, 'MMM')}</div>
              <div className="font-mono text-sm font-bold mt-0.5">{format(m, 'yyyy')}</div>
              {monthGoals.length > 0 && (
                <div className={`text-2xs mt-1 ${isSelected ? 'text-white/70' : 'text-mid-gray'}`}>
                  {monthGoals.length} goal{monthGoals.length > 1 ? 's' : ''}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Month Detail */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-mid-gray uppercase tracking-widest">{format(viewDate, 'MMMM yyyy')}</div>
            <h2 className="font-display text-lg text-navy mt-0.5">Goals</h2>
          </div>
          <button onClick={() => {}} className="btn-gold flex items-center gap-1 text-xs px-3 py-1.5">
            <Plus size={14} /> Add Goal
          </button>
        </div>
        <MonthGoals month={selected} goals={selectedMonthGoals} onUpdate={() => {}} />
        <GoalNote note="" onSave={() => {}} />
      </div>

      {/* All Goals Summary */}
      <div className="card">
        <div className="section-title mb-3">All {goals.length} Goals</div>
        {goals.length === 0 ? (
          <div className="text-center text-sm text-mid-gray py-6">
            No goals yet. Add your first goal above!
          </div>
        ) : (
          <div className="space-y-3">
            {goals.slice(0, 5).map((goal) => {
              const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
              return (
                <div key={goal.id} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy truncate">{goal.title}</div>
                    <div className="text-2xs text-mid-gray">{formatDate(goal.target_date)}</div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-navy">{pct}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}
