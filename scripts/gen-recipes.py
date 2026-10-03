"""Writes supabase/migrations/0011_recipes.sql (schema + the standard recipes from recipes_data.py).
Run from the repo root:  python scripts/gen-recipes.py
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from recipes_data import R  # noqa: E402

root = pathlib.Path(__file__).parent.parent
UNITS = {'cup', 'tbsp', 'tsp', 'g', 'ml', 'kg', 'piece', 'sprig', 'pinch', 'clove', 'inch', 'bunch', 'handful', 'slice', 'to_taste', 'as_needed'}

seed_text = ''.join((root / 'supabase/migrations' / f).read_text(encoding='utf-8') for f in ('0005_seed_dishes.sql', '0009_more_indian_dishes.sql'))
names = [r['dish'] for r in R]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]
for r in R:
    assert re.search(r"'%s'" % re.escape(r['dish']), seed_text), 'dish not in the seed catalogue: ' + r['dish']
    assert r['ingredients'] and r['steps'], r['dish']
    for (n, ta, q, u) in r['ingredients']:
        assert u in UNITS, (r['dish'], u)
        assert (q is None) == (u in ('to_taste', 'as_needed')), (r['dish'], n)

payload = []
for r in R:
    payload.append({
        'dish': r['dish'], 'servings': r['servings'], 'prep': r['prep'], 'cook': r['cook'],
        'note': r['note'][0] if r['note'] else None, 'note_ta': r['note'][1] if r['note'] else None,
        'ingredients': [{'n': n, 't': ta, 'q': q, 'u': u} for (n, ta, q, u) in r['ingredients']],
        'steps': [{'e': e, 't': ta} for (e, ta) in r['steps']],
    })
blob = json.dumps(payload, ensure_ascii=False, indent=0)
assert '$json$' not in blob

SCHEMA = """-- HomeFood · 0011: recipes (ingredients scaled to who is eating, steps, cook mode)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- A recipe belongs to a dish. household_id null = the standard recipe everyone sees; a household can keep its own
-- version later (Admin only) — the tables and rules already allow it, the "Edit our version" screen is not built yet.
-- Quantities are for `servings` people; the app scales them. A quantity is null only for "to taste" / "as needed".
-- The standard recipes below are drafts (written by Claude): the family should check them before relying on them.

create table public.recipes (
  id           uuid primary key default gen_random_uuid(),
  dish_id      uuid not null references public.dishes (id) on delete cascade,
  household_id uuid references public.households (id) on delete cascade,   -- null = standard recipe
  servings     smallint not null check (servings between 1 and 50),
  prep_minutes smallint check (prep_minutes between 0 and 600),
  cook_minutes smallint check (cook_minutes between 0 and 600),
  credit       text,
  note         text,
  note_ta      text,
  created_at   timestamptz not null default now()
);
create unique index recipes_standard_uidx  on public.recipes (dish_id) where household_id is null;
create unique index recipes_household_uidx on public.recipes (dish_id, household_id) where household_id is not null;

create table public.recipe_ingredients (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position  smallint not null,
  name      text not null check (char_length(btrim(name)) between 1 and 80),
  name_ta   text,
  quantity  numeric(9, 3) check (quantity > 0),
  unit      text not null check (unit in ('cup','tbsp','tsp','g','ml','kg','piece','sprig','pinch','clove','inch','bunch','handful','slice','to_taste','as_needed')),
  primary key (recipe_id, position),
  check ((unit in ('to_taste', 'as_needed')) = (quantity is null))
);

create table public.recipe_steps (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position  smallint not null,
  body      text not null check (char_length(btrim(body)) between 1 and 600),
  body_ta   text,
  primary key (recipe_id, position)
);

alter table public.recipes            enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps       enable row level security;

create policy recipes_read on public.recipes for select to authenticated
  using (household_id is null or household_id = public.my_household_id());
create policy recipes_write on public.recipes for all to authenticated
  using (household_id = public.my_household_id() and public.is_admin())
  with check (household_id = public.my_household_id() and public.is_admin());

create policy recipe_ingredients_read on public.recipe_ingredients for select to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.household_id is null or r.household_id = public.my_household_id())));
create policy recipe_ingredients_write on public.recipe_ingredients for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()));

create policy recipe_steps_read on public.recipe_steps for select to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.household_id is null or r.household_id = public.my_household_id())));
create policy recipe_steps_write on public.recipe_steps for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()));

grant select, insert, update, delete on public.recipes, public.recipe_ingredients, public.recipe_steps to authenticated;

-- ── Standard recipes (%d dishes). Skips any dish that already has a standard recipe, so it is safe to run twice. ──
with src as (
  select * from jsonb_to_recordset($json$
%s
$json$::jsonb) as x(dish text, servings int, prep int, cook int, note text, note_ta text, ingredients jsonb, steps jsonb)
),
r as (
  insert into public.recipes (dish_id, servings, prep_minutes, cook_minutes, credit, note, note_ta)
  select d.id, s.servings, s.prep, s.cook, 'Standard recipe drafted by Claude. Check the ingredients and seasoning before cooking.', s.note, s.note_ta
  from src s
  join public.dishes d on d.household_id is null and d.name = s.dish
  where not exists (select 1 from public.recipes r0 where r0.dish_id = d.id and r0.household_id is null)
  returning id, dish_id
),
ing as (
  insert into public.recipe_ingredients (recipe_id, position, name, name_ta, quantity, unit)
  select r.id, e.ord::smallint, e.item->>'n', e.item->>'t', (e.item->>'q')::numeric, e.item->>'u'
  from r
  join public.dishes d on d.id = r.dish_id
  join src s on s.dish = d.name
  cross join lateral jsonb_array_elements(s.ingredients) with ordinality as e(item, ord)
  returning recipe_id
),
stp as (
  insert into public.recipe_steps (recipe_id, position, body, body_ta)
  select r.id, e.ord::smallint, e.item->>'e', e.item->>'t'
  from r
  join public.dishes d on d.id = r.dish_id
  join src s on s.dish = d.name
  cross join lateral jsonb_array_elements(s.steps) with ordinality as e(item, ord)
  returning recipe_id
)
select (select count(*) from r) as recipes_inserted,
       (select count(*) from ing) as ingredients_inserted,
       (select count(*) from stp) as steps_inserted;
"""

out = root / 'supabase/migrations/0011_recipes.sql'
out.write_text(SCHEMA % (len(R), blob), encoding='utf-8', newline='\n')
print(len(R), 'recipes,', sum(len(r['ingredients']) for r in R), 'ingredients,', sum(len(r['steps']) for r in R), 'steps')
