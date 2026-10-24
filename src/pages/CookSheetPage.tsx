import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useAllergies, useMembers } from '../lib/queries'
import { useHistorySlots } from '../lib/plannerQueries'
import { activeMealTypes, addDays } from '../lib/planner'
import { buildCookSheet, type SheetLang, type SheetSlot } from '../lib/cookSheet'
import { EVENING_FROM, prepByDish, prepTasks, zonedParts, type PrepSlot } from '../lib/prep'
import { usePrepDone, usePrepOff, usePrepRows } from '../lib/prepQueries'
import { useDietPreferences } from '../lib/dietQueries'
import { whatsappLink } from '../lib/shopping'
import { describeError } from '../lib/errors'
import { BackHeader } from '../components/BackHeader'
import { Toggle } from '../components/ui'

const chip = (on: boolean) => `min-h-[44px] rounded-full px-4 text-[13.5px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`

/** The cook's sheet: today's or tomorrow's cooking as one message for the helper or whoever is cooking. Anyone in the home can open it. */
export default function CookSheetPage() {
  const { t, i18n } = useTranslation()
  const ui = i18n.language as 'en' | 'ta'
  const { household } = useHome()
  const { data: members } = useMembers(household.id)

  const now = useMemo(() => new Date(), [])
  const { date: today, hour } = zonedParts(now, household.timezone)
  const tomorrow = addDays(today, 1)
  const [day, setDay] = useState<'today' | 'tomorrow'>(hour >= EVENING_FROM ? 'tomorrow' : 'today')
  const [lang, setLang] = useState<SheetLang>(household.default_language)
  const [namesOn, setNamesOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const date = day === 'today' ? today : tomorrow

  const { data: slots, isLoading } = useHistorySlots(household.id, date, date)
  const memberIds = (members ?? []).map((m) => m.id)
  const { data: allergyRows } = useAllergies(memberIds)
  const { data: prefs } = useDietPreferences(household.id)
  const allergies = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const a of allergyRows ?? []) m.set(a.profile_id, [...(m.get(a.profile_id) ?? []), a.allergen])
    return m
  }, [allergyRows])

  // "Tonight": tomorrow's night-before prep that is not done yet
  const { data: prepRows } = usePrepRows()
  const { data: off } = usePrepOff(household.id)
  const prep = useMemo(() => prepByDish(prepRows ?? [], household.id, off), [prepRows, household.id, off])
  const tonightAll = useMemo(
    () => (day === 'tomorrow' ? prepTasks({ now, timeZone: household.timezone, slots: (slots ?? []) as unknown as PrepSlot[], prep, minHour: EVENING_FROM }).tonight.filter((x) => x.date === tomorrow) : []),
    [day, now, household.timezone, slots, prep, tomorrow],
  )
  const { data: done } = usePrepDone(tonightAll.map((x) => x.slotId))
  const tonight = tonightAll.filter((x) => !done?.has(x.key)).map((x) => ({ text: x.text, dish: x.dish }))

  const sheet = useMemo(
    () =>
      buildCookSheet({
        date, lang, namesOn, meals: activeMealTypes(household.snacks_enabled), slots: (slots ?? []) as unknown as SheetSlot[],
        members: (members ?? []).map((m) => ({ id: m.id, name: m.display_name, kind: m.kind === 'helper' ? 'helper' : 'family' })), allergies, tonight, prefs,
      }),
    [date, lang, namesOn, household.snacks_enabled, slots, members, allergies, tonight, prefs],
  )

  const dayWord = new Intl.DateTimeFormat(ui === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short' })
  const dayLabel = (iso: string) => dayWord.format(new Date(`${iso}T00:00:00`))

  async function onSend() {
    if (sheet.empty) return
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: sheet.text })
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) window.open(whatsappLink(sheet.text), '_blank', 'noopener')
      }
      return
    }
    window.open(whatsappLink(sheet.text), '_blank', 'noopener')
  }

  async function onCopy() {
    if (sheet.empty) return
    setError(null)
    try {
      await navigator.clipboard.writeText(sheet.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError(describeError(err, t))
    }
  }

  const back: string | number = typeof window !== 'undefined' && (window.history.state as { idx?: number } | null)?.idx ? -1 : '/today'

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5">
      <div className="print:hidden">
        <BackHeader title={t('cook.title')} subtitle={t('cook.subtitle')} to={back} />
      </div>

      <div role="radiogroup" aria-label={t('cook.title')} className="flex flex-wrap gap-2 print:hidden">
        <button type="button" role="radio" aria-checked={day === 'today'} onClick={() => setDay('today')} className={chip(day === 'today')}>{t('cook.today', { day: dayLabel(today) })}</button>
        <button type="button" role="radio" aria-checked={day === 'tomorrow'} onClick={() => setDay('tomorrow')} className={chip(day === 'tomorrow')}>{t('cook.tomorrow', { day: dayLabel(tomorrow) })}</button>
      </div>

      <div className="flex flex-col rounded-2xl border border-line bg-surface print:hidden">
        <div className="flex min-h-[56px] items-center justify-between gap-3 px-3.5">
          <span className="text-[15px]">{t('cook.language')}</span>
          <div role="radiogroup" aria-label={t('cook.language')} className="flex rounded-xl bg-sand p-1">
            {([['en', 'English'], ['ta', 'தமிழ்']] as const).map(([code, label]) => (
              <button key={code} type="button" role="radio" aria-checked={lang === code} lang={code} onClick={() => setLang(code)} className={`min-h-[44px] rounded-lg px-4 text-[14px] font-semibold ${lang === code ? 'bg-surface shadow-sm' : 'text-ink-soft'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-3.5 py-3">
          <span className="flex flex-col">
            <span className="text-[15px]">{t('cook.names')}</span>
            <span className="text-[12.5px] text-muted">{t(namesOn ? 'cook.namesHintOn' : 'cook.namesHintOff')}</span>
          </span>
          <Toggle checked={namesOn} onChange={setNamesOn} label={t('cook.names')} />
        </div>
      </div>

      <h2 className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-muted print:hidden">{t('cook.preview')}</h2>
      {isLoading ? (
        <p className="py-6 text-center text-muted print:hidden">{t('common.loading')}</p>
      ) : sheet.empty ? (
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-[14px] text-ink-soft print:hidden">{t('cook.empty', { day: t(day === 'today' ? 'cook.dayToday' : 'cook.dayTomorrow') })}</p>
      ) : (
        <div lang={lang} className="whitespace-pre-wrap rounded-2xl border border-leaf/30 bg-leaf-tint px-4 py-3.5 text-[15px] leading-relaxed print:border-0 print:bg-transparent print:px-0 print:text-[16pt] print:text-black">
          {sheet.text}
        </div>
      )}
      <p className="text-[12.5px] text-muted print:hidden">{t('cook.footnote')}</p>
      {error && <p role="alert" className="rounded-xl bg-alert-tint px-3 py-2 text-[13px] text-alert print:hidden">{error}</p>}

      <div className="sticky bottom-16 -mx-5 mt-auto flex flex-col gap-2 border-t border-line bg-cream px-5 pb-3 pt-3 print:hidden">
        <button type="button" onClick={onSend} disabled={sheet.empty} className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-ink px-4 text-[15px] font-semibold text-cream disabled:opacity-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z" /></svg>
          {t('cook.send')}
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onCopy} disabled={sheet.empty} className="min-h-[48px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface px-4 text-[14.5px] font-semibold disabled:opacity-50">{copied ? t('cook.copied') : t('cook.copy')}</button>
          <button type="button" onClick={() => window.print()} disabled={sheet.empty} className="min-h-[48px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface px-4 text-[14.5px] font-semibold disabled:opacity-50">{t('cook.print')}</button>
        </div>
      </div>
    </main>
  )
}
