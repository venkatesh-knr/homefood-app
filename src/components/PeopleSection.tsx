import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAllergies, useMembers } from '../lib/queries'
import { addPerson, removePerson, updatePerson } from '../lib/mutations'
import { avatarColor, personDetailText, type Profile } from '../lib/people'
import { PersonForm, type PersonFormValues } from './PersonForm'
import { PersonRow } from './PersonRow'
import { Pill } from './ui'

const BLANK: PersonFormValues = {
  display_name: '',
  kind: 'family',
  can_login: true,
  birth_year: '',
  sex: '',
  activity: '',
  allergies: [],
}

function toFormValues(p: Profile, allergies: string[]): PersonFormValues {
  return {
    display_name: p.display_name,
    kind: p.kind,
    can_login: p.can_login,
    birth_year: p.birth_year === null ? '' : String(p.birth_year),
    sex: p.sex ?? '',
    activity: p.activity ?? '',
    allergies,
  }
}

function statusPill(t: (k: string) => string, p: Profile) {
  if (p.kind === 'helper') return <Pill>{t('people.cookOnly')}</Pill>
  if (!p.can_login) return <Pill>{t('people.noLogin')}</Pill>
  return <Pill tone={p.user_id ? 'success' : 'neutral'}>{p.user_id ? t('people.joined') : t('people.invited')}</Pill>
}

export function PeopleSection({ householdId, myProfileId, isAdmin }: { householdId: string; myProfileId: string; isAdmin: boolean }) {
  const { t } = useTranslation()
  const { data: members } = useMembers(householdId)
  const ids = useMemo(() => (members ?? []).map((m) => m.id), [members])
  const { data: allergyRows } = useAllergies(ids)
  const [editing, setEditing] = useState<'new' | string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allergiesFor = (profileId: string) => (allergyRows ?? []).filter((a) => a.profile_id === profileId).map((a) => a.allergen)

  async function onAdd(values: PersonFormValues) {
    setBusy(true)
    setError(null)
    try {
      await addPerson(householdId, values)
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  async function onUpdate(profileId: string, values: PersonFormValues) {
    setBusy(true)
    setError(null)
    try {
      await updatePerson(profileId, householdId, values)
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(profileId: string) {
    setBusy(true)
    setError(null)
    try {
      await removePerson(profileId, householdId)
      setRemoving(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[17px] font-semibold">{t('home.people')}</span>
      {(members ?? []).map((m, i) =>
        editing === m.id ? (
          <PersonForm
            key={m.id}
            mode="edit"
            initial={toFormValues(m, allergiesFor(m.id))}
            onCancel={() => setEditing(null)}
            onSave={(values) => onUpdate(m.id, values)}
          />
        ) : (
          <PersonRow
            key={m.id}
            name={m.display_name}
            detail={personDetailText(t, m, allergiesFor(m.id))}
            color={avatarColor(i, m.kind)}
            right={statusPill(t, m)}
          >
            {isAdmin && (
              <div className="flex gap-4 pl-[54px] text-[13px] font-semibold text-saffron-ink">
                <button type="button" onClick={() => setEditing(m.id)}>
                  {t('people.editAction')}
                </button>
                {m.id !== myProfileId &&
                  (removing === m.id ? (
                    <span className="flex items-center gap-2 text-ink-soft">
                      {t('people.removeConfirm', { name: m.display_name })}
                      <button type="button" className="text-alert" disabled={busy} onClick={() => onRemove(m.id)}>
                        {t('people.removeYes')}
                      </button>
                      <button type="button" onClick={() => setRemoving(null)}>
                        {t('people.removeNo')}
                      </button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setRemoving(m.id)}>
                      {t('people.removeAction')}
                    </button>
                  ))}
              </div>
            )}
          </PersonRow>
        ),
      )}

      {isAdmin &&
        (editing === 'new' ? (
          <PersonForm mode="add" initial={BLANK} onCancel={() => setEditing(null)} onSave={onAdd} />
        ) : (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron-ink/60 text-[14.5px] font-semibold text-saffron-ink"
          >
            <span aria-hidden="true">+</span>
            {t('home.addAnotherPerson')}
          </button>
        ))}
      {error && <p className="rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}
    </div>
  )
}
