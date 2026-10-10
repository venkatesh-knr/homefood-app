// Pure helpers for "who actually ate what". A meal counts as eaten by everyone marked as eating it, in a normal portion, unless a
// row says otherwise (small / large portion, skipped, ate elsewhere). Framework-free so it is unit-tested without a database.

export type AttendanceStatus = 'ate' | 'skipped' | 'elsewhere'
export type Portion = 'small' | 'normal' | 'large'
export type AttendanceRow = { slot_id: string; profile_id: string; status: AttendanceStatus; portion: Portion }

/** The five things a person can tap. "normal" is the default and is stored as the absence of a row. */
export type AttendanceOption = 'normal' | 'small' | 'large' | 'skipped' | 'elsewhere'
export const ATTENDANCE_OPTIONS: AttendanceOption[] = ['normal', 'small', 'large', 'skipped', 'elsewhere']

export const SMALL_FACTOR = 0.75
export const LARGE_FACTOR = 1.25

/** How much of the planned serving this person ate: 0 for skipped / ate elsewhere, 0.75 small, 1 normal, 1.25 large. */
export function portionFactor(row: Pick<AttendanceRow, 'status' | 'portion'> | undefined): number {
  if (!row) return 1
  if (row.status !== 'ate') return 0
  return row.portion === 'small' ? SMALL_FACTOR : row.portion === 'large' ? LARGE_FACTOR : 1
}

export function optionOf(row: Pick<AttendanceRow, 'status' | 'portion'> | undefined): AttendanceOption {
  if (!row) return 'normal'
  if (row.status === 'skipped') return 'skipped'
  if (row.status === 'elsewhere') return 'elsewhere'
  return row.portion
}

/** What to store for a tapped option, or null for "normal" (the default, so the row is removed). */
export function rowFromOption(option: AttendanceOption): Pick<AttendanceRow, 'status' | 'portion'> | null {
  switch (option) {
    case 'normal':
      return null
    case 'small':
      return { status: 'ate', portion: 'small' }
    case 'large':
      return { status: 'ate', portion: 'large' }
    case 'skipped':
      return { status: 'skipped', portion: 'normal' }
    case 'elsewhere':
      return { status: 'elsewhere', portion: 'normal' }
  }
}

/** Rows keyed for quick lookup while adding up a week or month. */
export function attendanceMap(rows: AttendanceRow[]): Map<string, AttendanceRow> {
  return new Map(rows.map((r) => [`${r.slot_id}:${r.profile_id}`, r]))
}

export function attendanceFor(map: Map<string, AttendanceRow>, slotId: string, profileId: string): AttendanceRow | undefined {
  return map.get(`${slotId}:${profileId}`)
}
