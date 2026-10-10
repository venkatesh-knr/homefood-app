"""Downloads the catalogue photos once and bundles them with the app, then writes the migration that points the dishes at them.

Run from the repo root:  python scripts/build-dish-photos.py
Needs Pillow (pip install pillow). Safe to re-run: files already in public/dish-photos/ are skipped.

Sources
  - the 28 starter dishes: the URLs and credits already in supabase/migrations/0007 + 0008
  - the 110 dishes from 0009: scripts/dish-photo-picks.txt (Commons file title); the author and licence are looked up
    from Wikimedia Commons so the credit is exact
Outputs
  - public/dish-photos/<slug>.webp   (served by the app itself, no more hotlinking)
  - scripts/dish-photos.json         (dish -> file, credit, source page)
  - supabase/migrations/0014_dish_photos_static.sql
"""
import io, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'dish-photos')
UA = 'HomeFoodApp/1.0 (family meal planner; contact venkatesh.knr@gmail.com)'
MAX_W = 720
os.makedirs(OUT, exist_ok=True)


def http(url, tries=5):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            wait = 4 * (i + 1)
            print('   retry in', wait, 's:', e)
            time.sleep(wait)
    raise SystemExit('giving up on ' + url)


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def save_webp(data, path):
    from PIL import Image
    im = Image.open(io.BytesIO(data))
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGB', im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert('RGB')
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    im.save(path, 'WEBP', quality=78, method=6)


# ---- 1. the 28 starter dishes: parse the old migrations ---------------------------------------
existing = {}
row = re.compile(r"\('((?:[^']|'')+)',\s*'(https://[^']+)',\s*'((?:[^']|'')+)'\)")
for f in ('0007_dish_stock_photos.sql', '0008_dish_stock_photos_rest.sql'):
    text = open(os.path.join(ROOT, 'supabase', 'migrations', f), encoding='utf-8').read()
    for m in row.finditer(text):
        name, url, credit = (g.replace("''", "'") for g in m.groups())
        existing[name] = dict(url=url, credit=credit, page='https://commons.wikimedia.org/wiki/File:' + urllib.parse.unquote(url.rstrip('/').split('/')[-2 if '/thumb/' in url else -1]))
assert len(existing) == 28, len(existing)

# ---- 2. the 110 new dishes: look up author + licence on Commons -------------------------------
picks = []
for line in open(os.path.join(ROOT, 'scripts', 'dish-photo-picks.txt'), encoding='utf-8'):
    if not line.strip() or line.startswith('#'):
        continue
    name, title, ill = [p.strip() for p in line.split(' | ')]
    picks.append((name, title, ill == '1'))
assert len(picks) == 110, len(picks)

info = {}
for i in range(0, len(picks), 40):
    chunk = picks[i:i + 40]
    q = urllib.parse.urlencode({
        'action': 'query', 'format': 'json', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 960,
        'titles': '|'.join('File:' + t for _, t, _ in chunk)})
    r = json.loads(http('https://commons.wikimedia.org/w/api.php?' + q))
    norm = {n['to']: n['from'] for n in r['query'].get('normalized', [])}
    for p in r['query']['pages'].values():
        ii = p.get('imageinfo', [None])[0]
        if not ii:
            raise SystemExit('not found on Commons: ' + p['title'])
        meta = ii['extmetadata']
        artist = re.sub(r'<[^>]+>', '', meta.get('Artist', {}).get('value', '')).strip()
        if artist.startswith('http'):
            artist = 'EmojiOne' if 'emojione' in artist else 'Wikimedia Commons contributor'
        artist = re.sub(r'\s+', ' ', artist)[:70] or 'Wikimedia Commons contributor'
        info[norm.get(p['title'], p['title'])[5:]] = dict(
            url=ii.get('thumburl') or ii['url'], page=ii['descriptionurl'], artist=artist,
            lic=meta.get('LicenseShortName', {}).get('value', 'see source').replace('Public domain', 'public domain'))
    time.sleep(1)

jobs = []
for name, d in existing.items():
    jobs.append((name, d['url'], d['credit'], d['page']))
for name, title, ill in picks:
    d = info[title]
    credit = f"{d['artist']}, {d['lic']}, via Wikimedia Commons" + (' (illustration)' if ill else '')
    jobs.append((name, d['url'], credit, d['page']))
assert len({j[0] for j in jobs}) == 138

# ---- 3. download + convert ----------------------------------------------------------------------
manifest = []
for name, url, credit, page in jobs:
    fn = slug(name) + '.webp'
    path = os.path.join(OUT, fn)
    if not os.path.exists(path):
        print('downloading', name)
        save_webp(http(url), path)
        time.sleep(1.2)
    manifest.append(dict(dish=name, file=fn, credit=credit, source=page, bytes=os.path.getsize(path)))
json.dump(manifest, open(os.path.join(ROOT, 'scripts', 'dish-photos.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)

# ---- 4. the migration -----------------------------------------------------------------------------
def q(s):
    return "'" + s.replace("'", "''") + "'"

values = ',\n'.join(f"    ({q(m['dish'])}, {q('static/' + m['file'])}, {q(m['credit'])})" for m in manifest)
sql = f"""-- HomeFood · 0014: catalogue photos are now our own files, not hotlinks to Wikimedia
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Until now dishes.photo_path held a Wikimedia Commons URL (28 dishes) or nothing (the 110 added in 0009).
-- The photos have been downloaded, shrunk to WebP and shipped with the app (public/dish-photos/, built by
-- scripts/build-dish-photos.py), so they load from the app's own address, work offline once seen and
-- never break if Commons moves a file.
--
-- photo_path = 'static/<file>' means "the bundled photo public/dish-photos/<file>"; the app turns it into a
-- link (src/lib/dishQueries.ts). Anything else is still a private-bucket upload by a household.
-- Credits stay in photo_credit (CC BY / BY-SA need them shown). {sum(1 for m in manifest if '(illustration)' in m['credit'])} of the {len(manifest)} are drawings,
-- marked "(illustration)". Households' own photos (dish_photo_overrides) are untouched and still win.
-- Safe to run twice: it only sets the same values again.

with photos(dish_name, photo_path, photo_credit) as (
  values
{values}
)
update public.dishes d
set photo_path = p.photo_path,
    photo_credit = p.photo_credit
from photos p
where d.household_id is null
  and d.name = p.dish_name;
"""
open(os.path.join(ROOT, 'supabase', 'migrations', '0014_dish_photos_static.sql'), 'w', encoding='utf-8').write(sql)
total = sum(m['bytes'] for m in manifest)
print(f'done: {len(manifest)} photos, {total / 1e6:.1f} MB total, largest {max(m["bytes"] for m in manifest) // 1024} KB')
