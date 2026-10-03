import { describe, expect, it } from 'vitest'
import { notificationTarget, notificationWords, unreadCount } from './notifications'

describe('notificationTarget', () => {
  it('opens the meal thread for meal events, the poster for a published week, the rota for a turn', () => {
    expect(notificationTarget({ type: 'comment_new', data: { date: '2026-10-01', meal: 'lunch' } })).toBe('/week/2026-10-01/lunch/discuss')
    expect(notificationTarget({ type: 'week_published', data: { week_start: '2026-09-28' } })).toBe('/week/glance')
    expect(notificationTarget({ type: 'turn_assigned', data: {} })).toBe('/week/rota')
    expect(notificationTarget({ type: 'slot_changed', data: {} })).toBe('/week')
  })
})

describe('notificationWords', () => {
  it('prefers the dish name in the reader\'s language, then English, then the place', () => {
    const d = { dish_en: 'Dosa', dish_ta: 'தோசை', place: 'Cafe', suggested_en: 'Sundal', suggested_ta: null }
    expect(notificationWords({ data: d }, 'ta')).toEqual({ what: 'தோசை', suggested: 'Sundal' })
    expect(notificationWords({ data: d }, 'en')).toEqual({ what: 'Dosa', suggested: 'Sundal' })
    expect(notificationWords({ data: { place: 'Cafe Chennai' } }, 'en').what).toBe('Cafe Chennai')
  })
})

describe('unreadCount', () => {
  it('counts the ones not yet read', () => {
    expect(unreadCount([{ read_at: null }, { read_at: '2026-10-01T00:00:00Z' }, { read_at: null }])).toBe(2)
  })
})
