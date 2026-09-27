import { useState, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
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

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'accent' | 'text'; children: ReactNode }

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'
  const styles = {
    primary: 'h-13 min-h-[52px] rounded-2xl bg-ink px-5 text-base text-cream hover:bg-ink-soft',
    secondary: 'min-h-[48px] rounded-2xl border-[1.5px] border-line-strong bg-white px-4 text-[15px] text-ink hover:bg-sand',
    accent: 'h-13 min-h-[52px] rounded-2xl bg-saffron px-5 text-base text-ink hover:brightness-95',
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

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-white ${className}`}>{children}</div>
}

/** An on/off switch styled like the mockups (e.g. "Plan evening snacks"). */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors ${checked ? 'bg-leaf' : 'bg-line-strong'}`}
    >
      <span
        className="absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow transition-[left]"
        style={{ left: checked ? 23 : 3 }}
      />
    </button>
  )
}

export function Avatar({ name, color, size = 42 }: { name: string; color: string; size?: number }) {
  const letter = name.trim() ? name.trim()[0]!.toUpperCase() : '?'
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {letter}
    </span>
  )
}

type PillTone = 'neutral' | 'success' | 'accent'

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: PillTone }) {
  const styles = {
    neutral: 'bg-sand text-ink-soft',
    success: 'bg-leaf-tint text-leaf',
    accent: 'bg-saffron-tint text-saffron-ink',
  }[tone]
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${styles}`}>{children}</span>
}

/** A toggle-styled pill button, e.g. "Will log in" / "No login" while setting up a home. */
export function TogglePill({
  pressed,
  onClick,
  onLabel,
  offLabel,
}: {
  pressed: boolean
  onClick: () => void
  onLabel: string
  offLabel: string
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`h-[34px] shrink-0 whitespace-nowrap rounded-full border px-3 text-[12.5px] font-semibold ${
        pressed ? 'border-leaf bg-leaf-tint text-leaf' : 'border-line-strong bg-white text-ink-soft'
      }`}
    >
      {pressed ? onLabel : offLabel}
    </button>
  )
}

/** Free-text chips (allergies): type a word, press Enter or comma to add it. */
export function ChipInput({
  values,
  onChange,
  placeholder,
  isValid,
  normalise,
}: {
  values: string[]
  onChange: (next: string[]) => void
  placeholder: string
  isValid: (value: string) => boolean
  normalise: (value: string) => string
}) {
  const [draft, setDraft] = useState('')

  function commit() {
    const v = normalise(draft)
    setDraft('')
    if (!v || !isValid(v) || values.includes(v)) return
    onChange([...values, v])
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line-strong bg-white p-2">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-[13px] text-ink-soft">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={v} className="text-muted hover:text-alert">
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={values.length === 0 ? placeholder : ''}
        className="min-w-[80px] flex-1 border-none px-2 py-1.5 text-[14px] outline-none"
      />
    </div>
  )
}
