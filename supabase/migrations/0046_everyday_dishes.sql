-- HomeFood · 0046: 33 everyday dishes the shared catalogue was missing
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice (a name that already exists is skipped).
-- Bread toast, bread omelette, sandwiches, oats, cornflakes, eggs the everyday ways (scrambled, half-boiled, roll, fried rice), fruit, milk, juice, kanji,
-- sevai, fried rice, noodles, rolls, sprouts, corn, soups. Dishes per meal: breakfast 20, lunch 4, snacks 22, dinner 13.
-- Each has an English and a Tamil name, a per-serving nutrition estimate (typical home portion, rounded; not lab values) and diet tags worked out by the
-- same rules as 0040 (scripts/diet_tag_rules.py). No photos and no recipes yet: a home can add its own photo, and the Recipe button shows only for dishes that have a recipe.

with seed(cuisine_id, name, name_ta, meal_types, course, diet, tags, allergens, prep_minutes) as (
  select * from (values
    ('00000000-0000-4000-8000-000000000004'::uuid, 'Bread toast'::text, 'ரொட்டி டோஸ்ட்'::text, '{breakfast,snacks}'::public.meal_type[], 'both'::public.dish_course, 'veg'::public.diet_type, '{low_sugar,grain,dairy}'::text[], '{wheat,milk}'::text[], 5::smallint),
    ('00000000-0000-4000-8000-000000000004', 'Peanut butter toast', 'வேர்க்கடலை வெண்ணெய் டோஸ்ட்', '{breakfast,snacks}', 'both', 'veg', '{oily,grain}', '{wheat,peanut}', 5),
    ('00000000-0000-4000-8000-000000000004', 'Jam bread', 'ஜாம் ரொட்டி', '{breakfast,snacks}', 'both', 'veg', '{sweet,low_oil,grain}', '{wheat}', 3),
    ('00000000-0000-4000-8000-000000000003', 'Bread omelette', 'பிரெட் ஆம்லெட்', '{breakfast,snacks,dinner}', 'main', 'egg', '{high_protein,low_sugar,onion_garlic,oily,grain,egg}', '{egg,wheat,milk}', 10),
    ('00000000-0000-4000-8000-000000000004', 'Veg sandwich', 'வெஜ் சாண்ட்விச்', '{breakfast,snacks}', 'main', 'veg', '{grain,dairy,vegetable}', '{wheat,milk}', 10),
    ('00000000-0000-4000-8000-000000000004', 'Egg sandwich', 'முட்டை சாண்ட்விச்', '{breakfast,snacks}', 'main', 'egg', '{oily,grain,dairy,egg}', '{egg,wheat,milk}', 10),
    ('00000000-0000-4000-8000-000000000002', 'Bread upma', 'பிரெட் உப்புமா', '{breakfast,snacks}', 'main', 'veg', '{low_sugar,onion_garlic,grain}', '{wheat}', 15),
    ('00000000-0000-4000-8000-000000000004', 'Oats porridge', 'ஓட்ஸ் கஞ்சி', '{breakfast}', 'main', 'veg', '{grain,dairy}', '{milk}', 10),
    ('00000000-0000-4000-8000-000000000002', 'Savoury oats', 'காரமான ஓட்ஸ்', '{breakfast}', 'main', 'veg', '{low_sugar,onion_garlic,grain,root_veg,vegetable}', '{}', 15),
    ('00000000-0000-4000-8000-000000000004', 'Cornflakes with milk', 'கார்ன்ஃப்ளேக்ஸ் பாலுடன்', '{breakfast}', 'main', 'veg', '{low_oil,sweet,grain,dairy}', '{milk}', 3),
    ('00000000-0000-4000-8000-000000000004', 'Scrambled eggs', 'ஸ்க்ராம்பிள்டு முட்டை', '{breakfast,dinner}', 'both', 'egg', '{low_carb,high_protein,low_sugar,oily,dairy,egg}', '{egg,milk}', 8),
    ('00000000-0000-4000-8000-000000000002', 'Half-boiled egg', 'ஹாஃப் பாயில் முட்டை', '{breakfast}', 'both', 'egg', '{low_carb,light,low_sugar,egg}', '{egg}', 6),
    ('00000000-0000-4000-8000-000000000003', 'Egg roll', 'முட்டை ரோல்', '{snacks,dinner}', 'main', 'egg', '{low_sugar,onion_garlic,salty,oily,grain,egg}', '{egg,wheat}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Egg fried rice', 'முட்டை ஃப்ரைடு ரைஸ்', '{lunch,dinner}', 'main', 'egg', '{low_sugar,onion_garlic,salty,oily,grain,egg}', '{egg,soy}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Fruit bowl', 'பழக் கிண்ணம்', '{breakfast,snacks}', 'both', 'veg', '{light,low_oil,fasting_food,sweet,vegetable}', '{}', 5),
    ('00000000-0000-4000-8000-000000000002', 'Banana', 'வாழைப்பழம்', '{breakfast,snacks}', 'both', 'veg', '{light,low_oil,fasting_food,sweet}', '{}', 1),
    ('00000000-0000-4000-8000-000000000002', 'Milk', 'பால்', '{breakfast,snacks}', 'side', 'veg', '{low_carb,light,fasting_food,dairy}', '{milk}', 3),
    ('00000000-0000-4000-8000-000000000002', 'Fresh fruit juice', 'பழச்சாறு', '{breakfast,snacks}', 'side', 'veg', '{sweet,light,low_oil,fasting_food}', '{}', 8),
    ('00000000-0000-4000-8000-000000000002', 'Lemon juice', 'எலுமிச்சை சாறு', '{snacks}', 'side', 'veg', '{light,low_oil,fasting_food,sweet,added_sugar}', '{}', 5),
    ('00000000-0000-4000-8000-000000000002', 'Rice kanji', 'அரிசி கஞ்சி', '{breakfast,dinner}', 'main', 'veg', '{light,low_oil,low_sugar,grain}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Lemon sevai', 'எலுமிச்சை சேவை', '{breakfast}', 'main', 'veg', '{low_sugar,grain}', '{peanut}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Coconut sevai', 'தேங்காய் சேவை', '{breakfast}', 'main', 'veg', '{low_sugar,grain}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Vegetable fried rice', 'வெஜிடபிள் ஃப்ரைடு ரைஸ்', '{lunch,dinner}', 'main', 'veg', '{low_sugar,onion_garlic,salty,grain,root_veg,vegetable}', '{soy}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Chicken fried rice', 'சிக்கன் ஃப்ரைடு ரைஸ்', '{lunch,dinner}', 'main', 'non_veg', '{high_protein,low_sugar,onion_garlic,salty,oily,grain,meat}', '{soy}', 30),
    ('00000000-0000-4000-8000-000000000004', 'Veg noodles', 'வெஜ் நூடுல்ஸ்', '{lunch,dinner,snacks}', 'main', 'veg', '{salty,grain,root_veg,vegetable}', '{wheat,soy}', 20),
    ('00000000-0000-4000-8000-000000000004', 'Instant noodles', 'இன்ஸ்டன்ட் நூடுல்ஸ்', '{snacks,dinner}', 'main', 'veg', '{low_sugar,salty,oily,grain}', '{wheat}', 8),
    ('00000000-0000-4000-8000-000000000003', 'Veg roll', 'வெஜ் ரோல்', '{snacks,dinner}', 'main', 'veg', '{low_sugar,onion_garlic,oily,grain,root_veg,vegetable}', '{wheat}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Sprouts salad', 'முளைகட்டிய பயறு சாலட்', '{breakfast,snacks}', 'main', 'veg', '{high_protein,light,low_oil,low_sugar,onion_garlic,pulse,vegetable}', '{}', 10),
    ('00000000-0000-4000-8000-000000000002', 'Boiled corn', 'வேகவைத்த சோளம்', '{snacks}', 'main', 'veg', '{steamed,light,low_oil,fasting_food}', '{}', 15),
    ('00000000-0000-4000-8000-000000000002', 'Roasted peanuts', 'வறுத்த வேர்க்கடலை', '{snacks}', 'side', 'veg', '{low_carb,low_sugar,oily}', '{peanut}', 10),
    ('00000000-0000-4000-8000-000000000004', 'Tomato soup', 'தக்காளி சூப்', '{snacks,dinner}', 'side', 'veg', '{low_carb,light,low_oil,onion_garlic,dairy,vegetable}', '{milk}', 20),
    ('00000000-0000-4000-8000-000000000004', 'Sweet corn soup', 'ஸ்வீட் கார்ன் சூப்', '{snacks,dinner}', 'side', 'veg', '{light,low_oil,salty,grain,root_veg,vegetable}', '{}', 20),
    ('00000000-0000-4000-8000-000000000004', 'Chicken soup', 'சிக்கன் சூப்', '{snacks,dinner}', 'side', 'non_veg', '{low_carb,high_protein,light,low_oil,low_sugar,onion_garlic,meat}', '{}', 30)
  ) as v(cuisine_id, name, name_ta, meal_types, course, diet, tags, allergens, prep_minutes)
  where not exists (select 1 from public.dishes d where d.household_id is null and d.name = v.name)
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

-- ── Per-serving nutrition estimates ──
insert into public.dish_nutrition (dish_id, serving, kcal, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg)
select d.id, x.serving, x.kcal, x.protein, x.carbs, x.fat, x.fibre, x.sugar, x.sodium
from jsonb_to_recordset($json$
[
{
"dish": "Bread toast",
"serving": "2 slices with butter",
"kcal": 190.0,
"protein": 6.0,
"carbs": 28.0,
"fat": 6.0,
"fibre": 2.0,
"sugar": 3.0,
"sodium": 380.0
},
{
"dish": "Peanut butter toast",
"serving": "2 slices",
"kcal": 300.0,
"protein": 11.0,
"carbs": 30.0,
"fat": 15.0,
"fibre": 4.0,
"sugar": 5.0,
"sodium": 400.0
},
{
"dish": "Jam bread",
"serving": "2 slices with jam",
"kcal": 210.0,
"protein": 5.0,
"carbs": 42.0,
"fat": 2.0,
"fibre": 2.0,
"sugar": 14.0,
"sodium": 330.0
},
{
"dish": "Bread omelette",
"serving": "1 bread omelette (2 eggs, 2 slices)",
"kcal": 340.0,
"protein": 16.0,
"carbs": 28.0,
"fat": 18.0,
"fibre": 2.0,
"sugar": 3.0,
"sodium": 560.0
},
{
"dish": "Veg sandwich",
"serving": "1 sandwich (2 slices)",
"kcal": 260.0,
"protein": 8.0,
"carbs": 38.0,
"fat": 8.0,
"fibre": 3.0,
"sugar": 5.0,
"sodium": 520.0
},
{
"dish": "Egg sandwich",
"serving": "1 sandwich (2 slices)",
"kcal": 300.0,
"protein": 13.0,
"carbs": 30.0,
"fat": 14.0,
"fibre": 2.0,
"sugar": 4.0,
"sodium": 540.0
},
{
"dish": "Bread upma",
"serving": "1 cup",
"kcal": 260.0,
"protein": 6.0,
"carbs": 38.0,
"fat": 9.0,
"fibre": 2.0,
"sugar": 3.0,
"sodium": 480.0
},
{
"dish": "Oats porridge",
"serving": "1 bowl made with milk",
"kcal": 220.0,
"protein": 9.0,
"carbs": 34.0,
"fat": 6.0,
"fibre": 4.0,
"sugar": 9.0,
"sodium": 90.0
},
{
"dish": "Savoury oats",
"serving": "1 bowl",
"kcal": 200.0,
"protein": 7.0,
"carbs": 30.0,
"fat": 6.0,
"fibre": 4.0,
"sugar": 2.0,
"sodium": 420.0
},
{
"dish": "Cornflakes with milk",
"serving": "1 bowl",
"kcal": 210.0,
"protein": 7.0,
"carbs": 38.0,
"fat": 3.0,
"fibre": 1.0,
"sugar": 12.0,
"sodium": 260.0
},
{
"dish": "Scrambled eggs",
"serving": "2 eggs",
"kcal": 200.0,
"protein": 13.0,
"carbs": 2.0,
"fat": 15.0,
"fibre": 0.0,
"sugar": 1.0,
"sodium": 330.0
},
{
"dish": "Half-boiled egg",
"serving": "1 egg",
"kcal": 78.0,
"protein": 6.3,
"carbs": 0.6,
"fat": 5.3,
"fibre": 0.0,
"sugar": 0.6,
"sodium": 140.0
},
{
"dish": "Egg roll",
"serving": "1 roll",
"kcal": 350.0,
"protein": 14.0,
"carbs": 38.0,
"fat": 16.0,
"fibre": 2.0,
"sugar": 3.0,
"sodium": 620.0
},
{
"dish": "Egg fried rice",
"serving": "1 plate",
"kcal": 420.0,
"protein": 14.0,
"carbs": 56.0,
"fat": 15.0,
"fibre": 2.0,
"sugar": 3.0,
"sodium": 820.0
},
{
"dish": "Fruit bowl",
"serving": "1 bowl (150 g)",
"kcal": 90.0,
"protein": 1.0,
"carbs": 22.0,
"fat": 0.3,
"fibre": 3.0,
"sugar": 16.0,
"sodium": 5.0
},
{
"dish": "Banana",
"serving": "1 medium",
"kcal": 90.0,
"protein": 1.0,
"carbs": 23.0,
"fat": 0.3,
"fibre": 2.6,
"sugar": 12.0,
"sodium": 1.0
},
{
"dish": "Milk",
"serving": "1 glass (250 ml)",
"kcal": 150.0,
"protein": 8.0,
"carbs": 12.0,
"fat": 8.0,
"fibre": 0.0,
"sugar": 11.0,
"sodium": 100.0
},
{
"dish": "Fresh fruit juice",
"serving": "1 glass (250 ml)",
"kcal": 110.0,
"protein": 1.0,
"carbs": 26.0,
"fat": 0.2,
"fibre": 0.5,
"sugar": 22.0,
"sodium": 5.0
},
{
"dish": "Lemon juice",
"serving": "1 glass (250 ml)",
"kcal": 70.0,
"protein": 0.0,
"carbs": 18.0,
"fat": 0.0,
"fibre": 0.0,
"sugar": 16.0,
"sodium": 150.0
},
{
"dish": "Rice kanji",
"serving": "1 bowl",
"kcal": 130.0,
"protein": 3.0,
"carbs": 28.0,
"fat": 0.5,
"fibre": 1.0,
"sugar": 0.5,
"sodium": 160.0
},
{
"dish": "Lemon sevai",
"serving": "1 cup",
"kcal": 250.0,
"protein": 5.0,
"carbs": 42.0,
"fat": 7.0,
"fibre": 2.0,
"sugar": 1.0,
"sodium": 480.0
},
{
"dish": "Coconut sevai",
"serving": "1 cup",
"kcal": 270.0,
"protein": 5.0,
"carbs": 42.0,
"fat": 9.0,
"fibre": 3.0,
"sugar": 1.0,
"sodium": 400.0
},
{
"dish": "Vegetable fried rice",
"serving": "1 plate",
"kcal": 350.0,
"protein": 8.0,
"carbs": 56.0,
"fat": 10.0,
"fibre": 3.0,
"sugar": 3.0,
"sodium": 780.0
},
{
"dish": "Chicken fried rice",
"serving": "1 plate",
"kcal": 450.0,
"protein": 20.0,
"carbs": 56.0,
"fat": 15.0,
"fibre": 2.0,
"sugar": 3.0,
"sodium": 880.0
},
{
"dish": "Veg noodles",
"serving": "1 plate",
"kcal": 360.0,
"protein": 9.0,
"carbs": 58.0,
"fat": 10.0,
"fibre": 4.0,
"sugar": 4.0,
"sodium": 820.0
},
{
"dish": "Instant noodles",
"serving": "1 pack (70 g dry)",
"kcal": 350.0,
"protein": 7.0,
"carbs": 52.0,
"fat": 13.0,
"fibre": 2.0,
"sugar": 3.0,
"sodium": 1100.0
},
{
"dish": "Veg roll",
"serving": "1 roll",
"kcal": 300.0,
"protein": 8.0,
"carbs": 42.0,
"fat": 12.0,
"fibre": 3.0,
"sugar": 3.0,
"sodium": 540.0
},
{
"dish": "Sprouts salad",
"serving": "1 bowl",
"kcal": 150.0,
"protein": 10.0,
"carbs": 22.0,
"fat": 2.0,
"fibre": 6.0,
"sugar": 3.0,
"sodium": 180.0
},
{
"dish": "Boiled corn",
"serving": "1 cob",
"kcal": 130.0,
"protein": 4.0,
"carbs": 29.0,
"fat": 1.5,
"fibre": 3.0,
"sugar": 5.0,
"sodium": 20.0
},
{
"dish": "Roasted peanuts",
"serving": "1 handful (30 g)",
"kcal": 170.0,
"protein": 7.0,
"carbs": 5.0,
"fat": 14.0,
"fibre": 3.0,
"sugar": 1.0,
"sodium": 5.0
},
{
"dish": "Tomato soup",
"serving": "1 bowl",
"kcal": 90.0,
"protein": 2.0,
"carbs": 14.0,
"fat": 3.0,
"fibre": 2.0,
"sugar": 8.0,
"sodium": 520.0
},
{
"dish": "Sweet corn soup",
"serving": "1 bowl",
"kcal": 100.0,
"protein": 3.0,
"carbs": 18.0,
"fat": 2.0,
"fibre": 2.0,
"sugar": 4.0,
"sodium": 600.0
},
{
"dish": "Chicken soup",
"serving": "1 bowl",
"kcal": 110.0,
"protein": 10.0,
"carbs": 8.0,
"fat": 4.0,
"fibre": 1.0,
"sugar": 2.0,
"sodium": 540.0
}
]
$json$::jsonb) as x(dish text, serving text, kcal numeric, protein numeric, carbs numeric, fat numeric, fibre numeric, sugar numeric, sodium numeric)
join public.dishes d on d.household_id is null and d.name = x.dish
on conflict (dish_id) do nothing;
