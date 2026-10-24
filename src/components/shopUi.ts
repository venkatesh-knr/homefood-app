import type { CatalogItem } from '../lib/shopping'

/** Class names of the round option chips of the shopping screens. */
export const chip = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`

/** An item's main name and the other language's name, for the screen language. */
export const catalogNames = (c: CatalogItem, lang: 'en' | 'ta') => ({ main: lang === 'ta' && c.name_ta ? c.name_ta : c.name_en, other: lang === 'ta' ? c.name_en : c.name_ta })
