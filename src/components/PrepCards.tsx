import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useHistorySlots } from '../lib/plannerQueries'
import { addDays } from '../lib/planner'
import { leadNote, prepByDish, prepTasks, taskDish, taskText, zonedParts, type PrepSlot, type PrepTask } from '../lib/prep'
import { setPrepDone, usePrepDone, usePrepOff, usePrepRows, type PrepDone } from '../lib/prepQueries'
import { useDemoState } from '../demo/demoState'
import { describeError } from '../lib/errors'

/** Today: "Tonight · for tomorrow" (from 4 pm) and "Today · prep" (same-day tasks). Hidden when nothing is needed. Anyone in the home ticks a task done or undoes it. */
export function PrepCards() {
  const { household } = useHome()
  const demo = useDemoState()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const { date } = zonedParts(now, household.timezone)
  const { data: slots } = useHistorySlots(household.id, date, addDays(date, 1))
  const { data: rows } = usePrepRows()
  const { data: off } = usePrepOff(household.id)
  const prep = useMemo(() => prepByDish(rows ?? [], household.id, off), [rows, household.id, off])
  // The demo home has no real evening: treat the clock as 4 pm so the evening card can be seen.
  const { tonight, today } = useMemo(() => prepTasks({ now, timeZone: household.timezone, slots: (slots ?? []) as unknown as PrepSlot[], prep, minHour: demo.active ? 16 : 0 }), [now, household.timezone, slots, prep, demo.active])
  const { data: done } = usePrepDone([...tonight, ...today].map((t) => t.slotId))

  if (tonight.length === 0 && today.length === 0) return null
  return (
    <>
      {today.length > 0 && <PrepCard mode="today" tasks={today} done={done} />}
      {tonight.length > 0 && <PrepCard mode="tonight" tasks={tonight} done={done} />}
    </>
  )
}

function PrepCard({ mode, tasks, done }: { mode: 'tonight' | 'today'; tasks: PrepTask[]; done: Map<string, PrepDone> | undefined }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { profile, household } = useHome()
  const { data: members } = useMembers(household.id)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const nameOf = (id: string | null) => (id ? members?.find((m) => m.id === id)?.display_name ?? '' : '')
  const dayFmt = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long' })
  const doneCount = tasks.filter((x) => done?.has(x.key)).length

  async function toggle(task: PrepTask, isDone: boolean) {
    setBusy(task.key)
    setError(null)
    try {
      await setPrepDone({ householdId: household.id, slotId: task.slotId, prepId: task.prepId, profileId: profile.id, done: !isDone })
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-label={t(mode === 'tonight' ? 'prep.tonightTitle' : 'prep.todayTitle')} className="flex flex-col gap-1 rounded-[22px] border-2 border-meal-dinner bg-surface px-4 py-3.5">
      <div className="flex items-center justify-between gap-2 pb-1">
        <h2 className="flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-wide text-dinner-ink">
          {mode === 'tonight' ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          )}
          {t(mode === 'tonight' ? 'prep.tonightTitle' : 'prep.todayTitle')}
        </h2>
        <span className="text-[12.5px] font-semibold text-ink-soft">{t('prep.progress', { done: doneCount, total: tasks.length })}</span>
      </div>

      {tasks.map((task) => {
        const d = done?.get(task.key)
        const isDone = Boolean(d)
        const note = leadNote(task)
        const noteText = note ? (note.key === 'overnight' ? t('prep.overnight') : t(`prep.${note.key}`, { count: note.hours })) : ''
        const when = `${dayFmt.format(new Date(`${task.date}T00:00:00`))} ${t(`meal.${task.meal}`).toLowerCase()}`
        const text = taskText(task, lang)
        return (
          <div key={task.key} className="flex items-start gap-3 border-t border-line py-3">
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={`text-[15.5px] font-semibold leading-snug ${isDone ? 'text-muted line-through' : ''}`}>{text}</span>
              <span className="text-[12.5px] text-muted">
                {t('prep.for', { when })} · {taskDish(task, lang)}
                {noteText && ` · ${noteText}`}
              </span>
              {isDone && <span className="text-[12.5px] font-semibold text-leaf">{t('prep.doneBy', { name: nameOf(d!.by) || t('notifications.someone') })}</span>}
            </span>
            <button
              type="button"
              disabled={busy === task.key}
              aria-label={t(isDone ? 'prep.undoAria' : 'prep.doneAria', { task: text })}
              onClick={() => void toggle(task, isDone)}
              className={`min-h-[44px] min-w-[76px] shrink-0 rounded-xl px-3.5 text-[14px] font-semibold disabled:opacity-60 ${isDone ? 'border border-line-strong bg-surface text-ink-soft' : 'bg-ink text-cream'}`}
            >
              {t(isDone ? 'prep.undo' : 'prep.done')}
            </button>
          </div>
        )
      })}

      {error && <p role="alert" className="rounded-xl bg-alert-tint px-3 py-2 text-[13px] text-alert">{error}</p>}
      <p className="pt-1 text-[12.5px] text-muted">{t(mode === 'tonight' ? 'prep.footerTonight' : 'prep.footerToday')}</p>
    </section>
  )
}
