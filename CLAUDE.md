# HomeFood — notes for Claude Code

A family meal planner: each home plans breakfast, lunch, optional evening snacks and dinner for the week, together.
Web app first (installable PWA), wrapped for Android/iOS with Capacitor later.
Owner: Venkatesh (development manager). Explain steps plainly; he runs Supabase dashboard steps himself.

- Spec & design doc: "HomeFood — Spec & Design" (Claude Docs) — the source of truth for features.
  **Read it in `docs/spec.md`** (exported copy, 30 Sep 2026; three diagrams not included). Deviations are recorded here.
- **Mockups: `design/mockups/`** — 16 screens as PNGs (visual reference) plus their `.dc.html` source; index in `design/mockups/README.md`.
  Follow their layout, spacing, colours and copy. Step 2 screens: `SetupHome.png`, `Invite.png`, `Join.png`. Step 3 screens:
  `DishPicker.png`, `DishDetail.png` (the Dishes tab is the picker without its meal-slot context — no "Wednesday dinner" header
  or "Use X" button, tapping a dish opens Dish Detail instead); `Recipe.png` is built (migration 0011); the nutrition panel on `DishDetail.png` is
  **not built** yet (see Step 3 scope below). Step 4 screens: `Planner.png`, `SlotEditor.png`,
  `Rota.png`, `Discussion.png` (built — see Step 4 scope below). Step 5
  screens: `Today.png` (votes/comments built; the notification bell is still not), `Phone.png` +
  `Main.png` (Week at a glance, mobile and tablet/laptop — one responsive page, not two), `Share.png` (what "Save as
  image" produces). `Today.png`'s 5-tab nav (Today/Week/Dishes/**Health**/Family) is a different iteration from the
  4-tab shell already built in Step 2 (Today/Week/Dishes/**Home**) — kept the existing 4 tabs, no Health tab.
- Requirements (28 points) and decisions live in the claude.ai Project "HomeFood".
- **Live at https://venkatesh-knr.github.io/homefood-app/** — GitHub Pages, redeploys automatically on every push to `main`
  (`.github/workflows/deploy.yml`). The repo is **public** (GitHub Pages needs that or a paid plan for a private repo).

## Decisions that must not be changed without asking

- **Sign-in:** email + 6-digit code only (Supabase email OTP). No passwords, no Google/social login, no phone OTP.
  Code is needed once per device; the app then stays signed in. Optional app lock (fingerprint/face) comes later.
- **Privacy first:** collect minimal personal data. Every table has row-level security; one home can never see another's data.
- **One household per login.** Relatives use their own households.
- Only the Admin signs up and creates the home; everyone else joins with an **invite link + email code**.
- Not every member needs a login (e.g. Paati). The **helper (maid) is only a cook**: never logs in, never Admin, not counted in servings/nutrition.
- **Planner has the final say** (can keep a dish even if others disagree). Anyone can be Planner for a day/week/month; requests are auto-approved when the turn is free (phase 1: Admin assigns turns).
- **Week starts Monday.** Timezone default Asia/Kolkata.
- **Languages:** English and Tamil at launch, every UI string in both (`src/i18n/en.json`, `ta.json`); more languages later.
- **Week at a glance poster:** signed-in members only; saved image shows dishes only. No public link.
- Photos: free-licence stock photos; a home can replace them with its own (private bucket, one folder per home).
- Veg/egg/non-veg filter: later, not phase 1.

## Stack

React 19 + TypeScript + Vite · Tailwind CSS v4 (tokens in `src/index.css` `@theme`) · i18next · vite-plugin-pwa ·
Supabase (Postgres + RLS, email OTP, storage) · react-router-dom · @tanstack/react-query · qrcode (client-side QR for the invite
link — no network call, the link never leaves the device to generate it) · html-to-image (renders the Week-at-a-glance
poster to a PNG client-side for Save-as-image/Share) · Vitest · oxlint.
UI components are our own (`src/components/ui.tsx`); shadcn/ui is not installed — ask before adding it.

Design tokens: cream `#FFF8EE` background, ink `#2B2622`, saffron `#E08A00` accent;
meal colours breakfast `#F2B705`, lunch `#2F7A3E`, snacks `#E8742A`, dinner `#3B4A9C`.
Fonts: Poppins (headings), Noto Sans / Noto Sans Tamil (body; `:lang(ta)`).
Simple, eye-catching, big touch targets, mobile-first (test at 375px wide).

## Commands

```bash
npm run dev      # http://localhost:5173 (needs .env.local)
npm test         # unit tests (translations parity, validation)
npm run lint
npm run build    # tsc + vite build — must pass before committing
npm run test:db  # database rule tests; needs bash + a local PostgreSQL (WSL/Git Bash on Windows)
```

`.env.local` holds `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (publishable key). It is git-ignored.
Never put the service_role/secret key or the DB password anywhere in this repo.

## Database

- Migrations in `supabase/migrations/`. **0001–0010 are all applied** to the live project `homefood-prod` (Mumbai) —
  Steps 2–4 have all been tested live against them. **0007 (pilot stock photos) is applied too** (confirmed live 3 Oct 2026). **0008 (stock photos for the other 22 seeded dishes) is applied too** (all 28 dishes confirmed showing photos live, 3 Oct 2026). Never edit an applied migration; add a new numbered file
  (`0012_….sql`) for the next change. Venkatesh runs these in Supabase › SQL Editor — tell him when one needs running.
  `0005_seed_dishes.sql` seeds ~30 starter dishes into the shared catalogue (household_id null) — not the full "10-12 snacks
  per cuisine" from the Step 3 scope below, see that section for why. `0006_meal_slot_eaters.sql` adds one small table.
  **0009 (110 more Indian dishes, 64 of them sides) is applied too** (138 shared dishes confirmed live, 3 Oct 2026); it skips
  names that already exist. Those 110 have no photos yet (initial placeholder).
  0010 (votes, comments, suggestions) is applied and tested live (vote + comment + delete on a real meal).
  **0011 (recipes: 38 standard recipes, 309 ingredients, 150 steps, English + Tamil) is new and still needs running** — until it
  is, no dish shows a Recipe button; nothing else breaks. Recipe content is regenerated from `scripts/recipes_data.py` by
  `scripts/gen-recipes.py`. They are drafts: the family should check them before relying on them.
  `0007_dish_stock_photos.sql` sets a real Wikimedia Commons photo (+ credit) on 6 of those seeded dishes — a pure data
  update, no schema/RLS change, see Step 3 scope below for which ones and why only 6 so far.
- "Automatically expose new tables" is OFF: every new table needs explicit `grant … to authenticated` plus RLS policies.
- Helpers: `my_profile_id()`, `my_household_id()`, `is_admin()`, `can_plan(household, date)`, `can_plan_week(household, week_start)`.
- RPCs: `create_household(p_name, p_display_name, p_language default 'en', p_snacks_enabled default true)` → household id (caller becomes Admin);
  `get_invite(p_token)` → household_name, invited_by, member_count, people [{id,name,birth_year,joined}] — `people` excludes whoever created the
  link and includes everyone else who can log in, joined or not (works signed out);
  `claim_profile(p_token, p_profile_id)` → household id.
- Guard triggers stop members promoting themselves, the last Admin stepping down, planning outside a turn, cross-home cooks.
- Any new rule gets a check in `supabase/tests/rls_test.sql` (currently 79 checks — all passing in CI, see below). There's also
  `supabase/tests/live_check_0004.sql`, an optional one-off check you can paste into the SQL Editor after running 0004 (it makes
  two throwaway demo users, checks the new `get_invite` shape, then has a cleanup block at the bottom — run that too so no demo
  data is left behind).
- **CI runs `rls_test.sql` automatically** on every push to `main` (`.github/workflows/ci.yml`, job "Database rule tests" —
  spins up a real ephemeral Postgres). Local PostgreSQL still isn't available on this dev machine, so `npm run test:db` hasn't
  been run here directly, but the same checks run in CI every push — check the Actions tab (or ask Claude Code) if unsure a
  migration passed them.

Auth/email (already configured in the dashboard, no code needed): custom SMTP via Brevo (free, 300 emails/day),
templates "Confirm sign up" + "Magic link" send `{{ .Token }}` (`supabase/email-templates/sign-in-code.html`),
OTP expiry 600 s, minimum interval per user 60 s (the sign-in page resend timer must stay ≥ 60 s).

## Code layout

```
src/lib/supabase.ts     client (persistSession, autoRefreshToken, detectSessionInUrl: false)
src/lib/auth.tsx        AuthProvider/useAuth: session, sendCode, verifyCode, signOut; AuthError kinds wrongCode/tooMany/generic
src/lib/validation.ts   email/code/name/allergy helpers (+ tests)
src/lib/people.ts       Household/Profile/Invite types + pure helpers (ageBand, avatarColor, personDetailText…) (+ tests)
src/lib/queries.ts      react-query reads: useMyProfile, useHousehold, useMembers, useAllergies, useInvites, useInvitePreview
src/lib/mutations.ts    plain async writes (createHousehold, addPerson, createInvite, claimProfile…) that invalidate the query cache
src/lib/homeContext.tsx useHome(): {profile, household} loaded once by <AppShell> and shared with every tab
src/lib/onboarding.ts   per-device "seen the invite-your-family screen" flag (localStorage, not a DB column)
src/lib/dishes.ts       Cuisine/Dish types + pure helpers (dishDisplayName, dietColor, passesFilters…) (+ tests)
src/lib/dishQueries.ts  react-query reads: useCuisines, useDishes, useDish, useDishPhotoOverrides, useSignedPhotoUrl
src/lib/dishMutations.ts addDish/updateDish/removeDish, uploadDishPhoto (strips EXIF/GPS via lib/photo.ts first)
src/lib/planner.ts      week/meal types + pure helpers (weekStartOf, weekDates, mealAllergyConflicts, turnCoversDate…) (+ tests)
src/lib/plannerQueries.ts react-query reads: useWeekPlan, useWeekSlots (one call, embeds dish/sides/cooks/eaters), usePlannerTurns
src/lib/history.ts      History screen helpers: rangeBounds/shiftAnchor (week·month·year), summariseHistory, topEntries (+ tests)
src/lib/discussion.ts   vote/comment helpers: tallyVotes, agreeShare, nextVote, countsBySlot, formatCommentTime (+ tests)
src/lib/discussionQueries.ts / discussionMutations.ts  votes, comments, suggestions (counts are fetched apart from slots and fail quietly)
src/lib/recipes.ts      recipe scaling/formatting helpers (+ tests); recipeQueries.ts: useRecipe, useRecipeDishIds
src/lib/plannerMutations.ts getOrCreateWeekPlan, saveSlot (upserts a slot + replaces sides/cooks/eaters), clearSlot,
                        publishWeek, copyDay/copyWeek (client-orchestrated, never overwrites an existing slot), assignPlannerTurn
src/components/ui.tsx   Button, Logo, LanguageSwitch, Card, Toggle, Avatar, Pill, TogglePill, ChipInput
src/components/         PersonForm, PersonRow, PeopleSection, InviteCard, QrCode, GettingStartedChecklist, SignInForm,
                        DishRow (+ DishThumb, DietMark), DishPickerSheet (full-screen dish picker, reused by the slot editor)
src/pages/              SignInPage, SetupNeededPage, SetupHomeStep1Page, SetupHomeStep2Page, JoinPage,
                        AppShell (+ TodayPage, WeekPage, SlotEditorPage, RotaPage, WeekGlancePage, HistoryPage, DiscussionPage, RecipePage, DishesPage,
                        AddDishPage, DishDetailPage, HomeTabPage)
src/App.tsx             routes: /join/:token is public; everything else needs a session → no profile shows the setup
                        wizard, a profile that hasn't clicked through step 2 shows the invite screen, otherwise AppShell
```

## Build plan (phase 1)

- [x] Step 1 · Setup, design tokens, English/Tamil, email-code sign-in, schema + RLS + tests (tested live 28 Sep 2026)
- [x] Step 2 · Home setup — tested live end to end (see scope below)
- [x] Step 3 · Dish catalogue — tested live (see scope below)
- [x] Step 4 · Planning — tested live end to end (see scope below)
- [x] Step 5 · Everyday view — tested live (see scope below)
- [ ] Step 6 · Polish — partly built (see scope below for what's done vs. deferred)
- [ ] Step 7 · Family trial (2 weeks)

### Step 2 · Home setup — scope

**Status: migration run, tested live end to end.** Sign-in, home setup, People (add/edit), the invite link, and
`claim_profile()` completing (a real member opened the link, signed in, picked their name, and now shows "Joined" in
the invite screen's list) all confirmed working against real data — two bugs found and fixed along the way (a missing
"who can even join" nuance in two messages, see git log around 29-30 Sep).
Check this off and update README.md's status table too.

Mockups: `design/mockups/png/SetupHome.png` (Step 1 of 2: home name, language, week starts Monday, plan-snacks toggle, "Who lives here" list),
`Invite.png` (Step 2 of 2: link, WhatsApp, QR, who has joined, getting-started checklist), `Join.png` (pick "which one is you").
First run is this 2-step flow; afterwards the Admin reaches the same People + Invite sections from the Home tab, plus a
**Home settings** card (`HomeSettingsCard.tsx`, added 30 Sep after auditing the app against `docs/spec.md`) to rename the
home, change its default language for new members, and toggle snacks on/off — set once at first-run setup before, now
actually editable per the setup screen's own "you can change all of this later" copy.

1. **Routing:** start using react-router-dom. Signed-in user with no profile → setup/join; with a profile → app shell.
   Load "my profile + household" once (react-query) and share it.
2. **Set up a new home** (replaces the disabled button on WelcomePage): home name, your display name, language (en/ta)
   → `create_household` RPC → lands in the app shell as Admin.
3. **People in this home** (Admin): list profiles; add/edit/remove a person — display name, family or helper,
   uses the app yes/no, birth year (optional), sex and activity (optional), allergies (optional chips).
   Helper: no login, never Admin. Show who has already joined.
4. **Invite link** (Admin): create an invite (7-day expiry), copy link / share to WhatsApp (`navigator.share` with fallback),
   list and revoke open invites. Link format: `/join/<token>`.
5. **Join flow:** `/join/<token>` → `get_invite` shows home name and who invited (works signed out) → sign in with email code
   (keep the token across sign-in, e.g. sessionStorage) → pick "I'm Appa" from claimable names → `claim_profile` → app shell.
   Clear messages for expired/revoked links and taken names.
6. **App shell:** bottom navigation Today · Week · Dishes · Home (placeholders except Home), language switch, sign out.
7. All new strings in en + ta; add unit tests where logic exists; extend rls_test.sql if schema/policies change.
   Check at 375px wide in both languages before calling it done.

### Step 3 · Dish catalogue — scope

**Status: migration run, tested live.** Dishes tab, search, filters and cuisine chips confirmed against the real seeded
catalogue — caught and fixed a real bug this way (European/Japanese chips were silently missing, see git log). Add new
dish, Snap a dish and Dish Detail's edit/remove haven't specifically been exercised live yet. Click-through: Dishes tab
→ search/filter/cuisine chips → open a dish → Add new dish → Snap a dish (opens
the phone's camera app, not a custom viewfinder — see below) → Replace photo.

Trims from the mockups/CLAUDE.md wording, flagged rather than silently done — ask before expanding any of these:
- **Seed set is ~30 dishes** (6 per cuisine, mixed meals/diets), not the full "10-12 snacks per cuisine". Full depth is a
  content-authoring task, easy to add later as more `dishes`/`dish_names` rows — no code changes needed for that.
- **Real stock photos: all 28 seeded dishes** — 6 in 0007 (applied) and the other 22 in `0008_dish_stock_photos_rest.sql` (applied). Three of the 22 (French fries, Katsu curry, Vegetable soup) are drawings (clip-art), tagged "(illustration)" in `photo_credit`; Dish Detail shows those with `object-contain` instead of cropping. Original pilot note: `0007_dish_stock_photos.sql` (applied, all 6 confirmed rendering live)
  sets `dishes.photo_path` to a real, free-licence Wikimedia Commons photo (one is a watercolour illustration, by request)
  for Dosa, Idli, Butter chicken, Margherita pizza, Chicken teriyaki and Miso soup, with credit in `photo_credit`. Every
  other seeded dish still shows the colour+initial placeholder until more are added the same way (just more migration
  rows — no code change). `useSignedPhotoUrl()` now serves an `http(s)` `photo_path` as-is instead of only ever signing
  it against the private bucket, and `DishesPage`/`DishPickerSheet`/`DishDetailPage` fall back to it when the household
  hasn't set its own override. "Replace photo" (per-household override, uploaded to the private bucket) still works fully
  and takes priority over the stock photo. Dish Detail shows the `photo_credit` over the stock photo (CC BY/BY-SA require visible attribution); it's hidden once a household replaces the photo with its own.
- **Recipes are built (migration 0011), the nutrition panel is not.** `RecipePage` (`/dishes/:id/recipe`, `Recipe.png`): servings
  stepper (starts at who is eating, else the number of family members), ingredients scaled and written as a cook would (`lib/recipes.ts`:
  1¼ cups, ¾ tbsp, 250 g), steps you can tick off, cook mode (screen wake lock + bigger text) and a Watch (YouTube) button. A Recipe
  button shows on Dish Detail, the Today next-up card and the discussion card, only for dishes that have a recipe. Tables allow a home
  to keep its own version (Admin only), but there is **no "Edit our version" screen yet**, and no Recipe button in the slot editor
  (leaving it would lose unsaved edits). Dish Detail still shows no nutrition panel — see the nutrition item in the build notes.
- **"Snap a dish" uses `<input type="file" capture="environment">`**, which opens the phone's own camera app, instead of a
  custom full-screen viewfinder with a plate-shaped frame like `SnapDish.png`. Same result (attach a photo to a new dish),
  much less code/risk.
- Dish rows aren't "sorted by family favourites" (mockup) — no meal history exists yet to sort by. Alphabetical for now;
  revisit once Step 4/5 planning data exists.

1. **Catalogue:** `dishes` + `dish_names` (already in migration 0001) hold the shared catalogue (`household_id` null) and each
   home's own additions. `lib/dishes.ts` has the search/filter logic (cuisine, course, diet, meal type, "safe for everyone
   eating" — cross-checked against real `profile_allergies`), all unit-tested.
2. **Dishes tab:** search (matches English or Tamil), cuisine chips (+ "My dishes"), course/diet/meal filters, dish list.
   Tapping a row opens Dish Detail.
3. **Add a cuisine** (Admin, Dishes tab → "+ Add a cuisine", `AddCuisine.tsx`): English name + optional Tamil name, saved as a row owned by
   the home (no migration — `cuisines_admin` RLS already allowed it); it shows up as a chip and in Add a dish. Top-level only (no
   parent), no rename/delete UI yet.
3b. **Add a dish** (`/dishes/new`): name (en + optional ta), cuisine, meal types, course, diet, tags, allergens, prep time,
   optional photo. Editing is limited to the household's own dishes (creator or Admin) — the shared catalogue is read-only
   except for photo replacement, which any member can do.
4. **Snap a dish:** camera capture → straight into the add-dish form with the photo pre-attached.
5. **Photos:** private `dish-photos` bucket (from migration 0002), one override per household per dish. Uploads go through
   `lib/photo.ts`'s `stripPhotoMetadata()` first — re-encodes via `<canvas>`, which drops all EXIF including GPS, satisfying
   the "strips location data" comment in migration 0002 without an EXIF-parsing library.
6. All new strings in en + ta; unit tests for the pure filter/display logic; no RLS/schema changes beyond the seed data, so
   `rls_test.sql`'s 44 checks are unaffected.

### Step 4 · Planning — scope

**Status: migration run, tested live end to end.** Week tab, saving a real meal slot (main dish + cook), Publish week
(status flips to "Published"), and Rota (both the pre-existing real turn assignments rendering correctly, and — as
Admin — that the schedule reflects them) all confirmed against real data. The member-sees-read-only side of Rota
hasn't specifically been exercised from a non-Admin login yet.

Trims, flagged rather than silently done — ask before expanding any of these:
- **Discussion is built (migration 0010)**: `DiscussionPage` (`/week/:date/:meal/discuss`, `Discussion.png`) — agree/disagree with a
  tally bar, comments, and "suggest a different dish" via the same dish picker; the Planner/Admin sees "Swap in X" (replaces the
  main dish and clears the old votes) / "Keep Y" (marks it kept) / withdraw, everyone else sees "The Planner decides". Week cards
  show agree / disagree / comment counts (tap → thread; a non-planner's tap on a card goes to the thread), Today cards have inline Agree/Disagree and a
  comments link. Parked: suggestions are catalogue dishes only (the table also allows free text, no UI yet); comments can't be
  edited; changing a dish in the slot editor doesn't clear votes; no notifications yet (the bell is the last item to build).
- **No "fried dishes this week" balance banner** (`Planner.png`) — needs a per-household limit that hasn't been decided
  (configurable? fixed?).
- **No real notifications.** "Everyone is notified when you publish" (mockup copy) doesn't happen — no push infrastructure
  exists yet. Publish just flips the week to published.
- **Rota is Admin-assigns-only, no member self-claim.** The mockup shows members tapping "I'll plan this week" on a free
  slot, but this section's own decision says *"phase 1: Admin assigns turns"* — and the DB already enforces exactly that
  (`rls_test.sql`: "members cannot assign turns themselves"). Members see the schedule read-only with an "ask your Admin"
  note instead of a claim button.
- **Copy last day / Copy last week never overwrite an existing slot** — only fills empty ones. Simpler and safer than the
  mockup's implied "start fresh from last week", at the cost of not being able to bulk-replace a week that's partly planned.

1. **New table:** `meal_slot_eaters` (migration 0006) — who's eating each meal, needed for recipe scaling ("Recipe scaled to
   5 · helper not counted") and the allergy-warning cross-check. Everything else fits the existing schema (`week_plans`,
   `meal_slots`, `meal_slot_sides`, `meal_slot_cooks`, `planner_turns`, all from migration 0001).
2. **Week tab** (`WeekPage`, replaces the placeholder): 7-day strip with per-day planned/possible counts, prev/next week,
   the selected day's meal cards (empty → "tap to plan"; filled → dish + sides + source badge + cooks + a real allergy
   check against the household's `profile_allergies`), Copy last day/week, Publish week — all three only shown to whoever
   can actually plan that day/week (Admin, or has an approved `planner_turns` row covering it).
3. **Slot editor** (`/week/:date/:meal`): Home/Dine-out/Order-in tabs. Home: main dish + up to 3 sides (both via
   `DishPickerSheet`, a full-screen overlay reusing `passesFilters` — search, cuisine chips, diet, meal (starts on the slot's own
   meal, with a "show any meal" escape if that leaves nothing), "safe for everyone eating" and a per-dish allergy badge, all judged
   against who is actually eating this meal; course is fixed by main/side. No "Add new dish"/"Snap a dish" buttons in it, because
   leaving the page would lose the slot's unsaved edits), the real per-eater allergy warning (`mealAllergyConflicts` in `lib/planner.ts`, unit-tested), who
   cooks (anyone, including the helper), who's eating (family members only — the helper is never counted, per this file's
   own decision), a note, YouTube/Instagram search links. Dine-out/Order-in: just a place name.
4. **Rota** (`/week/rota`): next 6 weeks, each day coloured by whoever's `planner_turns` covers it. Admin sees an inline
   "Assign a turn" form (person + day/week/month + start date) per week.
5. All new strings in en + ta; unit tests for the pure date/scaling/allergy logic in `lib/planner.ts`; `rls_test.sql` +3
   checks (47 total) for `meal_slot_eaters`' read/write isolation.

### Step 5 · Everyday view — scope

**Status: tested live.** No new migration — this step is pure frontend, reusing Step 4's `week_plans`/`meal_slots`
tables and query hooks as-is. Today's greeting, next-up card and empty-state rendering confirmed against real data.
Week at a glance also opened live against real data — day strip, today card and coming-up list all confirmed, and one
real bug this caught: "Coming up" was including already-past days of the current week (fixed, see git log 30 Sep).
Save as image / Print / Share and the prev/next week-browsing arrows haven't specifically been exercised live yet.

Trims, flagged rather than silently done:
- **Today has votes and comments but no notification bell** (`Today.png` shows a bell) — the bell is the last item on the list.
- **No "You ate this" consumption tracking** (`Today.png`) — `meal_slots.status` has room for it (`proposed`/`confirmed`/
  `done`) but nothing sets it yet; needs its own small UI (a per-meal "mark as eaten" action), not just a label.
- **History screen exists, but is "planned up to today", not "actually eaten".** Home tab → "Meal history" (`HistoryPage`, `/history`,
  `lib/history.ts`): Week / Month / Year with prev/next (never into the future), counts (meals, home / dine-out / order-in, most
  cooked dishes, who cooked), a search box, and the meals grouped by day (tap one to open it). Nothing marks a meal "done"
  yet, so every planned slot up to today counts. **No "cook this again" button** (needs a design call on which day it lands
  on) and no counts by cuisine yet — both left for later. No new tab (still 4).
- **Today's 5-tab nav** (`Today.png`: Today/Week/Dishes/Health/Family) **wasn't adopted** — kept the 4-tab shell from
  Step 2 (Today/Week/Dishes/Home). No Health tab exists in this build plan.

1. **Today tab** (`TodayPage`, replaces the placeholder): greeting (time-of-day band, via `greetingPeriod()`), a "next up"
   card picked by `nextMealType()` (current time band, skipping ahead over any meal type the household has off, e.g. no
   snacks), the rest of today's meals, a card linking to Week at a glance with a live planned-count.
2. **Week at a glance** (`WeekGlancePage`, `/week/glance`, `Phone.png` + `Main.png` as one responsive page — a Tailwind
   breakpoint switch between the mobile "today card + coming up list" layout and the tablet/laptop full grid, not two
   separate pages): breaks out of `AppShell`'s mobile-width column with a full-bleed wrapper so the desktop grid actually
   gets to be wide. Dishes only — no cook or eater names anywhere on this page, per this file's own "Week at a glance…
   saved image shows dishes only" decision, so there was nothing to strip out for privacy.
3. **Save as image**: `html-to-image` renders the poster container to a PNG client-side (no server round trip) and
   triggers a download. **Share**: same PNG, handed to `navigator.share` as a file when the device supports file-sharing
   (falls back to a "try Save as image instead" message otherwise) — no public link exists to share instead, per decision.
4. **Print**: `window.print()` plus `print:hidden` on `AppShell`'s header/bottom-nav and this page's own buttons, so the
   printout is just the poster.
5. All new strings in en + ta; unit tests for `nextMealType`/`greetingPeriod` in `lib/planner.ts`. No schema/RLS changes.

### Step 6 · Polish — scope

**Status: partly built.** This pass came directly out of live-testing Steps 2-5 with Venkatesh rather than working
through the mockups top to bottom — three of the four real bugs found so far this build (mislabeled cuisine filter,
two misleading messages, a mislabeled "next week" button) surfaced this way, not from code review. No new migration.

Done:
- **Getting-started checklist is real now** (`GettingStartedChecklist`, used on the first-run wizard and the Home tab):
  invite/plan/publish/poster are live queries (`useInvites`, `useHasPlannedMeals`, `useHasPublishedWeek`,
  `usePosterOpened`), not the hardcoded "2 of 5" stub Step 2 shipped before Steps 4-5 existed to track the rest against.
- **Tamil everywhere, part 1: raw Postgres errors no longer reach the UI.** 13 catch blocks across 7 files showed
  `err.message` verbatim on failure — English-only, technical, sometimes schema-revealing. `lib/errors.ts`'s
  `describeError()` always shows the translated generic message instead and logs the real one to the console.
- **Installable app**: `InstallBanner` (in `AppShell`, dismissible, per-device) surfaces the native install prompt on
  Chrome/Edge/Android, or manual Share → Add to Home Screen instructions on iOS Safari (which never fires
  `beforeinstallprompt` at all — there's no programmatic install path there).
- **Accessibility**: audited icon-only buttons for `aria-label`, colour contrast of the most-used text/background pairs
  (`text-muted` on `bg-cream` measures ~5.6:1, clears AA's 4.5:1), touch target sizes. Found and fixed the "next week"
  mislabel above; bumped `WeekGlancePage`'s smallest touch targets from 28px to 36px.

Deferred, flagged rather than attempted half-done:
- **Welcome tour.** A guided first-visit walkthrough is real UX design work (what gets highlighted, in what order, for
  which of the 4 tabs) — a placeholder tour would likely do more harm than good. Needs a decision on scope before
  building anything.
- **Demo home.** A sandboxed household with fake data to explore before committing to a real one — bigger than it
  sounds: either a real Supabase household seeded and reset per visitor, or a fully separate mock-data code path
  parallel to everything built so far. Worth a decision on which before starting.
- **Tamil everywhere, part 2: no full linguistic/native-speaker review.** Every string has an `en`/`ta` pair and the
  parity test (`translations.test.ts`) guarantees neither language is missing a key mid-flight, but nobody has read the
  Tamil copy end-to-end for tone, grammar or natural phrasing the way a native speaker would.
- **No deeper accessibility pass** (full keyboard-navigation walkthrough, screen-reader testing with VoiceOver/TalkBack,
  a systematic contrast check of every colour pair rather than the handful of most-used ones above).

## Working agreements

- Plain-language explanations; one clear next action for Venkatesh at a time.
- Before committing: `npm run build`, `npm test`, `npm run lint` pass.
- Git author email is the GitHub noreply address (set in this repo's config) — never commit a private email.
- Small, focused commits; push when a step or sub-step works end to end.
