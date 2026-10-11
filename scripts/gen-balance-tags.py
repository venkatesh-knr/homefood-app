"""Writes supabase/migrations/0024_weekly_balance.sql: the weekly balance banner's limits (columns on households) and the tag
"vegetable" on the shared dishes listed in scripts/vegetable-dishes.txt.
Run from the repo root:  python -X utf8 scripts/gen-balance-tags.py
"""
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from south_indian_data import rows as south_rows  # noqa: E402

root = pathlib.Path(__file__).parent.parent
names = [l.strip() for l in (root / 'scripts/vegetable-dishes.txt').read_text(encoding='utf-8').splitlines() if l.strip() and not l.startswith('#')]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]

known = {r['name'] for r in south_rows()}
rx = re.compile(r"\('[0-9a-f-]{36}'(?:::uuid)?, '((?:[^']|'')*)'")
for f in ('0005_seed_dishes.sql', '0009_more_indian_dishes.sql'):
    known |= {m.replace("''", "'") for m in rx.findall((root / 'supabase/migrations' / f).read_text(encoding='utf-8'))}
unknown = [n for n in names if n not in known]
assert not unknown, 'not in the shared catalogue: %s' % unknown

listing = ',\n    '.join("'%s'" % n.replace("'", "''") for n in names)
SQL = """-- HomeFood · 0024: the weekly balance banner (Week tab)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- The Week tab shows the Planner and Admin a gentle, dismissible note when the week looks unbalanced: the same main dish 3 or more times,
-- fried dishes in more than 4 meals, a day with no vegetable dish, or 3 or more dine-out / order-in meals in a row. The Admin can change the
-- three numbers in Home settings; these columns hold them (the defaults are the ones above). They are covered by the same rule as the rest of
-- the home's settings: only the Admin can change them.
-- A day's vegetables are found by a tag: the dishes below get the tag "vegetable" (shared dishes only; a home can add the tag to its own dishes).

alter table public.households add column if not exists balance_same_main smallint not null default 3;
alter table public.households add column if not exists balance_fried     smallint not null default 4;
alter table public.households add column if not exists balance_out_run   smallint not null default 3;

alter table public.households drop constraint if exists households_balance_same_main_check;
alter table public.households add constraint households_balance_same_main_check check (balance_same_main between 2 and 14);
alter table public.households drop constraint if exists households_balance_fried_check;
alter table public.households add constraint households_balance_fried_check check (balance_fried between 0 and 28);
alter table public.households drop constraint if exists households_balance_out_run_check;
alter table public.households add constraint households_balance_out_run_check check (balance_out_run between 2 and 14);

update public.dishes
   set tags = array_append(tags, 'vegetable')
 where household_id is null
   and not ('vegetable' = any (tags))
   and name in (
    %(listing)s
   );
""" % {'listing': listing}
dest = root / 'supabase/migrations/0024_weekly_balance.sql'
dest.write_text(SQL, encoding='utf-8')
print('%d vegetable dishes -> %s' % (len(names), dest.name))
