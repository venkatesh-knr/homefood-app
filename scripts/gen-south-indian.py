"""Writes supabase/migrations/0015_more_south_indian_dishes.sql from scripts/south_indian_data.py.
Run from the repo root:  python scripts/gen-south-indian.py
Adds the dishes (English + Tamil names), their nutrition estimates and, for the ones that have one, a bundled photo
(scripts/south-indian-photos.json, built by scripts/build-south-indian-photos.py).
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from south_indian_data import rows  # noqa: E402

root = pathlib.Path(__file__).parent.parent
SI = '00000000-0000-4000-8000-000000000002'
R = rows()

# names must be new: not in the earlier seed migrations, and unique here
existing = ''.join((root / 'supabase/migrations' / f).read_text(encoding='utf-8') for f in ('0005_seed_dishes.sql', '0009_more_indian_dishes.sql'))
names = [r['name'] for r in R]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]
clash = [n for n in names if re.search(r"'%s'" % re.escape(n), existing)]
assert not clash, 'already in the catalogue: %s' % clash

MEALS = {'breakfast', 'lunch', 'snacks', 'dinner'}
for r in R:
    ms = r['meals'].split(',')
    assert ms and set(ms) <= MEALS, r['name']
    assert r['course'] in ('main', 'side', 'both'), r['name']
    assert r['diet'] in ('veg', 'egg', 'non_veg'), r['name']
    assert set(filter(None, r['tags'].split(','))) <= {'steamed', 'fried', 'spicy', 'sweet', 'caffeine'}, r['name']
    assert r['name_ta'] and ' ' not in r['name_ta'] or r['name_ta'], r['name']
    calc = 4 * r['protein'] + 4 * r['carbs'] + 9 * r['fat']
    assert abs(calc - r['kcal']) <= max(60, 0.25 * r['kcal']), (r['name'], r['kcal'], round(calc))


PH = json.loads((root / 'scripts/south-indian-photos.json').read_text(encoding='utf-8'))
assert all(m['dish'] in names for m in PH), [m['dish'] for m in PH if m['dish'] not in names]


def q(s):
    return "'" + s.replace("'", "''") + "'"


def arr(s):
    return "'{%s}'" % s


lines = []
for i, r in enumerate(R):
    cu, nm, t = "'%s'" % SI, q(r['name']), q(r['name_ta'])
    if i == 0:  # only the first row needs the casts; Postgres infers the rest of each column from it
        cu += '::uuid'; nm += '::text'; t += '::text'
        m = arr(r['meals']) + '::public.meal_type[]'
        co = "'%s'::public.dish_course" % r['course']
        d = "'%s'::public.diet_type" % r['diet']
        tg = arr(r['tags']) + '::text[]'
        al = arr(r['allergens']) + '::text[]'
        pr = '%d::smallint' % r['prep']
    else:
        m, co, d, tg, al, pr = arr(r['meals']), "'%s'" % r['course'], "'%s'" % r['diet'], arr(r['tags']), arr(r['allergens']), str(r['prep'])
    lines.append('    (%s, %s, %s, %s, %s, %s, %s, %s, %s)' % (cu, nm, t, m, co, d, tg, al, pr))

blob = json.dumps([{k: r[k] for k in ('name', 'serving', 'kcal', 'protein', 'carbs', 'fat', 'fibre', 'sugar', 'sodium')} for r in R], ensure_ascii=False, indent=0)
blob = blob.replace('"name"', '"dish"')
assert '$json$' not in blob

mains = sum(1 for r in R if r['course'] in ('main', 'both'))
sides = len(R) - mains
by_meal = {m: sum(1 for r in R if m in r['meals'].split(',')) for m in ('breakfast', 'lunch', 'snacks', 'dinner')}

SQL = """-- HomeFood · 0015: %(n)d more South Indian dishes (tiffin, rice, kuzhambu, kootu, poriyal, chutney, snacks, sweets, drinks, non-veg)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Adds %(n)d dishes to the shared catalogue under South Indian (%(mains)d mains, %(sides)d sides: poriyal, kootu, chutneys, gravies, pickles,
-- snacks, sweets, drinks). Each has an English and a Tamil name and a per-serving nutrition estimate (same approach as 0012).
-- Dishes per meal: breakfast %(b)d, lunch %(l)d, snacks %(s)d, dinner %(d)d (some dishes suit more than one meal).
-- Safe to run twice: a dish whose name already exists in the shared catalogue is skipped, and nutrition rows are only added once.
-- %(np)d of them have a bundled photo (public/dish-photos/, credits in photo_credit); the rest show the coloured-initial
-- placeholder until a photo is added. A home can always replace a photo with its own.
-- Allergen tags are best-effort (typical recipe); the app tells people to check ingredients.

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

-- ── Per-serving nutrition estimates (typical home recipe and portion, rounded; not lab values) ──
insert into public.dish_nutrition (dish_id, serving, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg)
select d.id, x.serving, x.kcal, x.protein, x.carbs, x.fat, x.fibre, x.sugar, x.sodium
from jsonb_to_recordset($json$
%(blob)s
$json$::jsonb) as x(dish text, serving text, kcal numeric, protein numeric, carbs numeric, fat numeric, fibre numeric, sugar numeric, sodium numeric)
join public.dishes d on d.household_id is null and d.name = x.dish
on conflict (dish_id) do nothing;

-- ── Bundled photos (see 0014): photo_path = 'static/<file>' means public/dish-photos/<file> ──
with photos(dish_name, photo_path, photo_credit) as (
  values
%(photos)s
)
update public.dishes d
set photo_path = p.photo_path,
    photo_credit = p.photo_credit
from photos p
where d.household_id is null
  and d.name = p.dish_name
  and d.photo_path is null;
""" % dict(np=len(PH), photos=',\n'.join("    (%s, %s, %s)" % (q(m['dish']), q('static/' + m['file']), q(m['credit'])) for m in PH), n=len(R), mains=mains, sides=sides, b=by_meal['breakfast'], l=by_meal['lunch'], s=by_meal['snacks'], d=by_meal['dinner'],
           values=',\n'.join(lines), blob=blob)

out = root / 'supabase/migrations/0015_more_south_indian_dishes.sql'
out.write_text(SQL, encoding='utf-8', newline='\n')
print(len(R), 'dishes;', mains, 'mains,', sides, 'sides;', by_meal)
