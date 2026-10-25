"""Writes supabase/migrations/0046_everyday_dishes.sql from scripts/everyday_dishes_data.py.
Run from the repo root:  python -X utf8 scripts/gen-everyday-dishes.py
Adds the dishes (English + Tamil names), their nutrition estimates and their diet tags (worked out by the same rules as migration 0040,
scripts/diet_tag_rules.py). No photos and no recipes yet: a home can add its own photo, and the Recipe button only shows for dishes that have one.
"""
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import diet_tag_rules  # noqa: E402
import everyday_dishes_data  # noqa: E402
from everyday_dishes_data import rows  # noqa: E402
from south_indian_data import rows as south_rows  # noqa: E402

root = pathlib.Path(__file__).parent.parent
R = rows()

# names must be new: not in the earlier seed migrations, and unique here
existing = ''.join((root / 'supabase/migrations' / f).read_text(encoding='utf-8') for f in ('0005_seed_dishes.sql', '0009_more_indian_dishes.sql'))
taken = {r['name'].lower() for r in south_rows()}
names = [r['name'] for r in R]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]
clash = [n for n in names if re.search(r"'%s'" % re.escape(n), existing) or n.lower() in taken]
assert not clash, 'already in the catalogue: %s' % clash

MEALS = {'breakfast', 'lunch', 'snacks', 'dinner'}
for r in R:
    ms = r['meals'].split(',')
    assert ms and set(ms) <= MEALS, r['name']
    assert r['course'] in ('main', 'side', 'both'), r['name']
    assert r['diet'] in ('veg', 'egg', 'non_veg'), r['name']
    assert set(filter(None, r['tags'].split(','))) <= {'steamed', 'fried', 'spicy', 'sweet', 'caffeine'}, r['name']
    assert r['ta'], r['name']
    calc = 4 * r['protein'] + 4 * r['carbs'] + 9 * r['fat']
    assert abs(calc - r['kcal']) <= max(60, 0.25 * r['kcal']), (r['name'], r['kcal'], round(calc))

VEGETABLE = everyday_dishes_data.VEGETABLE
assert VEGETABLE <= set(names), VEGETABLE - set(names)
tags_of = everyday_dishes_data.all_tags


def q(s):
    return "'" + s.replace("'", "''") + "'"


def arr(items):
    return "'{%s}'" % ','.join(items)


lines = []
for i, r in enumerate(R):
    tg = tags_of(r)
    ms = r['meals']
    al = [a for a in r['allergens'].split(',') if a]
    # the diet must agree with the tags (a veg dish is never tagged meat or egg): the scenario tests check the same
    assert (r['diet'] == 'veg') == ('meat' not in tg and 'egg' not in tg), (r['name'], r['diet'], tg)
    if r['diet'] == 'egg':
        assert 'egg' in tg and 'egg' in al, r['name']
    if i == 0:
        cu, nm, ta = "'%s'::uuid" % r['cuisine_id'], q(r['name']) + '::text', q(r['ta']) + '::text'
        m, co, d, tgs, als, pr = arr(ms.split(',')) + '::public.meal_type[]', "'%s'::public.dish_course" % r['course'], "'%s'::public.diet_type" % r['diet'], arr(tg) + '::text[]', arr(al) + '::text[]', '%d::smallint' % r['prep']
    else:
        cu, nm, ta = "'%s'" % r['cuisine_id'], q(r['name']), q(r['ta'])
        m, co, d, tgs, als, pr = arr(ms.split(',')), "'%s'" % r['course'], "'%s'" % r['diet'], arr(tg), arr(al), str(r['prep'])
    lines.append('    (%s, %s, %s, %s, %s, %s, %s, %s, %s)' % (cu, nm, ta, m, co, d, tgs, als, pr))

import json  # noqa: E402

blob = json.dumps([dict(dish=r['name'], serving=r['serving'], kcal=r['kcal'], protein=r['protein'], carbs=r['carbs'], fat=r['fat'], fibre=r['fibre'], sugar=r['sugar'], sodium=r['sodium']) for r in R], ensure_ascii=False, indent=0)
assert '$json$' not in blob

by_meal = {m: sum(1 for r in R if m in r['meals'].split(',')) for m in ('breakfast', 'lunch', 'snacks', 'dinner')}
SQL = """-- HomeFood · 0046: %(n)d everyday dishes the shared catalogue was missing
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice (a name that already exists is skipped).
-- Bread toast, bread omelette, sandwiches, oats, cornflakes, eggs the everyday ways (scrambled, half-boiled, roll, fried rice), fruit, milk, juice, kanji,
-- sevai, fried rice, noodles, rolls, sprouts, corn, soups. Dishes per meal: breakfast %(b)d, lunch %(l)d, snacks %(s)d, dinner %(d)d.
-- Each has an English and a Tamil name, a per-serving nutrition estimate (typical home portion, rounded; not lab values) and diet tags worked out by the
-- same rules as 0040 (scripts/diet_tag_rules.py). No photos and no recipes yet: a home can add its own photo, and the Recipe button shows only for dishes that have a recipe.

with seed(cuisine_id, name, name_ta, meal_types, course, diet, tags, allergens, prep_minutes) as (
  select * from (values
%(values)s
  ) as v(cuisine_id, name, name_ta, meal_types, course, diet, tags, allergens, prep_minutes)
  where not exists (select 1 from public.dishes d where d.household_id is null and d.name = v.name)
),
inserted as (
  insert into public.dishes (household_id, cuisine_id, name, meal_types, course, diet, tags, allergens, prep_minutes)
  select null, cuisine_id, name, meal_types, course, diet, tags, allergens, prep_minutes from seed
  returning id, name
),
names_en as (
  insert into public.dish_names (dish_id, language, name)
  select id, 'en', name from inserted
  returning dish_id
),
names_ta as (
  insert into public.dish_names (dish_id, language, name)
  select i.id, 'ta', s.name_ta from inserted i join seed s using (name)
  returning dish_id
)
select
  (select count(*) from inserted) as dishes_inserted,
  (select count(*) from names_en) as english_names_inserted,
  (select count(*) from names_ta) as tamil_names_inserted;

-- ── Per-serving nutrition estimates ──
insert into public.dish_nutrition (dish_id, serving, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg)
select d.id, x.serving, x.kcal, x.protein, x.carbs, x.fat, x.fibre, x.sugar, x.sodium
from jsonb_to_recordset($json$
%(blob)s
$json$::jsonb) as x(dish text, serving text, kcal numeric, protein numeric, carbs numeric, fat numeric, fibre numeric, sugar numeric, sodium numeric)
join public.dishes d on d.household_id is null and d.name = x.dish
on conflict (dish_id) do nothing;
""" % dict(n=len(R), b=by_meal['breakfast'], l=by_meal['lunch'], s=by_meal['snacks'], d=by_meal['dinner'], values=',\n'.join(lines), blob=blob)

out = root / 'supabase/migrations/0046_everyday_dishes.sql'
out.write_text(SQL, encoding='utf-8', newline='\n')
print(len(R), 'dishes', by_meal)
