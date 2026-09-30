import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui'
import { PeopleSection } from '../components/PeopleSection'
import { InviteCard } from '../components/InviteCard'
import { GettingStartedChecklist } from '../components/GettingStartedChecklist'

export default function HomeTabPage() {
  const { t } = useTranslation()
  const { profile, household } = useHome()
  const { signOut } = useAuth()
  const isAdmin = profile.role === 'admin'

  return (
    <main className="flex flex-col gap-5 px-5 pb-8">
      <PeopleSection householdId={household.id} myProfileId={profile.id} isAdmin={isAdmin} />

      {isAdmin && (
        <div className="flex flex-col gap-2">
          <span className="font-display text-[17px] font-semibold">{t('home.invite')}</span>
          <InviteCard household={household} myProfileId={profile.id} />
        </div>
      )}

      {isAdmin && <GettingStartedChecklist householdId={household.id} />}

      <Button variant="secondary" className="w-full" onClick={() => void signOut()}>
        {t('welcome.signOut')}
      </Button>
    </main>
  )
}
