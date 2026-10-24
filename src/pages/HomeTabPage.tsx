import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui'
import { GettingStartedChecklist } from '../components/GettingStartedChecklist'
import { FirstVisitTip } from '../components/FirstVisitTip'
import { useCanPlanDate } from '../lib/useCanPlan'
import { toISODate } from '../lib/planner'
import { useDemoState } from '../demo/demoState'

type Row = { key: string; to: string; title: string; hint: string }

function Group({ title, rows }: { title: string; rows: Row[] }) {
  const navigate = useNavigate()
  if (rows.length === 0) return null
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {rows.map((r, i) => (
          <button key={r.key} type="button" onClick={() => navigate(r.to)} className={`flex min-h-[60px] w-full items-center justify-between gap-3 px-4 py-3 text-left ${i > 0 ? 'border-t border-line' : ''}`}>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[15.5px] font-semibold">{r.title}</span>
              <span className="text-[12.5px] leading-snug text-muted">{r.hint}</span>
            </span>
            <span aria-hidden="true" className="shrink-0 text-[22px] leading-none text-muted">›</span>
          </button>
        ))}
      </div>
    </section>
  )
}

/** The Home tab: a short menu grouped by what it is for. Each row opens its own screen (HomeSectionPage), so nothing here is a long stack of cards. */
export default function HomeTabPage() {
  const { t } = useTranslation()
  const { profile, household } = useHome()
  const { signOut } = useAuth()
  const demo = useDemoState()
  const isAdmin = profile.role === 'admin'
  const canSeeFamily = useCanPlanDate(toISODate(new Date()))

  const row = (key: string, to: string, title: string, hint: string): Row => ({ key, to, title, hint })
  const ourHome: Row[] = [
    row('family', '/home/family', t('home.menu.family'), t('home.menu.familyHint')),
    ...(isAdmin ? [row('settings', '/home/settings', t('home.menu.settings'), t('home.menu.settingsHint'))] : []),
    row('items', '/home/items', t('home.menu.items'), t('home.menu.itemsHint')),
    row('diets', '/home/diets', t('home.menu.diets'), t('home.menu.dietsHint')),
  ]
  const foodHealth: Row[] = [
    row('history', '/history', t('home.history'), t('home.historyHint')),
    row('nutrition', '/nutrition', t('nutrition.mine'), t('nutrition.mineSub')),
    ...(canSeeFamily ? [row('familyNutrition', '/nutrition/family', t('nutrition.family'), t('nutrition.familySub'))] : []),
    row('goals', '/home/goals', t('home.menu.goals'), t('home.menu.goalsHint')),
  ]
  const thisApp: Row[] = [
    row('app', '/home/app', t('home.menu.app'), t('home.menu.appHint')),
    ...(demo.active ? [] : [row('account', '/home/account', t('home.menu.account'), t('home.menu.accountHint'))]),
  ]

  return (
    <main className="flex flex-col gap-5 px-5 pb-8">
      <h1 className="sr-only">{t('shell.nav.home')}</h1>
      <FirstVisitTip id="home" />

      {isAdmin && <GettingStartedChecklist householdId={household.id} compact />}

      <Group title={t('home.menu.groups.ourHome')} rows={ourHome} />
      <Group title={t('home.menu.groups.foodHealth')} rows={foodHealth} />
      <Group title={t('home.menu.groups.thisApp')} rows={thisApp} />

      <Button variant="secondary" className="w-full" onClick={() => void signOut()}>
        {demo.active ? t('demo.start') : t('welcome.signOut')}
      </Button>
    </main>
  )
}
