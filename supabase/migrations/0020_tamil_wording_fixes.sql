-- HomeFood · 0020: Tamil wording fixes after a proofreading pass
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice (it only sets the corrected text).
-- 1. Three dish names get the missing sandhi (வெங்காயப் பக்கோடா, வெங்காயச் சட்னி, வெங்காயப் பச்சடி).
-- 2. 34 recipe ingredient names are made consistent across all recipes (one Tamil word for the same ingredient, and
--    "ghee or oil" now says both). Quantities, units and English text are untouched.

update public.dish_names n
set name = f.new_name
from (values
    ('Onion pakoda', 'வெங்காய பக்கோடா', 'வெங்காயப் பக்கோடா'),
    ('Onion chutney', 'வெங்காய சட்னி', 'வெங்காயச் சட்னி'),
    ('Onion pachadi', 'வெங்காய பச்சடி', 'வெங்காயப் பச்சடி')
) as f(dish, old_name, new_name)
join public.dishes d on d.household_id is null and d.name = f.dish
where n.dish_id = d.id and n.language = 'ta' and n.name = f.old_name;

with fixes as (
  select * from jsonb_to_recordset($json$
[
{
"dish": "Idli",
"kind": "ing",
"pos": 2,
"ta": "உளுத்தம் பருப்பு"
},
{
"dish": "Dosa",
"kind": "ing",
"pos": 2,
"ta": "உளுத்தம் பருப்பு"
},
{
"dish": "Sambar",
"kind": "ing",
"pos": 7,
"ta": "காய்ந்த மிளகாய்"
},
{
"dish": "Rasam",
"kind": "ing",
"pos": 3,
"ta": "ரசப்பொடி"
},
{
"dish": "Curd rice",
"kind": "ing",
"pos": 5,
"ta": "உளுத்தம் பருப்பு"
},
{
"dish": "Upma",
"kind": "ing",
"pos": 7,
"ta": "உளுத்தம் பருப்பு"
},
{
"dish": "Coconut chutney",
"kind": "ing",
"pos": 1,
"ta": "தேங்காய் துருவல்"
},
{
"dish": "Tomato chutney",
"kind": "ing",
"pos": 3,
"ta": "காய்ந்த மிளகாய்"
},
{
"dish": "Beans poriyal",
"kind": "ing",
"pos": 2,
"ta": "தேங்காய் துருவல்"
},
{
"dish": "Beans poriyal",
"kind": "ing",
"pos": 4,
"ta": "உளுத்தம் பருப்பு"
},
{
"dish": "Beans poriyal",
"kind": "ing",
"pos": 5,
"ta": "காய்ந்த மிளகாய்"
},
{
"dish": "Cabbage poriyal",
"kind": "ing",
"pos": 2,
"ta": "தேங்காய் துருவல்"
},
{
"dish": "Medu vada",
"kind": "ing",
"pos": 1,
"ta": "உளுத்தம் பருப்பு"
},
{
"dish": "Sundal",
"kind": "ing",
"pos": 2,
"ta": "தேங்காய் துருவல்"
},
{
"dish": "Sundal",
"kind": "ing",
"pos": 4,
"ta": "காய்ந்த மிளகாய்"
},
{
"dish": "Rava kesari",
"kind": "ing",
"pos": 6,
"ta": "ஏலக்காய் தூள்"
},
{
"dish": "Semiya payasam",
"kind": "ing",
"pos": 7,
"ta": "ஏலக்காய் தூள்"
},
{
"dish": "Vegetable biryani",
"kind": "ing",
"pos": 1,
"ta": "பாசுமதி அரிசி"
},
{
"dish": "Paneer butter masala",
"kind": "ing",
"pos": 6,
"ta": "கிரீம்"
},
{
"dish": "Dal tadka",
"kind": "ing",
"pos": 7,
"ta": "காய்ந்த மிளகாய்"
},
{
"dish": "Jeera rice",
"kind": "ing",
"pos": 1,
"ta": "பாசுமதி அரிசி"
},
{
"dish": "Palak paneer",
"kind": "ing",
"pos": 8,
"ta": "கிரீம்"
},
{
"dish": "Butter chicken",
"kind": "ing",
"pos": 7,
"ta": "கிரீம்"
},
{
"dish": "Kal dosai",
"kind": "ing",
"pos": 2,
"ta": "எண்ணெய் அல்லது நெய்"
},
{
"dish": "Khara bath",
"kind": "ing",
"pos": 7,
"ta": "நெய் அல்லது எண்ணெய்"
},
{
"dish": "Semiya upma",
"kind": "ing",
"pos": 7,
"ta": "எண்ணெய் அல்லது நெய்"
},
{
"dish": "Paper roast",
"kind": "ing",
"pos": 3,
"ta": "நெய் அல்லது எண்ணெய்"
},
{
"dish": "Sweet paniyaram",
"kind": "ing",
"pos": 6,
"ta": "நெய் அல்லது எண்ணெய்"
},
{
"dish": "Unniyappam",
"kind": "ing",
"pos": 7,
"ta": "நெய் அல்லது எண்ணெய்"
},
{
"dish": "Coconut rice",
"kind": "ing",
"pos": 7,
"ta": "நெய் அல்லது எண்ணெய்"
},
{
"dish": "Omelette",
"kind": "ing",
"pos": 4,
"ta": "மிளகு"
},
{
"dish": "Vegetable pulao",
"kind": "ing",
"pos": 6,
"ta": "நெய், எண்ணெய்"
},
{
"dish": "Egg bhurji",
"kind": "ing",
"pos": 6,
"ta": "வெண்ணெய் அல்லது எண்ணெய்"
},
{
"dish": "Jeera aloo",
"kind": "ing",
"pos": 6,
"ta": "எண்ணெய் அல்லது நெய்"
}
]
$json$::jsonb) as x(dish text, kind text, pos int, ta text)
),
rec as (
  select f.*, r.id as recipe_id
  from fixes f
  join public.dishes d on d.household_id is null and d.name = f.dish
  join public.recipes r on r.dish_id = d.id and r.household_id is null
),
ing as (
  update public.recipe_ingredients i set name_ta = x.ta
  from rec x where x.kind = 'ing' and i.recipe_id = x.recipe_id and i.position = x.pos
  returning 1
),
stp as (
  update public.recipe_steps s set body_ta = x.ta
  from rec x where x.kind = 'step' and s.recipe_id = x.recipe_id and s.position = x.pos
  returning 1
),
nte as (
  update public.recipes r set note_ta = x.ta
  from rec x where x.kind = 'note' and r.id = x.recipe_id
  returning 1
)
select (select count(*) from ing) as ingredients_fixed, (select count(*) from stp) as steps_fixed, (select count(*) from nte) as notes_fixed;
