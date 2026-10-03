import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useDish } from '../lib/dishQueries'
import { useRecipe } from '../lib/recipeQueries'
import { clampServings, formatQuantity, isPlural, scaleQuantity } from '../lib/recipes'
import { dishDisplayName } from '../lib/dishes'
import { FullPageMessage, Toggle } from '../components/ui'

/** Keeps the screen on while cook mode is on (where the browser supports it); released on turn-off or leaving. */
function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const request = () => {
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          if (cancelled) void l.release()
          else lock = l
        })
        .catch(() => {})
    }
    request()
    // The browser drops the lock when the tab is hidden; take it again when it comes back.
    const onVisible = () => document.visibilityState === 'visible' && request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [on])
}

export default function RecipePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const location = useLocation()
  const { dishId } = useParams<{ dishId: string }>()
  const { household } = useHome()
  const { data: dish } = useDish(dishId)
  const { data: recipe, isLoading } = useRecipe(dishId)
  const { data: members } = useMembers(household.id)

  const eatingFromCard = (location.state as { servings?: number } | null)?.servings
  const familyCount = (members ?? []).filter((m) => m.kind === 'family').length
  const [servings, setServings] = useState<number | null>(null)
  const [cookMode, setCookMode] = useState(false)
  const [done, setDone] = useState<Set<number>>(new Set())
  useWakeLock(cookMode)

  if (isLoading || !dish) {
    return (
      <FullPageMessage>
        <p className="text-muted">{t('common.loading')}</p>
      </FullPageMessage>
    )
  }

  const name = dishDisplayName(dish, dish.dish_names, lang)
  const back = (
    <button type="button" onClick={() => navigate(-1)} aria-label={t('common.back')} className="flex h-11 w-11 items-center justify-center rounded-full">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )

  if (!recipe) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-3 px-5 pb-8">
        <div className="flex items-center gap-2 pt-3">{back}<span className="font-display text-[18px] font-semibold">{name}</span></div>
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('recipe.none')}</p>
      </main>
    )
  }

  const people = servings ?? clampServings(eatingFromCard ?? (familyCount || recipe.servings))
  const text = cookMode ? 'text-[18px] leading-relaxed' : 'text-[15px]'
  const searchTerm = dish.recipe_search || name
  const own = recipe.household_id !== null
  const minutes = [
    recipe.prep_minutes ? t('recipe.prep', { count: recipe.prep_minutes }) : null,
    recipe.cook_minutes ? t('recipe.cook', { count: recipe.cook_minutes }) : null,
    own ? t('recipe.familyVersion') : t('recipe.standardVersion'),
  ]
    .filter(Boolean)
    .join(' · ')
  const note = (lang === 'ta' ? recipe.note_ta : recipe.note) ?? recipe.note

  const unitText = (unit: string, q: number | null) => {
    if (unit === 'to_taste' || unit === 'as_needed') return t(`recipe.units.${unit}`)
    return t(`recipe.units.${unit}`, { count: q !== null && isPlural(q) ? 2 : 1 })
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-3 px-5 pb-6">
      <div className="flex items-center gap-2 pt-3">
        {back}
        <div className="flex flex-col">
          <span className="font-display text-[18px] font-semibold">{t('recipe.title', { dish: name })}</span>
          <span className="text-[12px] text-muted">{minutes}</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-3.5">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold">{t('recipe.servings')}</span>
          <span className="text-[12.5px] text-muted">{t('recipe.servingsHint')}</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" aria-label={t('recipe.fewer')} onClick={() => setServings(clampServings(people - 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong text-[22px]">
            −
          </button>
          <span className="w-8 text-center font-display text-[24px] font-bold">{people}</span>
          <button type="button" aria-label={t('recipe.more')} onClick={() => setServings(clampServings(people + 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong text-[22px]">
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-white/60 p-3.5">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold">{t('recipe.cookMode')}</span>
          <span className="text-[12.5px] text-muted">{t('recipe.cookModeHint')}</span>
        </div>
        <Toggle checked={cookMode} onChange={setCookMode} label={t('recipe.cookMode')} />
      </div>

      <h2 className="pt-1 font-display text-[18px] font-semibold">{t('recipe.ingredients')}</h2>
      <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-white">
        {recipe.recipe_ingredients.map((ing) => {
          const q = ing.quantity === null ? null : scaleQuantity(ing.quantity, recipe.servings, people)
          const secondary = lang === 'ta' ? ing.name : ing.name_ta
          return (
            <div key={ing.position} className="flex items-baseline justify-between gap-3 px-4 py-3">
              <span className="flex flex-col">
                <span className={text}>{(lang === 'ta' ? ing.name_ta : ing.name) ?? ing.name}</span>
                {secondary && <span className="font-tamil text-[12px] text-muted">{secondary}</span>}
              </span>
              <span className={`shrink-0 text-right font-semibold ${text}`}>
                {q === null ? unitText(ing.unit, null) : `${formatQuantity(q, ing.unit)} ${unitText(ing.unit, q)}`.trim()}
              </span>
            </div>
          )
        })}
      </div>

      <h2 className="pt-2 font-display text-[18px] font-semibold">{t('recipe.steps', { done: done.size, total: recipe.recipe_steps.length })}</h2>
      <div className="flex flex-col gap-2">
        {recipe.recipe_steps.map((step) => {
          const on = done.has(step.position)
          return (
            <button
              key={step.position}
              type="button"
              aria-pressed={on}
              onClick={() =>
                setDone((d) => {
                  const next = new Set(d)
                  if (on) next.delete(step.position)
                  else next.add(step.position)
                  return next
                })
              }
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left ${on ? 'border-line bg-sand' : 'border-line bg-white'}`}
            >
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${on ? 'bg-leaf text-white' : 'bg-sand'}`}>
                {on ? '✓' : step.position}
              </span>
              <span className={`${text} ${on ? 'text-ink-soft' : ''}`}>{(lang === 'ta' ? step.body_ta : step.body) ?? step.body}</span>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl bg-sand p-3.5 text-[13px] leading-relaxed text-ink-soft">
        {note && <p>{note}</p>}
        <p className={note ? 'pt-1.5' : ''}>{recipe.credit}</p>
        <p className="pt-1.5">{t('recipe.checkIngredients')}</p>
      </div>

      <div className="sticky bottom-16 -mx-5 flex gap-2.5 border-t border-line bg-cream px-5 pb-3 pt-3">
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm + ' recipe')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 flex-1 items-center justify-center rounded-2xl border-[1.5px] border-line-strong bg-white text-[15px] font-semibold"
        >
          {t('recipe.watch')}
        </a>
      </div>
    </main>
  )
}
