import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useUnreadCount } from '../lib/notificationQueries'

/** The bell in the app header: opens the notification list, with a red dot while anything is unread. */
export function NotificationBell() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: unread = 0 } = useUnreadCount()
  return (
    <button
      type="button"
      onClick={() => navigate('/notifications')}
      aria-label={unread > 0 ? t('notifications.bellUnread', { count: unread }) : t('notifications.title')}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
        <path d="M13.7 20a2 2 0 0 1-3.4 0" />
      </svg>
      {unread > 0 && <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-cream bg-alert" aria-hidden="true" />}
    </button>
  )
}
