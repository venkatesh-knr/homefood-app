import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { BackHeader } from '../components/BackHeader'
import { PeopleSection } from '../components/PeopleSection'
import { InviteCard } from '../components/InviteCard'
import { HomeSettingsCard } from '../components/HomeSettingsCard'
import { BalanceLimitsCard } from '../components/BalanceLimitsCard'
import { OurShopItemsCard } from '../components/OurShopItemsCard'
import { MyGoalsCard } from '../components/MyGoalsCard'
import { AppearanceCard } from '../components/AppearanceCard'
import { TipsCard } from '../components/TipsCard'
import { DietsSection } from '../components/DietsSection'
import { FastingSection } from '../components/FastingSection'
import { zonedParts } from '../lib/prep'
import { AccountCard } from '../components/AccountCard'
import { useDemoState } from '../demo/demoState'

/** One screen of the Home menu (/home/:section): the cards that used to be stacked on the Home tab, each on its own screen. */
export default function HomeSectionPage() {
  const { t } = useTranslation()
  const { section } = useParams<{ section: string }>()
  const { profile, household } = useHome()
  const demo = useDemoState()
  const isAdmin = profile.role === 'admin'

  let title: string
  let body: ReactNode
  switch (section) {
    case 'family':
      title = t('home.menu.family')
      body = (
        <>
          <PeopleSection householdId={household.id} myProfileId={profile.id} isAdmin={isAdmin} />
          {isAdmin && (
            <div className="flex flex-col gap-2">
              <span className="font-display text-[17px] font-semibold">{t('home.invite')}</span>
              <InviteCard household={household} myProfileId={profile.id} />
            </div>
          )}
        </>
      )
      break
    case 'settings':
      if (!isAdmin) return <Navigate to="/home" replace />
      title = t('home.menu.settings')
      body = (
        <>
          <HomeSettingsCard household={household} />
          <BalanceLimitsCard household={household} />
        </>
      )
      break
    case 'diets':
      title = t('home.menu.diets')
      body = <DietsSection />
      break
    case 'fasting':
      title = t('fasting.title')
      body = <FastingSection today={zonedParts(new Date(), household.timezone).date} />
      break
    case 'items':
      title = t('home.menu.items')
      body = <OurShopItemsCard householdId={household.id} profileId={profile.id} isAdmin={isAdmin} showEmpty />
      break
    case 'goals':
      title = t('home.menu.goals')
      body = <MyGoalsCard />
      break
    case 'app':
      title = t('home.menu.app')
      body = (
        <>
          <AppearanceCard />
          <TipsCard />
        </>
      )
      break
    case 'account':
      if (demo.active) return <Navigate to="/home" replace />
      title = t('home.menu.account')
      body = <AccountCard />
      break
    default:
      return <Navigate to="/home" replace />
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-5 pb-8">
      <BackHeader title={title} to="/home" />
      {body}
    </main>
  )
}
