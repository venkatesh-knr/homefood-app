"""Writes supabase/migrations/0018_south_indian_photos_more.sql: bundled photos found after 0015 was written.
Photos that were already in 0015 (scripts/south-indian-photos-0015.json) are left out. Run from the repo root:
  python scripts/build-south-indian-photos.py   # downloads any new picks, rewrites scripts/south-indian-photos.json
  python scripts/gen-south-photos.py
"""
import json
import pathlib

root = pathlib.Path(__file__).parent.parent
done = {m['dish'] for m in json.loads((root / 'scripts/south-indian-photos-0015.json').read_text(encoding='utf-8'))}
new = [m for m in json.loads((root / 'scripts/south-indian-photos.json').read_text(encoding='utf-8')) if m['dish'] not in done]


def q(s):
    return "'" + s.replace("'", "''") + "'"


values = ',\n'.join('    (%s, %s, %s)' % (q(m['dish']), q('static/' + m['file']), q(m['credit'])) for m in new)
sql = f"""-- HomeFood · 0018: bundled photos for {len(new)} more South Indian dishes (found after 0015 was written)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Same idea as 0014/0015: photo_path = 'static/<file>' is a photo shipped with the app (public/dish-photos/), the credit goes in
-- photo_credit. Only fills dishes that have no photo yet, so running it twice (or after a home's own photo) changes nothing.

with photos(dish_name, photo_path, photo_credit) as (
  values
{values}
)
update public.dishes d
set photo_path = p.photo_path,
    photo_credit = p.photo_credit
from photos p
where d.household_id is null
  and d.name = p.dish_name
  and d.photo_path is null;
"""
(root / 'supabase/migrations/0018_south_indian_photos_more.sql').write_text(sql, encoding='utf-8', newline='\n')
print(len(new), 'photos:', [m['dish'] for m in new])
