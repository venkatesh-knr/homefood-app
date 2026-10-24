import { useTranslation } from 'react-i18next'
import { FILTER_TAGS } from '../lib/dishTags'

/** The diet filter chips (Low-carb, High protein, Light, Low oil, Millet, Low sugar, Fasting food): a dish must have every chip that is on. */
export function TagFilterChips({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const { t } = useTranslation()
  return (
    <div role="group" aria-label={t('dishTags.filterLabel')} className="flex flex-wrap gap-1.5">
      {FILTER_TAGS.map((x) => {
        const on = value.includes(x)
        return (
          <button
            key={x}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== x) : [...value, x])}
            className={`min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`}
          >
            {t(`dishTags.tag.${x}`)}
          </button>
        )
      })}
    </div>
  )
}
