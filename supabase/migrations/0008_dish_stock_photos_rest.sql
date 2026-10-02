-- HomeFood · 0008: stock photos for the remaining 22 seeded dishes
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- 0007 did a pilot batch of 6; this covers every other seeded dish, so the whole starter catalogue
-- now has a picture. Same approach: photo_path holds a plain https:// Wikimedia Commons URL and
-- photo_credit holds the attribution (shown on Dish Detail, as CC BY / BY-SA require).
--
-- Mostly photos. Three are drawings instead (marked "(illustration)" in the credit): French fries,
-- Katsu curry and Vegetable soup — Commons has very few illustrations of named dishes, so these are
-- simple clip-art style SVG renders. Any household can still replace any of them with its own photo.
--
-- Only fills dishes that don't have a photo yet, so re-running it (or running it after 0007) never
-- overwrites anything. Sizes: 960px thumbnails where Commons serves one, otherwise the original
-- (those three originals are all under ~1000px wide).

with photos(dish_name, photo_path, photo_credit) as (
  select * from (values
    ('Ven Pongal',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ven_Pongal_with_cashew.jpg/960px-Ven_Pongal_with_cashew.jpg',
     'Sudhan Ram, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Rasam',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Rasam.JPG/960px-Rasam.JPG',
     'Miansari66, public domain, via Wikimedia Commons'),
    ('Curd rice',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Curd_Rice.jpg/960px-Curd_Rice.jpg',
     'Sudharshan Shanmugasundaram, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Idiyappam with stew',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Idiyappam.jpg/960px-Idiyappam.jpg',
     'Sundar, CC BY-SA 3.0, via Wikimedia Commons'),
    ('Medu vada',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Aesthetic_Medu_Vadai.jpg/960px-Aesthetic_Medu_Vadai.jpg',
     'Thamizhpparithi Maari, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Chapati',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chapati-1.jpg/960px-Chapati-1.jpg',
     'safaritravelplus, CC0, via Wikimedia Commons'),
    ('Paneer butter masala',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Paneer_butter_masala_2.jpg/960px-Paneer_butter_masala_2.jpg',
     'Gannu03, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Aloo paratha',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Aloo_paratha_served_with_daal%2C_curd_and_achar.jpg/960px-Aloo_paratha_served_with_daal%2C_curd_and_achar.jpg',
     'AjayDas, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Jeera rice',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jeera-rice.JPG/960px-Jeera-rice.JPG',
     'Sonia Goyal, CC BY-SA 2.0, via Wikimedia Commons'),
    ('Samosa',
     'https://upload.wikimedia.org/wikipedia/commons/9/95/Samosa_with_sweet_chutney.jpg',
     'Swathi sri srinivasa raghavan, CC0, via Wikimedia Commons'),
    ('Aloo tikki',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Aloo_Tikki_served_with_chutneys.jpg/960px-Aloo_Tikki_served_with_chutneys.jpg',
     'Raveesh Vyas, CC BY-SA 2.0, via Wikimedia Commons'),
    ('Pasta aglio e olio',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Spaghetti_Aglio_e_Olio_Acciuga.jpg/960px-Spaghetti_Aglio_e_Olio_Acciuga.jpg',
     'Schellenberg, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Grilled cheese sandwich',
     'https://upload.wikimedia.org/wikipedia/commons/8/89/Grilled_cheese_sandwich.jpg',
     'Maggie Hoffman, CC BY 2.0, via Wikimedia Commons'),
    ('Roast chicken',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Max%27s_Roasted_Chicken_-_Evan_Swigart.jpg/960px-Max%27s_Roasted_Chicken_-_Evan_Swigart.jpg',
     'Evan Swigart, CC BY 2.0, via Wikimedia Commons'),
    ('Vegetable tempura',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Vegetable_Tempura_-_Siam_Siam_2024-07-31.jpg/960px-Vegetable_Tempura_-_Siam_Siam_2024-07-31.jpg',
     'Andy Li, CC0, via Wikimedia Commons'),
    ('Onigiri',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Onigiri_002.jpg/960px-Onigiri_002.jpg',
     'Ocdp, CC0, via Wikimedia Commons'),
    ('Yakisoba',
     'https://upload.wikimedia.org/wikipedia/commons/0/03/Yakisoba_Houhi.jpg',
     'Kykk wiki, CC0, via Wikimedia Commons'),
    ('Sambar',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Tamilnadu_Sambar.jpg/960px-Tamilnadu_Sambar.jpg',
     'Samphotography, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Chole',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/960px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg',
     'Parzeus, CC BY-SA 4.0, via Wikimedia Commons'),
    -- drawings
    ('French fries',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/French-fries-155679.svg/960px-French-fries-155679.svg.png',
     'OpenClipart-Vectors, CC0, via Wikimedia Commons (illustration)'),
    ('Katsu curry',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Emoji_u1f35b.svg/960px-Emoji_u1f35b.svg.png',
     'Google (Noto Emoji), Apache License 2.0, via Wikimedia Commons (illustration)'),
    ('Vegetable soup',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Bowl-of-steaming-soup.svg/960px-Bowl-of-steaming-soup.svg.png',
     'eady (OpenClipart), CC0, via Wikimedia Commons (illustration)')
  ) as v(dish_name, photo_path, photo_credit)
)
update public.dishes d
set photo_path = p.photo_path,
    photo_credit = p.photo_credit
from photos p
where d.household_id is null
  and d.name = p.dish_name
  and d.photo_path is null;
