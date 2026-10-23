"""Writes supabase/migrations/0033_shop_items.sql from scripts/shop_items_data.py (the shared common shopping items) and reports how many
real recipe ingredients they match. Run from the repo root:  python -X utf8 scripts/gen-shop-items.py [--coverage]

Checks every item: valid tab and unit, a Tamil name, no duplicate names or aliases, sensible pack sizes, a conversion for every item bought
by weight that appears in recipes. `--coverage` prints the recipe ingredient names that match nothing, most frequent first.
The matching rules here (canon / ingredient_candidates) are mirrored in src/lib/shopping.ts: change both together.
"""
import collections
import glob
import importlib.util
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from shop_items_data import IGNORED, TABS, UNITS, rows  # noqa: E402

root = pathlib.Path(__file__).parent.parent
R = rows()


# ── matching rules (mirrored in src/lib/shopping.ts) ──
def singular(w):
    if len(w) > 4 and w.endswith('oes'):
        return w[:-2]
    if len(w) > 4 and w.endswith('ies'):
        return w[:-3] + 'y'
    if len(w) > 3 and w.endswith('s') and not w.endswith(('ss', 'us', 'is')):
        return w[:-1]
    return w


def canon(text):
    t = re.sub(r'\([^)]*\)', ' ', text.lower())
    t = t.replace("'", '').replace('’', '').replace('-', ' ')
    t = re.sub(r'[^\w\s஀-௿]', ' ', t)
    return ' '.join(singular(w) for w in t.split())


LEADING = {'cooked', 'cooled', 'thick', 'thin', 'sour', 'fresh', 'cold', 'hot', 'warm', 'boiled', 'roasted', 'chopped', 'grated', 'sliced', 'mashed', 'finely', 'ripe', 'dry', 'dried', 'whole'}
IGNORED_CANON = {canon(x) for x in IGNORED}


def ingredient_candidates(name):
    """The spellings tried, in order, when matching a recipe ingredient name to a shop item."""
    t = re.sub(r'\([^)]*\)', ' ', name.lower())
    head = t.split(',')[0].strip()
    out = [canon(name), canon(head)]
    if ' for ' in head:
        out.append(canon(head.split(' for ')[0]))
    words = head.split()
    while words and words[0] in LEADING:
        words = words[1:]
        out.append(canon(' '.join(words)))
    for sep in (' and ', ' or ', ' & ', ' + '):
        if sep in head:
            first = head.split(sep)[0]
            out.append(canon(first))
            w = first.split()
            while w and w[0] in LEADING:
                w = w[1:]
                out.append(canon(' '.join(w)))
    seen = []
    for c in out:
        if c and c not in seen:
            seen.append(c)
    return seen


# ── checks ──
names = [r['name_en'].lower() for r in R]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]
index = {}
for r in R:
    assert r['tab'] in TABS and r['unit'] in UNITS, r['name_en']
    assert r['name_ta'] and 1 <= len(r['name_en']) <= 80 and len(r['name_ta']) <= 80, r['name_en']
    assert r['usual'] > 0, r['name_en']
    if r['unit'] in ('g', 'ml'):
        assert r['usual'] <= 1000, r['name_en']
    if r['packs']:
        assert r['packs'] == sorted(r['packs']) and r['unit'] in ('g', 'kg', 'ml', 'L'), r['name_en']
    if r['perishable']:
        assert not r['packs'], '%s: perishables are rounded, not packed' % r['name_en']
    for key in {canon(r['name_en']), canon(r['name_ta'])} | {canon(a) for a in r['aliases']}:
        if key in index and index[key] is not r:
            raise SystemExit('"%s" is used by both %s and %s' % (key, index[key]['name_en'], r['name_en']))
        index[key] = r

# ── coverage against the real recipes ──
counts = collections.Counter()
for f in glob.glob(str(root / 'scripts/recipes_*.txt')):
    for line in open(f, encoding='utf-8'):
        if line.startswith('i:'):
            counts[line[2:].split('|')[0].strip()] += 1
spec = importlib.util.spec_from_file_location('recipes_data', root / 'scripts/recipes_data.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
for rec in mod.R:
    for ing in rec['ingredients']:
        counts[ing[0]] += 1
total = sum(counts.values())
ignored = matched = 0
unmatched = collections.Counter()
for name, n in counts.items():
    cands = ingredient_candidates(name)
    if any(c in IGNORED_CANON for c in cands[:2]):
        ignored += n
    elif any(c in index for c in cands):
        matched += n
    else:
        unmatched[name] += n
print('%d items; recipe lines: %d, matched %d (%.0f%%), ignored %d, unmatched %d (%.0f%%)' % (len(R), total, matched, 100 * matched / total, ignored, total - matched - ignored, 100 * (total - matched - ignored) / total))
if '--coverage' in sys.argv:
    for name, n in unmatched.most_common(70):
        print('%4d  %s' % (n, name))


# ── the migration ──
def q(s):
    return "'" + s.replace("'", "''") + "'"


def num(x):
    return '%g' % x


def arr(xs, kind):
    if not xs:
        return "'{}'" if kind == 'text' else 'null'
    return "array[%s]::%s[]" % (', '.join(q(x) if kind == 'text' else num(x) for x in xs), kind)


values = ',\n'.join(
    '  (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
    % (q(r['name_en']), q(r['name_ta']), arr(r['aliases'], 'text'), q(r['section']), q(r['tab']), num(r['usual']), q(r['unit']),
       'true' if r['perishable'] else 'false', 'true' if r['staple'] else 'false', arr(r['packs'], 'numeric'),
       num(r['g_per_cup']) if r['g_per_cup'] else 'null', num(r['g_per_piece']) if r['g_per_piece'] else 'null')
    for r in R
)
SQL = f"""-- HomeFood · 0033: common shopping items, and each home's own ("Our common items")
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run (after 0032). Safe to run twice.
-- common_shop_items is the shared, read-only list ({len(R)} items, English and Tamil names, aliases for matching recipe ingredients and typed words,
-- the section and browse tab, the usual amount, and the facts "From this week's meals" needs: perishable or not, pantry staple or not, this
-- item's own pack sizes, and a rough weight per cup or per piece used only to turn recipe cups and spoons into g or ml).
-- household_shop_items is a home's own additions: everyone in the home sees them, the creator or an Admin renames or deletes them.
-- The seed is regenerated from scripts/shop_items_data.py by scripts/gen-shop-items.py. The Tamil names are everyday market words for the
-- family to check.

create table if not exists public.common_shop_items (
  id          uuid primary key default gen_random_uuid(),
  name_en     text not null unique check (char_length(btrim(name_en)) between 1 and 80),
  name_ta     text not null check (char_length(btrim(name_ta)) between 1 and 80),
  aliases     text[] not null default '{{}}',
  section     text not null check (section in ('veg_fruit', 'grocery', 'dairy_eggs', 'other')),
  browse_tab  text not null check (browse_tab in ('vegetables', 'fruits', 'groceries', 'dairy_eggs', 'other')),
  usual_amount numeric(8, 2) not null check (usual_amount > 0),
  usual_unit  text not null check (usual_unit in ('g', 'kg', 'ml', 'L', 'pcs', 'bunch', 'pack')),
  perishable  boolean not null default false,
  staple      boolean not null default false,
  pack_sizes  numeric[],                                  -- grams or ml, ascending; null = the standard packs
  g_per_cup   numeric(6, 1) check (g_per_cup > 0),
  g_per_piece numeric(7, 1) check (g_per_piece > 0)
);
alter table public.common_shop_items enable row level security;
drop policy if exists common_shop_items_read on public.common_shop_items;
create policy common_shop_items_read on public.common_shop_items for select to authenticated using (true);
grant select on public.common_shop_items to authenticated;

create table if not exists public.household_shop_items (
  id          uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name_en     text not null check (char_length(btrim(name_en)) between 1 and 80),
  name_ta     text check (char_length(btrim(name_ta)) between 1 and 80),
  aliases     text[] not null default '{{}}',
  section     text not null default 'other' check (section in ('veg_fruit', 'grocery', 'dairy_eggs', 'other')),
  browse_tab  text not null default 'other' check (browse_tab in ('vegetables', 'fruits', 'groceries', 'dairy_eggs', 'other')),
  usual_amount numeric(8, 2) not null default 1 check (usual_amount > 0),
  usual_unit  text not null default 'pcs' check (usual_unit in ('g', 'kg', 'ml', 'L', 'pcs', 'bunch', 'pack')),
  perishable  boolean not null default false,
  staple      boolean not null default false,
  pack_sizes  numeric[],
  g_per_cup   numeric(6, 1) check (g_per_cup > 0),
  g_per_piece numeric(7, 1) check (g_per_piece > 0),
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create unique index if not exists household_shop_items_name_uidx on public.household_shop_items (household_id, lower(btrim(name_en)));
alter table public.household_shop_items enable row level security;
drop policy if exists hh_shop_items_read on public.household_shop_items;
create policy hh_shop_items_read on public.household_shop_items for select to authenticated using (household_id = public.my_household_id());
drop policy if exists hh_shop_items_insert on public.household_shop_items;
create policy hh_shop_items_insert on public.household_shop_items for insert to authenticated
  with check (household_id = public.my_household_id() and created_by = public.my_profile_id());
drop policy if exists hh_shop_items_update on public.household_shop_items;
create policy hh_shop_items_update on public.household_shop_items for update to authenticated
  using (household_id = public.my_household_id() and (created_by = public.my_profile_id() or public.is_admin()))
  with check (household_id = public.my_household_id());
drop policy if exists hh_shop_items_delete on public.household_shop_items;
create policy hh_shop_items_delete on public.household_shop_items for delete to authenticated
  using (household_id = public.my_household_id() and (created_by = public.my_profile_id() or public.is_admin()));
grant select, insert, update, delete on public.household_shop_items to authenticated;

insert into public.common_shop_items (name_en, name_ta, aliases, section, browse_tab, usual_amount, usual_unit, perishable, staple, pack_sizes, g_per_cup, g_per_piece)
values
{values}
on conflict (name_en) do nothing;
"""
dest = root / 'supabase/migrations/0033_shop_items.sql'
dest.write_text(SQL, encoding='utf-8', newline='\n')
print(len(R), 'items ->', dest.name)

# The same items for the demo home (no database there): src/demo/shopItems.json, rows shaped like the table.
import json  # noqa: E402

demo = [
    dict(id='shop-' + re.sub(r'[^a-z0-9]+', '-', r['name_en'].lower()).strip('-'), name_en=r['name_en'], name_ta=r['name_ta'], aliases=r['aliases'], section=r['section'],
         browse_tab=r['tab'], usual_amount=r['usual'], usual_unit=r['unit'], perishable=r['perishable'], staple=r['staple'], pack_sizes=r['packs'],
         g_per_cup=r['g_per_cup'], g_per_piece=r['g_per_piece'])
    for r in R
]
(root / 'src/demo/shopItems.json').write_text(json.dumps(demo, ensure_ascii=False, separators=(',', ':')), encoding='utf-8', newline='\n')
print('demo ->', 'src/demo/shopItems.json')
