import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthError, useAuth } from '../lib/auth'
import { cleanCode, isValidCode, isValidEmail, normaliseEmail } from '../lib/validation'
import { Button, LanguageSwitch, Logo } from '../components/ui'

const RESEND_SECONDS = 45

export default function SignInPage() {
  const { t } = useTranslation()
  const { sendCode, verifyCode } = useAuth()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [wait, setWait] = useState(0)
  const codeInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (wait <= 0) return
    const id = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  useEffect(() => {
    if (step === 'code') codeInput.current?.focus()
  }, [step])

  const errorText = (e: unknown) =>
    e instanceof AuthError ? t(`signIn.errors.${e.kind}`) : t('signIn.errors.generic')

  async function onSendCode(e?: FormEvent) {
    e?.preventDefault()
    setError(null)
    if (!isValidEmail(email)) return setError(t('signIn.errors.invalidEmail'))
    setBusy(true)
    try {
      await sendCode(normaliseEmail(email))
      setStep('code')
      setCode('')
      setWait(RESEND_SECONDS)
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isValidCode(code)) return setError(t('signIn.errors.invalidCode'))
    setBusy(true)
    try {
      await verifyCode(normaliseEmail(email), code)
      // On success the auth listener swaps this page for the app.
    } catch (err) {
      setError(errorText(err))
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6">
      <div className="flex justify-end pt-4">
        <LanguageSwitch />
      </div>

      <header className="flex flex-col items-center gap-2.5 pb-9 pt-10 text-center">
        <Logo />
        <h1 className="font-display text-[28px] font-bold">{t('app.name')}</h1>
        <p className="text-[15px] text-ink-soft">{t('app.tagline')}</p>
      </header>

      {step === 'email' ? (
        <form onSubmit={onSendCode} className="flex flex-col gap-3" noValidate>
          <label htmlFor="email" className="text-sm font-semibold">
            {t('signIn.emailLabel')}
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('signIn.emailPlaceholder')}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'signin-error' : undefined}
            className="h-[52px] rounded-2xl border border-line-strong bg-white px-4 text-base"
          />
          <Button type="submit" disabled={busy}>
            {busy ? t('signIn.sending') : t('signIn.sendCode')}
          </Button>
          <p className="text-center text-[13px] leading-relaxed text-muted">{t('signIn.noPassword')}</p>
        </form>
      ) : (
        <form onSubmit={onVerify} className="flex flex-col gap-3" noValidate>
          <p className="text-[15px] leading-relaxed">{t('signIn.sentTo', { email: normaliseEmail(email) })}</p>
          <label htmlFor="code" className="text-sm font-semibold">
            {t('signIn.codeLabel')}
          </label>
          <input
            id="code"
            ref={codeInput}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(cleanCode(e.target.value))}
            placeholder="••••••"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'signin-error' : undefined}
            className="h-[60px] rounded-2xl border-2 border-saffron bg-white px-4 text-center font-display text-[28px] tracking-[0.5em]"
          />
          <Button type="submit" disabled={busy || code.length !== 6}>
            {busy ? t('signIn.checking') : t('signIn.continue')}
          </Button>
          <div className="flex items-center justify-between">
            <Button variant="text" type="button" onClick={() => { setStep('email'); setError(null) }}>
              {t('signIn.changeEmail')}
            </Button>
            {wait > 0 ? (
              <span className="text-[13.5px] text-muted">{t('signIn.resendIn', { seconds: wait })}</span>
            ) : (
              <Button variant="text" type="button" onClick={() => onSendCode()} disabled={busy}>
                {t('signIn.resend')}
              </Button>
            )}
          </div>
          <p className="text-center text-[12.5px] text-muted">{t('signIn.expires')}</p>
        </form>
      )}

      {error && (
        <p id="signin-error" role="alert" className="mt-3 rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">
          {error}
        </p>
      )}

      <p className="mt-auto py-7 text-center text-[13px] text-muted">{t('signIn.joiningHint')}</p>
    </main>
  )
}
