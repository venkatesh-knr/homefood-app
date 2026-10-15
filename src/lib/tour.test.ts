import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cardAt, hasSeenTour, markTourSeen, TOUR_CARDS } from './tour'

describe('welcome tour flag', () => {
  beforeEach(() => {
    const data = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) })
  })
  it('is unseen until marked, then stays seen on this device', () => {
    expect(hasSeenTour()).toBe(false)
    markTourSeen()
    expect(hasSeenTour()).toBe(true)
  })
  it('copes with blocked storage', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } })
    expect(hasSeenTour()).toBe(false)
    expect(() => markTourSeen()).not.toThrow()
  })
})

describe('cardAt', () => {
  it('finds the card from the scroll position, never outside the row', () => {
    expect(TOUR_CARDS).toHaveLength(4)
    expect(cardAt(0, 300, 4)).toBe(0)
    expect(cardAt(310, 300, 4)).toBe(1)
    expect(cardAt(460, 300, 4)).toBe(2)
    expect(cardAt(5000, 300, 4)).toBe(3)
    expect(cardAt(-20, 300, 4)).toBe(0)
    expect(cardAt(100, 0, 4)).toBe(0)
  })
})
