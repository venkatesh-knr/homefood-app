# More South Indian dishes (migration 0015). One line per dish, fields separated by " | ":
# name | Tamil name | meal types | course | diet | tags | allergens | prep minutes | serving | kcal | protein g | carbs g | fat g | fibre g | sugar g | sodium mg
# Nutrition values are ESTIMATES for a typical home recipe and portion (same approach as migration 0012).
# tags used by the app: steamed, fried, spicy, sweet, caffeine.  Leave a field empty for "none".
TEXT = """
# ── Tiffin: idli, dosa and friends ──
Rava idli | ரவா இட்லி | breakfast | main | veg | steamed | wheat,milk,cashew | 30 | 2 idlis | 190 | 6 | 32 | 4 | 2 | 2 | 380
Podi idli | பொடி இட்லி | breakfast,snacks | main | veg | spicy | sesame | 15 | 3 mini idlis with podi (150 g) | 230 | 7 | 38 | 6 | 3 | 1 | 420
Mini idli sambar | மினி இட்லி சாம்பார் | breakfast | main | veg | steamed | | 25 | 8 mini idlis in sambar | 260 | 9 | 46 | 4 | 5 | 3 | 650
Set dosa | செட் தோசை | breakfast | main | veg | | | 30 | 3 small dosas | 270 | 6 | 48 | 5 | 2 | 1 | 380
Neer dosa | நீர் தோசை | breakfast,dinner | main | veg | | | 20 | 3 neer dosas | 180 | 3 | 36 | 2 | 1 | 0.5 | 160
Adai | அடை | breakfast,dinner | main | veg | | | 30 | 2 adai | 320 | 12 | 46 | 10 | 7 | 1.5 | 420
Ragi dosa | ராகி தோசை | breakfast,dinner | main | veg | | | 25 | 2 dosas | 200 | 5 | 36 | 4 | 4 | 1 | 260
Wheat dosa | கோதுமை தோசை | breakfast,dinner | main | veg | | wheat | 20 | 2 dosas | 210 | 6 | 36 | 4.5 | 3 | 1 | 280
Kal dosai | கல் தோசை | breakfast,dinner | main | veg | | | 20 | 2 thick dosas | 230 | 6 | 42 | 4 | 2 | 1 | 320
Paper roast | பேப்பர் ரோஸ்ட் | breakfast | main | veg | | | 30 | 1 large dosa | 260 | 5 | 38 | 10 | 2 | 1 | 340
Egg dosa | முட்டை தோசை | breakfast,dinner | main | egg | | egg | 20 | 1 dosa with egg | 230 | 10 | 26 | 9 | 1 | 0.5 | 330
Khara bath | காரா பாத் | breakfast | main | veg | | wheat,cashew | 25 | 1 cup | 280 | 6 | 42 | 9.5 | 3 | 2 | 520
Semiya upma | சேமியா உப்புமா | breakfast | main | veg | | wheat,cashew | 20 | 1 cup | 250 | 6 | 40 | 8 | 2 | 1.5 | 480
Godhumai rava upma | கோதுமை ரவா உப்புமா | breakfast | main | veg | | wheat | 25 | 1 cup | 240 | 7 | 38 | 7 | 5 | 2 | 470
Arisi upma | அரிசி உப்புமா | breakfast | main | veg | | | 30 | 1 cup | 250 | 5 | 42 | 6.5 | 2 | 1 | 460
Samai upma | சாமை உப்புமா | breakfast | main | veg | | | 25 | 1 cup | 230 | 6 | 36 | 7 | 4 | 1.5 | 470
Kuzhi paniyaram | குழிப்பணியாரம் | breakfast,snacks | main | veg | fried | | 25 | 6 pieces | 250 | 6 | 36 | 9 | 2 | 1 | 330
Idiyappam | இடியாப்பம் | breakfast,dinner | main | veg | steamed | | 25 | 3 idiyappam | 210 | 4 | 44 | 1.5 | 1.5 | 0.5 | 100
Poori | பூரி | breakfast | main | veg | fried | wheat | 25 | 2 pooris | 300 | 5 | 36 | 15 | 2 | 0.5 | 200
Sambar vada | சாம்பார் வடை | breakfast | main | veg | fried | | 30 | 2 vadas in sambar | 330 | 11 | 36 | 15 | 5 | 3 | 700
Thayir vada | தயிர் வடை | snacks,lunch | main | veg | | milk | 30 | 2 vadas in curd | 300 | 12 | 30 | 14 | 3 | 4 | 480
Pazhaya sadam | பழைய சாதம் | breakfast | main | veg | | milk | 5 | 1 bowl (250 g) | 200 | 4 | 40 | 2.5 | 1.5 | 1 | 200
Mor kali | மோர்க்களி | breakfast,dinner | main | veg | | milk | 25 | 1 bowl | 220 | 4 | 36 | 6 | 1 | 2 | 400
Thinai pongal | தினை பொங்கல் | breakfast | main | veg | | milk,cashew | 30 | 1 cup | 260 | 8 | 38 | 8 | 4 | 1 | 430
Ragi roti | ராகி ரொட்டி | breakfast,dinner | main | veg | | | 25 | 2 rotis | 230 | 5 | 44 | 3.5 | 6 | 1 | 200
Akki roti | அக்கி ரொட்டி | breakfast | main | veg | | | 30 | 2 rotis | 260 | 5 | 44 | 7 | 3 | 1 | 360
Vangi bath | வாங்கி பாத் | breakfast,lunch | main | veg | | peanut | 35 | 1 cup | 290 | 6 | 44 | 10 | 4 | 2 | 560
Veechu parotta | வீச்சு பரோட்டா | dinner | main | veg | | wheat | 40 | 1 parotta | 320 | 6 | 40 | 15 | 1.5 | 1 | 380
Chilli parotta | சில்லி பரோட்டா | dinner | main | veg | spicy | wheat | 30 | 1 plate | 480 | 10 | 58 | 22 | 3 | 6 | 900
# ── Porridges, drinks and sweets for breakfast ──
Ragi koozh | ராகி கூழ் | breakfast | side | veg | | milk | 15 | 1 glass (250 ml) | 120 | 3 | 24 | 1 | 3 | 1 | 180
Kambu koozh | கம்பு கூழ் | breakfast,snacks | side | veg | | milk | 15 | 1 glass (250 ml) | 130 | 4 | 24 | 2 | 3 | 1 | 160
Ragi mudde | ராகி களி | lunch | main | veg | | | 20 | 1 large ball (200 g) | 270 | 6 | 55 | 2 | 7 | 1 | 20
Ulundu kali | உளுந்தங்களி | breakfast,snacks | side | veg | sweet | sesame | 25 | 1 small bowl | 200 | 6 | 26 | 8 | 4 | 12 | 20
Sakkarai pongal | சர்க்கரைப் பொங்கல் | breakfast,snacks | side | veg | sweet | milk,cashew | 40 | 1 small cup (120 g) | 280 | 4 | 46 | 9 | 1 | 24 | 40
Sukku malli coffee | சுக்கு மல்லி காபி | breakfast,snacks | side | veg | | | 10 | 1 cup | 30 | 0.2 | 7 | 0 | 0.3 | 6 | 5
Badam milk | பாதாம் பால் | breakfast,snacks | side | veg | sweet | milk,almond | 10 | 1 glass (250 ml) | 220 | 8 | 26 | 9 | 1 | 24 | 110
# ── Snacks: savoury ──
Pidi kozhukattai | பிடி கொழுக்கட்டை | snacks | side | veg | steamed | | 30 | 3 pieces | 160 | 3 | 30 | 3 | 2 | 2 | 120
Paal kozhukattai | பால் கொழுக்கட்டை | snacks | side | veg | sweet | milk | 35 | 1 small bowl | 200 | 4 | 34 | 5 | 1 | 14 | 60
Aloo bonda | உருளைக்கிழங்கு போண்டா | snacks | side | veg | fried | | 30 | 2 bondas | 280 | 6 | 32 | 14 | 3 | 1 | 380
Masala vadai | மசாலா வடை | snacks | side | veg | fried | | 25 | 3 vadas | 260 | 10 | 26 | 13 | 6 | 1 | 340
Keerai vadai | கீரை வடை | snacks | side | veg | fried | | 30 | 2 vadas | 230 | 9 | 22 | 12 | 5 | 1 | 330
Vazhaipoo vadai | வாழைப்பூ வடை | snacks | side | veg | fried | | 30 | 2 vadas | 220 | 8 | 22 | 11 | 6 | 1 | 320
Onion pakoda | வெங்காய பக்கோடா | snacks | side | veg | fried | | 20 | 1 small plate (60 g) | 240 | 6 | 22 | 14 | 3 | 3 | 340
Banana bajji | வாழைக்காய் பஜ்ஜி | snacks | side | veg | fried | | 25 | 3 pieces | 280 | 4 | 36 | 13 | 3 | 4 | 300
Potato bajji | உருளை பஜ்ஜி | snacks | side | veg | fried | | 25 | 3 pieces | 270 | 5 | 32 | 13 | 3 | 1 | 320
Vegetable cutlet | காய்கறி கட்லெட் | snacks | side | veg | fried | wheat | 35 | 2 cutlets | 230 | 5 | 30 | 10 | 4 | 2 | 380
Thattai | தட்டை | snacks | side | veg | fried | peanut | 40 | 3 pieces (40 g) | 200 | 4 | 22 | 11 | 2 | 0.5 | 220
Seedai | சீடை | snacks | side | veg | fried | | 40 | 5 pieces (40 g) | 190 | 3 | 26 | 9 | 1 | 0.5 | 140
Ribbon pakoda | ரிப்பன் பக்கோடா | snacks | side | veg | fried | | 40 | 1 handful (40 g) | 210 | 4 | 22 | 12 | 2 | 0.5 | 260
Mixture | மிக்சர் | snacks | side | veg | fried | peanut | 5 | 1 handful (40 g) | 220 | 6 | 18 | 14 | 2 | 1 | 320
Kara sev | காரசேவு | snacks | side | veg | fried | | 30 | 1 handful (40 g) | 210 | 5 | 20 | 12 | 2 | 0.5 | 300
Verkadalai sundal | வேர்க்கடலை சுண்டல் | snacks | side | veg | | peanut | 20 | 1 cup | 220 | 10 | 14 | 14 | 5 | 2 | 240
Corn sundal | சோள சுண்டல் | snacks | side | veg | | | 15 | 1 cup | 150 | 4 | 26 | 4 | 3.5 | 4 | 220
Banana chips | வாழைக்காய் சிப்ஸ் | snacks | side | veg | fried | | 20 | 1 handful (30 g) | 160 | 1 | 18 | 10 | 1.5 | 0.5 | 160
Chicken lollipop | சிக்கன் லாலிபாப் | snacks | side | non_veg | fried,spicy | wheat,egg | 40 | 3 pieces | 360 | 22 | 18 | 22 | 1 | 1 | 700
Mutton kola urundai | மட்டன் கோலா உருண்டை | snacks | side | non_veg | fried,spicy | | 40 | 4 pieces | 260 | 16 | 10 | 17 | 1.5 | 0.5 | 430
Mangalore buns | மங்களூர் பன் | breakfast,snacks | side | veg | fried,sweet | wheat,milk | 40 | 2 buns | 330 | 5 | 48 | 13 | 2 | 12 | 160
# ── Snacks and sweets ──
Adhirasam | அதிரசம் | snacks | side | veg | sweet,fried | | 60 | 1 piece (50 g) | 210 | 2 | 36 | 7 | 1 | 18 | 40
Ellu urundai | எள்ளு உருண்டை | snacks | side | veg | sweet | sesame | 20 | 2 balls (40 g) | 190 | 4 | 24 | 9 | 3 | 16 | 10
Kadalai mittai | கடலை மிட்டாய் | snacks | side | veg | sweet | peanut | 10 | 2 pieces (30 g) | 160 | 4 | 18 | 8 | 2 | 12 | 5
Sweet paniyaram | இனிப்பு பணியாரம் | snacks | side | veg | sweet,fried | | 30 | 4 pieces | 260 | 3 | 40 | 10 | 1.5 | 16 | 100
Pazham pori | பழம்பொரி | snacks | side | veg | sweet,fried | wheat | 25 | 2 pieces | 300 | 3 | 46 | 12 | 2 | 20 | 60
Unniyappam | உன்னியப்பம் | snacks | side | veg | sweet,fried | wheat | 40 | 3 pieces | 260 | 3 | 42 | 9 | 2 | 18 | 60
Poli | போளி | lunch,snacks | side | veg | sweet | wheat | 50 | 1 poli (80 g) | 260 | 5 | 42 | 8 | 3 | 20 | 80
Mysore pak | மைசூர் பாக் | lunch,snacks | side | veg | sweet | milk | 40 | 1 piece (40 g) | 220 | 3 | 20 | 14 | 1 | 16 | 10
Rava laddu | ரவா லட்டு | snacks | side | veg | sweet | wheat,milk,cashew | 30 | 1 laddu (40 g) | 170 | 3 | 24 | 7 | 1 | 14 | 10
Boondi laddu | பூந்தி லட்டு | snacks | side | veg | sweet,fried | cashew | 60 | 1 laddu (50 g) | 230 | 3 | 32 | 10 | 1 | 22 | 15
Badusha | பாதுஷா | snacks | side | veg | sweet,fried | wheat,milk | 60 | 1 piece (50 g) | 260 | 3 | 34 | 12 | 0.5 | 20 | 30
Paal payasam | பால் பாயசம் | lunch,dinner | side | veg | sweet | milk,cashew | 45 | 1 small bowl (150 ml) | 210 | 5 | 30 | 8 | 0.5 | 22 | 60
Javvarisi payasam | ஜவ்வரிசி பாயசம் | lunch,dinner | side | veg | sweet | milk,cashew | 35 | 1 small bowl (150 ml) | 220 | 4 | 36 | 7 | 0.5 | 20 | 50
# ── Cool drinks ──
Jigarthanda | ஜிகர்தண்டா | snacks | side | veg | sweet | milk | 20 | 1 glass (250 ml) | 280 | 6 | 42 | 9 | 1 | 36 | 90
Panakam | பானகம் | snacks | side | veg | sweet | | 10 | 1 glass (250 ml) | 90 | 0.3 | 22 | 0.2 | 0.3 | 20 | 10
Nannari sarbath | நன்னாரி சர்பத் | snacks | side | veg | sweet | | 5 | 1 glass (250 ml) | 100 | 0.2 | 25 | 0 | 0 | 24 | 10
Elaneer | இளநீர் | snacks | side | veg | | | 2 | 1 glass (250 ml) | 50 | 0.5 | 11 | 0.3 | 0 | 9 | 80
Rose milk | ரோஸ் மில்க் | snacks | side | veg | sweet | milk | 5 | 1 glass (250 ml) | 190 | 6 | 28 | 6 | 0 | 26 | 90
# ── Lunch: variety rice ──
Curry leaf rice | கறிவேப்பிலை சாதம் | lunch | main | veg | | | 20 | 1 cup | 250 | 5 | 42 | 7 | 2 | 1 | 420
Pudina rice | புதினா சாதம் | lunch | main | veg | | | 25 | 1 cup | 250 | 5 | 42 | 7 | 2.5 | 1 | 430
Ellu sadam | எள் சாதம் | lunch | main | veg | | sesame | 20 | 1 cup | 290 | 6 | 42 | 11 | 3 | 0.5 | 380
Mango rice | மாங்காய் சாதம் | lunch | main | veg | | peanut | 25 | 1 cup | 260 | 5 | 43 | 8 | 2.5 | 3 | 420
Nei sorru | நெய் சோறு | lunch,dinner | main | veg | | milk,cashew | 30 | 1 cup | 300 | 5 | 44 | 11 | 1 | 0.5 | 330
Paruppu sadam | பருப்பு சாதம் | lunch | main | veg | | milk | 20 | 1½ cups | 340 | 11 | 58 | 6 | 5 | 1 | 400
Rasam sadam | ரசம் சாதம் | lunch | main | veg | | | 15 | 1½ cups | 280 | 6 | 56 | 2.5 | 3 | 3 | 650
Dindigul biryani | திண்டுக்கல் பிரியாணி | lunch,dinner | main | non_veg | spicy | milk | 80 | 1½ cups (300 g) | 540 | 27 | 62 | 19 | 2.5 | 2 | 900
Prawn biryani | இறால் பிரியாணி | lunch,dinner | main | non_veg | spicy | shellfish,milk | 60 | 1½ cups (300 g) | 470 | 24 | 62 | 14 | 2.5 | 2 | 880
Mushroom biryani | காளான் பிரியாணி | lunch,dinner | main | veg | spicy | milk | 50 | 1½ cups (300 g) | 400 | 9 | 60 | 13 | 4 | 2 | 760
# ── Sambar, kuzhambu, dal, rasam ──
Arachuvitta sambar | அரைத்துவிட்ட சாம்பார் | lunch | side | veg | | | 45 | 1 cup | 140 | 6 | 18 | 5 | 5 | 4 | 600
Murungakkai sambar | முருங்கைக்காய் சாம்பார் | lunch | side | veg | | | 40 | 1 cup | 140 | 6 | 18 | 4.5 | 5.5 | 4 | 600
Kara kuzhambu | காரக் குழம்பு | lunch | side | veg | spicy | | 40 | 1 cup | 160 | 3 | 20 | 8 | 4 | 5 | 700
Puli kuzhambu | புளிக் குழம்பு | lunch | side | veg | spicy | | 40 | 1 cup | 160 | 3 | 20 | 8 | 4 | 5 | 700
Milagu kuzhambu | மிளகு குழம்பு | lunch | side | veg | spicy | | 30 | 1 cup | 120 | 3 | 14 | 6 | 3 | 3 | 650
Poondu kuzhambu | பூண்டுக் குழம்பு | lunch | side | veg | spicy | | 40 | 1 cup | 170 | 3 | 20 | 9 | 4 | 5 | 700
Kathirikai kuzhambu | கத்தரிக்காய் குழம்பு | lunch | side | veg | spicy | | 40 | 1 cup | 160 | 3 | 18 | 9 | 5 | 5 | 680
Paruppu urundai kuzhambu | பருப்பு உருண்டைக் குழம்பு | lunch | side | veg | spicy | | 60 | 1 cup (3 balls) | 260 | 12 | 28 | 11 | 7 | 4 | 720
Paagarkai pitlai | பாகற்காய் பிட்லை | lunch | side | veg | | | 40 | 1 cup | 140 | 6 | 16 | 5.5 | 6 | 3 | 520
Paruppu | பருப்பு | lunch | side | veg | | milk | 25 | 1 cup | 190 | 11 | 28 | 4 | 6 | 1.5 | 360
Tomato pappu | தக்காளி பருப்பு | lunch | side | veg | | | 30 | 1 cup | 180 | 10 | 24 | 5 | 6 | 3 | 480
Thakkali kothsu | தக்காளி கொத்சு | breakfast,dinner | side | veg | | | 25 | ½ cup | 90 | 2 | 12 | 4 | 3 | 6 | 380
Kathirikai kothsu | கத்தரிக்காய் கொத்சு | breakfast,dinner | side | veg | | | 30 | ½ cup | 100 | 2 | 12 | 5 | 4 | 5 | 380
Salna | சால்னா | dinner | side | veg | spicy | | 35 | 1 cup | 180 | 4 | 16 | 11 | 4 | 4 | 740
Kadala curry | கடலைக் கறி | breakfast | side | veg | | | 35 | 1 cup | 220 | 11 | 32 | 6 | 10 | 5 | 420
Veg stew | காய்கறி ஸ்டூ | breakfast,dinner | side | veg | | | 30 | 1 cup | 190 | 3 | 18 | 12 | 4 | 5 | 300
Lemon rasam | எலுமிச்சை ரசம் | lunch | side | veg | | | 15 | 1 cup (200 ml) | 55 | 2 | 9 | 1 | 1 | 2 | 550
Tomato rasam | தக்காளி ரசம் | lunch | side | veg | | | 15 | 1 cup (200 ml) | 60 | 2 | 10 | 1.5 | 1.5 | 4 | 560
Pepper rasam | மிளகு ரசம் | lunch | side | veg | spicy | | 15 | 1 cup (200 ml) | 50 | 2 | 7 | 1.5 | 1 | 1 | 550
Poondu rasam | பூண்டு ரசம் | lunch | side | veg | | | 15 | 1 cup (200 ml) | 55 | 2 | 8 | 1.5 | 1 | 2 | 550
Paruppu rasam | பருப்பு ரசம் | lunch | side | veg | | | 20 | 1 cup (200 ml) | 80 | 4 | 11 | 2 | 2 | 2 | 560
# ── Kerala-style sides ──
Olan | ஓலன் | lunch | side | veg | | | 25 | ¾ cup | 120 | 4 | 14 | 6 | 4 | 3 | 280
Erissery | எரிசேரி | lunch | side | veg | | | 30 | ¾ cup | 180 | 6 | 20 | 9 | 6 | 4 | 320
Pulissery | புளிசேரி | lunch | side | veg | | milk | 30 | 1 cup | 150 | 4 | 12 | 9 | 2 | 4 | 350
Cabbage thoran | முட்டைக்கோஸ் தோரன் | lunch | side | veg | | | 20 | ¾ cup | 110 | 3 | 10 | 7 | 3.5 | 4 | 240
# ── Kootu ──
Chow chow kootu | சௌசௌ கூட்டு | lunch | side | veg | | | 25 | ¾ cup | 130 | 5 | 14 | 6 | 4 | 4 | 280
Avarakkai kootu | அவரைக்காய் கூட்டு | lunch | side | veg | | | 25 | ¾ cup | 130 | 6 | 13 | 6 | 4 | 3 | 280
Poricha kootu | பொரிச்ச கூட்டு | lunch | side | veg | | | 30 | ¾ cup | 140 | 6 | 14 | 7 | 4 | 3 | 280
Peerkangai kootu | பீர்க்கங்காய் கூட்டு | lunch | side | veg | | | 25 | ¾ cup | 120 | 5 | 12 | 6 | 3 | 3 | 280
Pudalangai kootu | புடலங்காய் கூட்டு | lunch | side | veg | | | 25 | ¾ cup | 120 | 5 | 12 | 6 | 3 | 3 | 280
Suraikkai kootu | சுரைக்காய் கூட்டு | lunch | side | veg | | | 25 | ¾ cup | 120 | 5 | 12 | 6 | 3 | 3 | 280
Keerai kootu | கீரை கூட்டு | lunch | side | veg | | | 25 | ¾ cup | 130 | 6 | 13 | 6 | 4 | 2 | 290
# ── Poriyal and fries ──
Beans usili | பீன்ஸ் உசிலி | lunch | side | veg | | | 25 | ¾ cup | 130 | 7 | 12 | 6 | 5 | 3 | 260
Cluster beans poriyal | கொத்தவரங்காய் பொரியல் | lunch | side | veg | | | 20 | ¾ cup | 100 | 4 | 10 | 5 | 4 | 2 | 240
Kovakkai fry | கோவக்காய் வறுவல் | lunch | side | veg | fried | | 25 | ¾ cup | 130 | 2 | 10 | 9 | 4 | 2 | 260
Senaikizhangu fry | சேனைக்கிழங்கு வறுவல் | lunch | side | veg | fried | | 30 | ¾ cup | 160 | 2 | 20 | 8 | 3 | 1 | 260
Chepankizhangu roast | சேப்பங்கிழங்கு வறுவல் | lunch | side | veg | fried | | 30 | ¾ cup | 170 | 2 | 22 | 8.5 | 3 | 0.5 | 260
Kathirikai poriyal | கத்தரிக்காய் பொரியல் | lunch | side | veg | | | 20 | ¾ cup | 110 | 2 | 10 | 7 | 4 | 4 | 240
Vazhaipoo poriyal | வாழைப்பூ பொரியல் | lunch | side | veg | | | 30 | ¾ cup | 120 | 4 | 12 | 6.5 | 5 | 1.5 | 240
Vazhaithandu poriyal | வாழைத்தண்டு பொரியல் | lunch | side | veg | | | 25 | ¾ cup | 90 | 2 | 12 | 4 | 4 | 2 | 240
Vazhakkai podimas | வாழைக்காய் பொடிமாஸ் | lunch | side | veg | | | 25 | ¾ cup | 130 | 2 | 18 | 6 | 3 | 2 | 240
Murungai keerai poriyal | முருங்கைக்கீரை பொரியல் | lunch | side | veg | | | 20 | ¾ cup | 100 | 5 | 9 | 5 | 4 | 1 | 240
Pudalangai poriyal | புடலங்காய் பொரியல் | lunch | side | veg | | | 20 | ¾ cup | 100 | 3 | 9 | 6 | 3 | 2 | 240
Mochai poriyal | மொச்சை பொரியல் | lunch | side | veg | | | 30 | ¾ cup | 150 | 8 | 18 | 5 | 8 | 2 | 260
Gutti vankaya | குட்டி வங்காயா | lunch | side | veg | spicy | peanut,sesame | 45 | 2 stuffed brinjals | 190 | 4 | 14 | 13 | 5 | 4 | 380
Mor milagai | மோர் மிளகாய் | lunch | side | veg | fried | | 10 | 5 chillies | 40 | 1 | 4 | 2.5 | 0.5 | 0.5 | 400
Vadam | வடாம் | lunch | side | veg | fried | | 5 | 3 pieces | 100 | 1 | 14 | 5 | 0.5 | 0.1 | 180
# ── Chutney, thokku, pickle, podi, pachadi ──
Pottukadalai chutney | பொட்டுக்கடலை சட்னி | breakfast,dinner | side | veg | | | 10 | 2 tbsp (30 g) | 55 | 2.5 | 5 | 3 | 1.5 | 1 | 120
Coriander chutney | கொத்தமல்லி சட்னி | breakfast,dinner | side | veg | | | 10 | 2 tbsp (30 g) | 45 | 1.5 | 4 | 2.5 | 1.5 | 1 | 120
Curry leaf chutney | கறிவேப்பிலை சட்னி | breakfast,dinner | side | veg | | | 10 | 2 tbsp (30 g) | 50 | 2 | 5 | 3 | 1.5 | 1 | 120
Ginger chutney | இஞ்சி சட்னி | breakfast,dinner | side | veg | | | 15 | 2 tbsp (30 g) | 55 | 1.5 | 8 | 2 | 1 | 4 | 140
Kara chutney | காரச் சட்னி | breakfast,dinner | side | veg | spicy | | 10 | 2 tbsp (30 g) | 60 | 1 | 6 | 3.5 | 1 | 2 | 140
Brinjal chutney | கத்தரிக்காய் சட்னி | breakfast,dinner | side | veg | | | 15 | 2 tbsp (30 g) | 60 | 1.5 | 6 | 3.5 | 2 | 2 | 130
Tomato thokku | தக்காளி தொக்கு | lunch,dinner | side | veg | spicy | | 20 | 2 tbsp (30 g) | 70 | 1 | 8 | 4 | 1 | 5 | 300
Fish thokku | மீன் தொக்கு | lunch | side | non_veg | spicy | fish | 30 | ½ cup | 190 | 17 | 6 | 11 | 1 | 2 | 520
Garlic pickle | பூண்டு ஊறுகாய் | lunch,dinner | side | veg | spicy | mustard | 5 | 1 tbsp | 40 | 1 | 4 | 2.5 | 0.5 | 0.5 | 450
Gongura pickle | கோங்குரா ஊறுகாய் | lunch,dinner | side | veg | spicy | mustard | 5 | 1 tbsp | 45 | 0.5 | 3 | 3.5 | 1 | 0.5 | 480
Avakaya | ஆவக்காய் ஊறுகாய் | lunch,dinner | side | veg | spicy | mustard | 5 | 1 tbsp | 50 | 0.5 | 3 | 4 | 1 | 0.5 | 500
Narthangai pickle | நார்த்தங்காய் ஊறுகாய் | lunch,dinner | side | veg | spicy | mustard | 5 | 1 tbsp | 35 | 0.3 | 4 | 2 | 0.5 | 0.5 | 450
Milagai podi | மிளகாய்ப் பொடி | breakfast,dinner | side | veg | spicy | sesame | 5 | 1 tbsp | 40 | 1.5 | 4 | 2 | 1.5 | 0.5 | 190
Paruppu podi | பருப்புப் பொடி | lunch | side | veg | | | 5 | 1 tbsp | 40 | 2 | 5 | 1.5 | 1.5 | 0.2 | 150
Karuveppilai podi | கறிவேப்பிலைப் பொடி | lunch | side | veg | spicy | | 5 | 1 tbsp | 35 | 1.5 | 4 | 1.5 | 1.5 | 0.3 | 150
Beetroot pachadi | பீட்ரூட் பச்சடி | lunch | side | veg | | milk | 15 | ½ cup | 70 | 3 | 8 | 3 | 2 | 5 | 180
Pineapple pachadi | அன்னாசி பச்சடி | lunch | side | veg | sweet | milk | 20 | ½ cup | 90 | 2 | 14 | 3 | 1.5 | 11 | 160
Mango pachadi | மாங்காய் பச்சடி | lunch | side | veg | sweet | | 20 | ½ cup | 80 | 0.5 | 18 | 1.5 | 1.5 | 14 | 100
Onion pachadi | வெங்காய பச்சடி | lunch | side | veg | | milk | 10 | ½ cup | 60 | 3 | 6 | 3 | 1 | 4 | 180
# ── Non-veg ──
Nattu kozhi kuzhambu | நாட்டுக்கோழிக் குழம்பு | lunch,dinner | main | non_veg | spicy | | 60 | 1 cup | 310 | 30 | 7 | 18 | 2 | 3 | 620
Pepper chicken | மிளகு சிக்கன் | lunch,dinner | main | non_veg | spicy | | 40 | 1 cup | 290 | 30 | 5 | 16 | 1.5 | 2 | 560
Chicken stew | சிக்கன் ஸ்டூ | breakfast,dinner | main | non_veg | | | 45 | 1 cup | 300 | 24 | 10 | 18 | 2 | 4 | 520
Mutton kuzhambu | மட்டன் குழம்பு | lunch,dinner | main | non_veg | spicy | | 70 | 1 cup | 340 | 28 | 8 | 22 | 2 | 3 | 650
Egg masala | முட்டை மசாலா | lunch,dinner | main | egg | spicy | egg | 25 | 2 eggs with gravy | 260 | 14 | 8 | 19 | 1.5 | 3 | 480
Kerala egg roast | கேரளா முட்டை ரோஸ்ட் | breakfast,dinner | main | egg | spicy | egg | 30 | 2 eggs | 250 | 13 | 9 | 18 | 2 | 4 | 440
Nethili fry | நெத்திலி மீன் வறுவல் | lunch,dinner | side | non_veg | fried | fish | 20 | 1 small plate (80 g) | 220 | 20 | 6 | 13 | 0.5 | 0 | 420
Fish moilee | மீன் மொய்லி | lunch,dinner | main | non_veg | | fish | 35 | 1 cup | 260 | 22 | 6 | 16 | 1 | 3 | 520
Crab masala | நண்டு மசாலா | lunch,dinner | main | non_veg | spicy | shellfish | 45 | 1 cup | 230 | 24 | 6 | 12 | 1.5 | 2 | 700
"""

FIELDS = ('name', 'name_ta', 'meals', 'course', 'diet', 'tags', 'allergens', 'prep', 'serving', 'kcal', 'protein', 'carbs', 'fat', 'fibre', 'sugar', 'sodium')


def rows():
    out = []
    for line in TEXT.strip().splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        parts = [p.strip() for p in line.split('|')]
        assert len(parts) == len(FIELDS), (len(parts), line)
        d = dict(zip(FIELDS, parts))
        d['prep'] = int(d['prep'])
        for k in ('kcal', 'protein', 'carbs', 'fat', 'fibre', 'sugar', 'sodium'):
            d[k] = float(d[k])
        out.append(d)
    return out
