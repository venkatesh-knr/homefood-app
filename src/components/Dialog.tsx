import { useEffect, useRef, type ReactNode } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** A modal dialog: Tab stays inside it, Escape closes it, focus goes in when it opens and back to what opened it when it closes.
 * `variant="sheet"` slides up from the bottom of the screen on a phone; `"full"` fills the screen. */
export function Dialog({ title, onClose, children, variant = 'sheet' }: { title: string; onClose: () => void; children: ReactNode; variant?: 'sheet' | 'full' }) {
  const panel = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const node = panel.current!
    const items = () => [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement)
    ;(items()[0] ?? node).focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close.current()
      } else if (e.key === 'Tab') {
        const list = items()
        if (list.length === 0) return e.preventDefault()
        const first = list[0]!
        const last = list[list.length - 1]!
        if (e.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && (document.activeElement === last || !node.contains(document.activeElement))) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [])

  const layout = variant === 'full' ? 'bg-cream' : 'items-end justify-center bg-ink/50'
  return (
    <div className={`fixed inset-0 z-50 flex ${layout} print:hidden`} onMouseDown={(e) => variant === 'sheet' && e.target === e.currentTarget && close.current()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={variant === 'full' ? 'flex h-full min-h-0 w-full flex-col' : 'flex max-h-[88vh] w-full max-w-md flex-col rounded-t-3xl bg-cream shadow-xl'}
      >
        {children}
      </div>
    </div>
  )
}
