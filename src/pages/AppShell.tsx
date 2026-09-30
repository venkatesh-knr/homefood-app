import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMyProfile, useHousehold } from '../lib/queries'
import { HomeProvider } from '../lib/homeContext'
import { FullPageMessage, LanguageSwitch, Logo } from '../components/ui'
import { InstallBanner } from '../components/InstallBanner'

const TABS = [
  { to: '/today', labelKey: 'shell.nav.today', icon: IconToday },
  { to: '/week', labelKey: 'shell.nav.week', icon: IconWeek },
  { to: '/dishes', labelKey: 'shell.nav.dishes', icon: IconDishes },
  { to: '/home', labelKey: 'shell.nav.home', icon: IconHome },
] as const

export default function AppShell() {
  const { t } = useTranslation()
  const { data: profile } = useMyProfile()
  const { data: household } = useHousehold(profile?.household_id)

  if (!profile || !household) {
    return (
      <FullPageMessage>
        <p className="text-muted">{t('common.loading')}</p>
      </FullPageMessage>
    )
  }

  return (
    <HomeProvider value={{ profile, household }}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <header className="flex items-center justify-between gap-3 px-5 py-3 print:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo size={32} />
            <span className="truncate font-display text-[16px] font-semibold">{household.name}</span>
          </div>
          <LanguageSwitch />
        </header>

        <InstallBanner />

        <div className="flex-1 pb-20">
          <Outlet />
        </div>

        <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md border-t border-line bg-white print:hidden">
          {TABS.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11.5px] font-semibold ${
                  isActive ? 'text-saffron-ink' : 'text-muted'
                }`
              }
            >
              <Icon />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </div>
    </HomeProvider>
  )
}

function IconToday() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
    </svg>
  )
}
function IconWeek() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9.5h18M8 3v3M16 3v3" />
    </svg>
  )
}
function IconDishes() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12a8 8 0 0 0 16 0Z" />
      <path d="M2 12h20M12 12V5M9 5h6" />
    </svg>
  )
}
function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}
