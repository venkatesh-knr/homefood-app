import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useMyProfile, useInvitePreview } from '../lib/queries'
import { claimProfile } from '../lib/mutations'
import { ageBand, avatarColor } from '../lib/people'
import { Button, FullPageMessage, Logo } from '../components/ui'
import { SignInForm } from '../components/SignInForm'

export default function JoinPage() {
  const { t } = useTranslation()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { data: preview, isLoading, isError } = useInvitePreview(token)
  const { data: profile, isLoading: profileLoading } = useMyProfile()

  const [picked, setPicked] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  // Once signed in with a name already picked, finish the join automatically —
  // there's no extra "continue" tap needed after the 6-digit code lands.
  useEffect(() => {
    if (session && picked && !profile && !profileLoading && !claiming && token) {
      setClaiming(true)
      setClaimError(null)
      claimProfile(token, picked)
        .then(() => navigate('/today', { replace: true }))
        .catch(() => {
          setClaimError(t('join.nameTaken'))
          setPicked(null)
          setClaiming(false)
        })
    }
  }, [session, picked, profile, profileLoading, claiming, token, navigate, t])

  if (isLoading) {
    return (
      <FullPageMessage>
        <p className="text-muted">{t('join.loading')}</p>
      </FullPageMessage>
    )
  }

  if (isError || !preview) {
    return (
      <FullPageMessage>
        <Logo size={56} />
        <p className="text-[15px] font-semibold">{t('join.expired')}</p>
        <p className="text-[13.5px] text-muted">{t('join.askForNew')}</p>
      </FullPageMessage>
    )
  }

  if (session && profile) {
    return (
      <FullPageMessage>
        <Logo size={56} />
        <p className="text-[15px] font-semibold">{t('join.alreadyInHome')}</p>
        <Button onClick={() => navigate('/today', { replace: true })}>{t('join.goToApp')}</Button>
      </FullPageMessage>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5">
      <div className="flex flex-col items-center gap-2.5 pb-6 pt-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-saffron text-ink">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11l9-7 9 7" />
            <path d="M5 10v10h14V10" />
            <path d="M9 16c1 1.5 5 1.5 6 0" />
          </svg>
        </span>
        <p className="text-[14.5px] text-ink-soft">
          {preview.invited_by ? t('join.invitedBy', { name: preview.invited_by }) : t('join.invitedByFallback')}
        </p>
        <h1 className="font-display text-[26px] font-bold">{preview.household_name}</h1>
        <p className="text-[13.5px] text-muted">{t('join.onHomeFood', { count: preview.member_count })}</p>
      </div>

      {preview.people.length === 0 ? (
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('join.noOneToJoin')}</p>
      ) : (
        <>
          <span className="pb-2.5 font-display text-[17px] font-semibold">{t('join.whichOneIsYou')}</span>
          <div role="radiogroup" aria-label={t('join.whichOneIsYou')} className="flex flex-col gap-2">
            {preview.people.map((p, i) => {
              const on = picked === p.id
              const band = ageBand(p.birth_year)
              const note = p.joined ? t('join.alreadyJoined') : band ? `${t(`people.ageBand.${band}`)} · ${t('join.member')}` : t('join.member')
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={p.joined}
                  onClick={() => {
                    setPicked(p.id)
                    setClaimError(null)
                  }}
                  className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left ${
                    p.joined ? 'cursor-default opacity-55' : 'cursor-pointer'
                  } ${on ? 'border-saffron bg-saffron-tint' : 'border-line bg-white'}`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white"
                    style={{ background: avatarColor(i, 'family') }}
                  >
                    {p.name.trim()[0]?.toUpperCase() ?? '?'}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[15.5px] font-semibold">{p.name}</span>
                    <span className="text-[12.5px] text-muted">{note}</span>
                  </span>
                  <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-saffron' : 'border-line-strong'}`}>
                    {on && <span className="h-2.5 w-2.5 rounded-full bg-saffron" />}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="pt-2.5 text-[12.5px] leading-relaxed text-muted">
            {preview.invited_by ? t('join.notListed', { name: preview.invited_by }) : t('join.notListedFallback')}
          </p>

          <div className="mt-4 rounded-2xl bg-sand px-3.5 py-3 text-[13px] leading-relaxed text-ink-soft">{t('join.privacyNotice', { home: preview.household_name })}</div>

          {claimError && <p className="mt-3 rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{claimError}</p>}

          <div className="mt-6 flex flex-col gap-2 pb-8">
            {picked && !session ? (
              <SignInForm />
            ) : (
              // When picked && session, the effect above claims automatically —
              // this button is disabled either way, just showing where things stand.
              <Button disabled>
                {picked ? t('join.continueAs', { name: preview.people.find((p) => p.id === picked)?.name ?? '' }) : t('join.pickToContinue')}
              </Button>
            )}
            {!(picked && !session) && <p className="text-center text-[12.5px] text-muted">{t('join.emailHint')}</p>}
          </div>
        </>
      )}
    </main>
  )
}
