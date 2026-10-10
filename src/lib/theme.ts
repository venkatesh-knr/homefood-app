// Light / dark appearance. The choice is kept on this device only (localStorage), never sent anywhere. "system" follows the device.

export type ThemePref = 'system' | 'light' | 'dark'
export const THEME_PREFS: ThemePref[] = ['system', 'light', 'dark']
const KEY = 'homefood.theme'

export function parseThemePref(value: string | null | undefined): ThemePref {
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function readThemePref(): ThemePref {
  try {
    return parseThemePref(localStorage.getItem(KEY))
  } catch {
    return 'system'
  }
}

/** Puts the choice on the page: data-theme="light" or "dark", or no attribute so the device's own setting decides. */
export function applyTheme(pref: ThemePref): void {
  const root = document.documentElement
  if (pref === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', pref)
}

export function saveThemePref(pref: ThemePref): void {
  try {
    if (pref === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, pref)
  } catch {
    // private window or blocked storage: the choice just lasts until the page is closed
  }
  applyTheme(pref)
}
