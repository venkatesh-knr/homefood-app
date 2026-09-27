# HomeFood — notes for Claude Code

A family meal planner: each home plans breakfast, lunch, optional evening snacks and dinner for the week, together.
Web app first (installable PWA), wrapped for Android/iOS with Capacitor later.
Owner: Venkatesh (development manager). Explain steps plainly; he runs Supabase dashboard steps himself.

- Spec & design doc: "HomeFood — Spec & Design" (Claude Docs) — the source of truth for features.
- Mockups: "HomeFood Mockups" canvas, 16 screens — follow their layout and colours.
- Requirements (28 points) and decisions live in the claude.ai Project "HomeFood".

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
Supabase (Postgres + RLS, email OTP, storage) · Vitest · oxlint. Installed but not used yet: react-router-dom, @tanstack/react-query.
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

- Migrations in `supabase/migrations/`. **0001–0003 are already applied** to the live project `homefood-prod` (Mumbai).
  Never edit an applied migration; add a new numbered file (`0004_….sql`). Venkatesh runs it in Supabase › SQL Editor — tell him when one needs running.
- "Automatically expose new tables" is OFF: every new table needs explicit `grant … to authenticated` plus RLS policies.
- Helpers: `my_profile_id()`, `my_household_id()`, `is_admin()`, `can_plan(household, date)`, `can_plan_week(household, week_start)`.
- RPCs: `create_household(p_name, p_display_name, p_language)` → household id (caller becomes Admin);
  `get_invite(p_token)` → household_name, invited_by, claimable [{id,name}] (works signed out);
  `claim_profile(p_token, p_profile_id)` → household id.
- Guard triggers stop members promoting themselves, the last Admin stepping down, planning outside a turn, cross-home cooks.
- Any new rule gets a check in `supabase/tests/rls_test.sql` (currently 37 checks, all passing).

Auth/email (already configured in the dashboard, no code needed): custom SMTP via Brevo (free, 300 emails/day),
templates "Confirm sign up" + "Magic link" send `{{ .Token }}` (`supabase/email-templates/sign-in-code.html`),
OTP expiry 600 s, minimum interval per user 60 s (the sign-in page resend timer must stay ≥ 60 s).

## Code layout

```
src/lib/supabase.ts     client (persistSession, autoRefreshToken, detectSessionInUrl: false)
src/lib/auth.tsx        AuthProvider/useAuth: session, sendCode, verifyCode, signOut; AuthError kinds wrongCode/tooMany/generic
src/lib/validation.ts   email/code helpers (+ tests)
src/pages/              SignInPage, WelcomePage (temporary), SetupNeededPage
src/App.tsx             chooses page by isConfigured / loading / session
```

## Build plan (phase 1)

- [x] Step 1 · Setup, design tokens, English/Tamil, email-code sign-in, schema + RLS + tests (tested live 28 Sep 2026)
- [ ] **Step 2 · Home setup** (next — details below)
- [ ] Step 3 · Dish catalogue: seed dishes per cuisine (incl. ~10–12 snacks each), search/filters, add a dish, Snap a dish (camera), photos
- [ ] Step 4 · Planning: week planner, meal editor (main + sides), cooks, dine-out/order-in, allergy warnings, publish, planner rota
- [ ] Step 5 · Everyday view: Today, Week at a glance poster, history (year/month/week)
- [ ] Step 6 · Polish: Tamil everywhere, welcome tour + demo home, getting-started checklist, installable app, accessibility
- [ ] Step 7 · Family trial (2 weeks)

### Step 2 · Home setup — scope

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

## Working agreements

- Plain-language explanations; one clear next action for Venkatesh at a time.
- Before committing: `npm run build`, `npm test`, `npm run lint` pass.
- Git author email is the GitHub noreply address (set in this repo's config) — never commit a private email.
- Small, focused commits; push when a step or sub-step works end to end.
