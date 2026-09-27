import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import ta from './ta.json'

export const LANGUAGES = ['en', 'ta'] as const
export type Language = (typeof LANGUAGES)[number]

const STORAGE_KEY = 'homefood.lang'

function savedLanguage(): Language {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'ta') return v
  } catch {
    /* storage unavailable (private mode) — fall back to English */
  }
  return 'en'
}

export function setLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lang
  void i18n.changeLanguage(lang)
}

const initial = savedLanguage()
document.documentElement.lang = initial

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ta: { translation: ta } },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
