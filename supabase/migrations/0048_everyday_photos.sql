-- HomeFood · 0048: bundled photos for 31 more dishes (stock photos for the everyday dishes of 0046)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- Same idea as 0014 / 0018: photo_path = 'static/<file>' is a photo shipped with the app (public/dish-photos/), the credit goes in
-- photo_credit (free licences only; the credit is shown over the photo). Only fills shared dishes that have no photo yet, so running it
-- twice (or after a home has put in its own photo) changes nothing.

with photos(dish_name, photo_path, photo_credit) as (
  values
    ('Bread toast', 'static/bread-toast.webp', 'Gannu03, CC BY-SA 3.0, via Wikimedia Commons'),
    ('Peanut butter toast', 'static/peanut-butter-toast.webp', 'Daderot, CC0, via Wikimedia Commons'),
    ('Jam bread', 'static/jam-bread.webp', 'Evan Swigart from Chicago, USA, CC BY 2.0, via Wikimedia Commons'),
    ('Bread omelette', 'static/bread-omelette.webp', 'Gannu03, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Veg sandwich', 'static/veg-sandwich.webp', 'Ganesh Mohan T, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Egg sandwich', 'static/egg-sandwich.webp', 'Ocdp, CC0, via Wikimedia Commons'),
    ('Bread upma', 'static/bread-upma.webp', 'LuckyRani2990, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Oats porridge', 'static/oats-porridge.webp', 'Bodhi Peace, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Savoury oats', 'static/savoury-oats.webp', 'Status 401, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Cornflakes with milk', 'static/cornflakes-with-milk.webp', 'HaJunkiyada, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Scrambled eggs', 'static/scrambled-eggs.webp', 'OmegaFallon, CC BY 4.0, via Wikimedia Commons'),
    ('Half-boiled egg', 'static/half-boiled-egg.webp', 'Ceeseven, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Egg roll', 'static/egg-roll.webp', 'Hrishikes, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Egg fried rice', 'static/egg-fried-rice.webp', 'Gaurav Dhwaj Khadka, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Fruit bowl', 'static/fruit-bowl.webp', 'Manjeshwari poet mysore, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Banana', 'static/banana.webp', 'Wilfredor, CC BY-SA 3.0, via Wikimedia Commons'),
    ('Milk', 'static/milk.webp', 'NIAID, CC BY 2.0, via Wikimedia Commons'),
    ('Fresh fruit juice', 'static/fresh-fruit-juice.webp', 'Lombroso, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Lemon juice', 'static/lemon-juice.webp', 'Sapanabehl, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Rice kanji', 'static/rice-kanji.webp', 'Toshiyuki IMAI, CC BY-SA 2.0, via Wikimedia Commons'),
    ('Vegetable fried rice', 'static/vegetable-fried-rice.webp', 'Biswarup Ganguly, CC BY 3.0, via Wikimedia Commons'),
    ('Chicken fried rice', 'static/chicken-fried-rice.webp', 'Vee Satayamas from Bangkok, Thailand, CC BY 2.0, via Wikimedia Commons'),
    ('Veg noodles', 'static/veg-noodles.webp', 'Gaurav Dhwaj Khadka, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Instant noodles', 'static/instant-noodles.webp', 'David, public domain, via Wikimedia Commons'),
    ('Veg roll', 'static/veg-roll.webp', 'Shafana jasmine, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Sprouts salad', 'static/sprouts-salad.webp', 'Abhijit Patil, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Boiled corn', 'static/boiled-corn.webp', 'Satdeep Gill, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Roasted peanuts', 'static/roasted-peanuts.webp', 'Augustus Binu : flickr, CC BY-SA 3.0, via Wikimedia Commons'),
    ('Tomato soup', 'static/tomato-soup.webp', 'Shah Naisargi, CC BY-SA 4.0, via Wikimedia Commons'),
    ('Sweet corn soup', 'static/sweet-corn-soup.webp', 'Fumikas Sagisavas, CC0, via Wikimedia Commons'),
    ('Chicken soup', 'static/chicken-soup.webp', 'Hoyabird8, CC BY-SA 3.0, via Wikimedia Commons')
)
update public.dishes d
set photo_path = p.photo_path,
    photo_credit = p.photo_credit
from photos p
where d.household_id is null
  and d.name = p.dish_name
  and d.photo_path is null;
