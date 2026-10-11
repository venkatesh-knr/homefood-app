"""Writes a migration that gives bundled photos to shared dishes that have none yet.
Usage (from the repo root):  python -X utf8 scripts/gen-photo-migration.py scripts/more-photos.json 0028 "stock photos, batch 3"
The photo files must already be in public/dish-photos/ (scripts/build-photos.py downloads them).
"""
import json
import pathlib
import sys

root = pathlib.Path(__file__).parent.parent
manifest, number, title = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
photos = json.loads(manifest.read_text(encoding='utf-8'))
for m in photos:
    assert (root / 'public/dish-photos' / m['file']).exists(), 'missing file ' + m['file']


def q(s):
    return "'" + s.replace("'", "''") + "'"


values = ',\n'.join('    (%s, %s, %s)' % (q(m['dish']), q('static/' + m['file']), q(m['credit'])) for m in photos)
sql = f"""-- HomeFood · {number}: bundled photos for {len(photos)} more dishes ({title})
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- Same idea as 0014 / 0018: photo_path = 'static/<file>' is a photo shipped with the app (public/dish-photos/), the credit goes in
-- photo_credit (free licences only; the credit is shown over the photo). Only fills shared dishes that have no photo yet, so running it
-- twice (or after a home has put in its own photo) changes nothing.

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
out = root / 'supabase/migrations' / f'{number}_stock_photos_{title.split(",")[-1].strip().replace(" ", "_")}.sql'
out.write_text(sql, encoding='utf-8', newline='\n')
print(out.name, [m['dish'] for m in photos])
