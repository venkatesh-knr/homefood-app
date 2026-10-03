import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui'
import { PeopleSection } from '../components/PeopleSection'
import { InviteCard } from '../components/InviteCard'
import { GettingStartedChecklist } from '../components/GettingStartedChecklist'
import { HomeSettingsCard } from '../components/HomeSettingsCard'
import { useCanPlanDate } from '../lib/useCanPlan'
import { toISODate } from '../lib/planner'

export default function HomeTabPage() {
  const { t } = useTranslation()
  const { profile, household } = useHome()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = profile.role === 'admin'
  const canSeeFamily = useCanPlanDate(toISODate(new Date()))

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

      {isAdmin && <HomeSettingsCard household={household} />}

      <button
        type="button"
        onClick={() => navigate('/history')}
        className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold">{t('home.history')}</span>
          <span className="text-[12.5px] text-muted">{t('home.historyHint')}</span>
        </span>
        <span aria-hidden="true" className="text-[20px] text-muted">›</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/nutrition')}
        className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold">{t('nutrition.mine')}</span>
          <span className="text-[12.5px] text-muted">{t('nutrition.mineSub')}</span>
        </span>
        <span aria-hidden="true" className="text-[20px] text-muted">›</span>
      </button>

      {canSeeFamily && (
        <button
          type="button"
          onClick={() => navigate('/nutrition/family')}
          className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left"
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold">{t('nutrition.family')}</span>
            <span className="text-[12.5px] text-muted">{t('nutrition.familySub')}</span>
          </span>
          <span aria-hidden="true" className="text-[20px] text-muted">›</span>
        </button>
      )}

      <Button variant="secondary" className="w-full" onClick={() => void signOut()}>
        {t('welcome.signOut')}
      </Button>
    </main>
  )
}
