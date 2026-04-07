import { create } from 'zustand'
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

// No persist — Supabase handles session storage via its own localStorage keys.
// The onAuthStateChange listener in App.tsx keeps this store in sync.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null, profile: null }),
}))
