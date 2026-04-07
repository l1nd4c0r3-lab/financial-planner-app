import { useState, useEffect, useRef } from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { getReflections, upsertReflection } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastProvider'
import { REFLECTION_QUESTIONS, type Reflection } from '@/types'

export function MonthlyReflectionPage() {
  const auth = useAuthStore()
  const isDemo = !auth.user
  const { user } = auth
  const { selectedMonth, setSelectedMonth, prevMonth, nextMonth, reflections, setReflections } = usePlannerStore()
  const { addToast } = useToast()
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [highlight, setHighlight] = useState('')
  const [saving, setSaving] = useState(false)
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const monthLabel = format(new Date(selectedMonth + '-01'), 'MMMM yyyy')

  useEffect(() => {
    if (!isDemo && user?.id) {
      getReflections(user.id, selectedMonth).then((data) => {
        setReflections(data)
        const ans: Record<number, string> = {}
        data.forEach((r: Reflection) => { ans[r.question_key] = r.answer })
        setAnswers(ans)
      })
    }
  }, [user?.id, selectedMonth, isDemo])

  function handleAnswerChange(key: number, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }))

    // Debounced auto-save
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key])
    saveTimers.current[key] = setTimeout(() => {
      saveAnswer(key, value)
    }, 800)
  }

  async function saveAnswer(key: number, value: string) {
    if (isDemo) {
      addToast({ message: 'Saved!', type: 'success', duration: 1500 })
      return
    }
    setSaving(true)
    try {
      const ref: Partial<Reflection> & { user_id: string } = {
        user_id: user!.id,
        month: selectedMonth,
        question_key: key,
        answer: value,
      }
      await upsertReflection(ref)
      addToast({ message: 'Saved!', type: 'success', duration: 1500 })
    } catch {
      // silent fail for auto-save
    } finally {
      setSaving(false)
    }
  }

  async function handleHighlightBlur() {
    if (isDemo) return
    if (highlight.trim()) {
      // Save highlight as question 12
      await saveAnswer(12, highlight)
    }
  }

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Month selector */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft size={20} /></button>
        <h1 className="page-title">{monthLabel}</h1>
        <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight size={20} /></button>
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="text-center text-xs text-mid-gray mb-3">Auto-saving...</div>
      )}

      {/* Reflection Cards */}
      <div className="space-y-4 mb-6">
        {REFLECTION_QUESTIONS.slice(0, 12).map((question, key) => (
          <div key={key} className="card">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-2xs font-bold text-navy">{key + 1}</span>
              </div>
              <p className="text-sm text-navy font-medium leading-relaxed">{question}</p>
            </div>
            <textarea
              className="input-field resize-none h-20 text-xs"
              placeholder="Take a moment to reflect..."
              value={answers[key] || ''}
              onChange={(e) => handleAnswerChange(key, e.target.value)}
            />
            {answers[key] && (
              <div className="text-2xs text-teal mt-1.5 text-right">✓ Saved</div>
            )}
          </div>
        ))}
      </div>

      {/* Highlight of the Month */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} className="text-gold" />
          <h3 className="font-semibold text-sm text-navy">Highlight of the Month</h3>
        </div>
        <textarea
          className="input-field resize-none h-24 text-xs"
          placeholder="What was the best financial moment this month? A win, a breakthrough, a realization..."
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          onBlur={handleHighlightBlur}
        />
        <div className="text-2xs text-mid-gray mt-2 text-right">{highlight.length} characters</div>
      </div>
    </div>
  )
}
