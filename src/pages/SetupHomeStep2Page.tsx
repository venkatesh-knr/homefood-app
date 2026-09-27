import { useTranslation } from 'react-i18next'
import { useHousehold } from '../lib/queries'
import type { Profile } from '../lib/people'
import { Button, FullPageMessage } from '../components/ui'
import { InviteCard } from '../components/InviteCard'
import { GettingStartedChecklist } from '../components/GettingStartedChecklist'

export default function SetupHomeStep2Page({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const { t } = useTranslation()
  const { data: household, isLoading } = useHousehold(profile.household_id)

  if (isLoading || !household) {
    return (
      <FullPageMessage>
        <p className="text-muted">{t('common.loading')}</p>
      </FullPageMessage>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-5 pb-6">
      <div className="flex flex-col gap-1.5 pt-6">
        <span className="text-[12.5px] font-semibold text-saffron-ink">{t('invite.stepLabel')}</span>
        <h1 className="font-display text-[24px] font-bold">{t('invite.title')}</h1>
        <p className="text-[14px] text-ink-soft">{t('invite.subtitle')}</p>
      </div>

      <InviteCard household={household} myProfileId={profile.id} />
      <GettingStartedChecklist />

      <div className="mt-auto border-t border-line pt-4">
        <Button variant="accent" className="w-full" onClick={onDone}>
          {t('invite.cta')}
        </Button>
      </div>
    </main>
  )
}
