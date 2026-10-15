// The welcome tour: four short cards shown the first time the app opens on a device, and again whenever someone asks from Home settings.
// Whether it has been seen is a per-device flag in localStorage (a harmless nudge, not household data).

const KEY = 'homefood.tour.seen'

export const TOUR_CARDS = ['plan', 'say', 'glance', 'safe'] as const
export type TourCard = (typeof TOUR_CARDS)[number]

export function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markTourSeen(): void {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    /* storage unavailable (private mode): the tour simply shows again next visit */
  }
}

/** The card a scroll position is on, for a row of `count` equally wide cards. */
export function cardAt(scrollLeft: number, width: number, count: number): number {
  if (width <= 0) return 0
  return Math.min(count - 1, Math.max(0, Math.round(scrollLeft / width)))
}
