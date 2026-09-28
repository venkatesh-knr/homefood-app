import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useAllergies, useMembers } from '../lib/queries'
import { usePlannerTurns, useWeekPlan, useWeekSlots, type SlotWithDetails } from '../lib/plannerQueries'
import { copyDay, copyWeek, getOrCreateWeekPlan, publishWeek } from '../lib/plannerMutations'
import {
  activeMealTypes,
  addDays,
  dayOfMonth,
  toISODate,
  turnCoversDate,
  weekDates,
  weekStartOf,
  weekdayLetter,
  type MealType,
} from '../lib/planner'
import { avatarColor } from '../lib/people'
import { Button, Pill } from '../components/ui'
import { DishThumb } from '../components/DishRow'

const today = toISODate(new Date())
const defaultWeekStart = toISODate(weekStartOf(new Date()))

export default function WeekPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { profile, household } = useHome()
  const isAdmin = profile.role === 'admin'

  const [weekStart, setWeekStart] = useState(defaultWeekStart)
  const [selectedDate, setSelectedDate] = useState(today >= weekStart && today <= addDays(weekStart, 6) ? today : weekStart)

  const { data: weekPlan } = useWeekPlan(household.id, weekStart)
  const { data: slots } = useWeekSlots(weekPlan?.id)
  const { data: turns } = usePlannerTurns(household.id)
  const { data: members } = useMembers(household.id)
  const memberIds = useMemo(() => (members ?? []).map((m) => m.id), [members])
  const { data: allergyRows } = useAllergies(memberIds)
  const householdAllergens = useMemo(() => [...new Set((allergyRows ?? []).map((a) => a.allergen))], [allergyRows])
  const memberById = useMemo(() => new Map((members ?? []).map((m, i) => [m.id, { ...m, color: avatarColor(i, m.kind) }])), [members])

  const [busy, setBusy] = useState<'copy-day' | 'copy-week' | 'publish' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const mealTypes = activeMealTypes(household.snacks_enabled)
  const dates = weekDates(weekStart)
  const slotsByDate = useMemo(() => {
    const map = new Map<string, SlotWithDetails[]>()
    for (const d of dates) map.set(d, [])
    for (const s of slots ?? []) map.get(s.date)?.push(s)
    return map
  }, [slots, dates])

  const canPlanSelected = isAdmin || (turns ?? []).some((tn) => tn.profile_id === profile.id && turnCoversDate(tn, selectedDate))
  const canPlanWeek = isAdmin || dates.some((d) => (turns ?? []).some((tn) => tn.profile_id === profile.id && turnCoversDate(tn, d)))

  const totalPossible = dates.length * mealTypes.length
  const totalPlanned = slots?.length ?? 0

  async function onCopyDay() {
    setBusy('copy-day')
    setMessage(null)
    try {
      const n = await copyDay(household.id, addDays(selectedDate, -7), selectedDate)
      setMessage(n > 0 ? t('planner.copiedCount', { count: n }) : t('planner.nothingToCopy'))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(null)
    }
  }

  async function onCopyWeek() {
    setBusy('copy-week')
    setMessage(null)
    try {
      const n = await copyWeek(household.id, addDays(weekStart, -7), weekStart)
      setMessage(n > 0 ? t('planner.copiedCount', { count: n }) : t('planner.nothingToCopy'))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(null)
    }
  }

  async function onPublish() {
    setBusy('publish')
    setMessage(null)
    try {
      const id = weekPlan?.id ?? (await getOrCreateWeekPlan(household.id, weekStart))
      await publishWeek(id, household.id)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(null)
    }
  }

  const dayFormatter = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
  const selectedLabel = dayFormatter.format(new Date(`${selectedDate}T00:00:00`))
  const weekRangeFormatter = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' })

  function changeWeek(delta: number) {
    const nextStart = addDays(weekStart, delta)
    setWeekStart(nextStart)
    setSelectedDate(nextStart)
    setMessage(null)
  }

  return (
    <main className="flex flex-col gap-3 px-5 pb-8">
      <div>
        <h1 className="font-display text-[22px] font-bold">{t('planner.title')}</h1>
        <p className="text-[13px] text-muted">
          {weekPlan?.status === 'published' ? t('planner.statusPublished', { date: weekPlan.published_at?.slice(0, 10) }) : t('planner.statusDraft')}
        </p>
      </div>

      {canPlanSelected && (
        <div className="flex items-center gap-2 rounded-2xl bg-leaf-tint px-3.5 py-2.5 text-[13.5px] text-leaf">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10" />
          </svg>
          <span className="font-semibold">{t('planner.yourTurn')}</span>
          <button type="button" onClick={() => navigate('/week/rota')} className="ml-auto text-[13px] font-semibold underline">
            {t('planner.rota')}
          </button>
        </div>
      )}
      {!canPlanSelected && (
        <button type="button" onClick={() => navigate('/week/rota')} className="self-start text-[13px] font-semibold text-saffron-ink underline">
          {t('planner.rota')}
        </button>
      )}

      <div className="flex items-center justify-between px-1">
        <button type="button" onClick={() => changeWeek(-7)} aria-label={t('common.back')} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-[13px] font-semibold text-ink-soft">
          {weekRangeFormatter.formatRange(new Date(`${weekStart}T00:00:00`), new Date(`${addDays(weekStart, 6)}T00:00:00`))}
        </span>
        <button type="button" onClick={() => changeWeek(7)} aria-label={t('common.back')} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {dates.map((d) => {
          const on = d === selectedDate
          const planned = (slotsByDate.get(d)?.length ?? 0) + '/' + mealTypes.length
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`flex h-[62px] flex-col items-center justify-center gap-0.5 rounded-2xl ${on ? 'border-2 border-saffron bg-saffron text-ink' : 'border border-line bg-white text-ink'}`}
            >
              <span className={`text-[10.5px] ${on ? 'text-ink' : 'text-muted'}`}>{weekdayLetter(d)}</span>
              <span className="font-display text-[15px] font-semibold">{dayOfMonth(d)}</span>
              <span className={`text-[10px] ${on ? 'text-ink' : 'text-muted'}`}>{planned}</span>
            </button>
          )
        })}
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="font-display text-[17px] font-semibold">{selectedLabel}</span>
        {canPlanSelected && (
          <button type="button" onClick={onCopyDay} disabled={busy !== null} className="text-[13px] font-semibold text-saffron-ink">
            {busy === 'copy-day' ? t('planner.copying') : t('planner.copyLastDay', { day: weekdayLetter(selectedDate) })}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {mealTypes.map((meal) => {
          const slot = slotsByDate.get(selectedDate)?.find((s) => s.meal === meal)
          return (
            <MealCard
              key={meal}
              meal={meal}
              slot={slot}
              lang={lang}
              householdAllergens={householdAllergens}
              memberById={memberById}
              onClick={() => navigate(`/week/${selectedDate}/${meal}`)}
            />
          )
        })}
      </div>

      {message && <p className="rounded-xl bg-sand px-4 py-3 text-center text-[13.5px] text-ink-soft">{message}</p>}

      {canPlanWeek && (
        <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
          <div className="flex gap-2.5">
            <Button variant="secondary" className="flex-1" disabled={busy !== null} onClick={onCopyWeek}>
              {busy === 'copy-week' ? t('planner.copying') : t('planner.copyLastWeek')}
            </Button>
            <Button className="flex-1" disabled={busy !== null || weekPlan?.status === 'published'} onClick={onPublish}>
              {busy === 'publish' ? t('planner.publishing') : t('planner.publishWeek')}
            </Button>
          </div>
          <p className="text-center text-[12px] text-muted">{t('planner.mealsPlanned', { done: totalPlanned, total: totalPossible })}</p>
        </div>
      )}
    </main>
  )
}

function MealCard({
  meal,
  slot,
  lang,
  householdAllergens,
  memberById,
  onClick,
}: {
  meal: MealType
  slot: SlotWithDetails | undefined
  lang: 'en' | 'ta'
  householdAllergens: string[]
  memberById: Map<string, { display_name: string; color: string }>
  onClick: () => void
}) {
  const { t } = useTranslation()
  const bandColor = { breakfast: '#F2B705', lunch: '#2F7A3E', snacks: '#E8742A', dinner: '#3B4A9C' }[meal]

  if (!slot) {
    return (
      <button type="button" onClick={onClick} className="flex flex-col gap-2 rounded-2xl border border-dashed border-line-strong bg-white p-3.5 text-left">
        <MealLabel meal={meal} bandColor={bandColor} />
        <span className="text-[14px] text-muted">{t('planner.emptySlot')}</span>
      </button>
    )
  }

  const mainName = slot.main_dish ? (slot.main_dish.dish_names.find((n) => n.language === lang)?.name ?? slot.main_dish.name) : null
  const sideNames = slot.meal_slot_sides
    .sort((a, b) => a.position - b.position)
    .map((s) => s.dish.dish_names.find((n) => n.language === lang)?.name ?? s.dish.name)
  const allergens = [...(slot.main_dish?.allergens ?? []), ...slot.meal_slot_sides.flatMap((s) => s.dish.allergens)]
  const conflicts = [...new Set(allergens.filter((a) => householdAllergens.includes(a)))]
  const cooks = slot.meal_slot_cooks.map((c) => memberById.get(c.profile_id)).filter((m): m is NonNullable<typeof m> => Boolean(m))

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5">
      <div className="flex items-center justify-between">
        <MealLabel meal={meal} bandColor={bandColor} />
        <Pill>{t(`planner.source.${slot.source === 'home' ? 'home' : slot.source === 'dine_out' ? 'dineOut' : 'orderIn'}`)}</Pill>
      </div>
      <button type="button" onClick={onClick} className="flex items-center gap-3 text-left">
        {slot.source === 'home' && mainName ? (
          <>
            <DishThumb name={mainName} tone={meal.length} photoPath={null} size={48} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[15px] font-semibold">{mainName}</span>
              {sideNames.length > 0 && <span className="truncate text-[13px] text-muted">+ {sideNames.join(', ')}</span>}
            </span>
          </>
        ) : (
          <span className="flex-1 text-[15px] font-semibold">{slot.place_name || t('planner.emptySlot')}</span>
        )}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A8C80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      {conflicts.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-alert-tint px-2.5 py-2 text-[12.5px] text-alert">
          <span>{t('dishes.rowAllergyNote', { list: conflicts.join(', ') })}</span>
        </div>
      )}
      {cooks.length > 0 && (
        <div className="flex items-center gap-2 border-t border-line pt-2.5 text-[12.5px] text-ink-soft">
          <span className="flex">
            {cooks.map((c, i) => (
              <span
                key={i}
                className="-mr-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10.5px] font-semibold text-white"
                style={{ background: c.color }}
              >
                {c.display_name.trim()[0]?.toUpperCase()}
              </span>
            ))}
          </span>
          <span>{cooks.map((c) => c.display_name).join(' + ')}</span>
        </div>
      )}
    </div>
  )
}

function MealLabel({ meal, bandColor }: { meal: MealType; bandColor: string }) {
  const { t } = useTranslation()
  return (
    <span className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: bandColor }} />
      {t(`meal.${meal}`)}
    </span>
  )
}
