import { describe, expect, it } from 'vitest'
import { cleanCode, isValidCode, isValidEmail, normaliseEmail } from './validation'

describe('email', () => {
  it('normalises case and spaces', () => {
    expect(normaliseEmail('  Amma@Example.COM ')).toBe('amma@example.com')
  })
  it('accepts normal addresses and rejects broken ones', () => {
    expect(isValidEmail('amma@example.com')).toBe(true)
    expect(isValidEmail('a.b+food@mail.co.in')).toBe(true)
    expect(isValidEmail('amma@example')).toBe(false)
    expect(isValidEmail('amma example.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('code', () => {
  it('keeps only the first 6 digits', () => {
    expect(cleanCode('123 456')).toBe('123456')
    expect(cleanCode('12-34-56-78')).toBe('123456')
    expect(cleanCode('abc')).toBe('')
  })
  it('needs exactly 6 digits', () => {
    expect(isValidCode('123456')).toBe(true)
    expect(isValidCode('12345')).toBe(false)
    expect(isValidCode('12345a')).toBe(false)
  })
})
