import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Mail, Bell, Lock, Download, Info, CreditCard,
  ChevronRight, CheckCircle, ExternalLink, Globe
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { upsertProfile, signOut } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastProvider'
import { LANGUAGES } from '@/lib/i18n'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const auth = useAuthStore()
  const isDemo = !auth.user
  const { user, profile, setUser, setProfile } = auth
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [pinLock, setPinLock] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [saving, setSaving] = useState(false)

  const subscriptionTier = profile?.subscription_tier || 'free'

  async function handleSaveProfile() {
    setSaving(true)
    try {
      if (!isDemo && user?.id) {
        await upsertProfile(user.id, { display_name: displayName })
      }
      setProfile(profile ? { ...profile, display_name: displayName } : null)
      addToast({ message: 'Profile saved!', type: 'success' })
    } catch {
      addToast({ message: 'Failed to save', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    if (!isDemo) {
      await signOut()
    }
    setUser(null)
    setProfile(null)
    navigate('/')
  }

  async function handleExportData() {
    addToast({ message: 'Preparing your data export...', type: 'info' })
    await new Promise((r) => setTimeout(r, 1000))
    addToast({ message: 'Data export ready! (demo)', type: 'success' })
  }

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      <h1 className="page-title mb-6">Settings</h1>

      {/* Profile */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="section-title">Display Name</label>
            <input
              type="text"
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="section-title">Email</label>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-mid-gray" />
              <span className="text-sm text-navy/70">{user?.email || 'demo@example.com'}</span>
              {isDemo && <span className="badge-free ml-1">Demo</span>}
            </div>
          </div>
          <button onClick={handleSaveProfile} className="btn-primary w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">Subscription</h2>
          <span className={subscriptionTier === 'pro' ? 'badge-pro ml-auto' : 'badge-free ml-auto'}>
            {subscriptionTier === 'pro' ? 'PRO' : 'FREE'}
          </span>
        </div>
        {subscriptionTier === 'free' ? (
          <div className="text-center py-4">
            <div className="text-sm font-semibold text-navy mb-1">Upgrade to Pro</div>
            <div className="text-xs text-mid-gray mb-4">Unlock unlimited goals, habits, cloud sync, and more.</div>
            <button className="btn-gold w-full">Upgrade for €7.99/month</button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-1 text-sm text-teal mb-1">
              <CheckCircle size={14} /> Pro Member
            </div>
            <div className="text-xs text-mid-gray">Your subscription is active</div>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-mid-gray/30 text-xs text-mid-gray">
          <div className="flex items-center justify-between mb-1">
            <span>Unlimited goals</span>
            {subscriptionTier === 'pro' ? <CheckCircle size={12} className="text-teal" /> : <span className="text-rose">✕</span>}
          </div>
          <div className="flex items-center justify-between mb-1">
            <span>All budget categories</span>
            {subscriptionTier === 'pro' ? <CheckCircle size={12} className="text-teal" /> : <span className="text-rose">✕</span>}
          </div>
          <div className="flex items-center justify-between mb-1">
            <span>Habit tracker</span>
            {subscriptionTier === 'pro' ? <CheckCircle size={12} className="text-teal" /> : <span className="text-rose">✕</span>}
          </div>
          <div className="flex items-center justify-between">
            <span>Cloud sync</span>
            {subscriptionTier === 'pro' ? <CheckCircle size={12} className="text-teal" /> : <span className="text-rose">✕</span>}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">Security</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-navy">PIN Lock</div>
            <div className="text-xs text-mid-gray">Require PIN to open the app</div>
          </div>
          <button
            onClick={() => { setPinLock(!pinLock); addToast({ message: pinLock ? 'PIN lock disabled' : 'PIN lock enabled', type: 'info' }) }}
            className={`w-12 h-7 rounded-full transition-all relative ${pinLock ? 'bg-teal' : 'bg-mid-gray/40'}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${pinLock ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">Notifications</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-navy">Weekly Reminders</div>
            <div className="text-xs text-mid-gray">Remind me to track spending</div>
          </div>
          <button
            onClick={() => { setNotifications(!notifications); addToast({ message: notifications ? 'Notifications disabled' : 'Notifications enabled', type: 'info' }) }}
            className={`w-12 h-7 rounded-full transition-all relative ${notifications ? 'bg-teal' : 'bg-mid-gray/40'}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${notifications ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">Language</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code)
                addToast({ message: `Language: ${lang.label}`, type: 'success' })
              }}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                i18n.language === lang.code
                  ? 'bg-navy text-white shadow-card'
                  : 'bg-cream text-navy/70 hover:bg-navy/10'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-xs">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Download size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">Data</h2>
        </div>
        <button onClick={handleExportData} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Download size={16} /> Export My Data
        </button>
        <p className="text-2xs text-mid-gray text-center mt-2">Download all your financial data as a CSV file</p>
      </div>

      {/* About */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">About</h2>
        </div>
        <div className="space-y-2 text-xs text-mid-gray">
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span className="text-navy">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Built with</span>
            <span className="text-navy">React + Supabase</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-mid-gray/30">
          <Link to="/landing" className="flex items-center justify-between text-xs text-teal font-semibold">
            View Landing Page <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Sign Out */}
      <button onClick={handleSignOut} className="btn-secondary w-full text-rose border-rose/30">
        Sign Out
      </button>

      <p className="text-center text-2xs text-mid-gray mt-6">
        Financial Planner © {new Date().getFullYear()}
      </p>
    </div>
  )
}
