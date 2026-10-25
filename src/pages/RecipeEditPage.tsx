import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useDish } from '../lib/dishQueries'
import { fetchRecipe, useRecipe, useRecipeDishIds } from '../lib/recipeQueries'
import { useDishes } from '../lib/dishQueries'
import { CopyFromDish } from '../components/CopyFromDish'
import { dishDisplayName } from '../lib/dishes'
import { clampServings, MAX_SERVINGS } from '../lib/recipes'
import { draftFromRecipe, emptyIngredient, emptyStep, moveItem, RECIPE_UNITS, UNMEASURED, validateDraft, type RecipeDraft } from '../lib/recipeEdit'
import { resetHouseholdRecipe, saveHouseholdRecipe } from '../lib/recipeMutations'
import { describeError } from '../lib/errors'
import { FullPageMessage } from '../components/ui'
import { BackHeader } from '../components/BackHeader'

const input = 'min-h-[48px] w-full rounded-xl border border-line-strong bg-surface px-3 text-[16px] aria-[invalid=true]:border-alert'

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-soft disabled:opacity-30">
      {children}
    </button>
  )
}
const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

/** "Edit our version" (Admin): this home's own copy of a recipe. The standard recipe is never changed; "Back to the original" removes the copy. */
export default function RecipeEditPage() {
  const { dishId } = useParams<{ dishId: string }>()
  const { profile } = useHome()
  const { data: dish } = useDish(dishId)
  const { data: recipe, isLoading } = useRecipe(dishId)

  if (profile.role !== 'admin') return <OnlyAdmin />
  if (isLoading || !dish) return <Loading />
  // key: start the form again if the recipe underneath it changes (for example after "Back to the original")
  return <Editor key={recipe?.id ?? 'new'} dishId={dishId!} dishName={dishDisplayName(dish, dish.dish_names, 'en')} dishNameTa={dishDisplayName(dish, dish.dish_names, 'ta')} recipe={recipe ?? null} />
}

function Loading() {
  const { t } = useTranslation()
  return (
    <FullPageMessage>
      <p className="text-muted">{t('common.loading')}</p>
    </FullPageMessage>
  )
}

function OnlyAdmin() {
  const { t } = useTranslation()
  return (
    <FullPageMessage>
      <p className="text-muted">{t('recipeEdit.onlyAdmin')}</p>
    </FullPageMessage>
  )
}

function Editor({ dishId, dishName, dishNameTa, recipe }: { dishId: string; dishName: string; dishNameTa: string; recipe: ReturnType<typeof useRecipe>['data'] }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { household } = useHome()
  const { data: members } = useMembers(household.id)
  const familyCount = (members ?? []).filter((m) => m.kind === 'family').length
  const own = Boolean(recipe && recipe.household_id !== null)

  const [draft, setDraft] = useState<RecipeDraft>(() => draftFromRecipe(recipe, familyCount || 4))
  const [tried, setTried] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [copyNote, setCopyNote] = useState<string | null>(null)
  const { data: allDishes } = useDishes(household.id)
  const { data: recipeIds } = useRecipeDishIds()
  // only dishes that have a recipe can be copied from
  const noRecipe = (allDishes ?? []).filter((d) => !recipeIds?.has(d.id)).map((d) => d.id)
  async function copyRecipeFrom(d: { id: string; name: string; dish_names: { language: 'en' | 'ta'; name: string }[] }) {
    const label = dishDisplayName(d, d.dish_names, lang)
    try {
      const r = await fetchRecipe(d.id)
      if (!r) return setCopyNote(t('recipeEdit.copyNone', { dish: label }))
      setDraft(draftFromRecipe(r, familyCount || 4))
      setTried(false)
      setCopyNote(t('recipeEdit.copied', { dish: label }))
    } catch (err) {
      setError(describeError(err, t))
    }
  }
  const problems = validateDraft(draft)
  const name = lang === 'ta' ? dishNameTa : dishName

  const set = (patch: Partial<RecipeDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const setIngredient = (key: string, patch: Partial<RecipeDraft['ingredients'][number]>) => set({ ingredients: draft.ingredients.map((i) => (i.key === key ? { ...i, ...patch } : i)) })
  const setStep = (key: string, patch: Partial<RecipeDraft['steps'][number]>) => set({ steps: draft.steps.map((s) => (s.key === key ? { ...s, ...patch } : s)) })
  const unitText = (u: string) => (UNMEASURED.some((x) => x === u) ? t(`recipe.units.${u}`) : t(`recipe.units.${u}`, { count: 1 }))

  async function onSave() {
    setTried(true)
    if (problems.any) return
    setBusy(true)
    setError(null)
    try {
      await saveHouseholdRecipe(dishId, draft)
      navigate(`/dishes/${dishId}/recipe`, { replace: true })
    } catch (err) {
      setError(describeError(err, t))
      setBusy(false)
    }
  }

  async function onReset() {
    setBusy(true)
    setError(null)
    try {
      await resetHouseholdRecipe(household.id, dishId)
      navigate(`/dishes/${dishId}/recipe`, { replace: true })
    } catch (err) {
      setError(describeError(err, t))
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-3 px-5 pb-6">
      <BackHeader title={recipe ? t('recipeEdit.title') : t('recipeEdit.titleNew')} subtitle={name} to={`/dishes/${dishId}/recipe`} />
      <p className="rounded-2xl bg-sand px-3.5 py-3 text-[13px] leading-relaxed text-ink-soft">{own ? t('recipeEdit.introOwn') : t('recipeEdit.intro')}</p>
      {!recipe && (
        <>
          <CopyFromDish label={t('recipeEdit.copyButton')} title={t('recipeEdit.copyTitle')} excludeIds={noRecipe.concat(dishId)} onPicked={copyRecipeFrom} />
          {copyNote && <p role="status" className="rounded-xl bg-saffron-tint px-3 py-2 text-[13px] text-saffron-ink">{copyNote}</p>}
        </>
      )}

      <section className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-3.5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="re-servings" className="text-[15px] font-semibold">
            {t('recipeEdit.servings')}
          </label>
          <div className="flex items-center gap-2">
            <IconButton label={t('recipe.fewer')} disabled={draft.servings <= 1} onClick={() => set({ servings: clampServings(draft.servings - 1) })}>
              <span className="text-[22px]">−</span>
            </IconButton>
            <span id="re-servings" className="w-8 text-center font-display text-[22px] font-bold" aria-live="polite">
              {draft.servings}
            </span>
            <IconButton label={t('recipe.more')} disabled={draft.servings >= MAX_SERVINGS} onClick={() => set({ servings: clampServings(draft.servings + 1) })}>
              <span className="text-[22px]">+</span>
            </IconButton>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1 text-[12.5px] font-semibold text-ink-soft">
            {t('recipeEdit.prep')}
            <input inputMode="numeric" value={draft.prep} onChange={(e) => set({ prep: e.target.value })} className={input} aria-invalid={tried && problems.minutes} />
          </label>
          <label className="flex flex-col gap-1 text-[12.5px] font-semibold text-ink-soft">
            {t('recipeEdit.cook')}
            <input inputMode="numeric" value={draft.cook} onChange={(e) => set({ cook: e.target.value })} className={input} aria-invalid={tried && problems.minutes} />
          </label>
        </div>
        {tried && problems.minutes && <p className="text-[12.5px] text-alert">{t('recipeEdit.problemMinutes')}</p>}
      </section>

      <h2 className="pt-1 font-display text-[18px] font-semibold">{t('recipe.ingredients')}</h2>
      <div className="flex flex-col gap-2.5">
        {draft.ingredients.map((ing, i) => {
          const badName = tried && problems.ingredientName.has(ing.key)
          const badQty = tried && problems.ingredientQuantity.has(ing.key)
          const unmeasured = UNMEASURED.some((u) => u === ing.unit)
          return (
            <div key={ing.key} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-muted">{t('recipeEdit.ingredientN', { n: i + 1 })}</span>
                <div className="flex">
                  <IconButton label={t('recipeEdit.moveUp')} disabled={i === 0} onClick={() => set({ ingredients: moveItem(draft.ingredients, i, -1) })}>
                    <svg {...svg}><path d="M6 15l6-6 6 6" /></svg>
                  </IconButton>
                  <IconButton label={t('recipeEdit.moveDown')} disabled={i === draft.ingredients.length - 1} onClick={() => set({ ingredients: moveItem(draft.ingredients, i, 1) })}>
                    <svg {...svg}><path d="M6 9l6 6 6-6" /></svg>
                  </IconButton>
                  <IconButton label={t('recipeEdit.remove')} onClick={() => set({ ingredients: draft.ingredients.filter((x) => x.key !== ing.key) })}>
                    <svg {...svg}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" /></svg>
                  </IconButton>
                </div>
              </div>
              <input
                value={ing.name}
                onChange={(e) => setIngredient(ing.key, { name: e.target.value })}
                placeholder={t('recipeEdit.namePlaceholder')}
                aria-label={t('recipeEdit.nameEn')}
                lang="en"
                aria-invalid={badName}
                className={input}
              />
              <input
                value={ing.name_ta}
                onChange={(e) => setIngredient(ing.key, { name_ta: e.target.value })}
                aria-label={t('recipeEdit.nameTa')}
                placeholder={t('recipeEdit.nameTa')}
                lang="ta"
                aria-invalid={badName}
                className={`${input} font-tamil`}
              />
              {badName && <p className="text-[12.5px] text-alert">{t('recipeEdit.problemName')}</p>}
              <div className="flex gap-2">
                <input
                  value={unmeasured ? '' : ing.quantity}
                  onChange={(e) => setIngredient(ing.key, { quantity: e.target.value })}
                  inputMode="decimal"
                  disabled={unmeasured}
                  aria-label={t('recipeEdit.amount')}
                  placeholder={t('recipeEdit.amount')}
                  aria-invalid={badQty}
                  className={`${input} w-28! shrink-0 disabled:opacity-40`}
                />
                <select value={ing.unit} onChange={(e) => setIngredient(ing.key, { unit: e.target.value as typeof ing.unit })} aria-label={t('recipeEdit.unit')} className={`${input} min-w-0 flex-1`}>
                  {RECIPE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {unitText(u)}
                    </option>
                  ))}
                </select>
              </div>
              {badQty && <p className="text-[12.5px] text-alert">{t('recipeEdit.problemQuantity')}</p>}
            </div>
          )
        })}
        <button type="button" onClick={() => set({ ingredients: [...draft.ingredients, emptyIngredient()] })} className="min-h-[48px] rounded-2xl border-[1.5px] border-dashed border-line-strong text-[14.5px] font-semibold text-saffron-ink">
          + {t('recipeEdit.addIngredient')}
        </button>
      </div>

      <h2 className="pt-2 font-display text-[18px] font-semibold">{t('recipeEdit.steps')}</h2>
      <div className="flex flex-col gap-2.5">
        {draft.steps.map((step, i) => {
          const bad = tried && problems.step.has(step.key)
          return (
            <div key={step.key} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-muted">{t('recipeEdit.stepN', { n: i + 1 })}</span>
                <div className="flex">
                  <IconButton label={t('recipeEdit.moveUp')} disabled={i === 0} onClick={() => set({ steps: moveItem(draft.steps, i, -1) })}>
                    <svg {...svg}><path d="M6 15l6-6 6 6" /></svg>
                  </IconButton>
                  <IconButton label={t('recipeEdit.moveDown')} disabled={i === draft.steps.length - 1} onClick={() => set({ steps: moveItem(draft.steps, i, 1) })}>
                    <svg {...svg}><path d="M6 9l6 6 6-6" /></svg>
                  </IconButton>
                  <IconButton label={t('recipeEdit.remove')} onClick={() => set({ steps: draft.steps.filter((x) => x.key !== step.key) })}>
                    <svg {...svg}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" /></svg>
                  </IconButton>
                </div>
              </div>
              <textarea value={step.body} onChange={(e) => setStep(step.key, { body: e.target.value })} rows={3} aria-label={t('recipeEdit.stepEn')} placeholder={t('recipeEdit.stepEn')} lang="en" aria-invalid={bad} className={`${input} py-2.5`} />
              <textarea value={step.body_ta} onChange={(e) => setStep(step.key, { body_ta: e.target.value })} rows={3} aria-label={t('recipeEdit.stepTa')} placeholder={t('recipeEdit.stepTa')} lang="ta" aria-invalid={bad} className={`${input} py-2.5 font-tamil`} />
              {bad && <p className="text-[12.5px] text-alert">{t('recipeEdit.problemStep')}</p>}
            </div>
          )
        })}
        <button type="button" onClick={() => set({ steps: [...draft.steps, emptyStep()] })} className="min-h-[48px] rounded-2xl border-[1.5px] border-dashed border-line-strong text-[14.5px] font-semibold text-saffron-ink">
          + {t('recipeEdit.addStep')}
        </button>
      </div>

      <h2 className="pt-2 font-display text-[18px] font-semibold">{t('recipeEdit.noteLabel')}</h2>
      <textarea value={draft.note} onChange={(e) => set({ note: e.target.value })} rows={2} aria-label={t('recipeEdit.noteLabel')} placeholder={t('recipeEdit.noteLabel')} lang="en" className={`${input} py-2.5`} />
      <textarea value={draft.note_ta} onChange={(e) => set({ note_ta: e.target.value })} rows={2} aria-label={t('recipeEdit.noteTa')} placeholder={t('recipeEdit.noteTa')} lang="ta" className={`${input} py-2.5 font-tamil`} />

      {own && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5">
          <span className="text-[15px] font-semibold">{t('recipeEdit.backToOriginal')}</span>
          <span className="text-[12.5px] text-muted">{t('recipeEdit.backHint')}</span>
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('recipeEdit.confirm')}>
              <span className="text-[13.5px] font-semibold">{t('recipeEdit.confirm')}</span>
              <button type="button" disabled={busy} onClick={() => void onReset()} className="min-h-[44px] rounded-xl bg-alert px-3.5 text-[14px] font-semibold text-on-solid">
                {t('recipeEdit.confirmYes')}
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} className="min-h-[44px] rounded-xl border border-line-strong px-3.5 text-[14px] font-semibold">
                {t('recipeEdit.confirmNo')}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)} className="min-h-[44px] self-start rounded-xl border-[1.5px] border-line-strong px-4 text-[14px] font-semibold">
              {t('recipeEdit.backToOriginal')}
            </button>
          )}
        </div>
      )}

      <div className="sticky bottom-16 -mx-5 flex flex-col gap-2 border-t border-line bg-cream px-5 pb-3 pt-3">
        <div>
          {tried && problems.any && (
            <p role="alert" className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">
              {problems.noIngredients || problems.noSteps ? t('recipeEdit.problemNone') : problems.servings ? t('recipeEdit.problemServings') : t('recipeEdit.problems')}
            </p>
          )}
          {error && <p role="alert" className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{error}</p>}
        </div>
        <div className="flex gap-2.5">
          <button type="button" onClick={() => navigate(`/dishes/${dishId}/recipe`)} disabled={busy} className="min-h-[52px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface text-[15px] font-semibold">
            {t('common.cancel')}
          </button>
          <button type="button" onClick={() => void onSave()} disabled={busy} className="min-h-[52px] flex-[2] rounded-2xl bg-ink text-[15px] font-semibold text-cream disabled:opacity-60">
            {busy ? t('recipeEdit.saving') : t('recipeEdit.save')}
          </button>
        </div>
      </div>
    </main>
  )
}
