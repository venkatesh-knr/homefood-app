import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useCuisines, useDish } from '../lib/dishQueries'
import { addDish, updateDish, uploadDishPhoto, type DishInput } from '../lib/dishMutations'
import { describeError } from '../lib/errors'
import { assignableCuisines, cuisineLabel, dishDisplayName, type DishCourse, type DietType, type MealType } from '../lib/dishes'
import { isValidAllergen, isValidDisplayName, normaliseAllergen } from '../lib/validation'
import { Button, ChipInput } from '../components/ui'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner']

function blank(): DishInput {
  return { name_en: '', name_ta: '', cuisine_id: null, meal_types: [], course: 'main', diet: 'veg', tags: [], allergens: [], prep_minutes: '' }
}

export default function AddDishPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const location = useLocation()
  const { dishId } = useParams<{ dishId: string }>()
  const { household, profile } = useHome()
  const { data: cuisines } = useCuisines()
  const { data: existing } = useDish(dishId)
  const initialPhoto = (location.state as { initialPhoto?: File } | null)?.initialPhoto

  const [values, setValues] = useState<DishInput>(blank())
  const [photo, setPhoto] = useState<File | undefined>(initialPhoto)
  const [showErrors, setShowErrors] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!existing) return
    setValues({
      name_en: existing.name,
      name_ta: existing.dish_names.find((n) => n.language === 'ta')?.name ?? '',
      cuisine_id: existing.cuisine_id,
      meal_types: existing.meal_types,
      course: existing.course,
      diet: existing.diet,
      tags: existing.tags,
      allergens: existing.allergens,
      prep_minutes: existing.prep_minutes === null ? '' : String(existing.prep_minutes),
    })
  }, [existing])

  const nameValid = isValidDisplayName(values.name_en) && values.name_en.trim().length <= 80
  const mealTypesValid = values.meal_types.length > 0
  const leafCuisines = assignableCuisines(cuisines ?? [])

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null)
      return
    }
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  function toggleMealType(m: MealType) {
    setValues((v) => ({ ...v, meal_types: v.meal_types.includes(m) ? v.meal_types.filter((x) => x !== m) : [...v.meal_types, m] }))
  }

  async function onSave() {
    setError(null)
    if (!nameValid || !mealTypesValid) {
      setShowErrors(true)
      return
    }
    setBusy(true)
    try {
      let id: string
      if (dishId) {
        await updateDish(dishId, household.id, values)
        id = dishId
      } else {
        id = await addDish(household.id, profile.id, values)
      }
      if (photo) await uploadDishPhoto(household.id, id, photo)
      navigate(`/dishes/${id}`, { replace: true })
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-8 pt-4">
      <h1 className="font-display text-[22px] font-bold">{dishId ? t('dishes.form.titleEdit') : t('dishes.form.titleAdd')}</h1>

      {photoPreview ? (
        <img src={photoPreview} alt="" className="h-40 w-full rounded-2xl object-cover" />
      ) : existing ? (
        <p className="text-[13px] text-muted">{dishDisplayName(existing, existing.dish_names, lang)}</p>
      ) : null}
      <label className="flex h-12 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron-ink/60 text-[14px] font-semibold text-saffron-ink">
        {t('dishes.form.addPhoto')}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0])} />
      </label>
      <p className="text-[12.5px] text-muted">{t('dishes.form.photoHint')}</p>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('dishes.form.nameEn')}</label>
        <input
          value={values.name_en}
          onChange={(e) => setValues((v) => ({ ...v, name_en: e.target.value }))}
          aria-invalid={showErrors && !nameValid}
          className="h-12 rounded-xl border border-line-strong bg-white px-3 text-[15px]"
        />
        {showErrors && !nameValid && <p className="text-[12.5px] text-alert">{t('dishes.form.errors.nameEn')}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('dishes.form.nameTa')}</label>
        <input
          value={values.name_ta}
          onChange={(e) => setValues((v) => ({ ...v, name_ta: e.target.value }))}
          className="h-12 rounded-xl border border-line-strong bg-white px-3 font-tamil text-[15px]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('dishes.form.cuisine')}</label>
        <select
          value={values.cuisine_id ?? ''}
          onChange={(e) => setValues((v) => ({ ...v, cuisine_id: e.target.value || null }))}
          className="h-12 rounded-xl border border-line-strong bg-white px-3 text-[15px]"
        >
          <option value="">{t('dishes.form.cuisineNone')}</option>
          {leafCuisines.map((c) => (
            <option key={c.id} value={c.id}>
              {cuisineLabel(c, lang)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('dishes.form.mealTypes')}</label>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={values.meal_types.includes(m)}
              onClick={() => toggleMealType(m)}
              className={`h-10 rounded-xl border px-3.5 text-[13.5px] font-semibold ${
                values.meal_types.includes(m) ? 'border-ink bg-ink text-cream' : 'border-line-strong bg-white text-ink-soft'
              }`}
            >
              {t(`meal.${m}`)}
            </button>
          ))}
        </div>
        {showErrors && !mealTypesValid && <p className="text-[12.5px] text-alert">{t('dishes.form.errors.mealTypes')}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('dishes.form.course')}</label>
        <select
          value={values.course}
          onChange={(e) => setValues((v) => ({ ...v, course: e.target.value as DishCourse }))}
          className="h-12 rounded-xl border border-line-strong bg-white px-3 text-[15px]"
        >
          <option value="main">{t('dishes.filters.courseMain')}</option>
          <option value="side">{t('dishes.filters.courseSide')}</option>
          <option value="both">{t('dishes.filters.courseBoth')}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('dishes.form.diet')}</label>
        <select
          value={values.diet}
          onChange={(e) => setValues((v) => ({ ...v, diet: e.target.value as DietType }))}
          className="h-12 rounded-xl border border-line-strong bg-white px-3 text-[15px]"
        >
          <option value="veg">{t('dishes.filters.dietVeg')}</option>
          <option value="egg">{t('dishes.filters.dietEgg')}</option>
          <option value="non_veg">{t('dishes.filters.dietNonVeg')}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('dishes.form.tags')}</label>
        <ChipInput
          values={values.tags}
          onChange={(tags) => setValues((v) => ({ ...v, tags }))}
          placeholder={t('dishes.form.tagsPlaceholder')}
          isValid={isValidAllergen}
          normalise={normaliseAllergen}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('dishes.form.allergens')}</label>
        <ChipInput
          values={values.allergens}
          onChange={(allergens) => setValues((v) => ({ ...v, allergens }))}
          placeholder={t('dishes.form.allergensPlaceholder')}
          isValid={isValidAllergen}
          normalise={normaliseAllergen}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('dishes.form.prepMinutes')}</label>
        <input
          value={values.prep_minutes}
          onChange={(e) => setValues((v) => ({ ...v, prep_minutes: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
          inputMode="numeric"
          className="h-12 rounded-xl border border-line-strong bg-white px-3 text-[15px]"
        />
      </div>

      {error && <p className="rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}

      <div className="mt-2 flex gap-2 border-t border-line pt-4">
        <Button variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
          {t('dishes.form.cancel')}
        </Button>
        <Button className="flex-1" disabled={busy} onClick={onSave}>
          {t('dishes.form.save')}
        </Button>
      </div>
    </main>
  )
}
