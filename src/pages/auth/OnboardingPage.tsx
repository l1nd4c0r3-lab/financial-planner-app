import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, TrendingUp, Target, Sparkles, Shield, Check } from 'lucide-react'

const SLIDES = [
  {
    emoji: '💰',
    title: 'Welcome to\nFinancial Planner',
    subtitle: 'Your complete annual financial companion. Track goals, budgets, habits, and reflections — all in one beautiful app.',
    cta: null,
  },
  {
    emoji: '🎯',
    title: 'Set Goals &\nStay Accountable',
    subtitle: 'Create savings goals with visual progress. Track your debt snowball and watch your net worth grow month by month.',
    cta: null,
  },
  {
    emoji: '✅',
    title: 'Build Habits,\nSee Results',
    subtitle: 'Weekly finance check-ins that take 2 minutes. Habit tracking that actually sticks — and compounds over time.',
    cta: null,
  },
  {
    emoji: '🚀',
    title: 'Ready to\nGet Started?',
    subtitle: 'Join thousands of people who have transformed their financial lives with Financial Planner.',
    cta: 'start',
  },
]

export function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const navigate = useNavigate()

  function goTo(idx: number) {
    if (animating || idx < 0 || idx >= SLIDES.length) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 150)
  }

  function handleNext() {
    if (current < SLIDES.length - 1) goTo(current + 1)
    else navigate('/login')
  }

  function handlePrev() {
    if (current > 0) goTo(current - 1)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
  }

  const slide = SLIDES[current]
  const isLast = current === SLIDES.length - 1

  return (
    <div
      className="min-h-screen bg-cream flex flex-col max-w-lg mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip */}
      <div className="flex justify-end px-6 pt-6">
        {!isLast && (
          <Link to="/login" className="text-xs text-mid-gray font-medium">
            Skip
          </Link>
        )}
      </div>

      {/* Slide Content */}
      <div className={`flex-1 flex flex-col items-center justify-center px-8 text-center transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-7xl mb-8">{slide.emoji}</div>
        <h1 className="font-display text-3xl text-navy leading-tight mb-4 whitespace-pre-line">
          {slide.title}
        </h1>
        <p className="text-sm text-mid-gray leading-relaxed max-w-xs mb-8">
          {slide.subtitle}
        </p>

        {/* Feature Pills on slide 1 */}
        {current === 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {['Budget Tracker', 'Goal Calendar', 'Habit Grid', 'Reflections'].map((f) => (
              <div key={f} className="bg-white rounded-full px-3 py-1.5 text-xs text-navy font-medium shadow-card">
                {f}
              </div>
            ))}
          </div>
        )}

        {/* Feature highlights on slide 2 */}
        {current === 1 && (
          <div className="space-y-3 w-full max-w-xs">
            {[
              { Icon: Target, text: 'Visual goal progress' },
              { Icon: TrendingUp, text: 'Track net worth over time' },
              { Icon: Shield, text: 'Emergency fund safety net' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-card text-left">
                <Icon size={18} className="text-teal shrink-0" />
                <span className="text-sm text-navy">{text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Feature highlights on slide 3 */}
        {current === 2 && (
          <div className="space-y-3 w-full max-w-xs">
            {[
              { Icon: Sparkles, text: '52-week habit grid' },
              { Icon: Check, text: 'Streak tracking & badges' },
              { Icon: Target, text: 'Weekly check-in prompts' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-card text-left">
                <Icon size={18} className="text-gold shrink-0" />
                <span className="text-sm text-navy">{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-10">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all ${idx === current ? 'w-6 bg-navy' : 'w-2 bg-mid-gray/40'}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {current > 0 && (
            <button
              onClick={handlePrev}
              className="btn-secondary w-12 h-12 flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {slide.cta === 'start' ? (
            <Link to="/login" className="btn-gold flex-1 flex items-center justify-center gap-2">
              Get Started <ChevronRight size={18} />
            </Link>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              Continue <ChevronRight size={18} />
            </button>
          )}
        </div>

        {!isLast && (
          <p className="text-center text-xs text-mid-gray mt-4">
            Swipe left or right to navigate
          </p>
        )}
        {isLast && (
          <p className="text-center text-xs text-mid-gray mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-navy font-semibold">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
