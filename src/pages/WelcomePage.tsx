import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import { Button, LanguageSwitch, Logo } from '../components/ui'

// Temporary landing page after sign-in. Build step 2 replaces it with
// "Set up your home" / the Today screen, depending on the user's household.
export default function WelcomePage() {
  const { t } = useTranslation()
  const { session, signOut } = useAuth()
  const email = session?.user.email ?? ''

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6">
      <div className="flex justify-end pt-4">
        <LanguageSwitch />
      </div>
      <header className="flex flex-col items-center gap-2.5 pb-8 pt-10 text-center">
        <Logo size={64} />
        <h1 className="font-display text-[26px] font-bold">{t('welcome.title')}</h1>
        <p className="text-[14px] text-muted">{t('welcome.signedInAs', { email })}</p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
        <p className="text-[15px]">{t('welcome.noHomeYet')}</p>
        <Button disabled title={t('welcome.comingNext')}>
          {t('welcome.createHome')}
        </Button>
        <p className="text-[13px] text-muted">{t('welcome.comingNext')}</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">{t('welcome.joinHint')}</p>
      </section>

      <div className="mt-auto py-7">
        <Button variant="secondary" className="w-full" onClick={() => void signOut()}>
          {t('welcome.signOut')}
        </Button>
      </div>
    </main>
  )
}
