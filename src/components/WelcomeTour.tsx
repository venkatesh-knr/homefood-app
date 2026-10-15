import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from './Dialog'
import { LanguageSwitch } from './ui'
import { cardAt, TOUR_CARDS } from '../lib/tour'

// The photos come from the HomeFood onboarding design (public/tour/*.webp, cropped from its four pages); the words stay live so they follow the language.
const photo = (card: string) => `${import.meta.env.BASE_URL}tour/${card}.webp`
const WHOLE = ['say', 'safe']
const FADE ='[mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)]'

/** Four swipeable cards: plan the week, everyone has a say, the poster, and nutrition with allergy warnings. Skippable, English and Tamil.
 * `onDemo` adds the first-open choice at the end ("Explore a demo home" / "Start my household"); without it the last card just says "Done". */
export function WelcomeTour({ onClose, onDemo }: { onClose: () => void; onDemo?: () => void }) {
  const { t } = useTranslation()
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const last = index === TOUR_CARDS.length - 1

  // While a Next / Back press is still sliding, the scroll position passes through the cards in between: ignore it, and let quick repeated
  // presses keep counting from where the slide is heading.
  const heading = useRef(0)
  const sliding = useRef<ReturnType<typeof setTimeout> | null>(null)

  function go(i: number) {
    const el = track.current
    if (!el) return
    const next = Math.min(TOUR_CARDS.length - 1, Math.max(0, i))
    const calm = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    heading.current = next
    if (sliding.current) clearTimeout(sliding.current)
    sliding.current = setTimeout(() => {
      sliding.current = null
      // quick repeated presses can cancel each other's slide: make sure the row ends on the card it was heading for
      if (Math.abs(el.scrollLeft - heading.current * el.clientWidth) > 2) el.scrollTo({ left: heading.current * el.clientWidth, behavior: 'auto' })
    }, calm ? 50 : 650)
    el.scrollTo({ left: next * el.clientWidth, behavior: calm ? 'auto' : 'smooth' })
    setIndex(next)
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(heading.current + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(heading.current - 1)
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
        <button type="button" onClick={() => go(heading.current - 1)} className="min-h-[44px] rounded-xl text-[14px] font-semibold text-saffron-ink">
          {t('tour.back')}
        </button>
      </>
    )
  } else if (last) {
    footer = (
      <>
        <button type="button" onClick={onClose} className={`${button} bg-ink text-cream`}>
          {t('tour.done')}
        </button>
        <button type="button" onClick={() => go(heading.current - 1)} className="min-h-[44px] rounded-xl text-[14px] font-semibold text-saffron-ink">
          {t('tour.back')}
        </button>
      </>
    )
  } else {
    footer = (
      <div className="flex gap-2.5">
        <button type="button" onClick={() => go(heading.current - 1)} disabled={index === 0} className={`${button} flex-1 border-[1.5px] border-line-strong bg-surface disabled:opacity-40`}>
          {t('tour.back')}
        </button>
        <button type="button" onClick={() => go(heading.current + 1)} className={`${button} flex-[2] bg-ink text-cream`}>
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
          onScroll={(e) => {
            if (sliding.current) return
            const at = cardAt(e.currentTarget.scrollLeft, e.currentTarget.clientWidth, TOUR_CARDS.length)
            heading.current = at
            setIndex(at)
          }}
          className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TOUR_CARDS.map((card, i) => (
            <div key={card} role="group" aria-roledescription="slide" aria-label={t('tour.of', { n: i + 1, total: TOUR_CARDS.length })} className="flex w-full shrink-0 snap-center flex-col items-center gap-3 text-center">
              <h2 className="pt-2 font-display text-[26px] font-bold leading-tight">{t(`tour.${card}.title`)}</h2>
              <span className="h-[3px] w-14 rounded-full bg-saffron" aria-hidden="true" />
              <p className="max-w-[320px] text-[16px] leading-relaxed text-ink-soft">{t(`tour.${card}.body`)}</p>
              {WHOLE.includes(card) ? (
                // family photos: shown whole so every face stays in frame (cropping to the tall card cut people off)
                <div className="flex min-h-0 w-full flex-1 items-center">
                  <img src={photo(card)} alt="" loading="lazy" className="max-h-full w-full rounded-2xl object-contain" />
                </div>
              ) : (
                <div className="relative min-h-0 w-full flex-1">
                  <img src={photo(card)} alt="" loading={i === 0 ? 'eager' : 'lazy'} className={`absolute inset-0 h-full w-full object-cover ${FADE}`} />
                </div>
              )}
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
