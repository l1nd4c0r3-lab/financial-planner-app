import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types'

interface AuthState {
  user: { id: string; email: string } | null
  profile: Profile | null
  isLoading: boolean
  isDemo: boolean

  setUser: (user: { id: string; email: string } | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (v: boolean) => void
  setDemo: (v: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      isDemo: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setDemo: (isDemo) => set({ isDemo }),
      signOut: () => set({ user: null, profile: null }),
    }),
    { name: 'fp-auth' }
  )
)
