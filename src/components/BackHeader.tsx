import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function BackHeader({ title, subtitle, to, action }: { title: string; subtitle?: string; to: string; action?: React.ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-2 pt-3">
      <button type="button" onClick={() => navigate(to)} aria-label={t('common.back')} className="flex h-11 w-11 items-center justify-center rounded-full">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="flex flex-1 flex-col">
        <span className="font-display text-[18px] font-semibold">{title}</span>
        {subtitle && <span className="text-[12px] text-muted">{subtitle}</span>}
      </div>
      {action}
    </div>
  )
}
