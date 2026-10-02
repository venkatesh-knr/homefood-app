export function normaliseEmail(input: string): string {
  return input.trim().toLowerCase()
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normaliseEmail(input))
}

/** Keeps digits only and caps at 6 — codes are pasted from email with spaces or dashes. */
export function cleanCode(input: string): string {
  return input.replace(/\D/g, '').slice(0, 6)
}

export function isValidCode(input: string): boolean {
  return /^\d{6}$/.test(input)
}

export function isValidHomeName(input: string): boolean {
  const v = input.trim()
  return v.length >= 1 && v.length <= 60
}

export function isValidDisplayName(input: string): boolean {
  const v = input.trim()
  return v.length >= 1 && v.length <= 40
}

const CURRENT_YEAR = new Date().getFullYear()

/** Empty is fine — birth year is optional. */
export function isValidBirthYear(input: string): boolean {
  if (input.trim() === '') return true
  const n = Number(input)
  return Number.isInteger(n) && n >= 1900 && n <= CURRENT_YEAR
}

export function isValidAllergen(input: string): boolean {
  const v = input.trim()
  return v.length >= 1 && v.length <= 40
}

/** Normalises a typed allergy chip: trimmed, lower-cased, so "Peanut" and "peanut" don't both appear. */
export function normaliseAllergen(input: string): string {
  return input.trim().toLowerCase()
}

export function isValidCuisineName(input: string): boolean {
  const v = input.trim()
  return v.length >= 1 && v.length <= 40
}
