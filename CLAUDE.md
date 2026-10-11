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

- Migrations in `supabase/migrations/`. **0001–0023 are applied** to the live project `homefood-prod` (Mumbai) —
  Steps 2–4 have all been tested live against them. **0007 (pilot stock photos) is applied too** (confirmed live 3 Oct 2026). **0008 (stock photos for the other 22 seeded dishes) is applied too** (all 28 dishes confirmed showing photos live, 3 Oct 2026). Never edit an applied migration; add a new numbered file
  (`0025_….sql`) for the next change. **0024 (weekly balance limits + the `vegetable` tag) is written but NOT yet run: Venkatesh must run it in the SQL Editor.** Venkatesh runs these in Supabase › SQL Editor — tell him when one needs running.
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
  `0007_dish_stock_photos.sql` sets a real Wikimedia Commons photo (+ credit) on 6 of those seeded dishes — a pure data
  update, no schema/RLS change, see Step 3 scope below for which ones and why only 6 so far.
- "Automatically expose new tables" is OFF: every new table needs explicit `grant … to authenticated` plus RLS policies.
- Helpers: `my_profile_id()`, `my_household_id()`, `is_admin()`, `can_plan(household, date)`, `can_plan_week(household, week_start)`.
- RPCs: `create_household(p_name, p_display_name, p_language default 'en', p_snacks_enabled default true)` → household id (caller becomes Admin);
  `get_invite(p_token)` → household_name, invited_by, member_count, people [{id,name,birth_year,joined}] — `people` excludes whoever created the
  link and includes everyone else who can log in, joined or not (works signed out);
  `claim_profile(p_token, p_profile_id)` → household id.
- Guard triggers stop members promoting themselves, the last Admin stepping down, planning outside a turn, cross-home cooks.
- Any new rule gets a check in `supabase/tests/rls_test.sql` (currently 131 checks — all passing in CI, see below). There's also
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
- **Recipes (migration 0011) and nutrition (0012) are built.** `RecipePage` (`/dishes/:id/recipe`, `Recipe.png`): servings
  stepper (starts at who is eating, else the number of family members), ingredients scaled and written as a cook would (`lib/recipes.ts`:
  1¼ cups, ¾ tbsp, 250 g; pieces, cloves and slices are always whole numbers, so 7½ shallots reads 8), steps you can tick off, cook mode (screen wake lock + bigger text) and a Watch (YouTube) button. A Recipe
  button shows on Dish Detail, the Today next-up card and the discussion card, only for dishes that have a recipe. Tables allow a home
  to keep its own version (Admin only), but there is **no "Edit our version" screen yet**, and no Recipe button in the slot editor
  (leaving it would lose unsaved edits).
  **Nutrition**: Dish Detail shows "Nutrition per serving" (calories, protein, carbs, fat, fibre, sodium as bars against an adult's day,
  labelled *Estimate*) and "For your family" (notes from the dish's tags and each person's age band, plus how often it was cooked this
  month). Home tab → **My nutrition** (`/nutrition`): the meals you are marked as eating, up to today, added up per day/week/month against a
  target for your age band, sex and activity (ICMR-NIN 2020, rounded; missing details are assumed and the screen says so) with a few
  gentle tips. Home tab → **Family nutrition** (`/nutrition/family`, Admin or whoever is Planner today): the same per person.
  Logic in `lib/nutrition.ts` (+ tests). Every figure is an estimate: one serving of the main dish plus one of each side, a normal
  portion, home meals only. Parked: no small/large portion or "skipped" tracking (the attendance table isn't built), dine-out and
  order-in get no estimate (the screen says how many meals were left out), no way yet to enter nutrition for a home's own dish
  (the table and rule exist), and it hangs off the Home tab because the 5-tab Health/Family nav wasn't adopted.
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
  small / large portion, skipped or ate elsewhere, from the Today cards. Parked: marking past days (only Today shows the control), a review
  screen, and using attendance in History's counts.
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

Deferred, flagged rather than attempted half-done:
- **Welcome tour.** A guided first-visit walkthrough is real UX design work (what gets highlighted, in what order, for
  which of the 4 tabs) — a placeholder tour would likely do more harm than good. Needs a decision on scope before
  building anything.
- **Tamil everywhere, part 2: still no native-speaker review.** Every string has an `en`/`ta` pair and the
  parity test (`translations.test.ts`) guarantees neither language is missing a key mid-flight. On 11 Oct 2026 Claude read all 502 UI strings
  in Tamil and fixed 30 (wrong word "பரிமாணம்" for servings, "வேலைக்காரர்" for helper, "stock"/"ஆப்" left in English, sandhi on buttons,
  "சமையல் பாணி" for cuisine everywhere, clunky allergy warning). Recipes: Claude read a sample closely (all of the first 46 and the first 30 North Indian ones),
  checked every step and note mechanically (numbers match the English, no English left in Tamil text, formatting) and harmonised 34 ingredient
  names and 3 dish names (migration 0020). No errors of meaning were found, but a real native read of the recipes is still the thing the family should do.
- **No deeper accessibility pass** (full keyboard-navigation walkthrough, screen-reader testing with VoiceOver/TalkBack,
  a systematic contrast check of every colour pair rather than the handful of most-used ones above).

## Working agreements

- Plain-language explanations; one clear next action for Venkatesh at a time.
- Before committing: `npm run build`, `npm test`, `npm run lint` pass.
- Git author email is the GitHub noreply address (set in this repo's config) — never commit a private email.
- Small, focused commits; push when a step or sub-step works end to end.
