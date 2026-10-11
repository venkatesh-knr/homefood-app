import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from './Dialog'
import { useHome } from '../lib/homeContext'
import { addCustomFood, copyIntake, logIntake, setUsual } from '../lib/intakeMutations'
import { useFoodOptions, useIntake, useUsuals } from '../lib/intakeQueries'
import {
  CUSTOM_FOOD_UNITS, clampQuantity, foodKey, nutritionFor, recentSources, sameAsYesterday, searchFoods, stepQuantity,
  type FoodOption, type FoodUnit, type IntakeDraft,
} from '../lib/intake'
import { amountText, nowHHMM } from '../lib/intakeUi'
import { addDays } from '../lib/planner'
import { describeError } from '../lib/errors'

type Step = { kind: 'pick' } | { kind: 'amount'; food: FoodOption } | { kind: 'custom' } | { kind: 'yesterday' }

const input = 'min-h-[48px] w-full rounded-xl border border-line-strong bg-surface px-3 text-[16px]'

/** "I ate something": find a food, pick an amount, save. Also "Same as yesterday" and "Something else…" (a food of the home's own). */
export function AddFoodSheet({ personId, personName, date, onClose }: { personId: string; personName: string; date: string; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { profile, household } = useHome()
  const { options, byKey } = useFoodOptions(household.id, lang)
  const { data: usualSources } = useUsuals(personId)
  const { data: recentRows } = useIntake(personId, addDays(date, -14), date)
  const { data: yesterdayRows } = useIntake(personId, addDays(date, -1), addDays(date, -1))
  const { data: todayRows } = useIntake(personId, date, date)
  const [step, setStep] = useState<Step>({ kind: 'pick' })
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = (o: FoodOption) => (lang === 'ta' && o.name_ta ? o.name_ta : o.name_en)
  const usualKeys = useMemo(() => new Set((usualSources ?? []).map(foodKey)), [usualSources])
  const usuals = (usualSources ?? []).map((s) => byKey.get(foodKey(s))).filter((o): o is FoodOption => Boolean(o))
  const recent = recentSources(recentRows ?? []).map((s) => byKey.get(foodKey(s))).filter((o): o is FoodOption => Boolean(o) && !usualKeys.has(foodKey(o!.source)))
  const results = useMemo(() => searchFoods(options, query).slice(0, 40), [options, query])
  const searching = query.trim() !== ''
  const copy = sameAsYesterday(yesterdayRows ?? [], todayRows ?? [])

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  const title = t('extras.sheetTitle', { name: personName })
  const header = (
    <div className="flex items-center justify-between gap-3 px-5 pt-5">
      <h2 className="min-w-0 font-display text-[19px] font-bold leading-tight">{title}</h2>
      <button type="button" onClick={onClose} aria-label={t('cookAgain.close')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  )

  const foodRow = (o: FoodOption) => (
    <div key={o.key} className="flex items-center gap-1 rounded-2xl border border-line bg-surface">
      <button type="button" onClick={() => setStep({ kind: 'amount', food: o })} className="flex min-h-[52px] min-w-0 flex-1 flex-col items-start justify-center px-3.5 py-1.5 text-left">
        <span className="truncate text-[15px] font-semibold">{label(o)}</span>
        <span className="text-[12.5px] text-muted">
          {amountText(t, o.unit, o.usual)}
          {o.per.kcal !== null ? ` · ${Math.round(nutritionFor(o.per, o.usual).kcal ?? 0)} kcal` : ` · ${t('extras.noCalories')}`}
        </span>
      </button>
      <StarButton on={usualKeys.has(o.key)} name={label(o)} onToggle={() => void run(() => setUsual({ householdId: household.id, profileId: personId, source: o.source, on: !usualKeys.has(o.key) }))} />
    </div>
  )

  if (step.kind === 'amount') {
    return (
      <Dialog title={title} onClose={onClose}>
        {header}
        <AmountStep
          food={step.food}
          name={label(step.food)}
          starred={usualKeys.has(step.food.key)}
          busy={busy}
          error={error}
          onStar={() => void run(() => setUsual({ householdId: household.id, profileId: personId, source: step.food.source, on: !usualKeys.has(step.food.key) }))}
          onBack={() => setStep({ kind: 'pick' })}
          onSave={(quantity, time) =>
            void run(async () => {
              await logIntake({ householdId: household.id, profileId: personId, byProfileId: profile.id, date, time, food: step.food, quantity })
              onClose()
            })
          }
        />
      </Dialog>
    )
  }

  if (step.kind === 'custom') {
    return (
      <Dialog title={title} onClose={onClose}>
        {header}
        <CustomFoodStep
          initialName={query}
          busy={busy}
          error={error}
          onBack={() => setStep({ kind: 'pick' })}
          onSave={(f) =>
            void run(async () => {
              const id = await addCustomFood(household.id, profile.id, f)
              setStep({
                kind: 'amount',
                food: {
                  key: foodKey({ kind: 'custom', id }), source: { kind: 'custom', id }, name_en: f.name.trim(), name_ta: f.name_ta.trim() || null, category: null, unit: f.unit, usual: 1,
                  per: { kcal: f.kcal, protein_g: f.protein_g, carbs_g: f.carbs_g, fat_g: f.fat_g, fibre_g: null, sugar_g: null, sodium_mg: null },
                },
              })
            })
          }
        />
      </Dialog>
    )
  }

  if (step.kind === 'yesterday') {
    return (
      <Dialog title={title} onClose={onClose}>
        {header}
        <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-5 pt-3">
          {copy.length === 0 ? (
            <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{(yesterdayRows ?? []).length === 0 ? t('extras.yesterdayNone') : t('extras.yesterdayAlready')}</p>
          ) : (
            <>
              <p className="text-[14px] font-semibold">{t('extras.yesterdayPreview', { count: copy.length })}</p>
              <ul className="flex flex-col gap-1.5">
                {copy.map((d: IntakeDraft, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px]">
                    <span className="min-w-0 truncate">{d.food_name}</span>
                    <span className="shrink-0 text-muted">{amountText(t, d.unit, d.quantity)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {error && <p role="alert" className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{error}</p>}
          <div className="flex gap-2.5">
            <button type="button" onClick={() => setStep({ kind: 'pick' })} className="min-h-[52px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface text-[15px] font-semibold">
              {t('extras.back')}
            </button>
            {copy.length > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await copyIntake(copy, { householdId: household.id, date, byProfileId: profile.id })
                    onClose()
                  })
                }
                className="min-h-[52px] flex-[2] rounded-2xl bg-ink text-[15px] font-semibold text-cream disabled:opacity-60"
              >
                {t('extras.yesterdayAdd')}
              </button>
            )}
          </div>
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog title={title} onClose={onClose}>
      {header}
      <div className="flex flex-col gap-2 px-5 pt-3">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('extras.search')} placeholder={t('extras.search')} className={input} />
        <div className="flex gap-2">
          <button type="button" onClick={() => setStep({ kind: 'yesterday' })} className="min-h-[44px] flex-1 rounded-xl border-[1.5px] border-line-strong px-2 text-[13.5px] font-semibold">
            {t('extras.yesterday')}
          </button>
          <button type="button" onClick={() => setStep({ kind: 'custom' })} className="min-h-[44px] flex-1 rounded-xl border-[1.5px] border-dashed border-saffron-ink/60 px-2 text-[13.5px] font-semibold text-saffron-ink">
            {t('extras.somethingElse')}
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1.5 overflow-y-auto px-5 pb-5">
        {error && <p role="alert" className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{error}</p>}
        {!searching && usuals.length > 0 && (
          <>
            <h3 className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-muted">{t('extras.usuals')}</h3>
            {usuals.map(foodRow)}
          </>
        )}
        {!searching && recent.length > 0 && (
          <>
            <h3 className="pt-2 text-[12px] font-semibold uppercase tracking-wide text-muted">{t('extras.recent')}</h3>
            {recent.map(foodRow)}
          </>
        )}
        <h3 className="pt-2 text-[12px] font-semibold uppercase tracking-wide text-muted">{t('extras.foods')}</h3>
        {results.length === 0 ? <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('extras.noResults')}</p> : results.map(foodRow)}
        <p className="pt-2 text-[12px] text-muted">{t('extras.estimateNote')}</p>
      </div>
    </Dialog>
  )
}

function StarButton({ on, name, onToggle }: { on: boolean; name: string; onToggle: () => void }) {
  const { t } = useTranslation()
  return (
    <button type="button" aria-pressed={on} aria-label={`${on ? t('extras.unstar') : t('extras.star')}: ${name}`} onClick={onToggle} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
      <svg width="22" height="22" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className={on ? 'text-saffron' : 'text-muted'} aria-hidden="true">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
      </svg>
    </button>
  )
}

function AmountStep({ food, name, starred, busy, error, onStar, onBack, onSave }: { food: FoodOption; name: string; starred: boolean; busy: boolean; error: string | null; onStar: () => void; onBack: () => void; onSave: (quantity: number, time: string) => void }) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(clampQuantity(food.unit, food.usual))
  const [time, setTime] = useState(nowHHMM())
  const n = nutritionFor(food.per, quantity)
  return (
    <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-5 pt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-display text-[18px] font-semibold">{name}</span>
        <StarButton on={starred} name={name} onToggle={onStar} />
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-3.5">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold">{t('extras.amount')}</span>
          <span className="text-[13px] text-muted" aria-live="polite">{amountText(t, food.unit, quantity)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" aria-label={t('recipe.fewer')} onClick={() => setQuantity(stepQuantity(food.unit, quantity, -1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong text-[22px]">
            −
          </button>
          <span className="w-10 text-center font-display text-[22px] font-bold">{quantity}</span>
          <button type="button" aria-label={t('recipe.more')} onClick={() => setQuantity(stepQuantity(food.unit, quantity, 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong text-[22px]">
            +
          </button>
        </div>
      </div>
      <label className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3.5 text-[15px] font-semibold">
        {t('extras.time')}
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="min-h-[44px] rounded-xl border border-line-strong bg-surface px-3 text-[16px]" />
      </label>
      <p className="rounded-2xl bg-sand px-4 py-3 text-[14px]" aria-live="polite">
        {n.kcal === null ? t('extras.previewUnknown') : t('extras.preview', { kcal: Math.round(n.kcal), protein: n.protein_g === null ? 0 : Math.round(n.protein_g * 10) / 10 })}
      </p>
      {error && <p role="alert" className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{error}</p>}
      <div className="flex gap-2.5">
        <button type="button" onClick={onBack} className="min-h-[52px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface text-[15px] font-semibold">
          {t('extras.back')}
        </button>
        <button type="button" disabled={busy} onClick={() => onSave(quantity, time || nowHHMM())} className="min-h-[52px] flex-[2] rounded-2xl bg-ink text-[15px] font-semibold text-cream disabled:opacity-60">
          {t('extras.save')}
        </button>
      </div>
    </div>
  )
}

function CustomFoodStep({ initialName, busy, error, onBack, onSave }: { initialName: string; busy: boolean; error: string | null; onBack: () => void; onSave: (f: { name: string; name_ta: string; unit: FoodUnit; kcal: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null }) => void }) {
  const { t } = useTranslation()
  const [name, setName] = useState(initialName)
  const [nameTa, setNameTa] = useState('')
  const [unit, setUnit] = useState<FoodUnit>('piece')
  const [vals, setVals] = useState({ kcal: '', protein_g: '', carbs_g: '', fat_g: '' })
  const num = (s: string): number | null | 'bad' => {
    const x = s.trim().replace(',', '.')
    if (x === '') return null
    return /^\d+(\.\d+)?$/.test(x) && Number(x) <= 5000 ? Number(x) : 'bad'
  }
  const parsed = { kcal: num(vals.kcal), protein_g: num(vals.protein_g), carbs_g: num(vals.carbs_g), fat_g: num(vals.fat_g) }
  const bad = Object.values(parsed).includes('bad')
  const ok = name.trim().length >= 1 && name.trim().length <= 60 && !bad
  return (
    <div className="flex flex-col gap-2.5 overflow-y-auto px-5 pb-5 pt-3">
      <p className="text-[12.5px] text-muted">{t('extras.customHint')}</p>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label={t('extras.customName')} placeholder={t('extras.customName')} className={input} />
      <input value={nameTa} onChange={(e) => setNameTa(e.target.value)} maxLength={60} aria-label={t('extras.customNameTa')} placeholder={t('extras.customNameTa')} lang="ta" className={`${input} font-tamil`} />
      <label className="flex flex-col gap-1 text-[12.5px] font-semibold text-ink-soft">
        {t('extras.customUnit')}
        <select value={unit} onChange={(e) => setUnit(e.target.value as FoodUnit)} className={input}>
          {CUSTOM_FOOD_UNITS.map((u) => (
            <option key={u} value={u}>
              {u === '100g' ? '100 g' : t(`extras.unit.${u}`, { count: 1 })}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        {(['kcal', 'protein_g', 'carbs_g', 'fat_g'] as const).map((k) => (
          <label key={k} className="flex flex-col gap-1 text-[12.5px] font-semibold text-ink-soft">
            {t(`extras.customField.${k}`)}
            <input value={vals[k]} onChange={(e) => setVals((v) => ({ ...v, [k]: e.target.value }))} inputMode="decimal" aria-invalid={parsed[k] === 'bad'} className={`${input} aria-[invalid=true]:border-alert`} />
          </label>
        ))}
      </div>
      {bad && <p className="text-[12.5px] text-alert">{t('extras.customProblem')}</p>}
      {error && <p role="alert" className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{error}</p>}
      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onBack} className="min-h-[52px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface text-[15px] font-semibold">
          {t('extras.back')}
        </button>
        <button
          type="button"
          disabled={busy || !ok}
          onClick={() => onSave({ name, name_ta: nameTa, unit, kcal: parsed.kcal as number | null, protein_g: parsed.protein_g as number | null, carbs_g: parsed.carbs_g as number | null, fat_g: parsed.fat_g as number | null })}
          className="min-h-[52px] flex-[2] rounded-2xl bg-ink text-[15px] font-semibold text-cream disabled:opacity-60"
        >
          {t('extras.customSave')}
        </button>
      </div>
    </div>
  )
}
