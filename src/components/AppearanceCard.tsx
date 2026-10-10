import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from './ui'
import { THEME_PREFS, readThemePref, saveThemePref, type ThemePref } from '../lib/theme'

/** Light, dark, or follow the device. Everyone can set it; it only affects the phone or computer it is chosen on. */
export function AppearanceCard() {
  const { t } = useTranslation()
  const [pref, setPref] = useState<ThemePref>(readThemePref)

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[17px] font-semibold">{t('theme.appearance')}</span>
      <Card className="flex flex-col gap-1.5 px-3.5 py-3.5">
        <div role="group" aria-label={t('theme.appearance')} className="grid grid-cols-3 gap-1 rounded-xl bg-sand p-1 text-[13.5px]">
          {THEME_PREFS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={pref === p}
              onClick={() => {
                setPref(p)
                saveThemePref(p)
              }}
              className={`min-h-[40px] rounded-lg px-2 ${pref === p ? 'bg-surface font-semibold shadow-sm' : 'text-ink-soft'}`}
            >
              {t(`theme.${p}`)}
            </button>
          ))}
        </div>
        <span className="text-[12.5px] text-muted">{t('theme.hint')}</span>
      </Card>
    </div>
  )
}
