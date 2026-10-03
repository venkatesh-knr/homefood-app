// Pure helpers for the notification bell: what each notification is about and where tapping it should go.
// Framework-free so it is unit-tested without a database.

export type NotificationType =
  | 'week_published'
  | 'slot_changed'
  | 'cook_assigned'
  | 'suggestion_new'
  | 'suggestion_accepted'
  | 'suggestion_declined'
  | 'comment_new'
  | 'kept_despite'
  | 'turn_assigned'

export type NotificationData = {
  date?: string
  meal?: string
  source?: string
  place?: string | null
  dish_en?: string | null
  dish_ta?: string | null
  suggested_en?: string | null
  suggested_ta?: string | null
  week_start?: string
  scope?: string
  start_date?: string
  end_date?: string
}

export type NotificationRow = {
  id: string
  profile_id: string
  type: NotificationType
  slot_id: string | null
  actor_id: string | null
  data: NotificationData
  created_at: string
  read_at: string | null
}

/** The screen a notification opens: the meal's thread, the poster, or the rota. */
export function notificationTarget(n: Pick<NotificationRow, 'type' | 'data'>): string {
  if (n.type === 'week_published') return '/week/glance'
  if (n.type === 'turn_assigned') return '/week/rota'
  return n.data.date && n.data.meal ? `/week/${n.data.date}/${n.data.meal}/discuss` : '/week'
}

/** The words that fill a notification's sentence, in the reader's language (falls back to English / the place name). */
export function notificationWords(n: Pick<NotificationRow, 'data'>, lang: 'en' | 'ta'): { what: string; suggested: string } {
  const d = n.data
  const dish = (lang === 'ta' ? d.dish_ta : d.dish_en) ?? d.dish_en
  const suggested = (lang === 'ta' ? d.suggested_ta : d.suggested_en) ?? d.suggested_en
  return { what: dish || d.place || '', suggested: suggested || '' }
}

export function unreadCount(rows: Pick<NotificationRow, 'read_at'>[]): number {
  return rows.filter((r) => r.read_at === null).length
}
