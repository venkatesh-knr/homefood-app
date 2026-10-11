// Small helpers for showing a logged amount in words. Kept apart from lib/intake.ts so that stays free of translation.
import type { TFunction } from 'i18next'
import { gramsOf100g, formatQuantity, type FoodUnit } from './intake'

/** "2 pieces", "1.5 glasses", "150 g". */
export function amountText(t: TFunction, unit: FoodUnit, quantity: number): string {
  if (unit === '100g') return `${gramsOf100g(quantity)} g`
  return `${formatQuantity(quantity)} ${t(`extras.unit.${unit}`, { count: quantity })}`
}

/** The time as the app shows it: "16:30" (a stored "16:30:00" loses its seconds). */
export function timeText(time: string | null): string {
  return time ? time.slice(0, 5) : ''
}

export function nowHHMM(d: Date = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
