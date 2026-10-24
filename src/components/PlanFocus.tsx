import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { usePlanFollows } from '../lib/planQueries'
import { plansOf, proteinAim } from '../lib/dietPlans'
import { Card } from './ui'

/** "Your diet plan" on My nutrition: the plan's focus in words, and a protein aim for the protein-leaning plans. A gentle guide: no scores, no limits, no "broke your plan". */
export function PlanFocus({ profileId, usualProteinG }: { profileId: string; usualProteinG: number }) {
  const { t } = useTranslation()
  const { household } = useHome()
  const { data: follows } = usePlanFollows(household.id)
  const plans = plansOf(follows ?? [], profileId)
  if (plans.length === 0) return null
  const aim = proteinAim(plans, usualProteinG)
  return (
    <Card className="flex flex-col gap-1.5 p-4">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{t('nutrition.planTitle')}</span>
      {plans.map((p) => (
        <span key={p} className="break-words text-[14px] font-semibold">
          {t('nutrition.planFocus', { plan: t(`plans.name.${p}`), focus: t(`plans.focusText.${p}`) })}
        </span>
      ))}
      {aim !== null && <span className="font-display text-[16px] font-bold">{t('nutrition.proteinAim', { n: aim })}</span>}
      <span className="text-[12px] text-muted">{t('nutrition.planNote')}</span>
    </Card>
  )
}
