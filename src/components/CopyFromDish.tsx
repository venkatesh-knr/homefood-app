import { useState } from 'react'
import { useHome } from '../lib/homeContext'
import type { DishWithNames } from '../lib/dishQueries'
import type { MealType } from '../lib/dishes'
import { DishPickerSheet } from './DishPickerSheet'

/** A button that opens the dish picker so someone can start from what an existing dish already has (its nutrition estimate, its recipe). The picked
 * dish is handed back; what to copy is the caller's business. Dishes in `excludeIds` (those with nothing to copy) are not listed. */
export function CopyFromDish({ label, title, meal = 'breakfast', excludeIds = [], missingIds, missingText, onPicked, className = '' }: {
  label: string
  title: string
  meal?: MealType
  /** Dishes left out of the list altogether (for example the dish being written). */
  excludeIds?: string[]
  /** Dishes with nothing to copy: still listed, so a new dish is never "missing", with `missingText` under them. */
  missingIds?: Set<string>
  missingText?: string
  onPicked: (dish: DishWithNames) => void
  className?: string
}) {
  const { household } = useHome()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`min-h-[44px] self-start rounded-xl border border-line-strong bg-surface px-3.5 text-[14px] font-semibold text-saffron-ink ${className}`}>
        {label}
      </button>
      {open && (
        <DishPickerSheet
          householdId={household.id}
          title={title}
          course="main"
          meal={meal}
          eaters={[]}
          excludeIds={excludeIds}
          extraNote={(d) => (missingIds?.has(d.id) ? (missingText ?? null) : null)}
          onPick={(d) => {
            setOpen(false)
            onPicked(d)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
