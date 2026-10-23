// "Find a free photo": search Wikimedia Commons for a picture of a dish and keep only the ones with a free licence. Pure parsing here;
// the one network call (searchCommonsPhotos) sends only the search words, nothing about the home or its people.

export type WebPhoto = {
  title: string
  thumbUrl: string
  width: number
  height: number
  licence: string
  /** "Author, CC BY-SA 4.0, via Wikimedia Commons": what is saved with the photo and shown on the dish (CC BY / BY-SA need this). */
  credit: string
  pageUrl: string
}

/** Free to copy and reuse with a credit: public domain, CC0, CC BY and CC BY-SA. NonCommercial and NoDerivatives licences are not free enough. */
export function isFreeLicence(short: string): boolean {
  const s = short.toLowerCase().trim()
  if (!s) return false
  if (/(^|[\s-])(nc|nd)([\s-]|$)|non-?commercial|no[ -]?deriv/.test(s)) return false
  return /^(cc0|cc[ -]?by|public domain|pd([ -]|$)|attribution)/.test(s)
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&nbsp;': ' ' }

/** Commons gives the author as a bit of HTML ("<a href=…>Name</a>"): plain text, short. */
export function plainAuthor(html: string): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&(amp|lt|gt|quot|#039|nbsp);/g, (m) => ENTITIES[m] ?? m).replace(/\s+/g, ' ').trim()
  return text.length > 60 ? `${text.slice(0, 57).trim()}…` : text
}

/** When Commons does not name the author, the file's name is used, so the credit still points to where the photo came from. */
export function creditFor(author: string, licence: string, title = ''): string {
  return `${author || (title ? `File: ${title}` : 'Unknown author')}, ${licence}, via Wikimedia Commons`
}

type CommonsPage = {
  index?: number
  title: string
  imageinfo?: { thumburl?: string; width?: number; height?: number; mime?: string; descriptionurl?: string; extmetadata?: Record<string, { value?: string }> }[]
}

/** The usable results of a Commons search: real pictures (jpeg / png / webp), not tiny, with a free licence, best match first. */
export function parseCommonsResults(data: unknown, limit = 24): WebPhoto[] {
  const pages = Object.values((data as { query?: { pages?: Record<string, CommonsPage> } })?.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  const out: WebPhoto[] = []
  for (const p of pages) {
    const ii = p.imageinfo?.[0]
    if (!ii?.thumburl || !ii.mime || !/^image\/(jpeg|png|webp)$/.test(ii.mime)) continue
    if ((ii.width ?? 0) < 600 || (ii.height ?? 0) < 400) continue
    const licence = ii.extmetadata?.LicenseShortName?.value?.trim() ?? ''
    if (!isFreeLicence(licence)) continue
    out.push({
      title: p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
      thumbUrl: ii.thumburl,
      width: ii.width ?? 0,
      height: ii.height ?? 0,
      licence,
      credit: creditFor(plainAuthor(ii.extmetadata?.Artist?.value ?? ''), licence, p.title.replace(/^File:/, '')),
      pageUrl: ii.descriptionurl ?? '',
    })
    if (out.length >= limit) break
  }
  return out
}

/** Searches Commons (it allows browsers to ask directly). Only `query` leaves the device. */
export async function searchCommonsPhotos(query: string, signal?: AbortSignal): Promise<WebPhoto[]> {
  const q = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: `${query.trim()} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '40',
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '960',
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${q}`, { signal })
  if (!res.ok) throw new Error(`Commons answered ${res.status}`)
  return parseCommonsResults(await res.json())
}

/** Fetches the chosen picture as a file, ready for the normal photo upload (which re-encodes it and drops any metadata). */
export async function fetchPhotoFile(photo: WebPhoto): Promise<File> {
  const res = await fetch(photo.thumbUrl)
  if (!res.ok) throw new Error(`The photo could not be loaded (${res.status})`)
  const blob = await res.blob()
  return new File([blob], 'web-photo.jpg', { type: blob.type || 'image/jpeg' })
}
