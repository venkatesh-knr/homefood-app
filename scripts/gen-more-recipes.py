"""Writes supabase/migrations/0017_more_recipes.sql: standard recipes (English + Tamil) for the dishes of 0005/0009 that had none after 0011.
Reads scripts/recipes_more_a.txt and b.txt (format described at the top of each file).
Run from the repo root:  python scripts/gen-more-recipes.py
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from recipes_data import R as OLD  # noqa: E402

root = pathlib.Path(__file__).parent.parent
UNITS = {'cup', 'tbsp', 'tsp', 'g', 'ml', 'kg', 'piece', 'sprig', 'pinch', 'clove', 'inch', 'bunch', 'handful', 'slice', 'to_taste', 'as_needed'}
seed_text = ''.join((root / 'supabase/migrations' / f).read_text(encoding='utf-8') for f in ('0005_seed_dishes.sql', '0009_more_indian_dishes.sql'))
all_seeded = [m.group(1) for m in re.finditer(r"\n\s+\('0000[^']*'(?:::uuid)?, '([^']+)'", seed_text)]
have = {r['dish'] for r in OLD}
dish_names = [n for n in all_seeded if n not in have]

recipes = []
cur = None
for part in 'ab':
    path = root / 'scripts' / f'recipes_more_{part}.txt'
    for n, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        where = f'{path.name}:{n}'
        if not line.strip() or line.startswith('#'):
            continue
        if line.startswith('@ '):
            name, servings, prep, cook = [p.strip() for p in line[2:].split('|')]
            cur = dict(dish=name, servings=int(servings), prep=int(prep), cook=int(cook), note=None, note_ta=None, ingredients=[], steps=[], where=where)
            recipes.append(cur)
        elif line.startswith('note:'):
            e, t = [p.strip() for p in line[5:].split('|')]
            cur['note'], cur['note_ta'] = e, t
        elif line.startswith('i:'):
            parts = [p.strip() for p in line[2:].split('|')]
            assert len(parts) == 4, (where, line)
            name, ta, qty, unit = parts
            assert unit in UNITS, (where, unit)
            if unit in ('to_taste', 'as_needed'):
                assert qty == '-', (where, line)
                q = None
            else:
                q = float(qty)
                assert q > 0, (where, line)
            assert 1 <= len(name) <= 80 and ta, (where, line)
            cur['ingredients'].append({'n': name, 't': ta, 'q': q, 'u': unit})
        elif line.startswith('s:'):
            e, t = [p.strip() for p in line[2:].split('|')]
            assert e and t and len(e) <= 600 and len(t) <= 600, (where, len(e), len(t))
            cur['steps'].append({'e': e, 't': t})
        else:
            raise SystemExit(f'cannot read {where}: {line[:60]}')

names = [r['dish'] for r in recipes]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]
unknown = [n for n in names if n not in dish_names]
assert not unknown, 'not a seeded dish without a recipe: %s' % unknown
for r in recipes:
    assert r['ingredients'] and len(r['steps']) >= 1, r['where']
    assert 1 <= r['servings'] <= 50 and 0 <= r['prep'] <= 600 and 0 <= r['cook'] <= 600, r['where']
missing = [n for n in dish_names if n not in names]
if missing:
    print('WARNING - dishes without a recipe (%d): %s' % (len(missing), missing))

payload = [{'dish': r['dish'], 'servings': r['servings'], 'prep': r['prep'], 'cook': r['cook'], 'note': r['note'], 'note_ta': r['note_ta'],
            'ingredients': r['ingredients'], 'steps': r['steps']} for r in recipes]
blob = json.dumps(payload, ensure_ascii=False, indent=0)
assert '$json$' not in blob

SQL = """-- HomeFood · 0017: standard recipes (English + Tamil) for %(n)d earlier dishes (0005 / 0009) that had none
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Same shape as the recipes in 0011: quantities are for `servings` people and the app scales them. They are drafts
-- (written by Claude): the family should check ingredients and seasoning before relying on them.
-- Safe to run twice: a dish that already has a standard recipe is skipped.

with src as (
  select * from jsonb_to_recordset($json$
%(blob)s
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
""" % dict(n=len(recipes), blob=blob)

out = root / 'supabase/migrations/0017_more_recipes.sql'
out.write_text(SQL, encoding='utf-8', newline='\n')
print(len(recipes), 'recipes,', sum(len(r['ingredients']) for r in recipes), 'ingredients,', sum(len(r['steps']) for r in recipes), 'steps')
