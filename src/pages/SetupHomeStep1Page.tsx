import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { createHousehold, saveDraftPeople } from '../lib/mutations'
import { avatarColor, newPersonDraft, personDetailText, type PersonDraft } from '../lib/people'
import { isValidDisplayName, isValidHomeName } from '../lib/validation'
import { Button, Card, LanguageSwitch, Logo, Pill, Toggle, TogglePill } from '../components/ui'
import { PersonForm, type PersonFormValues } from '../components/PersonForm'
import { PersonRow } from '../components/PersonRow'

function draftToFormValues(d: PersonDraft): PersonFormValues {
  const { tempId: _tempId, ...rest } = d
  return rest
}

export default function SetupHomeStep1Page() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [homeName, setHomeName] = useState('')
  const [yourName, setYourName] = useState('')
  const [snacks, setSnacks] = useState(true)
  const [drafts, setDrafts] = useState<PersonDraft[]>([])
  const [editing, setEditing] = useState<'new' | string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const homeNameValid = isValidHomeName(homeName)
  const yourNameValid = isValidDisplayName(yourName)
  const logins = 1 + drafts.filter((d) => d.kind === 'family' && d.can_login).length
  const totalPeople = 1 + drafts.length

  function addDraft(values: PersonFormValues) {
    setDrafts((ds) => [...ds, { ...values, tempId: crypto.randomUUID() }])
    setEditing(null)
  }
  function updateDraft(tempId: string, values: PersonFormValues) {
    setDrafts((ds) => ds.map((d) => (d.tempId === tempId ? { ...values, tempId } : d)))
    setEditing(null)
  }
  function removeDraft(tempId: string) {
    setDrafts((ds) => ds.filter((d) => d.tempId !== tempId))
    setRemoving(null)
  }

  async function onNext() {
    setError(null)
    if (!homeNameValid || !yourNameValid) {
      setShowErrors(true)
      return
    }
    setBusy(true)
    try {
      const householdId = await createHousehold({
        homeName,
        displayName: yourName,
        language: i18n.language as 'en' | 'ta',
        snacksEnabled: snacks,
      })
      if (drafts.length > 0) await saveDraftPeople(householdId, drafts)
      navigate('/setup/invite', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-6">
      <div className="flex flex-col gap-1.5 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-saffron-ink">{t('onboarding.step1.stepLabel')}</span>
          <Logo size={36} />
        </div>
        <h1 className="font-display text-[24px] font-bold">{t('onboarding.step1.title')}</h1>
        <p className="text-[14px] text-ink-soft">{t('onboarding.step1.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <label className="px-1 text-[13.5px] font-semibold">{t('onboarding.step1.homeNameLabel')}</label>
        <input
          value={homeName}
          onChange={(e) => setHomeName(e.target.value)}
          placeholder={t('onboarding.step1.homeNamePlaceholder')}
          aria-invalid={showErrors && !homeNameValid}
          className="h-[50px] rounded-2xl border border-line-strong bg-white px-3.5 text-base"
        />
        {showErrors && !homeNameValid && <p className="px-1 text-[12.5px] text-alert">{t('onboarding.step1.errors.homeName')}</p>}
      </div>

      <div className="flex flex-col gap-2 pt-3">
        <label className="px-1 text-[13.5px] font-semibold">{t('onboarding.step1.yourNameLabel')}</label>
        <input
          value={yourName}
          onChange={(e) => setYourName(e.target.value)}
          placeholder={t('onboarding.step1.yourNamePlaceholder')}
          aria-invalid={showErrors && !yourNameValid}
          className="h-[50px] rounded-2xl border border-line-strong bg-white px-3.5 text-base"
        />
        {showErrors && !yourNameValid && <p className="px-1 text-[12.5px] text-alert">{t('onboarding.step1.errors.yourName')}</p>}
      </div>

      <Card className="mt-3.5 flex flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-3.5 text-[14.5px]">
          <span>{t('onboarding.step1.language')}</span>
          <LanguageSwitch />
        </div>
        <div className="flex items-center justify-between px-3.5 py-3.5 text-[14.5px]">
          <span>{t('onboarding.step1.weekStartsOn')}</span>
          <span className="font-semibold">{t('onboarding.step1.monday')}</span>
        </div>
        <div className="flex items-center justify-between border-t border-line px-3.5 py-3.5 text-[14.5px]">
          <label htmlFor="snacks">{t('onboarding.step1.snacks')}</label>
          <Toggle checked={snacks} onChange={setSnacks} label={t('onboarding.step1.snacks')} />
        </div>
      </Card>

      <div className="flex items-baseline justify-between pt-6 pb-1">
        <span className="font-display text-[17px] font-semibold">{t('onboarding.step1.whoLivesHere')}</span>
        <span className="text-[13px] text-muted">
          {t('onboarding.step1.peopleCount', { count: totalPeople })} · {t('onboarding.step1.loginsCount', { count: logins })}
        </span>
      </div>
      <p className="pb-2.5 text-[13px] leading-relaxed text-ink-soft">{t('onboarding.step1.whoLivesHereHint')}</p>

      <div className="flex flex-col gap-2">
        {yourName.trim() ? (
          <PersonRow
            name={yourName.trim()}
            detail={t('people.admin')}
            color={avatarColor(0, 'family')}
            right={<Pill tone="success">{t('people.signedIn')}</Pill>}
          />
        ) : (
          <p className="rounded-2xl border border-dashed border-line-strong px-3.5 py-3 text-[13.5px] text-muted">
            {t('onboarding.step1.yourNameLabel')} ↑
          </p>
        )}

        {drafts.map((d, i) =>
          editing === d.tempId ? (
            <PersonForm
              key={d.tempId}
              mode="edit"
              initial={draftToFormValues(d)}
              onCancel={() => setEditing(null)}
              onSave={(values) => updateDraft(d.tempId, values)}
            />
          ) : (
            <PersonRow
              key={d.tempId}
              name={d.display_name || t('people.form.namePlaceholder')}
              detail={personDetailText(t, { kind: d.kind, role: 'member', birth_year: d.birth_year.trim() === '' ? null : Number(d.birth_year) }, d.allergies)}
              color={avatarColor(i + 1, d.kind)}
              right={
                d.kind === 'helper' ? (
                  <Pill>{t('people.cookOnly')}</Pill>
                ) : (
                  <TogglePill
                    pressed={d.can_login}
                    onClick={() => updateDraft(d.tempId, { ...draftToFormValues(d), can_login: !d.can_login })}
                    onLabel={t('people.willLogIn')}
                    offLabel={t('people.noLogin')}
                  />
                )
              }
            >
              <div className="flex gap-4 pl-[54px] text-[13px] font-semibold text-saffron-ink">
                <button type="button" onClick={() => setEditing(d.tempId)}>
                  {t('people.editAction')}
                </button>
                {removing === d.tempId ? (
                  <span className="flex items-center gap-2 text-ink-soft">
                    {t('people.removeConfirm', { name: d.display_name })}
                    <button type="button" className="text-alert" onClick={() => removeDraft(d.tempId)}>
                      {t('people.removeYes')}
                    </button>
                    <button type="button" onClick={() => setRemoving(null)}>
                      {t('people.removeNo')}
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setRemoving(d.tempId)}>
                    {t('people.removeAction')}
                  </button>
                )}
              </div>
            </PersonRow>
          ),
        )}

        {editing === 'new' ? (
          <PersonForm mode="add" initial={newPersonDraft()} onCancel={() => setEditing(null)} onSave={addDraft} />
        ) : (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron-ink/60 text-[14.5px] font-semibold text-saffron-ink"
          >
            <span aria-hidden="true">+</span>
            {t('onboarding.step1.addPerson')}
          </button>
        )}
        <p className="px-1 pt-0.5 text-[12.5px] leading-relaxed text-muted">{t('onboarding.step1.addPersonHint')}</p>
      </div>

      {error && <p className="mt-3 rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}

      <div className="mt-6 border-t border-line pt-4">
        <Button className="w-full" disabled={busy} onClick={onNext}>
          {t('onboarding.step1.next')}
        </Button>
      </div>
    </main>
  )
}
