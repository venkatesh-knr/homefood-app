"""Writes supabase/migrations/0012_nutrition.sql (per-dish estimates + daily reference targets).
Run from the repo root:  python scripts/gen-nutrition.py
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from nutrition_data import N  # noqa: E402

root = pathlib.Path(__file__).parent.parent
seed_text = ''.join((root / 'supabase/migrations' / f).read_text(encoding='utf-8') for f in ('0005_seed_dishes.sql', '0009_more_indian_dishes.sql'))

names = [r[0] for r in N]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]
for r in N:
    assert re.search(r"'%s'" % re.escape(r[0]), seed_text), 'dish not in the seed catalogue: ' + r[0]
    assert all(isinstance(v, (int, float)) and v >= 0 for v in r[2:]), r[0]
    # kcal should roughly agree with the macros (4/4/9); flag big mismatches so typos are caught
    kcal, p, c, f = r[2], r[3], r[4], r[5]
    calc = 4 * p + 4 * c + 9 * f
    assert abs(calc - kcal) <= max(60, 0.25 * kcal), (r[0], kcal, round(calc))

# every seeded dish should have a row
missing = []
for m in re.finditer(r"\n\s+\('0000[^']*'(?:::uuid)?, '([^']+)'", seed_text):
    if m.group(1) not in names:
        missing.append(m.group(1))
assert not missing, 'dishes without nutrition: %s' % missing

payload = [dict(dish=r[0], serving=r[1], kcal=r[2], protein=r[3], carbs=r[4], fat=r[5], fibre=r[6], sugar=r[7], sodium=r[8]) for r in N]
blob = json.dumps(payload, ensure_ascii=False, indent=0)
assert '$json$' not in blob

# ── Daily reference targets: rounded values based on ICMR-NIN 2020 "Nutrient Requirements for Indians" ──
# energy (kcal) by band / sex / activity; protein g; fibre g; sodium mg (upper); carbs 55% and fat 25% of energy; free sugar <= 10% of energy.
ENERGY = {  # band: {sex: (light, moderate, active)}
    'child':  {'male': (1700, 2000, 2220), 'female': (1600, 1900, 2060)},
    'teen':   {'male': (2500, 2860, 3300), 'female': (2100, 2400, 2600)},
    'adult':  {'male': (2320, 2730, 3490), 'female': (1900, 2230, 2850)},
    'senior': {'male': (2000, 2350, 3000), 'female': (1650, 1950, 2450)},
}
PROTEIN = {'child': {'male': 35, 'female': 37}, 'teen': {'male': 58, 'female': 53}, 'adult': {'male': 54, 'female': 46}, 'senior': {'male': 54, 'female': 46}}
FIBRE = {'child': 20, 'teen': 25, 'adult': 30, 'senior': 30}
SODIUM = {'child': 1500, 'teen': 2000, 'adult': 2000, 'senior': 2000}
targets = []
for band, bysex in ENERGY.items():
    for sex, levels in bysex.items():
        for activity, kcal in zip(('light', 'moderate', 'active'), levels):
            targets.append((band, sex, activity, kcal, PROTEIN[band][sex], round(kcal * 0.55 / 4), round(kcal * 0.25 / 9), FIBRE[band], SODIUM[band], round(kcal * 0.10 / 4)))
rows = ",\n".join("  ('%s', '%s', '%s', %d, %d, %d, %d, %d, %d, %d)" % t for t in targets)

SQL = """-- HomeFood · 0012: nutrition (per-dish estimates and daily reference targets)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- dish_nutrition: per-serving ESTIMATES for the shared dishes (typical home recipe and portion, rounded — not lab values;
--   ingredient figures were guided by IFCT 2017 / USDA FoodData Central ranges). A home's own dishes can have a row too
--   (Admin only) but there is no screen to enter one yet.
-- nutrition_targets: reference daily values by age band, sex and activity level — rounded from ICMR-NIN 2020
--   "Nutrient Requirements for Indians". Anyone signed in can read them; nobody edits them from the app.
-- Estimates for planning at home, not medical advice (the app says so on every nutrition screen).

create table public.dish_nutrition (
  dish_id     uuid primary key references public.dishes (id) on delete cascade,
  serving     text not null,
  kcal        numeric(7, 1) not null check (kcal >= 0),
  protein_g   numeric(6, 1) not null check (protein_g >= 0),
  carbs_g     numeric(6, 1) not null check (carbs_g >= 0),
  fat_g       numeric(6, 1) not null check (fat_g >= 0),
  fibre_g     numeric(6, 1) not null check (fibre_g >= 0),
  sugar_g     numeric(6, 1) not null check (sugar_g >= 0),
  sodium_mg   numeric(7, 0) not null check (sodium_mg >= 0),
  is_estimate boolean not null default true,
  source      text not null default 'Estimate for a typical home recipe and portion; IFCT 2017 and USDA FoodData Central used as references.'
);

create table public.nutrition_targets (
  age_band  text not null check (age_band in ('child', 'teen', 'adult', 'senior')),
  sex       text not null check (sex in ('female', 'male')),
  activity  text not null check (activity in ('light', 'moderate', 'active')),
  kcal      integer not null,
  protein_g integer not null,
  carbs_g   integer not null,
  fat_g     integer not null,
  fibre_g   integer not null,
  sodium_mg integer not null,
  sugar_g   integer not null,
  source    text not null default 'Rounded from ICMR-NIN 2020, Nutrient Requirements for Indians.',
  primary key (age_band, sex, activity)
);

alter table public.dish_nutrition    enable row level security;
alter table public.nutrition_targets enable row level security;

create policy dish_nutrition_read on public.dish_nutrition for select to authenticated
  using (exists (select 1 from public.dishes d where d.id = dish_id and (d.household_id is null or d.household_id = public.my_household_id())));
create policy dish_nutrition_write on public.dish_nutrition for all to authenticated
  using (exists (select 1 from public.dishes d where d.id = dish_id and d.household_id = public.my_household_id() and public.is_admin()))
  with check (exists (select 1 from public.dishes d where d.id = dish_id and d.household_id = public.my_household_id() and public.is_admin()));
create policy nutrition_targets_read on public.nutrition_targets for select to authenticated using (true);

grant select, insert, update, delete on public.dish_nutrition to authenticated;
grant select on public.nutrition_targets to authenticated;

insert into public.nutrition_targets (age_band, sex, activity, kcal, protein_g, carbs_g, fat_g, fibre_g, sodium_mg, sugar_g) values
%s
on conflict do nothing;

-- ── Per-serving estimates for %d shared dishes. Skips dishes that already have a row, so it is safe to run twice. ──
insert into public.dish_nutrition (dish_id, serving, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg)
select d.id, x.serving, x.kcal, x.protein, x.carbs, x.fat, x.fibre, x.sugar, x.sodium
from jsonb_to_recordset($json$
%s
$json$::jsonb) as x(dish text, serving text, kcal numeric, protein numeric, carbs numeric, fat numeric, fibre numeric, sugar numeric, sodium numeric)
join public.dishes d on d.household_id is null and d.name = x.dish
on conflict (dish_id) do nothing;
"""

out = root / 'supabase/migrations/0012_nutrition.sql'
out.write_text(SQL % (rows, len(N), blob), encoding='utf-8', newline='\n')
print(len(N), 'dishes,', len(targets), 'target rows')
