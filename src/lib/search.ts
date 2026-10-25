// One way of matching what someone types against a dish or food name, shared by the Dishes tab, the dish pickers and My extras.
// Forgiving on purpose: capital letters, accents, plurals ("boiled eggs"), the order of the words ("egg boiled") and the many
// spellings of the same South Indian word ("idly", "dosai", "biriyani") all find the dish. Tamil script is matched as typed.
// Pure logic, no network.

/** The spellings people use for the same dish, written as the spelling the catalogue uses. Applied word by word. */
const WORDS: Record<string, string> = {
  idly: 'idli',
  idlis: 'idli',
  dosai: 'dosa',
  dosas: 'dosa',
  dhosa: 'dosa',
  omelet: 'omelette',
  omlet: 'omelette',
  omlette: 'omelette',
  yogurt: 'curd',
  yoghurt: 'curd',
  thayir: 'curd',
  muttai: 'egg',
  anda: 'egg',
  puri: 'poori',
  poories: 'poori',
  parota: 'parotta',
  porotta: 'parotta',
  paratha: 'parotta',
  chapathi: 'chapati',
  chappati: 'chapati',
  chappathi: 'chapati',
  roti: 'chapati',
  phulka: 'chapati',
  kari: 'curry',
  kuzhambu: 'kuzhambu',
  kolambu: 'kuzhambu',
  sambhar: 'sambar',
  sambaar: 'sambar',
  chatni: 'chutney',
  chuttney: 'chutney',
  pulao: 'pulao',
  pilaf: 'pulao',
  biriyani: 'biryani',
  briyani: 'biryani',
  kheer: 'payasam',
  payasa: 'payasam',
  vadai: 'vada',
  wada: 'vada',
  pakoda: 'pakora',
  pakkoda: 'pakora',
  bajji: 'bajji',
  bhaji: 'bajji',
  tamato: 'tomato',
  potatoes: 'potato',
  tomatoes: 'tomato',
  chilli: 'chili',
  chillies: 'chili',
  chilies: 'chili',
  coffee: 'coffee',
  kaapi: 'coffee',
  tea: 'chai',
  upma: 'upma',
  uppuma: 'upma',
  uppma: 'upma',
}

/** Lower case, no accents or punctuation, one space between words. Tamil letters and vowel signs are left alone. */
export function plainWords(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** A plural ends in s ("eggs", "idlis"); take it off, but not from "ss" ("grass") or short words. */
const singular = (w: string): string => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && /^[a-z]+$/.test(w) ? w.slice(0, -1) : w)

/** The loose form used only to compare: doubled letters count once and "th", "dh", "bh", "iy" and a final "y" are folded, so
 * chappathi = chapati, koottu = kootu, sambhar = sambar, biriyani = biryani, idly = idli. Latin words only. */
function loose(w: string): string {
  if (!/^[a-z0-9]+$/.test(w)) return w
  return w
    .replace(/(.)\1+/g, '$1')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/bh/g, 'b')
    .replace(/iy/g, 'y')
    .replace(/y$/, 'i')
}

/** One word of a name or a query in its comparable form. */
export function comparable(word: string): string {
  const w = singular(word)
  const folded = loose(WORDS[w] ?? WORDS[word] ?? w)
  // folding must not shrink a word to one letter ("zzzz" would then match every name with a z)
  return folded.length < 2 && word.length >= 2 ? word : folded
}

/** All the comparable words of a name. */
const nameCache = new Map<string, string[]>()
export const nameWords = (name: string): string[] => plainWords(name).map(comparable)
/** The comparable words of a name (remembered, since the same few hundred names are compared on every keystroke). */
function nameKey(name: string): string[] {
  let k = nameCache.get(name)
  if (k === undefined) {
    k = nameWords(name)
    nameCache.set(name, k)
  }
  return k
}

/** True when every word typed is the beginning of a word of the name (in any order): "boil" and "boiled" find "Boiled egg", "egg" does not
 * find "Veg kurma". Words are compared in their loose form (see `comparable`). An empty query matches everything. */
export function matchesWords(names: (string | null | undefined)[], query: string): boolean {
  const q = plainWords(query).map(comparable)
  if (q.length === 0) return true
  const haystack = names.filter((n): n is string => Boolean(n)).map(nameKey)
  return haystack.some((words) => q.every((w) => words.some((n) => n.startsWith(w))))
}
