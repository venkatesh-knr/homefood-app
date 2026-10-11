"""Writes supabase/migrations/0030_common_foods.sql from scripts/common_foods_data.py (the shared everyday-foods list for "My extras").
Run from the repo root:  python -X utf8 scripts/gen-common-foods.py
Checks every food: valid unit and category, a Tamil name, no duplicates, and calories that match the macros (4 / 4 / 9) within 15%.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from common_foods_data import CATEGORIES, UNITS, rows  # noqa: E402

root = pathlib.Path(__file__).parent.parent
R = rows()
names = [r['name_en'] for r in R]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]
for r in R:
    assert r['category'] in CATEGORIES, r['name_en']
    assert r['unit'] in UNITS, r['name_en']
    assert r['name_ta'] and 'supplement' not in r['category'], r['name_en']
    assert 1 <= len(r['name_en']) <= 80 and len(r['name_ta']) <= 80, r['name_en']
    assert r['grams'] > 0 and r['usual'] > 0, r['name_en']
    assert min(r[k] for k in ('kcal', 'protein', 'carbs', 'fat', 'fibre', 'sugar', 'sodium')) >= 0, r['name_en']
    expected = 4 * r['protein'] + 4 * r['carbs'] + 9 * r['fat']
    assert abs(r['kcal'] - expected) <= max(10, 0.15 * r['kcal']), '%s: %s kcal but macros say %.0f' % (r['name_en'], r['kcal'], expected)
    assert r['fibre'] <= r['carbs'] + 0.05 and r['sugar'] <= r['carbs'] + 0.05, '%s: fibre or sugar above carbs' % r['name_en']


def q(s):
    return "'" + s.replace("'", "''") + "'"


def num(x):
    return ('%g' % x)


values = ',\n'.join(
    '  (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
    % (q(r['name_en']), q(r['name_ta']), q(r['category']), q(r['unit']), num(r['grams']), num(r['usual']), num(r['kcal']), num(r['protein']), num(r['carbs']), num(r['fat']), num(r['fibre']), num(r['sugar']), num(r['sodium']))
    for r in R
)
SQL = f"""-- HomeFood · 0030: the shared list of everyday foods for "My extras" ({len(R)} foods)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run (after 0029). Safe to run twice: a food that is already there is skipped.
-- Dairy, eggs, fruit, nuts, pulses, meat and fish, drinks, protein and snacks, each with an English and a Tamil name and per-unit nutrition
-- (one piece, glass, cup, bowl, tbsp, scoop, handful or 100 g). The figures are rounded ESTIMATES for typical Indian servings, written with
-- reference to IFCT 2017 (NIN) and USDA FoodData Central ranges; the app shows them as estimates. Regenerated from scripts/common_foods_data.py.

insert into public.common_foods (name_en, name_ta, category, unit, grams_per_unit, default_quantity, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg)
values
{values}
on conflict (name_en) do nothing;
"""
dest = root / 'supabase/migrations/0030_common_foods.sql'
dest.write_text(SQL, encoding='utf-8', newline='\n')
print(len(R), 'foods ->', dest.name)
