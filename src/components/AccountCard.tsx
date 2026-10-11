import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useAuth } from '../lib/auth'
import { accountProblem, nameMatches } from '../lib/account'
import { deleteHousehold, deleteMyAccount, downloadMyData, signOutEverywhere } from '../lib/accountMutations'
import { describeError } from '../lib/errors'
import { Card } from './ui'
import { Dialog } from './Dialog'

type Which = null | 'account' | 'household' | 'everywhere'

const row = 'flex min-h-[52px] w-full items-center justify-between gap-3 border-b border-line px-3.5 py-3 text-left text-[14.5px] last:border-b-0'

/** "Your data and account": download my data, sign out on all devices, delete my account, and (Admin) delete the household. */
export function AccountCard() {
  const { t } = useTranslation()
  const { profile } = useHome()
  const { session } = useAuth()
  const [open, setOpen] = useState<Which>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const isAdmin = profile.role === 'admin'

  async function download() {
    setBusy(true)
    setMessage(null)
    try {
      await downloadMyData(session?.user.email)
      setMessage(t('account.downloaded'))
    } catch (err) {
      setMessage(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[17px] font-semibold">{t('account.title')}</span>
      <Card className="flex flex-col">
        <button type="button" disabled={busy} onClick={() => void download()} className={row}>
          <span className="flex flex-col">
            <span className="font-semibold">{t('account.download')}</span>
            <span className="text-[12.5px] text-muted">{t('account.downloadHint')}</span>
          </span>
        </button>
        <button type="button" onClick={() => setOpen('everywhere')} className={row}>
          <span className="flex flex-col">
            <span className="font-semibold">{t('account.signOutAll')}</span>
            <span className="text-[12.5px] text-muted">{t('account.signOutAllHint')}</span>
          </span>
        </button>
        <button type="button" onClick={() => setOpen('account')} className={`${row} text-alert`}>
          <span className="font-semibold">{t('account.deleteAccount')}</span>
        </button>
        {isAdmin && (
          <button type="button" onClick={() => setOpen('household')} className={`${row} text-alert`}>
            <span className="font-semibold">{t('account.deleteHome')}</span>
          </button>
        )}
      </Card>
      <p role="status" aria-live="polite" className="min-h-[18px] px-1 text-[12.5px] text-ink-soft">
        {message}
      </p>
      {open === 'everywhere' && <SignOutAllDialog onClose={() => setOpen(null)} />}
      {open === 'account' && <DeleteAccountDialog onClose={() => setOpen(null)} />}
      {open === 'household' && <DeleteHouseholdDialog onClose={() => setOpen(null)} />}
    </div>
  )
}

function Buttons({ onClose, onConfirm, confirm, busy, disabled }: { onClose: () => void; onConfirm: () => void; confirm: string; busy: boolean; disabled?: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2.5 pt-1">
      <button type="button" onClick={onClose} disabled={busy} className="min-h-[52px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface text-[15px] font-semibold">
        {t('common.cancel')}
      </button>
      <button type="button" onClick={onConfirm} disabled={busy || disabled} className="min-h-[52px] flex-[2] rounded-2xl bg-alert text-[15px] font-semibold text-white disabled:opacity-50">
        {confirm}
      </button>
    </div>
  )
}

function Shell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Dialog title={title} onClose={onClose}>
      <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-5 pt-5">
        <h2 className="font-display text-[19px] font-bold leading-tight">{title}</h2>
        {children}
      </div>
    </Dialog>
  )
}

function SignOutAllDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <Shell title={t('account.signOutAll')} onClose={onClose}>
      <p className="text-[14px] leading-relaxed">{t('account.signOutAllBody')}</p>
      {error && <p className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{error}</p>}
      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onClose} disabled={busy} className="min-h-[52px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface text-[15px] font-semibold">
          {t('common.cancel')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true)
            signOutEverywhere().catch((err) => {
              setError(describeError(err, t))
              setBusy(false)
            })
          }}
          className="min-h-[52px] flex-[2] rounded-2xl bg-ink text-[15px] font-semibold text-cream disabled:opacity-50"
        >
          {t('account.signOutAllYes')}
        </button>
      </div>
    </Shell>
  )
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function go() {
    setBusy(true)
    setError(null)
    try {
      await deleteMyAccount()
    } catch (err) {
      setError(accountProblem(err) === 'lastAdmin' ? t('account.lastAdmin') : describeError(err, t))
      setBusy(false)
    }
  }
  return (
    <Shell title={t('account.deleteAccountTitle')} onClose={onClose}>
      <p className="text-[14px] leading-relaxed">{t('account.deleteAccountBody')}</p>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-[13.5px] text-ink-soft">
        <li>{t('account.removed')}</li>
        <li>{t('account.kept')}</li>
      </ul>
      <div role="alert">{error && <p className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{error}</p>}</div>
      <Buttons onClose={onClose} onConfirm={() => void go()} confirm={t('account.deleteAccountYes')} busy={busy} />
    </Shell>
  )
}

function DeleteHouseholdDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const { household } = useHome()
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function go() {
    setBusy(true)
    setError(null)
    try {
      await deleteHousehold(household.id, typed)
    } catch (err) {
      setError(accountProblem(err) === 'nameMismatch' ? t('account.nameMismatch') : describeError(err, t))
      setBusy(false)
    }
  }
  return (
    <Shell title={t('account.deleteHomeTitle', { name: household.name })} onClose={onClose}>
      <p className="text-[14px] leading-relaxed">{t('account.deleteHomeBody')}</p>
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
        {t('account.typeName', { name: household.name })}
        <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className="min-h-[48px] rounded-xl border border-line-strong bg-surface px-3 text-[16px]" />
      </label>
      <div role="alert">{error && <p className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{error}</p>}</div>
      <Buttons onClose={onClose} onConfirm={() => void go()} confirm={t('account.deleteHomeYes')} busy={busy} disabled={!nameMatches(typed, household.name)} />
    </Shell>
  )
}
