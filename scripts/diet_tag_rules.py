"""The rules that turn a recipe's ingredients and a dish's nutrition estimate into diet tags (used by gen-diet-tags.py).
Everything here is a plain, readable rule so the family can see why a dish got a tag; a home can correct any tag on Dish detail.

Tags written to the shared dishes (dishes.tags):
  From nutrition (one serving, the estimate in dish_nutrition):
    low_carb      carbs 15 g or less
    high_protein  protein 15 g or more, or protein gives a quarter of the calories (and is at least 8 g)
    light         150 kcal or less
    low_oil       fat 5 g or less and not fried
    low_sugar     sugar 3 g or less and not sweet
  From the ingredients:
    millet        ragi, kambu, thinai, varagu, samai, kuthiraivali, bajra, jowar, cholam or "millet"
    fasting_food  vegetarian, no onion or garlic, no cereal grain (rice, wheat, rava, maida, bread, noodles, oats, millet...) and no pulse (sundal is allowed), not fried (sabudana, buckwheat and the like are allowed)
  Flags (what a dish contains or is; the app's gentle notes and the diet plans read these). A pinch, a teaspoon or up to 2 tablespoons of an
  ingredient is a seasoning or tempering and does not count for grain, pulse, sugar or root vegetable:
    onion_garlic  onion, shallot, garlic or spring onion
    salty         600 mg sodium or more per serving
    oily          12 g fat or more per serving, or fried
    sweet         12 g sugar or more per serving, or already tagged sweet
    grain         rice, wheat, atta, maida, rava, poha, oats, bread, noodles, pasta, millets...
    pulse         dals, lentils, chana, rajma, moong, urad, soya, besan...
    dairy         milk, curd, ghee, butter, paneer, cheese, cream...   (coconut milk is not dairy)
    added_sugar   sugar, jaggery, honey, syrup, chocolate
    meat          chicken, mutton, fish, prawn, egg is separate
    egg           egg
    root_veg      potato, carrot, beetroot, radish, turnip, yam, colocasia, tapioca, sweet potato (not onion, garlic, ginger or turmeric)
"""
import glob
import importlib.util
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from nutrition_data import N  # noqa: E402
from south_indian_data import rows as south_rows  # noqa: E402

root = pathlib.Path(__file__).parent.parent

# ── ingredient word lists (matched as whole words after the phrases in STRIP are removed) ──
STRIP = ['coconut milk', 'almond milk', 'soy milk', 'peanut butter', 'butter beans', 'butter bean', 'butternut', 'rice bran oil', 'cocoa butter', 'milk chocolate', 'curd chilli', 'coconut cream', 'ice cream', 'onion seeds', 'onion seed', 'kalonji']
WORDS = {
    'grain': ['rice', 'wheat', 'atta', 'maida', 'rava', 'semolina', 'suji', 'sooji', 'poha', 'aval', 'oats', 'bread', 'noodles', 'pasta', 'vermicelli', 'semiya', 'bun', 'pav', 'tortilla', 'roti', 'chapati', 'parotta', 'naan', 'cornflour', 'corn flour', 'ragi', 'kambu', 'bajra', 'jowar', 'cholam', 'thinai', 'varagu', 'samai', 'kuthiraivali', 'millet', 'barley', 'quinoa', 'murmura', 'puffed rice', 'idli batter', 'dosa batter', 'flour'],
    'pulse': ['dal', 'lentil', 'lentils', 'chana', 'channa', 'chickpea', 'chickpeas', 'kabuli', 'rajma', 'kidney bean', 'kidney beans', 'moong', 'urad', 'toor', 'tuvar', 'masoor', 'horse gram', 'kollu', 'black gram', 'green gram', 'gram', 'besan', 'soya', 'soy', 'tofu', 'cowpea', 'lobia', 'black eyed', 'sundal', 'idli batter', 'dosa batter', 'pesarattu', 'sprouts', 'mochai', 'avarai', 'thattai payaru', 'payaru', 'paruppu'],
    'dairy': ['milk', 'curd', 'yogurt', 'yoghurt', 'dahi', 'ghee', 'butter', 'paneer', 'cheese', 'cream', 'khoa', 'khoya', 'mawa', 'buttermilk', 'lassi', 'condensed milk', 'milk powder', 'whey', 'mor'],
    'added_sugar': ['sugar', 'jaggery', 'honey', 'syrup', 'chocolate', 'karupatti', 'sarkarai', 'vellam', 'candy', 'icing'],
    'meat': ['chicken', 'mutton', 'lamb', 'beef', 'pork', 'fish', 'prawn', 'prawns', 'shrimp', 'crab', 'squid', 'meat', 'keema', 'bacon', 'ham', 'sausage', 'salmon', 'tuna', 'anchovy', 'sardine', 'mackerel', 'seer', 'vanjaram', 'karuvadu', 'nethili', 'liver', 'bone'],
    'egg': ['egg', 'eggs'],
    'root_veg': ['potato', 'potatoes', 'carrot', 'beetroot', 'radish', 'turnip', 'yam', 'colocasia', 'arbi', 'taro', 'tapioca', 'cassava', 'suran', 'seppankizhangu', 'kizhangu', 'sweet potato', 'sweet potatoes', 'urulai'],
    'onion_garlic': ['onion', 'onions', 'shallot', 'shallots', 'garlic', 'spring onion', 'sambar onion', 'poondu', 'vengayam', 'chinna vengayam'],
    'millet': ['ragi', 'kambu', 'thinai', 'varagu', 'samai', 'kuthiraivali', 'bajra', 'jowar', 'cholam', 'millet', 'foxtail', 'pearl millet', 'finger millet'],
}
# whole-grain words that mean "a cereal" for the fasting-food rule (a stricter list than WORDS['grain']: no 'flour' words that may be besan)
CEREAL = {'rice', 'wheat', 'atta', 'maida', 'rava', 'semolina', 'suji', 'sooji', 'poha', 'aval', 'oats', 'bread', 'noodles', 'pasta', 'vermicelli', 'semiya', 'bun', 'pav', 'tortilla', 'roti', 'chapati', 'parotta', 'naan', 'cornflour', 'ragi', 'kambu', 'bajra', 'jowar', 'cholam', 'thinai', 'varagu', 'samai', 'kuthiraivali', 'millet', 'barley', 'quinoa', 'murmura'}
FASTING_OK = {'sabudana', 'sago', 'javvarisi', 'kuttu', 'buckwheat', 'singhara', 'rajgira', 'amaranth', 'samak'}


def is_small(qty, unit):
    if unit in ('to_taste', 'as_needed', 'tsp', 'pinch'):
        return True
    try:
        return unit == 'tbsp' and float(qty) <= 2
    except ValueError:
        return False


def tokens(text):
    t = text.lower()
    for s in STRIP:
        t = t.replace(s, ' ')
    return t


def has_word(text, words):
    t = tokens(text)
    return any(re.search(r'(?<![a-z])' + re.escape(w) + r'(?![a-z])', t) for w in words)


# ── load: every shared dish with its nutrition, its ingredient names and the tags it already has ──
def load():
    dishes = {}
    for name, serving, kcal, protein, carbs, fat, fibre, sugar, sodium in N:
        dishes[name] = dict(name=name, kcal=kcal, protein=protein, carbs=carbs, fat=fat, fibre=fibre, sugar=sugar, sodium=sodium, tags=[], ingredients=[])
    for r in south_rows():
        dishes[r['name']] = dict(name=r['name'], kcal=r['kcal'], protein=r['protein'], carbs=r['carbs'], fat=r['fat'], fibre=r['fibre'], sugar=r['sugar'], sodium=r['sodium'], tags=[t for t in r['tags'].split(',') if t], ingredients=[])

    current = None
    for f in sorted(glob.glob(str(root / 'scripts/recipes_*.txt'))):
        for line in open(f, encoding='utf-8'):
            if line.startswith('@ '):
                current = line[2:].split('|')[0].strip()
            elif line.startswith('i:') and current in dishes:
                parts = [x.strip() for x in line[2:].split('|')]
                dishes[current]['ingredients'].append((parts[0], parts[2], parts[3] if len(parts) > 3 else ''))
    spec = importlib.util.spec_from_file_location('recipes_data', root / 'scripts/recipes_data.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for rec in mod.R:
        if rec['dish'] in dishes:
            dishes[rec['dish']]['ingredients'] += [(ing[0], '' if ing[2] is None else str(ing[2]), ing[3]) for ing in rec['ingredients']]
    return dishes


def rule_tags(d):
    """The tags this dish earns, in a fixed order, with the reason for each (for the report)."""
    ing = d['ingredients']
    joined = ' ; '.join(i[0] for i in ing)
    # a pinch, a teaspoon or up to 2 tablespoons is a seasoning or a tempering, not what the dish is made of: it does not count for
    # grain, pulse, sugar or root vegetable (meat, egg, onion and garlic, dairy and millet count in any amount)
    main = ' ; '.join(name for name, qty, unit in ing if not is_small(qty, unit))
    has = {}
    for k, w in WORDS.items():
        has[k] = has_word(joined if k in ('dairy', 'meat', 'egg', 'onion_garlic', 'millet') else main, w)
    # "ghee or oil", "ghee / oil": ghee is optional there, not a dairy ingredient
    if has['dairy'] and all(re.search(r'\bor\b|/', i[0].lower()) and 'ghee' in i[0].lower() for i in ing if has_word(i[0], WORDS['dairy'])):
        has['dairy'] = False
    out = []
    why = {}

    def add(tag, reason):
        out.append(tag)
        why[tag] = reason

    if d['carbs'] <= 15:
        add('low_carb', 'carbs %g g' % d['carbs'])
    if d['protein'] >= 15 or (d['protein'] >= 8 and d['kcal'] > 0 and d['protein'] * 4 / d['kcal'] >= 0.25):
        add('high_protein', 'protein %g g of %g kcal' % (d['protein'], d['kcal']))
    if d['kcal'] <= 150:
        add('light', '%g kcal' % d['kcal'])
    fried = 'fried' in d['tags']
    if d['fat'] <= 5 and not fried:
        add('low_oil', 'fat %g g' % d['fat'])
    sweet = 'sweet' in d['tags']
    if d['sugar'] <= 3 and not sweet:
        add('low_sugar', 'sugar %g g' % d['sugar'])
    if has['millet']:
        add('millet', 'ingredient')
    veg = not has['meat'] and not has['egg']
    cereal = has_word(main, CEREAL) or has_word(joined, ['puri', 'bhatura', 'papad', 'appalam', 'maida', 'bread', 'noodles', 'pasta', 'dosa', 'idli', 'batter'])
    if veg and not has['onion_garlic'] and (not has['pulse'] or 'sundal' in d['name'].lower()) and (not cereal or has_word(joined, FASTING_OK)) and not fried and d['fat'] < 12:
        add('fasting_food', 'vegetarian, no onion or garlic, no cereal or pulse, not fried')
    if has['onion_garlic']:
        add('onion_garlic', 'ingredient')
    if d['sodium'] >= 600:
        add('salty', 'sodium %g mg' % d['sodium'])
    if d['fat'] >= 12 or fried:
        add('oily', 'fat %g g%s' % (d['fat'], ', fried' if fried else ''))
    if d['sugar'] >= 12 or sweet:
        add('sweet', 'sugar %g g%s' % (d['sugar'], ', sweet' if sweet else ''))
    for k, tag in (('grain', 'grain'), ('pulse', 'pulse'), ('dairy', 'dairy'), ('added_sugar', 'added_sugar'), ('meat', 'meat'), ('egg', 'egg'), ('root_veg', 'root_veg')):
        if has[k]:
            add(tag, 'ingredient')
    return out, why


# Corrections to the shared catalogue found by the scenario tests (src/lib/scenarios.catalogue.test.ts), written to migration 0045.
# 0040 is applied and is never regenerated, so these are kept apart from the rules above.
CATALOGUE_FIXES = {
    # a breakfast of boiled eggs is a meal on its own (like Omelette, which is already "both"), so it must show in the main-dish list too
    'Boiled egg': {'course': 'both'},
    # a vegetarian dish is never tagged meat (the filling is "tuna, pickled plum or vegetables": the vegetable filling is the veg dish)
    'Onigiri': {'tags_remove': ['meat']},
    # egg noodles: the dish is an egg dish and carries the egg allergen, so it also needs the egg tag the vegan plan reads
    'Yakisoba': {'tags_add': ['egg']},
}


def apply_fixes(name, course, tags):
    """The course and tags of a shared dish after the corrections above."""
    fix = CATALOGUE_FIXES.get(name, {})
    tags = [t for t in tags if t not in fix.get('tags_remove', [])] + [t for t in fix.get('tags_add', []) if t not in tags]
    return fix.get('course', course), tags
