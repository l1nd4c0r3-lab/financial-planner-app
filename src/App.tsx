import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { TabLayout } from '@/components/ui/TabLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { OnboardingPage } from '@/pages/auth/OnboardingPage'
import { DashboardPage } from '@/pages/home/DashboardPage'
import { CalendarPage } from '@/pages/goals/CalendarPage'
import { GoalCommitmentPage } from '@/pages/goals/GoalCommitmentPage'
import { MonthlyBudgetPage } from '@/pages/budget/MonthlyBudgetPage'
import { WeeklyTrackerPage } from '@/pages/budget/WeeklyTrackerPage'
import { MonthlyReflectionPage } from '@/pages/reflect/MonthlyReflectionPage'
import { HabitTrackerPage } from '@/pages/reflect/HabitTrackerPage'
import { DebtSnowballPage } from '@/pages/more/DebtSnowballPage'
import { EmergencyFundPage } from '@/pages/more/EmergencyFundPage'
import { YearEndReviewPage } from '@/pages/more/YearEndReviewPage'
import { SettingsPage } from '@/pages/more/SettingsPage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { useEffect, useRef } from 'react'
import { getCurrentUser, supabase } from '@/lib/supabase'

export default function App() {
  const { user, isLoading, setUser, setProfile, setLoading } = useAuthStore()
  const bootstrapDone = useRef(false)

  useEffect(() => {
    // Listen to ALL Supabase auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    // Bootstrap on first mount — get user from Supabase session (source of truth)
    async function bootstrap() {
      try {
        const supabaseUser = await getCurrentUser()
        if (supabaseUser) {
          setUser({ id: supabaseUser.id, email: supabaseUser.email || '' })
        }
      } catch {
        // Supabase unavailable — stay logged out (demo mode via !user)
      } finally {
        setLoading(false)
        bootstrapDone.current = true
      }
    }

    if (!bootstrapDone.current) {
      bootstrap()
    } else {
      setLoading(false)
    }

    return () => subscription.unsubscribe()
  }, [])

  const isDemo = !user

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-display text-navy mb-2">FP</div>
          <div className="text-mid-gray text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Authenticated routes — tab layout */}
        <Route element={<TabLayout />}>
          <Route path="/home" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/goals" element={<GoalCommitmentPage />} />
          <Route path="/budget" element={<MonthlyBudgetPage />} />
          <Route path="/weekly" element={<WeeklyTrackerPage />} />
          <Route path="/reflection" element={<MonthlyReflectionPage />} />
          <Route path="/habits" element={<HabitTrackerPage />} />
          <Route path="/debt" element={<DebtSnowballPage />} />
          <Route path="/emergency" element={<EmergencyFundPage />} />
          <Route path="/year-end" element={<YearEndReviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
