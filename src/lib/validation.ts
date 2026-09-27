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
