import { useState, useEffect, useCallback } from 'react'
import { Flame, TrendingUp, Check, X, Minus, Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { getHabits, upsertHabit, getHabitLogs, upsertHabitLog } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastProvider'
import { format } from 'date-fns'
import type { Habit, HabitLog, HabitStatus, HabitGrid } from '@/types'

const TOTAL_WEEKS = 52
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const DEMO_HABITS: Habit[] = [
  { id: '1', user_id: 'demo', name: 'Track spending', color: '#2A9D8F', created_at: new Date().toISOString() },
  { id: '2', user_id: 'demo', name: 'No impulse buys', color: '#C8A96E', created_at: new Date().toISOString() },
  { id: '3', user_id: 'demo', name: 'Review budget', color: '#C0576B', created_at: new Date().toISOString() },
]

const HABIT_COLORS = ['#2A9D8F', '#C8A96E', '#C0576B', '#1E2D4F', '#7B9E89', '#9B7EBD']

function cellColor(status: HabitStatus): string {
  switch (status) {
    case 'done': return 'bg-teal'
    case 'missed': return 'bg-rose/50'
    case 'none': return 'bg-mid-gray/20'
  }
}

function HabitRow({ habitGrid, year, onToggle, onAddWeek }: {
  habitGrid: HabitGrid; year: number; onToggle: (habitId: string, week: number, status: HabitStatus) => void; onAddWeek: () => void
}) {
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => habitGrid.logs[i + 1] || 'none')

  return (
    <div className="card mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habitGrid.habit.color }} />
          <span className="text-sm font-medium text-navy">{habitGrid.habit.name}</span>
        </div>
        <div className="flex items-center gap-3 text-2xs text-mid-gray">
          <span className="flex items-center gap-0.5"><Flame size={10} className="text-gold" /> {habitGrid.current_streak}</span>
          <span className="flex items-center gap-0.5"><Check size={10} className="text-teal" /> {habitGrid.weeks_done}</span>
        </div>
      </div>
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {weeks.map((status, idx) => (
          <button
            key={idx}
            onClick={() => {
              const statuses: HabitStatus[] = ['none', 'done', 'missed']
              const currentIdx = statuses.indexOf(status)
              const next = statuses[(currentIdx + 1) % 3]
              onToggle(habitGrid.habit.id, idx + 1, next)
            }}
            className={`w-3 h-3 rounded-sm transition-all flex-shrink-0 ${cellColor(status)}`}
            title={`Week ${idx + 1}: ${status}`}
          />
        ))}
      </div>
    </div>
  )
}

function AddHabitModal({ onClose, onAdd }: { onClose: () => void; onAdd: (h: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(HABIT_COLORS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), color })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-navy">New Habit</h2>
          <button onClick={onClose} className="text-mid-gray hover:text-navy">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="section-title">Habit Name</label>
            <input type="text" className="input-field" placeholder="e.g. Review weekly budget" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="section-title">Color</label>
            <div className="flex gap-2">
              {HABIT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-navy scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={!name.trim()}>Create Habit</button>
        </form>
      </div>
    </div>
  )
}

export function HabitTrackerPage() {
  const { user, isDemo } = useAuthStore()
  const { habitGrids, setHabitGrids } = usePlannerStore()
  const { addToast } = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (!isDemo && user?.id) {
      Promise.all([getHabits(user.id), getHabitLogs(user.id, currentYear)]).then(([habits, logs]) => {
        const grids: HabitGrid[] = habits.map((h: Habit) => {
          const logMap: Record<number, HabitStatus> = {}
          logs.filter((l: HabitLog) => l.habit_id === h.id).forEach((l: HabitLog) => {
            logMap[l.week_number] = l.status
          })
          const weeksDone = Object.values(logMap).filter((s) => s === 'done').length
          const streak = calculateStreak(logMap)
          return { habit: h, logs: logMap, current_streak: streak, longest_streak: streak, weeks_done: weeksDone }
        })
        setHabitGrids(grids)
      })
    } else {
      // Demo mode
      const grids: HabitGrid[] = DEMO_HABITS.map((h) => ({
        habit: h,
        logs: generateDemoLogs(),
        current_streak: 3,
        longest_streak: 7,
        weeks_done: 12,
      }))
      setHabitGrids(grids)
    }
  }, [user?.id, isDemo, currentYear])

  function calculateStreak(logs: Record<number, HabitStatus>): number {
    let streak = 0
    for (let w = TOTAL_WEEKS; w >= 1; w--) {
      if (logs[w] === 'done') streak++
      else if (logs[w] === 'missed') break
    }
    return streak
  }

  async function handleToggle(habitId: string, week: number, status: HabitStatus) {
    const updated = habitGrids.map((hg) => {
      if (hg.habit.id !== habitId) return hg
      const newLogs = { ...hg.logs, [week]: status }
      const weeksDone = Object.values(newLogs).filter((s) => s === 'done').length
      const streak = calculateStreak(newLogs)
      return { ...hg, logs: newLogs, current_streak: streak, weeks_done: weeksDone }
    })
    setHabitGrids(updated)

    if (!isDemo) {
      await upsertHabitLog({ user_id: user!.id, habit_id: habitId, week_number: week, year: currentYear, status })
    }
  }

  async function handleAddHabit(data: Omit<Habit, 'id' | 'user_id' | 'created_at'>) {
    const habit: Habit = {
      ...data,
      id: Math.random().toString(36).slice(2),
      user_id: user?.id || 'demo',
      created_at: new Date().toISOString(),
    }
    if (!isDemo) {
      await upsertHabit({ ...habit, user_id: user!.id })
    }
    const grid: HabitGrid = { habit, logs: {}, current_streak: 0, longest_streak: 0, weeks_done: 0 }
    setHabitGrids([...habitGrids, grid])
    addToast({ message: 'Habit created!', type: 'success' })
  }

  const totalWeeksDone = habitGrids.reduce((s, hg) => s + hg.weeks_done, 0)
  const longestStreak = Math.max(...habitGrids.map((hg) => hg.current_streak), 0)

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Habit Tracker</h1>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-1 text-xs px-3 py-1.5">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <Flame size={18} className="mx-auto mb-1 text-gold" />
          <div className="font-mono text-lg font-bold text-navy">{longestStreak}</div>
          <div className="text-2xs text-mid-gray">Best Streak</div>
        </div>
        <div className="card text-center">
          <TrendingUp size={18} className="mx-auto mb-1 text-teal" />
          <div className="font-mono text-lg font-bold text-navy">{totalWeeksDone}</div>
          <div className="text-2xs text-mid-gray">Weeks Done</div>
        </div>
        <div className="card text-center">
          <Check size={18} className="mx-auto mb-1 text-navy" />
          <div className="font-mono text-lg font-bold text-navy">{habitGrids.length}</div>
          <div className="text-2xs text-mid-gray">Active Habits</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-mid-gray">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-teal" /> Done</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-rose/50" /> Missed</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-mid-gray/20" /> None</div>
        <span className="ml-auto text-2xs">Tap to cycle</span>
      </div>

      {/* Week numbers header */}
      <div className="overflow-x-auto mb-2">
        <div className="flex gap-0.5 min-w-max pl-24">
          {Array.from({ length: 52 }, (_, i) => i + 1).filter((w) => w === 1 || w === 13 || w === 26 || w === 39 || w === 52).map((w) => (
            <span key={w} className="text-2xs text-mid-gray w-3 text-center">{w}</span>
          ))}
        </div>
      </div>

      {/* Habit Rows */}
      <div>
        {habitGrids.length === 0 ? (
          <div className="card text-center py-10">
            <div className="text-4xl mb-3">✨</div>
            <div className="text-sm font-semibold text-navy mb-1">No habits yet</div>
            <div className="text-xs text-mid-gray mb-4">Build financial habits one week at a time</div>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-xs">Create First Habit</button>
          </div>
        ) : (
          habitGrids.map((hg) => (
            <HabitRow key={hg.habit.id} habitGrid={hg} year={currentYear} onToggle={handleToggle} onAddWeek={() => {}} />
          ))
        )}
      </div>

      {showAdd && <AddHabitModal onClose={() => setShowAdd(false)} onAdd={handleAddHabit} />}
    </div>
  )
}

function generateDemoLogs(): Record<number, HabitStatus> {
  const logs: Record<number, HabitStatus> = {}
  for (let w = 1; w <= 52; w++) {
    const rand = Math.random()
    logs[w] = rand > 0.3 ? (rand > 0.6 ? 'done' : 'missed') : 'none'
  }
  return logs
}
