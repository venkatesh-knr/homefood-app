-- HomeFood · 0028: bundled photos for 6 more dishes (stock photos, batch 3)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- Same idea as 0014 / 0018: photo_path = 'static/<file>' is a photo shipped with the app (public/dish-photos/), the credit goes in
-- photo_credit (free licences only; the credit is shown over the photo). Only fills shared dishes that have no photo yet, so running it
-- twice (or after a home has put in its own photo) changes nothing.

with photos(dish_name, photo_path, photo_credit) as (
  values
    ('Pudina rice', 'static/pudina-rice.webp', 'Deviselvam, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Mango rice', 'static/mango-rice.webp', 'Vidya pmysore, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Panakam', 'static/panakam.webp', 'Nithyasrm, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Brinjal chutney', 'static/brinjal-chutney.webp', 'Booradleyp1, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Vazhaithandu poriyal', 'static/vazhaithandu-poriyal.webp', 'Ranjithsiji, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Vadam', 'static/vadam.webp', 'Niveda, CC BY-SA 3.0, via Wikimedia Commons')
)
update public.dishes d
set photo_path = p.photo_path,
    photo_credit = p.photo_credit
from photos p
where d.household_id is null
  and d.name = p.dish_name
  and d.photo_path is null;
