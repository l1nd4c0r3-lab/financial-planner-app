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
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function App() {
  const { user, isLoading, setLoading } = useAuthStore()

  useEffect(() => {
    // 1. Restore session synchronously from localStorage (no network round-trip)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useAuthStore.getState().setUser({
          id: session.user.id,
          email: session.user.email || '',
        })
        useAuthStore.getState().setProfile(null)
      } else {
        useAuthStore.getState().setLoading(false)
      }
    })

    // 2. Listen for auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const store = useAuthStore.getState()
      if (session?.user) {
        store.setUser({ id: session.user.id, email: session.user.email || '' })
      } else {
        store.setUser(null)
        store.setProfile(null)
      }
      store.setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Suspense-like loading gate: wait for auth bootstrap before rendering app
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
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Authenticated — tab layout */}
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
