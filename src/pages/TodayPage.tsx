import { useTranslation } from 'react-i18next'

export default function TodayPage() {
  const { t } = useTranslation()
  return (
    <main className="flex flex-col items-center gap-2 px-6 pt-16 text-center">
      <p className="text-[15px] text-ink-soft">{t('placeholder.today')}</p>
    </main>
  )
}
