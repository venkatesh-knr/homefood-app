// Guests at a meal (migration 0044): adults and children (a child is half a serving) and a note for the cooks. Guests have no profiles and never
// count in anyone's nutrition, attendance or history: they only change how much is cooked and bought. Pure logic, no network.

export const MAX_GUESTS = 30
export const GUEST_NOTE_MAX = 200
/** "Staying longer" never repeats guests for more than this many days after the meal. */
export const MAX_STAY_DAYS = 30

export type Guests = { adults: number; children: number; note: string }

type GuestFields = { guest_adults?: number | null; guest_children?: number | null; guest_note?: string | null }

export const NO_GUESTS: Guests = { adults: 0, children: 0, note: '' }

const clamp = (n: number | null | undefined) => Math.max(0, Math.min(MAX_GUESTS, Math.round(Number(n) || 0)))

/** The guests written on a meal (none before migration 0044 is run). */
export function guestsOf(slot: GuestFields | null | undefined): Guests {
  return { adults: clamp(slot?.guest_adults), children: clamp(slot?.guest_children), note: (slot?.guest_note ?? '').trim() }
}

/** How many guests are coming, as people. */
export const guestPeople = (g: Pick<Guests, 'adults' | 'children'>): number => g.adults + g.children

/** What the guests add to the cooking: an adult is a serving, a child half of one. */
export const guestServings = (g: Pick<Guests, 'adults' | 'children'>): number => g.adults + g.children / 2

export const hasGuests = (g: Pick<Guests, 'adults' | 'children'>): boolean => g.adults + g.children > 0

/** Servings to cook: the people eating the family meal plus the guests, rounded up so there is always enough (5 + 1 child -> 6). */
export const servingsWith = (familyEating: number, g: Pick<Guests, 'adults' | 'children'>): number => Math.ceil(familyEating + guestServings(g))

/** A guest field typed or stepped to a valid number: whole, 0 to 30. */
export const stepGuests = (n: number, by: 1 | -1): number => clamp(n + by)

/** The note as it is saved: trimmed, at most 200 characters, nothing when empty. */
export const cleanGuestNote = (note: string): string | null => note.trim().slice(0, GUEST_NOTE_MAX) || null

/** Whether guests were set (so the editor can say what "staying longer" copies). */
export const sameGuests = (a: Guests, b: Guests): boolean => a.adults === b.adults && a.children === b.children && a.note === b.note
