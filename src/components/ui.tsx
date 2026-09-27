import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { setLanguage, type Language } from '../i18n'

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[22px] bg-saffron text-ink"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.53} height={size * 0.53} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 16c1 1.5 5 1.5 6 0" />
      </svg>
    </span>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'text'; children: ReactNode }

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'
  const styles = {
    primary: 'h-13 min-h-[52px] rounded-2xl bg-ink px-5 text-base text-cream hover:bg-ink-soft',
    secondary: 'min-h-[48px] rounded-2xl border-[1.5px] border-line-strong bg-white px-4 text-[15px] text-ink hover:bg-sand',
    text: 'min-h-[44px] px-1 text-[14px] text-saffron-ink hover:underline',
  }[variant]
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function LanguageSwitch() {
  const { t, i18n } = useTranslation()
  const current = i18n.language as Language
  return (
    <div role="group" aria-label={t('language.label')} className="inline-flex gap-1 rounded-xl bg-sand p-1 text-[13.5px]">
      {(['en', 'ta'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={current === lang}
          onClick={() => setLanguage(lang)}
          className={`min-h-[36px] rounded-lg px-3 ${current === lang ? 'bg-white font-semibold shadow-sm' : 'text-ink-soft'}`}
        >
          {t(`language.${lang}`)}
        </button>
      ))}
    </div>
  )
}

export function FullPageMessage({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">{children}</main>
}
