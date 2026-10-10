-- HomeFood · 0021: tiffin dishes work for both breakfast and dinner
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- Many homes eat idli, dosa, upma and rotis at both breakfast and dinner, but the shared catalogue tagged most of them for one
-- meal only, so filtering the planner or the Dishes tab by Breakfast or Dinner hid dishes people really cook then. This adds the
-- other meal to the dishes that obviously work for both. Sweets, drinks and sweet porridges are left alone. Lunch is untouched.

-- breakfast dishes that are also fine at dinner
update public.dishes
set meal_types = meal_types || '{dinner}'::public.meal_type[]
where household_id is null
  and not ('dinner' = any (meal_types))
  and name in (
    'Idli', 'Dosa', 'Ven Pongal', 'Aloo paratha', 'Upma', 'Pesarattu', 'Puttu', 'Poha', 'Besan chilla', 'Dhokla',
    'Rava idli', 'Podi idli', 'Mini idli sambar', 'Set dosa', 'Paper roast', 'Khara bath', 'Semiya upma', 'Godhumai rava upma',
    'Arisi upma', 'Samai upma', 'Kuzhi paniyaram', 'Poori', 'Sambar vada', 'Thinai pongal', 'Akki roti', 'Vangi bath',
    'Chole bhature', 'Kadala curry'
  );

-- dinner dishes that are also fine at breakfast
update public.dishes
set meal_types = meal_types || '{breakfast}'::public.meal_type[]
where household_id is null
  and not ('breakfast' = any (meal_types))
  and name in (
    'Idiyappam with stew', 'Chapati', 'Parotta', 'Veechu parotta', 'Phulka', 'Khichdi', 'Egg podimas', 'Sambar', 'Salna',
    'Curd', 'Jeera aloo'
  );
