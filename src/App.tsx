import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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
import { supabase } from '@/lib/supabase'

export default function App() {
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    // Bootstrap auth state — runs once on mount.
    // Uses getState() to update Zustand without triggering a re-render
    // until the entire bootstrap sequence is complete.
    const store = useAuthStore.getState()

    function bootstrap() {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          store.setUser({ id: session.user.id, email: session.user.email || '' })
          store.setProfile(null)
        }
        store.setLoading(false)
      })
    }

    bootstrap()

    // Listen for future auth changes (login / logout / token refresh).
    // Using getState() inside callback avoids triggering React re-renders
    // until the component that subscribes to the store actually re-renders.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const s = useAuthStore.getState()
      if (session?.user) {
        s.setUser({ id: session.user.id, email: session.user.email || '' })
      } else {
        s.setUser(null)
        s.setProfile(null)
      }
      s.setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isLoading && !user) {
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
