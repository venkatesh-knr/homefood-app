import { describe, expect, it } from 'vitest'
import { attendanceFor, attendanceMap, optionOf, portionFactor, rowFromOption, type AttendanceRow } from './attendance'

const row = (status: AttendanceRow['status'], portion: AttendanceRow['portion'] = 'normal'): AttendanceRow => ({ slot_id: 's1', profile_id: 'p1', status, portion })

describe('portionFactor', () => {
  it('is a normal portion when nothing was recorded', () => expect(portionFactor(undefined)).toBe(1))
  it('scales small and large portions', () => {
    expect(portionFactor(row('ate', 'small'))).toBe(0.75)
    expect(portionFactor(row('ate', 'large'))).toBe(1.25)
    expect(portionFactor(row('ate'))).toBe(1)
  })
  it('counts nothing when the meal was skipped or eaten elsewhere', () => {
    expect(portionFactor(row('skipped'))).toBe(0)
    expect(portionFactor(row('elsewhere'))).toBe(0)
  })
})

describe('options', () => {
  it('maps a row to the option the person tapped and back', () => {
    for (const o of ['small', 'large', 'skipped', 'elsewhere'] as const) {
      const r = rowFromOption(o)!
      expect(optionOf(r)).toBe(o)
    }
    expect(optionOf(undefined)).toBe('normal')
  })
  it('stores nothing for the default option', () => expect(rowFromOption('normal')).toBeNull())
  it('never pairs a portion with a skipped meal', () => {
    expect(rowFromOption('skipped')).toEqual({ status: 'skipped', portion: 'normal' })
    expect(rowFromOption('elsewhere')).toEqual({ status: 'elsewhere', portion: 'normal' })
  })
})

describe('attendanceMap', () => {
  it('looks a person up by meal', () => {
    const map = attendanceMap([row('skipped')])
    expect(attendanceFor(map, 's1', 'p1')?.status).toBe('skipped')
    expect(attendanceFor(map, 's1', 'p2')).toBeUndefined()
  })
})
