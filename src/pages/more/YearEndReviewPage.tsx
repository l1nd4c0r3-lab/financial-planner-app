import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Star, TrendingUp, TrendingDown, Target, Award, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { useToast } from '@/components/ui/ToastProvider'
import type { YearEndReview } from '@/types'

const EMPTY_REVIEW: YearEndReview = {
  total_income: 0,
  total_expenses: 0,
  net_savings: 0,
  total_debt_paid: 0,
  emergency_fund_change: 0,
  biggest_win: '',
  biggest_challenge: '',
  goals_completed: 0,
  goals_total: 0,
  weeks_checked_in: 0,
  longest_streak: 0,
  most_consistent_habit: '',
  habit_to_improve: '',
  biggest_expense: '',
  biggest_saving: '',
  impulse_estimate: 0,
  spending_to_change: '',
  spending_to_keep: '',
  next_year_priority_1: '',
  next_year_priority_2: '',
  new_goal_amount: 0,
  new_debt_to_pay: '',
  ef_target: 0,
  letter_to_future_me: '',
}

export function YearEndReviewPage() {
  const { profile } = useAuthStore()
  const { yearEndReview, setYearEndReview, transactions, goals, debts, habitGrids } = usePlannerStore()
  const { addToast } = useToast()
  const [review, setReview] = useState<YearEndReview>(EMPTY_REVIEW)
  const [saving, setSaving] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (yearEndReview) {
      setReview(yearEndReview)
    } else {
      // Auto-calculate from available data
      const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const goalsCompleted = goals.filter((g) => g.status === 'completed').length
      const longestStreak = Math.max(...habitGrids.map((hg) => hg.longest_streak), 0)
      const weeksCheckedIn = habitGrids.reduce((s, hg) => s + hg.weeks_done, 0)

      setReview((prev) => ({
        ...prev,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_savings: totalIncome - totalExpenses,
        goals_completed: goalsCompleted,
        goals_total: goals.length,
        longest_streak: longestStreak,
        weeks_checked_in: weeksCheckedIn,
      }))
    }
  }, [])

  function handleChange(field: keyof YearEndReview, value: string | number) {
    setReview((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setYearEndReview(review)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
    addToast({ message: 'Year-end review saved!', type: 'success' })
  }

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="page-title mb-1">{currentYear} Year Review</h1>
        <p className="text-sm text-mid-gray">Reflect on your full year financial journey</p>
      </div>

      {/* Annual Snapshot */}
      <div className="card bg-navy text-white mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-gold" />
          <h2 className="font-semibold text-sm">Annual Snapshot</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-white/60 mb-1">Total Income</div>
            <div className="font-mono text-lg font-bold text-teal">€{review.total_income.toLocaleString('en-EU')}</div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Total Expenses</div>
            <div className="font-mono text-lg font-bold text-rose">€{review.total_expenses.toLocaleString('en-EU')}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-white/60 mb-1">Net Savings</div>
            <div className={`font-mono text-2xl font-bold ${review.net_savings >= 0 ? 'text-teal' : 'text-rose'}`}>
              {review.net_savings >= 0 ? '+' : '-'}€{Math.abs(review.net_savings).toLocaleString('en-EU')}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <div className="font-mono text-sm font-bold">{review.goals_completed}/{review.goals_total}</div>
            <div className="text-2xs text-white/60">Goals Done</div>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <div className="font-mono text-sm font-bold">{review.weeks_checked_in}</div>
            <div className="text-2xs text-white/60">Weeks Checked</div>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <div className="font-mono text-sm font-bold">{review.longest_streak}</div>
            <div className="text-2xs text-white/60">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Goal Achievement */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-navy" />
          <h3 className="font-semibold text-sm text-navy">Goal Achievement</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-title">Goals Completed</label>
            <input type="number" className="input-field h-9 text-sm font-mono" value={review.goals_completed}
              onChange={(e) => handleChange('goals_completed', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="section-title">Total Goals</label>
            <input type="number" className="input-field h-9 text-sm font-mono" value={review.goals_total}
              onChange={(e) => handleChange('goals_total', parseInt(e.target.value) || 0)} />
          </div>
        </div>
        <div className="mt-3">
          <label className="section-title">Biggest Win</label>
          <input type="text" className="input-field h-9 text-sm" placeholder="What was your biggest financial win this year?"
            value={review.biggest_win} onChange={(e) => handleChange('biggest_win', e.target.value)} />
        </div>
        <div className="mt-3">
          <label className="section-title">Biggest Challenge</label>
          <input type="text" className="input-field h-9 text-sm" placeholder="What was your hardest financial challenge?"
            value={review.biggest_challenge} onChange={(e) => handleChange('biggest_challenge', e.target.value)} />
        </div>
      </div>

      {/* Habit Scorecard */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-gold" />
          <h3 className="font-semibold text-sm text-navy">Habit Scorecard</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-title">Most Consistent Habit</label>
            <input type="text" className="input-field h-9 text-sm" value={review.most_consistent_habit}
              onChange={(e) => handleChange('most_consistent_habit', e.target.value)} />
          </div>
          <div>
            <label className="section-title">Habit to Improve</label>
            <input type="text" className="input-field h-9 text-sm" value={review.habit_to_improve}
              onChange={(e) => handleChange('habit_to_improve', e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <label className="section-title">Longest Streak (weeks)</label>
          <input type="number" className="input-field h-9 text-sm font-mono w-24" value={review.longest_streak}
            onChange={(e) => handleChange('longest_streak', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      {/* Spending Reflection */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-teal" />
          <h3 className="font-semibold text-sm text-navy">Spending Reflection</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="section-title">Biggest Expense Category</label>
            <input type="text" className="input-field h-9 text-sm" placeholder="e.g. Housing, Food"
              value={review.biggest_expense} onChange={(e) => handleChange('biggest_expense', e.target.value)} />
          </div>
          <div>
            <label className="section-title">Biggest Saving Achievement</label>
            <input type="text" className="input-field h-9 text-sm"
              value={review.biggest_saving} onChange={(e) => handleChange('biggest_saving', e.target.value)} />
          </div>
          <div>
            <label className="section-title">Estimated Impulse Spending (€)</label>
            <input type="number" className="input-field h-9 text-sm font-mono w-32"
              value={review.impulse_estimate} onChange={(e) => handleChange('impulse_estimate', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="section-title">Spending to Change</label>
            <textarea className="input-field resize-none h-16 text-xs"
              placeholder="What spending habit do you want to change next year?"
              value={review.spending_to_change} onChange={(e) => handleChange('spending_to_change', e.target.value)} />
          </div>
          <div>
            <label className="section-title">Spending to Keep</label>
            <textarea className="input-field resize-none h-16 text-xs"
              placeholder="What spending habits are working well?"
              value={review.spending_to_keep} onChange={(e) => handleChange('spending_to_keep', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Letter to Future Me */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} className="text-gold" />
          <h3 className="font-semibold text-sm text-navy">Letter to Future Me</h3>
        </div>
        <textarea
          className="input-field resize-none h-32 text-xs"
          placeholder="Dear Future Me, next year I commit to..."
          value={review.letter_to_future_me}
          onChange={(e) => handleChange('letter_to_future_me', e.target.value)}
        />
        <div className="text-2xs text-mid-gray mt-2 text-right">{review.letter_to_future_me.length} characters</div>
      </div>

      {/* Next Year Priorities */}
      <div className="card mb-6">
        <h3 className="font-semibold text-sm text-navy mb-3">Next Year Priorities</h3>
        <div className="space-y-3">
          <div>
            <label className="section-title">Priority #1</label>
            <input type="text" className="input-field h-9 text-sm"
              value={review.next_year_priority_1} onChange={(e) => handleChange('next_year_priority_1', e.target.value)} />
          </div>
          <div>
            <label className="section-title">Priority #2</label>
            <input type="text" className="input-field h-9 text-sm"
              value={review.next_year_priority_2} onChange={(e) => handleChange('next_year_priority_2', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-title">New Goal Amount (€)</label>
              <input type="number" className="input-field h-9 text-sm font-mono"
                value={review.new_goal_amount} onChange={(e) => handleChange('new_goal_amount', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="section-title">New Debt to Pay (€)</label>
              <input type="number" className="input-field h-9 text-sm font-mono"
                value={review.new_debt_to_pay} onChange={(e) => handleChange('new_debt_to_pay', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="section-title">Emergency Fund Target (€)</label>
            <input type="number" className="input-field h-9 text-sm font-mono w-40"
              value={review.ef_target} onChange={(e) => handleChange('ef_target', parseInt(e.target.value) || 0)} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} className="btn-primary w-full" disabled={saving}>
        {saving ? 'Saving...' : 'Save Year-End Review'}
      </button>
    </div>
  )
}
