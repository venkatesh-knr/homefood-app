"""Writes supabase/migrations/0020_tamil_wording_fixes.sql: Tamil wording fixes that came after 0011/0016/0017/0015 were already run.
It compares the recipe text in the applied migrations with the current source files (recipes_data.py, recipes_south_*.txt,
recipes_more_*.txt) and writes an UPDATE only for Tamil text that differs, plus a short list of dish-name fixes below.
Never regenerate 0011 / 0016 / 0017 themselves: they are applied. Run from the repo root:  python scripts/gen-tamil-fixes.py
"""
import glob
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from recipes_data import R as OLD_PY  # noqa: E402

root = pathlib.Path(__file__).parent.parent

# dish name (English) -> (old Tamil name, new Tamil name); sandhi fixes
NAME_FIXES = {
    'Onion pakoda': ('வெங்காய பக்கோடா', 'வெங்காயப் பக்கோடா'),
    'Onion chutney': ('வெங்காய சட்னி', 'வெங்காயச் சட்னி'),
    'Onion pachadi': ('வெங்காய பச்சடி', 'வெங்காயப் பச்சடி'),
}


def applied(migration):
    text = (root / 'supabase/migrations' / migration).read_text(encoding='utf-8')
    m = re.search(r'\$json\$\n(.*?)\n\$json\$', text, re.S)
    return {r['dish']: r for r in json.loads(m.group(1))}


old = {}
for f in ('0011_recipes.sql', '0016_south_indian_recipes.sql', '0017_more_recipes.sql'):
    old.update(applied(f))

new = {}
for r in OLD_PY:
    new[r['dish']] = dict(note_ta=r['note'][1] if r['note'] else None, ingredients=[{'t': t} for (_, t, _, _) in r['ingredients']], steps=[{'t': t} for (_, t) in r['steps']])
for f in sorted(glob.glob(str(root / 'scripts/recipes_south_?.txt'))) + sorted(glob.glob(str(root / 'scripts/recipes_more_?.txt'))):
    cur = None
    for line in pathlib.Path(f).read_text(encoding='utf-8').splitlines():
        if line.startswith('@ '):
            cur = new.setdefault(line[2:].split('|')[0].strip(), dict(note_ta=None, ingredients=[], steps=[]))
        elif line.startswith('note:'):
            cur['note_ta'] = line.split('|', 1)[1].strip()
        elif line.startswith('i:'):
            cur['ingredients'].append({'t': [p.strip() for p in line[2:].split('|')][1]})
        elif line.startswith('s:'):
            cur['steps'].append({'t': line.split('|', 1)[1].strip()})

fixes = []
for dish, o in old.items():
    n = new[dish]
    assert len(o['ingredients']) == len(n['ingredients']) and len(o['steps']) == len(n['steps']), dish
    if (o.get('note_ta') or None) != n['note_ta']:
        fixes.append(dict(dish=dish, kind='note', pos=1, ta=n['note_ta']))
    for i, (a, b) in enumerate(zip(o['ingredients'], n['ingredients']), 1):
        if a['t'] != b['t']:
            fixes.append(dict(dish=dish, kind='ing', pos=i, ta=b['t']))
    for i, (a, b) in enumerate(zip(o['steps'], n['steps']), 1):
        if a['t'] != b['t']:
            fixes.append(dict(dish=dish, kind='step', pos=i, ta=b['t']))

blob = json.dumps(fixes, ensure_ascii=False, indent=0)
assert '$json$' not in blob
names = ',\n'.join("    ('%s', '%s', '%s')" % (d, a, b) for d, (a, b) in NAME_FIXES.items())

SQL = f"""-- HomeFood · 0020: Tamil wording fixes after a proofreading pass
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice (it only sets the corrected text).
-- 1. Three dish names get the missing sandhi (வெங்காயப் பக்கோடா, வெங்காயச் சட்னி, வெங்காயப் பச்சடி).
-- 2. {len(fixes)} recipe ingredient names are made consistent across all recipes (one Tamil word for the same ingredient, and
--    "ghee or oil" now says both). Quantities, units and English text are untouched.

update public.dish_names n
set name = f.new_name
from (values
{names}
) as f(dish, old_name, new_name)
join public.dishes d on d.household_id is null and d.name = f.dish
where n.dish_id = d.id and n.language = 'ta' and n.name = f.old_name;

with fixes as (
  select * from jsonb_to_recordset($json$
{blob}
$json$::jsonb) as x(dish text, kind text, pos int, ta text)
),
rec as (
  select f.*, r.id as recipe_id
  from fixes f
  join public.dishes d on d.household_id is null and d.name = f.dish
  join public.recipes r on r.dish_id = d.id and r.household_id is null
),
ing as (
  update public.recipe_ingredients i set name_ta = x.ta
  from rec x where x.kind = 'ing' and i.recipe_id = x.recipe_id and i.position = x.pos
  returning 1
),
stp as (
  update public.recipe_steps s set body_ta = x.ta
  from rec x where x.kind = 'step' and s.recipe_id = x.recipe_id and s.position = x.pos
  returning 1
),
nte as (
  update public.recipes r set note_ta = x.ta
  from rec x where x.kind = 'note' and r.id = x.recipe_id
  returning 1
)
select (select count(*) from ing) as ingredients_fixed, (select count(*) from stp) as steps_fixed, (select count(*) from nte) as notes_fixed;
"""
(root / 'supabase/migrations/0020_tamil_wording_fixes.sql').write_text(SQL, encoding='utf-8', newline='\n')
print(len(fixes), 'recipe text fixes;', {k: sum(1 for f in fixes if f['kind'] == k) for k in ('ing', 'step', 'note')})
