import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from './Dialog'
import { LanguageSwitch } from './ui'
import { cardAt, TOUR_CARDS, type TourCard } from '../lib/tour'

const svg = { width: 96, height: 96, viewBox: '0 0 96 96', fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

/** A simple picture for each card, drawn in the app's own colours (no image files). */
function Picture({ card }: { card: TourCard }) {
  switch (card) {
    case 'plan':
      return (
        <svg {...svg}>
          <rect x="12" y="18" width="72" height="66" rx="12" />
          <path d="M12 38h72M32 10v14M64 10v14" />
          <circle cx="30" cy="52" r="5" fill="#F2B705" stroke="none" />
          <circle cx="48" cy="52" r="5" fill="#2F7A3E" stroke="none" />
          <circle cx="66" cy="52" r="5" fill="#E8742A" stroke="none" />
          <circle cx="30" cy="70" r="5" fill="#3B4A9C" stroke="none" />
          <path d="M44 70l5 5 11-11" />
        </svg>
      )
    case 'say':
      return (
        <svg {...svg}>
          <path d="M14 22h44a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H36l-14 12V60h-8a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8z" transform="translate(4 0)" />
          <path d="M70 40h12a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6h-4v8l-9-8" />
          <path d="M30 42l4 4 8-9" />
        </svg>
      )
    case 'glance':
      return (
        <svg {...svg}>
          <rect x="10" y="12" width="76" height="72" rx="10" />
          <rect x="18" y="22" width="18" height="14" rx="4" fill="#F2B705" stroke="none" />
          <rect x="39" y="22" width="18" height="14" rx="4" fill="#2F7A3E" stroke="none" />
          <rect x="60" y="22" width="18" height="14" rx="4" fill="#E8742A" stroke="none" />
          <rect x="18" y="42" width="18" height="14" rx="4" fill="#3B4A9C" stroke="none" />
          <rect x="39" y="42" width="18" height="14" rx="4" fill="#F2B705" stroke="none" />
          <rect x="60" y="42" width="18" height="14" rx="4" fill="#2F7A3E" stroke="none" />
          <path d="M18 66h60M18 74h36" />
        </svg>
      )
    case 'safe':
      return (
        <svg {...svg}>
          <path d="M48 84C24 70 12 54 12 38a18 18 0 0 1 36-4 18 18 0 0 1 36 4c0 16-12 32-36 46z" transform="translate(0 -4)" />
          <path d="M36 44l8 8 16-18" />
        </svg>
      )
  }
}

/** Four swipeable cards: plan the week, everyone has a say, the poster, and nutrition with allergy warnings. Skippable, English and Tamil.
 * `onDemo` adds the first-open choice at the end ("Explore a demo home" / "Start my household"); without it the last card just says "Done". */
export function WelcomeTour({ onClose, onDemo }: { onClose: () => void; onDemo?: () => void }) {
  const { t } = useTranslation()
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const last = index === TOUR_CARDS.length - 1

  function go(i: number) {
    const el = track.current
    if (!el) return
    const next = Math.min(TOUR_CARDS.length - 1, Math.max(0, i))
    const calm = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: next * el.clientWidth, behavior: calm ? 'auto' : 'smooth' })
    setIndex(next)
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    }
  }

  const button = 'min-h-[52px] rounded-2xl text-[15px] font-semibold'
  let footer: ReactNode
  if (last && onDemo) {
    footer = (
      <>
        <button type="button" onClick={onDemo} className={`${button} border-[1.5px] border-line-strong bg-surface`}>
          {t('demo.explore')}
        </button>
        <button type="button" onClick={onClose} className={`${button} bg-ink text-cream`}>
          {t('demo.start')}
        </button>
      </>
    )
  } else if (last) {
    footer = (
      <button type="button" onClick={onClose} className={`${button} bg-ink text-cream`}>
        {t('tour.done')}
      </button>
    )
  } else {
    footer = (
      <div className="flex gap-2.5">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={`${button} flex-1 border-[1.5px] border-line-strong bg-surface disabled:opacity-40`}>
          {t('tour.back')}
        </button>
        <button type="button" onClick={() => go(index + 1)} className={`${button} flex-[2] bg-ink text-cream`}>
          {t('tour.next')}
        </button>
      </div>
    )
  }

  return (
    <Dialog title={t('tour.title')} onClose={onClose} variant="full">
      <div className="mx-auto flex h-full w-full max-w-md flex-col px-5 pb-5 pt-3">
        <div className="flex items-center justify-between gap-3">
          <LanguageSwitch />
          <button type="button" onClick={onClose} className="rounded-xl px-3 text-[14px] font-semibold text-saffron-ink">
            {t('tour.skip')}
          </button>
        </div>

        <div
          ref={track}
          role="region"
          aria-roledescription="carousel"
          aria-label={t('tour.title')}
          tabIndex={0}
          onKeyDown={onKey}
          onScroll={(e) => setIndex(cardAt(e.currentTarget.scrollLeft, e.currentTarget.clientWidth, TOUR_CARDS.length))}
          className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TOUR_CARDS.map((card, i) => (
            <div key={card} role="group" aria-roledescription="slide" aria-label={t('tour.of', { n: i + 1, total: TOUR_CARDS.length })} className="flex w-full shrink-0 snap-center flex-col items-center justify-center gap-5 px-2 text-center">
              <span className="flex h-36 w-36 items-center justify-center rounded-[36px] bg-saffron-tint text-saffron-ink">
                <Picture card={card} />
              </span>
              <h2 className="font-display text-[24px] font-bold leading-tight">{t(`tour.${card}.title`)}</h2>
              <p className="max-w-[320px] text-[16px] leading-relaxed text-ink-soft">{t(`tour.${card}.body`)}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-3">
          <div className="flex items-center justify-center gap-2" aria-hidden="true">
            {TOUR_CARDS.map((card, i) => (
              <span key={card} className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-saffron-ink' : 'w-2.5 bg-line-strong'}`} />
            ))}
          </div>
          <p className="text-center text-[12.5px] text-muted" role="status" aria-live="polite">
            {t('tour.of', { n: index + 1, total: TOUR_CARDS.length })}
          </p>
          <div className="flex flex-col gap-2.5">{footer}</div>
        </div>
      </div>
    </Dialog>
  )
}
