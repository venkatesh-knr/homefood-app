import { useTranslation } from 'react-i18next'
import { useInstallPrompt } from '../lib/installPrompt'
import { useDeviceFlag } from '../lib/onboarding'
import { Button } from './ui'

/** A dismissible nudge to install the PWA — the browser's own menu buries this otherwise. */
export function InstallBanner() {
  const { t } = useTranslation()
  const { canPromptInstall, canShowIOSInstructions, promptInstall } = useInstallPrompt()
  const [dismissed, dismiss] = useDeviceFlag('homefood.installBannerDismissed')

  if (dismissed || (!canPromptInstall && !canShowIOSInstructions)) return null

  return (
    <div className="mx-5 mt-2 flex items-start gap-3 rounded-2xl border border-line-strong bg-white px-3.5 py-3 print:hidden">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-saffron text-ink" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h14V10" />
        </svg>
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <span className="text-[14px] font-semibold">{t('install.title')}</span>
        <span className="text-[12.5px] text-muted">{canPromptInstall ? t('install.body') : t('install.iosBody')}</span>
        <div className="flex items-center gap-4 pt-0.5">
          {canPromptInstall && (
            <Button variant="text" className="min-h-0! p-0 text-[13px]" onClick={() => void promptInstall()}>
              {t('install.installAction')}
            </Button>
          )}
          <button type="button" onClick={dismiss} className="text-[13px] font-semibold text-muted">
            {t('install.dismiss')}
          </button>
        </div>
      </div>
    </div>
  )
}
