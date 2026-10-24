"""Diet tags for the shared dishes (migration 0040).
  python -X utf8 scripts/gen-diet-tags.py            -> a REPORT only: the rules, how many dishes get each tag, thresholds and a sample. Writes nothing.
  python -X utf8 scripts/gen-diet-tags.py --write    -> also writes supabase/migrations/0040_diet_tags.sql (only after the report has been checked).
The rules live in scripts/diet_tag_rules.py.
"""
import collections
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import diet_tag_rules as rules  # noqa: E402

root = pathlib.Path(__file__).parent.parent
dishes = rules.load()
result = {}
for name, d in dishes.items():
    tags, why = rules.rule_tags(d)
    result[name] = (tags, why)

noing = [n for n, d in dishes.items() if not d['ingredients']]
print('%d shared dishes with nutrition; %d without a recipe ingredient list: %s\n' % (len(dishes), len(noing), noing[:10]))
count = collections.Counter(t for tags, _ in result.values() for t in tags)
print('How many dishes get each tag:')
for tag, n in sorted(count.items(), key=lambda x: -x[1]):
    print('  %-14s %3d  (%d%%)' % (tag, n, round(100 * n / len(dishes))))

if '--report' in sys.argv or '--write' not in sys.argv:
    sample = ['Idli', 'Dosa', 'Sambar', 'Appalam', 'Chapati', 'Butter chicken', 'Paneer tikka', 'Egg bhurji', 'Ragi dosa', 'Sabudana khichdi', 'Verkadalai sundal', 'Curd rice', 'Poori', 'Samosa', 'Gulab jamun', 'Payasam', 'Masala chai', 'Chicken biryani', 'Vegetable soup', 'Cucumber raita', 'Beans poriyal', 'Aloo paratha', 'Mango pickle', 'Pepper chicken', 'Kootu', 'Miso soup', 'Fish fry', 'Dal tadka', 'Lemon rice', 'Pongal']
    print('\nSample (dish: tags):')
    shown = 0
    for n in sample:
        if n in result:
            print('  %-20s %s' % (n, ', '.join(result[n][0])))
            shown += 1
    if shown < 25:
        for n in list(result)[:60:3]:
            if n not in sample:
                print('  %-20s %s' % (n, ', '.join(result[n][0])))

    def listing(tag, limit=14):
        names = [n for n, (tags, _) in result.items() if tag in tags]
        return '%d: %s%s' % (len(names), ', '.join(names[:limit]), ' ...' if len(names) > limit else '')

    print('\nfasting_food ->', listing('fasting_food', 30))
    print('\nmillet ->', listing('millet', 30))
    print('\nsalty ->', listing('salty', 20))
    print('\nonion_garlic dishes that are vegetarian (a few):', ', '.join([n for n, (tags, _) in result.items() if 'onion_garlic' in tags and 'meat' not in tags and 'egg' not in tags][:12]))
    print('\nTags that look surprising are worth a look: veg dishes tagged meat or egg:', [n for n, (tags, _) in result.items() if ('meat' in tags or 'egg' in tags) and 'Veg' in n][:10])
    if '--write' not in sys.argv:
        raise SystemExit(0)


# ── the migration ──
ALL_TAGS = ['low_carb', 'high_protein', 'light', 'low_oil', 'low_sugar', 'millet', 'fasting_food', 'onion_garlic', 'salty', 'oily', 'sweet', 'grain', 'pulse', 'dairy', 'added_sugar', 'meat', 'egg', 'root_veg']
assert set(count) <= set(ALL_TAGS), set(count) - set(ALL_TAGS)


def q(x):
    return "'" + x.replace("'", "''") + "'"


blocks = []
for tag in ALL_TAGS:
    names = [n for n, (tags, _) in result.items() if tag in tags]
    if not names:
        continue
    listing = ',\n    '.join(q(n) for n in names)
    blocks.append("update public.dishes\n   set tags = array_append(tags, '%s')\n where household_id is null\n   and not ('%s' = any (tags))\n   and name in (\n    %s\n   );\n" % (tag, tag, listing))

tag_list = ', '.join(q(t) for t in ALL_TAGS)
SQL = f"""-- HomeFood · 0040: diet tags on the shared dishes, and a home's own corrections
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- Each shared dish gets tags worked out from its recipe's ingredients and its nutrition estimate (the rules are in scripts/diet_tag_rules.py;
-- regenerate with python -X utf8 scripts/gen-diet-tags.py --write). They are guidance, not a verdict, and a home can correct any of them on Dish detail:
--   Positive tags (for the filters and the diet plans):  low_carb, high_protein, light, low_oil, low_sugar, millet, fasting_food
--   Flags (what a dish is or contains):  onion_garlic, salty, oily, sweet, grain, pulse, dairy, added_sugar, meat, egg, root_veg
-- The shared catalogue stays read-only: a correction is a row in household_dish_tags (present = true adds the tag for that home, false takes it away).
-- Who corrects: the Admin, or whoever is the Planner today (the same people who edit prep reminders). Everyone in the home reads them.

create table if not exists public.household_dish_tags (
  household_id uuid not null references public.households (id) on delete cascade,
  dish_id      uuid not null references public.dishes (id) on delete cascade,
  tag          text not null check (tag in ({tag_list})),
  present      boolean not null,
  updated_by   uuid references public.profiles (id) on delete set null,
  updated_at   timestamptz not null default now(),
  primary key (household_id, dish_id, tag)
);

-- A correction is for a dish this home can see: a shared dish or one of its own.
create or replace function public.guard_household_dish_tag() returns trigger
language plpgsql security definer set search_path = '' as $$
declare dish_home uuid;
begin
  select household_id into dish_home from public.dishes where id = new.dish_id;
  if not found or (dish_home is not null and dish_home <> new.household_id) then raise exception 'That dish is not available to this home'; end if;
  return new;
end $$;
drop trigger if exists household_dish_tags_guard on public.household_dish_tags;
create trigger household_dish_tags_guard before insert or update on public.household_dish_tags
  for each row execute function public.guard_household_dish_tag();

alter table public.household_dish_tags enable row level security;
drop policy if exists dish_tags_read on public.household_dish_tags;
create policy dish_tags_read on public.household_dish_tags for select to authenticated using (household_id = public.my_household_id());
drop policy if exists dish_tags_write on public.household_dish_tags;
create policy dish_tags_write on public.household_dish_tags for all to authenticated
  using (household_id = public.my_household_id() and public.can_edit_prep())
  with check (household_id = public.my_household_id() and public.can_edit_prep());
grant select, insert, update, delete on public.household_dish_tags to authenticated;

-- ── the tags ({len(result)} shared dishes) ──
""" + '\n'.join(blocks)
dest = root / 'supabase/migrations/0040_diet_tags.sql'
dest.write_text(SQL, encoding='utf-8')
print('\n%d tag rows on %d dishes -> %s' % (sum(count.values()), len(result), dest.name))
