import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGE_KEY = 'fp-language'

export function LanguageLoader({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved)
    }
  }, [i18n])

  return <>{children}</>
}
