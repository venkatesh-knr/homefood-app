"""Writes docs/tamil-review.html: every UI string, every dish name, every recipe and every everyday food with English and Tamil side by side,
numbered, with an empty "correction" column. Open it in a browser; it prints well (File > Print > Save as PDF, or on paper).
Run from the repo root:  python -X utf8 scripts/gen-tamil-review.py
It reads the same sources the app and the migrations are built from (src/i18n/en.json + ta.json, the dish seeds, the recipe text files,
scripts/common_foods_data.py), so re-running it after any edit gives an up-to-date kit.
"""
import html
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from common_foods_data import rows as common_food_rows  # noqa: E402
from recipes_data import R as RECIPES_0011  # noqa: E402
from south_indian_data import rows as south_rows  # noqa: E402
from shop_items_data import rows as shop_rows  # noqa: E402
from prep_data import TEXTS as PREP_TEXTS  # noqa: E402

root = pathlib.Path(__file__).parent.parent
esc = html.escape

# ── UI strings ──
en = json.loads((root / 'src/i18n/en.json').read_text(encoding='utf-8'))
ta = json.loads((root / 'src/i18n/ta.json').read_text(encoding='utf-8'))


def flatten(d, prefix=''):
    out = {}
    for k, v in d.items():
        key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, key))
        else:
            out[key] = v
    return out


fen, fta = flatten(en), flatten(ta)
assert fen.keys() == fta.keys(), 'English and Tamil do not have the same keys'

SECTION_TITLES = {
    'app': 'App name', 'language': 'Language switch', 'signIn': 'Sign in', 'welcome': 'Welcome', 'setup': 'Set up your home', 'onboarding': 'First-time setup', 'people': 'People',
    'invite': 'Invite your family', 'join': 'Join from an invite', 'shell': 'Navigation and header', 'install': 'Install the app', 'meal': 'Meal names', 'planner': 'Week planner and meal editor',
    'rota': 'Planner rota', 'today': 'Today', 'attendance': 'Did you eat this?', 'glance': 'Week at a glance', 'dishes': 'Dishes', 'home': 'Home tab and settings', 'discussion': 'Votes, comments and suggestions',
    'recipe': 'Recipe', 'nutrition': 'Nutrition', 'notifications': 'Notifications', 'history': 'Meal history', 'common': 'Common words', 'theme': 'Appearance', 'demo': 'Demo home', 'tips': 'First-visit tips',
    'balance': 'Weekly balance', 'cookAgain': 'Cook this again', 'recipeEdit': 'Edit our recipe', 'outsideNutrition': 'Meals out (nutrition note)', 'cuisines': 'Manage cuisines', 'extras': 'My extras',
    'goals': 'My goals', 'protein': 'Protein card', 'account': 'Your data and account',
    'tour': 'Welcome tour', 'shopping': 'Shopping list', 'prep': 'Prep reminders', 'cook': "Cook's sheet",
}

# ── dishes (names) ──
SI = '00000000-0000-4000-8000-000000000002'
CUISINES = {'1': 'Indian', '2': 'South Indian', '3': 'North Indian', '4': 'European', '5': 'Japanese'}
rx = re.compile(r"\('([0-9a-f-]{36})'(?:::uuid)?, '((?:[^']|'')*)'(?:::text)?, '((?:[^']|'')*)'(?:::text)?")
dishes = {}
for f in ('0005_seed_dishes.sql', '0009_more_indian_dishes.sql'):
    for cu, name, ta_name in rx.findall((root / 'supabase/migrations' / f).read_text(encoding='utf-8')):
        if cu.startswith('00000000-0000-4000-8000-00000000000'):
            dishes[name.replace("''", "'")] = (CUISINES.get(cu[-1], 'Other'), ta_name)
for r in south_rows():
    dishes[r['name']] = ('South Indian', r['name_ta'])
import everyday_dishes_data  # noqa: E402
for r in everyday_dishes_data.rows():  # migration 0046
    dishes[r['name']] = ({'SI': 'South Indian', 'NI': 'North Indian', 'EU': 'European'}[r['cuisine_key']], r['ta'])

# ── recipes ──
recipes = {}
for r in RECIPES_0011:
    note = r.get('note') or (None, None)
    recipes[r['dish']] = dict(servings=r['servings'], prep=r['prep'], cook=r['cook'], note=note[0], note_ta=note[1], ingredients=[dict(n=i[0], t=i[1], q=i[2], u=i[3]) for i in r['ingredients']], steps=[dict(e=s[0], t=s[1]) for s in r['steps']])
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
            cur['ingredients'].append(dict(n=n, t=t, q=None if q == '-' else float(q), u=u))
        elif line.startswith('s:'):
            e, t = [p.strip() for p in line[2:].split('|')]
            cur['steps'].append(dict(e=e, t=t))

# ── build the page ──
parts = []
toc = []
counter = {'n': 0}


def row(ref, left, right, note='', cls=''):
    counter['n'] += 1
    n = counter['n']
    return (f'<tr class="{cls}"><td class="no">{n}<br><span class="ref">{esc(ref)}</span></td><td class="en">{esc(left)}{("<div class=hint>" + esc(note) + "</div>") if note else ""}</td>'
            f'<td class="ta" lang="ta">{esc(right)}</td><td class="fix"></td></tr>')


def section(anchor, title, rows_html, count):
    toc.append((anchor, title, count))
    parts.append(f'<section id="{anchor}"><h2>{esc(title)} <small>({count})</small></h2><table><thead><tr><th class="no">No.</th><th>English</th><th>Tamil (தமிழ்)</th><th class="fixh">Correction (write the Tamil you want)</th></tr></thead><tbody>{"".join(rows_html)}</tbody></table></section>')


# UI strings, grouped by screen
groups = {}
for key in fen:
    groups.setdefault(key.split('.')[0], []).append(key)
ui_total = 0
for g, keys in groups.items():
    rows_html = [row('ui:' + k, fen[k], fta[k]) for k in keys]
    ui_total += len(keys)
    section('ui-' + g, 'Screen text · ' + SECTION_TITLES.get(g, g), rows_html, len(keys))

# dish names, grouped by cuisine
by_cuisine = {}
for name, (cu, t) in sorted(dishes.items()):
    by_cuisine.setdefault(cu, []).append((name, t))
dish_total = 0
for cu in ['South Indian', 'North Indian', 'European', 'Japanese']:
    items = by_cuisine.get(cu, [])
    dish_total += len(items)
    section('dishes-' + cu.lower().replace(' ', '-'), 'Dish names · ' + cu, [row('dish:' + n, n, t) for n, t in items], len(items))

# recipes, grouped by cuisine, one block per dish
recipe_rows_total = 0
for cu in ['South Indian', 'North Indian', 'European', 'Japanese']:
    names = sorted(n for n in recipes if dishes.get(n, ('?',))[0] == cu)
    rows_html = []
    for n in names:
        r = recipes[n]
        rows_html.append(f'<tr class="dish"><td colspan="4">{esc(n)} · <span lang="ta">{esc(dishes[n][1])}</span> <small>serves {r["servings"]} · prep {r["prep"]} min · cook {r["cook"]} min</small></td></tr>')
        if r['note']:
            rows_html.append(row(f'recipe:{n}:note', r['note'], r['note_ta'] or '', 'note'))
        for i, ing in enumerate(r['ingredients'], 1):
            amount = 'to taste / as needed' if ing['q'] is None else f"{ing['q']:g} {ing['u']}"
            rows_html.append(row(f'recipe:{n}:ingredient {i}', ing['n'], ing['t'], amount))
        for i, st in enumerate(r['steps'], 1):
            rows_html.append(row(f'recipe:{n}:step {i}', st['e'], st['t']))
    count = sum(1 for r in rows_html if 'class="dish"' not in r)
    recipe_rows_total += count
    section('recipes-' + cu.lower().replace(' ', '-'), f'Recipes · {cu} ({len(names)} dishes)', rows_html, count)

# everyday foods
foods = common_food_rows()
section('foods', 'Everyday foods (My extras)', [row('food:' + f['name_en'], f['name_en'], f['name_ta'], f"{f['unit']}") for f in foods], len(foods))

# shopping: the common items (names the family will see and type)
shop = shop_rows()
TAB_NAMES = {'vegetables': 'Vegetables', 'fruits': 'Fruits', 'groceries': 'Groceries', 'dairy_eggs': 'Dairy and eggs', 'other': 'Other'}
for tab, title in TAB_NAMES.items():
    items = [s for s in shop if s['tab'] == tab]
    section('shop-' + tab, 'Shopping items · ' + title, [row('shop:' + s['name_en'], s['name_en'], s['name_ta'], 'usual ' + ('%g' % s['usual']) + ' ' + s['unit']) for s in items], len(items))

# prep reminder wording (what to do ahead of cooking)
prep_rows = [row('prep:' + k, en_t, ta_t) for k, (en_t, ta_t) in PREP_TEXTS.items()]
section('prep-texts', 'Prep reminder wording', prep_rows, len(prep_rows))

# words and phrases that live in the code, not on a screen (the cook's sheet message, shopping units)
WORDS = [
    ('cooksheet:eating', 'Eating out', 'வெளியில் சாப்பிடுகிறோம்', "cook's sheet, a meal not cooked at home"),
    ('cooksheet:ordering', 'Ordering in', 'ஆர்டர் செய்கிறோம்', "cook's sheet, a meal ordered in"),
    ('cooksheet:note', 'Note', 'கவனிக்க', "cook's sheet, before the allergy note"),
    ('cooksheet:tonight', 'Tonight', 'இன்றிரவு', "cook's sheet, before tonight's prep"),
    ('cooksheet:people', '5 (people eating)', '5 பேர்', "cook's sheet, after a meal name"),
    ('cooksheet:one-person', '1 person: no soy', 'ஒருவருக்கு சோயா கூடாது', "cook's sheet, allergy note without names"),
    ('cooksheet:many-people', '2 people: no soy', '2 பேருக்கு சோயா கூடாது', "cook's sheet, allergy note without names"),
    ('cooksheet:names', 'no soy for Paati', 'சோயா கூடாது — பாட்டி', "cook's sheet, allergy note with names"),
    ('cooksheet:helper', 'Helper', 'உதவியாளர்', "cook's sheet, a helper profile named Helper"),
    ('unit:g', 'g (gram)', 'கி', 'shopping amount'),
    ('unit:kg', 'kg', 'கிலோ', 'shopping amount'),
    ('unit:ml', 'ml', 'மிலி', 'shopping amount'),
    ('unit:L', 'L (litre)', 'லி', 'shopping amount'),
    ('unit:pcs', 'pc / pcs', 'எண்', 'shopping amount'),
    ('unit:bunch', 'bunch', 'கட்டு', 'shopping amount'),
    ('unit:pack', 'pack', 'பாக்கெட்', 'shopping amount'),
]
section('words', 'Words in messages and amounts (not on screens)', [row(r, e, t_, n) for r, e, t_, n in WORDS], len(WORDS))

total = counter['n']
toc_html = ''.join(f'<li><a href="#{a}">{esc(t)}</a> <span>{c}</span></li>' for a, t, c in toc)
doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>HomeFood · Tamil review kit</title>
<style>
  body {{ font-family: "Noto Sans", system-ui, sans-serif; color: #2b2622; margin: 24px auto; max-width: 1100px; padding: 0 16px; line-height: 1.4; }}
  [lang=ta] {{ font-family: "Noto Sans Tamil", "Latha", "Nirmala UI", sans-serif; }}
  h1 {{ margin-bottom: 4px; }} h2 {{ margin: 28px 0 8px; font-size: 20px; border-bottom: 2px solid #e08a00; padding-bottom: 4px; }} h2 small {{ color: #6e6259; font-weight: 400; }}
  .how {{ background: #fff1db; border: 1px solid #e0c28a; border-radius: 10px; padding: 12px 16px; }} .how li {{ margin: 4px 0; }}
  .toc {{ columns: 2; padding-left: 18px; }} .toc span {{ color: #6e6259; }}
  table {{ width: 100%; border-collapse: collapse; table-layout: fixed; }} th, td {{ border: 1px solid #cdbfa8; padding: 6px 8px; vertical-align: top; text-align: left; font-size: 14px; }}
  th {{ background: #f4ecdf; position: sticky; top: 0; }} .no {{ width: 74px; color: #6e6259; }} .fixh, .fix {{ width: 26%; }} .fix {{ height: 34px; background: #fffdf8; }}
  .ref {{ font-size: 10px; word-break: break-all; color: #8c7d66; }} .hint {{ color: #6e6259; font-size: 12px; margin-top: 2px; }}
  tr.dish td {{ background: #f4ecdf; font-weight: 600; }} tr.dish small {{ font-weight: 400; color: #6e6259; }}
  .meta input {{ border: 0; border-bottom: 1px solid #8c7d66; min-width: 220px; font-size: 14px; }}
  @media print {{ body {{ max-width: none; margin: 0; }} h2 {{ break-after: avoid; page-break-after: avoid; }} tr {{ break-inside: avoid; page-break-inside: avoid; }} th {{ position: static; }} .toc {{ columns: 2; }} .fix {{ height: 40px; }} .meta input {{ border-bottom: 1px solid #000; }} }}
</style></head><body>
<h1>HomeFood · Tamil review kit</h1>
<p>Generated from the app's own text. <strong>{total}</strong> lines to read: {ui_total} screen texts, {dish_total} dish names, {recipe_rows_total} recipe lines (notes, ingredients, steps), {len(foods)} everyday foods, {len(shop)} shopping items, {len(prep_rows)} prep reminder wordings and {len(WORDS)} words used in messages.</p>
<p class="meta">Reviewer: <input aria-label="Reviewer"> &nbsp; Date: <input aria-label="Date"></p>
<div class="how"><strong>How to review</strong>
<ol>
<li>Read the Tamil next to the English. Leave the Correction box empty if it is fine. Ignore <code>{{{{words in braces}}}}</code> (the app fills them in) and keep them as they are.</li>
<li>If something is wrong (a wrong word, an English word left in, a spelling, or it sounds unnatural), write the Tamil you would use in the Correction box. On paper, write beside the number.</li>
<li><strong>Sending corrections back:</strong> type or photograph them as <em>number: corrected Tamil</em> (for example <em>1042: குறைவான பேர்</em>) and paste them to Claude Code. The small grey text under each number (for example <code>ui:today.nextUp</code>) is the exact place; Claude edits the app text (en/ta JSON) for screen texts and writes a database migration for dish names, recipes and foods.</li>
<li>Recipes: please also say if a quantity or a step looks wrong, not only the Tamil.</li>
<li>Print: File ▸ Print ▸ Save as PDF, or print on paper. Tip: print the sections one at a time.</li>
</ol></div>
<h2>Contents</h2><ol class="toc">{toc_html}</ol>
{''.join(parts)}
</body></html>
"""
dest = root / 'docs/tamil-review.html'
dest.write_text(doc, encoding='utf-8', newline='\n')
print(f'{total} lines ({ui_total} screen texts, {dish_total} dish names, {recipe_rows_total} recipe lines, {len(foods)} foods, {len(shop)} shop items, {len(prep_rows)} prep texts) -> docs/tamil-review.html, {dest.stat().st_size // 1024} KB')
