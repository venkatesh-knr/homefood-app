-- HomeFood · 0009: many more Indian dishes (South and North), with lots of side dishes
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Adds 110 dishes to the shared catalogue (65 South Indian, 45 North Indian). 64 of them are side dishes
-- (chutneys, poriyal, kootu, raita, breads, pickles, snacks, sweets, drinks) or work as either. Each gets an
-- English and a Tamil name. Safe to run twice: a dish whose name already exists in the shared catalogue is skipped.
-- No photos yet: these show the coloured-initial placeholder until photos are added (a later migration),
-- and any home can already replace one with its own photo.
-- Allergen tags are best-effort (typical recipe); the app tells people to check ingredients.

with seed(cuisine_id, name, name_ta, meal_types, course, diet, tags, allergens, prep_minutes) as (
  select * from (values
    ('00000000-0000-4000-8000-000000000002'::uuid, 'Upma'::text, 'உப்புமா'::text, '{breakfast}'::public.meal_type[], 'main'::public.dish_course, 'veg'::public.diet_type, '{}'::text[], '{wheat}'::text[], 20::smallint),
    ('00000000-0000-4000-8000-000000000002', 'Pesarattu', 'பெசரட்டு', '{breakfast}', 'main', 'veg', '{}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Uttapam', 'ஊத்தப்பம்', '{breakfast,dinner}', 'main', 'veg', '{}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Masala dosa', 'மசாலா தோசை', '{breakfast,dinner}', 'main', 'veg', '{}', '{}', 35),
    ('00000000-0000-4000-8000-000000000002', 'Rava dosa', 'ரவா தோசை', '{breakfast,dinner}', 'main', 'veg', '{}', '{wheat}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Appam', 'ஆப்பம்', '{breakfast,dinner}', 'main', 'veg', '{}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Puttu', 'புட்டு', '{breakfast}', 'main', 'veg', '{steamed}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Parotta', 'பரோட்டா', '{dinner}', 'main', 'veg', '{}', '{wheat}', 40),
    ('00000000-0000-4000-8000-000000000002', 'Kothu parotta', 'கொத்து பரோட்டா', '{dinner}', 'main', 'egg', '{fried}', '{wheat,egg}', 35),
    ('00000000-0000-4000-8000-000000000002', 'Lemon rice', 'எலுமிச்சை சாதம்', '{lunch}', 'main', 'veg', '{}', '{peanut}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Tamarind rice', 'புளியோதரை', '{lunch}', 'main', 'veg', '{}', '{peanut}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Coconut rice', 'தேங்காய் சாதம்', '{lunch}', 'main', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Tomato rice', 'தக்காளி சாதம்', '{lunch}', 'main', 'veg', '{}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Sambar rice', 'சாம்பார் சாதம்', '{lunch}', 'main', 'veg', '{}', '{}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Bisi bele bath', 'பிசிபேளா பாத்', '{lunch}', 'main', 'veg', '{}', '{}', 45),
    ('00000000-0000-4000-8000-000000000002', 'Vegetable biryani', 'காய்கறி பிரியாணி', '{lunch,dinner}', 'main', 'veg', '{}', '{milk}', 50),
    ('00000000-0000-4000-8000-000000000002', 'Chicken biryani', 'சிக்கன் பிரியாணி', '{lunch,dinner}', 'main', 'non_veg', '{spicy}', '{milk}', 70),
    ('00000000-0000-4000-8000-000000000002', 'Mutton biryani', 'மட்டன் பிரியாணி', '{lunch,dinner}', 'main', 'non_veg', '{spicy}', '{milk}', 90),
    ('00000000-0000-4000-8000-000000000002', 'Egg biryani', 'முட்டை பிரியாணி', '{lunch,dinner}', 'main', 'egg', '{spicy}', '{egg,milk}', 50),
    ('00000000-0000-4000-8000-000000000002', 'Chicken chettinad', 'செட்டிநாடு சிக்கன்', '{lunch,dinner}', 'main', 'non_veg', '{spicy}', '{}', 50),
    ('00000000-0000-4000-8000-000000000002', 'Chicken curry', 'கோழிக் குழம்பு', '{lunch,dinner}', 'main', 'non_veg', '{spicy}', '{}', 50),
    ('00000000-0000-4000-8000-000000000002', 'Fish curry', 'மீன் குழம்பு', '{lunch,dinner}', 'main', 'non_veg', '{spicy}', '{fish}', 40),
    ('00000000-0000-4000-8000-000000000002', 'Egg curry', 'முட்டைக் குழம்பு', '{lunch,dinner}', 'main', 'egg', '{}', '{egg}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Vatha kuzhambu', 'வத்தக் குழம்பு', '{lunch}', 'both', 'veg', '{spicy}', '{}', 40),
    ('00000000-0000-4000-8000-000000000002', 'Mor kuzhambu', 'மோர்க் குழம்பு', '{lunch}', 'both', 'veg', '{}', '{milk}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Coconut chutney', 'தேங்காய் சட்னி', '{breakfast,dinner}', 'side', 'veg', '{}', '{}', 10),
    ('00000000-0000-4000-8000-000000000002', 'Tomato chutney', 'தக்காளி சட்னி', '{breakfast,dinner}', 'side', 'veg', '{}', '{}', 15),
    ('00000000-0000-4000-8000-000000000002', 'Mint chutney', 'புதினா சட்னி', '{breakfast,snacks,dinner}', 'side', 'veg', '{}', '{}', 10),
    ('00000000-0000-4000-8000-000000000002', 'Onion chutney', 'வெங்காய சட்னி', '{breakfast,dinner}', 'side', 'veg', '{}', '{}', 15),
    ('00000000-0000-4000-8000-000000000002', 'Peanut chutney', 'வேர்க்கடலை சட்னி', '{breakfast,dinner}', 'side', 'veg', '{}', '{peanut}', 10),
    ('00000000-0000-4000-8000-000000000002', 'Idli podi', 'இட்லி பொடி', '{breakfast,dinner}', 'side', 'veg', '{spicy}', '{sesame}', 5),
    ('00000000-0000-4000-8000-000000000002', 'Veg kurma', 'வெஜ் குருமா', '{breakfast,dinner}', 'side', 'veg', '{}', '{cashew}', 35),
    ('00000000-0000-4000-8000-000000000002', 'Beans poriyal', 'பீன்ஸ் பொரியல்', '{lunch}', 'side', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Cabbage poriyal', 'முட்டைக்கோஸ் பொரியல்', '{lunch}', 'side', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Carrot poriyal', 'கேரட் பொரியல்', '{lunch}', 'side', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Beetroot poriyal', 'பீட்ரூட் பொரியல்', '{lunch}', 'side', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Potato roast', 'உருளைக்கிழங்கு வறுவல்', '{lunch,dinner}', 'side', 'veg', '{fried}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Vendakkai fry', 'வெண்டைக்காய் வறுவல்', '{lunch}', 'side', 'veg', '{fried}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Raw banana fry', 'வாழைக்காய் வறுவல்', '{lunch}', 'side', 'veg', '{fried}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Keerai masiyal', 'கீரை மசியல்', '{lunch}', 'side', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Cabbage kootu', 'முட்டைக்கோஸ் கூட்டு', '{lunch}', 'side', 'veg', '{}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Pumpkin kootu', 'பூசணிக்காய் கூட்டு', '{lunch}', 'side', 'veg', '{}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Avial', 'அவியல்', '{lunch}', 'side', 'veg', '{}', '{milk}', 40),
    ('00000000-0000-4000-8000-000000000002', 'Cucumber pachadi', 'வெள்ளரிக்காய் பச்சடி', '{lunch}', 'side', 'veg', '{}', '{milk}', 10),
    ('00000000-0000-4000-8000-000000000002', 'Appalam', 'அப்பளம்', '{lunch,dinner}', 'side', 'veg', '{fried}', '{}', 5),
    ('00000000-0000-4000-8000-000000000002', 'Mango pickle', 'மாங்காய் ஊறுகாய்', '{lunch,dinner}', 'side', 'veg', '{spicy}', '{mustard}', 5),
    ('00000000-0000-4000-8000-000000000002', 'Lemon pickle', 'எலுமிச்சை ஊறுகாய்', '{lunch,dinner}', 'side', 'veg', '{spicy}', '{mustard}', 5),
    ('00000000-0000-4000-8000-000000000002', 'Curd', 'தயிர்', '{lunch,dinner}', 'side', 'veg', '{}', '{milk}', 2),
    ('00000000-0000-4000-8000-000000000002', 'Buttermilk', 'நீர் மோர்', '{lunch,snacks}', 'side', 'veg', '{}', '{milk}', 5),
    ('00000000-0000-4000-8000-000000000002', 'Paruppu vadai', 'பருப்பு வடை', '{snacks}', 'side', 'veg', '{fried}', '{}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Murukku', 'முறுக்கு', '{snacks}', 'side', 'veg', '{fried}', '{}', 60),
    ('00000000-0000-4000-8000-000000000002', 'Mirchi bajji', 'மிளகாய் பஜ்ஜி', '{snacks}', 'side', 'veg', '{fried,spicy}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Sundal', 'சுண்டல்', '{snacks}', 'side', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000002', 'Kozhukattai', 'கொழுக்கட்டை', '{snacks}', 'side', 'veg', '{steamed,sweet}', '{}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Semiya payasam', 'சேமியா பாயசம்', '{lunch,dinner}', 'side', 'veg', '{sweet}', '{milk,wheat,cashew}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Rava kesari', 'ரவா கேசரி', '{breakfast,snacks}', 'side', 'veg', '{sweet,ghee}', '{milk,wheat,cashew}', 25),
    ('00000000-0000-4000-8000-000000000002', 'Filter coffee', 'ஃபில்டர் காபி', '{breakfast,snacks}', 'side', 'veg', '{caffeine}', '{milk}', 10),
    ('00000000-0000-4000-8000-000000000002', 'Egg podimas', 'முட்டை பொடிமாஸ்', '{lunch,dinner}', 'side', 'egg', '{}', '{egg}', 15),
    ('00000000-0000-4000-8000-000000000002', 'Omelette', 'ஆம்லெட்', '{breakfast,dinner}', 'both', 'egg', '{}', '{egg}', 10),
    ('00000000-0000-4000-8000-000000000002', 'Boiled egg', 'வேகவைத்த முட்டை', '{breakfast,lunch,dinner}', 'side', 'egg', '{}', '{egg}', 12),
    ('00000000-0000-4000-8000-000000000002', 'Chicken 65', 'சிக்கன் 65', '{snacks,dinner}', 'side', 'non_veg', '{fried,spicy}', '{egg}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Chicken fry', 'கோழி வறுவல்', '{lunch,dinner}', 'side', 'non_veg', '{fried,spicy}', '{}', 35),
    ('00000000-0000-4000-8000-000000000002', 'Fish fry', 'மீன் வறுவல்', '{lunch,dinner}', 'side', 'non_veg', '{fried,spicy}', '{fish}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Prawn masala', 'இறால் மசாலா', '{lunch,dinner}', 'side', 'non_veg', '{spicy}', '{shellfish}', 30),
    ('00000000-0000-4000-8000-000000000002', 'Mutton chukka', 'மட்டன் சுக்கா', '{lunch,dinner}', 'side', 'non_veg', '{spicy}', '{}', 60),
    ('00000000-0000-4000-8000-000000000003', 'Dal tadka', 'தால் தட்கா', '{lunch,dinner}', 'both', 'veg', '{}', '{}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Dal makhani', 'தால் மக்கனி', '{lunch,dinner}', 'main', 'veg', '{}', '{milk}', 60),
    ('00000000-0000-4000-8000-000000000003', 'Rajma masala', 'ராஜ்மா மசாலா', '{lunch,dinner}', 'main', 'veg', '{}', '{}', 50),
    ('00000000-0000-4000-8000-000000000003', 'Palak paneer', 'பாலக் பனீர்', '{lunch,dinner}', 'main', 'veg', '{}', '{milk}', 35),
    ('00000000-0000-4000-8000-000000000003', 'Kadai paneer', 'கடாய் பனீர்', '{lunch,dinner}', 'main', 'veg', '{spicy}', '{milk}', 35),
    ('00000000-0000-4000-8000-000000000003', 'Matar paneer', 'மட்டர் பனீர்', '{lunch,dinner}', 'main', 'veg', '{}', '{milk}', 35),
    ('00000000-0000-4000-8000-000000000003', 'Aloo gobi', 'ஆலு கோபி', '{lunch,dinner}', 'both', 'veg', '{}', '{}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Baingan bharta', 'பைங்கன் பர்த்தா', '{lunch,dinner}', 'both', 'veg', '{}', '{}', 40),
    ('00000000-0000-4000-8000-000000000003', 'Bhindi masala', 'பிண்டி மசாலா', '{lunch,dinner}', 'both', 'veg', '{}', '{}', 25),
    ('00000000-0000-4000-8000-000000000003', 'Mixed vegetable curry', 'கலவை காய்கறிக் கறி', '{lunch,dinner}', 'main', 'veg', '{}', '{}', 35),
    ('00000000-0000-4000-8000-000000000003', 'Pav bhaji', 'பாவ் பாஜி', '{dinner}', 'main', 'veg', '{}', '{wheat,milk}', 40),
    ('00000000-0000-4000-8000-000000000003', 'Poori bhaji', 'பூரி பாஜி', '{breakfast,dinner}', 'main', 'veg', '{fried}', '{wheat}', 40),
    ('00000000-0000-4000-8000-000000000003', 'Chole bhature', 'சோலே பதூரா', '{breakfast,lunch}', 'main', 'veg', '{fried}', '{wheat}', 50),
    ('00000000-0000-4000-8000-000000000003', 'Poha', 'போஹா', '{breakfast}', 'main', 'veg', '{}', '{peanut}', 20),
    ('00000000-0000-4000-8000-000000000003', 'Besan chilla', 'பேசன் சில்லா', '{breakfast}', 'main', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000003', 'Methi thepla', 'மேத்தி தெப்லா', '{breakfast,dinner}', 'main', 'veg', '{}', '{wheat}', 25),
    ('00000000-0000-4000-8000-000000000003', 'Dhokla', 'தோக்ளா', '{breakfast,snacks}', 'main', 'veg', '{steamed}', '{}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Khichdi', 'கிச்சடி', '{lunch,dinner}', 'main', 'veg', '{}', '{}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Vegetable pulao', 'காய்கறி புலாவ்', '{lunch}', 'main', 'veg', '{}', '{}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Kadhi pakora', 'கடி பகோடா', '{lunch}', 'main', 'veg', '{}', '{milk}', 40),
    ('00000000-0000-4000-8000-000000000003', 'Egg bhurji', 'முட்டை புர்ஜி', '{breakfast,dinner}', 'main', 'egg', '{}', '{egg}', 15),
    ('00000000-0000-4000-8000-000000000003', 'Dhaba chicken curry', 'தாபா சிக்கன் கறி', '{lunch,dinner}', 'main', 'non_veg', '{spicy}', '{}', 50),
    ('00000000-0000-4000-8000-000000000003', 'Tandoori chicken', 'தந்தூரி சிக்கன்', '{dinner}', 'main', 'non_veg', '{spicy}', '{milk}', 60),
    ('00000000-0000-4000-8000-000000000003', 'Chicken tikka', 'சிக்கன் டிக்கா', '{snacks,dinner}', 'main', 'non_veg', '{spicy}', '{milk}', 40),
    ('00000000-0000-4000-8000-000000000003', 'Mutton rogan josh', 'மட்டன் ரோகன் ஜோஷ்', '{lunch,dinner}', 'main', 'non_veg', '{spicy}', '{}', 80),
    ('00000000-0000-4000-8000-000000000003', 'Mutton keema', 'மட்டன் கீமா', '{lunch,dinner}', 'main', 'non_veg', '{spicy}', '{}', 45),
    ('00000000-0000-4000-8000-000000000003', 'Butter naan', 'பட்டர் நான்', '{dinner}', 'side', 'veg', '{}', '{wheat,milk}', 25),
    ('00000000-0000-4000-8000-000000000003', 'Tandoori roti', 'தந்தூரி ரொட்டி', '{lunch,dinner}', 'side', 'veg', '{}', '{wheat}', 15),
    ('00000000-0000-4000-8000-000000000003', 'Phulka', 'புல்கா', '{lunch,dinner}', 'side', 'veg', '{}', '{wheat}', 15),
    ('00000000-0000-4000-8000-000000000003', 'Boondi raita', 'பூந்தி ரைத்தா', '{lunch,dinner}', 'side', 'veg', '{}', '{milk}', 10),
    ('00000000-0000-4000-8000-000000000003', 'Cucumber raita', 'வெள்ளரி ரைத்தா', '{lunch,dinner}', 'side', 'veg', '{}', '{milk}', 10),
    ('00000000-0000-4000-8000-000000000003', 'Kachumber salad', 'கச்சும்பர் சாலட்', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 10),
    ('00000000-0000-4000-8000-000000000003', 'Jeera aloo', 'ஜீரா ஆலு', '{lunch,dinner}', 'side', 'veg', '{}', '{}', 20),
    ('00000000-0000-4000-8000-000000000003', 'Paneer tikka', 'பனீர் டிக்கா', '{snacks,dinner}', 'side', 'veg', '{}', '{milk}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Mixed veg pakora', 'கலவை காய்கறி பகோடா', '{snacks}', 'side', 'veg', '{fried}', '{}', 25),
    ('00000000-0000-4000-8000-000000000003', 'Kachori', 'கச்சோரி', '{snacks}', 'side', 'veg', '{fried}', '{wheat}', 40),
    ('00000000-0000-4000-8000-000000000003', 'Bhel puri', 'பேல் பூரி', '{snacks}', 'side', 'veg', '{}', '{peanut,wheat}', 15),
    ('00000000-0000-4000-8000-000000000003', 'Pani puri', 'பானி பூரி', '{snacks}', 'side', 'veg', '{fried}', '{wheat}', 25),
    ('00000000-0000-4000-8000-000000000003', 'Vada pav', 'வடா பாவ்', '{snacks}', 'main', 'veg', '{fried}', '{wheat}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Masala chai', 'மசாலா சாய்', '{breakfast,snacks}', 'side', 'veg', '{caffeine}', '{milk}', 10),
    ('00000000-0000-4000-8000-000000000003', 'Sweet lassi', 'ஸ்வீட் லஸ்ஸி', '{lunch,snacks}', 'side', 'veg', '{sweet}', '{milk}', 5),
    ('00000000-0000-4000-8000-000000000003', 'Gulab jamun', 'குலாப் ஜாமூன்', '{lunch,dinner}', 'side', 'veg', '{sweet,fried}', '{milk,wheat}', 40),
    ('00000000-0000-4000-8000-000000000003', 'Kheer', 'கீர்', '{lunch,dinner}', 'side', 'veg', '{sweet}', '{milk,cashew}', 30),
    ('00000000-0000-4000-8000-000000000003', 'Gajar halwa', 'கேரட் ஹல்வா', '{lunch,dinner}', 'side', 'veg', '{sweet}', '{milk,cashew}', 50),
    ('00000000-0000-4000-8000-000000000003', 'Jalebi', 'ஜிலேபி', '{snacks}', 'side', 'veg', '{sweet,fried}', '{wheat}', 40)
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
