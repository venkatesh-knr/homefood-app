import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { dietColor, dishTone, type DietType } from '../lib/dishes'
import { useSignedPhotoUrl } from '../lib/dishQueries'

export function DishThumb({ name, tone, photoPath, size = 56 }: { name: string; tone: number; photoPath?: string | null; size?: number }) {
  const { data: url } = useSignedPhotoUrl(photoPath)
  const { background, ink } = dishTone(tone)
  if (url) {
    return <img src={url} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-display font-semibold"
      style={{ width: size, height: size, background, color: ink, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {name.trim()[0]?.toUpperCase() ?? '?'}
    </span>
  )
}

export function DietMark({ diet }: { diet: DietType }) {
  const color = dietColor(diet)
  return (
    <span className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[2px] border-[1.5px]" style={{ borderColor: color }} aria-hidden="true">
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: color }} />
    </span>
  )
}

export function DishRow({
  dishId,
  name,
  secondaryName,
  cuisineLabel,
  diet,
  tone,
  photoPath,
  note,
  onSelect,
}: {
  dishId: string
  name: string
  secondaryName?: string
  cuisineLabel: string
  diet: DietType
  tone: number
  photoPath?: string | null
  note?: { text: string; kind: 'favourite' | 'allergy' | 'info' | 'mine' }
  /** When given, picking the row calls this instead of navigating to Dish Detail (used by DishPickerSheet). */
  onSelect?: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dietWord = diet === 'veg' ? t('dishes.filters.dietVeg') : diet === 'egg' ? t('dishes.filters.dietEgg') : t('dishes.filters.dietNonVeg')
  const noteStyle = {
    favourite: 'bg-leaf-tint text-leaf',
    allergy: 'bg-alert-tint text-alert',
    info: 'bg-sand text-ink-soft',
    mine: 'bg-[#EEF0FA] text-[#2C3777]',
  }[note?.kind ?? 'info']

  return (
    <button
      type="button"
      onClick={onSelect ?? (() => navigate(`/dishes/${dishId}`))}
      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left"
    >
      <DishThumb name={name} tone={tone} photoPath={photoPath} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <DietMark diet={diet} />
          <span className="truncate text-[15.5px] font-semibold">{name}</span>
        </span>
        {secondaryName && <span className="truncate font-tamil text-[12.5px] text-muted">{secondaryName}</span>}
        <span className="truncate text-[12.5px] text-muted">
          {cuisineLabel} · {dietWord}
        </span>
        {note && <span className={`self-start rounded-md px-2 py-0.5 text-[12px] font-semibold ${noteStyle}`}>{note.text}</span>}
      </span>
    </button>
  )
}
