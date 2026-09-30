<!-- Exported 30 Sep 2026 from the Claude Docs document "HomeFood — Spec & Design"
     (https://claude.ai/code/artifact/8294871f-65e6-4b87-8690-ca8206950683).
     The live doc is the source of truth; this copy is for Claude Code. Three diagrams
     (meal slot lifecycle, architecture, roadmap) are not included in the export.
     Build-time deviations (e.g. 4 tabs instead of the spec's 5, deferred features) are
     recorded in CLAUDE.md, which wins on build details. -->

# HomeFood — Spec & Design

Sep 27, 2026 · @Venkatesh

## Overview

HomeFood is a family meal planner: one person plans a week of breakfast, lunch, optional evening snacks and dinner, and the rest of the family agrees, comments or suggests before anything is cooked. It starts as a web app your family opens on any phone or laptop, and is built so the same code ships as an Android and iOS app later.

**Goals**

- Make "what do we cook today?" a 2-minute decision, planned a week ahead.
- Give every family member a voice: agree/disagree, comment, suggest a dish, or take a turn as Planner.
- Record who cooks each meal, whether a family member, several of them together, or the helper.
- Offer a ready catalogue of South Indian, North Indian, European and Japanese dishes, with full recipes, open to new cuisines, your own dishes and photos snapped outside.
- Show each person their own nutrition, and the family picture to Admins and the current Planner.
- Keep a searchable record of what was eaten, by week, month and year.
- Work in English and Tamil, and let other households use the app with their data kept private.

**Not in scope for now:** grocery lists and ordering food through delivery apps (a meal is only marked "order-in").

## Requirements traceability

Every one of your 28 points maps to a concrete feature; phases are defined in the roadmap below.

| # | Requirement | How the design covers it | Phase |
| --- | --- | --- | --- |
| 1 | Upgrade to Android/iOS later | Web-first React app wrapped with Capacitor; one codebase for web, Android and iOS | 1 (web), 4 (stores) |
| 2 | Indian (South, North), European, Japanese menus | Seeded global catalogue of about 200 dishes, tagged by cuisine, region and meal | 1 |
| 3 | Add more cuisines later | Cuisine is a data row, not code; Admin adds one from the Catalogue screen | 1 |
| 4 | Custom-add any food | "Add dish" form saves to your household's private catalogue, with optional photo | 1 |
| 5 | Main and side dish per meal | Each meal slot holds 1 main + up to 3 sides | 1 |
| 6 | Weekly planner | Monday-to-Sunday grid (desktop) or swipeable day cards (phone); copy last week, repeat a day | 1 |
| 7 | Home users and roles | Admin and Member roles; planning rights come from the Planner rota (#20) | 1 |
| 8 | Agree/disagree and comment | Thumbs up/down and a comment thread on every slot; the Planner has the final say | 2 |
| 9 | Small food images, large on tap | 56 px round thumbnails; tap opens a full-screen lightbox; any photo can be replaced with your own | 1 |
| 10 | Members suggest food for a meal | "Suggest a dish" on any slot; Planner accepts or declines | 2 |
| 11 | Dine-out or order-in | Slot source: Home, Dine-out or Order-in, with an optional place name | 1 |
| 12 | Records by year/month/week | Every slot is kept; History screen filters by week, month, year with simple counts | 1 (list), 3 (reports) |
| 13 | Healthy and trending section | Health corner with curated tips and trending dishes | 3 |
| 14 | Collect age only | Birth year on each profile drives age-band tips, warnings and nutrition targets; sex and activity level are optional extras for better targets | 3 |
| 15 | Simple, eye-catching design | Warm food-first visual style, bottom tab navigation, 3 taps to plan a meal | 1 |
| 16 | Design tool suggestion | Claude drafts mockups; Figma optional; Canva for icon and store graphics | Before build |
| 17 | Notifications on plan changes | In-app bell + web push now, native push in the mobile app | 2, 4 |
| 18 | YouTube/Instagram "how to cook" | "How to cook" buttons on each dish open a search for it | 1 |
| 19 | Calorie/nutrient tracking; full recipes in the app | Per-serving nutrition on every dish; hosted recipes with ingredients and steps, scaled to your household | 3 |
| 20 | Anyone can be Planner for a day, week or month, and can ask to be | Planner rota: Admin assigns turns, members request a turn, requests are auto-approved when the turn is free | 1 (assign), 2 (requests) |
| 21 | Household size; not everyone needs a login | Household profiles without login for children, elders or the helper; sign-up only for the Admin, others join by invite link and an email code; only people who vote need an account | 1 |
| 22 | Who prepares each dish, including combinations and the maid | Each slot lists one or more cooks from the household's profiles, including a Helper profile | 1 |
| 23 | Multiple households and their privacy | Sealed households enforced by row-level security, private-by-default data, export and delete (see Privacy) | 1 |
| 24 | Photograph food seen outside and add it | "Snap a dish": a camera photo becomes a household dish; an AI guess of name and nutrition comes later | 1 (photo), 3 (AI) |
| 25 | Personal nutrition and a family overview | "My nutrition" for each member; "Family nutrition" for Admins and the current Planner | 3 |
| — | Tamil now, more languages later | All screen text and dish names translatable; English and Tamil at launch | 1 |
| 26 | Optional allergy details, with warnings where needed | Allergies on profiles, allergen tags on dishes, warnings in the picker, planner, Today screen, suggestions and notifications | 1 |
| 27 | See the whole planned week as an eye-catching picture | "Week at a glance" poster in the app for signed-in members, savable as an image or printable | 1 |
| 28 | App demo for new users | Welcome tour, a demo home to explore without signing up, a getting-started checklist and first-visit tips | 1 (tour, checklist, tips), 2 (demo home) |

## Users, roles and permissions

A **household** records everyone who lives there, but only people who want to vote, comment or plan need a login. Two permanent roles (Admin, Member) plus a rotating **Planner** turn keep it simple: anyone with a login can plan a day, a week or a month.

**Profiles.** The Admin enters the household size by adding a profile per person: name, photo and birth year, plus optional sex, activity level and allergies. Children and elders can be profiles without an account. A profile is either *Family* (counted in servings and nutrition) or *Helper* (the maid), who appears only as a cook.

**Planner rota.** The Admin assigns Planner turns by day, week or month on a rota calendar. Any member can tap "I'll plan this" on a day, week or month: if no one holds that turn it is approved at once and everyone is notified; if it is taken, the Admin decides. Admins can always edit the plan.

**Cooks.** Every meal slot can list one or more cooks — any Family or Helper profile, in any combination (for example "Amma + helper").

| Action | Admin | Planner (during their turn) | Member | Profile without login |
| --- | --- | --- | --- | --- |
| View plan, dishes, recipes, history, health corner | Yes | Yes | Yes | — |
| Agree/disagree, comment, suggest a dish | Yes | Yes | Yes | — |
| Add a custom dish or snap a dish | Yes | Yes | Yes | — |
| Request a Planner turn | Yes | Yes | Yes | — |
| Edit the plan, set cooks, mark dine-out/order-in, accept suggestions, keep a dish despite disagrees | Always | For their days | No | — |
| See own nutrition | Yes | Yes | Yes | Admin sees it |
| See family nutrition overview | Yes | During their turn | No | — |
| Assign turns, approve requests | Yes | No | No | — |
| Add a cuisine, edit any dish, health tips | Yes | No | No | — |
| Add or remove profiles, invite, change roles | Yes | No | No | — |

The person who creates the household becomes Admin, and there can be more than one Admin. Other members see an age band (for example "Adult"), not the exact age.

## Sign-up and joining

Starting a household takes about a minute and nobody types a password: only the Admin signs up, and everyone else joins from a link.

1. The Admin opens the app and enters an email address and types the 6-digit code sent to it.
2. The Admin names the household and adds a profile for everyone at home, including people who won't log in and the helper.
3. The Admin shares the invite link on WhatsApp or SMS, or shows a QR code. A member taps it, enters their email and the code and picks their own profile.
4. The week planner opens with a suggested first week, ready to edit.

**Staying signed in:** each person signs in once per phone or laptop, and the app stays signed in until they sign out, so day-to-day use never asks for a login. Profiles without login need nothing at all. A login is needed only to vote, comment, suggest or plan, because those actions carry a name.

## Multiple households and privacy

Each household is a sealed space: its profiles, plans, photos, comments, history and nutrition are visible only to its own members, and the database enforces this, not just the screens.

| Area | Provision |
| --- | --- |
| Isolation | Every record carries its household; Postgres row-level security refuses any read or write across households, with automated tests for each table |
| Joining | Invite link or code from an Admin, expiring after 7 days; no public list or search of households |
| One home per login | Each login belongs to one household, which has its own Admin, Planners, Members and profiles without login; someone who lives across two homes uses a separate login for each |
| Private by default | Custom dishes, snapped photos, comments, history and nutrition never leave the household; sharing a dish to the global catalogue later is opt-in and strips personal data |
| Photos | Private storage per household, served through short-lived signed links |
| Minimal data | Name and birth year per profile; sex, activity level and allergies only if entered; email only for people who log in; children and elders need no account |
| Nutrition visibility | Each member sees their own; Admins and the current Planner see the family view; allergy warnings show to whoever plans or cooks that meal; nothing is shared outside the household |
| Your control | Any member can download their data or delete their account; an Admin can delete the household and all its data |
| App operator | Support access only when a household asks, and logged; no ads, no selling of data |
| Law | Follow India's Digital Personal Data Protection Act, 2023: a clear consent notice, parental consent for under-18 profiles, deletion on request. Get a legal review before opening the app to the public |

## Security

The strongest protection is holding little worth stealing: no passwords, no social-login links, no phone numbers or addresses. What the app does hold is locked down in layers.

| Area | Measure |
| --- | --- |
| Sign-in | Email plus a 6-digit one-time code that expires in 10 minutes, with limits on tries and resends; no passwords to leak or reuse |
| Sessions | A code is needed only once per device; the app then stays signed in (the session renews in the background) and asks again only on a new device, after signing out, after being removed, or after 6+ months unused; "Sign out all devices" in Settings; the Admin can remove a member instantly |
| Access rules | Row-level security in the database, so even a bug in the app cannot show one household's data to another; automated tests prove it for every table |
| Data in transit and at rest | HTTPS everywhere; the database and photo storage are encrypted at rest by the hosting provider |
| Photos | Location (GPS) and camera details are stripped from every photo on upload, so a snapped dish never reveals where you live or ate |
| Invites | Single-household links that expire after 7 days and can be revoked |
| No trackers | No ads, no third-party analytics or tracking scripts that could leak data |
| Operations | Daily backups, dependency and security updates, an audit log of Admin actions, and an independent security review before opening to the public |
| App lock (optional) | Each member can turn on the phone's own fingerprint or face unlock to open the app; no new code is needed, it only stops someone who picks up the phone from seeing the family's plan |

No app can promise it will never be attacked, but with this design a break-in would expose only names, birth years, meal plans and optional health details, never passwords, bank data or locations.

## Data model

The core record is the **meal slot** (one meal on one day); plans, votes, comments, suggestions and history all hang off it. Cuisines and dishes with no household are the shared global catalogue; rows with a household are that family's own additions.

| Entity | Key fields | Notes |
| --- | --- | --- |
| Household | name, week start (Monday), time zone, default language, meals enabled (snacks on/off) | One per family |
| Account | email, sign-in method | One per person who logs in; belongs to exactly one household |
| Profile | household, account (optional), name, photo, birth year, sex and activity level (optional), allergies (optional), kind (Family or Helper), role (Admin or Member), language | Household size = its Family profiles; no account needed |
| Planner turn | household, profile, scope (day, week, month), start and end dates, status (requested, approved, declined), requested by | Drives who may edit which days |
| Cuisine | name, parent cuisine, household (empty = global) | "South Indian" has parent "Indian"; new cuisines need no code |
| Dish | name, cuisine, meal types, course (main, side or both), diet (veg, egg, non-veg), allergens, tags, prep minutes, thumbnail, photo, recipe search words, nutrition per serving, nutrition source, household (empty = global) | Tags drive health rules, e.g. fried, spicy, sweet, raw fish |
| Dish name | dish, language, name | English and Tamil at launch |
| Dish photo override | dish, household, photo, thumbnail | Replaces the stock photo for that household only |
| Recipe | dish, household (empty = global), servings, ingredients (name, quantity, unit), steps, prep and cook minutes, language, credit | A household can keep its own version |
| Ingredient | name, nutrition per 100 g, source | Used to compute dish nutrition from recipes |
| Week plan | household, week start date (Monday), status (draft, published) | One per household per week |
| Meal slot | week plan, date, meal (breakfast, lunch, snacks, dinner), source (home, dine-out, order-in), place name, main dish, side dishes (up to 3), cooks (any profiles), note, status (proposed, confirmed, done), kept despite disagree | Never deleted, so it doubles as the history record |
| Attendance | meal slot, profile, status (ate, skipped, ate elsewhere), portion (small, normal, large) | Defaults to every Family profile eating a normal portion; Helper profiles are never counted |
| Vote | meal slot, profile, agree or disagree | One per member per slot, changeable |
| Comment | meal slot, profile, text, time | Threaded under the slot |
| Suggestion | meal slot, profile, dish or free text, status (open, accepted, declined) | Accepting swaps the dish in and notifies everyone |
| Nutrition target | age band, sex, activity level, daily calories and nutrients, source | Reference values the nutrition views compare against |
| Notification | profile, type, meal slot or planner turn, read time | Feeds the in-app bell and push |
| Health tip / Trending card | title, body, image, age bands, dish tags, dishes, active dates | Curated by Admin |

History (requirement 12) needs no separate table: a done slot records what was actually eaten, who cooked it and who ate it, including dine-out and order-in, and the History screen queries slots by date range.

## Screens and user flows

The app has five tabs on the phone's bottom bar — Today, Week, Dishes, Health, Family — and any meal can be planned in three taps: slot, dish, save.

| Screen | What it shows | Key actions |
| --- | --- | --- |
| Welcome and demo | Four-card welcome tour, then "Explore a demo home" or "Start my household" | Swipe or skip the tour, try the demo as Admin, Planner or Member, sign up from any demo screen |
| Today | Today's meals with photos, cooks and vote counts | Agree/disagree, comment, open a dish or recipe |
| Week planner | Monday to Sunday × enabled meals; grid on desktop, swipeable day cards on phone; whose Planner turn it is | Pick main + sides, set cooks, mark dine-out/order-in, copy last week, publish |
| Week at a glance | The published week as one colourful poster: food photos for every meal, dine-out/order-in icons, today highlighted; opens from the "week published" notification | Tap a dish for details, save as image, share to the family WhatsApp group, print for the fridge |
| Dish picker | Search and filters: cuisine, meal, main/side, veg/egg/non-veg, prep time | Choose a dish, add a new one, or snap a dish |
| Snap a dish | Camera or gallery photo, name, where it was seen, cuisine, meal | Save to household dishes, add straight to a slot |
| Dish detail | Large photo (lightbox), cuisine, tags, nutrition per serving, age-band notes | Open recipe, how to cook: YouTube / Instagram, replace photo |
| Recipe | Ingredients scaled to the people eating, steps, times | Change servings, cook mode (screen stays on), edit household copy |
| Slot discussion | Votes, comments, suggestions, cooks, who is eating | Comment, suggest, mark skipped or portion, Planner accepts or keeps |
| Planner rota | Calendar of Planner turns by day, week, month | Request a turn; Admin assigns and approves |
| My nutrition | Own calories and nutrients by day and week against the age-band target | Read tips, adjust portions |
| Family nutrition | Week summary per Family profile with flags (Admins, current Planner) | Spot gaps, open tips, plan fixes into next week |
| History | Past meals by week, month or year; counts by cuisine, cook and dine-out | Filter, search a dish, "cook this again" |
| Health corner | Age-band tips, weekly balance check, trending dishes | Read, add a trending dish to the plan |
| Catalogue manager | Cuisines and household dishes | Add a cuisine, add or edit a dish, photo, Tamil name |
| Family | Profiles (with and without login), helper, roles, invite link | Add profile, invite, change role, remove |
| Settings | Profile, birth year, language, meals enabled, notification choices | Switch English/Tamil, toggle snacks, mute notifications |
| Sign in | Email field, then a 6-digit code; once per device | Send code, enter code, switch English/Tamil |
| Set up your home | Home name, language, snacks on/off, everyone who lives there | Add person, mark who will log in, mark the helper |
| Invite family | One invite link and QR code, who has joined, getting-started checklist | Share on WhatsApp, copy link, show QR, cancel link |
| Join from invite | Who invited you, the home's name, the names still free to claim | Pick your name, continue with email code |

[embedded content: meal slot lifecycle · 5 steps, 1 decision]

The Planner publishes the week and the family votes, comments and suggests. The Planner then keeps the dish, even with disagrees, or swaps it and the family is notified again. On the day, the slot records who cooked, who ate, and whether it was cooked, dine-out or order-in, and becomes history.

**First-time experience (app demo):** a new user learns the app in four layers, each skippable and available in English and Tamil.

1. **Welcome tour:** four swipeable cards on first open: plan the week, the family votes and suggests, the Week at a glance poster, and nutrition with allergy warnings.
2. **Demo home:** "Explore a demo home" opens a sample family with a full planned week, votes, comments, cooks and a poster, with no sign-up. A switch shows the Admin, Planner and Member views. It runs only on the device, uses made-up data, is reset each time, and has a "Start my household" button on every screen.
3. **Getting-started checklist:** after sign-up, the Admin sees five steps with progress: add family profiles, invite members, plan the first meal, publish the week, and open the poster.
4. **First-visit tips:** a short pointer the first time each screen opens (for example "Tap a photo to see it large"), and "Replay the tour" in Settings.

## Tech stack and architecture

Recommendation: a React + TypeScript web app on a Supabase backend, wrapped with Capacitor for Android and iOS — one codebase, no rewrite when you go mobile.

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React + TypeScript, built with Vite | Most widely used web stack; huge library and hiring pool |
| UI | Tailwind CSS + shadcn/ui components, Lucide icons | Fast to build a polished, consistent look |
| Data fetching | TanStack Query + Supabase JS client | Caching and offline-friendly reads |
| Installable web | PWA (vite-plugin-pwa) | Add to home screen, web push, works on flaky networks |
| Mobile apps | Capacitor | Wraps the same build as native Android/iOS apps with native push and camera |
| Backend | Supabase: Postgres, Auth, Storage, Realtime, Edge Functions | Relational data suits plans and history; row-level security enforces household roles; no server to run |
| Hosting | Vercel or Netlify for the web app; Supabase cloud | Free tiers should cover one family |

[embedded content: architecture · 2 clients, 5 backend services, 2 external]

Both clients talk to Supabase over HTTPS and a live websocket; an Edge Function sends plan-change alerts through push services back to every device. Recipe links open YouTube or Instagram directly from the phone, so no API keys are needed.

**Alternatives considered:** React Native with Expo gives a more native feel but a weaker web app; Flutter means learning Dart. Both are fine choices if mobile ever becomes the main product.

## Notifications

Any change to a published plan notifies the people it affects, in the app's bell and as a push to their phone; each member can mute any event type in Settings.

| Event | Who is notified | Channel |
| --- | --- | --- |
| Week plan published | All members | Bell + push |
| A slot changed (dish swapped, moved to dine-out/order-in) | All members | Bell + push |
| You were set as a cook | That member (Helper profiles have no login, so nothing) | Bell + push |
| Someone requested a Planner turn that is already taken | Admins | Bell + push |
| Planner turn approved (automatically when free) or declined | The requester, and all members when approved | Bell + push |
| Your Planner turn starts tomorrow | That member | Push |
| New suggestion on a slot | Admins and the current Planner | Bell + push |
| Suggestion accepted or declined | The member who suggested | Bell + push |
| New comment on a slot | Current Planner + members who voted or commented there | Bell only |
| Planner kept a dish despite disagrees | Members who disagreed | Bell only |
| Evening reminder of tomorrow's meals (optional) | Whoever turns it on | Push |
| A planned dish contains an allergen for someone eating it | Current Planner, the cooks, and the affected member if they have a login | Bell + push |

Push channels by phase: web push from the installed PWA in phase 2 (on iPhone this needs the app added to the home screen), then Firebase Cloud Messaging (Android) and Apple Push Notification service (iOS) once the Capacitor apps ship in phase 4. Changes to the same slot within a few minutes are merged into one notification so a Planner editing the week doesn't flood everyone.

## Health and trending

Health guidance uses each member's profile (age, and optionally sex, activity level and allergies) and the tags on each dish, and shows gentle tips and warnings, never blocks a choice. Every tip carries a line saying it is general guidance, not medical advice.

| Age band | Ages | Example flags on a planned dish |
| --- | --- | --- |
| Child | 12 and under | Very spicy, caffeine, raw fish, whole nuts for the youngest |
| Teen | 13–17 | Many fried or sugary snacks in one week |
| Adult | 18–59 | Weekly balance only (see below) |
| Senior | 60 and over | High-salt, deep-fried, very hard to chew |

**Weekly balance check** (shown to Planners on the Week screen): the same main dish 3+ times in a week, fried dishes in more than a set number of slots, a day with no vegetable side, or several dine-out/order-in meals in a row. The limits and the flag lists are Admin-editable settings, so your family decides what "healthy" means.

**Allergies (optional):** a profile can list allergies from a common list (peanut, tree nuts, milk, egg, wheat/gluten, soy, fish, shellfish, sesame, mustard) or add its own. Dishes carry allergen tags taken from their recipe ingredients, and the app then warns:

- in the dish picker, with a badge such as "contains peanut — affects 1 person" before the dish is chosen;
- on the Week planner and Today screens, on any slot where someone eating is allergic;
- on suggestions, so a member cannot unknowingly propose a dish another member reacts to;
- by notification to the Planner, the cooks and the affected member (if they have a login) when such a dish is planned.

Allergen tags are best-effort, especially for snapped or dine-out dishes, so warnings say to check ingredients.

**Trending corner:** cards curated by the Admin (for example "Millet dosa is back", "Try a Japanese bento week") with a button to add the dish to the plan. Pulling trends automatically from recipe sites or social media is a later option, not phase 3.

Age is stored as birth year so it stays current; other members see only the band.

## Nutrition and recipes

Every dish carries per-serving nutrition, and knowing who ate which meal gives each person a daily and weekly picture against a target for their age, sex and activity level.

| Part | How it works |
| --- | --- |
| Dish nutrition | Calories, protein, carbohydrate, fat, fibre, sugar and sodium per serving. Computed from recipe ingredients using India's food composition tables (IFCT 2017, NIN) for Indian ingredients and USDA FoodData Central for others; each value shows its source |
| Custom and snapped dishes | Entered by hand, or estimated from the photo by AI in phase 3; always labelled "estimate" |
| Who ate what | Every home meal assumes all Family profiles (not the helper) ate a normal portion; one tap marks skipped, ate elsewhere, or a small/large portion. Dine-out and order-in meals get a quick estimate |
| Targets | Reference daily values from ICMR-NIN's nutrient requirements for Indians (2020), chosen by age, sex and activity level; if sex or activity is left blank, an age-band average is used |
| My nutrition | Each member sees their own totals and gentle tips, for example "protein low on 4 of 7 days" |
| Family nutrition | Admins and the current Planner see a week summary per Family profile, with flags they can plan around next week |
| Hosted recipes | Ingredients, steps, servings and times, scaled to the people eating that meal; a household can keep its own version of any recipe. Launch with the 50 most-planned dishes, drafted by Claude and checked by your family, and add the rest over time. YouTube and Instagram links stay for learning by video |

Nutrition figures are estimates for home planning, not medical advice, and the app says so on every nutrition screen.

## Food catalogue and images

The app ships with about 50 dishes per cuisine (around 200 in total), stored as a seed data file in the code repository, so adding dishes or a whole cuisine is a data change, not a code change. Evening snacks are included: about 10 to 12 per cuisine, with tea, coffee, juice or buttermilk available as a side.

| Cuisine | Breakfast | Lunch / dinner mains | Common sides | Evening snacks |
| --- | --- | --- | --- | --- |
| South Indian | Idli, dosa, pongal, upma, pesarattu | Sambar rice, bisi bele bath, curd rice, chapati with kurma, idiyappam with stew | Coconut chutney, sambar, rasam, poriyal, kootu, appalam | Medu vada, sundal, bajji |
| North Indian | Aloo paratha, poha, chole bhature | Rajma chawal, dal tadka with jeera rice, paneer butter masala with roti | Raita, salad, pickle, papad | Samosa, aloo tikki, kachori |
| European | Omelette, pancakes, muesli, eggs on toast | Pasta aglio e olio, risotto, ratatouille, shepherd's pie, paella | Garden salad, garlic bread, soup | Bruschetta, crêpes |
| Japanese | Rice, miso soup and tamagoyaki; onigiri | Chicken teriyaki, ramen, katsu curry, yakisoba, sushi rolls | Miso soup, edamame, pickles, cucumber sunomono | Takoyaki, onigiri |

**Images:** each dish has a small thumbnail (shown at 56 px, stored at 2×) and a full photo up to 1080 px for the lightbox. Seed photos are free-licence stock images (for example from Wikimedia Commons), with attribution kept in the data file; dishes without a photo show a coloured initial tile. Any household can tap "Replace photo" to use its own picture, which then shows only for that household. Uploads from the camera or gallery are resized automatically.

**Snap a dish:** liked something at a restaurant or a friend's place? Take a photo in the app, give it a name, cuisine and where you had it, and it joins your household's dishes, ready to plan. In phase 3 the app can suggest the name, cuisine and a nutrition estimate from the photo.

**How to cook:** every dish has two buttons that open a search for its name plus "recipe" — a YouTube search, and an Instagram hashtag page. On a phone they open the installed apps. No accounts or API keys are involved.

**Languages:** every screen label and dish name is stored per language, with English and Tamil at launch (Noto Sans Tamil font) and each member choosing their own. Adding Hindi or another language later means adding one translation file and the dish names, with no code change.

## Visual design

The look is warm and food-first: big photos, a cream background, a turmeric-saffron accent and curry-leaf green, with a matching dark mode.

| Element | Direction |
| --- | --- |
| Colours | Saffron accent for actions, leaf green for "agreed", tomato red for "disagree" and warnings, cream and charcoal for page and text |
| Meal colours | Breakfast sunrise yellow, lunch green, snacks orange, dinner indigo — a small chip on every slot |
| Type | Poppins for headings; Noto Sans and Noto Sans Tamil for body text, so English and Tamil look alike (all free Google Fonts) |
| Shapes | Rounded cards (16 px corners), round dish thumbnails, soft borders instead of heavy shadows |
| Layout | Phone first: bottom tab bar and swipeable day cards; desktop: 7-day grid with the dish picker as a side panel |
| Delight | Subtle animation when a vote lands; empty states with friendly food illustrations |

**Week at a glance poster:** once a week is published, every signed-in member gets a single colourful picture of it. Monday to Sunday run as columns on a tablet or laptop and as a vertical scroll of day cards on a phone. Each meal shows a round food photo, the dish name in English and Tamil, and its meal colour band, with icons for dine-out and order-in and today's column highlighted. A "Save as image" button makes a shareable picture for the family WhatsApp group or a phone wallpaper, and "Print" gives an A4 sheet for the fridge. The saved image shows only dishes: no names, cooks, allergies or nutrition, so it is safe to share.

**Design tools:** Claude drafts the screen mockups first, as you decided. **Figma** (free plan) stays optional if you later want a clickable prototype to adjust yourself. Use **Canva** for the app icon, splash screen and Play Store / App Store screenshots, not for the app screens. Tamil text uses Noto Sans Tamil alongside Poppins and Noto Sans.

**Mockups:** 16 clickable phone and tablet screens are on the [HomeFood Mockups canvas](https://claude.ai/artifact/Da44ni2BQHfvacoRXVCuo6): Week at a glance, planning a meal, Today and meal discussion, sign-up and joining, dish detail and recipe, Snap a dish and the Planner rota. Promotional visuals are in Canva: the [Week at a glance poster](https://canva.link/im2xw3kup7xbz11) and the [welcome tour cards](https://canva.link/hlg8r5txhb0wmtt). Phase 3 screens (nutrition, history reports, health corner) will be drawn before that phase.

## Roadmap

The web app is usable by your family after phase 1 (about 5 weeks of part-time build); each later phase starts only once the gate below it is met.

[embedded content: roadmap · 4 phases, 3 gates]

Durations are rough estimates for one developer working with Claude, and each gate is a real-use check rather than a date. Before phase 1, Claude's screen mockups settle the design. Multi-household isolation is built into phase 1, so relatives can join as soon as it ships.

## Phase 1 build plan

Phase 1 delivers a working web app your family can use every day; everything else waits for its phase.

**In phase 1**

- Sign-in by email code, homes, profiles with and without login, the helper, roles, invite link and joining.
- Dish catalogue: four cuisines seeded with about 200 dishes, Tamil names and stock photos; your own dishes, Snap a dish, and replacing any photo.
- Week planner: main plus up to 3 sides, cooks, dine-out and order-in, copy last week, publish; Planner rota with Admin-assigned turns.
- Today screen, Week at a glance poster with save-as-image and print, and a history list.
- Allergies on profiles, allergen tags on dishes and warnings when planning.
- English and Tamil, welcome tour, getting-started checklist and first-visit tips, installable as a phone app from the browser.
- Every measure in the Security section, including the optional app lock.

**Later phases:** votes, comments, suggestions, planner requests and notifications (phase 2); nutrition, hosted recipes, health corner, reports and the AI photo guess (phase 3); Play Store and App Store apps (phase 4).

**Build order** (each step ends with something you can try):

1. Setup: code repository, Supabase project, hosting, database tables with access rules, email-code sign-in.
2. Home setup: create a home, add profiles, invite link, join flow.
3. Dish catalogue: seed data, search and filters, add a dish, Snap a dish, photos.
4. Planning: week planner, meal editor, cooks, dine-out and order-in, allergy warnings, publish, rota.
5. Everyday view: Today screen, Week at a glance poster, history list.
6. Polish: Tamil throughout, welcome tour, checklist and tips, installable app, accessibility check.
7. Family trial: your family uses it for 2 weeks (the phase 1 gate), then fixes.

**Done means:** automated tests prove no household can read another's data; the app works on Android Chrome, iPhone Safari and a laptop browser; English and Tamil are complete; it is live at a web address.

**What you need to set up** (accounts in your name; never share passwords with anyone, including Claude):

- [ ] A free Supabase account for the database and sign-in.
- [ ] A free Vercel or Netlify account to host the web app.
- [ ] An email-sending service for sign-in codes (Supabase's built-in email is only for testing and sends a few emails an hour).
- [ ] A GitHub account to keep the code safe and versioned (recommended).
- [ ] Later, optional: your own web address (domain).

## Decisions and open questions

Your answers of 27 Sep 2026 are built into the sections above.

| Question | Decision |
| --- | --- |
| Split votes | The Planner has the final say and can keep a dish even when members disagree |
| Veg / egg / non-veg filter per member | Later; dishes already carry the diet tag, so it can be added without data changes |
| Week start | Monday |
| Language | English and Tamil at launch; other languages can be added later |
| Other households | Relatives will join soon, so multi-household support and privacy are built in from day one |
| Accounts | Each login belongs to one household; every household has its own Admin, Planners, Members and profiles without login |
| Sign-up | Email with a one-time code only: no passwords, no Google or social login; invite by link; stay signed in on each device |
| Photos | Free-licence stock photos now; any household can replace a dish photo with its own |
| Sex and activity level | Optional per profile, used only to set nutrition targets |
| Allergies | Optional per profile; the app warns wherever a dish with that allergen is planned |
| Helper (maid) | Appears only as a cook; not counted in servings or nutrition |
| Hosted recipes | Start with the 50 most-planned dishes, drafted by Claude and checked by your family |
| Planner requests | Auto-approved when that day or week has no Planner; the Admin decides only if it is already taken |
| Mockups | Claude drafts the screen mockups |
| Week at a glance | A colourful poster of the published week that signed-in members open in the app, save as an image or print; no public link that works without login |

No questions are open. The next step is the screen mockups.
