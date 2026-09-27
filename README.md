# HomeFood

A family meal planner: plan breakfast, lunch, evening snacks and dinner for the week, together.
Web app first (installable on phones), later wrapped for Android and iOS with Capacitor.

- **Spec & design doc:** HomeFood — Spec & Design (Claude Docs)
- **Mockups:** HomeFood Mockups canvas (16 clickable screens)

## Tech stack

| Part | Choice |
| --- | --- |
| App | React + TypeScript, built with Vite |
| Styling | Tailwind CSS with HomeFood colour and font tokens (`src/index.css`) |
| Languages | English and Tamil via i18next (`src/i18n/en.json`, `src/i18n/ta.json`) |
| Backend | Supabase: Postgres with row-level security, email-code sign-in, private photo storage |
| Installable app | PWA (vite-plugin-pwa) |
| Tests | Vitest (app) and SQL rule tests on a local PostgreSQL (`npm run test:db`) |

## Build status (phase 1)

- [x] **Step 1 · Setup:** project, design tokens, English/Tamil, email-code sign-in, database schema with access rules and tests
- [ ] Step 2 · Home setup: create a home, add profiles, invite link, join flow
- [ ] Step 3 · Dish catalogue: seed data, search and filters, add a dish, Snap a dish, photos
- [ ] Step 4 · Planning: week planner, meal editor, cooks, dine-out/order-in, allergy warnings, publish, rota
- [ ] Step 5 · Everyday view: Today, Week at a glance poster, history
- [ ] Step 6 · Polish: Tamil throughout, welcome tour, checklist, installable app, accessibility
- [ ] Step 7 · Family trial (2 weeks)

## One-time setup

### 1. Supabase project

1. Create a project at supabase.com (name `homefood-prod`, region **South Asia (Mumbai)**, free plan). Save the database password in your password manager.
   Security options when creating: **Enable Data API** on, **Automatically expose new tables** off (the migration grants access explicitly), **Enable automatic RLS** on.
2. **Create the tables:** Dashboard › **SQL Editor** › New query. Paste and **Run** each file in order:
   1. `supabase/migrations/0001_core_schema.sql`
   2. `supabase/migrations/0002_storage.sql`
   3. `supabase/migrations/0003_seed_cuisines.sql`
3. **Turn on email codes:** Authentication › **Sign In / Providers** › Email: enabled, "Confirm email" on.
   Authentication › **Emails**: paste `supabase/email-templates/sign-in-code.html` into **both** the "Confirm signup" template (used the very first time someone signs in) and the "Magic Link" template (used after that), each with the subject `Your HomeFood code: {{ .Token }}`. Set the email OTP expiry to **600** seconds.
4. **Email sending:** Supabase's built-in email is for testing only and sends just a few emails an hour. Before the family trial, add a custom SMTP sender (Authentication › Emails › SMTP settings) from a transactional email service.
5. **Your keys:** Project Settings › **API** (or **API Keys**). You need the **Project URL** and the **anon / publishable** key.
   Never copy the `service_role` / secret key or the database password into this project.

### 2. Run the app on your computer

Needs Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local     # Windows: copy .env.example .env.local
# edit .env.local and paste your Project URL and anon key
npm run dev
```

Open the address it prints (usually http://localhost:5173). Enter your email, then the 6-digit code from the email.

### 3. Checks

```bash
npm test          # app unit tests (translations, email/code validation)
npm run build     # production build
npm run test:db   # database rule tests; needs PostgreSQL installed locally
```

`npm run test:db` creates a throwaway local database, loads the migrations with small stand-ins for Supabase's `auth` schema, and runs `supabase/tests/rls_test.sql`: 37 checks that one home can never see or change another's data, that only Admins manage people and invites, and that Planners can only plan their own turns.

## Project layout

```
src/
  components/ui.tsx     shared buttons, logo, language switch
  i18n/                 English and Tamil strings (+ test that both match)
  lib/supabase.ts       Supabase client (public URL + anon key only)
  lib/auth.tsx          email-code sign-in, stays signed in per device
  pages/                SignInPage, WelcomePage (temporary), SetupNeededPage
supabase/
  migrations/           tables, access rules, storage, seed cuisines
  tests/                database rule tests
  email-templates/      sign-in code email (English + Tamil)
public/icons/           app icons (placeholder until the Canva icon is ready)
```

## Security notes

- Every table has row-level security; the rules are tested in `supabase/tests/rls_test.sql`.
- Sign-in is by emailed 6-digit code only: no passwords, no social logins.
- Photos go to a private bucket, one folder per household.
- Secrets never go in the code: `.env*` files are git-ignored except `.env.example`.
