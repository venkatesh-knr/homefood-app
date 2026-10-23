-- HomeFood · 0034: prep reminders (61 prep tags on 61 standard recipes)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run (after 0033). Safe to run twice.
-- Some dishes need doing AHEAD: grind and ferment the batter, soak the chickpeas, set the curd, thaw the chicken, marinate the meat.
--   * recipe_prep: the tags. `night_before` = do it the evening before (Today's "Tonight · for tomorrow" card; the cooks of that meal get an in-app
--     reminder at 7 pm); `hours_before` = do it N hours before the meal that day (Today's morning card). `hours` is "needs about N hours" for a
--     night-before task, or the number of hours before for an hours-before task. A home's own version of a recipe can carry its own tags; if it has
--     none, the standard recipe's tags apply (prep_for_dish).
--   * prep_done: who ticked a task done for one meal. Anyone in the home can tick or undo; everyone in the home sees who.
--   * create_prep_reminders(): writes the 7 pm notifications. pg_cron runs it every 15 minutes (see the end of this file); it only acts for a home
--     whose own clock (households.timezone) is in the 7 o'clock hour, never twice for the same meal, task and cook, never for a task already
--     done, and only for cooks who have a login (the helper has none).
-- No phone push yet: the reminder is an in-app notification (the bell).

create table if not exists public.recipe_prep (
  id        uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position  smallint not null default 1,
  kind      text not null check (kind in ('soak', 'batter_ferment', 'set_curd', 'thaw', 'marinate', 'sprout', 'other')),
  lead      text not null check (lead in ('night_before', 'hours_before')),
  hours     smallint check (hours between 1 and 72),
  text_en   text not null check (char_length(btrim(text_en)) between 1 and 160),
  text_ta   text check (char_length(btrim(text_ta)) between 1 and 160),
  unique (recipe_id, position),
  check (lead <> 'hours_before' or hours is not null)
);
alter table public.recipe_prep enable row level security;
drop policy if exists recipe_prep_read on public.recipe_prep;
create policy recipe_prep_read on public.recipe_prep for select to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.household_id is null or r.household_id = public.my_household_id())));
drop policy if exists recipe_prep_write on public.recipe_prep;
create policy recipe_prep_write on public.recipe_prep for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()));
grant select, insert, update, delete on public.recipe_prep to authenticated;

-- The prep tags that apply to a dish for a home: its own recipe's tags if it has any, else the standard recipe's.
create or replace function public.prep_for_dish(p_dish uuid, p_household uuid) returns setof public.recipe_prep
language sql stable security definer set search_path = '' as $$
  select rp.* from public.recipe_prep rp
  where rp.recipe_id = coalesce(
    (select r.id from public.recipes r where r.dish_id = p_dish and r.household_id = p_household
        and exists (select 1 from public.recipe_prep x where x.recipe_id = r.id)),
    (select r.id from public.recipes r where r.dish_id = p_dish and r.household_id is null))
$$;
revoke execute on function public.prep_for_dish(uuid, uuid) from public, anon, authenticated;

create table if not exists public.prep_done (
  slot_id      uuid not null references public.meal_slots (id) on delete cascade,
  prep_id      uuid not null references public.recipe_prep (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  done_by      uuid references public.profiles (id) on delete set null,
  done_at      timestamptz not null default now(),
  primary key (slot_id, prep_id)
);
alter table public.prep_done enable row level security;
drop policy if exists prep_done_read on public.prep_done;
create policy prep_done_read on public.prep_done for select to authenticated using (household_id = public.my_household_id());
drop policy if exists prep_done_insert on public.prep_done;
create policy prep_done_insert on public.prep_done for insert to authenticated
  with check (household_id = public.my_household_id() and done_by = public.my_profile_id()
              and exists (select 1 from public.meal_slots s where s.id = slot_id and s.household_id = public.my_household_id()));
drop policy if exists prep_done_delete on public.prep_done;
create policy prep_done_delete on public.prep_done for delete to authenticated using (household_id = public.my_household_id());
grant select, insert, delete on public.prep_done to authenticated;

-- ── The 7 pm reminder (an in-app notification) ──
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in ('week_published', 'slot_changed', 'cook_assigned', 'suggestion_new',
  'suggestion_accepted', 'suggestion_declined', 'comment_new', 'kept_despite', 'turn_assigned', 'prep_reminder'));
alter table public.notifications add column if not exists dedupe_key text;
create unique index if not exists notifications_dedupe_uidx on public.notifications (dedupe_key) where dedupe_key is not null;

create or replace function public.create_prep_reminders(p_at timestamptz default now()) returns integer
language plpgsql security definer set search_path = '' as $fn$
declare
  total integer := 0;
  made integer;
  h record;
begin
  for h in
    select id, (p_at at time zone timezone)::date + 1 as tomorrow
    from public.households
    where extract(hour from (p_at at time zone timezone)) = 19
  loop
    insert into public.notifications (household_id, profile_id, type, slot_id, actor_id, data, dedupe_key)
    select s.household_id, c.profile_id, 'prep_reminder', s.id, null,
           jsonb_build_object(
             'date', s.date, 'meal', s.meal, 'prep_id', rp.id, 'task_en', rp.text_en, 'task_ta', rp.text_ta,
             'dish_en', coalesce((select n.name from public.dish_names n where n.dish_id = d.dish_id and n.language = 'en'), (select x.name from public.dishes x where x.id = d.dish_id)),
             'dish_ta', (select n.name from public.dish_names n where n.dish_id = d.dish_id and n.language = 'ta')),
           'prep:' || s.id || ':' || rp.id || ':' || c.profile_id || ':' || s.date
    from public.meal_slots s
    join public.meal_slot_cooks c on c.slot_id = s.id
    join public.profiles pr on pr.id = c.profile_id and pr.user_id is not null
    cross join lateral (
      select s.main_dish_id as dish_id where s.main_dish_id is not null
      union
      select sd.dish_id from public.meal_slot_sides sd where sd.slot_id = s.id
    ) d
    cross join lateral public.prep_for_dish(d.dish_id, s.household_id) rp
    where s.household_id = h.id and s.date = h.tomorrow and s.source = 'home' and rp.lead = 'night_before'
      and not exists (select 1 from public.prep_done pd where pd.slot_id = s.id and pd.prep_id = rp.id)
    on conflict (dedupe_key) where dedupe_key is not null do nothing;
    get diagnostics made = row_count;
    total := total + made;
  end loop;
  return total;
end $fn$;
revoke execute on function public.create_prep_reminders(timestamptz) from public, anon, authenticated;

-- ── The prep tags for the standard recipes ──
insert into public.recipe_prep (recipe_id, position, kind, lead, hours, text_en, text_ta)
select r.id, v.position, v.kind, v.lead, v.hours, v.text_en, v.text_ta
from (values
  ('Idli', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Dosa', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Masala dosa', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Egg dosa', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Set dosa', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Kal dosai', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Uttapam', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Appam', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Kuzhi paniyaram', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Podi idli', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Mini idli sambar', 1, 'batter_ferment', 'night_before', 8::smallint, 'Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
  ('Mangalore buns', 1, 'batter_ferment', 'night_before', 8::smallint, 'Mix the banana dough and leave it to rest overnight', 'வாழைப்பழ மாவைக் கலந்து இரவு முழுவதும் ஊற வைக்கவும்'),
  ('Kambu koozh', 1, 'batter_ferment', 'night_before', 8::smallint, 'Mix the pearl millet flour with water and leave it to ferment', 'கம்பு மாவைத் தண்ணீரில் கலந்து புளிக்க வைக்கவும்'),
  ('Pazhaya sadam', 1, 'other', 'night_before', null::smallint, 'Soak the cooked rice in water overnight', 'சோற்றை இரவு முழுவதும் தண்ணீரில் ஊற வைக்கவும்'),
  ('Chole', 1, 'soak', 'night_before', null::smallint, 'Soak the chickpeas overnight', 'கொண்டைக்கடலையை இரவு ஊற வைக்கவும்'),
  ('Chole bhature', 1, 'soak', 'night_before', null::smallint, 'Soak the chickpeas overnight', 'கொண்டைக்கடலையை இரவு ஊற வைக்கவும்'),
  ('Kadala curry', 1, 'soak', 'night_before', null::smallint, 'Soak the chickpeas overnight', 'கொண்டைக்கடலையை இரவு ஊற வைக்கவும்'),
  ('Sundal', 1, 'soak', 'night_before', null::smallint, 'Soak the chickpeas overnight', 'கொண்டைக்கடலையை இரவு ஊற வைக்கவும்'),
  ('Rajma masala', 1, 'soak', 'night_before', null::smallint, 'Soak the rajma overnight', 'ராஜ்மாவை இரவு ஊற வைக்கவும்'),
  ('Dal makhani', 1, 'soak', 'night_before', null::smallint, 'Soak the whole urad and rajma overnight', 'முழு உளுந்தையும் ராஜ்மாவையும் இரவு ஊற வைக்கவும்'),
  ('Pesarattu', 1, 'soak', 'night_before', null::smallint, 'Soak the green gram overnight', 'பச்சைப்பயறை இரவு ஊற வைக்கவும்'),
  ('Medu vada', 1, 'soak', 'hours_before', 3::smallint, 'Soak the dal for the vadas', 'வடைக்குப் பருப்பை ஊற வைக்கவும்'),
  ('Sambar vada', 1, 'soak', 'hours_before', 3::smallint, 'Soak the dal for the vadas', 'வடைக்குப் பருப்பை ஊற வைக்கவும்'),
  ('Thayir vada', 1, 'soak', 'hours_before', 3::smallint, 'Soak the dal for the vadas', 'வடைக்குப் பருப்பை ஊற வைக்கவும்'),
  ('Paruppu vadai', 1, 'soak', 'hours_before', 2::smallint, 'Soak the chana dal', 'கடலைப்பருப்பை ஊற வைக்கவும்'),
  ('Adai', 1, 'soak', 'hours_before', 4::smallint, 'Soak the rice and dals', 'அரிசியையும் பருப்புகளையும் ஊற வைக்கவும்'),
  ('Verkadalai sundal', 1, 'soak', 'hours_before', 4::smallint, 'Soak the peanuts', 'வேர்க்கடலையை ஊற வைக்கவும்'),
  ('Curd', 1, 'set_curd', 'night_before', 8::smallint, 'Set the curd', 'தயிர் உறை ஊற்றவும்'),
  ('Curd rice', 1, 'set_curd', 'night_before', 8::smallint, 'Set the curd', 'தயிர் உறை ஊற்றவும்'),
  ('Cucumber raita', 1, 'set_curd', 'night_before', 8::smallint, 'Set the curd', 'தயிர் உறை ஊற்றவும்'),
  ('Boondi raita', 1, 'set_curd', 'night_before', 8::smallint, 'Set the curd', 'தயிர் உறை ஊற்றவும்'),
  ('Chicken curry', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Chicken fry', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Chicken 65', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Chicken chettinad', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Chicken stew', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Dhaba chicken curry', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Pepper chicken', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Roast chicken', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Chicken lollipop', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Chicken teriyaki', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Nattu kozhi kuzhambu', 1, 'thaw', 'night_before', null::smallint, 'Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Mutton chukka', 1, 'thaw', 'night_before', null::smallint, 'Move the mutton from the freezer to the fridge', 'ஆட்டிறைச்சியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Mutton keema', 1, 'thaw', 'night_before', null::smallint, 'Move the mutton from the freezer to the fridge', 'ஆட்டிறைச்சியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Mutton kuzhambu', 1, 'thaw', 'night_before', null::smallint, 'Move the mutton from the freezer to the fridge', 'ஆட்டிறைச்சியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Mutton rogan josh', 1, 'thaw', 'night_before', null::smallint, 'Move the mutton from the freezer to the fridge', 'ஆட்டிறைச்சியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Mutton kola urundai', 1, 'thaw', 'night_before', null::smallint, 'Move the mutton from the freezer to the fridge', 'ஆட்டிறைச்சியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Fish curry', 1, 'thaw', 'night_before', null::smallint, 'Move the fish from the freezer to the fridge', 'மீனை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Fish fry', 1, 'thaw', 'night_before', null::smallint, 'Move the fish from the freezer to the fridge', 'மீனை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Fish moilee', 1, 'thaw', 'night_before', null::smallint, 'Move the fish from the freezer to the fridge', 'மீனை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Nethili fry', 1, 'thaw', 'night_before', null::smallint, 'Move the fish from the freezer to the fridge', 'மீனை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Fish thokku', 1, 'thaw', 'night_before', null::smallint, 'Move the fish from the freezer to the fridge', 'மீனை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Prawn masala', 1, 'thaw', 'night_before', null::smallint, 'Move the prawns from the freezer to the fridge', 'இறாலை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Crab masala', 1, 'thaw', 'night_before', null::smallint, 'Move the crab from the freezer to the fridge', 'நண்டை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
  ('Chicken biryani', 1, 'marinate', 'night_before', 8::smallint, 'Marinate the chicken with curd and spices', 'கோழிக்கறியைத் தயிர், மசாலாவுடன் ஊற வைக்கவும்'),
  ('Dindigul biryani', 1, 'marinate', 'night_before', 8::smallint, 'Marinate the chicken with curd and spices', 'கோழிக்கறியைத் தயிர், மசாலாவுடன் ஊற வைக்கவும்'),
  ('Mutton biryani', 1, 'marinate', 'night_before', 8::smallint, 'Marinate the mutton with curd and spices', 'ஆட்டிறைச்சியைத் தயிர், மசாலாவுடன் ஊற வைக்கவும்'),
  ('Tandoori chicken', 1, 'marinate', 'night_before', 8::smallint, 'Marinate the chicken with curd and spices', 'கோழிக்கறியைத் தயிர், மசாலாவுடன் ஊற வைக்கவும்'),
  ('Chicken tikka', 1, 'marinate', 'night_before', 8::smallint, 'Marinate the chicken with curd and spices', 'கோழிக்கறியைத் தயிர், மசாலாவுடன் ஊற வைக்கவும்'),
  ('Butter chicken', 1, 'marinate', 'hours_before', 4::smallint, 'Marinate the chicken with curd and spices', 'கோழிக்கறியைத் தயிர், மசாலாவுடன் ஊற வைக்கவும்'),
  ('Paneer tikka', 1, 'marinate', 'hours_before', 2::smallint, 'Marinate the paneer', 'பனீரை மசாலாவில் ஊற வைக்கவும்')
) as v(dish, position, kind, lead, hours, text_en, text_ta)
join public.dishes d on d.household_id is null and d.name = v.dish
join public.recipes r on r.dish_id = d.id and r.household_id is null
on conflict (recipe_id, position) do nothing;

-- ── Schedule the reminder (needs the pg_cron extension: Dashboard › Database › Extensions › pg_cron) ──
-- Every 15 minutes; create_prep_reminders() itself only acts in each home's 7 o'clock hour and never repeats itself.
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('homefood-prep-reminders', '*/15 * * * *', 'select public.create_prep_reminders()');
  else
    raise notice 'pg_cron is not switched on: the 7 pm reminders are NOT scheduled. Switch it on under Database > Extensions, then run this file again.';
  end if;
end
$cron$;
