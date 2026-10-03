-- HomeFood · 0011: recipes (ingredients scaled to who is eating, steps, cook mode)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- A recipe belongs to a dish. household_id null = the standard recipe everyone sees; a household can keep its own
-- version later (Admin only) — the tables and rules already allow it, the "Edit our version" screen is not built yet.
-- Quantities are for `servings` people; the app scales them. A quantity is null only for "to taste" / "as needed".
-- The standard recipes below are drafts (written by Claude): the family should check them before relying on them.

create table public.recipes (
  id           uuid primary key default gen_random_uuid(),
  dish_id      uuid not null references public.dishes (id) on delete cascade,
  household_id uuid references public.households (id) on delete cascade,   -- null = standard recipe
  servings     smallint not null check (servings between 1 and 50),
  prep_minutes smallint check (prep_minutes between 0 and 600),
  cook_minutes smallint check (cook_minutes between 0 and 600),
  credit       text,
  note         text,
  note_ta      text,
  created_at   timestamptz not null default now()
);
create unique index recipes_standard_uidx  on public.recipes (dish_id) where household_id is null;
create unique index recipes_household_uidx on public.recipes (dish_id, household_id) where household_id is not null;

create table public.recipe_ingredients (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position  smallint not null,
  name      text not null check (char_length(btrim(name)) between 1 and 80),
  name_ta   text,
  quantity  numeric(9, 3) check (quantity > 0),
  unit      text not null check (unit in ('cup','tbsp','tsp','g','ml','kg','piece','sprig','pinch','clove','inch','bunch','handful','slice','to_taste','as_needed')),
  primary key (recipe_id, position),
  check ((unit in ('to_taste', 'as_needed')) = (quantity is null))
);

create table public.recipe_steps (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position  smallint not null,
  body      text not null check (char_length(btrim(body)) between 1 and 600),
  body_ta   text,
  primary key (recipe_id, position)
);

alter table public.recipes            enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps       enable row level security;

create policy recipes_read on public.recipes for select to authenticated
  using (household_id is null or household_id = public.my_household_id());
create policy recipes_write on public.recipes for all to authenticated
  using (household_id = public.my_household_id() and public.is_admin())
  with check (household_id = public.my_household_id() and public.is_admin());

create policy recipe_ingredients_read on public.recipe_ingredients for select to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.household_id is null or r.household_id = public.my_household_id())));
create policy recipe_ingredients_write on public.recipe_ingredients for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()));

create policy recipe_steps_read on public.recipe_steps for select to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.household_id is null or r.household_id = public.my_household_id())));
create policy recipe_steps_write on public.recipe_steps for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.household_id = public.my_household_id() and public.is_admin()));

grant select, insert, update, delete on public.recipes, public.recipe_ingredients, public.recipe_steps to authenticated;

-- ── Standard recipes (38 dishes). Skips any dish that already has a standard recipe, so it is safe to run twice. ──
with src as (
  select * from jsonb_to_recordset($json$
[
{
"dish": "Idli",
"servings": 4,
"prep": 20,
"cook": 15,
"note": "Batter keeps 3 days in the fridge. Serve with coconut chutney and sambar.",
"note_ta": "மாவை குளிர்சாதனப் பெட்டியில் 3 நாள் வைக்கலாம். தேங்காய் சட்னி, சாம்பாருடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Idli rice",
"t": "இட்லி அரிசி",
"q": 2,
"u": "cup"
},
{
"n": "Urad dal",
"t": "உளுந்து",
"q": 0.5,
"u": "cup"
},
{
"n": "Fenugreek seeds",
"t": "வெந்தயம்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Water for grinding",
"t": "அரைக்கத் தண்ணீர்",
"q": null,
"u": "as_needed"
}
],
"steps": [
{
"e": "Soak the rice, and the urad dal with the fenugreek, in separate bowls for 4 to 5 hours.",
"t": "அரிசியையும், வெந்தயத்துடன் உளுந்தையும் தனித்தனியாக 4 முதல் 5 மணி நேரம் ஊறவைக்கவும்."
},
{
"e": "Grind the dal to a smooth, fluffy batter and the rice to a fine, slightly grainy batter. Mix both with salt.",
"t": "உளுந்தை மிருதுவாகவும் பஞ்சு போலவும், அரிசியை மெல்லிய ரவை பதத்திலும் அரைத்து, உப்பு சேர்த்துக் கலக்கவும்."
},
{
"e": "Cover and let the batter ferment for 8 to 10 hours, until it has risen and is bubbly.",
"t": "மூடி வைத்து 8 முதல் 10 மணி நேரம் புளிக்க விடவும்; மாவு பொங்கி நுரைத்து இருக்க வேண்டும்."
},
{
"e": "Grease the idli moulds, fill with batter and steam for 10 to 12 minutes.",
"t": "இட்லித் தட்டில் எண்ணெய் தடவி மாவு ஊற்றி, 10 முதல் 12 நிமிடம் ஆவியில் வேகவைக்கவும்."
},
{
"e": "Rest for 2 minutes, then lift out with a wet spoon. Serve hot with chutney and sambar.",
"t": "2 நிமிடம் ஆறவிட்டு, ஈரக் கரண்டியால் எடுக்கவும். சட்னி, சாம்பாருடன் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Dosa",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Serve with coconut chutney and sambar.",
"note_ta": "தேங்காய் சட்னி, சாம்பாருடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Idli rice",
"t": "இட்லி அரிசி",
"q": 2,
"u": "cup"
},
{
"n": "Urad dal",
"t": "உளுந்து",
"q": 0.5,
"u": "cup"
},
{
"n": "Fenugreek seeds",
"t": "வெந்தயம்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 4,
"u": "tbsp"
}
],
"steps": [
{
"e": "Soak, grind and ferment the batter as for idli (8 to 10 hours).",
"t": "இட்லிக்குச் செய்வது போல மாவை ஊறவைத்து அரைத்து 8 முதல் 10 மணி நேரம் புளிக்க விடவும்."
},
{
"e": "Thin the batter with a little water to a pouring consistency and add salt.",
"t": "மாவில் சிறிது தண்ணீர் சேர்த்து ஊற்றும் பதத்தில் தளர்த்தி, உப்பு சேர்க்கவும்."
},
{
"e": "Heat a flat pan, wipe with oil, pour a ladle of batter and spread in a circle.",
"t": "தோசைக்கல்லைச் சூடாக்கி எண்ணெய் தடவி, ஒரு கரண்டி மாவை ஊற்றி வட்டமாகப் பரப்பவும்."
},
{
"e": "Drizzle oil around the edges and cook until golden and crisp. Fold and serve.",
"t": "ஓரங்களில் எண்ணெய் விட்டு பொன்னிறமாக மொறுமொறுப்பாக வேகவிடவும். மடித்துப் பரிமாறவும்."
}
]
},
{
"dish": "Ven Pongal",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Serve with sambar and coconut chutney.",
"note_ta": "சாம்பார், தேங்காய் சட்னியுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Raw rice",
"t": "பச்சரிசி",
"q": 1,
"u": "cup"
},
{
"n": "Moong dal (split yellow)",
"t": "பாசிப்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 4.5,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Black pepper, whole",
"t": "மிளகு",
"q": 1,
"u": "tsp"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1,
"u": "tsp"
},
{
"n": "Ginger, grated",
"t": "இஞ்சி",
"q": 1,
"u": "tsp"
},
{
"n": "Cashews",
"t": "முந்திரி",
"q": 10,
"u": "piece"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Dry roast the moong dal on low heat until it smells nutty, about 3 minutes.",
"t": "பாசிப்பருப்பை சிறு தீயில் மணம் வரும் வரை, சுமார் 3 நிமிடம் வறுக்கவும்."
},
{
"e": "Wash the rice and dal together. Pressure cook with the water and salt for 4 to 5 whistles.",
"t": "அரிசியையும் பருப்பையும் சேர்த்துக் கழுவி, தண்ணீர், உப்புடன் 4 முதல் 5 விசில் வரை குக்கரில் வேகவிடவும்."
},
{
"e": "Let the pressure drop, open and mash lightly with a ladle.",
"t": "ஆவி அடங்கியதும் திறந்து, கரண்டியால் லேசாக மசிக்கவும்."
},
{
"e": "Heat the ghee. Fry the cashews golden, then add pepper, cumin, ginger and curry leaves.",
"t": "நெய்யைக் காயவைத்து முந்திரியைப் பொன்னிறமாக வறுத்து, மிளகு, சீரகம், இஞ்சி, கறிவேப்பிலை சேர்க்கவும்."
},
{
"e": "Pour the tempering over the pongal and mix well. Add a little hot water if it is too thick.",
"t": "தாளிப்பைப் பொங்கலில் ஊற்றிக் கலக்கவும். கெட்டியாக இருந்தால் சிறிது வெந்நீர் சேர்க்கவும்."
},
{
"e": "Serve hot with sambar and coconut chutney.",
"t": "சாம்பார், தேங்காய் சட்னியுடன் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Sambar",
"servings": 4,
"prep": 15,
"cook": 30,
"note": "Serve with rice, idli or dosa.",
"note_ta": "சாதம், இட்லி அல்லது தோசையுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.75,
"u": "cup"
},
{
"n": "Mixed vegetables (drumstick, carrot, brinjal, pumpkin)",
"t": "கலவை காய்கறிகள்",
"q": 2,
"u": "cup"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1,
"u": "tbsp"
},
{
"n": "Sambar powder",
"t": "சாம்பார் பொடி",
"q": 2,
"u": "tbsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "வரமிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Pressure cook the dal with turmeric until very soft, then mash well.",
"t": "பருப்பை மஞ்சள் தூளுடன் குழைய வேகவைத்து நன்கு மசிக்கவும்."
},
{
"e": "Soak the tamarind in warm water and extract the juice.",
"t": "புளியை வெந்நீரில் ஊறவைத்துக் கரைத்து சாறு எடுக்கவும்."
},
{
"e": "Boil the vegetables in the tamarind water with salt and sambar powder until tender.",
"t": "காய்கறிகளைப் புளிக்கரைசல், உப்பு, சாம்பார் பொடியுடன் வேகும் வரை கொதிக்கவிடவும்."
},
{
"e": "Add the mashed dal, simmer 5 minutes and adjust water and salt.",
"t": "மசித்த பருப்பைச் சேர்த்து 5 நிமிடம் கொதிக்கவிட்டு, தண்ணீர், உப்பைச் சரிபார்க்கவும்."
},
{
"e": "Heat oil, splutter the mustard, fry the chillies and curry leaves and pour over the sambar.",
"t": "எண்ணெயில் கடுகு வெடிக்கவிட்டு, மிளகாய், கறிவேப்பிலை வறுத்து சாம்பாரில் சேர்க்கவும்."
}
]
},
{
"dish": "Rasam",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "A spoon of rasam over hot rice with a little ghee is classic.",
"note_ta": "சூடான சாதத்தில் ரசமும் சிறிது நெய்யும் சேர்த்துச் சாப்பிடுவது வழக்கம்.",
"ingredients": [
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 2,
"u": "piece"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1,
"u": "tbsp"
},
{
"n": "Rasam powder",
"t": "ரசப் பொடி",
"q": 2,
"u": "tsp"
},
{
"n": "Toor dal, cooked",
"t": "வேகவைத்த துவரம்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Garlic, crushed",
"t": "பூண்டு",
"q": 3,
"u": "clove"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 1,
"u": "handful"
},
{
"n": "Ghee or oil",
"t": "நெய் அல்லது எண்ணெய்",
"q": 2,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Mix the tamarind juice with 3 cups water, the tomatoes, rasam powder, garlic and salt. Boil 8 minutes.",
"t": "புளிக்கரைசலை 3 கப் தண்ணீருடன் தக்காளி, ரசப் பொடி, பூண்டு, உப்பு சேர்த்து 8 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the cooked dal and a little of its water. Heat until frothy, but do not boil hard.",
"t": "வேகவைத்த பருப்பையும் சிறிது தண்ணீரையும் சேர்த்து, நுரைத்து வரும் வரை சூடாக்கவும்; பொங்க விட வேண்டாம்."
},
{
"e": "Heat ghee, splutter mustard and cumin, add curry leaves and pour over the rasam.",
"t": "நெய்யில் கடுகு, சீரகம் தாளித்து கறிவேப்பிலை சேர்த்து ரசத்தில் ஊற்றவும்."
},
{
"e": "Finish with coriander leaves. Serve hot with rice.",
"t": "கொத்தமல்லி தூவி, சாதத்துடன் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Curd rice",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "Add pomegranate or grapes for a sweet touch.",
"note_ta": "மாதுளை அல்லது திராட்சை சேர்த்தால் இனிப்புச் சுவை கூடும்.",
"ingredients": [
{
"n": "Cooked rice",
"t": "வேகவைத்த சாதம்",
"q": 2,
"u": "cup"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 1.5,
"u": "cup"
},
{
"n": "Milk",
"t": "பால்",
"q": 0.5,
"u": "cup"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Urad dal",
"t": "உளுந்து",
"q": 1,
"u": "tsp"
},
{
"n": "Green chilli, chopped",
"t": "பச்சை மிளகாய்",
"q": 1,
"u": "piece"
},
{
"n": "Ginger, grated",
"t": "இஞ்சி",
"q": 1,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Mash the warm rice well and mix in the milk and salt.",
"t": "வெதுவெதுப்பான சாதத்தை நன்கு மசித்து பால், உப்பு சேர்த்துக் கலக்கவும்."
},
{
"e": "Let it cool, then stir in the curd.",
"t": "ஆறியதும் தயிரைச் சேர்த்துக் கிளறவும்."
},
{
"e": "Heat oil, splutter the mustard, fry the urad dal, chilli, ginger and curry leaves.",
"t": "எண்ணெயில் கடுகு, உளுந்து, மிளகாய், இஞ்சி, கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Pour the tempering over the rice and mix. Serve cool with pickle.",
"t": "தாளிப்பை சாதத்தில் ஊற்றிக் கலந்து, ஊறுகாயுடன் குளிர்ச்சியாகப் பரிமாறவும்."
}
]
},
{
"dish": "Upma",
"servings": 4,
"prep": 10,
"cook": 15,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Rava (semolina)",
"t": "ரவை",
"q": 1,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 2.5,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Ginger, grated",
"t": "இஞ்சி",
"q": 1,
"u": "tsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Urad dal",
"t": "உளுந்து",
"q": 1,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil or ghee",
"t": "எண்ணெய் அல்லது நெய்",
"q": 2,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Dry roast the rava until lightly fragrant and set aside.",
"t": "ரவையை மணம் வரும் வரை வறுத்துத் தனியே வைக்கவும்."
},
{
"e": "Heat oil, splutter the mustard, fry the urad dal, chillies, ginger and curry leaves, then the onion until soft.",
"t": "எண்ணெயில் கடுகு, உளுந்து, மிளகாய், இஞ்சி, கறிவேப்பிலை தாளித்து, வெங்காயத்தை வதக்கவும்."
},
{
"e": "Add the water and salt and bring to a rolling boil.",
"t": "தண்ணீர், உப்பு சேர்த்து நன்கு கொதிக்கவிடவும்."
},
{
"e": "Lower the heat, pour in the rava slowly while stirring so no lumps form.",
"t": "தீயைக் குறைத்து, கட்டி விழாமல் கிளறிக்கொண்டே ரவையைத் தூவவும்."
},
{
"e": "Cover and cook 3 minutes, mix and serve hot with chutney.",
"t": "மூடி 3 நிமிடம் வேகவிட்டு, கிளறி சட்னியுடன் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Lemon rice",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Add the lemon juice off the heat so the rice does not turn bitter.",
"note_ta": "தீயை அணைத்த பின் எலுமிச்சை சாறு சேர்த்தால் கசப்பு வராது.",
"ingredients": [
{
"n": "Cooked rice",
"t": "வேகவைத்த சாதம்",
"q": 3,
"u": "cup"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 3,
"u": "tbsp"
},
{
"n": "Peanuts",
"t": "வேர்க்கடலை",
"q": 2,
"u": "tbsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 1,
"u": "tsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Spread the cooked rice on a plate to cool and keep the grains separate.",
"t": "வேகவைத்த சாதத்தை ஒரு தட்டில் பரப்பி உதிரியாக ஆறவிடவும்."
},
{
"e": "Heat oil, fry the peanuts, then splutter the mustard and fry the chana dal, chillies and curry leaves.",
"t": "எண்ணெயில் வேர்க்கடலை வறுத்து, கடுகு, கடலைப்பருப்பு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add turmeric and salt, switch off the heat and stir in the lemon juice.",
"t": "மஞ்சள் தூள், உப்பு சேர்த்து தீயை அணைத்து எலுமிச்சை சாறு கலக்கவும்."
},
{
"e": "Fold in the rice gently until evenly yellow. Serve with papad or chips.",
"t": "சாதத்தைச் சேர்த்து மெதுவாகக் கலக்கவும். அப்பளத்துடன் பரிமாறவும்."
}
]
},
{
"dish": "Tomato rice",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Serve with raita and papad.",
"note_ta": "ரைத்தா, அப்பளத்துடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Basmati or raw rice",
"t": "அரிசி",
"q": 1.5,
"u": "cup"
},
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 4,
"u": "piece"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1,
"u": "tsp"
},
{
"n": "Red chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1,
"u": "tsp"
},
{
"n": "Garam masala",
"t": "கரம் மசாலா",
"q": 0.5,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Mint leaves",
"t": "புதினா",
"q": 1,
"u": "handful"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 3,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Heat oil, fry the onion until golden, then the ginger-garlic paste.",
"t": "எண்ணெயில் வெங்காயத்தைப் பொன்னிறமாக வதக்கி, இஞ்சி பூண்டு விழுது சேர்க்கவும்."
},
{
"e": "Add the tomatoes, chilli powder, garam masala and salt and cook until mushy.",
"t": "தக்காளி, மிளகாய்த் தூள், கரம் மசாலா, உப்பு சேர்த்துக் குழைய வதக்கவும்."
},
{
"e": "Add the washed rice, mint and water. Bring to a boil.",
"t": "கழுவிய அரிசி, புதினா, தண்ணீர் சேர்த்துக் கொதிக்கவிடவும்."
},
{
"e": "Cover and cook on low heat until the water is absorbed, about 15 minutes. Rest 5 minutes, then fluff.",
"t": "மூடி சிறு தீயில் தண்ணீர் வற்றும் வரை, சுமார் 15 நிமிடம் வேகவிடவும். 5 நிமிடம் கழித்து உதிர்த்து விடவும்."
}
]
},
{
"dish": "Coconut chutney",
"servings": 4,
"prep": 10,
"cook": 5,
"note": "Best eaten the same day.",
"note_ta": "அன்றே சாப்பிடுவது நல்லது.",
"ingredients": [
{
"n": "Grated coconut",
"t": "துருவிய தேங்காய்",
"q": 1,
"u": "cup"
},
{
"n": "Roasted gram (pottukadalai)",
"t": "பொட்டுக்கடலை",
"q": 2,
"u": "tbsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Ginger",
"t": "இஞ்சி",
"q": 0.5,
"u": "inch"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 0.5,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Grind the coconut, roasted gram, chillies, ginger and salt with a little water to a smooth paste.",
"t": "தேங்காய், பொட்டுக்கடலை, மிளகாய், இஞ்சி, உப்பை சிறிது தண்ணீருடன் மிருதுவாக அரைக்கவும்."
},
{
"e": "Heat oil, splutter the mustard and curry leaves.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Pour the tempering over the chutney and mix.",
"t": "தாளிப்பை சட்னியில் ஊற்றிக் கலக்கவும்."
}
]
},
{
"dish": "Tomato chutney",
"servings": 4,
"prep": 10,
"cook": 15,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 4,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Dried red chilli",
"t": "வரமிளகாய்",
"q": 4,
"u": "piece"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 3,
"u": "clove"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 0.5,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Heat 1 tbsp oil and fry the chillies, garlic and onion until soft.",
"t": "1 மேசைக்கரண்டி எண்ணெயில் மிளகாய், பூண்டு, வெங்காயத்தை வதக்கவும்."
},
{
"e": "Add the tomatoes and salt and cook until they turn pulpy and the oil separates.",
"t": "தக்காளி, உப்பு சேர்த்து குழைந்து எண்ணெய் பிரியும் வரை வதக்கவும்."
},
{
"e": "Cool and grind to a coarse or smooth paste as you like.",
"t": "ஆறவிட்டு விருப்பப்படி கொரகொரப்பாகவோ மிருதுவாகவோ அரைக்கவும்."
},
{
"e": "Temper mustard in the remaining oil and pour over.",
"t": "மீதி எண்ணெயில் கடுகு தாளித்துச் சட்னியில் ஊற்றவும்."
}
]
},
{
"dish": "Beans poriyal",
"servings": 4,
"prep": 10,
"cook": 12,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Green beans, finely chopped",
"t": "பீன்ஸ்",
"q": 3,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "துருவிய தேங்காய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Urad dal",
"t": "உளுந்து",
"q": 1,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "வரமிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Heat oil, splutter the mustard, fry the urad dal, chillies and curry leaves.",
"t": "எண்ணெயில் கடுகு, உளுந்து, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the beans, salt and a splash of water. Cover and cook 8 minutes, stirring now and then.",
"t": "பீன்ஸ், உப்பு, சிறிது தண்ணீர் சேர்த்து மூடி, அவ்வப்போது கிளறி 8 நிமிடம் வேகவிடவும்."
},
{
"e": "Stir in the coconut, cook 2 minutes more and serve with rice.",
"t": "தேங்காய் சேர்த்து மேலும் 2 நிமிடம் வதக்கி சாதத்துடன் பரிமாறவும்."
}
]
},
{
"dish": "Cabbage poriyal",
"servings": 4,
"prep": 10,
"cook": 12,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Cabbage, finely chopped",
"t": "முட்டைக்கோஸ்",
"q": 4,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "துருவிய தேங்காய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 1,
"u": "tsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Heat oil, splutter the mustard, fry the chana dal, chillies and curry leaves.",
"t": "எண்ணெயில் கடுகு, கடலைப்பருப்பு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the cabbage and salt and cook covered on low heat for 6 to 8 minutes.",
"t": "முட்டைக்கோஸ், உப்பு சேர்த்து சிறு தீயில் மூடி 6 முதல் 8 நிமிடம் வேகவிடவும்."
},
{
"e": "Add the coconut, mix and cook 2 minutes. Serve hot.",
"t": "தேங்காய் சேர்த்துக் கிளறி 2 நிமிடம் வதக்கி சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Medu vada",
"servings": 4,
"prep": 15,
"cook": 20,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Urad dal",
"t": "உளுந்து",
"q": 1,
"u": "cup"
},
{
"n": "Green chilli, chopped",
"t": "பச்சை மிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Ginger, grated",
"t": "இஞ்சி",
"q": 1,
"u": "tsp"
},
{
"n": "Black pepper, crushed",
"t": "மிளகு",
"q": 1,
"u": "tsp"
},
{
"n": "Curry leaves, chopped",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Oil for frying",
"t": "பொரிக்க எண்ணெய்",
"q": null,
"u": "as_needed"
}
],
"steps": [
{
"e": "Soak the dal for 2 hours, drain and grind with very little water to a thick, fluffy batter.",
"t": "உளுந்தை 2 மணி நேரம் ஊறவைத்து, மிகக் குறைந்த தண்ணீரில் கெட்டியாகவும் பஞ்சு போலவும் அரைக்கவும்."
},
{
"e": "Mix in the chillies, ginger, pepper, curry leaves, onion and salt.",
"t": "மிளகாய், இஞ்சி, மிளகு, கறிவேப்பிலை, வெங்காயம், உப்பு சேர்த்துக் கலக்கவும்."
},
{
"e": "Wet your hands, shape a ball, flatten and make a hole in the centre.",
"t": "கையை நனைத்து உருண்டை எடுத்து தட்டி, நடுவில் துளையிடவும்."
},
{
"e": "Deep fry on medium heat until golden and crisp. Drain and serve hot with chutney and sambar.",
"t": "நடுத்தர தீயில் பொன்னிறமாக மொறுமொறுப்பாகப் பொரித்து எடுத்து, சட்னி, சாம்பாருடன் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Sundal",
"servings": 4,
"prep": 10,
"cook": 15,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Chickpeas, soaked overnight",
"t": "கொண்டைக்கடலை",
"q": 1,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "துருவிய தேங்காய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "வரமிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Pressure cook the soaked chickpeas with salt until soft but whole. Drain.",
"t": "ஊறவைத்த கொண்டைக்கடலையை உப்புடன் உடையாமல் வேகவைத்து வடிக்கவும்."
},
{
"e": "Heat oil, splutter the mustard and fry the chillies and curry leaves.",
"t": "எண்ணெயில் கடுகு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the chickpeas and coconut, toss for 2 minutes and serve warm.",
"t": "கடலை, தேங்காய் சேர்த்து 2 நிமிடம் புரட்டி சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Rava kesari",
"servings": 4,
"prep": 5,
"cook": 20,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Rava (semolina)",
"t": "ரவை",
"q": 1,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 2,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 4,
"u": "tbsp"
},
{
"n": "Cashews",
"t": "முந்திரி",
"q": 10,
"u": "piece"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய்த் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Saffron or food colour",
"t": "குங்குமப்பூ",
"q": 1,
"u": "pinch"
}
],
"steps": [
{
"e": "Fry the cashews in 1 tbsp ghee and set aside. Roast the rava in 2 tbsp ghee until fragrant.",
"t": "முந்திரியை 1 மேசைக்கரண்டி நெய்யில் வறுத்து எடுக்கவும். ரவையை 2 மேசைக்கரண்டி நெய்யில் மணம் வரும் வரை வறுக்கவும்."
},
{
"e": "Boil the water with the saffron. Pour it slowly over the rava, stirring to avoid lumps.",
"t": "குங்குமப்பூவுடன் தண்ணீரைக் கொதிக்கவிட்டு, கட்டி விழாமல் கிளறிக்கொண்டே ரவையில் ஊற்றவும்."
},
{
"e": "When the rava is cooked, add the sugar. It will turn loose, then thicken again.",
"t": "ரவை வெந்ததும் சர்க்கரை சேர்க்கவும்; முதலில் இளகி, பிறகு கெட்டியாகும்."
},
{
"e": "Add the remaining ghee, cardamom and cashews. Mix and serve warm.",
"t": "மீதி நெய், ஏலக்காய், முந்திரி சேர்த்துக் கலந்து சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Semiya payasam",
"servings": 4,
"prep": 5,
"cook": 20,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Vermicelli (semiya)",
"t": "சேமியா",
"q": 0.5,
"u": "cup"
},
{
"n": "Milk",
"t": "பால்",
"q": 3,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 0.5,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 2,
"u": "tbsp"
},
{
"n": "Cashews",
"t": "முந்திரி",
"q": 8,
"u": "piece"
},
{
"n": "Raisins",
"t": "உலர் திராட்சை",
"q": 1,
"u": "tbsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய்த் தூள்",
"q": 0.5,
"u": "tsp"
}
],
"steps": [
{
"e": "Fry the cashews and raisins in ghee and set aside. Roast the vermicelli in the same ghee until golden.",
"t": "முந்திரி, திராட்சையை நெய்யில் வறுத்து எடுக்கவும். அதே நெய்யில் சேமியாவைப் பொன்னிறமாக வறுக்கவும்."
},
{
"e": "Add the milk and simmer until the vermicelli is soft, about 8 minutes.",
"t": "பால் சேர்த்து சேமியா மென்மையாகும் வரை, சுமார் 8 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Stir in the sugar and cardamom and cook 3 more minutes.",
"t": "சர்க்கரை, ஏலக்காய் சேர்த்து மேலும் 3 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Top with the cashews and raisins. Serve warm or chilled.",
"t": "முந்திரி, திராட்சை சேர்த்து சூடாகவோ குளிரவைத்தோ பரிமாறவும்."
}
]
},
{
"dish": "Vegetable biryani",
"servings": 4,
"prep": 20,
"cook": 35,
"note": "Serve with raita.",
"note_ta": "ரைத்தாவுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Basmati rice",
"t": "பாஸ்மதி அரிசி",
"q": 2,
"u": "cup"
},
{
"n": "Mixed vegetables",
"t": "கலவை காய்கறிகள்",
"q": 3,
"u": "cup"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 2,
"u": "piece"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.5,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1,
"u": "tbsp"
},
{
"n": "Biryani masala",
"t": "பிரியாணி மசாலா",
"q": 2,
"u": "tbsp"
},
{
"n": "Mint and coriander leaves",
"t": "புதினா, கொத்தமல்லி",
"q": 1,
"u": "bunch"
},
{
"n": "Ghee or oil",
"t": "நெய் அல்லது எண்ணெய்",
"q": 4,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Wash and soak the rice for 20 minutes. Fry the onions until deep golden and set half aside.",
"t": "அரிசியைக் கழுவி 20 நிமிடம் ஊறவைக்கவும். வெங்காயத்தை நன்கு பொன்னிறமாக வறுத்து பாதியை எடுத்து வைக்கவும்."
},
{
"e": "Cook the vegetables with the ginger-garlic paste, curd, biryani masala and salt for 8 minutes.",
"t": "காய்கறிகளை இஞ்சி பூண்டு விழுது, தயிர், பிரியாணி மசாலா, உப்புடன் 8 நிமிடம் வேகவிடவும்."
},
{
"e": "Boil the rice in salted water until 70% cooked and drain.",
"t": "அரிசியை உப்பு நீரில் 70% வேகும் வரை வேகவைத்து வடிக்கவும்."
},
{
"e": "Layer the rice over the vegetables with herbs, fried onion and ghee. Seal and cook on low heat for 20 minutes.",
"t": "காய்கறிகளின் மேல் சாதம், கீரைகள், வறுத்த வெங்காயம், நெய் அடுக்கி மூடி சிறு தீயில் 20 நிமிடம் தம்மில் வேகவிடவும்."
},
{
"e": "Rest 5 minutes, mix gently and serve with raita.",
"t": "5 நிமிடம் கழித்து மெதுவாகக் கிளறி ரைத்தாவுடன் பரிமாறவும்."
}
]
},
{
"dish": "Chicken curry",
"servings": 4,
"prep": 15,
"cook": 40,
"note": "Serve with rice, chapati or parotta.",
"note_ta": "சாதம், சப்பாத்தி அல்லது பரோட்டாவுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Chicken, curry cut",
"t": "கோழி இறைச்சி",
"q": 600,
"u": "g"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2,
"u": "piece"
},
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 2,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1,
"u": "tbsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2,
"u": "tsp"
},
{
"n": "Coriander powder",
"t": "மல்லித் தூள்",
"q": 1,
"u": "tbsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Heat oil, add curry leaves and onions and fry until golden brown.",
"t": "எண்ணெயில் கறிவேப்பிலை, வெங்காயம் சேர்த்துப் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Add the ginger-garlic paste and cook until the raw smell goes, then the tomatoes until soft.",
"t": "இஞ்சி பூண்டு விழுதைப் பச்சை வாசனை போகும் வரை வதக்கி, தக்காளி சேர்த்துக் குழைய வதக்கவும்."
},
{
"e": "Add the chilli, coriander and turmeric powders and salt, then the chicken. Mix well.",
"t": "மிளகாய், மல்லி, மஞ்சள் தூள்கள், உப்பு, கோழி சேர்த்து நன்கு கிளறவும்."
},
{
"e": "Add a cup of water, cover and simmer 25 minutes until the chicken is tender and the gravy thick.",
"t": "ஒரு கப் தண்ணீர் சேர்த்து மூடி, கோழி வேகும் வரை 25 நிமிடம் கொதிக்கவிட்டு கெட்டியாக்கவும்."
}
]
},
{
"dish": "Fish curry",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Tastes better the next day. Check the fish for bones.",
"note_ta": "மறுநாள் இன்னும் சுவையாக இருக்கும். மீனில் முள் உள்ளதா எனப் பார்க்கவும்.",
"ingredients": [
{
"n": "Fish pieces",
"t": "மீன் துண்டுகள்",
"q": 500,
"u": "g"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1,
"u": "tbsp"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 2,
"u": "piece"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2,
"u": "tsp"
},
{
"n": "Coriander powder",
"t": "மல்லித் தூள்",
"q": 1,
"u": "tbsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Fenugreek seeds",
"t": "வெந்தயம்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Heat oil, splutter the mustard and fenugreek, then add the curry leaves and onion and fry until soft.",
"t": "எண்ணெயில் கடுகு, வெந்தயம் தாளித்து கறிவேப்பிலை, வெங்காயத்தை வதக்கவும்."
},
{
"e": "Add the tomatoes and the chilli, coriander and turmeric powders and cook until mushy.",
"t": "தக்காளி, மிளகாய், மல்லி, மஞ்சள் தூள்கள் சேர்த்துக் குழைய வதக்கவும்."
},
{
"e": "Add the tamarind water, salt and 1 cup of water. Boil for 8 minutes.",
"t": "புளிக்கரைசல், உப்பு, 1 கப் தண்ணீர் சேர்த்து 8 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Slide in the fish and simmer 8 to 10 minutes without stirring hard. Rest before serving.",
"t": "மீனைச் சேர்த்து அதிகம் கிளறாமல் 8 முதல் 10 நிமிடம் கொதிக்கவிட்டு, சிறிது நேரம் வைத்து பரிமாறவும்."
}
]
},
{
"dish": "Chapati",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Serve with dal, kurma or any curry.",
"note_ta": "பருப்பு, குருமா அல்லது ஏதேனும் கறியுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Whole wheat flour (atta)",
"t": "கோதுமை மாவு",
"q": 2,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 0.75,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 0.5,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1,
"u": "tbsp"
}
],
"steps": [
{
"e": "Mix the flour, salt and oil. Add water gradually and knead to a soft dough.",
"t": "மாவு, உப்பு, எண்ணெயைக் கலந்து, தண்ணீரை சிறிது சிறிதாக ஊற்றி மிருதுவாகப் பிசையவும்."
},
{
"e": "Cover and rest the dough for 20 minutes.",
"t": "மூடி 20 நிமிடம் ஊறவிடவும்."
},
{
"e": "Divide into 8 balls and roll each into a thin circle.",
"t": "8 உருண்டைகளாகப் பிரித்து ஒவ்வொன்றையும் மெல்லிய வட்டமாகத் தேய்க்கவும்."
},
{
"e": "Cook on a hot tawa until brown spots appear on both sides, pressing lightly so it puffs. Brush with ghee.",
"t": "சூடான தவாவில் இருபுறமும் புள்ளிகள் வரும் வரை சுட்டு, லேசாக அழுத்தி உப்ப வைத்து, நெய் தடவவும்."
}
]
},
{
"dish": "Aloo paratha",
"servings": 4,
"prep": 25,
"cook": 20,
"note": "Serve with curd, butter or pickle.",
"note_ta": "தயிர், வெண்ணெய் அல்லது ஊறுகாயுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Whole wheat flour",
"t": "கோதுமை மாவு",
"q": 2,
"u": "cup"
},
{
"n": "Potatoes, boiled and mashed",
"t": "உருளைக்கிழங்கு",
"q": 3,
"u": "piece"
},
{
"n": "Green chilli, chopped",
"t": "பச்சை மிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 1,
"u": "handful"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1,
"u": "tsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Ghee or oil",
"t": "நெய் அல்லது எண்ணெய்",
"q": 4,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Knead the flour with water and a pinch of salt into a soft dough and rest 15 minutes.",
"t": "மாவை தண்ணீர், சிறிது உப்புடன் மிருதுவாகப் பிசைந்து 15 நிமிடம் ஊறவிடவும்."
},
{
"e": "Mix the potato with the chilli, coriander, cumin, chilli powder and salt for the filling.",
"t": "உருளைக்கிழங்குடன் மிளகாய், கொத்தமல்லி, சீரகம், மிளகாய்த் தூள், உப்பு கலந்து பூரணம் தயாரிக்கவும்."
},
{
"e": "Roll a ball of dough into a small circle, place filling in the centre, seal and roll out gently.",
"t": "மாவு உருண்டையை சிறிய வட்டமாகத் தேய்த்து நடுவில் பூரணம் வைத்து மூடி, மெதுவாகத் தேய்க்கவும்."
},
{
"e": "Cook on a hot tawa with ghee on both sides until golden and crisp.",
"t": "சூடான தவாவில் நெய் தடவி இருபுறமும் பொன்னிறமாகச் சுடவும்."
}
]
},
{
"dish": "Paneer butter masala",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Soak the paneer in warm water for 10 minutes to keep it soft.",
"note_ta": "பனீரை 10 நிமிடம் வெந்நீரில் ஊறவைத்தால் மென்மையாக இருக்கும்.",
"ingredients": [
{
"n": "Paneer, cubed",
"t": "பனீர்",
"q": 250,
"u": "g"
},
{
"n": "Tomato puree",
"t": "தக்காளி விழுது",
"q": 1.5,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Cashews",
"t": "முந்திரி",
"q": 10,
"u": "piece"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Cream",
"t": "க்ரீம்",
"q": 0.25,
"u": "cup"
},
{
"n": "Kashmiri chilli powder",
"t": "காஷ்மீரி மிளகாய்த் தூள்",
"q": 1,
"u": "tsp"
},
{
"n": "Garam masala",
"t": "கரம் மசாலா",
"q": 0.5,
"u": "tsp"
},
{
"n": "Kasuri methi",
"t": "கசூரி மேத்தி",
"q": 1,
"u": "tsp"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Cook the onion, tomato puree and cashews with a little water until soft, then blend to a smooth paste.",
"t": "வெங்காயம், தக்காளி விழுது, முந்திரியை சிறிது தண்ணீருடன் வேகவைத்து மிருதுவாக அரைக்கவும்."
},
{
"e": "Melt the butter, add the paste, chilli powder, salt and sugar and cook 8 minutes.",
"t": "வெண்ணெயை உருக்கி விழுது, மிளகாய்த் தூள், உப்பு, சர்க்கரை சேர்த்து 8 நிமிடம் வேகவிடவும்."
},
{
"e": "Add the paneer and a little water, simmer 5 minutes.",
"t": "பனீர், சிறிது தண்ணீர் சேர்த்து 5 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Stir in the cream, garam masala and crushed kasuri methi. Serve with naan or roti.",
"t": "க்ரீம், கரம் மசாலா, நொறுக்கிய கசூரி மேத்தி சேர்த்து நான் அல்லது ரொட்டியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Chole",
"servings": 4,
"prep": 15,
"cook": 35,
"note": "Serve with bhature, poori or rice.",
"note_ta": "பதூரா, பூரி அல்லது சாதத்துடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Chickpeas, soaked overnight",
"t": "கொண்டைக்கடலை",
"q": 1.5,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2,
"u": "piece"
},
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 2,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1,
"u": "tbsp"
},
{
"n": "Chole masala",
"t": "சோலே மசாலா",
"q": 2,
"u": "tbsp"
},
{
"n": "Tea bag (for colour)",
"t": "தேநீர்ப் பை",
"q": 1,
"u": "piece"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 1,
"u": "handful"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Pressure cook the chickpeas with salt and the tea bag until very soft. Drain, keeping the water.",
"t": "கொண்டைக்கடலையை உப்பு, தேநீர்ப் பையுடன் குழைய வேகவைத்து, நீரைத் தனியே வைத்து வடிக்கவும்."
},
{
"e": "Fry the onion until golden, add the ginger-garlic paste, then the tomatoes until soft.",
"t": "வெங்காயத்தைப் பொன்னிறமாக வதக்கி, இஞ்சி பூண்டு விழுது, தக்காளி சேர்த்துக் குழைய வதக்கவும்."
},
{
"e": "Add the chole masala and the chickpeas with 1 cup of the cooking water.",
"t": "சோலே மசாலா, கடலை, 1 கப் வேகவைத்த நீரைச் சேர்க்கவும்."
},
{
"e": "Simmer 15 minutes, mashing a few chickpeas to thicken. Top with coriander.",
"t": "15 நிமிடம் கொதிக்கவிட்டு, சில கடலைகளை மசித்துக் கெட்டியாக்கி கொத்தமல்லி தூவவும்."
}
]
},
{
"dish": "Dal tadka",
"servings": 4,
"prep": 10,
"cook": 30,
"note": "Serve with jeera rice or roti.",
"note_ta": "ஜீரா சாதம் அல்லது ரொட்டியுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 1,
"u": "cup"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 2,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Garlic, chopped",
"t": "பூண்டு",
"q": 4,
"u": "clove"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "வரமிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 2,
"u": "tbsp"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 1,
"u": "handful"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Pressure cook the dal with turmeric and 3 cups water until soft. Whisk smooth.",
"t": "பருப்பை மஞ்சள் தூள், 3 கப் தண்ணீருடன் குழைய வேகவைத்துக் கடையவும்."
},
{
"e": "Cook the onion and tomato with a little salt until soft, then add to the dal and simmer 5 minutes.",
"t": "வெங்காயம், தக்காளியை உப்புடன் வதக்கி, பருப்பில் சேர்த்து 5 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "For the tadka, heat ghee, crackle the cumin, then fry garlic and dried chillies. Add the chilli powder off the heat.",
"t": "தாளிக்க நெய்யில் சீரகம் வெடிக்கவிட்டு பூண்டு, வரமிளகாய் வறுக்கவும். தீயை அணைத்து மிளகாய்த் தூள் சேர்க்கவும்."
},
{
"e": "Pour the tadka over the dal and top with coriander.",
"t": "தாளிப்பைப் பருப்பில் ஊற்றி கொத்தமல்லி தூவவும்."
}
]
},
{
"dish": "Jeera rice",
"servings": 4,
"prep": 10,
"cook": 20,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Basmati rice",
"t": "பாஸ்மதி அரிசி",
"q": 1.5,
"u": "cup"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.5,
"u": "tsp"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 2,
"u": "tbsp"
},
{
"n": "Bay leaf",
"t": "பிரியாணி இலை",
"q": 1,
"u": "piece"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 3,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Wash the rice and soak for 15 minutes, then drain.",
"t": "அரிசியைக் கழுவி 15 நிமிடம் ஊறவைத்து வடிக்கவும்."
},
{
"e": "Heat ghee, crackle the cumin and bay leaf.",
"t": "நெய்யில் சீரகம், பிரியாணி இலை தாளிக்கவும்."
},
{
"e": "Add the rice, fry for a minute, then add the water and salt.",
"t": "அரிசியைச் சேர்த்து ஒரு நிமிடம் வறுத்து, தண்ணீர், உப்பு சேர்க்கவும்."
},
{
"e": "Cover and cook on low heat for 12 to 15 minutes until the water is absorbed. Rest and fluff.",
"t": "மூடி சிறு தீயில் 12 முதல் 15 நிமிடம் தண்ணீர் வற்றும் வரை வேகவிட்டு, சிறிது நேரம் வைத்து உதிர்க்கவும்."
}
]
},
{
"dish": "Palak paneer",
"servings": 4,
"prep": 15,
"cook": 25,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Spinach",
"t": "பசலைக் கீரை",
"q": 4,
"u": "cup"
},
{
"n": "Paneer, cubed",
"t": "பனீர்",
"q": 200,
"u": "g"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 1,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1,
"u": "tsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1,
"u": "tsp"
},
{
"n": "Cream",
"t": "க்ரீம்",
"q": 2,
"u": "tbsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Blanch the spinach for 2 minutes, cool in cold water and blend with the green chillies.",
"t": "கீரையை 2 நிமிடம் வெந்நீரில் போட்டு குளிர்ந்த நீரில் எடுத்து, பச்சை மிளகாயுடன் அரைக்கவும்."
},
{
"e": "Heat oil, crackle the cumin, fry the onion, ginger-garlic paste and tomato until soft.",
"t": "எண்ணெயில் சீரகம் வெடிக்கவிட்டு வெங்காயம், இஞ்சி பூண்டு விழுது, தக்காளியை வதக்கவும்."
},
{
"e": "Add the spinach puree and salt and simmer 5 minutes.",
"t": "கீரை விழுது, உப்பு சேர்த்து 5 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the paneer and cream, simmer 3 minutes and serve.",
"t": "பனீர், க்ரீம் சேர்த்து 3 நிமிடம் கொதிக்கவிட்டுப் பரிமாறவும்."
}
]
},
{
"dish": "Rajma masala",
"servings": 4,
"prep": 15,
"cook": 40,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Rajma (kidney beans), soaked overnight",
"t": "ராஜ்மா",
"q": 1,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2,
"u": "piece"
},
{
"n": "Tomato puree",
"t": "தக்காளி விழுது",
"q": 1,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1,
"u": "tbsp"
},
{
"n": "Rajma masala or garam masala",
"t": "ராஜ்மா மசாலா",
"q": 1.5,
"u": "tbsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1,
"u": "tsp"
},
{
"n": "Oil or ghee",
"t": "எண்ணெய் அல்லது நெய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Pressure cook the soaked rajma with salt until soft, about 6 whistles.",
"t": "ஊறவைத்த ராஜ்மாவை உப்புடன் சுமார் 6 விசில் வரை குழைய வேகவைக்கவும்."
},
{
"e": "Fry the onion until golden, add the ginger-garlic paste and the tomato puree and cook until the oil separates.",
"t": "வெங்காயத்தைப் பொன்னிறமாக வதக்கி இஞ்சி பூண்டு விழுது, தக்காளி விழுது சேர்த்து எண்ணெய் பிரியும் வரை வதக்கவும்."
},
{
"e": "Add the masalas, then the rajma with its water.",
"t": "மசாலாக்கள், ராஜ்மா, வேகவைத்த நீரைச் சேர்க்கவும்."
},
{
"e": "Simmer 15 to 20 minutes, mashing a few beans to thicken. Serve with rice.",
"t": "15 முதல் 20 நிமிடம் கொதிக்கவிட்டு, சில பீன்ஸை மசித்துக் கெட்டியாக்கி சாதத்துடன் பரிமாறவும்."
}
]
},
{
"dish": "Aloo gobi",
"servings": 4,
"prep": 15,
"cook": 25,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Potatoes, cubed",
"t": "உருளைக்கிழங்கு",
"q": 2,
"u": "piece"
},
{
"n": "Cauliflower florets",
"t": "காலிஃபிளவர்",
"q": 3,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 1,
"u": "piece"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1,
"u": "tsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Coriander powder",
"t": "மல்லித் தூள்",
"q": 1,
"u": "tsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Heat oil, crackle the cumin, fry the onion and tomato until soft.",
"t": "எண்ணெயில் சீரகம் வெடிக்கவிட்டு வெங்காயம், தக்காளியை வதக்கவும்."
},
{
"e": "Add the powders and salt, then the potatoes and cauliflower. Mix well.",
"t": "தூள்கள், உப்பு, உருளைக்கிழங்கு, காலிஃபிளவர் சேர்த்துக் கிளறவும்."
},
{
"e": "Cover and cook on low heat for 15 minutes, stirring now and then, until tender.",
"t": "மூடி சிறு தீயில் அவ்வப்போது கிளறி 15 நிமிடம் வேகவிடவும்."
}
]
},
{
"dish": "Butter chicken",
"servings": 4,
"prep": 20,
"cook": 35,
"note": "Serve with naan or jeera rice.",
"note_ta": "நான் அல்லது ஜீரா சாதத்துடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Chicken, boneless",
"t": "கோழி இறைச்சி",
"q": 500,
"u": "g"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.5,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1,
"u": "tbsp"
},
{
"n": "Kashmiri chilli powder",
"t": "காஷ்மீரி மிளகாய்த் தூள்",
"q": 1,
"u": "tbsp"
},
{
"n": "Tomato puree",
"t": "தக்காளி விழுது",
"q": 1.5,
"u": "cup"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 3,
"u": "tbsp"
},
{
"n": "Cream",
"t": "க்ரீம்",
"q": 0.25,
"u": "cup"
},
{
"n": "Garam masala",
"t": "கரம் மசாலா",
"q": 1,
"u": "tsp"
},
{
"n": "Kasuri methi",
"t": "கசூரி மேத்தி",
"q": 1,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Marinate the chicken in the curd, half the ginger-garlic paste, chilli powder and salt for at least 30 minutes.",
"t": "கோழியை தயிர், பாதி இஞ்சி பூண்டு விழுது, மிளகாய்த் தூள், உப்புடன் குறைந்தது 30 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Pan fry or grill the chicken until browned at the edges.",
"t": "கோழியை விளிம்புகள் பழுப்பாகும் வரை வறுக்கவும் அல்லது கிரில் செய்யவும்."
},
{
"e": "Melt the butter, fry the remaining paste, add the tomato puree and cook 10 minutes.",
"t": "வெண்ணெயை உருக்கி மீதி விழுதை வதக்கி, தக்காளி விழுது சேர்த்து 10 நிமிடம் வேகவிடவும்."
},
{
"e": "Add the chicken and a little water, simmer 10 minutes, then stir in the cream, garam masala and kasuri methi.",
"t": "கோழி, சிறிது தண்ணீர் சேர்த்து 10 நிமிடம் கொதிக்கவிட்டு, க்ரீம், கரம் மசாலா, கசூரி மேத்தி சேர்க்கவும்."
}
]
},
{
"dish": "Poha",
"servings": 4,
"prep": 10,
"cook": 10,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Thick poha (flattened rice)",
"t": "அவல்",
"q": 2,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Potato, small cubes",
"t": "உருளைக்கிழங்கு",
"q": 1,
"u": "piece"
},
{
"n": "Peanuts",
"t": "வேர்க்கடலை",
"q": 2,
"u": "tbsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1,
"u": "tsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2,
"u": "piece"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 1,
"u": "tbsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Rinse the poha in a sieve until soft but not mushy. Mix with salt and a pinch of turmeric.",
"t": "அவலை சல்லடையில் மென்மையாகும் வரை, குழையாமல் கழுவி, உப்பு, சிறிது மஞ்சள் தூள் கலக்கவும்."
},
{
"e": "Heat oil, fry the peanuts, splutter the mustard, then add the chillies, curry leaves, potato and onion.",
"t": "எண்ணெயில் வேர்க்கடலை வறுத்து, கடுகு, மிளகாய், கறிவேப்பிலை, உருளைக்கிழங்கு, வெங்காயம் சேர்த்து வதக்கவும்."
},
{
"e": "When the potato is cooked, add the poha and mix gently for 2 minutes.",
"t": "உருளைக்கிழங்கு வெந்ததும் அவலைச் சேர்த்து மெதுவாக 2 நிமிடம் கிளறவும்."
},
{
"e": "Finish with lemon juice and serve hot.",
"t": "எலுமிச்சை சாறு சேர்த்துச் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Boondi raita",
"servings": 4,
"prep": 5,
"cook": 0,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Curd",
"t": "தயிர்",
"q": 2,
"u": "cup"
},
{
"n": "Boondi",
"t": "பூந்தி",
"q": 0.5,
"u": "cup"
},
{
"n": "Roasted cumin powder",
"t": "வறுத்த சீரகத் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Whisk the curd smooth with salt and a splash of water.",
"t": "தயிரை உப்பு, சிறிது தண்ணீருடன் மிருதுவாகக் கடையவும்."
},
{
"e": "Soak the boondi in warm water for 2 minutes, squeeze and fold into the curd.",
"t": "பூந்தியை வெந்நீரில் 2 நிமிடம் ஊறவைத்துப் பிழிந்து தயிரில் கலக்கவும்."
},
{
"e": "Sprinkle with cumin and chilli powder. Serve chilled.",
"t": "சீரகத் தூள், மிளகாய்த் தூள் தூவி குளிர்ச்சியாகப் பரிமாறவும்."
}
]
},
{
"dish": "Cucumber raita",
"servings": 4,
"prep": 10,
"cook": 0,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Curd",
"t": "தயிர்",
"q": 2,
"u": "cup"
},
{
"n": "Cucumber, grated",
"t": "வெள்ளரிக்காய்",
"q": 1,
"u": "piece"
},
{
"n": "Roasted cumin powder",
"t": "வறுத்த சீரகத் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 1,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Squeeze the water out of the grated cucumber.",
"t": "துருவிய வெள்ளரிக்காயிலிருந்து தண்ணீரைப் பிழிந்து எடுக்கவும்."
},
{
"e": "Whisk the curd with salt and fold in the cucumber and cumin.",
"t": "தயிரை உப்புடன் கடைந்து வெள்ளரிக்காய், சீரகத் தூள் சேர்க்கவும்."
},
{
"e": "Top with coriander and serve chilled.",
"t": "கொத்தமல்லி தூவி குளிர்ச்சியாகப் பரிமாறவும்."
}
]
},
{
"dish": "Pasta aglio e olio",
"servings": 4,
"prep": 5,
"cook": 15,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Spaghetti",
"t": "ஸ்பகெட்டி",
"q": 300,
"u": "g"
},
{
"n": "Garlic, thinly sliced",
"t": "பூண்டு",
"q": 6,
"u": "clove"
},
{
"n": "Olive oil",
"t": "ஆலிவ் எண்ணெய்",
"q": 5,
"u": "tbsp"
},
{
"n": "Chilli flakes",
"t": "மிளகாய்த் துகள்கள்",
"q": 1,
"u": "tsp"
},
{
"n": "Parsley, chopped",
"t": "பார்ஸ்லி",
"q": 2,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Boil the spaghetti in well salted water until al dente. Keep a cup of the pasta water.",
"t": "ஸ்பகெட்டியை உப்பு நீரில் சற்று கடினமாக இருக்கும்படி வேகவைத்து, ஒரு கப் வடிநீரை எடுத்து வைக்கவும்."
},
{
"e": "Warm the olive oil on low heat and gently cook the garlic until pale gold. Add the chilli flakes.",
"t": "ஆலிவ் எண்ணெயை சிறு தீயில் சூடாக்கி பூண்டை வெளிர் பொன்னிறமாக வதக்கி, மிளகாய்த் துகள்கள் சேர்க்கவும்."
},
{
"e": "Add the drained pasta and a splash of pasta water and toss until glossy.",
"t": "வடித்த பாஸ்தாவையும் சிறிது வடிநீரையும் சேர்த்து பளபளப்பாகும் வரை புரட்டவும்."
},
{
"e": "Finish with parsley and serve at once.",
"t": "பார்ஸ்லி தூவி உடனே பரிமாறவும்."
}
]
},
{
"dish": "Grilled cheese sandwich",
"servings": 2,
"prep": 5,
"cook": 8,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Bread slices",
"t": "ரொட்டித் துண்டுகள்",
"q": 4,
"u": "slice"
},
{
"n": "Cheese, sliced or grated",
"t": "சீஸ்",
"q": 100,
"u": "g"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 2,
"u": "tbsp"
}
],
"steps": [
{
"e": "Butter one side of each slice of bread.",
"t": "ஒவ்வொரு துண்டின் ஒரு பக்கத்திலும் வெண்ணெய் தடவவும்."
},
{
"e": "Put the cheese between two slices, buttered sides out.",
"t": "இரண்டு துண்டுகளுக்கு நடுவில் சீஸை வைத்து, வெண்ணெய் தடவிய பக்கம் வெளியே இருக்கும்படி வைக்கவும்."
},
{
"e": "Cook on a pan over medium-low heat 3 minutes each side, until golden and the cheese melts.",
"t": "நடுத்தர-சிறு தீயில் இருபுறமும் 3 நிமிடம் பொன்னிறமாகவும் சீஸ் உருகும் வரையிலும் சுடவும்."
}
]
},
{
"dish": "Vegetable soup",
"servings": 4,
"prep": 10,
"cook": 25,
"note": null,
"note_ta": null,
"ingredients": [
{
"n": "Mixed vegetables, diced (carrot, beans, peas)",
"t": "கலவை காய்கறிகள்",
"q": 3,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1,
"u": "piece"
},
{
"n": "Garlic, chopped",
"t": "பூண்டு",
"q": 2,
"u": "clove"
},
{
"n": "Water or stock",
"t": "தண்ணீர் அல்லது ஸ்டாக்",
"q": 5,
"u": "cup"
},
{
"n": "Butter or oil",
"t": "வெண்ணெய் அல்லது எண்ணெய்",
"q": 1,
"u": "tbsp"
},
{
"n": "Black pepper",
"t": "மிளகுத் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Heat the butter and cook the onion and garlic until soft.",
"t": "வெண்ணெயில் வெங்காயம், பூண்டை மென்மையாக வதக்கவும்."
},
{
"e": "Add the vegetables and cook 2 minutes, then pour in the water and add salt.",
"t": "காய்கறிகளைச் சேர்த்து 2 நிமிடம் வதக்கி, தண்ணீர், உப்பு சேர்க்கவும்."
},
{
"e": "Simmer 15 to 20 minutes until the vegetables are tender.",
"t": "காய்கறிகள் வேகும் வரை 15 முதல் 20 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Season with pepper and serve hot.",
"t": "மிளகுத் தூள் சேர்த்துச் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Miso soup",
"servings": 2,
"prep": 5,
"cook": 10,
"note": "Miso contains soy. Check the dashi for fish.",
"note_ta": "மிசோவில் சோயா உள்ளது. தாஷியில் மீன் உள்ளதா எனப் பார்க்கவும்.",
"ingredients": [
{
"n": "Water",
"t": "தண்ணீர்",
"q": 3,
"u": "cup"
},
{
"n": "Dashi powder",
"t": "தாஷி தூள்",
"q": 1,
"u": "tsp"
},
{
"n": "Miso paste",
"t": "மிசோ விழுது",
"q": 2,
"u": "tbsp"
},
{
"n": "Tofu, cubed",
"t": "டோஃபு",
"q": 100,
"u": "g"
},
{
"n": "Spring onion, sliced",
"t": "வெங்காயத்தாள்",
"q": 1,
"u": "piece"
}
],
"steps": [
{
"e": "Bring the water and dashi powder to a gentle simmer.",
"t": "தண்ணீர், தாஷி தூளை மெதுவாகக் கொதிக்கவிடவும்."
},
{
"e": "Add the tofu and heat through for 2 minutes.",
"t": "டோஃபுவைச் சேர்த்து 2 நிமிடம் சூடாக்கவும்."
},
{
"e": "Turn the heat off. Dissolve the miso in a ladle of the broth and stir it in. Do not boil after this.",
"t": "தீயை அணைத்து, ஒரு கரண்டி குழம்பில் மிசோவைக் கரைத்துச் சேர்க்கவும். இதன் பின் கொதிக்க விட வேண்டாம்."
},
{
"e": "Top with spring onion and serve at once.",
"t": "வெங்காயத்தாள் தூவி உடனே பரிமாறவும்."
}
]
},
{
"dish": "Chicken teriyaki",
"servings": 2,
"prep": 10,
"cook": 15,
"note": "Contains soy and wheat (in soy sauce).",
"note_ta": "சோயா, கோதுமை (சோயா சாஸில்) உள்ளது.",
"ingredients": [
{
"n": "Chicken thighs, boneless",
"t": "கோழி இறைச்சி",
"q": 400,
"u": "g"
},
{
"n": "Soy sauce",
"t": "சோயா சாஸ்",
"q": 3,
"u": "tbsp"
},
{
"n": "Mirin or honey",
"t": "மிரின் அல்லது தேன்",
"q": 2,
"u": "tbsp"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1,
"u": "tbsp"
},
{
"n": "Ginger, grated",
"t": "இஞ்சி",
"q": 1,
"u": "tsp"
},
{
"n": "Garlic, grated",
"t": "பூண்டு",
"q": 1,
"u": "clove"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1,
"u": "tbsp"
},
{
"n": "Sesame seeds",
"t": "எள்",
"q": 1,
"u": "tsp"
}
],
"steps": [
{
"e": "Mix the soy sauce, mirin, sugar, ginger and garlic for the sauce.",
"t": "சோயா சாஸ், மிரின், சர்க்கரை, இஞ்சி, பூண்டைக் கலந்து சாஸ் தயாரிக்கவும்."
},
{
"e": "Sear the chicken skin side down in hot oil until browned, then flip and cook through.",
"t": "கோழியை சூடான எண்ணெயில் தோல் பக்கம் கீழே வைத்துப் பழுப்பாக வறுத்து, திருப்பிப் போட்டு வேகவிடவும்."
},
{
"e": "Pour the sauce over and simmer, spooning it over until thick and glossy.",
"t": "சாஸை ஊற்றி, கரண்டியால் மேலே ஊற்றிக்கொண்டே கெட்டியாகவும் பளபளப்பாகவும் ஆகும் வரை கொதிக்கவிடவும்."
},
{
"e": "Slice, sprinkle with sesame and serve with rice.",
"t": "துண்டுகளாக்கி எள் தூவி சாதத்துடன் பரிமாறவும்."
}
]
}
]
$json$::jsonb) as x(dish text, servings int, prep int, cook int, note text, note_ta text, ingredients jsonb, steps jsonb)
),
r as (
  insert into public.recipes (dish_id, servings, prep_minutes, cook_minutes, credit, note, note_ta)
  select d.id, s.servings, s.prep, s.cook, 'Standard recipe drafted by Claude. Check the ingredients and seasoning before cooking.', s.note, s.note_ta
  from src s
  join public.dishes d on d.household_id is null and d.name = s.dish
  where not exists (select 1 from public.recipes r0 where r0.dish_id = d.id and r0.household_id is null)
  returning id, dish_id
),
ing as (
  insert into public.recipe_ingredients (recipe_id, position, name, name_ta, quantity, unit)
  select r.id, e.ord::smallint, e.item->>'n', e.item->>'t', (e.item->>'q')::numeric, e.item->>'u'
  from r
  join public.dishes d on d.id = r.dish_id
  join src s on s.dish = d.name
  cross join lateral jsonb_array_elements(s.ingredients) with ordinality as e(item, ord)
  returning recipe_id
),
stp as (
  insert into public.recipe_steps (recipe_id, position, body, body_ta)
  select r.id, e.ord::smallint, e.item->>'e', e.item->>'t'
  from r
  join public.dishes d on d.id = r.dish_id
  join src s on s.dish = d.name
  cross join lateral jsonb_array_elements(s.steps) with ordinality as e(item, ord)
  returning recipe_id
)
select (select count(*) from r) as recipes_inserted,
       (select count(*) from ing) as ingredients_inserted,
       (select count(*) from stp) as steps_inserted;
