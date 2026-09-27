import { useTranslation } from 'react-i18next'
import { isConfigured } from './lib/supabase'
import { useAuth } from './lib/auth'
import { FullPageMessage } from './components/ui'
import SetupNeededPage from './pages/SetupNeededPage'
import SignInPage from './pages/SignInPage'
import WelcomePage from './pages/WelcomePage'

export default function App() {
  const { t } = useTranslation()
  const { session, loading } = useAuth()

  if (!isConfigured) return <SetupNeededPage />
  if (loading) return <FullPageMessage><p className="text-muted">{t('common.loading')}</p></FullPageMessage>
  if (!session) return <SignInPage />
  return <WelcomePage />
}
