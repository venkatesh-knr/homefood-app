-- HomeFood · 0018: bundled photos for 13 more South Indian dishes (found after 0015 was written)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Same idea as 0014/0015: photo_path = 'static/<file>' is a photo shipped with the app (public/dish-photos/), the credit goes in
-- photo_credit. Only fills dishes that have no photo yet, so running it twice (or after a home's own photo) changes nothing.

with photos(dish_name, photo_path, photo_credit) as (
  values
    ('Beans usili', 'static/beans-usili.webp', 'Maccess Corporation, CC BY-SA 2.5, via Wikimedia Commons'),
    ('Murungai keerai poriyal', 'static/murungai-keerai-poriyal.webp', 'VinPrasad, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Senaikizhangu fry', 'static/senaikizhangu-fry.webp', 'Mangosapiens, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Cluster beans poriyal', 'static/cluster-beans-poriyal.webp', 'Rameshng, CC BY-SA 3.0, via Wikimedia Commons'),
    ('Puli kuzhambu', 'static/puli-kuzhambu.webp', 'Abinandhankumar2045, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Poondu rasam', 'static/poondu-rasam.webp', 'Miansari66, public domain, via Wikimedia Commons'),
    ('Arachuvitta sambar', 'static/arachuvitta-sambar.webp', 'Manavatha, CC BY-SA 3.0, via Wikimedia Commons'),
    ('Olan', 'static/olan.webp', 'Kavya Manohar, CC BY-SA 3.0, via Wikimedia Commons'),
    ('Erissery', 'static/erissery.webp', 'Kavya Manohar, CC BY-SA 3.0, via Wikimedia Commons'),
    ('Pulissery', 'static/pulissery.webp', 'Ps6068, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Paper roast', 'static/paper-roast.webp', 'Charles Haynes from Hobart, Australia, CC BY-SA 2.0, via Wikimedia Commons'),
    ('Veg stew', 'static/veg-stew.webp', 'Yummy O Yummy, CC BY 2.0, via Wikimedia Commons'),
    ('Coriander chutney', 'static/coriander-chutney.webp', 'Pduaroxxx, CC BY-SA 4.0, via Wikimedia Commons')
)
update public.dishes d
set photo_path = p.photo_path,
    photo_credit = p.photo_credit
from photos p
where d.household_id is null
  and d.name = p.dish_name
  and d.photo_path is null;
