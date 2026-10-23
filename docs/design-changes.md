# HomeFood: what changed from the original design

Reference list, written 23 Oct 2026. It compares what was **built** with the original design: the spec (`docs/spec.md`, the Claude Doc "HomeFood — Spec & Design") and the 17 screen mockups (`design/mockups/`). Day-to-day build notes stay in `CLAUDE.md`; this file is the one place to see every difference at a glance, for example when updating the live spec.

How to read it: **A** = built differently from the spec or mockups · **B** = built earlier than the spec's phase · **C** = added, not in the spec · **D** = still not built · **E** = parts of the spec text that are now out of date · **F** = the database changes, in order.

---

## A. Built differently from the spec or mockups

| Area | Spec or mockup said | What was built | Why |
| --- | --- | --- | --- |
| Tabs | Today · Week · Dishes · **Health** · Family (5, mockup `Today.png`) | **4 tabs**: Today · Week · Dishes · Home. Nutrition, History and goals sit under the Home tab. | Simpler on a phone; there was no Health tab to fill. Decision recorded; the app stays at 4 tabs. |
| Home tab | One screen with People, Invite, settings | A **grouped menu** (Our home · Food and health · This app); each row opens its own screen (`/home/family`, `/home/settings`, `/home/items`, `/home/goals`, `/home/app`, `/home/account`). "Getting started" is one expandable line that disappears when done. | The single screen had become a long stack of unrelated cards. |
| Planner rota | Any member taps "I'll plan this" on a free day; auto-approved when free | **Admin assigns turns only.** Members see the schedule read-only. | Matches the phase-1 decision "Admin assigns turns"; the database enforces it. Member self-claim is a later step. |
| Snap a dish | A custom full-screen viewfinder with a plate frame (`SnapDish.png`) | The phone's own camera app, opened with a file input (`capture`). | Same result with far less code and risk. |
| Dish photos | Hotlinked stock images, up to 1080 px | Photos are **bundled with the app** (`public/dish-photos/`, WebP ≤ 720 px, ~8 MB) and cached on first view; a home's own photo (private bucket) still wins. | No dependence on Wikimedia being reachable, and nothing is hotlinked. 268 of 298 shared dishes have a photo; 30 show a coloured initial. |
| Catalogue size and mix | "About 200 dishes", four cuisines, 10–12 snacks per cuisine | **298 shared dishes** in five cuisine groups (Indian, South Indian, North Indian, European, Japanese); South Indian is by far the deepest. The "10–12 snacks per cuisine" depth was not filled for every cuisine. | Content is easy to add later as data rows. |
| Copy last day / week | Implied "start fresh from last week" | Copy only **fills empty slots**; it never overwrites a planned meal. | Safer; cost is that a half-planned week cannot be bulk-replaced. |
| Notifications | Bell, push, per-person muting, allergen alerts, "your turn starts tomorrow" | **In-app bell only.** No phone push, no muting, no allergen alerts, no turn-start reminder. A 7 pm in-app reminder for cooks was added (prep). | Push needs a push key and a server function (comes with the Android/iOS wrap). Reminders show on every device the person is signed in on; no sound yet. |
| Allergy warnings | Picker badge, Week/Today warning, warning on suggestions, notify Planner/cooks/affected member | Built in the **dish picker (per-dish badge) and the Week/slot cards** (real cross-check against who is eating). **Not built, as far as the build notes record:** the warning on suggestions and the allergen notifications. | Warnings stay best-effort. |
| Weekly balance | Flag lists and limits editable | Limits are Admin-editable (Home settings: same main dish, fried dishes, dine-out run). The "no vegetable" rule uses a `vegetable` tag (50 shared dishes tagged; a home can tag its own). Banner is dismissible per device per week. | As built; the flag lists are tags on dishes. |
| Week start | Monday | **Monday by default; a home can choose Sunday** (Home settings and setup). | Added after live use. |
| Welcome tour | Four layers: tour, demo, checklist, tips | All four built. The tour is **four swipeable cards** on first open (and "Show the welcome tour" in Home › Appearance and tips). Card 1 and 3 photos come from the Canva design; cards 2 and 4 use **AI-generated photos of South Indian families** (the design's own family photos did not look like our users). | Review: the tour should look like the people using it. |
| Shopping mockup (`Shopping.png`) | "Browse common items" as an inline panel; Share bar at the bottom | Browsing opens a **full-screen sheet** (one scroll). The type box stays at the top; **Share on WhatsApp / Copy** are pinned at the bottom of the list screen. About **150** common items (not 45). | The inline panel created a second scrolling area on phones. 150 items cover 92% of the ingredients in our recipes. |
| Cook's sheet mockup | Preview, Send, Copy, Print | Built as drawn, plus: the allergy note comes from the **real cross-check** (dishes against the people eating each meal), tomorrow's sheet adds a "Tonight:" line (prep not yet done), and a helper profile named exactly "Helper" is written "உதவியாளர்" in the Tamil sheet. | Needed to make the sheet useful. |
| Prep reminders mockup | Evening card listing prep | Built as drawn, plus a **morning "Today · prep"** card for same-day tasks, "Done by <name>", and a 7 pm notification to cooks who have a login (pg_cron, every 15 minutes, once per meal-task-cook). | The spec says the cooks get a reminder at 7 pm. |
| Photo replacement | "Replace photo" with the home's own picture | Also **"Find a free photo online"** (Add dish and Dish detail): searches Wikimedia Commons, free licences only, the credit is saved with the photo and shown on the dish. | Requested after the spec; needs migration 0037. |
| Idli photo | Original stock photo | Replaced (idlis on a banana leaf with sambar and chutney), a new file name so phones drop the old cached picture. | The first picture (a steamer pot on a newspaper) was poor. |

## B. Built earlier than the spec's phase

The spec put these in **phase 2 or 3**; they were built in phase 1 and are live:

- **Votes, comments, suggestions** on a meal (Discussion screen; Today cards show agree / disagree / comment counts; free-text suggestions; the Planner decides).
- **Notifications** (the bell): week published, a published meal changed, set as cook, new suggestion, accepted / declined, new comment, dish kept despite disagreement, Planner turn assigned, and prep reminders.
- **Nutrition**: per-serving estimates for all dishes (labelled as estimates), the Dish detail panel and "For your family" notes, **My nutrition** and **Family nutrition** (against ICMR-NIN 2020 targets, age/sex/activity).
- **Hosted recipes** for all 298 dishes in English and Tamil (drafts to be checked by the family), scaled to who is eating, with cook mode.
- **History** (week / month / year) with counts, search, "by cuisine", "meals each person ate", and the "Did you eat this?" control on any past meal.

## C. Added beyond the spec

**Planning and meals**
- **"Did you eat this?"** attendance: ate / skipped / ate elsewhere, small / normal / large portion, on Today and on any past meal in History. Nutrition counts it.
- **Meals out**: a dine-out / order-in meal can be marked light / normal / heavy so nutrition includes a rough estimate.
- **Favourite dishes** (heart; favourites jump to the top and have a chip).
- **Cook this again** (History and Dish detail): puts a dish into the next 14 days' free slots (Planner) or suggests it (everyone else).
- **Recipe editing**: the Admin keeps the home's own version of any recipe ("Edit our version"), or writes one for an own dish.
- **Own dishes can carry a nutrition estimate**; the Admin can rename or delete the home's own cuisines (blocked while dishes use them).
- **Breakfast / dinner overlap**: tiffin dishes appear under both filters.

**My extras** (private food log, spec updated 11 Oct)
- Personal log of what a person ate outside the planned meals; private to them (the Admin only for family members with no login); daily totals only in Family nutrition; optional protein / calorie goals; 82 shared everyday foods plus the home's own.
- **Adding a meal afterwards** (23 Oct): on Today, My extras has a day stepper back **up to 7 days**; **any** catalogue dish with an estimate can be picked (not only snacks); Breakfast / Lunch / Snacks / Dinner chips set the time. Extras stay out of History by design.

**Shopping, prep and the cook's sheet** (spec updated 23 Oct)
- **Shopping list**: one shared list per home; section groups, typed quick-add ("tomato 1 kg", Tamil too), regulars, Bought for a day, WhatsApp and Copy, the Admin can clear the list. Units are only g, kg, ml, L, pcs, bunch, pack. Common items (150, English + Tamil) and the home's own ("Our common items", Home menu).
- **From this week's meals**: recipes of planned home meals scaled to who is eating; perishables rounded up to 50 g / 100 ml / whole pieces and shown as "about"; everything else suggested as the smallest pack that covers it (item pack sizes, e.g. oil 1 L / 5 L); pantry staples unticked under "Usually at home"; unmatched ingredients unticked.
- **Prep reminders**: 61 tags on 61 standard recipes (batters, soaks, set curd, thaw, marinate); the Tonight / Today cards; the 7 pm cook reminder.
  - **Own reminders and switch-offs** (added after the spec, 23 Oct): the Admin or whoever is the Planner today adds the home's own reminders for a dish and switches a standard one off for the home only.
- **Cook's sheet**: today or tomorrow, English or Tamil, optional "name who has the allergy", WhatsApp / copy / print.

**Account and privacy**
- **Your data and account**: download my data (JSON), sign out on all devices, delete my account (the profile stays as "Former member"), delete the household (Admin, type the name).
- **Demo home**: "Explore a demo home" runs entirely on the device with made-up data (Admin / Planner / Member views); no server calls.

**Quality**
- **Accessibility pass** (`docs/accessibility.md`): colour pairs checked for AA in light and dark (`npm run contrast`), 44 px targets, one `h1` per screen, focus trap and return in dialogs, reduced motion.
- **Dark mode** with an Appearance setting (System / Light / Dark); the Week at a glance poster always saves in light.
- **Scroll and focus**: every new screen opens at the top with focus on the page; forms that open lower down scroll into view.
- **Tamil review kit** (`docs/tamil-review.html`, regenerated 23 Oct): about 4,900 lines: screen texts, dish names, recipes, everyday foods, the 150 shopping items, prep wording and the Tamil words that live in code.
- **Database tests in CI**: every push runs the rule tests (317 checks) on a throwaway Postgres; 306 unit tests.

## D. Still not built (parked on purpose)

- **Phone push notifications** and sound; per-person muting; allergen alerts; "your turn starts tomorrow" reminders.
- **Member self-claim of Planner turns**, requests and approvals (phase 2).
- **App lock** (fingerprint / face), and the **Capacitor wrap** for Android and iOS.
- **Trending corner**, the **AI photo guess** for Snap a dish, reports, the veg / egg / non-veg filter (decided: later).
- **Allergen warning on suggestions**.
- **Logging food more than 7 days back** (the database window is 7 days; changing it is a small migration).
- **Real screen-reader and keyboard walkthrough** by a person, and a **native-speaker Tamil review** of the recipes, dish names and the new shopping / prep words.
- More cuisines and snack depth, photos for the 30 dishes that have none, a prep editor inside the recipe editor (reminders are edited on Dish detail and the Recipe screen).
- **Leftovers, lunch boxes, festival and fasting days, guests** (the spec's "Next, then later").
- **Step 7**: the two-week family trial.

## E. Parts of `docs/spec.md` that are now out of date

When the live Claude Doc is next updated, these lines should change:

1. Phase 1 scope: votes, comments, notifications, nutrition and hosted recipes are **built**, not later phases.
2. "Five tabs" / Health tab: the app has **four**.
3. Rota: members **cannot** claim a turn yet.
4. Snap a dish: it uses the **phone's camera app**, not a custom viewfinder.
5. Seed catalogue: **298 dishes** (not about 200), photos **bundled**, WebP ≤ 720 px.
6. Common shopping items: **about 150**, not "about 45".
7. Week start: **Sunday is allowed**.
8. Dish photos: members can also **find a free photo online** (credit saved).
9. Prep reminders: a home can **add its own** and **switch the standard ones off**; the Admin **or the Planner** edits them.
10. My extras: **any** dish can be added; days back up to **7**.
11. Home tab: a **grouped menu**, and the shopping browse is a sheet.

## F. Database changes, in order (migration number: what it does)

Applied in the live project unless marked **to run**.

| No. | What |
| --- | --- |
| 0001 | Core schema, roles, row-level security, helper functions, guard triggers |
| 0002 | Private photo storage bucket (one folder per home) |
| 0003 | Cuisines seed |
| 0004 | Invite details (`get_invite` shows who can be picked) |
| 0005 | Starter dishes (~30) |
| 0006 | Who is eating each meal (`meal_slot_eaters`) |
| 0007, 0008 | First stock photos (28 dishes) |
| 0009 | 110 more Indian dishes |
| 0010 | Votes, comments, suggestions |
| 0011 | Recipes (38) and the per-home recipe tables |
| 0012 | Nutrition estimates and the daily targets |
| 0013 | Notifications (the bell) |
| 0014 | Catalogue photos bundled with the app |
| 0015, 0016 | 160 South Indian dishes and their recipes |
| 0017 | Recipes for the remaining 100 dishes |
| 0018 | 13 more South Indian photos |
| 0019 | Who actually ate what (attendance) |
| 0020 | Tamil wording fixes |
| 0021 | Breakfast / dinner overlap |
| 0022 | Favourite dishes |
| 0023 | Week start Monday or Sunday |
| 0024 | Weekly balance limits and the `vegetable` tag |
| 0025 | Recipe editing for a home (`save_household_recipe`) |
| 0026 | Own-dish nutrition and meals-out size |
| 0027 | Guard: a cuisine in use cannot be deleted |
| 0028 | Six more stock photos |
| 0029 | My extras (tables, rules, family totals function) |
| 0030 | 82 shared everyday foods |
| 0031 | Privacy controls (export, delete account, delete household) |
| 0032 | Shopping list |
| 0033 | Common shopping items (150) and a home's own |
| 0034 | Prep reminders, done-ticks, 61 tags, the 7 pm reminder and its pg_cron schedule |
| 0035 | A home's own prep reminders and switching standard ones off |
| 0036 | A better Idli photo (**to run**) |
| 0037 | A credit for photos chosen from the web (**to run**) |

## G. Where to read more

- Build notes and every decision that must not change: `CLAUDE.md`.
- Original design: `docs/spec.md` and `design/mockups/README.md`.
- Accessibility results: `docs/accessibility.md`. Tamil text for review: `docs/tamil-review.html`.
- To regenerate generated content: the scripts in `scripts/` (dish photos, recipes, shop items, prep tags, the demo catalogue, the review kit); each file starts with how to run it.
