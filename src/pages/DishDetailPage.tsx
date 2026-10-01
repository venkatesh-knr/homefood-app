import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useAllergies, useMembers } from '../lib/queries'
import { useCuisines, useDish, useDishPhotoOverrides, useSignedPhotoUrl } from '../lib/dishQueries'
import { removeDish, uploadDishPhoto } from '../lib/dishMutations'
import { describeError } from '../lib/errors'
import { cuisineLabel, dishDisplayName, dishTone } from '../lib/dishes'
import { joinNames } from '../lib/people'
import { FullPageMessage, Pill } from '../components/ui'

export default function DishDetailPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { dishId } = useParams<{ dishId: string }>()
  const { household, profile } = useHome()
  const isAdmin = profile.role === 'admin'

  const { data: dish, isLoading } = useDish(dishId)
  const { data: cuisines } = useCuisines()
  const { data: overrides } = useDishPhotoOverrides(household.id)
  const { data: members } = useMembers(household.id)
  const memberIds = useMemo(() => (members ?? []).map((m) => m.id), [members])
  const { data: allergyRows } = useAllergies(memberIds)

  const photoPath = (overrides ?? []).find((o) => o.dish_id === dishId)?.photo_path ?? dish?.photo_path
  const { data: photoUrl } = useSignedPhotoUrl(photoPath)
  const photoInput = useRef<HTMLInputElement>(null)
  const [zoom, setZoom] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading || !dish) {
    return (
      <FullPageMessage>
        <p className="text-muted">{t('common.loading')}</p>
      </FullPageMessage>
    )
  }

  const name = dishDisplayName(dish, dish.dish_names, lang)
  const secondaryName = dish.dish_names.find((n) => n.language === (lang === 'ta' ? 'en' : 'ta'))?.name
  const cuisine = cuisines?.find((c) => c.id === dish.cuisine_id)
  const { background, ink } = dishTone(name.charCodeAt(0) % 5)
  const isOwn = dish.household_id === household.id
  const canEdit = isOwn && (isAdmin || dish.created_by === profile.id)

  const affectedNames = (allergyRows ?? [])
    .filter((a) => dish.allergens.includes(a.allergen))
    .map((a) => members?.find((m) => m.id === a.profile_id)?.display_name)
    .filter((n): n is string => Boolean(n))
  const uniqueAffected = [...new Set(affectedNames)]

  const mealLabel = dish.meal_types.map((m) => t(`meal.${m}`)).join(', ')
  const dietWord = dish.diet === 'veg' ? t('dishes.filters.dietVeg') : dish.diet === 'egg' ? t('dishes.filters.dietEgg') : t('dishes.filters.dietNonVeg')
  const searchTerm = dish.recipe_search || name

  async function onReplacePhoto(file: File | undefined) {
    if (!file || !dishId) return
    setBusy(true)
    setError(null)
    try {
      await uploadDishPhoto(household.id, dishId, file)
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  async function onRemove() {
    if (!dishId) return
    setBusy(true)
    try {
      await removeDish(dishId, household.id)
      navigate('/dishes', { replace: true })
    } catch (err) {
      setError(describeError(err, t))
      setBusy(false)
    }
  }

  return (
    <main className="flex flex-col">
      <button
        type="button"
        onClick={() => photoUrl && setZoom(true)}
        className="relative flex h-[220px] items-center justify-center"
        style={{ background: photoUrl ? undefined : background }}
        aria-label={t('dishes.detail.tapEnlarge')}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-[130px] w-[130px] items-center justify-center rounded-full font-display text-[52px] font-bold" style={{ background: 'rgba(255,255,255,0.5)', color: ink }}>
            {name.trim()[0]?.toUpperCase() ?? '?'}
          </span>
        )}
        <button type="button" onClick={() => navigate(-1)} aria-label={t('common.back')} className="absolute left-3 top-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/90">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2622" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        {!photoUrl && <span className="absolute bottom-3 left-3.5 text-[11px] text-ink-soft">{t('dishes.detail.stockPhoto')}</span>}
      </button>

      <div className="flex flex-col gap-4 px-5 pt-4 pb-8">
        <div>
          <h1 className="font-display text-[24px] font-bold">{name}</h1>
          {secondaryName && <p className="font-tamil text-[14.5px] text-muted">{secondaryName}</p>}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {cuisine && <Pill>{cuisineLabel(cuisine, lang)}</Pill>}
          <Pill>{mealLabel}</Pill>
          <Pill tone="success">{dietWord}</Pill>
          {dish.prep_minutes !== null && <Pill>{t('dishes.detail.prepMinutes', { count: dish.prep_minutes })}</Pill>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm + ' recipe')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-white text-[13px] font-semibold"
          >
            {t('dishes.detail.youtube')}
          </a>
          <a
            href={`https://www.instagram.com/explore/tags/${encodeURIComponent(searchTerm.replace(/\s+/g, ''))}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-white text-[13px] font-semibold"
          >
            {t('dishes.detail.instagram')}
          </a>
        </div>

        <div className="flex flex-col gap-1 rounded-2xl border border-[#F0CF94] bg-saffron-tint px-3.5 py-3 text-[13.5px]">
          <span className="font-semibold">
            {dish.allergens.length > 0 ? t('dishes.detail.allergensLabel', { list: dish.allergens.join(', ') }) : t('dishes.detail.allergensNone')}
          </span>
          {dish.allergens.length > 0 && (
            <span className="text-ink-soft">
              {uniqueAffected.length > 0
                ? t('dishes.detail.allergensAffects', { names: joinNames(uniqueAffected) })
                : t('dishes.detail.allergensSafe', { home: household.name })}
            </span>
          )}
        </div>

        <p className="text-[13px] text-muted">
          {isOwn ? t('dishes.rowAddedBy', { name: members?.find((m) => m.id === dish.created_by)?.display_name ?? '' }) : t('dishes.detail.addedByStock')}
        </p>

        {error && <p className="rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => photoInput.current?.click()}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-line-strong bg-white text-[14px] font-medium"
          >
            {t('dishes.detail.replacePhoto')}
          </button>
          <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={(e) => onReplacePhoto(e.target.files?.[0])} />
        </div>

        {canEdit && (
          <div className="flex gap-4 border-t border-line pt-3 text-[13.5px] font-semibold text-saffron-ink">
            <button type="button" onClick={() => navigate(`/dishes/${dishId}/edit`)}>
              {t('dishes.detail.edit')}
            </button>
            {removing ? (
              <span className="flex items-center gap-2 text-ink-soft">
                {t('dishes.detail.removeConfirm', { name })}
                <button type="button" className="text-alert" disabled={busy} onClick={onRemove}>
                  {t('dishes.detail.removeYes')}
                </button>
                <button type="button" onClick={() => setRemoving(false)}>
                  {t('dishes.detail.removeNo')}
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setRemoving(true)}>
                {t('dishes.detail.remove')}
              </button>
            )}
          </div>
        )}
      </div>

      {zoom && photoUrl && (
        <div role="dialog" aria-modal="true" aria-label={name} className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[rgba(20,17,15,0.94)]">
          <button type="button" onClick={() => setZoom(false)} aria-label={t('dishes.detail.tapEnlarge')} className="absolute right-3 top-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-cream">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <img src={photoUrl} alt={name} className="max-h-[70vh] max-w-[90vw] rounded-2xl object-contain" />
          <span className="text-[15px] font-semibold text-cream">{name}</span>
        </div>
      )}
    </main>
  )
}
