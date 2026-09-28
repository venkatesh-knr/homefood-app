import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isConfigured } from './lib/supabase'
import { useAuth } from './lib/auth'
import { useMyProfile } from './lib/queries'
import { useOnboarded } from './lib/onboarding'
import { FullPageMessage } from './components/ui'
import type { Profile } from './lib/people'
import SetupNeededPage from './pages/SetupNeededPage'
import SignInPage from './pages/SignInPage'
import JoinPage from './pages/JoinPage'
import SetupHomeStep1Page from './pages/SetupHomeStep1Page'
import SetupHomeStep2Page from './pages/SetupHomeStep2Page'
import AppShell from './pages/AppShell'
import TodayPage from './pages/TodayPage'
import WeekPage from './pages/WeekPage'
import DishesPage from './pages/DishesPage'
import AddDishPage from './pages/AddDishPage'
import DishDetailPage from './pages/DishDetailPage'
import HomeTabPage from './pages/HomeTabPage'

export default function App() {
  const { t } = useTranslation()
  const { loading } = useAuth()

  if (!isConfigured) return <SetupNeededPage />
  if (loading) return <FullPageMessage><p className="text-muted">{t('common.loading')}</p></FullPageMessage>

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/join/:token" element={<JoinPage />} />
        <Route path="/*" element={<AuthedArea />} />
      </Routes>
    </BrowserRouter>
  )
}

function AuthedArea() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const { data: profile, isLoading } = useMyProfile()

  if (!session) return <SignInPage />
  if (isLoading) return <FullPageMessage><p className="text-muted">{t('common.loading')}</p></FullPageMessage>
  if (!profile) return <SetupHomeStep1Page />
  return <OnboardingGate profile={profile} />
}

function OnboardingGate({ profile }: { profile: Profile }) {
  const [onboarded, markOnboarded] = useOnboarded(profile.household_id)

  if (!onboarded) return <SetupHomeStep2Page profile={profile} onDone={markOnboarded} />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="today" element={<TodayPage />} />
        <Route path="week" element={<WeekPage />} />
        <Route path="dishes" element={<DishesPage />} />
        <Route path="dishes/new" element={<AddDishPage />} />
        <Route path="dishes/:dishId/edit" element={<AddDishPage />} />
        <Route path="dishes/:dishId" element={<DishDetailPage />} />
        <Route path="home" element={<HomeTabPage />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
    </Routes>
  )
}
