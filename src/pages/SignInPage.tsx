import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, LanguageSwitch, Logo } from '../components/ui'
import { startDemo } from '../demo/demo'
import { SignInForm } from '../components/SignInForm'
import { WelcomeTour } from '../components/WelcomeTour'
import { hasSeenTour, markTourSeen } from '../lib/tour'

export default function SignInPage() {
  const { t } = useTranslation()
  const [opening, setOpening] = useState(false)
  // The first time the app opens on this device, the four-card tour comes first; "Take the tour" brings it back.
  const [touring, setTouring] = useState(() => !hasSeenTour())

  function closeTour() {
    markTourSeen()
    setTouring(false)
  }

  async function openDemo() {
    setOpening(true)
    try {
      await startDemo()
    } finally {
      setOpening(false)
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

      <SignInForm />

      <div className="flex flex-col gap-2.5 pt-7">
        <div className="flex items-center gap-3 text-[13px] text-muted" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          {t('demo.or')}
          <span className="h-px flex-1 bg-line" />
        </div>
        <Button variant="secondary" className="w-full" disabled={opening} onClick={() => void openDemo()}>
          {opening ? t('demo.opening') : t('demo.explore')}
        </Button>
        <p className="text-center text-[12.5px] text-muted">{t('demo.exploreHint')}</p>
      </div>

      <button type="button" onClick={() => setTouring(true)} className="mt-4 self-center rounded-xl px-3 text-[14px] font-semibold text-saffron-ink">
        {t('tour.takeTour')}
      </button>

      <p className="mt-auto py-7 text-center text-[13px] text-muted">{t('signIn.joiningHint')}</p>

      {touring && (
        <WelcomeTour
          onClose={closeTour}
          onDemo={() => {
            closeTour()
            void openDemo()
          }}
        />
      )}
    </main>
  )
}
