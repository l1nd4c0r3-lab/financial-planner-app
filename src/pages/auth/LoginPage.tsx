import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { signIn, signInWithGoogle, signUp } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/ToastProvider'

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setProfile } = useAuthStore()
  const { addToast } = useToast()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      const fn = mode === 'login' ? signIn : signUp
      const { data, error } = await fn(email, password)
      if (error) throw error
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || email })
        addToast({ message: mode === 'login' ? 'Welcome back!' : 'Account created! Check your email.', type: 'success' })
        navigate('/home')
      }
    } catch (err: any) {
      addToast({ message: err.message || 'Auth error', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleAuth() {
    setGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
      navigate('/home')
    } catch (err: any) {
      addToast({ message: err.message || 'Google sign-in failed', type: 'error' })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col px-6 py-6 max-w-lg mx-auto">
      <Link to="/" className="flex items-center gap-1 text-sm text-navy/50 mb-8">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="mb-8">
        <div className="font-display text-4xl text-navy mb-2">
          {mode === 'login' ? 'Welcome back.' : 'Create account.'}
        </div>
        <div className="text-sm text-mid-gray">
          {mode === 'login' ? 'Sign in to continue your financial journey.' : 'Start your financial planner today.'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-6 shadow-inner-soft">
        {(['login', 'signup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === m ? 'bg-navy text-white' : 'text-navy/50'
            }`}
          >
            {m === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4 flex-1">
        <div>
          <label className="section-title">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="section-title">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mid-gray"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary w-full mt-4"
          disabled={loading || !email || !password}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-mid-gray/40" />
        </div>
        <div className="relative flex justify-center text-xs text-mid-gray">
          <span className="bg-cream px-3">or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={googleLoading}
        className="btn-secondary w-full flex items-center justify-center gap-3"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 3.039v2.334z" fill="#FBBC05"/>
          <path d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.294z" fill="#EA4335"/>
        </svg>
        {googleLoading ? 'Connecting...' : 'Continue with Google'}
      </button>

      <p className="text-center text-xs text-mid-gray mt-6">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-navy font-semibold"
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
