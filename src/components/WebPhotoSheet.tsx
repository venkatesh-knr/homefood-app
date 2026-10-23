import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from './Dialog'
import { fetchPhotoFile, searchCommonsPhotos, type WebPhoto } from '../lib/webPhotos'

/** "Find a free photo online": searches Wikimedia Commons for the dish, shows only free-licence pictures, and hands back the chosen one with its credit.
 * Only the words searched for leave the device. */
export function WebPhotoSheet({ initialQuery, onPick, onClose }: { initialQuery: string; onPick: (file: File, credit: string) => void; onClose: () => void }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<WebPhoto[] | null>(null)
  const [chosen, setChosen] = useState<WebPhoto | null>(null)
  const [searching, setSearching] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abort = useRef<AbortController | null>(null)

  async function search(q: string) {
    if (!q.trim()) return
    abort.current?.abort()
    const ctl = new AbortController()
    abort.current = ctl
    setSearching(true)
    setError(null)
    setChosen(null)
    try {
      setResults(await searchCommonsPhotos(q, ctl.signal))
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) setError(t('webPhoto.error'))
    } finally {
      if (abort.current === ctl) setSearching(false)
    }
  }

  useEffect(() => {
    if (initialQuery.trim()) void search(initialQuery)
    return () => abort.current?.abort()
    // run once when the sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function use(photo: WebPhoto) {
    setBusy(true)
    setError(null)
    try {
      onPick(await fetchPhotoFile(photo), photo.credit)
    } catch {
      setError(t('webPhoto.error'))
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void search(query)
  }

  return (
    <Dialog title={t('webPhoto.title')} onClose={onClose} variant="full">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col">
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3">
          <h2 className="font-display text-[19px] font-semibold">{t('webPhoto.title')}</h2>
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[14.5px] font-semibold">{t('webPhoto.close')}</button>
        </div>

        {chosen ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5 pt-1">
            <img src={chosen.thumbUrl} alt="" className="w-full rounded-2xl bg-sand object-contain" />
            <p className="text-[13px] leading-snug text-ink-soft">{t('webPhoto.credit', { credit: chosen.credit })}</p>
            <p className="text-[12.5px] leading-snug text-muted">{t('webPhoto.licenceNote')}</p>
            {error && <p role="alert" className="rounded-xl bg-alert-tint px-3 py-2 text-[13px] text-alert">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setChosen(null)} disabled={busy} className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[14px] font-semibold">{t('webPhoto.back')}</button>
              <button type="button" onClick={() => void use(chosen)} disabled={busy} className="min-h-[48px] flex-1 rounded-xl bg-ink text-[14.5px] font-semibold text-cream disabled:opacity-60">{busy ? t('webPhoto.loading') : t('webPhoto.use')}</button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} className="flex gap-2 px-5 pb-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('webPhoto.searchLabel')} placeholder={t('webPhoto.searchLabel')} maxLength={80} autoComplete="off" className="min-h-[48px] min-w-0 flex-1 rounded-xl border-[1.5px] border-line-strong bg-surface px-3.5 text-[15px]" />
              <button type="submit" disabled={searching || !query.trim()} className="min-h-[48px] rounded-xl bg-ink px-4 text-[14.5px] font-semibold text-cream disabled:opacity-60">{t('webPhoto.search')}</button>
            </form>
            <p className="px-5 pb-2 text-[12px] leading-snug text-muted">{t('webPhoto.note')}</p>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              {error && <p role="alert" className="rounded-xl bg-alert-tint px-3 py-2 text-[13px] text-alert">{error}</p>}
              {searching ? (
                <p role="status" className="py-8 text-center text-muted">{t('webPhoto.searching')}</p>
              ) : results && results.length === 0 ? (
                <p className="rounded-2xl bg-sand px-4 py-3.5 text-[14px] text-ink-soft">{t('webPhoto.none')}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(results ?? []).map((p) => (
                    <button key={p.thumbUrl} type="button" onClick={() => setChosen(p)} aria-label={`${p.title}, ${p.licence}`} className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface text-left">
                      <img src={p.thumbUrl} alt="" loading="lazy" className="h-28 w-full object-cover" />
                      <span className="px-2 py-1.5 text-[11.5px] leading-snug text-muted">{p.licence}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Dialog>
  )
}
