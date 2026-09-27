import { useTranslation } from 'react-i18next'
import { LanguageSwitch, Logo } from '../components/ui'
import { SignInForm } from '../components/SignInForm'

export default function SignInPage() {
  const { t } = useTranslation()

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

      <SignInForm />

      <p className="mt-auto py-7 text-center text-[13px] text-muted">{t('signIn.joiningHint')}</p>
    </main>
  )
}
