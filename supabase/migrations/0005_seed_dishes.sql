-- HomeFood · 0005: starter dish catalogue
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- A shared (household_id null) starter set so the Dishes tab has something to
-- search, filter and pick from right away. Not the full "10-12 snacks per
-- cuisine" from CLAUDE.md's Step 3 notes — that's a content task worth doing
-- separately (and safely, in small batches) rather than in one migration.
-- Each dish also gets an English and Tamil name in dish_names. Safe to run
-- twice: the seed list is empty (so nothing is inserted) once any shared
-- dish already exists.

with seed(cuisine_id, name, name_ta, meal_types, course, diet, tags, allergens, prep_minutes) as (
  select * from (values
    -- South Indian (only the first row of each cuisine needs the ::casts —
    -- Postgres infers the rest of the column's type from it)
    ('00000000-0000-4000-8000-000000000002'::uuid, 'Idli'::text, 'இட்லி'::text, '{breakfast}'::public.meal_type[], 'main'::public.dish_course, 'veg'::public.diet_type, '{steamed}'::text[], '{}'::text[], 20::smallint),
    ('00000000-0000-4000-8000-000000000002', 'Dosa', 'தோசை', '{breakfast}', 'main', 'veg', '{}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Ven Pongal', 'வெண் பொங்கல்', '{breakfast}', 'main', 'veg', '{ghee}', '{milk,cashew}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Sambar', 'சாம்பார்', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Rasam', 'ரசம்', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Curd rice', 'தயிர் சாதம்', '{lunch}', 'main', 'veg', '{}', '{milk}', 15),
    ('00000000-0000-4000-8000-000000000002', 'Idiyappam with stew', 'இடியாப்பம் ஸ்டூ', '{dinner}', 'main', 'veg', '{}', '{}', 35),
    ('00000000-0000-4000-8000-000000000002', 'Medu vada', 'மெதுவடை', '{snacks}', 'side', 'veg', '{fried}', '{}', 25),

    -- North Indian
    ('00000000-0000-4000-8000-000000000003', 'Chapati', 'சப்பாத்தி', '{dinner}', 'main', 'veg', '{}', '{wheat}', 20),
    ('00000000-0000-4000-8000-000000000003', 'Paneer butter masala', 'பன்னீர் பட்டர் மசாலா', '{lunch,dinner}', 'main', 'veg', '{}', '{milk,cashew}', 35),
    ('00000000-0000-4000-8000-000000000003', 'Chole', 'சோலே', '{lunch,dinner}', 'main', 'veg', '{}', '{}', 40),
    ('00000000-0000-4000-8000-000000000003', 'Aloo paratha', 'ஆலு பராத்தா', '{breakfast}', 'main', 'veg', '{}', '{wheat,milk}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Butter chicken', 'பட்டர் சிக்கன்', '{dinner}', 'main', 'non_veg', '{}', '{milk}', 45),
    ('00000000-0000-4000-8000-000000000003', 'Jeera rice', 'சீரக சாதம்', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000003', 'Samosa', 'சமோசா', '{snacks}', 'side', 'veg', '{fried}', '{wheat}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Aloo tikki', 'ஆலு டிக்கி', '{snacks}', 'side', 'veg', '{fried}', '{wheat}', 25),

    -- European
    ('00000000-0000-4000-8000-000000000004', 'Pasta aglio e olio', 'பாஸ்தா அஜ்லியோ ஒலியோ', '{lunch,dinner}', 'main', 'veg', '{}', '{wheat}', 20),
    ('00000000-0000-4000-8000-000000000004', 'Margherita pizza', 'மார்கரிட்டா பீட்சா', '{lunch,dinner}', 'main', 'veg', '{}', '{wheat,milk}', 40),
    ('00000000-0000-4000-8000-000000000004', 'Grilled cheese sandwich', 'கிரில்டு சீஸ் சாண்ட்விச்', '{snacks}', 'main', 'veg', '{}', '{wheat,milk}', 15),
    ('00000000-0000-4000-8000-000000000004', 'Vegetable soup', 'காய்கறி சூப்', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 30),
    ('00000000-0000-4000-8000-000000000004', 'Roast chicken', 'வறுத்த கோழி', '{dinner}', 'main', 'non_veg', '{}', '{}', 60),
    ('00000000-0000-4000-8000-000000000004', 'French fries', 'பிரெஞ்ச் ஃப்ரைஸ்', '{snacks}', 'side', 'veg', '{fried}', '{}', 20),

    -- Japanese
    ('00000000-0000-4000-8000-000000000005', 'Chicken teriyaki', 'சிக்கன் தெரியாகி', '{dinner}', 'main', 'non_veg', '{}', '{soy,wheat}', 30),
    ('00000000-0000-4000-8000-000000000005', 'Katsu curry', 'கட்சு கறி', '{dinner}', 'main', 'non_veg', '{fried}', '{egg,wheat}', 40),
    ('00000000-0000-4000-8000-000000000005', 'Miso soup', 'மிசோ சூப்', '{lunch,dinner}', 'side', 'veg', '{}', '{soy}', 15),
    ('00000000-0000-4000-8000-000000000005', 'Vegetable tempura', 'காய்கறி டெம்புரா', '{snacks}', 'side', 'veg', '{fried}', '{wheat}', 25),
    ('00000000-0000-4000-8000-000000000005', 'Onigiri', 'ஒனிகிரி', '{snacks}', 'main', 'veg', '{}', '{}', 15),
    ('00000000-0000-4000-8000-000000000005', 'Yakisoba', 'யாகிசோபா', '{dinner}', 'main', 'egg', '{}', '{egg,wheat,soy}', 25)
  ) as v(cuisine_id, name, name_ta, meal_types, course, diet, tags, allergens, prep_minutes)
  -- Skip entirely if this has already been run (e.g. migration re-applied by mistake).
  where not exists (select 1 from public.dishes where household_id is null)
),
inserted as (
  insert into public.dishes (household_id, cuisine_id, name, meal_types, course, diet, tags, allergens, prep_minutes)
  select null, cuisine_id, name, meal_types, course, diet, tags, allergens, prep_minutes from seed
  returning id, name
),
names_en as (
  insert into public.dish_names (dish_id, language, name)
  select id, 'en', name from inserted
  returning dish_id
),
names_ta as (
  insert into public.dish_names (dish_id, language, name)
  select i.id, 'ta', s.name_ta from inserted i join seed s using (name)
  returning dish_id
)
select
  (select count(*) from inserted) as dishes_inserted,
  (select count(*) from names_en) as english_names_inserted,
  (select count(*) from names_ta) as tamil_names_inserted;
