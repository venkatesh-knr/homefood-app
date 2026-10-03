import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useAllergies, useMembers } from '../lib/queries'
import { useWeekPlan, useWeekSlots, type SlotDish } from '../lib/plannerQueries'
import { useSlotComments, useSlotSuggestions, useSlotVotes } from '../lib/discussionQueries'
import { acceptSuggestion, addComment, addSuggestion, deleteComment, keepDish, setVote, withdrawSuggestion } from '../lib/discussionMutations'
import { agreeShare, formatCommentTime, myVoteOf, nextVote, tallyVotes, type Vote } from '../lib/discussion'
import { useCanPlanDate } from '../lib/useCanPlan'
import { useRecipeDishIds } from '../lib/recipeQueries'
import { useDishPhotoPath } from '../lib/dishPhotos'
import { describeError } from '../lib/errors'
import { avatarColor } from '../lib/people'
import { toISODate, weekStartOf, type MealType } from '../lib/planner'
import { Button, FullPageMessage, Pill, VoteIcon } from '../components/ui'
import { DishThumb } from '../components/DishRow'
import { DishPickerSheet } from '../components/DishPickerSheet'

const MEAL_BAND: Record<MealType, string> = { breakfast: '#F2B705', lunch: '#2F7A3E', snacks: '#E8742A', dinner: '#3B4A9C' }

function nameOf(d: SlotDish, lang: 'en' | 'ta') {
  return d.dish_names.find((n) => n.language === lang)?.name ?? d.name
}

export default function DiscussionPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const locale = lang === 'ta' ? 'ta-IN' : 'en-IN'
  const navigate = useNavigate()
  const { date, meal } = useParams<{ date: string; meal: MealType }>()
  const { profile, household } = useHome()
  const isAdmin = profile.role === 'admin'
  const canPlan = useCanPlanDate(date)
  const photoFor = useDishPhotoPath()
  const { data: recipeIds } = useRecipeDishIds()

  const weekStart = toISODate(weekStartOf(new Date(`${date}T00:00:00`)))
  const { data: weekPlan, isLoading: planLoading } = useWeekPlan(household.id, weekStart)
  const { data: slots, isLoading: slotsLoading } = useWeekSlots(weekPlan?.id)
  const { data: members } = useMembers(household.id)
  const memberIds = useMemo(() => (members ?? []).map((m) => m.id), [members])
  const { data: allergyRows } = useAllergies(memberIds)
  const slot = slots?.find((s) => s.date === date && s.meal === meal)

  const { data: votes } = useSlotVotes(slot?.id)
  const { data: comments } = useSlotComments(slot?.id)
  const { data: suggestions } = useSlotSuggestions(slot?.id)

  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)

  const memberById = useMemo(() => new Map((members ?? []).map((m, i) => [m.id, { name: m.display_name, color: avatarColor(i, m.kind) }])), [members])

  if (!date || !meal || planLoading || (weekPlan && slotsLoading)) {
    return (
      <FullPageMessage>
        <p className="text-muted">{t('common.loading')}</p>
      </FullPageMessage>
    )
  }

  const dayLabel = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(`${date}T00:00:00`))
  const dateLabel = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(`${date}T00:00:00`))
  const mealLabel = t(`meal.${meal}`)

  const header = (
    <div className="flex items-center gap-2 pt-3">
      <button type="button" onClick={() => navigate('/week')} aria-label={t('common.back')} className="flex h-11 w-11 items-center justify-center rounded-full">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="flex flex-1 flex-col">
        <span className="font-display text-[18px] font-semibold">
          {dayLabel} {mealLabel.toLowerCase()}
        </span>
        <span className="text-[12px] text-muted">{dateLabel}</span>
      </div>
      {canPlan && slot && (
        <button type="button" onClick={() => navigate(`/week/${date}/${meal}`)} className="px-2 text-[14px] font-semibold text-saffron-ink">
          {t('discussion.editMeal')}
        </button>
      )}
    </div>
  )

  if (!slot) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-8">
        {header}
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('discussion.nothingPlanned')}</p>
      </main>
    )
  }

  const slotId = slot.id
  const myVote = myVoteOf(votes ?? [], profile.id)
  const tally = tallyVotes(votes ?? [])
  const share = agreeShare(tally)
  const mainName = slot.main_dish ? nameOf(slot.main_dish, lang) : slot.place_name || t('planner.emptySlot')
  const sides = [...slot.meal_slot_sides].sort((a, b) => a.position - b.position).map((s) => nameOf(s.dish, lang))
  const cooks = slot.meal_slot_cooks.map((c) => memberById.get(c.profile_id)?.name).filter(Boolean)
  const openSuggestions = (suggestions ?? []).filter((s) => s.status === 'open')
  const closedSuggestions = (suggestions ?? []).filter((s) => s.status !== 'open')

  const eaters = slot.meal_slot_eaters.map((e) => ({
    name: memberById.get(e.profile_id)?.name ?? '',
    allergens: (allergyRows ?? []).filter((a) => a.profile_id === e.profile_id).map((a) => a.allergen),
  }))

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  const onVote = (v: Vote) => run(() => setVote(slotId, profile.id, nextVote(myVote, v)))
  const onSend = (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    void run(async () => {
      await addComment(slotId, profile.id, body)
      setText('')
    })
  }

  const voteButton = (v: Vote) => {
    const on = myVote === v
    const agree = v === 'agree'
    return (
      <button
        type="button"
        aria-pressed={on}
        disabled={busy}
        onClick={() => void onVote(v)}
        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border-[1.5px] text-[15px] font-semibold ${
          on ? (agree ? 'border-leaf bg-leaf-tint text-leaf' : 'border-alert bg-alert-tint text-alert') : 'border-line-strong bg-white'
        }`}
      >
        <VoteIcon kind={agree ? 'agree' : 'disagree'} size={18} />
        {t(agree ? 'discussion.agree' : 'discussion.disagree')}
      </button>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-4">
      {header}

      <div className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-4">
        <div className="flex items-center gap-3.5">
          {slot.main_dish ? <DishThumb name={mainName} tone={meal.length} photoPath={photoFor(slot.main_dish)} size={64} ring={MEAL_BAND[meal]} /> : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-display text-[19px] font-semibold leading-tight">{mainName}</span>
            {sides.length > 0 && <span className="text-[13px] text-muted">+ {sides.join(', ')}</span>}
            {cooks.length > 0 && <span className="text-[12.5px] text-ink-soft">{t('discussion.cookedBy', { names: cooks.join(' + ') })}</span>}
          </div>
          {slot.source !== 'home' && <Pill>{t(slot.source === 'dine_out' ? 'planner.source.dineOut' : 'planner.source.orderIn')}</Pill>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-sand" role="img" aria-label={t('discussion.tally', { agree: tally.agree, disagree: tally.disagree })}>
            {tally.total > 0 && (
              <>
                <span className="bg-leaf" style={{ width: `${share * 100}%` }} />
                <span className="bg-alert" style={{ width: `${(1 - share) * 100}%` }} />
              </>
            )}
          </div>
          <div className="flex justify-between text-[12.5px] text-ink-soft">
            <span>{tally.total === 0 ? t('discussion.noVotes') : t('discussion.agreeCount', { count: tally.agree })}</span>
            {tally.total > 0 && (
              <span>
                {t('discussion.disagreeCount', { count: tally.disagree })}
                {myVote === 'disagree' ? ` ${t('discussion.you')}` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2.5">
          {voteButton('agree')}
          {voteButton('disagree')}
        </div>
        {slot.kept_despite_disagree && <p className="text-[12.5px] text-muted">{t('discussion.keptNote')}</p>}
        {slot.main_dish && recipeIds?.has(slot.main_dish.id) && (
          <button type="button" onClick={() => navigate(`/dishes/${slot.main_dish!.id}/recipe`, { state: { servings: slot.meal_slot_eaters.length || undefined } })} className="self-start text-[13px] font-semibold text-saffron-ink underline">
            {t('recipe.open')}
          </button>
        )}
      </div>

      {(openSuggestions.length > 0 || closedSuggestions.length > 0) && (
        <section className="flex flex-col gap-2">
          <h2 className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-muted">{t('discussion.suggestion')}</h2>
          {openSuggestions.map((s) => {
            const who = memberById.get(s.profile_id)?.name ?? ''
            const dishName = s.dish ? nameOf(s.dish, lang) : (s.free_text ?? '')
            const mine = s.profile_id === profile.id
            return (
              <div key={s.id} className="flex flex-col gap-2.5 rounded-2xl bg-[#EEF0FA] p-3.5">
                <div className="flex items-center gap-3">
                  {s.dish && <DishThumb name={dishName} tone={1} photoPath={photoFor(s.dish)} size={44} />}
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold">{t('discussion.insteadOf', { dish: dishName })}</span>
                    <span className="text-[12.5px] text-[#2C3777]">{t('discussion.suggestedBy', { name: who })}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canPlan ? (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void run(() => acceptSuggestion(slotId, household.id, s))}
                        className="h-10 rounded-xl bg-meal-dinner px-3.5 text-[13.5px] font-semibold text-white"
                      >
                        {s.dish_id ? t('discussion.swapIn', { dish: dishName }) : t('discussion.noted')}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void run(() => keepDish(slotId, household.id, s.id))}
                        className="h-10 rounded-xl border border-[#2C3777]/40 px-3.5 text-[13.5px] font-semibold text-[#2C3777]"
                      >
                        {t('discussion.keepDish', { dish: mainName })}
                      </button>
                    </>
                  ) : (
                    <span className="text-[13px] text-[#2C3777]">{t('discussion.plannerDecides')}</span>
                  )}
                  {(mine || canPlan) && (
                    <button type="button" disabled={busy} onClick={() => void run(() => withdrawSuggestion(slotId, s.id))} className="ml-auto text-[12.5px] font-semibold text-muted">
                      {t('discussion.withdraw')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {closedSuggestions.map((s) => (
            <p key={s.id} className="px-1 text-[12.5px] text-muted">
              {s.dish ? nameOf(s.dish, lang) : s.free_text} · {t(s.status === 'accepted' ? 'discussion.accepted' : 'discussion.declined')}
            </p>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-muted">{t('discussion.comments')}</h2>
        {(comments ?? []).length === 0 ? (
          <p className="rounded-2xl bg-sand px-4 py-3 text-center text-[13.5px] text-ink-soft">{t('discussion.noComments')}</p>
        ) : (
          (comments ?? []).map((c) => {
            const who = memberById.get(c.profile_id)
            return (
              <div key={c.id} className="flex items-start gap-2.5">
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: who?.color ?? '#6E6259' }}>
                  {who?.name.trim()[0]?.toUpperCase() ?? '?'}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-2xl border border-line bg-white px-3.5 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold">{who?.name ?? ''}</span>
                    <span className="text-[12px] text-muted">{formatCommentTime(c.created_at, new Date(), locale)}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-[14.5px]">{c.body}</p>
                  {(c.profile_id === profile.id || isAdmin) && (
                    <button type="button" disabled={busy} onClick={() => void run(() => deleteComment(slotId, c.id))} className="self-end text-[12px] font-semibold text-muted">
                      {t('discussion.delete')}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </section>

      {error && <p className="rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}

      <div className="sticky bottom-16 -mx-5 mt-auto flex flex-col gap-2 border-t border-line bg-cream px-5 pb-3 pt-3">
        <form onSubmit={onSend} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            placeholder={t('discussion.commentPlaceholder')}
            className="h-12 min-w-0 flex-1 rounded-2xl border border-line-strong bg-white px-3.5 text-[15px]"
          />
          <Button type="submit" disabled={busy || !text.trim()} aria-label={t('discussion.send')} className="!min-h-0 h-12 w-12 !px-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron-ink/60 text-[14px] font-semibold text-saffron-ink"
        >
          <span aria-hidden="true">+</span>
          {t('discussion.suggestDifferent')}
        </button>
      </div>

      {picking && (
        <DishPickerSheet
          householdId={household.id}
          title={t('discussion.suggestTitle')}
          course="main"
          meal={meal}
          eaters={eaters}
          excludeIds={slot.main_dish ? [slot.main_dish.id] : []}
          onClose={() => setPicking(false)}
          onPick={(dish) => {
            setPicking(false)
            void run(() => addSuggestion(slotId, profile.id, { dishId: dish.id }))
          }}
        />
      )}
    </main>
  )
}
