import { useTranslation } from 'react-i18next'
import { FullPageMessage, Logo } from '../components/ui'

export default function SetupNeededPage() {
  const { t } = useTranslation()
  return (
    <FullPageMessage>
      <Logo size={64} />
      <h1 className="font-display text-2xl font-bold">{t('setup.title')}</h1>
      <p className="text-[15px] leading-relaxed text-ink-soft">{t('setup.body')}</p>
      <p className="text-[13px] text-muted">{t('setup.stepsLink')}</p>
    </FullPageMessage>
  )
}
