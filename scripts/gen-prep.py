"""Writes supabase/migrations/0034_prep_reminders.sql from scripts/prep_data.py: the tables, rules and 7 pm reminder function for prep
reminders, and the seed of prep tags for the standard recipes. Run from the repo root:  python -X utf8 scripts/gen-prep.py
Checks every row: a known kind, lead and wording, hours where needed, and a dish that really has a standard recipe in the recipe sources.
"""
import glob
import importlib.util
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from prep_data import TEXTS, rows  # noqa: E402

root = pathlib.Path(__file__).parent.parent
KINDS = {'soak', 'batter_ferment', 'set_curd', 'thaw', 'marinate', 'sprout', 'other'}
LEADS = {'night_before', 'hours_before'}

have = set()
for f in glob.glob(str(root / 'scripts/recipes_*.txt')):
    for line in open(f, encoding='utf-8'):
        if line.startswith('@ '):
            have.add(line[2:].split('|')[0].strip())
spec = importlib.util.spec_from_file_location('recipes_data', root / 'scripts/recipes_data.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
have |= {r['dish'] for r in mod.R}

R = rows()
per_dish = {}
for r in R:
    assert r['kind'] in KINDS and r['lead'] in LEADS, r
    assert r['key'] in TEXTS, r
    assert r['dish'] in have, '%s has no standard recipe' % r['dish']
    if r['lead'] == 'hours_before':
        assert r['hours'] and 1 <= r['hours'] <= 24, r
    elif r['hours'] is not None:
        assert 1 <= r['hours'] <= 72, r
    per_dish[r['dish']] = per_dish.get(r['dish'], 0) + 1
    r['position'] = per_dish[r['dish']]
    en, ta = TEXTS[r['key']]
    assert 1 <= len(en) <= 160 and ta, r


def q(s):
    return "'" + s.replace("'", "''") + "'"


values = ',\n'.join(
    '  (%s, %d, %s, %s, %s::smallint, %s, %s)'
    % (q(r['dish']), r['position'], q(r['kind']), q(r['lead']), 'null' if r['hours'] is None else r['hours'], q(TEXTS[r['key']][0]), q(TEXTS[r['key']][1]))
    for r in R
)

SQL = f"""-- HomeFood · 0034: prep reminders ({len(R)} prep tags on {len(per_dish)} standard recipes)
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
{values}
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
"""
dest = root / 'supabase/migrations/0034_prep_reminders.sql'
dest.write_text(SQL, encoding='utf-8', newline='\n')
print(len(R), 'prep tags on', len(per_dish), 'dishes ->', dest.name)

# The same tags for the demo home (shaped like the table, keyed by dish name; demoData.ts attaches them to the demo recipes).
import json  # noqa: E402

demo = [dict(dish=r['dish'], position=r['position'], kind=r['kind'], lead=r['lead'], hours=r['hours'], text_en=TEXTS[r['key']][0], text_ta=TEXTS[r['key']][1]) for r in R]
(root / 'src/demo/prep.json').write_text(json.dumps(demo, ensure_ascii=False, separators=(',', ':')), encoding='utf-8', newline='\n')
print('demo -> src/demo/prep.json')
