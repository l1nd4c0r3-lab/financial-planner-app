import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/locales/en.json'
import it from '@/locales/it.json'
import es from '@/locales/es.json'
import fr from '@/locales/fr.json'
import de from '@/locales/de.json'
import pt from '@/locales/pt.json'

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
]

const LANGUAGE_KEY = 'fp-language'

function getSavedLanguage(): string {
  try {
    return localStorage.getItem(LANGUAGE_KEY) || 'en'
  } catch {
    return 'en'
  }
}

// Synchronously read saved language — must happen BEFORE i18n.init()
// so React renders with the correct language on the very first paint.
const savedLanguage = getSavedLanguage()

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    pt: { translation: pt },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  // Deferring reactivity: we handle language persistence manually
  react: { useSuspense: false },
})

// Persist language changes to localStorage
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, lng)
  } catch {
    // localStorage not available
  }
})

export default i18n
