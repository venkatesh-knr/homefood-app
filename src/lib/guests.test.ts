import { describe, expect, it } from 'vitest'
import { cleanGuestNote, guestPeople, guestServings, guestsOf, hasGuests, servingsWith, stepGuests } from './guests'

describe('guests at a meal', () => {
  it('are none before the migration is run or when nobody is coming', () => {
    expect(guestsOf({})).toEqual({ adults: 0, children: 0, note: '' })
    expect(guestsOf(null)).toEqual({ adults: 0, children: 0, note: '' })
    expect(hasGuests(guestsOf({ guest_adults: 0, guest_children: 0 }))).toBe(false)
  })
  it('read what the meal says, never beyond 30 or below none', () => {
    expect(guestsOf({ guest_adults: 2, guest_children: 2, guest_note: ' no nuts ' })).toEqual({ adults: 2, children: 2, note: 'no nuts' })
    expect(guestsOf({ guest_adults: 99, guest_children: -3 })).toMatchObject({ adults: 30, children: 0 })
  })
  it('a child is half a serving', () => {
    const g = { adults: 2, children: 2, note: '' }
    expect(guestPeople(g)).toBe(4)
    expect(guestServings(g)).toBe(3)
  })
  it('servings add the guests to the family and round up', () => {
    expect(servingsWith(5, { adults: 2, children: 2 })).toBe(8)
    expect(servingsWith(5, { adults: 0, children: 1 })).toBe(6)
    expect(servingsWith(5, { adults: 0, children: 0 })).toBe(5)
    expect(servingsWith(0, { adults: 0, children: 3 })).toBe(2)
  })
  it('the stepper stays between 0 and 30', () => {
    expect(stepGuests(0, -1)).toBe(0)
    expect(stepGuests(30, 1)).toBe(30)
    expect(stepGuests(4, 1)).toBe(5)
  })
  it('the note is trimmed, cut at 200 characters and empty means none', () => {
    expect(cleanGuestNote('   ')).toBeNull()
    expect(cleanGuestNote(' no nuts ')).toBe('no nuts')
    expect(cleanGuestNote('x'.repeat(250))).toHaveLength(200)
  })
})
