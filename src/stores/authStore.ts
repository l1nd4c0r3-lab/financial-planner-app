import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types'

interface AuthState {
  user: { id: string; email: string } | null
  profile: Profile | null
  isLoading: boolean

  setUser: (user: { id: string; email: string } | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (v: boolean) => void
  signOut: () => void
}

/*
 * Auth is persisted in localStorage to support DEMO MODE (no Supabase credentials).
 * Zustand persist acts as a fallback for unauthenticated sessions — it stores the
 * demo user so that "demo mode" survives a page refresh.
 *
 * When real Supabase credentials are present, the flow is:
 *   1. App.tsx useEffect calls getSession() from Supabase localStorage
 *   2. onAuthStateChange fires and overwrites Zustand state with the real user
 *   3. Zustand persist is silently overwritten by step 2
 *
 * Demo mode flow:
 *   1. User hasn't signed in → demo user stored in Zustand persist
 *   2. getSession() finds no Supabase session → setLoading(false) keeps demo user
 *
 * Version stamp lets us invalidate stored state when the schema changes.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => set({ user: null, profile: null }),
    }),
    {
      name: 'fp-auth',
      version: 1,
      partialize: (s) => ({
        user: s.user,
        profile: s.profile,
      }),
    }
  )
)
