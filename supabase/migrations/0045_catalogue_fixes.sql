-- HomeFood · 0045: three corrections to the shared dishes, found by the scenario tests
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
--   * Boiled egg is a "both" dish (a breakfast of boiled eggs is a meal on its own, like Omelette), so it also shows in the main-dish list.
--   * Onigiri is a vegetarian dish and loses the "meat" tag the ingredient rules gave it.
--   * Yakisoba (egg noodles) is an egg dish and gets the "egg" tag it was missing.

update public.dishes set course = 'both' where household_id is null and name = 'Boiled egg' and course <> 'both';
update public.dishes set tags = array_remove(tags, 'meat') where household_id is null and name = 'Onigiri';
update public.dishes set tags = array_append(tags, 'egg') where household_id is null and name = 'Yakisoba' and not ('egg' = any (tags));
