// Pure helpers for the "Your data and account" card: what a database refusal means, whether a typed home name matches, and the download's file name.

export type AccountProblem = 'lastAdmin' | 'nameMismatch' | 'other'

/** The database says why it refused in a short code at the start of its message (see migration 0031). */
export function accountProblem(err: unknown): AccountProblem {
  const m = typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : ''
  if (m.includes('LAST_ADMIN')) return 'lastAdmin'
  if (m.includes('NAME_MISMATCH')) return 'nameMismatch'
  return 'other'
}

/** The home's name must be typed exactly (spaces at the ends are forgiven, capital letters are not). */
export function nameMatches(typed: string, homeName: string): boolean {
  return typed.trim() === homeName.trim() && homeName.trim() !== ''
}

export function exportFileName(date: Date = new Date()): string {
  const d = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return `homefood-my-data-${d}.json`
}
