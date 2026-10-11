import { useTranslation } from 'react-i18next'
import { setDemoRole, useDemoState, type DemoRole } from '../demo/demoState'
import { stopDemo } from '../demo/demo'

const ROLES: DemoRole[] = ['admin', 'planner', 'member']

/** Shown on every screen while the demo home is open: says it is made up, lets you switch view, and leads to a real home. */
export function DemoBanner() {
  const { t } = useTranslation()
  const demo = useDemoState()
  if (!demo.active) return null

  return (
    <div className="print:hidden">
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-saffron/40 bg-saffron-tint px-4 py-1.5">
        <span className="text-[13px] font-semibold text-saffron-ink">{t('demo.banner')}</span>
        <button type="button" onClick={stopDemo} className="min-h-[44px] rounded-xl bg-ink px-3.5 text-[13px] font-semibold text-cream">
          {t('demo.start')}
        </button>
      </div>
      <div className="flex flex-col gap-1.5 border-b border-line bg-saffron-tint/50 px-4 py-2.5">
        <span className="text-[12.5px] font-medium text-ink-soft" id="demo-view-as">
          {t('demo.viewAs')}
        </span>
        <div role="group" aria-labelledby="demo-view-as" className="grid grid-cols-3 gap-1 rounded-xl bg-sand p-1 text-[13px]">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              aria-pressed={demo.role === role}
              onClick={() => setDemoRole(role)}
              className={`min-h-[44px] rounded-lg px-1.5 ${demo.role === role ? 'bg-surface font-semibold shadow-sm' : 'text-ink-soft'}`}
            >
              {t(`demo.role.${role}`)}
            </button>
          ))}
        </div>
        <p className="text-[12.5px] leading-snug text-ink-soft" aria-live="polite">
          {t(`demo.roleHint.${demo.role}`)}
        </p>
      </div>
    </div>
  )
}
