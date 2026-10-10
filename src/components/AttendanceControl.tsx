import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { ATTENDANCE_OPTIONS, attendanceFor, attendanceMap, optionOf, type AttendanceOption, type AttendanceRow } from '../lib/attendance'
import { setAttendance } from '../lib/attendanceMutations'
import type { SlotWithDetails } from '../lib/plannerQueries'

/** "Did you eat this?": one tap to say a meal was eaten normally, a small or large portion, skipped, or eaten elsewhere.
 * Everyone can answer for themself; the Admin can answer for anyone marked as eating (e.g. Paati, who never logs in). */
export function AttendanceControl({ slot, rows }: { slot: SlotWithDetails; rows: AttendanceRow[] }) {
  const { t } = useTranslation()
  const { profile, household } = useHome()
  const { data: members } = useMembers(household.id)
  const [open, setOpen] = useState(false)
  const [chosen, setChosen] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  const eaterIds = new Set(slot.meal_slot_eaters.map((e) => e.profile_id))
  const people = (members ?? []).filter((m) => m.kind === 'family' && eaterIds.has(m.id) && (profile.role === 'admin' || m.id === profile.id))
  if (people.length === 0) return null

  const personId = people.some((p) => p.id === chosen) ? chosen! : (people.find((p) => p.id === profile.id) ?? people[0]!).id
  const current = optionOf(attendanceFor(attendanceMap(rows), slot.id, personId))

  const choose = async (option: AttendanceOption) => {
    setBusy(true)
    setError(false)
    try {
      await setAttendance(slot.id, personId, option)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-9 items-center gap-1.5 self-start rounded-full bg-sand px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft"
      >
        <span>{t('attendance.title')}</span>
        <span className="text-ink">· {t(`attendance.option.${current}`)}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={open ? 'rotate-180' : ''}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="flex flex-col gap-2 rounded-2xl bg-sand p-2.5">
          {people.length > 1 && (
            <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
              {t('attendance.who')}
              <select value={personId} onChange={(e) => setChosen(e.target.value)} className="min-h-9 flex-1 rounded-xl border border-line bg-white px-2 text-[14px] text-ink">
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('attendance.title')}>
            {ATTENDANCE_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                disabled={busy}
                aria-pressed={current === o}
                title={t(`attendance.optionHint.${o}`)}
                onClick={() => choose(o)}
                className={`min-h-9 rounded-full border px-3 text-[13px] font-semibold ${current === o ? 'border-ink bg-ink text-cream' : 'border-line bg-white text-ink'}`}
              >
                {t(`attendance.option.${o}`)}
              </button>
            ))}
          </div>
          {error && <p className="text-[12.5px] text-alert">{t('attendance.saveFailed')}</p>}
        </div>
      )}
    </div>
  )
}
