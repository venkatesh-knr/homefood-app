"""Writes src/demo/catalogue.json: the slice of the shared catalogue the demo home uses (dishes with English + Tamil names,
nutrition, recipes, bundled photos, the five cuisines and the daily nutrition targets). Everything comes from the same
source files as the migrations, so the demo shows real dishes.
Run from the repo root:  python -X utf8 scripts/gen-demo-catalogue.py
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from south_indian_data import rows as south_rows  # noqa: E402
from nutrition_data import N  # noqa: E402
from recipes_data import R as RECIPES_0011  # noqa: E402
from common_foods_data import rows as common_food_rows  # noqa: E402

root = pathlib.Path(__file__).parent.parent
SI = '00000000-0000-4000-8000-000000000002'

PICKS = """
Idli, Dosa, Ven Pongal, Upma, Masala dosa, Uttapam, Puttu, Appam, Poori, Pesarattu, Rava dosa, Poha, Aloo paratha, Idiyappam with stew,
Kuzhi paniyaram, Adai, Egg dosa, Rava idli, Sambar vada, Medu vada, Boiled egg, Omelette, Egg bhurji,
Curd rice, Lemon rice, Tomato rice, Sambar rice, Tamarind rice, Coconut rice, Bisi bele bath, Vegetable biryani, Chicken biryani, Chicken curry,
Fish curry, Egg curry, Dal tadka, Rajma masala, Khichdi, Kara kuzhambu, Vatha kuzhambu, Mor kuzhambu, Chapati, Parotta, Kothu parotta, Phulka,
Paneer butter masala, Palak paneer, Chole, Butter chicken, Pav bhaji, Veg kurma, Dhokla, Vegetable pulao,
Sambar, Rasam, Lemon rasam, Coconut chutney, Tomato chutney, Mint chutney, Peanut chutney, Idli podi, Beans poriyal, Cabbage poriyal, Carrot poriyal,
Beetroot poriyal, Potato roast, Vendakkai fry, Keerai masiyal, Cabbage kootu, Pumpkin kootu, Avial, Appalam, Curd, Buttermilk, Boondi raita,
Cucumber raita, Mango pickle, Egg podimas, Jeera rice, Kachumber salad,
Sundal, Murukku, Mirchi bajji, Samosa, Banana chips, Aloo bonda, Kozhukattai, Paruppu vadai, Masala chai, Filter coffee, Bhel puri,
Gulab jamun, Kheer, Rava kesari, Semiya payasam, Sweet lassi,
Margherita pizza, Pasta aglio e olio, Chicken teriyaki, Miso soup, Vegetable soup, Grilled cheese sandwich, French fries
"""
picks = [p.strip() for p in PICKS.replace('\n', ' ').split(',') if p.strip()]
assert len(picks) == len(set(picks)), [p for p in picks if picks.count(p) > 1]

# ── dishes ──
rx = re.compile(r"\('([0-9a-f-]{36})'(?:::uuid)?, '((?:[^']|'')*)'(?:::text)?, '((?:[^']|'')*)'(?:::text)?, '\{([^}]*)\}'(?:::[\w.\[\]]+)?, '(\w+)'(?:::[\w.]+)?, '(\w+)'(?:::[\w.]+)?, '\{([^}]*)\}'(?:::[\w.\[\]]+)?, '\{([^}]*)\}'(?:::[\w.\[\]]+)?, (\d+)")
catalogue = {}
for f in ('0005_seed_dishes.sql', '0009_more_indian_dishes.sql'):
    for cu, name, ta, meals, course, diet, tags, allergens, prep in rx.findall((root / 'supabase/migrations' / f).read_text(encoding='utf-8')):
        catalogue[name.replace("''", "'")] = dict(name=name.replace("''", "'"), ta=ta, cuisine_id=cu, meal_types=[m for m in meals.split(',') if m], course=course, diet=diet,
                                                   tags=[t for t in tags.split(',') if t], allergens=[a for a in allergens.split(',') if a], prep_minutes=int(prep))
for r in south_rows():
    catalogue[r['name']] = dict(name=r['name'], ta=r['ta'] if 'ta' in r else r.get('name_ta', ''), cuisine_id=SI, meal_types=r['meals'].split(','), course=r['course'], diet=r['diet'],
                                tags=[t for t in r['tags'].split(',') if t], allergens=[a for a in r['allergens'].split(',') if a], prep_minutes=r['prep'])
# tag "vegetable" (migration 0024) on the shared dishes in scripts/vegetable-dishes.txt, as the app's balance banner expects
vegetable = {l.strip() for l in (root / 'scripts/vegetable-dishes.txt').read_text(encoding='utf-8').splitlines() if l.strip() and not l.startswith('#')}
for name in vegetable:
    if name in catalogue and 'vegetable' not in catalogue[name]['tags']:
        catalogue[name]['tags'].append('vegetable')
# diet tags (migration 0040), worked out by the same rules as the migration
import diet_tag_rules  # noqa: E402
_rule_dishes = diet_tag_rules.load()
for name, c in catalogue.items():
    if name in _rule_dishes:
        for tag in diet_tag_rules.rule_tags(_rule_dishes[name])[0]:
            if tag not in c['tags']:
                c['tags'].append(tag)
for name, c in catalogue.items():
    c['course'], c['tags'] = diet_tag_rules.apply_fixes(name, c['course'], c['tags'])
missing = [p for p in picks if p not in catalogue]
assert not missing, 'not in the catalogue: %s' % missing

# ── photos, nutrition, recipes ──
photos = {}
for f in ('dish-photos.json', 'south-indian-photos.json'):
    for p in json.loads((root / 'scripts' / f).read_text(encoding='utf-8')):
        photos[p['dish']] = p
# photos replaced by a later migration (0036 and on): scripts/photo-replacements.json, newest wins
for p in json.loads((root / 'scripts' / 'photo-replacements.json').read_text(encoding='utf-8')):
    photos[p['dish']] = p
nutrition = {r[0]: r for r in N}
for r in south_rows():
    nutrition[r['name']] = (r['name'], r['serving'], r['kcal'], r['protein'], r['carbs'], r['fat'], r['fibre'], r['sugar'], r['sodium'])

recipes = {}
for r in RECIPES_0011:
    recipes[r['dish']] = dict(servings=r['servings'], prep=r['prep'], cook=r['cook'], note=(r['note'] or [None, None])[0] if r.get('note') else None,
                              note_ta=(r['note'] or [None, None])[1] if r.get('note') else None,
                              ingredients=[dict(n=i[0], t=i[1], q=i[2], u=i[3]) for i in r['ingredients']], steps=[dict(e=s[0], t=s[1]) for s in r['steps']])
UNIT_OK = True
for part in ['recipes_south_a', 'recipes_south_b', 'recipes_south_c', 'recipes_south_d', 'recipes_more_a', 'recipes_more_b']:
    cur = None
    for line in (root / 'scripts' / (part + '.txt')).read_text(encoding='utf-8').splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        if line.startswith('@ '):
            name, servings, prep, cook = [p.strip() for p in line[2:].split('|')]
            cur = dict(servings=int(servings), prep=int(prep), cook=int(cook), note=None, note_ta=None, ingredients=[], steps=[])
            recipes[name] = cur
        elif line.startswith('note:'):
            cur['note'], cur['note_ta'] = [p.strip() for p in line[5:].split('|')]
        elif line.startswith('i:'):
            n, t, q, u = [p.strip() for p in line[2:].split('|')]
            cur['ingredients'].append(dict(n=n, t=t, q=None if u in ('to_taste', 'as_needed') else float(q), u=u))
        elif line.startswith('s:'):
            e, t = [p.strip() for p in line[2:].split('|')]
            cur['steps'].append(dict(e=e, t=t))

out_dishes, out_nutrition, out_recipes = [], [], []
for name in picks:
    d = catalogue[name]
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    did = 'dish-' + slug
    p = photos.get(name)
    out_dishes.append(dict(id=did, name=name, ta=d['ta'], cuisine_id=d['cuisine_id'], meal_types=d['meal_types'], course=d['course'], diet=d['diet'], tags=d['tags'],
                           allergens=d['allergens'], prep_minutes=d['prep_minutes'], photo=('static/' + p['file']) if p else None, credit=p['credit'] if p else None))
    n = nutrition.get(name)
    assert n, 'no nutrition for %s' % name
    out_nutrition.append(dict(dish_id=did, serving=n[1], kcal=n[2], protein_g=n[3], carbs_g=n[4], fat_g=n[5], fibre_g=n[6], sugar_g=n[7], sodium_mg=n[8]))
    rc = recipes.get(name)
    assert rc, 'no recipe for %s' % name
    out_recipes.append(dict(dish_id=did, **rc))

cuisines = [
    dict(id='00000000-0000-4000-8000-000000000001', parent_id=None, name='Indian', name_ta='இந்திய', sort_order=10),
    dict(id=SI, parent_id='00000000-0000-4000-8000-000000000001', name='South Indian', name_ta='தென்னிந்திய', sort_order=11),
    dict(id='00000000-0000-4000-8000-000000000003', parent_id='00000000-0000-4000-8000-000000000001', name='North Indian', name_ta='வட இந்திய', sort_order=12),
    dict(id='00000000-0000-4000-8000-000000000004', parent_id=None, name='European', name_ta='ஐரோப்பிய', sort_order=20),
    dict(id='00000000-0000-4000-8000-000000000005', parent_id=None, name='Japanese', name_ta='ஜப்பானிய', sort_order=30),
]

# Daily targets: same figures as gen-nutrition.py (ICMR-NIN 2020, rounded).
ENERGY = {
    'child': {'male': (1700, 2000, 2220), 'female': (1600, 1900, 2060)},
    'teen': {'male': (2500, 2860, 3300), 'female': (2100, 2400, 2600)},
    'adult': {'male': (2320, 2730, 3490), 'female': (1900, 2230, 2850)},
    'senior': {'male': (2000, 2350, 3000), 'female': (1650, 1950, 2450)},
}
PROTEIN = {'child': {'male': 35, 'female': 37}, 'teen': {'male': 58, 'female': 53}, 'adult': {'male': 54, 'female': 46}, 'senior': {'male': 54, 'female': 46}}
FIBRE = {'child': 20, 'teen': 25, 'adult': 30, 'senior': 30}
SODIUM = {'child': 1500, 'teen': 2000, 'adult': 2000, 'senior': 2000}
targets = []
for band, bysex in ENERGY.items():
    for sex, levels in bysex.items():
        for activity, kcal in zip(('light', 'moderate', 'active'), levels):
            targets.append(dict(age_band=band, sex=sex, activity=activity, kcal=kcal, protein_g=PROTEIN[band][sex], carbs_g=round(kcal * 0.55 / 4), fat_g=round(kcal * 0.25 / 9),
                                fibre_g=FIBRE[band], sodium_mg=SODIUM[band], sugar_g=round(kcal * 0.10 / 4), source='Rounded from ICMR-NIN 2020, Nutrient Requirements for Indians.'))

common_foods = [dict(id='food-' + re.sub(r'[^a-z0-9]+', '-', r['name_en'].lower()).strip('-'), name_en=r['name_en'], name_ta=r['name_ta'], category=r['category'], unit=r['unit'],
                     grams_per_unit=r['grams'], default_quantity=r['usual'], kcal=r['kcal'], protein_g=r['protein'], carbs_g=r['carbs'], fat_g=r['fat'], fibre_g=r['fibre'],
                     sugar_g=r['sugar'], sodium_mg=r['sodium'], source='IFCT 2017 and USDA FoodData Central, rounded; an estimate.') for r in common_food_rows()]

dest = root / 'src/demo/catalogue.json'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(dict(cuisines=cuisines, dishes=out_dishes, nutrition=out_nutrition, recipes=out_recipes, targets=targets, commonFoods=common_foods), ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('%d dishes (%d with photos), %d recipes, %d bytes' % (len(out_dishes), sum(1 for d in out_dishes if d['photo']), len(out_recipes), dest.stat().st_size))

# every shared dish (names, meals, course, diet, tags), for the unit tests that walk the whole catalogue: src/lib/fixtures/allDishes.json
fixture = root / 'src/lib/fixtures/allDishes.json'
fixture.parent.mkdir(parents=True, exist_ok=True)
fixture.write_text(json.dumps([dict(name=c['name'], ta=c['ta'], meal_types=c['meal_types'], course=c['course'], diet=c['diet'], tags=c['tags'], allergens=c['allergens']) for c in catalogue.values()], ensure_ascii=False, indent=0), encoding='utf-8')
print('%d dishes written for the tests' % len(catalogue))
