import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { clearAll, markAllRead, markRead, useNotifications } from '../lib/notificationQueries'
import { notificationTarget, notificationWords, unreadCount, type NotificationRow } from '../lib/notifications'
import { formatCommentTime } from '../lib/discussion'
import { describeError } from '../lib/errors'
import { BackHeader } from '../components/BackHeader'

export default function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const locale = lang === 'ta' ? 'ta-IN' : 'en-IN'
  const navigate = useNavigate()
  const { household } = useHome()
  const { data: members } = useMembers(household.id)
  const { data: rows, isLoading } = useNotifications()
  const [error, setError] = useState<string | null>(null)

  const nameOf = (id: string | null) => members?.find((m) => m.id === id)?.display_name ?? t('notifications.someone')
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const shortFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
  const day = (iso?: string) => (iso ? dayFmt.format(new Date(`${iso}T00:00:00`)) : '')

  function textOf(n: NotificationRow): string {
    const { what, suggested } = notificationWords(n, lang)
    const d = n.data
    return t(`notifications.text.${n.type}`, {
      actor: nameOf(n.actor_id),
      day: day(d.date),
      meal: d.meal ? t(`meal.${d.meal}`).toLowerCase() : '',
      what,
      suggested,
      range: d.start_date && d.end_date ? `${shortFmt.format(new Date(`${d.start_date}T00:00:00`))} – ${shortFmt.format(new Date(`${d.end_date}T00:00:00`))}` : '',
    })
  }

  async function run(fn: () => Promise<void>) {
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(describeError(err, t))
    }
  }

  const list = rows ?? []
  const unread = unreadCount(list)

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-8">
      <BackHeader title={t('notifications.title')} subtitle={t('notifications.subtitle')} to="/today" />

      {list.length > 0 && (
        <div className="flex items-center justify-between text-[13px] font-semibold text-saffron-ink">
          <button type="button" disabled={unread === 0} onClick={() => void run(markAllRead)} className="underline disabled:no-underline disabled:opacity-40">
            {t('notifications.markAll')}
          </button>
          <button type="button" onClick={() => void run(clearAll)} className="underline">
            {t('notifications.clear')}
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="py-6 text-center text-muted">{t('common.loading')}</p>
      ) : list.length === 0 ? (
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('notifications.empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                void run(async () => {
                  if (n.read_at === null) await markRead(n.id)
                })
                navigate(notificationTarget(n))
              }}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left ${n.read_at === null ? 'border-saffron/50 bg-white' : 'border-line bg-white/60'}`}
            >
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.read_at === null ? 'bg-alert' : 'bg-transparent'}`} aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={`text-[14.5px] ${n.read_at === null ? 'font-semibold' : ''}`}>{textOf(n)}</span>
                <span className="text-[12px] text-muted">{formatCommentTime(n.created_at, new Date(), locale)}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}
    </main>
  )
}
