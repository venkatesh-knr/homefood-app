import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from './Dialog'
import { aspectRatio, clampCrop, frameSize, MAX_ZOOM, outputSize, sourceRect, type CropAspect, type CropState } from '../lib/photoCrop'

type Source = HTMLCanvasElement | ImageBitmap

const ASPECTS: CropAspect[] = ['square', 'wide', 'banner', 'whole']

/** A quarter-turn copy of the photo (the frame is cut from this, so rotating is just choosing a different copy). */
function turned(bitmap: ImageBitmap, quarterTurns: number): Source {
  const q = ((quarterTurns % 4) + 4) % 4
  if (q === 0) return bitmap
  const swap = q % 2 === 1
  const canvas = document.createElement('canvas')
  canvas.width = swap ? bitmap.height : bitmap.width
  canvas.height = swap ? bitmap.width : bitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((q * Math.PI) / 2)
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)
  return canvas
}

/** Opens a photo that was just taken or chosen so it can be trimmed before it is used: pick a frame shape, drag the photo, zoom, rotate.
 * "Use this photo" hands back the trimmed picture (re-drawn, so it carries no location data); Cancel throws the photo away. */
export function PhotoCropSheet({ file, onDone, onCancel }: { file: File; onDone: (trimmed: File) => void; onCancel: () => void }) {
  const { t } = useTranslation()
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null)
  const [failed, setFailed] = useState(false)
  const [turns, setTurns] = useState(0)
  const [aspect, setAspect] = useState<CropAspect>('wide')
  const [crop, setCrop] = useState<CropState>({ zoom: 1, ox: 0, oy: 0 })
  const [box, setBox] = useState({ width: 320, height: 420 })
  const [busy, setBusy] = useState(false)
  const area = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    let alive = true
    createImageBitmap(file).then(
      (b) => alive && setBitmap(b),
      () => alive && setFailed(true),
    )
    return () => {
      alive = false
    }
  }, [file])

  // the space the frame may fill follows the screen
  useEffect(() => {
    const measure = () => {
      const w = (area.current?.clientWidth ?? 352) - 32 // the side padding
      setBox({ width: Math.max(200, Math.min(w, 480)), height: Math.max(220, Math.round(window.innerHeight * 0.5)) })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const source = useMemo(() => (bitmap ? turned(bitmap, turns) : null), [bitmap, turns])
  const iw = source?.width ?? 1
  const ih = source?.height ?? 1
  const frame = frameSize(aspectRatio(aspect, iw, ih), box.width, box.height)

  const draw = useCallback(() => {
    const c = canvas.current
    if (!c || !source) return
    const r = sourceRect(crop, iw, ih, frame.width, frame.height)
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = Math.round(frame.width * dpr)
    c.height = Math.round(frame.height * dpr)
    const ctx = c.getContext('2d')!
    ctx.drawImage(source, r.sx, r.sy, r.sw, r.sh, 0, 0, c.width, c.height)
  }, [source, crop, iw, ih, frame.width, frame.height])

  useEffect(() => {
    draw()
  }, [draw])

  // a new frame shape or a turn starts again from the middle at zoom 1
  const reset = (next: Partial<{ aspect: CropAspect; turns: number }>) => {
    if (next.aspect) setAspect(next.aspect)
    if (next.turns !== undefined) setTurns(next.turns)
    setCrop({ zoom: 1, ox: 0, oy: 0 })
  }

  const move = (ox: number, oy: number) => setCrop((c) => clampCrop({ ...c, ox, oy }, iw, ih, frame.width, frame.height))
  const zoomTo = (zoom: number) => setCrop((c) => clampCrop({ ...c, zoom }, iw, ih, frame.width, frame.height))

  async function use() {
    if (!source) return
    setBusy(true)
    try {
      const r = sourceRect(crop, iw, ih, frame.width, frame.height)
      const size = outputSize(r.sw, r.sh)
      const out = document.createElement('canvas')
      out.width = size.width
      out.height = size.height
      out.getContext('2d')!.drawImage(source, r.sx, r.sy, r.sw, r.sh, 0, 0, size.width, size.height)
      const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/jpeg', 0.9))
      if (!blob) throw new Error('no blob')
      onDone(new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
    } catch {
      setFailed(true)
      setBusy(false)
    }
  }

  const chip = (on: boolean) => `min-h-11 rounded-full px-3.5 text-[13.5px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface'}`

  return (
    <Dialog title={t('photoCrop.title')} onClose={onCancel} variant="full">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between gap-3 px-4 pt-4">
          <h2 className="font-display text-[18px] font-semibold">{t('photoCrop.title')}</h2>
          <button type="button" onClick={onCancel} className="min-h-11 rounded-xl px-3 text-[14px] font-semibold text-ink-soft">
            {t('common.cancel')}
          </button>
        </div>

        <div ref={area} className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-4 py-3">
          {failed ? (
            <p role="alert" className="rounded-2xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{t('photoCrop.failed')}</p>
          ) : !source ? (
            <p className="text-muted">{t('photoCrop.opening')}</p>
          ) : (
            <>
              <canvas
                ref={canvas}
                role="img"
                aria-label={t('photoCrop.canvasLabel')}
                tabIndex={0}
                style={{ width: frame.width, height: frame.height, touchAction: 'none' }}
                className="cursor-grab rounded-2xl border border-line-strong bg-sand active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId)
                  drag.current = { x: e.clientX, y: e.clientY, ox: crop.ox, oy: crop.oy }
                }}
                onPointerMove={(e) => {
                  if (drag.current) move(drag.current.ox + e.clientX - drag.current.x, drag.current.oy + e.clientY - drag.current.y)
                }}
                onPointerUp={() => (drag.current = null)}
                onPointerCancel={() => (drag.current = null)}
                onKeyDown={(e) => {
                  const step = 24
                  const d = e.key === 'ArrowLeft' ? [-step, 0] : e.key === 'ArrowRight' ? [step, 0] : e.key === 'ArrowUp' ? [0, -step] : e.key === 'ArrowDown' ? [0, step] : null
                  if (d) {
                    e.preventDefault()
                    move(crop.ox + d[0]!, crop.oy + d[1]!)
                  }
                }}
              />
              <p className="text-center text-[12.5px] text-muted">{t('photoCrop.hint')}</p>
            </>
          )}
        </div>

        {source && !failed && (
          <div className="flex flex-col gap-3 border-t border-line bg-surface px-4 pb-4 pt-3">
            <div role="group" aria-label={t('photoCrop.shape')} className="flex flex-wrap gap-2">
              {ASPECTS.map((a) => (
                <button key={a} type="button" aria-pressed={aspect === a} onClick={() => reset({ aspect: a })} className={chip(aspect === a)}>
                  {t(`photoCrop.aspect.${a}`)}
                </button>
              ))}
              <button type="button" onClick={() => reset({ turns: turns + 1 })} className={chip(false)}>
                {t('photoCrop.rotate')}
              </button>
            </div>
            <label className="flex items-center gap-3 text-[13.5px] font-semibold">
              <span className="shrink-0">{t('photoCrop.zoom')}</span>
              <input type="range" min={1} max={MAX_ZOOM} step={0.01} value={crop.zoom} onChange={(e) => zoomTo(Number(e.target.value))} className="h-11 min-w-0 flex-1 accent-saffron" />
            </label>
            <button type="button" disabled={busy} onClick={() => void use()} className="min-h-[52px] rounded-2xl bg-ink text-[15px] font-semibold text-cream disabled:opacity-60">
              {t('photoCrop.use')}
            </button>
          </div>
        )}
      </div>
    </Dialog>
  )
}
