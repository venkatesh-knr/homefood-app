import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useWeekPlan, useWeekSlots, type SlotWithDetails } from '../lib/plannerQueries'
import { activeMealTypes, greetingPeriod, nextMealType, toISODate, weekDates, weekStartOf, type MealType } from '../lib/planner'
import { DishThumb } from '../components/DishRow'
import { useDishPhotoPath } from '../lib/dishPhotos'
import { Pill } from '../components/ui'

const now = new Date()
const today = toISODate(now)
const weekStart = toISODate(weekStartOf(now))

export default function TodayPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { profile, household } = useHome()

  const { data: weekPlan } = useWeekPlan(household.id, weekStart)
  const { data: slots } = useWeekSlots(weekPlan?.id)
  const todaySlots = (slots ?? []).filter((s) => s.date === today)

  const mealTypes = activeMealTypes(household.snacks_enabled)
  const nextUp = nextMealType(now, mealTypes)
  const restOfDay = mealTypes.filter((m) => m !== nextUp)
  const nextSlot = todaySlots.find((s) => s.meal === nextUp)

  const dateLabel = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'short' }).format(now)
  const totalPossible = weekDates(weekStart).length * mealTypes.length
  const totalPlanned = slots?.length ?? 0

  return (
    <main className="flex flex-col gap-3 px-5 pb-8">
      <div>
        <p className="text-[13px] text-muted">{dateLabel}</p>
        <h1 className="font-display text-[22px] font-bold">{t(`today.greeting${capitalize(greetingPeriod(now))}`, { name: profile.display_name })}</h1>
      </div>

      <NextUpCard meal={nextUp} slot={nextSlot} lang={lang} onClick={() => navigate(`/week/${today}/${nextUp}`)} />

      {restOfDay.length > 0 && (
        <>
          <span className="pt-1 font-display text-[16px] font-semibold">{t('today.restOfToday')}</span>
          <div className="flex flex-col gap-2.5">
            {restOfDay.map((meal) => (
              <RestCard key={meal} meal={meal} slot={todaySlots.find((s) => s.meal === meal)} lang={lang} onClick={() => navigate(`/week/${today}/${meal}`)} />
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => navigate('/week/glance')}
        className="mt-2 flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 text-left text-cream"
      >
        <span className="flex flex-col gap-0.5">
          <span className="font-display text-[15px] font-semibold">{t('today.glanceTitle')}</span>
          <span className="text-[12.5px] text-line">{t('planner.mealsPlanned', { done: totalPlanned, total: totalPossible })}</span>
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </main>
  )
}

function capitalize(s: string) {
  return s[0]!.toUpperCase() + s.slice(1)
}

function mealDishNames(slot: SlotWithDetails | undefined, lang: 'en' | 'ta') {
  if (!slot?.main_dish) return null
  const name = slot.main_dish.dish_names.find((n) => n.language === lang)?.name ?? slot.main_dish.name
  const sides = slot.meal_slot_sides
    .sort((a, b) => a.position - b.position)
    .map((s) => s.dish.dish_names.find((n) => n.language === lang)?.name ?? s.dish.name)
  return { name, sides, dish: slot.main_dish }
}

function NextUpCard({ meal, slot, lang, onClick }: { meal: MealType; slot: SlotWithDetails | undefined; lang: 'en' | 'ta'; onClick: () => void }) {
  const { t } = useTranslation()
  const bandColor = { breakfast: '#F2B705', lunch: '#2F7A3E', snacks: '#E8742A', dinner: '#3B4A9C' }[meal]
  const dish = mealDishNames(slot, lang)
  const photoFor = useDishPhotoPath()

  return (
    <button type="button" onClick={onClick} className="flex flex-col gap-3.5 rounded-[22px] border-2 border-saffron bg-white p-4.5 text-left">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-saffron-ink">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: bandColor }} />
          {t('today.nextUp', { meal: t(`meal.${meal}`) })}
        </span>
        {slot && <Pill>{t(`planner.source.${slot.source === 'home' ? 'home' : slot.source === 'dine_out' ? 'dineOut' : 'orderIn'}`)}</Pill>}
      </div>
      {dish ? (
        <div className="flex items-center gap-4">
          <DishThumb name={dish.name} tone={meal.length} photoPath={photoFor(dish.dish)} size={76} ring={bandColor} />
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-[19px] font-semibold">{dish.name}</span>
            {dish.sides.length > 0 && <span className="text-[13.5px] text-ink-soft">+ {dish.sides.join(', ')}</span>}
          </div>
        </div>
      ) : slot && slot.source !== 'home' ? (
        <span className="text-[17px] font-semibold">{slot.place_name || t(`planner.source.${slot.source === 'dine_out' ? 'dineOut' : 'orderIn'}`)}</span>
      ) : (
        <span className="text-[15px] text-muted">{t('today.nothingNextUp')}</span>
      )}
    </button>
  )
}

function RestCard({ meal, slot, lang, onClick }: { meal: MealType; slot: SlotWithDetails | undefined; lang: 'en' | 'ta'; onClick: () => void }) {
  const { t } = useTranslation()
  const bandColor = { breakfast: '#F2B705', lunch: '#2F7A3E', snacks: '#E8742A', dinner: '#3B4A9C' }[meal]
  const dish = mealDishNames(slot, lang)
  const photoFor = useDishPhotoPath()

  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left">
      {dish ? (
        <DishThumb name={dish.name} tone={meal.length + 1} photoPath={photoFor(dish.dish)} size={52} ring={bandColor} />
      ) : (
        <span className="h-[52px] w-[52px] shrink-0 rounded-full" style={{ background: '#F6EFE3' }} />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted">{t(`meal.${meal}`)}</span>
        {dish ? (
          <>
            <span className="truncate text-[15.5px] font-semibold">{dish.name}</span>
            {dish.sides.length > 0 && <span className="truncate text-[12.5px] text-muted">+ {dish.sides.join(', ')}</span>}
          </>
        ) : slot && slot.source !== 'home' ? (
          <span className="text-[15.5px] font-semibold">{slot.place_name || t(`planner.source.${slot.source === 'dine_out' ? 'dineOut' : 'orderIn'}`)}</span>
        ) : (
          <span className="text-[13.5px] text-muted">{t('today.nothingPlanned', { meal: t(`meal.${meal}`) })}</span>
        )}
      </span>
    </button>
  )
}
