-- HomeFood · 0007: real stock photos for a pilot batch of seeded dishes
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Seeded dishes (household_id null) currently show the colour+initial placeholder everywhere
-- (CLAUDE.md Step 3: "No real stock photos"). This fills in dishes.photo_path for 6 of the ~27
-- seeded dishes, one or two per cuisine, as a pilot before doing the rest.
--
-- photo_path holds a plain https:// URL here, not a storage path — the column comment on dishes
-- ("storage path or stock image URL") already anticipated this. useSignedPhotoUrl() in
-- src/lib/dishQueries.ts was updated to serve an http(s) path as-is instead of trying to sign it
-- against the private dish-photos bucket, which only ever holds per-household uploads.
--
-- Every photo below is Wikimedia Commons, freely licensed (CC0 or CC-BY/-SA), credited in
-- photo_credit per the spec's "attribution kept in the data file" plan. Picked from each dish's
-- own file-description page; URL is the exact thumbnail size Commons already serves for that
-- page (arbitrary widths are throttled by Commons' thumbnail generator unless already cached).

with photos(dish_name, photo_path, photo_credit) as (
  select * from (values
    ('Dosa',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Sada-Dosa.jpg/960px-Sada-Dosa.jpg',
     'Shrads.m, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Idli',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Fluffy_Idlies.jpg/960px-Fluffy_Idlies.jpg',
     'Kaushigha, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Butter chicken',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Butter_chicken_%286032497682%29.jpg/960px-Butter_chicken_%286032497682%29.jpg',
     'Isabelle Hurbain-Palatin, CC BY-SA 2.0, via Wikimedia Commons'),
    ('Margherita pizza',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Cheese_Pizza_watercolor_art.png/960px-Cheese_Pizza_watercolor_art.png',
     'ThePantherSun RULES!, CC BY 4.0, via Wikimedia Commons (illustration)'),
    ('Chicken teriyaki',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Chicken_teriyaki_closeup.JPG/960px-Chicken_teriyaki_closeup.JPG',
     'BrokenSphere, CC BY-SA 3.0, via Wikimedia Commons'),
    ('Miso soup',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/A_bowl_of_miso_soup.jpg/960px-A_bowl_of_miso_soup.jpg',
     'Douglas Perkins, CC0, via Wikimedia Commons')
  ) as v(dish_name, photo_path, photo_credit)
)
update public.dishes d
set photo_path = p.photo_path,
    photo_credit = p.photo_credit
from photos p
where d.household_id is null
  and d.name = p.dish_name;
