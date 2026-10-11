import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useExtrasPeople } from '../lib/useExtrasPeople'
import { usePersonalGoals } from '../lib/intakeQueries'
import { saveGoals } from '../lib/intakeMutations'
import { goalFor, parseGoal } from '../lib/intake'
import { useNutritionTargets } from '../lib/nutritionQueries'
import { targetFor } from '../lib/nutrition'
import { describeError } from '../lib/errors'
import type { Profile } from '../lib/people'
import { Card } from './ui'

const input = 'min-h-[48px] w-full rounded-xl border border-line-strong bg-surface px-3 text-[16px] aria-[invalid=true]:border-alert'

/** "My goals": an optional protein and / or calorie number. Private to the person (the Admin keeps them for family members with no login). */
export function MyGoalsCard() {
  const { t } = useTranslation()
  const { profile } = useHome()
  const people = useExtrasPeople()
  const [personId, setPersonId] = useState(profile.id)
  const person = people.find((p) => p.id === personId) ?? profile

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[17px] font-semibold">{t('goals.title')}</span>
      <Card className="flex flex-col gap-2.5 px-3.5 py-3.5">
        {people.length > 1 && (
          <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
            {t('goals.forLabel')}
            <select value={person.id} onChange={(e) => setPersonId(e.target.value)} className="min-h-[44px] flex-1 rounded-xl border border-line bg-surface px-2 text-[14px] text-ink">
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id === profile.id ? t('extras.me') : p.display_name}
                </option>
              ))}
            </select>
          </label>
        )}
        <GoalsForm key={person.id} person={person} own={person.id === profile.id} />
      </Card>
    </div>
  )
}

function GoalsForm({ person, own }: { person: Profile; own: boolean }) {
  const { t } = useTranslation()
  const { household } = useHome()
  const { data: goals, isLoading } = usePersonalGoals(person.id)
  const { data: targets } = useNutritionTargets()
  const suggested = targets && targets.length > 0 ? targetFor(person, targets) : null
  const [protein, setProtein] = useState<string | null>(null)
  const [kcal, setKcal] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'busy' | 'saved' | 'invalid' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return null
  const shownProtein = protein ?? (goals?.protein_goal_g ?? '').toString()
  const shownKcal = kcal ?? (goals?.kcal_goal ?? '').toString()
  const parsedProtein = parseGoal(shownProtein, 'protein')
  const parsedKcal = parseGoal(shownKcal, 'kcal')
  const bad = parsedProtein === 'invalid' || parsedKcal === 'invalid'
  const hint = suggested ? goalFor(null, suggested.target) : null

  async function save(next: { protein_goal_g: number | null; kcal_goal: number | null }) {
    setState('busy')
    setError(null)
    try {
      await saveGoals(person.id, household.id, next)
      setState('saved')
    } catch (err) {
      setError(describeError(err, t))
      setState('error')
    }
  }

  return (
    <>
      <p className="text-[12.5px] text-muted">{own ? t('goals.hint') : t('goals.hintAdmin')}</p>
      <label className="flex flex-col gap-1 text-[13px] font-semibold">
        {t('goals.protein')}
        <input value={shownProtein} onChange={(e) => { setProtein(e.target.value); setState('idle') }} inputMode="numeric" aria-invalid={state === 'invalid' && parsedProtein === 'invalid'} placeholder={hint ? t('goals.suggested', { value: Math.round(hint.protein.value) }) : ''} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-[13px] font-semibold">
        {t('goals.kcal')}
        <input value={shownKcal} onChange={(e) => { setKcal(e.target.value); setState('idle') }} inputMode="numeric" aria-invalid={state === 'invalid' && parsedKcal === 'invalid'} placeholder={hint ? t('goals.suggested', { value: Math.round(hint.kcal.value) }) : ''} className={input} />
      </label>
      <div role="status" aria-live="polite" className="min-h-[18px] text-[12.5px]">
        {state === 'saved' && <span className="text-leaf">{t('goals.saved')}</span>}
        {state === 'invalid' && <span className="text-alert">{t('goals.problem')}</span>}
        {state === 'error' && <span className="text-alert">{error}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={state === 'busy'}
          onClick={() => {
            if (bad) return setState('invalid')
            void save({ protein_goal_g: parsedProtein as number | null, kcal_goal: parsedKcal as number | null })
          }}
          className="min-h-[48px] flex-1 rounded-xl bg-ink px-4 text-[14.5px] font-semibold text-cream disabled:opacity-60"
        >
          {t('goals.save')}
        </button>
        <button
          type="button"
          disabled={state === 'busy'}
          onClick={() => {
            setProtein('')
            setKcal('')
            void save({ protein_goal_g: null, kcal_goal: null })
          }}
          className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong px-3 text-[13.5px] font-semibold"
        >
          {t('goals.reset')}
        </button>
      </div>
    </>
  )
}
