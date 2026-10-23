import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/** Opening a screen starts at its top (not wherever the last screen was scrolled to) and puts keyboard / screen-reader focus on the page itself.
 * Going BACK is left to the browser, which puts you where you were. */
export function useRouteFocus() {
  const { pathname } = useLocation()
  const type = useNavigationType()
  const first = useRef(true)
  useEffect(() => {
    if (first.current || type === 'POP') {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
    const main = document.querySelector('main')
    if (main instanceof HTMLElement) {
      main.tabIndex = -1
      main.focus({ preventScroll: true })
    }
  }, [pathname, type])
}

/** Brings a form that has just opened into view and focuses its first field, so it is never left off-screen below the thing that was tapped. */
export function useRevealOnOpen<T extends HTMLElement>(open: boolean, key: string | number | null = null) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!open || !ref.current) return
    ref.current.scrollIntoView({ block: 'center' })
    ref.current.querySelector<HTMLElement>('input, textarea, select')?.focus({ preventScroll: true })
  }, [open, key])
  return ref
}
