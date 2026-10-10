import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { updateHousehold } from '../lib/mutations'
import { describeError } from '../lib/errors'
import { isValidHomeName } from '../lib/validation'
import type { Household } from '../lib/people'
import { Button, Card, Toggle } from './ui'

/** Admin-only: rename the home, switch its default language for new members, toggle snacks — set once at
 * first-run setup ("You can change all of this later"), actually changeable here. */
export function HomeSettingsCard({ household }: { household: Household }) {
  const { t } = useTranslation()
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(household.name)
  const [busy, setBusy] = useState<'name' | 'language' | 'snacks' | 'weekStart' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function save(patch: Partial<Pick<Household, 'name' | 'default_language' | 'snacks_enabled' | 'week_start'>>, key: 'name' | 'language' | 'snacks' | 'weekStart') {
    setBusy(key)
    setError(null)
    try {
      await updateHousehold(household.id, patch)
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(null)
    }
  }

  async function onSaveName(e: FormEvent) {
    e.preventDefault()
    if (!isValidHomeName(name)) return
    await save({ name: name.trim() }, 'name')
    setEditingName(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[17px] font-semibold">{t('home.settings')}</span>
      <Card className="flex flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-3.5 text-[14.5px]">
          <span>{t('home.homeName')}</span>
          {editingName ? (
            <form className="flex items-center gap-2" onSubmit={onSaveName}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="h-10 w-36 rounded-xl border border-line-strong bg-white px-2.5 text-[14px]"
              />
              <Button variant="text" type="submit" disabled={busy === 'name' || !isValidHomeName(name)} className="min-h-0">
                {t('common.save')}
              </Button>
            </form>
          ) : (
            <button
              type="button"
              className="font-semibold text-saffron-ink"
              onClick={() => {
                setName(household.name)
                setEditingName(true)
              }}
            >
              {household.name} · {t('people.editAction')}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-3.5 text-[14.5px]">
          <span>{t('home.defaultLanguage')}</span>
          <div role="group" aria-label={t('home.defaultLanguage')} className="inline-flex gap-1 rounded-xl bg-sand p-1 text-[13.5px]">
            {(['en', 'ta'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                lang={lang}
                aria-pressed={household.default_language === lang}
                disabled={busy === 'language'}
                onClick={() => save({ default_language: lang }, 'language')}
                className={`min-h-[36px] rounded-lg px-3 ${household.default_language === lang ? 'bg-white font-semibold shadow-sm' : 'text-ink-soft'}`}
              >
                {t(`language.${lang}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-b border-line px-3.5 py-3.5 text-[14.5px]">
          <div className="flex items-center justify-between gap-3">
            <span>{t('onboarding.step1.weekStartsOn')}</span>
            <div role="group" aria-label={t('onboarding.step1.weekStartsOn')} className="inline-flex gap-1 rounded-xl bg-sand p-1 text-[13.5px]">
              {([1, 7] as const).map((day) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={household.week_start === day}
                  disabled={busy === 'weekStart'}
                  onClick={() => household.week_start !== day && save({ week_start: day }, 'weekStart')}
                  className={`min-h-[36px] rounded-lg px-3 ${household.week_start === day ? 'bg-white font-semibold shadow-sm' : 'text-ink-soft'}`}
                >
                  {t(day === 1 ? 'onboarding.step1.monday' : 'onboarding.step1.sunday')}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[12.5px] text-muted">{t('home.weekStartHint')}</span>
        </div>

        <div className="flex items-center justify-between px-3.5 py-3.5 text-[14.5px]">
          <label htmlFor="home-settings-snacks">{t('onboarding.step1.snacks')}</label>
          <Toggle
            checked={household.snacks_enabled}
            onChange={(next) => save({ snacks_enabled: next }, 'snacks')}
            label={t('onboarding.step1.snacks')}
          />
        </div>
      </Card>
      {error && <p className="rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}
    </div>
  )
}
