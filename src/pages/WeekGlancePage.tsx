import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { useHome } from '../lib/homeContext'
import { useWeekPlan, useWeekSlots, type SlotWithDetails } from '../lib/plannerQueries'
import { activeMealTypes, addDays, dayOfMonth, toISODate, weekDates, weekStartOf, weekdayLetter, type MealType } from '../lib/planner'
import { dishTone } from '../lib/dishes'
import { usePosterOpened } from '../lib/onboarding'

const MEAL_BAND: Record<MealType, string> = { breakfast: '#F2B705', lunch: '#2F7A3E', snacks: '#E8742A', dinner: '#3B4A9C' }
const today = toISODate(new Date())

function dishOf(slot: SlotWithDetails | undefined, lang: 'en' | 'ta') {
  if (!slot?.main_dish) return null
  const name = slot.main_dish.dish_names.find((n) => n.language === lang)?.name ?? slot.main_dish.name
  const sides = slot.meal_slot_sides
    .sort((a, b) => a.position - b.position)
    .map((s) => s.dish.dish_names.find((n) => n.language === lang)?.name ?? s.dish.name)
  return { name, sides }
}

export default function WeekGlancePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { household } = useHome()

  const [weekStart, setWeekStart] = useState(toISODate(weekStartOf(new Date())))
  const { data: weekPlan } = useWeekPlan(household.id, weekStart)
  const { data: slots } = useWeekSlots(weekPlan?.id)

  const mealTypes = activeMealTypes(household.snacks_enabled)
  const dates = weekDates(weekStart)
  const slotsByDate = useMemo(() => {
    const map = new Map<string, SlotWithDetails[]>()
    for (const d of dates) map.set(d, [])
    for (const s of slots ?? []) map.get(s.date)?.push(s)
    return map
  }, [slots, dates])

  const posterRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<'save' | 'share' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [, markPosterOpened] = usePosterOpened(household.id)
  useEffect(() => {
    markPosterOpened()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dayFmt = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  const rangeFmt = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' })
  const rangeLabel = `${rangeFmt.format(new Date(`${weekStart}T00:00:00`))} – ${rangeFmt.format(new Date(`${addDays(weekStart, 6)}T00:00:00`))}`

  async function poster(): Promise<Blob | null> {
    if (!posterRef.current) return null
    const dataUrl = await toPng(posterRef.current, { backgroundColor: '#FFF8EE', pixelRatio: 2 })
    const res = await fetch(dataUrl)
    return res.blob()
  }

  async function onSave() {
    setBusy('save')
    setMessage(null)
    try {
      const blob = await poster()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `homefood-${weekStart}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setMessage(t('common.error'))
    } finally {
      setBusy(null)
    }
  }

  async function onShare() {
    setBusy('share')
    setMessage(null)
    try {
      const blob = await poster()
      if (!blob) return
      const file = new File([blob], `homefood-${weekStart}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: t('glance.shareText', { home: household.name, range: rangeLabel }) })
      } else {
        setMessage(t('glance.shareUnavailable'))
      }
    } catch {
      /* the user cancelled the share sheet — nothing to do */
    } finally {
      setBusy(null)
    }
  }

  // AppShell centres every tab in a max-w-md column for the mobile-first pages; this one needs
  // real width on tablet/laptop (design/mockups/png/Main.png), so it breaks out of that
  // constraint with the standard full-bleed trick instead of narrowing the grid.
  return (
    <main className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-5 pb-8 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col">
      <div className="flex items-center justify-between pt-3 print:hidden">
        <button type="button" onClick={() => navigate(-1)} aria-label={t('common.back')} className="flex h-11 w-11 items-center justify-center rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="font-display text-[17px] font-semibold md:hidden">{t('glance.title')}</span>
        <button type="button" onClick={onShare} disabled={busy !== null} aria-label={t('glance.share')} className="flex h-11 w-11 items-center justify-center rounded-full md:hidden">
          <ShareIcon />
        </button>
        <div className="hidden gap-2.5 md:flex">
          <button type="button" onClick={onSave} disabled={busy !== null} className="flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-[15px] font-semibold text-cream">
            {busy === 'save' ? t('glance.saving') : t('glance.saveImage')}
          </button>
          <button type="button" onClick={() => window.print()} className="flex h-11 items-center gap-2 rounded-xl border-[1.5px] border-line-strong bg-white px-4 text-[15px]">
            {t('glance.print')}
          </button>
          <button type="button" onClick={onShare} disabled={busy !== null} className="flex h-11 items-center gap-2 rounded-xl border-[1.5px] border-line-strong bg-white px-4 text-[15px]">
            <ShareIcon /> {t('glance.share')}
          </button>
        </div>
      </div>

      <div ref={posterRef} className="flex flex-col gap-4 bg-cream py-3">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-semibold text-saffron-ink">{household.name}</span>
            <h1 className="font-display text-[26px] font-bold md:text-[36px]">{t('glance.title')}</h1>
            <div className="flex items-center gap-2 text-[13px] text-muted">
              <button type="button" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label={t('common.previousWeek')} className="flex h-9 w-9 items-center justify-center rounded-full border border-line print:hidden">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span>
                {rangeLabel} · {weekPlan?.status === 'published' ? t('planner.statusPublished', { date: weekPlan.published_at?.slice(0, 10) }) : t('planner.statusDraft')}
              </span>
              <button type="button" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label={t('common.nextWeek')} className="flex h-9 w-9 items-center justify-center rounded-full border border-line print:hidden">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:gap-2.5" style={{ gridTemplateColumns: '140px repeat(7, minmax(0, 1fr))' }}>
          <div />
          {dates.map((d) => (
            <div key={d} className={`flex min-h-[84px] flex-col items-center justify-end gap-0.5 rounded-2xl p-2.5 ${d === today ? 'bg-saffron-tint' : 'bg-white'}`}>
              {d === today && <span className="mb-1 rounded-full bg-saffron px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">{t('glance.today')}</span>}
              <span className="font-display text-[16px] font-semibold">{dayFmt.format(new Date(`${d}T00:00:00`)).split(',')[0]}</span>
              <span className="text-[12px] text-muted">{dayOfMonth(d)}</span>
            </div>
          ))}
          {mealTypes.map((meal) => (
            <GridMealRow key={meal} meal={meal} dates={dates} slotsByDate={slotsByDate} lang={lang} onPick={(d) => navigate(`/week/${d}/${meal}`)} />
          ))}
        </div>

        {/* Mobile layout */}
        <div className="flex flex-col gap-4 md:hidden">
          <div className="grid grid-cols-7 gap-1.5">
            {dates.map((d) => (
              <div
                key={d}
                className={`flex h-[58px] flex-col items-center justify-center gap-0.5 rounded-2xl ${d === today ? 'border-2 border-saffron bg-saffron text-ink' : 'border border-line bg-white'}`}
              >
                <span className="text-[10.5px] text-muted">{weekdayLetter(d)}</span>
                <span className="font-display text-[15px] font-semibold">{dayOfMonth(d)}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-[11.5px] text-ink-soft">
            {mealTypes.map((m) => (
              <span key={m} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: MEAL_BAND[m] }} />
                {t(`meal.${m}`)}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-1 rounded-[20px] border-2 border-saffron bg-white p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-saffron-ink">{t('glance.today')}</span>
            <span className="pb-1 font-display text-[17px] font-semibold">{dayFmt.format(new Date(`${today}T00:00:00`))}</span>
            {mealTypes.map((meal) => (
              <TodayRow key={meal} meal={meal} slot={slotsByDate.get(today)?.find((s) => s.meal === meal)} lang={lang} onClick={() => navigate(`/week/${today}/${meal}`)} />
            ))}
          </div>

          <span className="pt-1 font-display text-[16px] font-semibold">{t('glance.comingUp')}</span>
          <div className="flex flex-col gap-2.5">
            {dates
              .filter((d) => d !== today)
              .map((d) => (
                <div key={d} className="grid grid-cols-[52px_repeat(4,minmax(0,1fr))] items-start gap-1.5 rounded-2xl border border-line bg-white p-2.5">
                  <div className="flex flex-col gap-0.5 pt-2">
                    <span className="font-display text-[14px] font-semibold">{dayFmt.format(new Date(`${d}T00:00:00`)).split(',')[0]}</span>
                    <span className="text-[11px] text-muted">{dayOfMonth(d)}</span>
                  </div>
                  {mealTypes.map((meal) => (
                    <MiniCell key={meal} meal={meal} slot={slotsByDate.get(d)?.find((s) => s.meal === meal)} lang={lang} onClick={() => navigate(`/week/${d}/${meal}`)} />
                  ))}
                </div>
              ))}
          </div>
        </div>

        <p className="pt-2 text-center text-[12px] text-muted">
          {t('glance.plannedTogether', { app: t('app.name') })} · {t('glance.dishesOnly')}
        </p>
      </div>

      {message && <p className="mt-3 rounded-xl bg-sand px-4 py-3 text-center text-[13.5px] text-ink-soft print:hidden">{message}</p>}

      <div className="mt-4 flex gap-2.5 pb-4 md:hidden print:hidden">
        <button type="button" onClick={onSave} disabled={busy !== null} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-ink text-[15px] font-semibold text-cream">
          {busy === 'save' ? t('glance.saving') : t('glance.saveImage')}
        </button>
        <button type="button" onClick={() => window.print()} className="flex h-12 items-center gap-2 rounded-2xl border-[1.5px] border-line-strong bg-white px-4 text-[15px]">
          {t('glance.print')}
        </button>
      </div>
      </div>
    </main>
  )
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  )
}

function GridMealRow({
  meal,
  dates,
  slotsByDate,
  lang,
  onPick,
}: {
  meal: MealType
  dates: string[]
  slotsByDate: Map<string, SlotWithDetails[]>
  lang: 'en' | 'ta'
  onPick: (date: string) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex min-h-[150px] flex-col justify-center gap-1 rounded-2xl p-3.5 text-white" style={{ background: MEAL_BAND[meal] }}>
        <span className="font-display text-[16px] font-semibold">{t(`meal.${meal}`)}</span>
      </div>
      {dates.map((d) => {
        const slot = slotsByDate.get(d)?.find((s) => s.meal === meal)
        const dish = dishOf(slot, lang)
        const { background, ink } = dishTone(meal.length)
        return (
          <button
            key={d}
            type="button"
            onClick={() => onPick(d)}
            className="flex min-h-[150px] flex-col items-center justify-start gap-1.5 rounded-2xl border border-line bg-white p-2.5 text-center"
          >
            {dish ? (
              <>
                <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full font-display text-[20px] font-semibold" style={{ background, color: ink }}>
                  {dish.name.trim()[0]?.toUpperCase()}
                </span>
                <span className="text-[13.5px] font-semibold leading-tight">{dish.name}</span>
                {dish.sides.length > 0 && <span className="text-[11.5px] leading-tight text-muted">+ {dish.sides.join(', ')}</span>}
              </>
            ) : slot && slot.source !== 'home' ? (
              <>
                <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full border-[1.5px] border-dashed border-saffron-ink/60" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-saffron-ink">{t(`planner.source.${slot.source === 'dine_out' ? 'dineOut' : 'orderIn'}`)}</span>
                <span className="text-[13.5px] font-semibold leading-tight">{slot.place_name}</span>
              </>
            ) : (
              <span className="pt-8 text-[13px] text-muted">{meal === 'snacks' ? t('glance.noSnacksPlanned') : t('glance.notPlanned')}</span>
            )}
          </button>
        )
      })}
    </>
  )
}

function TodayRow({ meal, slot, lang, onClick }: { meal: MealType; slot: SlotWithDetails | undefined; lang: 'en' | 'ta'; onClick: () => void }) {
  const { t } = useTranslation()
  const dish = dishOf(slot, lang)
  const { background, ink } = dishTone(meal.length)
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3.5 border-t border-line py-3 text-left first:border-t-0">
      {dish ? (
        <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full font-display text-[19px] font-semibold" style={{ background, color: ink, boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${MEAL_BAND[meal]}` }}>
          {dish.name.trim()[0]?.toUpperCase()}
        </span>
      ) : (
        <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-saffron-ink/60" />
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t(`meal.${meal}`)}</span>
        {dish ? (
          <>
            <span className="text-[15.5px] font-semibold leading-tight">{dish.name}</span>
            {dish.sides.length > 0 && <span className="text-[12.5px] text-muted">+ {dish.sides.join(', ')}</span>}
          </>
        ) : slot && slot.source !== 'home' ? (
          <span className="text-[15.5px] font-semibold">{slot.place_name || t(`planner.source.${slot.source === 'dine_out' ? 'dineOut' : 'orderIn'}`)}</span>
        ) : (
          <span className="text-[13px] text-muted">{t('glance.notPlanned')}</span>
        )}
      </span>
    </button>
  )
}

function MiniCell({ meal, slot, lang, onClick }: { meal: MealType; slot: SlotWithDetails | undefined; lang: 'en' | 'ta'; onClick: () => void }) {
  const dish = dishOf(slot, lang)
  const { background, ink } = dishTone(meal.length)
  const label = dish ? (dish.name.length > 14 ? dish.name.split(' ').slice(0, 2).join(' ') : dish.name) : slot?.place_name || ''
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1 text-center">
      {dish ? (
        <span className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold" style={{ background, color: ink, boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${MEAL_BAND[meal]}` }}>
          {dish.name.trim()[0]?.toUpperCase()}
        </span>
      ) : (
        <span className="h-10 w-10 rounded-full bg-sand" />
      )}
      <span className="text-[11px] leading-tight">{label}</span>
    </button>
  )
}
