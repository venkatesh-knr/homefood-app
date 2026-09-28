-- HomeFood · 0005: starter dish catalogue
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run (as
-- one script — it defines a temporary helper procedure it uses below).
-- A shared (household_id null) starter set so the Dishes tab has something to
-- search, filter and pick from right away. Not the full "10-12 snacks per
-- cuisine" from CLAUDE.md's Step 3 notes — that's a content task worth doing
-- separately (and safely, in small batches) rather than in one migration.
-- Each dish also gets an English and Tamil name in dish_names.

-- pg_temp so this helper never lingers in the public schema after the script ends.
create or replace procedure pg_temp.add_seed_dish(
  p_cuisine uuid, p_name text, p_name_ta text, p_meal_types public.meal_type[], p_course public.dish_course,
  p_diet public.diet_type, p_tags text[], p_allergens text[], p_prep smallint
) language plpgsql as $$
declare d uuid;
begin
  insert into public.dishes (household_id, cuisine_id, name, meal_types, course, diet, tags, allergens, prep_minutes)
    values (null, p_cuisine, p_name, p_meal_types, p_course, p_diet, p_tags, p_allergens, p_prep)
    returning id into d;
  insert into public.dish_names (dish_id, language, name) values (d, 'en', p_name), (d, 'ta', p_name_ta);
end $$;

do $$
declare
  south uuid := '00000000-0000-4000-8000-000000000002';
  north uuid := '00000000-0000-4000-8000-000000000003';
  euro  uuid := '00000000-0000-4000-8000-000000000004';
  jp    uuid := '00000000-0000-4000-8000-000000000005';
begin
  -- Skip entirely if this has already been run (e.g. migration re-applied by mistake).
  if exists (select 1 from public.dishes where household_id is null) then
    raise notice 'Shared dishes already seeded — skipping.';
    return;
  end if;

  -- South Indian
  call pg_temp.add_seed_dish(south, 'Idli', 'இட்லி', '{breakfast}', 'main', 'veg', '{steamed}', '{}', 20);
  call pg_temp.add_seed_dish(south, 'Dosa', 'தோசை', '{breakfast}', 'main', 'veg', '{}', '{}', 25);
  call pg_temp.add_seed_dish(south, 'Ven Pongal', 'வெண் பொங்கல்', '{breakfast}', 'main', 'veg', '{ghee}', '{milk,cashew}', 30);
  call pg_temp.add_seed_dish(south, 'Sambar', 'சாம்பார்', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 30);
  call pg_temp.add_seed_dish(south, 'Rasam', 'ரசம்', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 20);
  call pg_temp.add_seed_dish(south, 'Curd rice', 'தயிர் சாதம்', '{lunch}', 'main', 'veg', '{}', '{milk}', 15);
  call pg_temp.add_seed_dish(south, 'Idiyappam with stew', 'இடியாப்பம் ஸ்டூ', '{dinner}', 'main', 'veg', '{}', '{}', 35);
  call pg_temp.add_seed_dish(south, 'Medu vada', 'மெதுவடை', '{snacks}', 'side', 'veg', '{fried}', '{}', 25);

  -- North Indian
  call pg_temp.add_seed_dish(north, 'Chapati', 'சப்பாத்தி', '{dinner}', 'main', 'veg', '{}', '{wheat}', 20);
  call pg_temp.add_seed_dish(north, 'Paneer butter masala', 'பன்னீர் பட்டர் மசாலா', '{lunch,dinner}', 'main', 'veg', '{}', '{milk,cashew}', 35);
  call pg_temp.add_seed_dish(north, 'Chole', 'சோலே', '{lunch,dinner}', 'main', 'veg', '{}', '{}', 40);
  call pg_temp.add_seed_dish(north, 'Aloo paratha', 'ஆலு பராத்தா', '{breakfast}', 'main', 'veg', '{}', '{wheat,milk}', 30);
  call pg_temp.add_seed_dish(north, 'Butter chicken', 'பட்டர் சிக்கன்', '{dinner}', 'main', 'non_veg', '{}', '{milk}', 45);
  call pg_temp.add_seed_dish(north, 'Jeera rice', 'சீரக சாதம்', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 20);
  call pg_temp.add_seed_dish(north, 'Samosa', 'சமோசா', '{snacks}', 'side', 'veg', '{fried}', '{wheat}', 30);
  call pg_temp.add_seed_dish(north, 'Aloo tikki', 'ஆலு டிக்கி', '{snacks}', 'side', 'veg', '{fried}', '{wheat}', 25);

  -- European
  call pg_temp.add_seed_dish(euro, 'Pasta aglio e olio', 'பாஸ்தா அஜ்லியோ ஒலியோ', '{lunch,dinner}', 'main', 'veg', '{}', '{wheat}', 20);
  call pg_temp.add_seed_dish(euro, 'Margherita pizza', 'மார்கரிட்டா பீட்சா', '{lunch,dinner}', 'main', 'veg', '{}', '{wheat,milk}', 40);
  call pg_temp.add_seed_dish(euro, 'Grilled cheese sandwich', 'கிரில்டு சீஸ் சாண்ட்விச்', '{snacks}', 'main', 'veg', '{}', '{wheat,milk}', 15);
  call pg_temp.add_seed_dish(euro, 'Vegetable soup', 'காய்கறி சூப்', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 30);
  call pg_temp.add_seed_dish(euro, 'Roast chicken', 'வறுத்த கோழி', '{dinner}', 'main', 'non_veg', '{}', '{}', 60);
  call pg_temp.add_seed_dish(euro, 'French fries', 'பிரெஞ்ச் ஃப்ரைஸ்', '{snacks}', 'side', 'veg', '{fried}', '{}', 20);

  -- Japanese
  call pg_temp.add_seed_dish(jp, 'Chicken teriyaki', 'சிக்கன் தெரியாகி', '{dinner}', 'main', 'non_veg', '{}', '{soy,wheat}', 30);
  call pg_temp.add_seed_dish(jp, 'Katsu curry', 'கட்சு கறி', '{dinner}', 'main', 'non_veg', '{fried}', '{egg,wheat}', 40);
  call pg_temp.add_seed_dish(jp, 'Miso soup', 'மிசோ சூப்', '{lunch,dinner}', 'side', 'veg', '{}', '{soy}', 15);
  call pg_temp.add_seed_dish(jp, 'Vegetable tempura', 'காய்கறி டெம்புரா', '{snacks}', 'side', 'veg', '{fried}', '{wheat}', 25);
  call pg_temp.add_seed_dish(jp, 'Onigiri', 'ஒனிகிரி', '{snacks}', 'main', 'veg', '{}', '{}', 15);
  call pg_temp.add_seed_dish(jp, 'Yakisoba', 'யாகிசோபா', '{dinner}', 'main', 'egg', '{}', '{egg,wheat,soy}', 25);

  raise notice 'Seeded % shared dishes.', (select count(*) from public.dishes where household_id is null);
end $$;

drop procedure if exists pg_temp.add_seed_dish(uuid, text, text, public.meal_type[], public.dish_course, public.diet_type, text[], text[], smallint);
