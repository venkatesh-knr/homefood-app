// The one line under a person's name on the Diets and fasting page ("Saturdays, skips dinner"). Pure, but it needs the screen's t().
import type { TFunction } from 'i18next'
import type { FastingRule } from './fasting'

const MONDAY = '2026-10-26'
const addDay = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** One line for a rule: "chosen dates, fruits and milk" / "Saturdays, skips dinner". Used on the Diets and fasting page. */
export function ruleSummary(rule: FastingRule, t: TFunction, lang: 'en' | 'ta'): string {
  const dayName = (wd: number) => new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short' }).format(new Date(`${addDay(MONDAY, wd - 1)}T00:00:00`))
  const when = [rule.weekdays.length > 0 ? [...rule.weekdays].sort().map(dayName).join(', ') : '', rule.dates.length > 0 && rule.weekdays.length === 0 ? t('fasting.summaryDates') : ''].filter(Boolean).join(', ')
  const meal = (m: string) => t(`meal.${m}`).toLowerCase()
  const what =
    rule.mode === 'skip_meals' ? t('fasting.summarySkip', { meals: rule.skip_meals.map(meal).join(' + ') })
    : rule.mode === 'fasting_foods' ? t('fasting.summaryFoods')
    : rule.mode === 'fruits_milk' ? t('fasting.summaryFruits')
    : t('fasting.summaryOne', { meal: meal(rule.one_meal ?? 'lunch') })
  return [when, what].filter(Boolean).join(' · ')
}
