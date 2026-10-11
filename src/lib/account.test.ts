import { describe, expect, it } from 'vitest'
import { accountProblem, exportFileName, nameMatches } from './account'

describe('accountProblem', () => {
  it('recognises the database codes', () => {
    expect(accountProblem({ message: 'LAST_ADMIN: hand the Admin role to someone else first' })).toBe('lastAdmin')
    expect(accountProblem({ message: 'NAME_MISMATCH: type the home\'s name exactly to confirm' })).toBe('nameMismatch')
    expect(accountProblem(new Error('network down'))).toBe('other')
    expect(accountProblem(null)).toBe('other')
  })
})

describe('nameMatches', () => {
  it('needs the exact name, forgiving spaces at the ends only', () => {
    expect(nameMatches('Our Home', 'Our Home')).toBe(true)
    expect(nameMatches('  Our Home ', 'Our Home')).toBe(true)
    expect(nameMatches('our home', 'Our Home')).toBe(false)
    expect(nameMatches('Our  Home', 'Our Home')).toBe(false)
    expect(nameMatches('', '')).toBe(false)
  })
})

describe('exportFileName', () => {
  it('names the file by date', () => {
    expect(exportFileName(new Date(2026, 9, 5))).toBe('homefood-my-data-2026-10-05.json')
  })
})
