"""Same as build-dish-photos.py, for the South Indian dishes added in 0015 (scripts/south-indian-photo-picks.txt).

Run from the repo root:  python scripts/build-south-indian-photos.py
Needs Pillow. Safe to re-run: files already in public/dish-photos/ are skipped.
Outputs public/dish-photos/<slug>.webp and scripts/south-indian-photos.json (dish, file, credit, source), which
gen-south-indian.py turns into the photo update at the end of migration 0015.
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


picks = []
for line in open(os.path.join(ROOT, 'scripts', 'south-indian-photo-picks.txt'), encoding='utf-8'):
    if not line.strip() or line.startswith('#'):
        continue
    name, title = [p.strip() for p in line.split(' | ')]
    picks.append((name, title, False))


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
for name, title, ill in picks:
    d = info[title]
    jobs.append((name, d['url'], f"{d['artist']}, {d['lic']}, via Wikimedia Commons", d['page']))

manifest = []
for name, url, credit, page in jobs:
    fn = slug(name) + '.webp'
    path = os.path.join(OUT, fn)
    if not os.path.exists(path):
        print('downloading', name)
        save_webp(http(url), path)
        time.sleep(1.2)
    manifest.append(dict(dish=name, file=fn, credit=credit, source=page, bytes=os.path.getsize(path)))
json.dump(manifest, open(os.path.join(ROOT, 'scripts', 'south-indian-photos.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(f'done: {len(manifest)} photos, {sum(m["bytes"] for m in manifest) / 1e6:.1f} MB')
