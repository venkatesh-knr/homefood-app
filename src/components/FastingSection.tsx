import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { describeError } from '../lib/errors'
import { avatarColor, type Profile } from '../lib/people'
import { useFastingRules } from '../lib/fastingQueries'
import { saveFastingRule, stopFasting } from '../lib/fastingMutations'
import { EMPTY_RULE, FAST_MEALS, FAST_MODES, isUsable, upcomingDates, type FastMeal, type FastMode, type FastingRule } from '../lib/fasting'
import { weekdayLetter } from '../lib/planner'
import { Avatar } from './ui'

const chip = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13.5px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`
const THIS_YEAR = new Date().getFullYear()
const MONDAY = '2026-10-26'
const addDay = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Home › Diets and fasting › Fasting days: pick a person, how they fast, the weekdays and dates. A person sets their own; the Admin sets the days of a family
 * member nobody has logged in as yet. Nobody under 18. The app never suggests fasting. */
export function FastingSection({ today }: { today: string }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { profile, household } = useHome()
  const { data: members } = useMembers(household.id)
  const { data: rules } = useFastingRules(household.id)
  const family = (members ?? []).filter((m) => m.kind === 'family')
  const [personId, setPersonId] = useState<string | null>(null)
  const person: Profile | undefined = family.find((m) => m.id === (personId ?? profile.id)) ?? family[0]
  const canSet = (m: Profile) => m.id === profile.id || (profile.role === 'admin' && m.user_id === null)
  const saved = (rules ?? []).find((r) => r.profile_id === person?.id)
  const [draft, setDraft] = useState<FastingRule | null>(null)
  const [dateInput, setDateInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (person) {
      setDraft(saved ? { ...saved, dates: upcomingDates(saved.dates, today) } : EMPTY_RULE(person.id))
      setError(null)
      setDone(false)
    }
  }, [person?.id, saved?.mode, saved?.weekdays.join(), saved?.dates.join(), saved?.skip_meals.join(), saved?.one_meal]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!person || !draft) return null
  const editable = canSet(person)
  const age = person.birth_year === null ? null : THIS_YEAR - person.birth_year
  const blocked = age === null ? 'noYear' : age < 18 ? 'under18' : null
  const set = (patch: Partial<FastingRule>) => { setDraft({ ...draft, ...patch }); setDone(false) }
  const wdName = (wd: number) => new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long' }).format(new Date(`${addDay(MONDAY, wd - 1)}T00:00:00`))
  const dateText = (d: string) => new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${d}T00:00:00`))

  async function onSave() {
    setBusy(true)
    setError(null)
    try {
      await saveFastingRule(household.id, draft!)
      setDone(true)
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }
  async function onStop() {
    setBusy(true)
    setError(null)
    try {
      await stopFasting(household.id, person!.id)
      setDraft(EMPTY_RULE(person!.id))
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }
  const problem = !isUsable(draft) ? (draft.mode === 'skip_meals' && draft.skip_meals.length === 0 && (draft.weekdays.length > 0 || draft.dates.length > 0) ? t('fasting.needMeal') : t('fasting.needDay')) : null

  return (
    <div className="flex flex-col gap-4">
      <p className="px-1 text-[13px] text-muted">{t('fasting.subtitle')}</p>
      <div role="group" aria-label={t('fasting.title')} className="flex flex-wrap gap-1.5">
        {family.map((m) => (
          <button key={m.id} type="button" aria-pressed={m.id === person.id} onClick={() => setPersonId(m.id)} className={`flex min-h-[44px] items-center gap-2 rounded-full border py-1 pl-1.5 pr-3.5 text-[13.5px] font-semibold ${m.id === person.id ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border-line-strong bg-surface text-ink'}`}>
            <Avatar name={m.display_name} color={avatarColor(members?.indexOf(m) ?? 0, m.kind)} size={30} />
            {m.display_name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-3.5">
        <h2 className="font-display text-[16px] font-semibold">{t('fasting.howFasts', { name: person.display_name })}</h2>
        {blocked && <p role="note" className="rounded-xl bg-sand px-3 py-2.5 text-[13.5px] text-ink-soft">{t(blocked === 'noYear' ? 'fasting.noYear' : 'fasting.under18', { name: person.display_name })}</p>}
        {!editable && !blocked && <p className="rounded-xl bg-sand px-3 py-2.5 text-[13.5px] text-ink-soft">{t('fasting.onlyThey', { name: person.display_name })}</p>}

        <fieldset disabled={!editable || Boolean(blocked)} className="flex min-w-0 flex-col gap-3.5 border-0 p-0">
          <div role="radiogroup" aria-label={t('fasting.howFasts', { name: person.display_name })} className="flex flex-col gap-2">
            {FAST_MODES.map((m: FastMode) => (
              <button key={m} type="button" role="radio" aria-checked={draft.mode === m} onClick={() => set({ mode: m })} className={`flex min-h-[56px] items-center gap-3 rounded-2xl border-[1.5px] px-3.5 py-2 text-left ${draft.mode === m ? 'border-saffron bg-saffron-tint' : 'border-line-strong bg-surface'}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${draft.mode === m ? 'border-saffron' : 'border-line-strong'}`}>{draft.mode === m && <span className="h-2.5 w-2.5 rounded-full bg-saffron" />}</span>
                <span className="flex min-w-0 flex-col">
                  <span className="break-words text-[15px] font-semibold">{t(`fasting.mode.${m}`)}</span>
                  <span className="break-words text-[12.5px] text-ink-soft">{t(`fasting.modeHint.${m}`)}</span>
                </span>
              </button>
            ))}
          </div>

          {draft.mode === 'skip_meals' && (
            <div className="flex flex-col gap-1.5">
              <span id="fast-skip" className="text-[12.5px] font-semibold text-ink-soft">{t('fasting.mealsToSkip')}</span>
              <div role="group" aria-labelledby="fast-skip" className="flex flex-wrap gap-1.5">
                {FAST_MEALS.map((m: FastMeal) => {
                  const on = draft.skip_meals.includes(m)
                  return <button key={m} type="button" aria-pressed={on} onClick={() => set({ skip_meals: on ? draft.skip_meals.filter((x) => x !== m) : [...draft.skip_meals, m] })} className={chip(on)}>{t(`meal.${m}`)}</button>
                })}
              </div>
            </div>
          )}
          {draft.mode === 'one_meal' && (
            <div className="flex flex-col gap-1.5">
              <span id="fast-one" className="text-[12.5px] font-semibold text-ink-soft">{t('fasting.theOneMeal')}</span>
              <div role="radiogroup" aria-labelledby="fast-one" className="flex flex-wrap gap-1.5">
                {FAST_MEALS.map((m: FastMeal) => (
                  <button key={m} type="button" role="radio" aria-checked={draft.one_meal === m} onClick={() => set({ one_meal: m })} className={chip(draft.one_meal === m)}>{t(`meal.${m}`)}</button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span id="fast-weekdays" className="text-[12.5px] font-semibold text-ink-soft">{t('fasting.everyWeek')}</span>
            <div role="group" aria-labelledby="fast-weekdays" className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((wd) => {
                const on = draft.weekdays.includes(wd)
                const label = lang === 'ta' ? weekdayLetter(addDay(MONDAY, wd - 1), 'ta') : wdName(wd).slice(0, 2)
                return (
                  <button key={wd} type="button" aria-pressed={on} aria-label={wdName(wd)} onClick={() => set({ weekdays: on ? draft.weekdays.filter((x) => x !== wd) : [...draft.weekdays, wd] })} className={`min-h-[44px] rounded-xl px-0 text-[13px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`}>{label}</button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-ink-soft">{t('fasting.onDates')}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {draft.dates.map((d) => (
                <span key={d} className="flex items-center gap-1 rounded-full bg-dinner-tint py-1 pl-3.5 pr-1 text-[13.5px] font-semibold text-dinner-ink">
                  {dateText(d)}
                  <button type="button" aria-label={t('fasting.removeDate', { date: dateText(d) })} onClick={() => set({ dates: draft.dates.filter((x) => x !== d) })} className="flex h-9 w-9 items-center justify-center rounded-full">×</button>
                </span>
              ))}
              <label className="flex items-center gap-1.5">
                <span className="sr-only">{t('fasting.dateLabel')}</span>
                <input type="date" min={today} value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="min-h-[44px] rounded-xl border border-dashed border-saffron-ink/60 bg-surface px-2 text-[14px]" />
              </label>
              <button type="button" disabled={!dateInput || dateInput < today} onClick={() => { set({ dates: upcomingDates([...draft.dates, dateInput], today) }); setDateInput('') }} className="min-h-[44px] rounded-xl border-[1.5px] border-dashed border-saffron-ink/60 px-3 text-[13.5px] font-semibold text-saffron-ink disabled:opacity-40">+ {t('fasting.addDate')}</button>
            </div>
          </div>

          {problem && <p className="text-[12.5px] text-muted">{problem}</p>}
          {error && <p role="alert" className="text-[13px] text-alert">{error}</p>}
          {done && <p role="status" className="text-[13px] font-semibold text-leaf">{t('fasting.saved')}</p>}
          <button type="button" disabled={busy || Boolean(problem)} onClick={onSave} className="min-h-[52px] rounded-2xl bg-ink px-3 text-[15px] font-semibold text-cream disabled:opacity-50">{t('fasting.save')}</button>
          {saved && <button type="button" disabled={busy} onClick={onStop} className="min-h-[44px] self-start text-[13.5px] font-semibold text-alert underline">{t('fasting.stop')}</button>}
        </fieldset>
        {!saved && editable && !blocked && <p className="text-[12.5px] text-muted">{t('fasting.none', { name: person.display_name })}</p>}
      </div>

      <div className="flex flex-col gap-1.5 rounded-2xl bg-saffron-tint px-3.5 py-3 text-[13.5px]">
        <p className="font-semibold">{t('fasting.infoTitle', { name: person.display_name })}</p>
        <p>{t('fasting.info')}</p>
        <p className="text-ink-soft">{t('fasting.never')}</p>
      </div>
    </div>
  )
}
