import { useTranslation } from 'react-i18next'
import { Toggle } from './ui'
import { addDays } from '../lib/planner'
import { GUEST_NOTE_MAX, MAX_GUESTS, MAX_STAY_DAYS, guestPeople, hasGuests, servingsWith, stepGuests, type Guests } from '../lib/guests'

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0 break-words text-[14.5px]">{label}</span>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" aria-label={t('guests.fewer', { who: label })} disabled={value <= 0} onClick={() => onChange(stepGuests(value, -1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong bg-surface text-[20px] font-semibold disabled:opacity-40">−</button>
        <span aria-live="polite" className="w-8 text-center font-display text-[18px] font-bold">{value}</span>
        <button type="button" aria-label={t('guests.more', { who: label })} disabled={value >= MAX_GUESTS} onClick={() => onChange(stepGuests(value, 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong bg-surface text-[20px] font-semibold disabled:opacity-40">+</button>
      </div>
    </div>
  )
}

/** Guests at a home meal: adults and children (half a serving each), a note for the cooks, and "staying longer" to repeat them on the home's other planned meals. */
export function GuestsEditor({ guests, onChange, until, onUntilChange, date, familyEating }: {
  guests: Guests
  onChange: (g: Guests) => void
  /** The last day guests are repeated on; empty = only this meal. */
  until: string
  onUntilChange: (d: string) => void
  date: string
  /** People of the family eating this meal (without the guests). */
  familyEating: number
}) {
  const { t } = useTranslation()
  const staying = until !== ''
  const people = familyEating + guestPeople(guests)
  const servings = servingsWith(familyEating, guests)
  return (
    <>
      <div className="mx-4 mt-3 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-[15.5px] font-semibold">{t('guests.title')}</h2>
          <span className="text-[12.5px] text-muted">{t('guests.hint')}</span>
        </div>
        <Stepper label={t('guests.adults')} value={guests.adults} onChange={(n) => onChange({ ...guests, adults: n })} />
        <Stepper label={t('guests.children')} value={guests.children} onChange={(n) => onChange({ ...guests, children: n })} />
        {hasGuests(guests) && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-[12.5px] font-semibold text-ink-soft">{t('guests.note')}</span>
              <input
                value={guests.note}
                maxLength={GUEST_NOTE_MAX}
                onChange={(e) => onChange({ ...guests, note: e.target.value })}
                placeholder={t('guests.notePlaceholder')}
                className="min-h-12 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[15px] outline-none focus:border-saffron"
              />
            </label>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-sand px-3.5 py-3">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[14.5px] font-semibold">{t('guests.stayTitle')}</span>
                <span className="break-words text-[12.5px] text-muted">{staying ? t('guests.stayOn') : t('guests.stayOff')}</span>
              </span>
              <Toggle checked={staying} onChange={(on) => onUntilChange(on ? addDays(date, 1) : '')} label={t('guests.stayTitle')} />
            </div>
            {staying && (
              <label className="flex flex-col gap-1">
                <span className="text-[12.5px] font-semibold text-ink-soft">{t('guests.until')}</span>
                <input
                  type="date"
                  value={until}
                  min={addDays(date, 1)}
                  max={addDays(date, MAX_STAY_DAYS)}
                  onChange={(e) => onUntilChange(e.target.value >= addDays(date, 1) ? e.target.value : addDays(date, 1))}
                  className="min-h-12 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[15px] outline-none focus:border-saffron"
                />
                <span className="text-[12.5px] text-muted">{t('guests.untilHint')}</span>
              </label>
            )}
          </>
        )}
      </div>
      {hasGuests(guests) && (
        <div role="note" className="mx-4 mt-2.5 flex flex-col gap-1 rounded-2xl bg-saffron-tint px-3.5 py-3 text-[13.5px] text-saffron-ink">
          <span className="break-words font-semibold">{t('guests.summary', { count: guestPeople(guests), people, servings, family: familyEating, guests: guestPeople(guests) })}</span>
          <span className="break-words">{t('guests.summaryNote')}</span>
        </div>
      )}
    </>
  )
}
