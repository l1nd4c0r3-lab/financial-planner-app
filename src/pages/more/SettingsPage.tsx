import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Mail, Bell, Lock, Download, Info, CreditCard,
  CheckCircle, ExternalLink, Globe
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
      addToast({ message: t('settings.profileSaved') || 'Profile saved!', type: 'success' })
    } catch {
      addToast({ message: t('settings.profileError') || 'Failed to save', type: 'error' })
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
    addToast({ message: t('settings.exporting') || 'Preparing your data export...', type: 'info' })
    await new Promise((r) => setTimeout(r, 1000))
    addToast({ message: t('settings.exportReady') || 'Data export ready! (demo)', type: 'success' })
  }

  return (
    <div className="min-h-screen bg-cream px-4 pt-6 pb-8 max-w-lg mx-auto">
      <h1 className="page-title mb-6">{t('settings.title')}</h1>

      {/* Profile */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">{t('settings.profile')}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="section-title">{t('settings.displayName')}</label>
            <input
              type="text"
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('settings.yourName')}
            />
          </div>
          <div>
            <label className="section-title">{t('settings.email')}</label>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-mid-gray" />
              <span className="text-sm text-navy/70">{user?.email || t('settings.demoEmail')}</span>
              {isDemo && <span className="badge-free ml-1">{t('settings.demo')}</span>}
            </div>
          </div>
          <button onClick={handleSaveProfile} className="btn-primary w-full" disabled={saving}>
            {saving ? t('settings.saving') : t('settings.saveProfile')}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">{t('settings.subscription')}</h2>
          <span className={subscriptionTier === 'pro' ? 'badge-pro ml-auto' : 'badge-free ml-auto'}>
            {subscriptionTier === 'pro' ? t('settings.pro') : t('settings.free')}
          </span>
        </div>
        {subscriptionTier === 'free' ? (
          <div className="text-center py-4">
            <div className="text-sm font-semibold text-navy mb-1">{t('settings.upgradeTitle')}</div>
            <div className="text-xs text-mid-gray mb-4">{t('settings.upgradeDesc')}</div>
            <button className="btn-gold w-full">{t('settings.upgradeCta')}</button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-1 text-sm text-teal mb-1">
              <CheckCircle size={14} /> {t('settings.proMember')}
            </div>
            <div className="text-xs text-mid-gray">{t('settings.subscriptionActive')}</div>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-mid-gray/30 text-xs text-mid-gray">
          <div className="flex items-center justify-between mb-1">
            <span>{t('settings.featureGoals')}</span>
            {subscriptionTier === 'pro' ? <CheckCircle size={12} className="text-teal" /> : <span className="text-rose">✕</span>}
          </div>
          <div className="flex items-center justify-between mb-1">
            <span>{t('settings.featureCategories')}</span>
            {subscriptionTier === 'pro' ? <CheckCircle size={12} className="text-teal" /> : <span className="text-rose">✕</span>}
          </div>
          <div className="flex items-center justify-between mb-1">
            <span>{t('settings.featureHabits')}</span>
            {subscriptionTier === 'pro' ? <CheckCircle size={12} className="text-teal" /> : <span className="text-rose">✕</span>}
          </div>
          <div className="flex items-center justify-between">
            <span>{t('settings.featureSync')}</span>
            {subscriptionTier === 'pro' ? <CheckCircle size={12} className="text-teal" /> : <span className="text-rose">✕</span>}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">{t('settings.security')}</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-navy">{t('settings.pinLock')}</div>
            <div className="text-xs text-mid-gray">{t('settings.pinLockDesc')}</div>
          </div>
          <button
            onClick={() => {
              setPinLock(!pinLock)
              addToast({ message: pinLock ? t('settings.pinDisabled') : t('settings.pinEnabled'), type: 'info' })
            }}
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
          <h2 className="font-semibold text-sm text-navy">{t('settings.notifications')}</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-navy">{t('settings.weeklyReminders')}</div>
            <div className="text-xs text-mid-gray">{t('settings.weeklyRemindersDesc')}</div>
          </div>
          <button
            onClick={() => {
              setNotifications(!notifications)
              addToast({ message: notifications ? t('settings.notifDisabled') : t('settings.notifEnabled'), type: 'info' })
            }}
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
          <h2 className="font-semibold text-sm text-navy">{t('settings.language')}</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code)
                addToast({ message: `${t('settings.language')}: ${lang.label}`, type: 'success' })
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
          <h2 className="font-semibold text-sm text-navy">{t('settings.data')}</h2>
        </div>
        <button onClick={handleExportData} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Download size={16} /> {t('settings.exportData')}
        </button>
        <p className="text-2xs text-mid-gray text-center mt-2">{t('settings.exportDesc')}</p>
      </div>

      {/* About */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-navy" />
          <h2 className="font-semibold text-sm text-navy">{t('settings.about')}</h2>
        </div>
        <div className="space-y-2 text-xs text-mid-gray">
          <div className="flex items-center justify-between">
            <span>{t('settings.version')}</span>
            <span className="text-navy">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('settings.builtWith')}</span>
            <span className="text-navy">React + Supabase</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-mid-gray/30">
          <Link to="/landing" className="flex items-center justify-between text-xs text-teal font-semibold">
            {t('settings.viewLanding')} <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Sign Out */}
      <button onClick={handleSignOut} className="btn-secondary w-full text-rose border-rose/30">
        {t('settings.signOut')}
      </button>

      <p className="text-center text-2xs text-mid-gray mt-6">
        Financial Planner © {new Date().getFullYear()}
      </p>
    </div>
  )
}
