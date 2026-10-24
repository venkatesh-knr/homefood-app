# HomeFood — notes for Claude Code

A family meal planner: each home plans breakfast, lunch, optional evening snacks and dinner for the week, together.
Web app first (installable PWA), wrapped for Android/iOS with Capacitor later.
Owner: Venkatesh (development manager). Explain steps plainly; he runs Supabase dashboard steps himself.

- Spec & design doc: "HomeFood — Spec & Design" (Claude Docs) — the source of truth for features.
  **Read it in `docs/spec.md`** (exported copy, 30 Sep 2026; three diagrams not included). Deviations are recorded here.
- **Mockups: `design/mockups/`** — 16 screens as PNGs (visual reference) plus their `.dc.html` source; index in `design/mockups/README.md`.
  Follow their layout, spacing, colours and copy. Step 2 screens: `SetupHome.png`, `Invite.png`, `Join.png`. Step 3 screens:
  `DishPicker.png`, `DishDetail.png` (the Dishes tab is the picker without its meal-slot context — no "Wednesday dinner" header
  or "Use X" button, tapping a dish opens Dish Detail instead); `Recipe.png` is built (migration 0011); the nutrition panel on `DishDetail.png` is built too (migration 0012, see Step 3 scope below). Step 4 screens: `Planner.png`, `SlotEditor.png`,
  `Rota.png`, `Discussion.png` (built — see Step 4 scope below). Step 5
  screens: `Today.png` (votes/comments built; the notification bell is built too), `Phone.png` +
  `Main.png` (Week at a glance, mobile and tablet/laptop — one responsive page, not two), `Share.png` (what "Save as
  image" produces). `Today.png`'s 5-tab nav (Today/Week/Dishes/**Health**/Family) is a different iteration from the
  4-tab shell already built in Step 2 (Today/Week/Dishes/**Home**) — kept the existing 4 tabs, no Health tab.
- **What changed from the original design** (built differently, built early, added, not built, spec lines now out of date, every migration): `docs/design-changes.md`. Update it when something else changes.
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
- **Week starts Monday by default; a home can choose Sunday** (Home settings, migration 0023). Timezone default Asia/Kolkata.
- **Languages:** English and Tamil at launch, every UI string in both (`src/i18n/en.json`, `ta.json`); more languages later.
- **Week at a glance poster:** signed-in members only; saved image shows dishes only. No public link.
- Photos: free-licence stock photos; a home can replace them with its own (private bucket, one folder per home).
- Veg/egg/non-veg: a per-person everyday **preference** (24 Oct 2026, spec 3a; it replaces the earlier "later, not phase 1" for the filter); it feeds "Suits everyone eating", not a separate filter.

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
**Dark mode** (11 Oct 2026): the colour tokens in `src/index.css` are redefined for dark under `prefers-color-scheme: dark` and `[data-theme="dark"]`;
white cards use `bg-surface` (never `bg-white`) and new colours must be tokens, not hex, so both themes work. Home tab → Appearance (System / Light /
Dark, `lib/theme.ts`, per device in localStorage). `data-theme="light"` on an element forces light for it (the Week at a glance poster, which is saved as an image).

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

- Migrations in `supabase/migrations/`. **0001–0031 are applied** to the live project `homefood-prod` (Mumbai) —
  Steps 2–4 have all been tested live against them. **0007 (pilot stock photos) is applied too** (confirmed live 3 Oct 2026). **0008 (stock photos for the other 22 seeded dishes) is applied too** (all 28 dishes confirmed showing photos live, 3 Oct 2026). Never edit an applied migration; add a new numbered file
  (`0032_….sql`) for the next change. **0032 (shopping list) is applied** (run 23 Oct 2026). **0033 (common shop items + a home's own) is applied** (run 23 Oct 2026); **0034 (prep reminders) is applied** (run 23 Oct 2026; pg_cron was switched on first and 0034 schedules the job `homefood-prep-reminders`). **0035 (own prep reminders, defaults switched off) is applied** (run 23 Oct 2026, before CI had checked it). **0036 (a better Idli photo) and 0037 (a credit for photos chosen from the web) are applied** (run 23 Oct 2026). **0001–0040 are all applied** (0038 leftovers, 0039 everyday preferences and 0040 diet tags were run on 24 Oct 2026, before CI had checked them; **0041 (diet plans), 0042 (diet plate) and 0043 (fasting days) are written**; 0041 and later are run by Venkatesh after CI passes). 0031 (privacy controls) was run on 12 Oct 2026. 0029 (My extras tables, rules and family-totals function) and 0030 (82 shared everyday foods) were run on 11 Oct 2026, as were 0024–0028 (weekly balance, recipe edit, own-dish nutrition and meals out, cuisine guard, six photos). Venkatesh runs these in Supabase › SQL Editor — tell him when one needs running.
  `0005_seed_dishes.sql` seeds ~30 starter dishes into the shared catalogue (household_id null) — not the full "10-12 snacks
  per cuisine" from the Step 3 scope below, see that section for why. `0006_meal_slot_eaters.sql` adds one small table.
  **0009 (110 more Indian dishes, 64 of them sides) is applied too** (138 shared dishes confirmed live, 3 Oct 2026); it skips
  names that already exist. Their photos came with 0014.
  0010 (votes, comments, suggestions) is applied and tested live (vote + comment + delete on a real meal).
  0011 (recipes: 38 standard recipes, English + Tamil) is applied and checked live (Ven Pongal scales to the 3 family members).
  Recipe content is regenerated from `scripts/recipes_data.py` by `scripts/gen-recipes.py`; they are drafts, so the family should
  check them before relying on them.
  0012 (nutrition: per-serving estimates for all 138 dishes + 24 daily reference targets) is applied and checked live: the Dish Detail
  panel, My nutrition and Family nutrition all show real numbers. Regenerated from `scripts/nutrition_data.py` by
  `scripts/gen-nutrition.py` (which sanity-checks calories against the macros).
  0013 (notifications: the bell) is applied; votes and comments still work with its triggers (checked live). The bell can only be
  fully seen once a second person acts, because nobody is notified of their own actions. Triggers write the notifications (week
  published, a published meal changed, set as cook, new suggestion, suggestion accepted/declined, new comment, dish kept despite
  disagreement, Planner turn assigned); repeats for the same person and meal within 10 minutes merge into one.
  **0014 (catalogue photos bundled with the app) is applied (run 10 Oct 2026; bundled photos confirmed loading in the app).** All 138 shared dishes get `photo_path = 'static/<slug>.webp'`
  plus their credit; the files live in `public/dish-photos/` (~7.6 MB, WebP ≤ 720 px, downloaded once from Wikimedia Commons, no more
  hotlinking) and `useSignedPhotoUrl` turns `static/<file>` into the app's own link. 8 of the 138 are drawings (marked "(illustration)" in the credit): pizza,
  fries, katsu curry, vegetable soup, plus veg pulao, egg bhurji, masala chai, sweet lassi. Regenerate with `python scripts/build-dish-photos.py`
  (reads `scripts/dish-photo-picks.txt` for the 110 and 0007/0008 for the 28; writes the files, `scripts/dish-photos.json` and the migration).
  The PWA caches each photo the first time it is seen (not pre-cached). A household's own photo (private bucket) still wins.
  **0015 (160 more South Indian dishes) is applied (run 10 Oct 2026; Olan and Kara kuzhambu checked in the app).** Tiffin, variety rice, kuzhambu/sambar/rasam, kootu, poriyal,
  chutney/thokku/pickle/podi/pachadi, snacks, sweets, drinks, Kerala/Karnataka/Andhra items and non-veg (46 breakfast, 78 lunch, 45 snacks,
  42 dinner; 48 mains, 112 sides), each with a Tamil name and a nutrition estimate; 111 had a bundled photo when 0015 ran (13 more come in 0018).
  Their recipes are in 0016. Data lives in `scripts/south_indian_data.py` (one line per dish); regenerate with
  `python scripts/gen-south-indian.py` (validates names are new and calories match the macros). Photos: pick Commons titles in
  `scripts/south-indian-photo-picks.txt`, run `python scripts/build-south-indian-photos.py`, then regenerate. 0014–0018 are loaded by
  `scripts/test-db.sh`, so CI also checks the SQL really runs. Shared catalogue is now 298 dishes.
  **0016 (recipes for the 160 new South Indian dishes) is applied and checked locally (Kara kuzhambu recipe scales to 3 servings, English and Tamil).** English + Tamil, ingredients scaled by the app,
  drafts to be checked by the family. Source text: `scripts/recipes_south_a.txt` … `d.txt` (one block per dish: `@ dish | servings | prep | cook`,
  `i:` ingredient lines, `s:` step lines); regenerate with `python scripts/gen-south-recipes.py`, which checks every dish exists in 0015, units are
  valid and nothing is missing. With 0011 that makes 198 dishes with a recipe.
  **0017 (recipes for the remaining 100 dishes of 0005/0009) is applied and checked locally (Samosa recipe scales to 3).** After it, all 298 shared dishes have a recipe.
  Source text `scripts/recipes_more_a.txt` / `b.txt`, same format; regenerate with `python scripts/gen-more-recipes.py`.
  **0018 (13 more South Indian photos: beans usili, murungai keerai poriyal, senai fry, cluster beans poriyal, puli kuzhambu, poondu rasam,
  arachuvitta sambar, olan, erissery, pulissery, paper roast, veg stew, coriander chutney) is applied and checked locally (Olan photo + recipe).** 124 of the 160 now
  have photos; the other 36 have no matching Commons photo and show the initial. 0015 must never be regenerated with new photos: the list it
  was written with is frozen in `scripts/south-indian-photos-0015.json`; later photos go through `scripts/gen-south-photos.py`.
  **0019 (who actually ate what) is applied (run 11 Oct 2026; checked live: Skipped removes the meal from My nutrition, Large counts 175 → 219 kcal, saved choices survive a reload, Tamil labels work).** Table `meal_attendance` (slot, person, status ate/skipped/elsewhere, portion
  small/normal/large): no row = ate a normal portion. A person writes their own row, the Admin anyone's; only meals up to today (Asia/Kolkata), only
  family members (never the helper). The Today cards have a "Did you eat this?" control (`AttendanceControl`); My nutrition and Family
  nutrition leave out skipped / elsewhere meals and count small / large as 75% / 125% (`lib/attendance.ts`, `dayTotalsFor`). Before the
  migration runs the queries return nothing and every meal counts as normal. History still lists planned meals.
  **0020 (Tamil wording fixes) is applied.** Three dish names get their missing sandhi and 34 recipe ingredient names are made
  consistent (one Tamil word per ingredient; "ghee or oil" says both). It is generated by `scripts/gen-tamil-fixes.py`, which diffs the Tamil in
  the applied recipe migrations against the current sources. **Never regenerate 0011/0016/0017/0015** (applied): fix the source text, then re-run
  that script and run the new migration it writes.
  **0021 (breakfast/dinner overlap), 0022 (favourite dishes) and 0023 (week start Monday/Sunday) are applied and checked live (11 Oct 2026: Dinner filter shows idli/dosa/upma/pongal/poori/puttu, Breakfast shows chapati/parotta/sambar/salna; a favourite jumps to the top and the chip filters; switching to Sunday gave 11–17 Oct with the existing meals intact, and back to Monday restored 5–11 Oct).**
  0021 adds `dinner` to 28 breakfast tiffin dishes and `breakfast` to 11 dinner dishes (rotis, parotta, sambar, salna, curd, khichdi…) so the
  Breakfast/Dinner filters stop hiding dishes people cook at both. 0022: table `dish_favourites` (per home, any member toggles); the heart on a dish
  row / Dish Detail, a Favourites chip, and Dishes + picker order = favourites, then most planned in the last 120 days, then A–Z (`lib/favourites.ts`).
  0023: `households.week_start` may be 1 (Monday) or 7 (Sunday), set in Home settings and in setup step 1; a week plan must start on that day;
  unique (household, date, meal) on meal_slots. The app reads a week's meals **by date** (`useWeekSlots(householdId, weekStart)`), not by week plan,
  and `saveSlot` edits an existing slot where it lives, so switching mid-use never duplicates or hides meals. `weekStartOf(date, startsOn)` takes the
  home's `week_start` everywhere (Today, Week, glance, rota, history, nutrition periods).
  **0028 (stock photos, batch 3, 12 Oct 2026)**: of the 298 shared dishes only 36 still had no photo (the earlier batches already covered every common North Indian dish); this found good free
  Commons photos for 6 of them (Pudina rice, Mango rice, Panakam, Brinjal chutney, Vazhaithandu poriyal, Vadam). For the other 30 a Commons search (names and spelling variants) found nothing that matched the dish, so they keep the initial (a better search later may find more): Samai upma, Mor kali,
  Ulundu kali, Keerai vadai, Vazhaipoo vadai, Verkadalai sundal, Corn sundal, Mutton kola urundai, Curry leaf rice, Ellu sadam, Milagu kuzhambu, Paruppu urundai kuzhambu, Paruppu, Kathirikai kothsu,
  Avarakkai kootu, Pudalangai kootu, Vazhaipoo poriyal, Vazhakkai podimas, Pudalangai poriyal, Mochai poriyal, Mor milagai, Pottukadalai chutney, Curry leaf chutney, Ginger chutney, Tomato thokku, Fish thokku,
  Narthangai pickle, Paruppu podi, Pineapple pachadi, Pepper chicken. Method: put `dish | Commons file title` lines in `scripts/more-photo-picks.txt`, `python -X utf8 scripts/build-photos.py scripts/more-photo-picks.txt
  scripts/more-photos.json`, then `python -X utf8 scripts/gen-photo-migration.py scripts/more-photos.json <number> "<title>"`. `src/lib/staticPhotos.test.ts` checks every `static/...` path in the migrations is a real file.
  `0007_dish_stock_photos.sql` sets a real Wikimedia Commons photo (+ credit) on 6 of those seeded dishes — a pure data
  update, no schema/RLS change, see Step 3 scope below for which ones and why only 6 so far.
- "Automatically expose new tables" is OFF: every new table needs explicit `grant … to authenticated` plus RLS policies.
- Helpers: `my_profile_id()`, `my_household_id()`, `is_admin()`, `can_plan(household, date)`, `can_plan_week(household, week_start)`.
- RPCs: `create_household(p_name, p_display_name, p_language default 'en', p_snacks_enabled default true)` → household id (caller becomes Admin);
  `get_invite(p_token)` → household_name, invited_by, member_count, people [{id,name,birth_year,joined}] — `people` excludes whoever created the
  link and includes everyone else who can log in, joined or not (works signed out);
  `claim_profile(p_token, p_profile_id)` → household id.
- Guard triggers stop members promoting themselves, the last Admin stepping down, planning outside a turn, cross-home cooks.
- Any new rule gets a check in `supabase/tests/rls_test.sql` (currently 422 checks — all passing in CI, see below). There's also
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
src/lib/supabase.ts     client (persistSession, autoRefreshToken, detectSessionInUrl: false); exported `supabase` is a Proxy that points at the demo's in-memory client while the demo is open
src/demo/               demo home: fakeClient.ts (in-memory Supabase-shaped client), demoData.ts (the made-up family and weeks), demoState.ts (open/closed + Admin/Planner/Member view), demo.ts (startDemo/stopDemo), catalogue.json (generated)
src/lib/auth.tsx        AuthProvider/useAuth: session, sendCode, verifyCode, signOut; AuthError kinds wrongCode/tooMany/generic
src/lib/validation.ts   email/code/name/allergy helpers (+ tests)
src/lib/people.ts       Household/Profile/Invite types + pure helpers (ageBand, avatarColor, personDetailText…) (+ tests)
src/lib/queries.ts      react-query reads: useMyProfile, useHousehold, useMembers, useAllergies, useInvites, useInvitePreview
src/lib/mutations.ts    plain async writes (createHousehold, addPerson, createInvite, claimProfile…) that invalidate the query cache
src/lib/homeContext.tsx useHome(): {profile, household} loaded once by <AppShell> and shared with every tab
src/lib/onboarding.ts   per-device "seen the invite-your-family screen" flag (localStorage, not a DB column)
src/lib/dishes.ts       Cuisine/Dish types + pure helpers (dishDisplayName, dietColor, passesFilters…) (+ tests)
src/lib/dishQueries.ts  react-query reads: useCuisines, useDishes, useDish, useDishPhotoOverrides, useSignedPhotoUrl (+ staticPhotoUrl for `static/` paths)
src/lib/dishMutations.ts addDish/updateDish/removeDish, uploadDishPhoto (strips EXIF/GPS via lib/photo.ts first)
src/lib/planner.ts      week/meal types + pure helpers (weekStartOf, weekDates, mealAllergyConflicts, turnCoversDate…) (+ tests)
src/lib/plannerQueries.ts react-query reads: useWeekPlan, useWeekSlots (one call, embeds dish/sides/cooks/eaters), usePlannerTurns
src/lib/history.ts      History screen helpers: rangeBounds/shiftAnchor (week·month·year), summariseHistory, topEntries (+ tests)
src/lib/discussion.ts   vote/comment helpers: tallyVotes, agreeShare, nextVote, countsBySlot, formatCommentTime (+ tests)
src/lib/discussionQueries.ts / discussionMutations.ts  votes, comments, suggestions (counts are fetched apart from slots and fail quietly)
src/lib/intake.ts       My extras logic (units, nutrition of an amount, day totals, goals, search) (+ tests); intakeQueries.ts / intakeMutations.ts; useExtrasPeople.ts
src/lib/recipes.ts      recipe scaling/formatting helpers (+ tests); recipeQueries.ts: useRecipe, useRecipeDishIds
src/lib/notifications.ts / notificationQueries.ts  bell: targets, wording helpers (+ tests), polling reads, mark read
src/lib/nutrition.ts    per-meal/day totals, daily targets, summarisePeriod tips, familyNotes (+ tests); nutritionQueries.ts reads
src/lib/plannerMutations.ts getOrCreateWeekPlan, saveSlot (upserts a slot + replaces sides/cooks/eaters), clearSlot,
                        publishWeek, copyDay/copyWeek (client-orchestrated, never overwrites an existing slot), assignPlannerTurn
src/components/ui.tsx   Button, Logo, LanguageSwitch, Card, Toggle, Avatar, Pill, TogglePill, ChipInput
src/components/         PersonForm, PersonRow, PeopleSection, InviteCard, QrCode, GettingStartedChecklist, SignInForm,
                        DishRow (+ DishThumb, DietMark), DishPickerSheet (full-screen dish picker, reused by the slot editor)
src/pages/              SignInPage, SetupNeededPage, SetupHomeStep1Page, SetupHomeStep2Page, JoinPage,
                        AppShell (+ TodayPage, WeekPage, SlotEditorPage, RotaPage, WeekGlancePage, HistoryPage, DiscussionPage, RecipePage, NutritionPage, FamilyNutritionPage, NotificationsPage, DishesPage,
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
- [ ] Step 7 · Family trial (2 weeks): the checklist, what to watch for and the day-14 review are in `docs/family-trial.md`

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
- **Recipes (migration 0011) and nutrition (0012) are built.** `RecipePage` (`/dishes/:id/recipe`, `Recipe.png`): servings
  stepper (starts at who is eating, else the number of family members), ingredients scaled and written as a cook would (`lib/recipes.ts`:
  1¼ cups, ¾ tbsp, 250 g; pieces, cloves and slices are always whole numbers, so 7½ shallots reads 8), steps you can tick off, cook mode (screen wake lock + bigger text) and a Watch (YouTube) button. A Recipe
  button shows on Dish Detail, the Today next-up card and the discussion card, only for dishes that have a recipe. Tables allow a home
  to keep its own version (Admin only). **"Edit our version" is built (12 Oct 2026, migration 0025)**: the Admin's "Edit our version" (or "Write our recipe" when a dish has none) on the Recipe screen opens `RecipeEditPage` (`/dishes/:id/recipe/edit`, `lib/recipeEdit.ts`): servings, prep/cook minutes, every ingredient (English + optional Tamil name, amount like 2, 1.5, 1/2 or 1 1/2, unit) and step (English + optional Tamil), a note, move up/down, and "Back to the original" (deletes the home's copy). Saving goes through the database function `save_household_recipe`, which writes the whole copy in one transaction (all or nothing, Admin only, the standard recipe is never touched). A name or step typed in only one language is stored in both fields. There is no Recipe button in the slot editor
  (leaving it would lose unsaved edits).
  **Nutrition**: Dish Detail shows "Nutrition per serving" (calories, protein, carbs, fat, fibre, sodium as bars against an adult's day,
  labelled *Estimate*) and "For your family" (notes from the dish's tags and each person's age band, plus how often it was cooked this
  month). Home tab → **My nutrition** (`/nutrition`): the meals you are marked as eating, up to today, added up per day/week/month against a
  target for your age band, sex and activity (ICMR-NIN 2020, rounded; missing details are assumed and the screen says so) with a few
  gentle tips. Home tab → **Family nutrition** (`/nutrition/family`, Admin or whoever is Planner today): the same per person.
  Logic in `lib/nutrition.ts` (+ tests). Every figure is an estimate: one serving of the main dish plus one of each side, a normal
  portion (adjusted by attendance, see 0019). **Since 12 Oct 2026 (migration 0026): a home's own dishes can carry an estimate** (optional "Nutrition per serving" boxes on Add / Edit dish: calories,
  protein, carbs and fat are needed, fibre / sugar / salt count as 0 if left out; `lib/dishNutrition.ts`; the Admin or whoever added the dish may write it), **and a dine-out / order-in meal can be marked light /
  normal / heavy in the slot editor** (`meal_slots.outside_meal_size`, only for meals not cooked at home): My / Family nutrition add a rough, labelled estimate (`OUTSIDE_MEAL_ESTIMATES`: 350 / 650 / 950 kcal
  with macros). A meal out with no size is still left out and counted in "meals left out". `saveSlot` saves without the size until 0026 is run. It hangs off the Home tab because the 5-tab Health/Family nav wasn't adopted.
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
   parent). **Rename and delete (12 Oct 2026, migration 0027)**: "Manage my cuisines" (`MyCuisines`, Admin) lists only the home's own cuisines with the number of dishes using each; deleting is blocked in the app and by a database guard (`guard_cuisine_in_use`) while any dish uses it.
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
  comments link. Free-text suggestions ("Something else…", up to 120 characters, next to "Suggest a dish"; the Planner can only mark them "Noted" because there is no dish to swap in) were added 12 Oct 2026. Parked: comments can't be
  edited; changing a dish in the slot editor doesn't clear votes; the notification bell is built (see below).
- **Weekly balance banner (migration 0024, built 12 Oct 2026)**: a gentle, dismissible note on the Week tab for the Planner and Admin only (`BalanceBanner`, `lib/balance.ts`): the same main dish
  3+ times, fried dishes (tag `fried`) in more than 4 meals, a day still to come with a home lunch/dinner but no vegetable dish (tag `vegetable`, set on 50 shared dishes from
  `scripts/vegetable-dishes.txt`; a home can tag its own), 3+ dine-out/order-in meals in a row (an unplanned meal breaks the run). The three numbers are `households.balance_same_main/fried/out_run`
  (defaults 3/4/3, ranges 2–14 / 0–28 / 2–14), edited by the Admin in Home tab → Weekly balance (`BalanceLimitsCard`). Dismissed per device per week, and it comes back only if what it says changes.
  Until 0024 is run the limits default and the vegetable rule is skipped. Regenerate with `python -X utf8 scripts/gen-balance-tags.py`.
- **Notifications: an in-app bell, no phone push (migration 0013).** The bell in the header shows a red dot while anything is unread
  (checked every minute and when the app opens); `/notifications` lists them, tapping one marks it read and opens the meal thread, the
  poster or the rota. Not built: web/native push (needs a push key and a server function), per-person muting of event types, allergen
  alerts and "your Planner turn starts tomorrow" reminders (need a scheduler).
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
- **Today has votes, comments and the notification bell** (in the app header, as `Today.png`); Today's 5-tab nav still isn't adopted.
- **"You ate this" is built as attendance (migration 0019)**, not as `meal_slots.status`: each person (or the Admin for them) records a normal /
  small / large portion, skipped or ate elsewhere, from the Today cards **and, since 12 Oct 2026, from any past meal on the History screen** (the database already allowed any
  day up to today). Parked: a review screen.
- **History screen** (Home tab → "Meal history", `HistoryPage`, `/history`, `lib/history.ts`): Week / Month / Year with prev/next (never into the future), counts (meals, home /
  dine-out / order-in, most cooked dishes, **by cuisine**, who cooked, **meals each person ate**), a search box, and the meals grouped by day (tap one to open it), each with the
  "Did you eat this?" control. **Eaten counts come from attendance where recorded and fall back to the plan** (`summariseHistory(slots, attendance)`): a person's meal counts unless they
  skipped it or ate elsewhere; a meal counts as eaten unless everyone marked as eating it skipped it. The header says how many meals have anything recorded. No new tab (still 4).
- **"Cook this again"** (12 Oct 2026): a button on each home-cooked History row and on Dish detail opens `CookAgainSheet` (`lib/cookAgain.ts`, `components/Dialog.tsx`): the next 14 days for the same
  meal (History) or the dish's own meals (Dish detail). The Planner/Admin (on days their turn covers) can "Plan here" in a **free** slot (none, or one with no dish and no place): it saves the
  dish, the sides it had (from History) and everyone eating, no cooks; it re-checks first and **never replaces a planned meal**. Everyone else gets "Suggest" on **planned** meals only (a
  suggestion needs a slot row and only the Planner can create one, so a free slot cannot take a suggestion without a rules change). `Dialog` is the shared modal (focus trap, Escape, focus returns).
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

- **Demo home** (12 Oct 2026, spec "Welcome and demo"): "Explore a demo home" on the sign-in screen. It runs only on the device with made-up data: no Supabase
  reads or writes, nothing stored, fresh every time it opens (a reload ends it). It is **one data layer, not a second set of screens**: `lib/supabase.ts` exports a Proxy,
  and while the demo is open it forwards to `src/demo/fakeClient.ts`, a small in-memory client that understands the query calls the app makes (joined selects, filters,
  order/limit, insert/update/upsert/delete with the same uniqueness and cascade rules, single/maybeSingle, counts). `AuthProvider` hands out a made-up session per view
  (Admin = Amma, Planner = Appa who has this week's turn, Member = Kavi); the banner (`DemoBanner`, in `AppShell`, every screen) switches view and has "Start my household".
  Sample family: Amma, Appa, Paati (no login, soy allergy), Kavi, Arun, Helper (cook only). Last week (done) and this week (published, with a dine-out lunch and an order-in dinner),
  votes, comments, an open suggestion, attendance on today's meals, bell items. The 100 dishes with recipes, nutrition and photos are real catalogue entries: regenerate
  `src/demo/catalogue.json` with `python -X utf8 scripts/gen-demo-catalogue.py` (edit its PICKS list; `demoData.ts` WEEK names must be among them). Anything that needs a server
  (`rpc`, photo upload) answers "not available in the demo". New tables or joins that screens read need a line in `fakeClient.ts` (REL / PK / CASCADE) and in `demoData.ts`.
  The demo's device flags (onboarding, poster opened) live in memory, not localStorage.
- **First-visit tips** (12 Oct 2026, spec layer 4): one short tip the first time each main screen opens (Today, Week, slot editor, Dishes, Dish detail, Week at a glance,
  Discussion, Home), dismissed with "Got it", never shown again on that device (`lib/tips.ts`, localStorage `homefood.tip.<id>`; `components/FirstVisitTip.tsx`, `role="note"`, in the page
  flow, never an overlay; focus moves to the page when it goes). Home tab → Tips → "Show tips again" (`TipsCard`) brings them all back. In the demo home tips live in memory only and
  start unseen. Add a tip: a `TipId` in `lib/tips.ts`, `tips.<id>` in en/ta, `<FirstVisitTip id="…" />` on the screen.
- **My extras** (11–12 Oct 2026, migrations 0029 + 0030, both applied): a personal food log so each person's nutrition includes what they eat outside the planned meals. **Decisions
  (do not change without asking):** a person's items are PRIVATE to them (own login only); the Admin can log for and see only family members with NO login (`can_login = false`: Paati, children),
  never the helper and never a member who has a login; Family nutrition (Admin / today's Planner) gets only per-person DAILY TOTALS from the `family_extras_totals` function, never items, and compares
  against the standard ICMR-NIN target (goals are private); optional personal protein / calorie goals (`personal_goals`, same privacy, no body weight stored); supplements are not a category
  (protein powder is a food); tea and coffee are foods; no water tracking; extras never appear in History, the planner, the poster or notifications; gentle tone, no streaks or "too much" warnings.
  **Tables:** `common_foods` (82 shared foods, per-unit nutrition, Tamil names; data in `scripts/common_foods_data.py`, regenerate 0030 with `gen-common-foods.py`, which checks calories against macros),
  `custom_foods` (the home's own, "Something else…"), `personal_intake` (one row per item with a SNAPSHOT of the nutrition, so correcting a food never changes a past day; today and up to 7 days back),
  `personal_usuals` (the ⭐), `personal_goals`. **Code:** `lib/intake.ts` (pure logic + tests: units/steps, nutrition for an amount, unknown stays unknown, day totals, meals+extras merge, same-as-yesterday,
  recent, English/Tamil search, goal choice, progress), `intakeQueries.ts` / `intakeMutations.ts` (fail quietly before the migrations), `AddFoodSheet`, `ExtrasSection` (Today tab, with the Admin's person
  switcher via `useExtrasPeople`), `ProteinCard` (Today and My nutrition), `MyGoalsCard` (Home tab), My nutrition shows "meals X + extras Y kcal" per day, Family nutrition adds the totals + a note.
  The demo home gives Kavi and Appa a few private extras; its fake client enforces the same privacy (`PERSONAL_TABLES`) and has `family_extras_totals`. Not built: editing the time of a logged item,
  logging more than 7 days back, extras in the data export (comes with the privacy controls, still to do).
- **Your data and account** (12 Oct 2026, migration 0031): Home tab → `AccountCard` (hidden in the demo): **Download my data** (`export_my_data()`, JSON of my profile, allergies, goals, extras, usuals,
  votes, comments, suggestions, attendance, notifications, turns, dishes I added, and my home's plans; runs with my own rights so it can only contain what I can see), **Sign out on all devices**
  (`signOut({scope:'global'})`; the ordinary Sign out now ends only this device), **Delete my account** (`delete_my_account()`: removes the login and personal rows, my profile stays as "Former member" with no
  details so past plans and comments keep their history; the last Admin must hand over first), **Delete this household** (Admin; type the exact home name; the app first removes the home's photos from the
  bucket, then `delete_household(name)` deletes the home and every login of it). Two guards honour a transaction-local flag `homefood.removing` that only these functions set. `lib/account.ts` (+ tests).

- **Shopping list, step 1 of 5 of the Shopping / Prep / Cook's-sheet batch** (23 Oct 2026, migration 0032; spec: "Shopping, prep reminders and the cook's sheet" in `docs/spec.md`; mockups 14-17). **Decisions (do not change without asking):** ONE shared list per home; anyone
  with a login adds, edits, ticks and removes, only the Admin can clear the whole list (`clear_shopping_list()`); no prices, budgets, pantry stock, expiry, online ordering or barcodes; the app stays at 4 tabs (a Shopping button on the Week tab and a Shopping card on Today); only items and amounts ever
  leave the app (WhatsApp / copy text); amounts use only g, kg, ml, L, pcs, bunch, pack (never cups or spoons). **How it works:** `shopping_items`, one row per name per home (case-insensitive unique), `section` veg_fruit | grocery | dairy_eggs | other; a ticked item has `bought_at` / `bought_by`
  and shows under "Bought" for 24 hours, then the app hides it (and quietly deletes it unless it is a regular: `pruneBought`); a starred **Regular** is never deleted, it just sleeps after its day under Bought and the Regulars button wakes every sleeper; "Clear the list" deletes all non-regulars and puts the regulars to sleep.
  Typing an item already on the list opens it (a ticked or sleeping one is put back). `lib/shopping.ts` (+ tests): `parseTyped` ("tomato 1 kg", "2 kg onion", Tamil names and units), `nudge` / `changeUnit` (steps 0.5 kg or L, 100 g or ml, 1 pc/bunch/pack), `splitList`, `groupBySection`, `shareText`, `whatsappLink`;
  `shoppingQueries.ts` (checks every 20 s while the screen is open; an error hides the Today card), `shoppingMutations.ts` (optimistic updates so − and + feel instant), `ShoppingPage` (`/shopping`). The demo home has a made-up list and the demo's fake client has `clear_shopping_list`. **Common items and "our" items (commit 2, migration 0033):** `common_shop_items` (150 shared, read-only: English + Tamil name, `aliases`, section, browse tab, usual amount + unit, `perishable`, `staple`, own `pack_sizes` in g/ml, `g_per_cup`, `g_per_piece`; the last four are for "From this week's meals" and are never shown) and `household_shop_items` (a home's own: everyone in the home sees them, the creator or an Admin renames/deletes; same columns).
  Data lives in `scripts/shop_items_data.py` (one line per item; the Tamil names are everyday market words for the family to check); `python -X utf8 scripts/gen-shop-items.py [--coverage]` validates it, writes 0033 and `src/demo/shopItems.json`, and reports how many real recipe ingredient lines the items match (92% of 2,172; `--coverage` lists the unmatched names). Never edit an applied 0033: add a new numbered migration for later changes.
  Typing: suggestions from name, Tamil name or alias (`suggestItems`), a known item goes to its own section with its Tamil name and its usual amount/unit unless an amount was typed, an unknown name offers "Add '<name>' as a new item" (`NewItemForm`: name, Tamil name, section, usual amount, "Save to our common items" on by default); an item on the list that is not saved yet shows "Save to our common items" in its editor. "Browse common items" (`BrowseCommon`, tabs Vegetables / Fruits / Groceries / Dairy & eggs / Other, 3-column grid, "On list", "Our item" tag; scrolls inside its own box because Groceries has ~78 tiles). Home tab → `OurShopItemsCard` (rename / remove). Matching uses `canon()` (lower case, no brackets or hyphens, each word singular), which is mirrored in `scripts/gen-shop-items.py`: change both together.
  **"From this week's meals" (commit 3, no migration)** (`/shopping/plan`, `ShopFromPlanPage`; pure logic and tests in `lib/shoppingPlan.ts` + `shoppingPlan.test.ts`, which uses the real `src/demo/shopItems.json`): a Shopping button next to Regulars. Range "Rest of this week" (tomorrow to the last day of the home's week; empty on the last day) or "Next 7 days" (tomorrow + 6). Takes the HOME meals of the range (dine-out / order-in need nothing), the main dish and every side, scaled by the people on that meal's eater list (the helper is never on it; no list = the number of family members) over the recipe's servings, a home's own recipe version before the standard one (`useRecipesForDishes`). Each ingredient is matched to a common / own item (`matchIngredient`: name, Tamil name or alias after `canon()`; "Onion, chopped" tries "onion", "Oil for frying" tries "oil", "A and B" tries A; water and cooked rice are ignored). **Amounts (decisions, do not change without asking):** recipe cups, spoons and pieces are turned into g / ml / pieces / bunches behind the scenes (cup = 240 ml; tbsp = 1/16 cup; tsp = 1/48 cup; solids use the item's `g_per_cup`, vegetables default to 150 g a cup; pieces use `g_per_piece`), never shown. **Perishables** (flag from 0033) are added up over all dishes and rounded UP to 50 g / 100 ml / whole pieces or bunches, shown as "about". **Non-perishables** are not exact: the smallest pack that covers the need (default packs 100, 200, 250, 500 g, 1, 2, 5 kg or 200, 500 ml, 1, 2, 5 L, or the item's own `pack_sizes`; above the largest pack, whole kg or L); a line that cannot be converted counts as one smallest pack. **Staples** (flag) are kept apart, unticked, under "Usually at home" with their computed pack; ingredients nothing matches are unticked under "Not in common items" (added with no amount, section Other). Ticked lines are merged into the list by `mergePlanIntoList`: a name already on the list gets the amounts added when both are the same kind (weight, volume, pieces; otherwise its amount stays), the dishes joined and source "plan"; a ticked-off or sleeping one comes back with the new amount. The Today card also says "<item> needed tomorrow" (`neededFor`: plan items whose dish names match tomorrow's home dishes, in either language). The rounding cases from the spec are unit tests (380 g toor dal -> 500 g, 1.3 kg rice -> 2 kg, 300 ml oil -> 1 L, 3 sambars -> tomato to 50 g, drumstick pieces up).
  **Prep reminders (commit 4, migration 0034)**: some dishes need doing AHEAD. `recipe_prep` (per recipe: `kind` soak | batter_ferment | set_curd | thaw | marinate | sprout | other, `lead` night_before | hours_before, `hours`, `text_en`, `text_ta`; Admin writes a home's own recipe version's tags, a home's own recipe with no tags falls back to the standard recipe's, `prep_for_dish()`); `prep_done` (slot + task, who, when; anyone in the home ticks or undoes it; everyone sees "Done by <name>").
  **61 tags on 61 standard recipes** from `scripts/prep_data.py` (regenerate 0034 and `src/demo/prep.json` with `python -X utf8 scripts/gen-prep.py`, which checks every dish has a recipe; never edit an applied 0034, add a new migration): idli/dosa/uttapam/appam/kuzhi paniyaram/podi idli/mini idli sambar batters (night before, needs about 8 h), mangalore buns, kambu koozh, pazhaya sadam; soaking chickpeas (Chole, Chole bhature, Kadala curry, Sundal), rajma, dal makhani, pesarattu (night before) and the vada/adai/peanut soaks (3-4 h before); set curd (Curd, Curd rice, Cucumber raita, Boondi raita); thaw chicken / mutton / fish / prawns / crab for 23 meat and fish dishes (assumes frozen; a home with fresh meat just ticks or ignores them); marinate (biryanis, tandoori chicken, chicken tikka night before; butter chicken 4 h and paneer tikka 2 h before). No sprout dish exists, so none is seeded (the kind is ready for a home's own recipe). The Tamil wording is mine, in the polite "-வும்" form of the mockups: the family should check it.
  **Today** (`PrepCards`, `lib/prep.ts` + tests, `prepQueries.ts`): "Tonight · for tomorrow" from 4 pm on the HOME's own clock (`households.timezone`): tomorrow's home meals' night-before tasks, each with the dish, the meal and "needs about N hours" / "overnight"; "Today · prep" shows today's hours-before tasks until that meal's time (breakfast 8, lunch 13, snacks 17, dinner 20). Hidden when nothing is needed; dine-out and order-in meals have none. Done / Undo, "Done by <name>", "2 of 4 done".
  **The 7 pm reminder**: `create_prep_reminders(p_at)` (not callable by the app) writes one `prep_reminder` notification per cook with a LOGIN (the helper has none) for each night-before task of tomorrow's home meals, only in the 7 o'clock hour of each home's own clock, never twice (`notifications.dedupe_key` = slot + task + cook + date, a partial unique index), never for a task already ticked done. 0034 schedules it with pg_cron (`homefood-prep-reminders`, every 15 minutes) when the extension is on; otherwise it prints a notice and the schedule is skipped (switch pg_cron on under Database > Extensions and run 0034 again). The bell shows "Tonight: <task>, for <day> <meal> (<dish>)" and opens Today. No phone push yet. The demo home treats the clock as 4 pm so the evening card can be seen.
  **Own reminders and switching defaults off (commit 4b, migration 0035)**: on **Dish Detail and the Recipe screen** a "Prep reminders" section (`PrepSection`) lists a dish's reminders for everyone; **the Admin, or whoever is the Planner today** (an approved Planner turn that covers today on the home's clock: `can_edit_prep()` in the database, `useCanEditPrep` in the app) can (a) switch a standard reminder off for THIS home only (`household_prep_off`; it disappears from Today and from the 7 pm reminder; a switched-off one is listed as "Off for our home" and can be switched back on) and (b) add, edit or remove the home's OWN reminders for that dish (kind, night before / hours before, hours, wording in English and optionally Tamil; a text typed in one language is kept for both). Own reminders are rows of `recipe_prep` with no recipe (`household_id` + `dish_id`), so Today, Done and the 7 pm reminder treat them exactly like the standard ones. `prep_for_dish` = the standard tags (or the home's own recipe version's, if it has tags) minus the switched-off ones plus the home's own; `lib/prep.ts` `prepOptions` / `prepByDish` do the same in the app. Only standard reminders can be switched off; own ones are removed. Reminders are tied to a dish (not free-floating). The reminder is an in-app notification saved for the person, so it shows on every device they are signed in on; there is no sound or phone push yet (phone push comes with the Capacitor wrap).
  **Shopping layout, version 3 (24 Oct 2026, mockup 15c `ShoppingV3.png`, no migration; replaces the 23 Oct layout)**: the page has two tabs. **To buy · N**: a 44 px tick box on the left is the ONLY thing that marks an item bought, a − amount + stepper on the right changes the amount (`AmountStepper`, `ListRow` in `components/ShopRows.tsx`), tapping the amount opens a sheet (`AmountSheet`: amount, unit chips, section, Regular switch, Save to our common items, Remove); buttons "Add regulars · N" (starred items not on the list: asleep ones and ones ticked today, `regularsToAdd`) and "This week's meals"; Bought below ("Tick again to put back", clears after a day as before); the Admin's Clear the list and the share note at the bottom. **Add items**: "Add what this week's meals need" on top, a search box that is also the quick add ("tomato 1 kg" + Enter), tabs ★ Regulars (first when there are any, with "Add all N") / Vegetables / Fruits / Groceries / Dairy & eggs / Other / Ours (`ADD_TABS`, `itemsOfAddTab`), every common item listed with "Usually 1 kg" and an Add button that becomes a green − amount + stepper once the item is on the list (− at the smallest amount takes it off the list: `atMinimum`), and "Add an item that isn't here" at the bottom (the existing `NewItemForm`). Share is a header button that opens WhatsApp / Copy; the pinned bottom bar and the full-screen browse sheet are gone. The unit chips are weight (g / kg), volume (ml / L), pcs, bunch, pack: g or kg is picked from the amount (`changeChip`). **Amounts are tidied everywhere** (`tidy`): 1000 g or more is kg, 1000 ml or more is L (1500 g = 1.5 kg), below 1 kg / 1 L back to g / ml (0.5 kg = 500 g); done when an amount is shown (`formatAmount`, so the WhatsApp text too), typed (`parseTyped`), stepped (`nudge`), stored (`addShoppingItem`) and added from the plan (`mergePlanIntoList`). All earlier rules stand (one list per home, Admin-only clear, regulars sleep, only items and amounts leave the app).
  **Cook's sheet (commit 5, no migration)** (`/cook-sheet`, `CookSheetPage`, `lib/cookSheet.ts` + tests): from a card on Today (next to Shopping, "Send tomorrow's cooking to <helper>") and a button on the Week tab; anyone in the home can open it. Day = today or tomorrow (tomorrow by default from 4 pm on the home's clock), language English / Tamil (default `households.default_language`, independent of the screen language), switch "Name who has the allergy" (OFF by default). The message: `HomeFood · <day, date>`, then for each planned meal of the home's meal types `Meal (N): main + sides · cooks` (N = the meal's eater list, else the family count, helper never counted; Tamil `(N பேர்)`; dine-out / order-in say "Eating out" / "Ordering in" with no place or cooks), a `Note:` line from the real allergy cross-check (the day's dishes' allergens against the people eating each meal: "1 person: no soy", or "no soy for Paati" with the switch on), and `Tonight:` with tomorrow's night-before prep not yet ticked done (tomorrow only). Dishes, numbers and cooks only: no photos, nutrition, votes, comments or notes (a test checks this). A helper profile named exactly "Helper" is written "உதவியாளர்" in the Tamil sheet; other names are as entered. Send on WhatsApp (`navigator.share`, else a wa.me text link), Copy text, Print (only the sheet prints).
  **The Shopping / Prep / Cook's-sheet batch is complete.**

Deferred, flagged rather than attempted half-done:
- **Welcome tour** (15 Oct 2026, spec layer 1): four swipeable cards (plan the week, everyone has a say, the poster, nutrition + allergy warnings), skippable, English and Tamil
  (`WelcomeTour`, `lib/tour.ts`). **Backgrounds and copy come from the Canva design "HomeFood onboarding screens"** (https://canva.link/hlg8r5txhb0wmtt, linked in the spec): the four photos are cropped from its pages into `public/tour/{plan,say,glance,safe}.webp` (~55 KB each, fading into the page with a CSS mask; the words stay live text so they follow the language; titles/subtitles are the design's, English and Tamil). `plan` and `glance` are from the design; **`say` and `safe` (the two family photos) were replaced on 15 Oct 2026 with AI-generated photos of South Indian families at the table (made with Canva's image generator, 720 px wide, ~43 KB each)** because the design's own family photos did not look like our users. To change a photo, put it on a Canva page, export it, crop and overwrite the file; the PWA caches them on first use. It opens the first time the app is opened on a device (the sign-in screen; the per-device flag `homefood.tour.seen`), where its
  last card offers "Explore a demo home" / "Start my household"; "Take the tour" on the sign-in screen and **Home tab → "Tips and welcome tour" → "Show the welcome tour"** (`TipsCard`) bring it back
  (that copy ends with "Done"). Swipe, Next/Back buttons or the arrow keys; reduced motion respected. Cards live under `tour.*` in en/ta.
- **Home tab is a menu** (23 Oct 2026, `HomeTabPage` + `HomeSectionPage`): three groups of rows, each row opens its own screen. **Our home**: Family and invite (`/home/family`: people, invite link), Home settings (`/home/settings`, Admin: name, language, snacks, week start, weekly balance limits), Our common items (`/home/items`). **Food and health**: Meal history, My nutrition, Family nutrition (Admin / today's Planner), My goals (`/home/goals`). **This app**: Appearance and tips (`/home/app`: light / dark, welcome tour, tips), Your data and account (`/home/account`, hidden in the demo). Sign out stays at the bottom; "Getting started" is one line that opens the list and disappears when every step is done (`compact`). To add a Home setting: put its card in a case of `HomeSectionPage` and a row in `HomeTabPage`. The old long Home stack of cards is gone; the cards themselves are unchanged.
- **Adding a meal afterwards** (23 Oct 2026, no migration): on Today, "My extras" has a day stepper (‹ Today / Yesterday / a date ›, up to **7 days back**, the limit the database already enforces for `personal_intake`), so something eaten at home or outside that was never planned can be added later and counts in My nutrition for THAT day. The picker now offers **any catalogue dish with an estimate** (a biryani eaten out, a missed dinner), not just snack dishes, and the amount step has **Breakfast / Lunch / Snacks / Dinner** chips that set the time (08:00 / 13:00 / 17:00 / 20:00; a past day starts at 12:00). Extras stay private to the person and out of History, as decided. Planned meals that were eaten out instead are changed in the slot editor (Admin / Planner, dine-out with a light / normal / heavy size); "Did you eat this?" on History covers planned meals on any past day. Not built: more than 7 days back (a database change, 0029's window).
- **Idli photo** (0036, 23 Oct 2026): the first Idli photo (idlis in a steamer pot on a newspaper) was replaced by idlis on a banana leaf with sambar and chutney (Sutapa Pal, CC BY-SA 4.0, `public/dish-photos/idli-2.webp`; a new file name so phones drop the cached old one; the old `idli.webp` stays because 0014 still names it and a test checks every migration path is a real file). `scripts/photo-replacements.json` (read by `gen-demo-catalogue.py`) and `src/demo/catalogue.json` carry the new file; `scripts/dish-photos.json` stays as it was for 0014.
- **Find a free photo online** (23 Oct 2026, migration 0037): "Find a free photo online" on **Add dish** and **Dish detail** (`WebPhotoSheet`, `lib/webPhotos.ts` + tests) searches **Wikimedia Commons** directly from the phone (its API allows browsers; ONLY the words searched for are sent, nothing about the home), lists only free licences (public domain, CC0, CC BY, CC BY-SA; never NC / ND), and the chosen picture is downloaded, re-encoded by the normal upload (which drops all metadata) and saved as the home's own photo. The credit ("Author, CC BY-SA 4.0, via Wikimedia Commons", or the file name when Commons names no author) is saved in `dish_photo_overrides.photo_credit` and shown over the photo on Dish detail (CC BY / BY-SA need a visible credit); a home's own camera photo has no credit and clears an earlier one. (0037 is applied, so saving a web photo works.)
- **Tamil layout pass** (23 Oct 2026, no migration): Tamil words are long and its letters wide, so what fitted in English spilled out. Rules now in `src/index.css`: a button with words is never squeezed below its longest word (`min-width: min-content`; only buttons with an `aria-label`, i.e. icon-only, keep the fixed 44 px); `ta:` is a Tailwind variant that applies a utility only in Tamil (`ta:grid-cols-2`, `ta:flex-col`, `ta:hidden`); Tamil headings and buttons wrap evenly (`text-wrap: balance`) with more line height, and letter spacing is reset (Tamil has no capitals). Fixed heights on controls with words became minimum heights (`h-12` -> `min-h-12`) so two-line Tamil is never clipped; `truncate` is gone from names and details (they wrap); long Tamil placeholders were shortened to fit one line; weekday initials follow the language (`weekdayLetter(d, lang)`: ஞா தி செ பு வி வெ ச). Rows that did not fit now stack in Tamil: vote buttons, meal size, family/helper, appearance, nutrition bars, person status pill, the two Today cards. **When adding UI: no fixed height or `truncate` on text, give flex rows `min-w-0` + wrapping text, and look at the screen in Tamil at 375 px.** `docs/tamil-review.html` was regenerated for the shortened placeholders.
- **Leftovers** (24 Oct 2026, migration 0038, mockup 18; spec "Leftovers, lunch boxes, special days and guests" section 1). **Decisions (do not change without asking):** anyone with a login in the home adds, uses, marks gone or removes a leftover (nothing is private); the use-by is the last good DAY, stored as `use_by`: food kept in the fridge is good until the next day's dinner, food kept out until that night's dinner, on the home's own clock (`lastDayFor`, `households.timezone`); past its use-by day it simply stops showing (`activeLeftovers`), and rows more than a week old are tidied away quietly (`pruneLeftovers`). **How it works:** table `leftovers` (home, dish, `from_slot_id`, amount little / some / lot = serves 1 / 2-3 / 4+, `kept_in` fridge / out, `cooked_on`, `use_by`, status active / used / gone, `used_slot_id`); one record per dish per meal (unique `from_slot_id, dish_id`). `meal_slot_sides` has `is_leftover` and `leftover_id` (a guard trigger keeps the leftover in the same home). **Anyone can use one in a meal, as a deliberate exception to "Planner has the final say":** the database function `use_leftover(p_leftover, p_slot)` (any member) adds it as the next free side (position 1-3) of an EXISTING home meal that has a main dish, never a past day, never past the use-by, and marks the leftover used; the Planner can also add it in the slot editor ("Use leftovers" row; `SlotInput.leftover_by_dish`; `saveSlot` marks leftovers used and frees ones taken out again, `clearSlot` frees them). A leftover side is not cooked again: it is left out of "From this week's meals" (`mealsFromSlots`), of prep reminders (`tasksOf`), of the favourites count (`countUsage`), of copy last day/week and of "Cook this again" sides; it counts normally in nutrition and shows "(leftover)" on cards (`withLeftoverTag`); the cook's sheet says "use leftover X" / Tamil "மீதமுள்ள X (பயன்படுத்தவும்)" (to check in the Tamil review). **Screens:** `LeftoverPrompt` ("Anything left over?" on a Today home-meal card once its usual time has come: breakfast 8, lunch 13, snacks 17, dinner 20 on the home clock; tick dishes, amount chips, Fridge / Kept out, the use-by in words, Save; a recorded one shows "Left over: Sambar (Some)" and reopens), `LeftoversCard` ("Leftovers to use · N" on Today, use-by highlighted when it is today, **Use in a meal** opens a sheet of eligible meals up to the use-by day, **Gone**), both in `components/LeftoverCards.tsx`; logic and tests in `lib/leftovers.ts`; `useLeftovers` returns `null` before 0038 is run so the cards do not appear and the planner keeps working (the slot query asks for `meal_slot_sides(*)`). The demo home has two leftovers and an in-memory `use_leftover`.
- **Everyday preferences** (24 Oct 2026, migration 0039, mockup 19; spec 3a "Everyday preferences"; first part of Diets and fasting). **Decisions (do not change without asking):** per person, `profile_preferences`: veg / egg / non-veg, no onion or garlic, low oil, low salt, low sugar. Preferences only, never medical conditions, no diagnosis stored. **Visible to the whole home** (the Planner and the cooks need them). **Who sets them:** the person themselves; the Admin only for a family member nobody has logged in as yet (`profiles.user_id is null`: no login, or invited but not joined; `can_set_diet_for()`); once someone has joined only they change theirs; the helper has none. Deleting an account removes them (trigger `clear_diet_rows`, which later diet tables extend). **Where they act** (`lib/diets.ts` + tests): **hard clashes** (a veg person and a non-veg or egg dish, an egg person and a non-veg dish, no onion or garlic and a dish tagged `onion_garlic`) take a dish out of **"Suits everyone eating"** (the old "safe for everyone eating" filter in the dish picker, which judges the people eating that meal, and on the Dishes tab, which judges the whole home); **soft clashes** (low salt and a dish tagged `salty`, low oil `oily`, low sugar `sweet`) only show as a gentle note: under a dish in the picker and "Worth a look" in the slot editor ("Paati: appalam is salty (low salt)"); the **cook's sheet** adds "less salt for 1 person" / "less oil" / "less sugar" / "no onion or garlic" for the people eating the day's home meals (names when the switch is on; Tamil in `PREF_WORDS`). The tags `onion_garlic`, `salty`, `oily`, `sweet` come from migration 0040 (see Diet tags). **Screen:** Home › Our home › Diets and fasting (`/home/diets`, `DietsSection`): one row per family member with their preferences, a sheet to change them. "Download my data" includes them (0043 replaces `export_my_data` with the same function plus a `diet` part). The demo home has preferences for all five.
- **Diet tags** (24 Oct 2026, migration 0040; spec 3a "Diet tags and filters"). Every shared dish has tags worked out by `scripts/diet_tag_rules.py` (read it for the exact rules and thresholds; regenerate with `python -X utf8 scripts/gen-diet-tags.py --write`, which prints a report first; never edit an applied 0040, write a new migration) from the recipe's ingredients and the dish's nutrition estimate. **Positive tags (the filter chips in Dishes and the picker, `FILTER_TAGS`):** `low_carb` (carbs ≤ 15 g), `high_protein` (≥ 15 g, or a quarter of the calories), `light` (≤ 150 kcal), `low_oil` (fat ≤ 5 g, not fried), `low_sugar` (≤ 3 g, not sweet), `millet`, `fasting_food` (vegetarian, no onion or garlic, no cereal or pulse, not fried; sabudana, buckwheat and sundal allowed). **Flags (`FLAG_TAGS`; the gentle notes and the diet plans read them):** `onion_garlic`, `salty` (≥ 600 mg sodium), `oily` (≥ 12 g fat or fried), `sweet` (≥ 12 g sugar or tagged sweet), and the avoid groups `grain`, `pulse`, `dairy`, `added_sugar`, `meat` (fish included), `egg`, `root_veg` (not onion, garlic, ginger, turmeric). A pinch, teaspoon or up to 2 tablespoons of an ingredient counts as seasoning for grain, pulse, sugar and root vegetable. **Corrections:** table `household_dish_tags` (home, dish, tag, `present` true = add, false = take away); the catalogue is never changed. The Admin or whoever is the Planner today (`can_edit_prep()`) corrects them on Dish detail (`DishTagsSection`, "Correct for our home"); everyone in the home reads them. `useDishes` folds the corrections in (`effectiveTags`), the slot editor does too. **Filters:** `TagFilterChips` (a dish must have every chip that is on; `DishFilters.tags`). The demo catalogue carries the same tags (`gen-demo-catalogue.py`).
- **Diet plans** (24 Oct 2026, migration 0041, mockup 19; spec 3a "Diet plans"). Low-carb / keto, Paleo, Mediterranean, High-protein, Vegan, Jain, Low-salt (DASH-style), Senior-friendly (`PLAN_KEYS`). **Decisions (do not change without asking):** a plan is only a person FOLLOWING it (`diet_plan_follows`, one row per person and plan, so "one person, a couple or any group" is simply several rows; a person may follow more than one plan); everyone in the home reads who follows what; **a person starts and stops their own, the Admin does it for a family member nobody has logged in as yet** (same `can_set_diet_for()` rule as everyday preferences); the helper follows nothing; **the restrictive plans (low-carb / keto, paleo) are blocked for anyone under 18 and for anyone whose birth year is not known** (trigger `guard_diet_plan_follow`, mirrored in `eligibility()`; the screen says why and the gentler plans stay open); who set a plan is recorded (`set_by`, shown as "set by Amma"). The app stores the plan someone chose, never a diagnosis, and every plan screen says "General guidance, not medical advice. If you have a health condition, check with your doctor before changing your diet." Deleting an account removes the person's plans (`clear_diet_rows`). **What a plan means:** the Avoid and Focus lines are text in `plans.*`; which dishes FIT a plan is worked out from the diet tags (`planFits` in `lib/dietPlans.ts` + tests: low-carb keeps out grain, added sugar, root veg and sweet; paleo grain, pulse, dairy, added sugar; Mediterranean added sugar and oily; high-protein needs `high_protein`; vegan meat, egg, dairy; Jain meat, egg, onion/garlic, root veg; low-salt `salty`; senior-friendly oily, spicy, fried) and is best-effort guidance. **Screen:** Diets and fasting (`DietPlansSection`): the plan cards (who, Avoid, Focus, since, set by, Change) and "Start a diet plan" (pick a plan, who follows, Start for N people); the demo home has Amma + Appa on low-carb and Paati on senior-friendly.
- **Diet plate** (24 Oct 2026, migration 0042, mockup 20; spec 3a "Diet plate"). When the family meal does not suit someone's plan, the Planner adds a plate for those people in that meal (slot editor, under Who is eating; `DietPlateEditor`). **Decisions (do not change without asking):** at most TWO plates per meal; a person is on at most one plate of a meal (database unique); a plate has its own main dish, up to 2 own sides, the people on it, the plans it is for (informational) and `shared_sides` = positions of the FAMILY sides that sit on both plates; only family members of the home are on a plate (never the helper); plate dishes are ones the home can see; everyone reads plates, only whoever may plan that day (Admin / Planner) writes them (tables `meal_slot_plates`, `meal_slot_plate_sides`, `meal_slot_plate_eaters`, same rules as the other parts of a meal). **Effects, all in `lib/plates.ts` and its callers:** the family meal is cooked for the people marked as eating MINUS the people on a plate (`familyHeadcount`: Today's recipe servings, "From this week's meals" via `mealsFromSlots` where a shared side is cooked for everyone and the plate's dishes for its own people, the cook's sheet head count); the cook's sheet adds one line per plate ("Diet plate (2): Paneer tikka + cucumber salad, beans poriyal · Amma", Tamil in `WORDS`); allergy checks judge the family meal against the people eating it and each plate against its own people (`allergyNotes`, the slot editor, and a warning inside the plate card); a person on a plate gets the plate's dishes (plus the shared sides) in My / Family nutrition (`mealFor`); a plate's dishes can carry prep reminders; Week and Today cards show "Diet plate · Amma + Appa: dishes" (`PlateLines`). The editor suggests main dishes that fit every plan the plate's people follow (`fitsAll`, same meal and allergens) and "More dishes that fit" opens the dish picker with `fitPlans`. **Plumbing:** plates are read in a SEPARATE query by `attachPlates` in `lib/plannerQueries.ts` (so the planner keeps working before 0042 is run; `slot.plates` is empty then) and saved by `savePlates` in `saveSlot` (delete and rewrite; quiet when the tables are missing and there are no plates). The demo home has tonight's low-carb plate for Amma and Appa.
- **Fasting days** (24 Oct 2026, migration 0043, mockup 21; spec 3a "Fasting days"). **Decisions (do not change without asking):** one rule per person (`fasting_rules`): how they fast (`skip_meals` with the meals skipped, `fasting_foods`, `fruits_milk`, `one_meal` with the meal kept), on chosen WEEKDAYS (1 Monday ... 7 Sunday) and/or DATES; everyone in the home reads them (planning needs them); a person sets their own, the Admin for a family member nobody has logged in as yet (`can_set_diet_for()`); **nobody under 18, and nobody whose birth year is not known** (trigger `guard_fasting_rule`); the app NEVER suggests fasting, it only follows what each person chose (the screen says so). **Effects** (`lib/fasting.ts` + tests; `attachFasting` in `lib/plannerQueries.ts` puts `slot.fasting = {skip, foods}` on every meal read by Today, Week, History, the cook's sheet and the shopping plan; the meal's saved list of eaters is never changed): a person who SKIPS a meal (skip meals, fruits and milk only, the meals other than their one meal) is left out of it: `eatingTotal` / `familyHeadcount` (recipe servings on Today, `mealsFromSlots` for the shopping plan, the cook's sheet head count), the allergy and cooking-preference notes, and My / Family nutrition (`dayTotalsFor`: the meal counts as `fastedMeals`, not as an unknown or low meal). Fruit and milk are NOT added to the shopping list (a trim: the day just leaves the person out). A person on FASTING FOODS ONLY still eats: the cook's sheet says "1 person: fasting food", the slot editor says so and offers a diet plate whose dishes must carry the `fasting_food` tag (`FitKey`, `planFits('fasting_food')`; the plate label is "Fasting food"). A new meal's default eaters leave out anyone fasting through it. **Screen:** Home › Our home › Diets and fasting › "Fasting days" card (`/home/fasting`, `FastingSection`): pick a person, how they fast, weekday chips, dates, Save / Stop; someone under 18 or without a birth year, or whom you may not change, sees why. The demo home has Paati on two chosen dates (fruits and milk) and Amma skipping dinner every week on tomorrow's weekday. My nutrition's "fasting day" marking is the next step.
- **Scroll and focus on every screen** (23 Oct 2026, `lib/useRouteFocus.ts`, used by `AppShell`): opening any screen (a tab, a card, a button) now starts at the top and puts focus on the page's `<main>` (no ring); going BACK is left to the browser. A form that opens lower down a screen (`useRevealOnOpen`: the new shopping item form, the prep reminder form) scrolls into view and focuses its first field; an opened shopping item editor keeps clear of the sticky type box and the pinned bar (`scroll-mt` / `scroll-mb`). New screens need nothing: keep one `<main>` per screen and use `useRevealOnOpen` for inline forms.
- **Tamil everywhere, part 2: still no native-speaker review.** Every string has an `en`/`ta` pair and the
  parity test (`translations.test.ts`) guarantees neither language is missing a key mid-flight. On 11 Oct 2026 Claude read all 502 UI strings
  in Tamil and fixed 30 (wrong word "பரிமாணம்" for servings, "வேலைக்காரர்" for helper, "stock"/"ஆப்" left in English, sandhi on buttons,
  "சமையல் பாணி" for cuisine everywhere, clunky allergy warning). Recipes: Claude read a sample closely (all of the first 46 and the first 30 North Indian ones),
  checked every step and note mechanically (numbers match the English, no English left in Tamil text, formatting) and harmonised 34 ingredient
  names and 3 dish names (migration 0020). No errors of meaning were found, but a real native read of the recipes is still the thing the family should do.
- **Tamil review kit** (12 Oct 2026): `docs/tamil-review.html` lists every screen text, dish name, recipe line, everyday food, shopping item, prep reminder wording and the Tamil words that live in code (the cook's sheet phrases, shopping units) (about 4,900 lines; regenerated 23 Oct 2026 after the shopping, prep and cook's sheet batch) with English and Tamil side by side, numbered, with an empty
  correction column; it prints well. Regenerate any time with `python -X utf8 scripts/gen-tamil-review.py` (it reads en/ta.json, the dish seeds, the recipe text files and `common_foods_data.py`). **Getting corrections
  back:** the family sends `number: corrected Tamil` lines (the small grey `ui:…` / `recipe:…` / `dish:…` / `food:…` reference under each number is the exact place). Claude applies screen texts in `src/i18n/ta.json`;
  dish names, recipes and foods go into the source files (`south_indian_data.py`, `recipes_*.txt`, `common_foods_data.py`) and a new migration (use `scripts/gen-tamil-fixes.py`, never regenerate an applied migration).
- **Accessibility pass done 12 Oct 2026** (`docs/accessibility.md`): every colour pair checked against AA in light and dark by `node scripts/check-contrast.mjs` (`npm run contrast`; keep it passing when adding
  colours: new colours must be tokens, text on saffron uses `text-on-saffron`, text on red/green blocks `text-on-solid`); every button, field and select is >= 44 px (one rule in `index.css`); every screen has an
  `h1`; fields and chips have names; the shared `Dialog` (focus trap, Escape, focus return) is used for all modals; errors are `role=alert`; Tamil text inside English screens has `lang="ta"`; no horizontal scroll at 320 px.
  `scripts/a11y-audit.js` re-checks names/targets/headings on any screen. Still open: real screen-reader testing by a person and a full keyboard walkthrough of every control.

## Working agreements

- Plain-language explanations; one clear next action for Venkatesh at a time.
- Before committing: `npm run build`, `npm test`, `npm run lint` pass.
- Git author email is the GitHub noreply address (set in this repo's config) — never commit a private email.
- Small, focused commits; push when a step or sub-step works end to end.
