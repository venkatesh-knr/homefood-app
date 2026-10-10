import { describe, expect, it } from 'vitest'
import { parseThemePref } from './theme'

describe('parseThemePref', () => {
  it('accepts the two explicit choices', () => {
    expect(parseThemePref('light')).toBe('light')
    expect(parseThemePref('dark')).toBe('dark')
  })
  it('follows the device for anything else', () => {
    expect(parseThemePref(null)).toBe('system')
    expect(parseThemePref(undefined)).toBe('system')
    expect(parseThemePref('')).toBe('system')
    expect(parseThemePref('blue')).toBe('system')
  })
})
