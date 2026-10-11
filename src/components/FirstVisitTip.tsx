import { useTranslation } from 'react-i18next'
import { dismissTip, useTipVisible, type TipId } from '../lib/tips'

/** One short pointer the first time a screen opens. It sits in the page (never over the main action) and goes for good with "Got it". */
export function FirstVisitTip({ id, className = '' }: { id: TipId; className?: string }) {
  const { t } = useTranslation()
  const visible = useTipVisible(id)
  if (!visible) return null

  function gotIt() {
    dismissTip(id)
    // The button is about to disappear: hand focus to the page so keyboard and screen-reader users are not dropped at the top of the document.
    const main = document.querySelector('main')
    if (main) {
      main.setAttribute('tabindex', '-1')
      main.focus({ preventScroll: true })
    }
  }

  return (
    <section role="note" aria-label={t('tips.label')} className={`flex items-start gap-2.5 rounded-2xl border border-saffron/40 bg-saffron-tint py-1.5 pl-3.5 pr-1.5 print:hidden ${className}`}>
      <svg className="mt-3 shrink-0 text-saffron-ink" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
      </svg>
      <p className="flex-1 py-2.5 text-[13.5px] leading-snug text-ink">{t(`tips.${id}`)}</p>
      <button type="button" onClick={gotIt} className="min-h-[44px] shrink-0 rounded-xl px-3 text-[13px] font-semibold text-saffron-ink">
        {t('tips.gotIt')}
      </button>
    </section>
  )
}
