import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isValidBirthYear, isValidDisplayName, isValidAllergen, normaliseAllergen } from '../lib/validation'
import type { ActivityLevel, ProfileKind, Sex } from '../lib/people'
import { Button, ChipInput } from './ui'

export type PersonFormValues = {
  display_name: string
  kind: ProfileKind
  can_login: boolean
  birth_year: string
  sex: Sex | ''
  activity: ActivityLevel | ''
  allergies: string[]
}

const CURRENT_YEAR = new Date().getFullYear()

/** Add/edit form for one person — used on the setup wizard and the Home tab. */
export function PersonForm({
  initial,
  mode,
  onSave,
  onCancel,
}: {
  initial: PersonFormValues
  mode: 'add' | 'edit'
  onSave: (values: PersonFormValues) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [values, setValues] = useState(initial)
  const [showErrors, setShowErrors] = useState(false)

  const nameValid = isValidDisplayName(values.display_name)
  const birthYearValid = isValidBirthYear(values.birth_year)

  function submit() {
    if (!nameValid || !birthYearValid) {
      setShowErrors(true)
      return
    }
    onSave(values)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line-strong bg-sand/40 p-4">
      <span className="font-display text-[15px] font-semibold">
        {mode === 'add' ? t('people.form.titleAdd') : t('people.form.titleEdit')}
      </span>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('people.form.name')}</label>
        <input
          value={values.display_name}
          onChange={(e) => setValues((v) => ({ ...v, display_name: e.target.value }))}
          placeholder={t('people.form.namePlaceholder')}
          aria-invalid={showErrors && !nameValid}
          className="h-12 rounded-xl border border-line-strong bg-white px-3 text-[15px]"
        />
        {showErrors && !nameValid && <p className="text-[12.5px] text-alert">{t('people.form.errors.name')}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('people.form.kind')}</label>
        <div className="flex gap-2">
          {(['family', 'helper'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setValues((v) => ({ ...v, kind: k, can_login: k === 'helper' ? false : v.can_login }))}
              className={`h-10 flex-1 rounded-xl border text-[13.5px] font-semibold ${
                values.kind === k ? 'border-ink bg-ink text-cream' : 'border-line-strong bg-white text-ink-soft'
              }`}
            >
              {k === 'family' ? t('people.form.kindFamily') : t('people.form.kindHelper')}
            </button>
          ))}
        </div>
      </div>

      {values.kind === 'family' && (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-line-strong bg-white px-3 py-2.5 text-[14px]">
          {t('people.form.usesApp')}
          <input
            type="checkbox"
            checked={values.can_login}
            onChange={(e) => setValues((v) => ({ ...v, can_login: e.target.checked }))}
            className="h-5 w-5"
          />
        </label>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('people.form.birthYear')}</label>
        <input
          value={values.birth_year}
          onChange={(e) => setValues((v) => ({ ...v, birth_year: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
          inputMode="numeric"
          placeholder="1990"
          aria-invalid={showErrors && !birthYearValid}
          className="h-12 rounded-xl border border-line-strong bg-white px-3 text-[15px]"
        />
        {showErrors && !birthYearValid && (
          <p className="text-[12.5px] text-alert">{t('people.form.errors.birthYear', { year: CURRENT_YEAR })}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('people.form.sex')}</label>
        <select
          value={values.sex}
          onChange={(e) => setValues((v) => ({ ...v, sex: e.target.value as Sex | '' }))}
          className="h-12 rounded-xl border border-line-strong bg-white px-3 text-[15px]"
        >
          <option value="">{t('people.form.sexUnspecified')}</option>
          <option value="female">{t('people.form.sexFemale')}</option>
          <option value="male">{t('people.form.sexMale')}</option>
          <option value="other">{t('people.form.sexOther')}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('people.form.activity')}</label>
        <select
          value={values.activity}
          onChange={(e) => setValues((v) => ({ ...v, activity: e.target.value as ActivityLevel | '' }))}
          className="h-12 rounded-xl border border-line-strong bg-white px-3 text-[15px]"
        >
          <option value="">{t('people.form.activityUnspecified')}</option>
          <option value="light">{t('people.form.activityLight')}</option>
          <option value="moderate">{t('people.form.activityModerate')}</option>
          <option value="active">{t('people.form.activityActive')}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold">{t('people.form.allergies')}</label>
        <ChipInput
          values={values.allergies}
          onChange={(allergies) => setValues((v) => ({ ...v, allergies }))}
          placeholder={t('people.form.allergiesPlaceholder')}
          isValid={isValidAllergen}
          normalise={normaliseAllergen}
        />
      </div>

      <div className="mt-1 flex gap-2">
        <Button variant="secondary" className="flex-1" type="button" onClick={onCancel}>
          {t('people.form.cancel')}
        </Button>
        <Button className="flex-1" type="button" onClick={submit}>
          {t('people.form.save')}
        </Button>
      </div>
    </div>
  )
}
