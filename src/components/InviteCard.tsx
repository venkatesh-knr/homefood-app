import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createInvite, revokeInvite } from '../lib/mutations'
import { useInvites, useMembers } from '../lib/queries'
import { avatarColor, daysUntil, inviteState, inviteUrl, joinNames, type Household } from '../lib/people'
import { Avatar, Button, Card, Pill } from './ui'
import { QrCode } from './QrCode'

export function InviteCard({ household, myProfileId }: { household: Household; myProfileId: string }) {
  const { t } = useTranslation()
  const { data: invites } = useInvites(household.id)
  const { data: members } = useMembers(household.id)
  const [showQr, setShowQr] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [busy, setBusy] = useState(false)
  const autoCreated = useRef(false)

  const active = invites?.find((i) => inviteState(i) === 'active')
  const everCreated = (invites?.length ?? 0) > 0

  // First time an Admin reaches this screen, the link is already there to share —
  // no separate "create invite" step, matching design/mockups/png/Invite.png.
  useEffect(() => {
    if (invites && invites.length === 0 && !autoCreated.current) {
      autoCreated.current = true
      void createInvite(household.id, myProfileId)
    }
  }, [invites, household.id, myProfileId])

  async function onCopy(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setCopyError(false)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError(true)
    }
  }

  async function onShare(link: string) {
    const text = t('invite.shareText', { home: household.name, url: link })
    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch {
        /* the user cancelled the share sheet — nothing to do */
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    }
  }

  async function onCreateNew() {
    setBusy(true)
    try {
      await createInvite(household.id, myProfileId)
    } finally {
      setBusy(false)
    }
  }

  const others = (members ?? []).filter((m) => m.id !== myProfileId)
  const canLoginOthers = others.filter((m) => m.can_login)
  const noLoginNames = others.filter((m) => !m.can_login).map((m) => m.display_name)

  return (
    <Card className="flex flex-col gap-3 p-4">
      {active ? (
        <>
          <div className="flex items-center gap-2.5 rounded-xl bg-sand px-3.5 py-3 text-[14px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E6259" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1" />
              <path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" />
            </svg>
            <span className="min-w-0 flex-1 truncate">{inviteUrl(active.token)}</span>
            <button type="button" onClick={() => onCopy(inviteUrl(active.token))} className="shrink-0 text-[13.5px] font-semibold text-saffron-ink">
              {copied ? t('invite.copied') : t('invite.copy')}
            </button>
          </div>
          {copyError && <p className="text-[12.5px] text-alert">{t('invite.copyFailed')}</p>}

          <Button className="w-full gap-2.5" onClick={() => onShare(inviteUrl(active.token))}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z" />
            </svg>
            {t('invite.shareWhatsApp')}
          </Button>

          <Button variant="secondary" className="w-full" onClick={() => setShowQr((v) => !v)} aria-expanded={showQr}>
            {showQr ? t('invite.hideQr') : t('invite.showQr')}
          </Button>
          {showQr && (
            <div className="flex flex-col items-center gap-2 py-1">
              <QrCode value={inviteUrl(active.token)} label={t('invite.qrHint')} />
              <span className="text-[12.5px] text-muted">{t('invite.qrHint')}</span>
            </div>
          )}

          <p className="text-center text-[12.5px] text-muted">
            {t('invite.footer', { home: household.name, days: daysUntil(active.expires_at) })}
          </p>
          <button type="button" onClick={() => revokeInvite(active.id, household.id)} className="text-center text-[13px] font-semibold text-alert">
            {t('invite.cancelLink')}
          </button>
        </>
      ) : (
        <>
          {everCreated && <p className="text-center text-[13.5px] text-ink-soft">{t('invite.expiredFooter')}</p>}
          <Button className="w-full" disabled={busy} onClick={onCreateNew}>
            {t('invite.createNew')}
          </Button>
        </>
      )}

      {canLoginOthers.length > 0 && (
        <>
          <span className="pt-2 font-display text-[16px] font-semibold">{t('invite.whoHasJoined')}</span>
          <div className="flex flex-col divide-y divide-line rounded-2xl border border-line">
            {canLoginOthers.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 px-3.5 py-3">
                <Avatar name={m.display_name} color={avatarColor(i + 1, m.kind)} size={36} />
                <span className="flex-1 text-[14.5px] font-semibold">{m.display_name}</span>
                <Pill tone={m.user_id ? 'success' : 'neutral'}>{m.user_id ? t('people.joined') : t('people.invited')}</Pill>
              </div>
            ))}
          </div>
        </>
      )}
      {noLoginNames.length > 0 && (
        <p className="text-[12.5px] text-muted">{t('invite.noLoginFootnote', { names: joinNames(noLoginNames) })}</p>
      )}
    </Card>
  )
}
