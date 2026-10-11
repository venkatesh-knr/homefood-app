import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from './ui'
import { resetTips } from '../lib/tips'

/** "Show tips again": the first-visit tips come back the next time each screen opens. Per device, like the tips themselves. */
export function TipsCard() {
  const { t } = useTranslation()
  const [done, setDone] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[17px] font-semibold">{t('tips.title')}</span>
      <Card className="flex flex-col gap-1.5 px-3.5 py-3.5">
        <button
          type="button"
          onClick={() => {
            resetTips()
            setDone(true)
          }}
          className="min-h-[44px] rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[14.5px] font-semibold"
        >
          {t('tips.showAgain')}
        </button>
        <span className="text-[12.5px] text-muted" role="status">
          {done ? t('tips.showAgainDone') : t('tips.showAgainHint')}
        </span>
      </Card>
    </div>
  )
}
