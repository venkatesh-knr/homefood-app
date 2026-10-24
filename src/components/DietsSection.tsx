import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, Toggle } from './ui'
import { Dialog } from './Dialog'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { avatarColor } from '../lib/people'
import { describeError } from '../lib/errors'
import { useDietPreferences } from '../lib/dietQueries'
import { savePreferences } from '../lib/dietMutations'
import { EMPTY_PREFERENCES, preferenceParts, type PrefFlag, type Preferences } from '../lib/diets'
import type { DietType } from '../lib/dishes'
import type { Profile } from '../lib/people'

const chip = (on: boolean) => `min-h-[44px] rounded-full px-4 text-[14px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`
const DIETS: (DietType | null)[] = ['veg', 'egg', 'non_veg', null]
const FLAG_ORDER: PrefFlag[] = ['no_onion_garlic', 'low_oil', 'low_salt', 'low_sugar']

/** Home › Our home › Diets and fasting. Everyone in the home can read it (the Planner and the cooks need it); a person sets their own, the Admin sets the
 * preferences of a family member nobody has logged in as yet. Preferences, never medical conditions. */
export function DietsSection() {
  const { t } = useTranslation()
  const { profile, household } = useHome()
  const { data: members } = useMembers(household.id)
  const { data: prefs } = useDietPreferences(household.id)
  const [editing, setEditing] = useState<Profile | null>(null)
  const family = (members ?? []).filter((m) => m.kind === 'family')
  const canEdit = (m: Profile) => m.id === profile.id || (profile.role === 'admin' && m.user_id === null)

  return (
    <div className="flex flex-col gap-5">
      <section aria-label={t('diets.prefsTitle')} className="flex flex-col gap-2">
        <h2 className="px-1 font-display text-[17px] font-semibold">{t('diets.prefsTitle')}</h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {family.map((m, i) => {
            const parts = preferenceParts(prefs?.get(m.id), (k) => t(`diets.${k}`))
            const inner = (
              <>
                <Avatar name={m.display_name} color={avatarColor(members?.indexOf(m) ?? i, m.kind)} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="break-words text-[15.5px] font-semibold">{m.display_name}</span>
                  <span className="break-words text-[13px] text-ink-soft">{parts.length > 0 ? parts.join(' · ') : t('diets.notSet')}</span>
                </span>
                {canEdit(m) && <span aria-hidden="true" className="shrink-0 text-[22px] leading-none text-muted">›</span>}
              </>
            )
            const cls = `flex min-h-[64px] w-full items-center gap-3 px-4 py-2.5 text-left ${i > 0 ? 'border-t border-line' : ''}`
            return canEdit(m) ? (
              <button key={m.id} type="button" onClick={() => setEditing(m)} aria-label={t('diets.editFor', { name: m.display_name })} className={cls}>{inner}</button>
            ) : (
              <div key={m.id} className={cls}>{inner}</div>
            )
          })}
        </div>
        <p className="px-1 text-[12.5px] leading-relaxed text-muted">{t('diets.prefsHint')}</p>
      </section>

      {editing && <PreferencesSheet person={editing} current={prefs?.get(editing.id)} householdId={household.id} byId={profile.id} onClose={() => setEditing(null)} />}
    </div>
  )
}

function PreferencesSheet({ person, current, householdId, byId, onClose }: { person: Profile; current: Preferences | undefined; householdId: string; byId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const [value, setValue] = useState<Preferences>(current ?? EMPTY_PREFERENCES(person.id))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSave() {
    setBusy(true)
    setError(null)
    try {
      await savePreferences({ householdId, by: byId, prefs: value })
      onClose()
    } catch (err) {
      setError(describeError(err, t))
      setBusy(false)
    }
  }

  return (
    <Dialog title={t('diets.editTitle', { name: person.display_name })} onClose={onClose}>
      <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-5 pt-5">
        <h2 className="break-words font-display text-[19px] font-bold leading-tight">{t('diets.editTitle', { name: person.display_name })}</h2>

        <div className="flex flex-col gap-1.5">
          <span id="diet-eats" className="text-[12.5px] font-semibold text-ink-soft">{t('diets.eats')}</span>
          <div role="radiogroup" aria-labelledby="diet-eats" className="flex flex-wrap gap-1.5">
            {DIETS.map((d) => (
              <button key={d ?? 'none'} type="button" role="radio" aria-checked={value.diet === d} onClick={() => setValue({ ...value, diet: d })} className={chip(value.diet === d)}>
                {d ? t(`diets.diet.${d}`) : t('diets.diet.none')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {FLAG_ORDER.map((flag, i) => (
            <div key={flag} className={`flex min-h-[52px] items-center justify-between gap-3 px-4 py-2 ${i > 0 ? 'border-t border-line' : ''}`}>
              <span className="min-w-0 break-words text-[15px]">{t(`diets.flag.${flag}`)}</span>
              <Toggle checked={value[flag]} onChange={(on) => setValue({ ...value, [flag]: on })} label={t(`diets.flag.${flag}`)} />
            </div>
          ))}
        </div>
        <p className="text-[12.5px] leading-relaxed text-muted">{t('diets.sheetHint')}</p>

        {error && <p role="alert" className="text-[13px] text-alert">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[14px] font-semibold">{t('common.cancel')}</button>
          <button type="button" disabled={busy} onClick={onSave} className="min-h-[48px] flex-1 rounded-xl bg-ink px-3 text-[14.5px] font-semibold text-cream disabled:opacity-60">{t('common.save')}</button>
        </div>
      </div>
    </Dialog>
  )
}

