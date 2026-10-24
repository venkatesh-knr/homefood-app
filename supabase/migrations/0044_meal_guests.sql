-- HomeFood · 0044: guests at a meal
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- A meal can say how many guests are coming (adults and children; a child counts as half a serving in the app) and an optional note for the cooks
-- ("one guest has no nuts"). Guests have no profiles. They change recipe amounts, the shopping amounts and the cook's sheet count, and nothing else:
-- never anyone's nutrition, attendance or history. "Staying longer" is done by the app, which copies the same guests to the home's other planned meals
-- in a date range through the ordinary meal update, so there is no new rule or function here.
--   * Who may set guests is whoever may plan that meal today (the Admin, or the Planner whose turn covers the day): the existing meal_slots rules.
--   * Everyone in the home reads them with the meal; another home never does.

alter table public.meal_slots add column if not exists guest_adults   integer not null default 0 check (guest_adults between 0 and 30);
alter table public.meal_slots add column if not exists guest_children integer not null default 0 check (guest_children between 0 and 30);
alter table public.meal_slots add column if not exists guest_note     text check (guest_note is null or char_length(guest_note) <= 200);
