# HomeFood: test cases

What is tested, how, and what the last full run found. Written 25 Oct 2026 after the "completely retest" pass that started from
*"boiled egg does not come up when searching for breakfast"*. English screens were tested; Tamil layout (alignment) is a separate later pass.

**How to read it.** Each case has an ID, the scenario, what should happen, and how it is checked:
- **Auto** = a unit test that runs on every `npm test` (and in CI). The file is named.
- **DB** = a rule check in `supabase/tests/rls_test.sql`, run by CI on every push (`npm run test:db` needs a local Postgres).
- **Demo** = walked through by hand in the demo home (`Explore a demo home`, 375 px wide) with the result recorded. These are repeatable by anyone.
- **Live** = needs the real project (real login, real Supabase, a second person); listed so it is not forgotten. Venkatesh runs these.

Totals at this run: 509 unit tests (104 of them walk the whole real catalogue), 444 database checks, 24 screens crawled in English and in Tamil.

---

## A · Finding a dish by typing (Dishes tab, slot editor pickers, "Suggest a dish", diet plate)

The pickers share one rule (`src/lib/search.ts`, `src/lib/dishes.ts` `pickerMatches`): **typing in the search box lifts the dish-type
(main / side) and meal limits**, so a dish catalogued as a side (or for another meal) still shows when a main is wanted. Words are matched from
their start, in any order; plurals, capitals, accents and the usual spellings are forgiven. Auto: `src/lib/scenarios.catalogue.test.ts`,
which uses the **real** shared catalogue (`src/lib/fixtures/allDishes.json`, 331 dishes, written by `scripts/gen-demo-catalogue.py`).

| ID | Scenario | Expected | How | Result |
| --- | --- | --- | --- | --- |
| A1.1 | Type a dish's English name, picker opened for a main dish, any of the 4 meals | The dish is in the list | Auto, all 331 dishes × 4 meals | Pass |
| A1.2 | Same, picker opened for a side dish | In the list | Auto, 331 × 4 | Pass |
| A1.3 | Type the Tamil name (main and side, 4 meals) | In the list | Auto, 331 × 8 | Pass |
| A2.1 | Capitals and extra spaces; words the other way round ("egg boiled") | Found | Auto, every dish | Pass |
| A2.2 | Plural of the last word ("boiled eggs", "idlis") | Found | Auto, every dish | Pass |
| A2.3 | Any single word of the name, or the start of one ("boil", "omel") | Found | Auto, every dish | Pass |
| A2.4 | A typed word is matched from the start of a name word | "egg" does not bring up "Veg kurma"; "ice" does not bring up "rice" dishes | Auto | Pass (was a bug, see below) |
| A3 | Other spellings: idly, dosai, biriyani, chappathi, parota, omlet, sambhar, yogurt, puri, uppuma, kari, muttai, toast, oats, noodles, kanji, sevai ... | Finds the right dish | Auto, 40+ spellings | Pass |
| A3.9 | Something that is not a dish ("zzzz", "unicorn steak") | Nothing found, "No dishes match" and a "show dishes for any meal" link | Auto + Demo | Pass |
| A4.1 | **Boiled egg for breakfast, main dish picker, type "boiled egg" / "boiled eggs" / "egg"** | Boiled egg is listed | Auto + Demo | Pass (the reported problem) |
| A4.2 | Boiled egg with nothing typed, breakfast, main list and side list | Listed in both (it is now a "both" dish) | Auto + DB | Pass |
| A4.3 | A side-only dish (coconut chutney) in the main picker | Not in the list with nothing typed; found by typing its name or by "Include side dishes" | Auto | Pass |
| A5.1 | Main picker, nothing typed, each meal | Only mains / "both" dishes cooked at that meal (snacks: any kind, see A5.2) | Auto | Pass |
| A5.2 | Main picker for **snacks**, nothing typed | Samosa, murukku, sundal, masala chai ... are listed (they are catalogued as sides, but a snack is one item) | Auto | Pass (was a gap) |
| A5.3 | Side picker, nothing typed, each meal | Only sides / "both" dishes cooked at that meal | Auto | Pass |
| A5.4 | "Include side dishes" (or "Include main dishes") chip | Only adds dishes, never removes any | Auto | Pass |
| A5.5 | Every dish can be reached from some picker list with nothing typed | No dish is hidden everywhere | Auto, 331 dishes | Pass |
| A5.6 | A dish that does not match the picker's dish type or meal | Listed after the matching ones, with a note ("Usually a side dish", "Usually for lunch, dinner") | Demo | Pass |
| A6.1 | Diet filter Veg / Egg / Non-veg | The three splits add up to the whole catalogue | Auto | Pass |
| A6.2 | Search + diet filter ("curry" + Egg) | Egg curry only, not chicken curry | Auto + Demo | Pass |
| A6.3 | Each tag chip (low-carb, high protein, light, low oil, low sugar, millet, fasting food); two chips together | Only dishes with every chosen tag | Auto | Pass |
| A6.4 | "Suits everyone eating" with an allergen, a veg person, an egg person | Dishes carrying the allergen / not vegetarian / not non-veg are left out | Auto, every allergen in the catalogue | Pass |
| A6.5 | Meal filter on the Dishes tab | Exactly the dishes cooked at that meal | Auto | Pass |
| A6.6 | "No onion or garlic" preference | Removes every dish tagged onion_garlic, nothing else | Auto | Pass |
| A6.7 | Veg person + egg person + egg allergy together | Only egg-free vegetarian dishes | Auto | Pass |
| A6.8 | Every diet plan (8) and fasting food, every meal | At least one fitting dish, so a diet plate is never left with nothing | Auto | Pass (fasting food has no *main* dish; sides are now offered, see D3) |
| A7 | The same search from any picker (main/side, any meal) | The same dishes | Auto, 120 dishes × 8 contexts | Pass |
| A8 | Empty / space-only search; Tamil vowel signs; accents and apostrophes; the name saved in either language while the screen is in the other | Behaves | Auto | Pass |
| A9 | The shared catalogue itself: every dish has a meal, a valid course and diet, a Tamil name, a unique name; a veg dish is never tagged meat or egg; an egg dish is tagged egg and carries the egg allergen; a non-veg dish is tagged meat | Consistent | Auto + DB (0045) | Pass after fixes (Onigiri, Yakisoba) |
| A10 | Dishes tab search "egg", "boiled", "idly", "தோசை", "zzz" | 5 / 1 / 3 / 4 / 0 dishes in the demo catalogue | Demo | Pass |

## B · Shopping

| ID | Scenario | Expected | How | Result |
| --- | --- | --- | --- | --- |
| B1.1 | Type each of the 150 shared items by English name, Tamil name and every alias | The item is suggested | Auto | Pass |
| B1.2 | First two letters of each item | The item is suggested | Auto | Pass |
| B1.3 | No two shared items with the same name; "onion" lists Onion first | | Auto | Pass |
| B2.1 | Type "2 kg onion" and tap Add on Onion | 2 kg is added (the row says "Adds the 2 kg you typed"), other suggestions keep their usual amount | Demo | Pass (was a bug: Add used the usual 1 kg) |
| B2.2 | "tomatoes", "தக்காளி", "egg" (also finds Brinjal by its alias "eggplant"), "zzzq" | Tomato / Tomato / Eggs / "Nothing matches. Add it as a new item below." | Demo | Pass |
| B2.3 | Tick an item | Moves to Bought, counts update (10 to buy · 2 bought → 9 · 3) | Demo | Pass |
| B2.4 | Amount sheet: + and − | 100 g steps to 1 kg, then 0.5 kg; 1000 g becomes 1 kg; back down below 1 kg returns to g | Demo + Auto (`shopping.test.ts`) | Pass |
| B2.5 | Add items: tap the star next to an item that is not on the list (Carrot, Rice, Eggs) | The star fills, the item appears under ★ Regulars (asleep) and "Add regulars" goes 1 → 2; tap the star again to stop; the same star is on the rows of the Regulars tab and on items already on the list | Demo | Pass (was a gap: the only way was to open an item already on the list and find the switch in its amount sheet) |
| B3 | Parse "tomato 1 kg", "2 kg onion", Tamil names and units; tidy amounts; regulars; share text | | Auto (`shopping.test.ts`, 60+ cases) | Pass |
| B4 | From this week's meals: rounding (380 g toor dal → 500 g, 1.3 kg rice → 2 kg, 300 ml oil → 1 L ...), perishables, staples, merging, guests, leftovers, plates, fasting | | Auto (`shoppingPlan.test.ts`) | Pass |

## C · My extras (what I ate outside the planned meals)

| ID | Scenario | Expected | How | Result |
| --- | --- | --- | --- | --- |
| C1.1 | Type each of the 82 everyday foods by English and Tamil name | Found | Auto | Pass |
| C1.2 | "boiled egg", "egg", "eggs boiled", "BOILED EGGS", "omlet", "idly", "chai", "tea", "பால்" | Boiled egg / Omelette / Idli / Masala chai and teas / Milk | Auto + Demo | Pass |
| C1.3 | The same name as an everyday food and a dish ("Boiled egg", "Curd", "Banana chips") | Listed once (the food, counted in pieces / bowls); dishes with no food of the same name still listed | Auto (`withoutSameNamed`) + Demo | Pass (was a duplicate in the list) |
| C2 | Units and steps, nutrition of an amount, unknown stays unknown, day totals, same as yesterday, goals, privacy | | Auto (`intake.test.ts`) + DB | Pass |

## D · Planning a meal (Week tab, slot editor)

| ID | Scenario | Expected | How | Result |
| --- | --- | --- | --- | --- |
| D1.1 | New breakfast: tap "Tap to plan this meal", search "boiled eggs", pick it, Save | Back on the Week tab; the day's card shows Boiled egg ("1 of 28 meals planned") | Demo | Pass |
| D1.2 | Dine-out: place name, meal size Heavy, Save, reopen | Saved; "about 950 kcal each (a rough estimate)"; no cooks asked | Demo | Pass |
| D1.3 | Order-in tab | "Ordering from", size chips, no cooks | Demo | Pass |
| D1.4 | Copy last Monday / Copy last week, Publish week | Fills only empty meals; status becomes Published | Demo | Pass |
| D1.5 | Guests: 2 adults + 2 children, note, "Staying longer" with an Until date | Summary "Cooking for 9 people · 8 servings (5 family + 4 guests)"; servings in the recipe, shopping and cook's sheet | Demo + Auto (`guests.test.ts`, `shoppingPlan.test.ts`, `cookSheet.test.ts`) + DB | Pass |
| D1.6 | Leftovers: "Anything left over?", "Use in a meal", "Gone" | Sheet lists today's home meals; a used leftover is a side marked leftover | Demo + Auto + DB | Pass |
| D1.7 | Allergy and preference notes while planning ("Paati: Boiled egg is not vegetarian") | Shown under the dish | Demo + Auto | Pass |
| D2 | Date and week logic, rota, turns, allergy cross-check | | Auto (`planner.test.ts`) + DB | Pass |
| D3 | Diet plate: plate for people on a diet plan; fasting-food plate | Suggests dishes that fit every plan of the people on it; a plan with few main dishes (fasting foods) is filled up with side dishes; the picker starts with sides included | Auto (`dietPlans.test.ts`, `plates.test.ts`, A6.8) | Pass (was a gap) |

## E · Today, Week, History, nutrition

| ID | Scenario | Expected | How | Result |
| --- | --- | --- | --- | --- |
| E1 | Today: greeting, next-up card, rest of today, leftovers, extras, shopping and cook's sheet cards | All present, no errors | Demo (24-screen crawl) | Pass |
| E2 | "Did you eat this?": Ate → Skipped → Ate | The label follows; person switcher for the Admin | Demo | Pass |
| E3 | Agree on the next-up card, then again | 0 → 1 (pressed), back to 0 | Demo | Pass |
| E4 | Cook's sheet: English, Tamil, today, tomorrow, guests line | Dishes, head counts, cooks, guests with their note; helper written in Tamil | Demo + Auto | Pass |
| E5 | History: week / month / year; search "egg", "boiled eggs", "idly", "பொங்கல்", "zzzq" | Counts per range; list filtered with the same forgiving search | Demo | Pass (search was exact-substring only, now shared) |
| E6 | My nutrition / Family nutrition: fasting days marked and left out of the average; plan focus; protein aim | | Demo + Auto | Pass |
| E6b | Nutrition: a home's own dish with no numbers is eaten (Mushroom omelette as Monday snacks) | My nutrition and Family nutrition show "Not counted: Mushroom omelette in 1 meal" with an Add numbers button that opens its edit page; nothing shows when every dish has numbers; meals out, fasted and skipped meals are not counted as missing | Demo + Auto (`nutrition.test.ts`) | Pass |
| E7 | Nutrition totals, targets, tips, attendance, dine-out sizes | | Auto (`nutrition.test.ts`, `attendance`) | Pass |

## F · Adding a dish

| ID | Scenario | Expected | How | Result |
| --- | --- | --- | --- | --- |
| F1 | Add "Bread toast" (breakfast, main or side, with nutrition) | Saved; opens its detail page; found by "toast" in the Dishes tab | Demo | Pass |
| F2 | A dish with no photo | Detail shows the coloured initial and the words "No photo yet" | Demo | Pass (was wrongly "Photo: stock image") |
| F3 | Add dish → "Copy from a similar dish" → pick Omelette | The serving text and numbers are filled in (still editable), with "Copied from Omelette. Change the numbers to match your dish."; every dish is listed, the ones without an estimate say "No estimate yet" and picking one explains there is nothing to copy | Demo | Pass |
| F4 | A new dish has no recipe: open its detail as the Admin | A "Write our recipe" button is there (before, only dishes that already had a recipe showed a recipe button, so there was no way in) | Demo | Pass (was a gap) |
| F5 | Write our recipe → "Start from a similar dish's recipe" → pick Omelette | Servings, times, ingredients and steps are filled in as a draft; nothing is saved until "Save our version"; every dish is listed, the ones without a recipe say "No recipe yet" and picking one explains there is nothing to copy | Demo | Pass |
| F6 | The 33 everyday dishes have recipes and photos | 32 recipes (not Banana) with Tamil text on every line; 31 photos, each with its credit (not Lemon sevai, Coconut sevai, which have no good free photo) | Auto (`staticPhotos.test.ts`) + DB (0047, 0048) | Pass after CI |

## G · Every screen opens (crawl)

24 routes opened one after another in English and in Tamil at 375 px: Today, Week, Rota, Week at a glance, Shopping, Shopping plan, Cook's sheet, slot editor (lunch,
dinner), Discussion, Dishes, Add a dish, Home and its 7 sections, History, Notifications, My nutrition, Family nutrition.
Checked for: console errors (none), "undefined" / "NaN" / "[object" / "{{" / untranslated keys in the text (none), an `h1` on each screen (yes),
horizontal scroll (only Week at a glance, on purpose: full-bleed poster), English words left on a Tamil screen (only dish and person names, the cook's sheet preview
which is in its own language, and the invite link). Demo.

## H · Database rules (CI)

`supabase/tests/rls_test.sql`, 444 checks, run on every push: one home never sees another's data; Admin / Planner / member powers; invites and joining;
dishes, recipes, nutrition, favourites, photos; planner turns and the "slot inside its week" rule; votes, comments, suggestions, notifications; attendance;
shopping list and common items; prep reminders; leftovers; everyday preferences, diet tags, diet plans, diet plate, fasting days, guests;
catalogue consistency (0045, 0046: every shared dish has a Tamil name and a nutrition estimate; no veg dish tagged meat or egg); account export and deletion.

## I · Not covered here (needs the real project or a person)

| ID | What | Why not here |
| --- | --- | --- |
| L1 | Sign-in by email code, joining by invite link on a second phone | Needs real email and two people |
| L2 | Migrations 0045 and 0046 against the real database (Boiled egg both, 33 new dishes) | Run on 25 Oct 2026; Boiled egg confirmed live by Venkatesh |
| L3 | Photos from camera, "Find a free photo online", installing the app, Share / Save as image | Needs a phone |
| L4 | Notifications for another person's actions, the 7 pm prep reminder (pg_cron) | Needs a second person and the clock |
| L5 | Tamil alignment on every screen | Separate pass (asked for later) |
| L6 | Screen reader and full keyboard walk-through | Needs a person (see `docs/accessibility.md`) |

---

## What this run found and fixed

| # | Problem | Fix |
| --- | --- | --- |
| 1 | **Boiled egg did not come up for a breakfast main** (it is catalogued as a *side*; the main picker hid sides, and the search could not lift that) | Typing now lifts the dish-type and meal limits in every picker; "Include side dishes" chip; Boiled egg is a "both" dish (migration 0045) |
| 2 | Snack main picker listed only 8 dishes (samosa, murukku, sundal ... are all catalogued as sides) | The snack main list is not limited by dish type |
| 3 | Search matched anywhere inside a word and needed the exact words: "egg" brought "Veg kurma"; "boiled eggs", "egg boiled", "idly", "omlet" found nothing | One shared search: words matched from their start, any order, plurals, capitals, accents, common spellings |
| 4 | In the Tamil screen, searching in English found nothing (only the shown name and the Tamil name were searched) | Every picker and the Dishes tab search the English and Tamil names whatever the screen language |
| 5 | History search was an exact substring | Uses the shared search |
| 6 | 33 everyday dishes were missing (bread toast, bread omelette, sandwiches, oats, cornflakes, scrambled / half-boiled eggs, egg roll, fruit, banana, milk, juice, kanji, sevai, fried rice, noodles, rolls, sprouts, corn, soups) | Migration 0046, with Tamil names, nutrition and diet tags (no photos or recipes yet) |
| 7 | Onigiri (vegetarian) was tagged "meat"; Yakisoba (egg dish) had no "egg" tag | Migration 0045 |
| 8 | Dish detail said "Photo: stock image" over a dish with no photo | "No photo yet" |
| 9 | Typing "2 kg onion" and tapping Add on the suggestion added 1 kg (the usual amount) | The exact match takes the typed amount ("Adds the 2 kg you typed") |
| 10 | My extras listed "Boiled egg" (food) and "Boiled egg" (dish), "Curd" twice, "Banana chips" twice | The food wins; same-named dishes are left out of that list |
| 11 | Diet plate for fasting foods: no main dish fits (fasting foods are all sides), so the plate had nothing to suggest | Plate suggestions fill up with side dishes; its picker starts with sides included |
| 12 | The leftover, plate and guest database tests put today's meal in a 2099 week plan, so CI failed ("Slot date is outside its week") | Fixed earlier today in the tests (commit 914b407) |

## How to repeat this

```bash
npm test                 # all unit tests, incl. the catalogue walk (scenarios.catalogue.test.ts)
npm run build && npm run lint && npm run contrast
python -X utf8 scripts/gen-demo-catalogue.py   # rewrites the demo catalogue and src/lib/fixtures/allDishes.json after any change to dishes
python -X utf8 scripts/gen-everyday-dishes.py  # rewrites migration 0046 (only while it is unapplied)
```

Demo walk-through: `npm run dev`, open the app, **Explore a demo home**, then work down sections D to G above.
