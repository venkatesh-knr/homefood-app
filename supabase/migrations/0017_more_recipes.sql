-- HomeFood · 0017: standard recipes (English + Tamil) for 100 earlier dishes (0005 / 0009) that had none
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Same shape as the recipes in 0011: quantities are for `servings` people and the app scales them. They are drafts
-- (written by Claude): the family should check ingredients and seasoning before relying on them.
-- Safe to run twice: a dish that already has a standard recipe is skipped.

with src as (
  select * from jsonb_to_recordset($json$
[
{
"dish": "Idiyappam with stew",
"servings": 4,
"prep": 30,
"cook": 30,
"note": "Make the stew first; idiyappam is best eaten hot.",
"note_ta": "முதலில் ஸ்டூ செய்யவும்; இடியாப்பம் சூடாகச் சாப்பிடுவது சிறந்தது.",
"ingredients": [
{
"n": "Idiyappam",
"t": "இடியாப்பம்",
"q": 12.0,
"u": "piece"
},
{
"n": "Mixed vegetables (potato, carrot, beans, peas)",
"t": "கலவை காய்கறிகள்",
"q": 2.0,
"u": "cup"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli and ginger",
"t": "பச்சை மிளகாய், இஞ்சி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Whole spices (cinnamon, clove, cardamom)",
"t": "பட்டை, கிராம்பு, ஏலக்காய்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Thick coconut milk",
"t": "கெட்டியான தேங்காய்ப் பால்",
"q": 1.0,
"u": "cup"
},
{
"n": "Coconut oil",
"t": "தேங்காய் எண்ணெய்",
"q": 2.0,
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
"e": "Sauté the whole spices, onion, chilli and ginger in coconut oil without browning.",
"t": "தேங்காய் எண்ணெயில் மசாலாக்கள், வெங்காயம், மிளகாய், இஞ்சியை நிறம் மாறாமல் வதக்கவும்."
},
{
"e": "Add the vegetables, salt and 1 cup of water and cook until tender.",
"t": "காய்கறிகள், உப்பு, 1 கப் தண்ணீர் சேர்த்து வேகவிடவும்."
},
{
"e": "Stir in the coconut milk and warm without boiling.",
"t": "தேங்காய்ப் பாலை ஊற்றி கொதிக்க விடாமல் சூடாக்கவும்."
},
{
"e": "Serve over hot idiyappam.",
"t": "சூடான இடியாப்பத்துடன் பரிமாறவும்."
}
]
},
{
"dish": "Samosa",
"servings": 4,
"prep": 40,
"cook": 20,
"note": "Fry on medium-low heat so the pastry cooks through and turns crisp.",
"note_ta": "நடுத்தரக் குறைந்த தீயில் பொரித்தால் மாவு உள்ளே வெந்து மொறுமொறுப்பாகும்.",
"ingredients": [
{
"n": "Maida (refined flour)",
"t": "மைதா",
"q": 2.0,
"u": "cup"
},
{
"n": "Oil for the dough",
"t": "எண்ணெய்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Potatoes, boiled and mashed",
"t": "உருளைக்கிழங்கு",
"q": 3.0,
"u": "piece"
},
{
"n": "Green peas",
"t": "பச்சைப் பட்டாணி",
"q": 0.5,
"u": "cup"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ginger and green chilli, chopped",
"t": "இஞ்சி, பச்சை மிளகாய்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Garam masala and coriander powder",
"t": "கரம் மசாலா, மல்லித் தூள்",
"q": 2.0,
"u": "tsp"
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
"e": "Knead the maida with oil, salt and water into a stiff dough; rest for 30 minutes.",
"t": "மைதாவை எண்ணெய், உப்பு, தண்ணீருடன் கெட்டியாகப் பிசைந்து 30 நிமிடம் ஊறவிடவும்."
},
{
"e": "Fry the cumin, ginger and chilli, add the potato, peas, spices and salt and mix for the filling; cool.",
"t": "சீரகம், இஞ்சி, மிளகாய் வறுத்து உருளைக்கிழங்கு, பட்டாணி, மசாலா, உப்பு சேர்த்துக் கலந்து பூரணம் தயாரித்து ஆறவிடவும்."
},
{
"e": "Roll the dough into ovals, cut in half, shape each into a cone, fill and seal the edge with water.",
"t": "மாவை நீள்வட்டமாகத் தேய்த்து இரண்டாக வெட்டி கூம்பாக மடித்து பூரணம் நிரப்பி ஓரத்தை தண்ணீரால் ஒட்டவும்."
},
{
"e": "Fry in medium-hot oil until golden and crisp.",
"t": "நடுத்தரச் சூட்டு எண்ணெயில் பொன்னிறமாக மொறுமொறுப்பாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Aloo tikki",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Chill the shaped tikkis for 10 minutes so they hold together.",
"note_ta": "வடிவமைத்த டிக்கியை 10 நிமிடம் குளிரவைத்தால் உடையாது.",
"ingredients": [
{
"n": "Potatoes, boiled and mashed",
"t": "உருளைக்கிழங்கு",
"q": 4.0,
"u": "piece"
},
{
"n": "Bread crumbs or rice flour",
"t": "ரொட்டித் தூள்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Green chilli and ginger, chopped",
"t": "பச்சை மிளகாய், இஞ்சி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Cumin powder and chaat masala",
"t": "சீரகத் தூள், சாட் மசாலா",
"q": 1.0,
"u": "tsp"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 2.0,
"u": "tbsp"
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
"q": 4.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Mix the potato with the crumbs, chilli, ginger, spices, coriander and salt.",
"t": "உருளைக்கிழங்கை ரொட்டித் தூள், மிளகாய், இஞ்சி, மசாலாக்கள், கொத்தமல்லி, உப்புடன் கலக்கவும்."
},
{
"e": "Shape into flat round patties and chill briefly.",
"t": "தட்டையான வட்டங்களாக வடிவமைத்து சிறிது குளிரவைக்கவும்."
},
{
"e": "Shallow fry in oil until golden and crisp on both sides. Serve with chutney.",
"t": "எண்ணெயில் இருபுறமும் பொன்னிறமாக மொறுமொறுப்பாக வறுத்து சட்னியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Margherita pizza",
"servings": 4,
"prep": 90,
"cook": 15,
"note": "Let the dough rest for at least an hour; use the hottest oven you have.",
"note_ta": "மாவை குறைந்தது 1 மணி நேரம் ஊறவிடவும்; அடுப்பை அதிகபட்சச் சூட்டில் வைக்கவும்.",
"ingredients": [
{
"n": "Maida or bread flour",
"t": "மைதா",
"q": 3.0,
"u": "cup"
},
{
"n": "Instant yeast",
"t": "ஈஸ்ட்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Olive oil",
"t": "ஆலிவ் எண்ணெய்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Tomato sauce",
"t": "தக்காளி சாஸ்",
"q": 1.0,
"u": "cup"
},
{
"n": "Mozzarella cheese, grated",
"t": "மொசரெல்லா சீஸ்",
"q": 200.0,
"u": "g"
},
{
"n": "Basil leaves",
"t": "துளசி இலை",
"q": 1.0,
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
"e": "Mix the flour, yeast, sugar, salt, oil and warm water into a soft dough; knead 8 minutes and rest for 1 hour until doubled.",
"t": "மாவு, ஈஸ்ட், சர்க்கரை, உப்பு, எண்ணெய், வெதுவெதுப்பான தண்ணீர் கலந்து மென்மையாக 8 நிமிடம் பிசைந்து 1 மணி நேரம் இரட்டிப்பாகும் வரை வைக்கவும்."
},
{
"e": "Preheat the oven to 250°C. Divide the dough, roll thin and place on trays.",
"t": "அடுப்பை 250°C க்கு சூடாக்கவும். மாவைப் பிரித்து மெல்லியதாகத் தேய்த்து தட்டுகளில் வைக்கவும்."
},
{
"e": "Spread the sauce, top with cheese and bake for 10 to 12 minutes until the crust is golden.",
"t": "சாஸ் தடவி சீஸ் தூவி 10 முதல் 12 நிமிடம் ஓரங்கள் பொன்னிறமாகும் வரை சுடவும்."
},
{
"e": "Scatter basil leaves and serve hot.",
"t": "துளசி இலைகள் தூவிச் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Roast chicken",
"servings": 4,
"prep": 20,
"cook": 75,
"note": "Rest the chicken for 10 minutes before carving to keep it juicy.",
"note_ta": "வெட்டும் முன் கோழியை 10 நிமிடம் ஊறவிட்டால் ஜூஸியாக இருக்கும்.",
"ingredients": [
{
"n": "Whole chicken",
"t": "முழுக் கோழி",
"q": 1.4,
"u": "kg"
},
{
"n": "Butter or olive oil",
"t": "வெண்ணெய்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 6.0,
"u": "clove"
},
{
"n": "Lemon",
"t": "எலுமிச்சை",
"q": 1.0,
"u": "piece"
},
{
"n": "Mixed herbs (thyme, rosemary)",
"t": "மூலிகைகள்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Pepper",
"t": "மிளகு",
"q": 1.0,
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
"e": "Pat the chicken dry and rub it with the butter, herbs, pepper and salt, inside and out.",
"t": "கோழியைத் துடைத்து வெண்ணெய், மூலிகை, மிளகு, உப்பை உள்ளும் புறமும் தடவவும்."
},
{
"e": "Stuff the cavity with the lemon halves and garlic.",
"t": "உள்ளே எலுமிச்சை, பூண்டு வைக்கவும்."
},
{
"e": "Roast at 200°C for about 1 hour 15 minutes until the juices run clear.",
"t": "200°C இல் சுமார் 1 மணி 15 நிமிடம் சாறு தெளிவாக வரும் வரை சுடவும்."
},
{
"e": "Rest for 10 minutes, carve and serve.",
"t": "10 நிமிடம் ஊறவிட்டு வெட்டிப் பரிமாறவும்."
}
]
},
{
"dish": "French fries",
"servings": 3,
"prep": 15,
"cook": 25,
"note": "Soak the cut potatoes in cold water for 30 minutes for crispier fries.",
"note_ta": "வெட்டிய உருளைக்கிழங்கை 30 நிமிடம் குளிர்ந்த நீரில் ஊறவைத்தால் மொறுமொறுப்பாக இருக்கும்.",
"ingredients": [
{
"n": "Potatoes",
"t": "உருளைக்கிழங்கு",
"q": 4.0,
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
"e": "Peel and cut the potatoes into sticks; soak in cold water, then dry well.",
"t": "உருளைக்கிழங்கை தோல் நீக்கி குச்சிகளாக வெட்டி குளிர்ந்த நீரில் ஊறவைத்து நன்கு துடைக்கவும்."
},
{
"e": "Fry in medium-hot oil for 5 minutes until soft but pale; drain.",
"t": "நடுத்தரச் சூட்டு எண்ணெயில் 5 நிமிடம் நிறம் மாறாமல் மென்மையாகப் பொரித்து வடிக்கவும்."
},
{
"e": "Fry again in hot oil until golden and crisp; toss with salt.",
"t": "மீண்டும் சூடான எண்ணெயில் பொன்னிறமாக மொறுமொறுப்பாகப் பொரித்து உப்பு தூவிப் புரட்டவும்."
}
]
},
{
"dish": "Katsu curry",
"servings": 4,
"prep": 30,
"cook": 40,
"note": "Use Japanese curry roux blocks, or make your own with curry powder and flour.",
"note_ta": "ஜப்பானிய கறி ரூ பயன்படுத்தவும் அல்லது கறிப் பொடி, மாவுடன் தயாரிக்கவும்.",
"ingredients": [
{
"n": "Chicken breast cutlets",
"t": "கோழி மார்பு",
"q": 4.0,
"u": "piece"
},
{
"n": "Panko bread crumbs",
"t": "ரொட்டித் தூள்",
"q": 1.5,
"u": "cup"
},
{
"n": "Egg",
"t": "முட்டை",
"q": 1.0,
"u": "piece"
},
{
"n": "Flour",
"t": "மைதா",
"q": 0.5,
"u": "cup"
},
{
"n": "Onion, carrot and potato",
"t": "வெங்காயம், கேரட், உருளைக்கிழங்கு",
"q": 3.0,
"u": "cup"
},
{
"n": "Japanese curry roux",
"t": "கறி ரூ",
"q": 100.0,
"u": "g"
},
{
"n": "Cooked rice",
"t": "சாதம்",
"q": 4.0,
"u": "cup"
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
"e": "Simmer the vegetables in 3 cups of water until tender, then stir in the curry roux until thick.",
"t": "காய்கறிகளை 3 கப் தண்ணீரில் வேகவைத்து கறி ரூவைக் கலந்து கெட்டியாக்கவும்."
},
{
"e": "Coat the chicken in flour, egg and bread crumbs.",
"t": "கோழியை மாவு, முட்டை, ரொட்டித் தூளில் பூசவும்."
},
{
"e": "Fry until golden and cooked through, then slice.",
"t": "பொன்னிறமாக உள்ளே வேகும் வரை பொரித்து நறுக்கவும்."
},
{
"e": "Serve the cutlet over rice with the curry.",
"t": "சாதத்தின் மேல் கட்லெட், கறியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Vegetable tempura",
"servings": 4,
"prep": 20,
"cook": 15,
"note": "Keep the batter ice cold and do not overmix; lumps are fine.",
"note_ta": "மாவை ஐஸ் குளிரில் வைத்து அதிகம் கலக்காதீர்கள்; கட்டிகள் இருந்தால் பரவாயில்லை.",
"ingredients": [
{
"n": "Mixed vegetables (sweet potato, pumpkin, beans, onion)",
"t": "கலவை காய்கறிகள்",
"q": 3.0,
"u": "cup"
},
{
"n": "Flour",
"t": "மைதா",
"q": 1.0,
"u": "cup"
},
{
"n": "Cornflour",
"t": "சோள மாவு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Ice cold sparkling or plain water",
"t": "குளிர்ந்த தண்ணீர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 1.0,
"u": "pinch"
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
"e": "Slice the vegetables thin and dry them.",
"t": "காய்கறிகளை மெல்லியதாக வெட்டி துடைக்கவும்."
},
{
"e": "Lightly mix the flours, salt and ice water into a thin batter.",
"t": "மாவுகள், உப்பு, ஐஸ் தண்ணீரை லேசாகக் கலந்து நீர்த்த மாவாக்கவும்."
},
{
"e": "Dip the vegetables and fry in hot oil until pale golden and crisp. Serve with a dipping sauce.",
"t": "காய்கறிகளை மாவில் முக்கி சூடான எண்ணெயில் வெளிர் பொன்னிறமாக மொறுமொறுப்பாகப் பொரித்து டிப்பிங் சாஸுடன் பரிமாறவும்."
}
]
},
{
"dish": "Onigiri",
"servings": 4,
"prep": 20,
"cook": 0,
"note": "Wet your hands and salt them lightly before shaping.",
"note_ta": "கையை ஈரமாக்கி சிறிது உப்பு தடவி வடிவமைக்கவும்.",
"ingredients": [
{
"n": "Cooked short-grain rice",
"t": "சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Filling (cooked tuna, pickled plum or vegetables)",
"t": "பூரணம்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Nori sheets",
"t": "நோரி தாள்",
"q": 2.0,
"u": "piece"
}
],
"steps": [
{
"e": "Let the rice cool slightly while it is still warm to handle.",
"t": "சாதத்தை கையால் தொடும் அளவு சற்று ஆறவிடவும்."
},
{
"e": "With salted wet hands, take a portion of rice, press a hollow and add the filling.",
"t": "உப்பு தடவிய ஈரக் கையால் சாதத்தை எடுத்து குழி செய்து பூரணம் வைக்கவும்."
},
{
"e": "Shape into a triangle, wrap a strip of nori around it and serve.",
"t": "முக்கோணமாக வடிவமைத்து நோரி துண்டைச் சுற்றிப் பரிமாறவும்."
}
]
},
{
"dish": "Yakisoba",
"servings": 3,
"prep": 15,
"cook": 15,
"note": "Cook on high heat so the noodles fry and do not turn soggy.",
"note_ta": "அதிக தீயில் வதக்கினால் நூடுல்ஸ் குழையாமல் வறுபடும்.",
"ingredients": [
{
"n": "Yakisoba or wheat noodles",
"t": "நூடுல்ஸ்",
"q": 300.0,
"u": "g"
},
{
"n": "Cabbage, shredded",
"t": "முட்டைக்கோஸ்",
"q": 2.0,
"u": "cup"
},
{
"n": "Carrot and capsicum, sliced",
"t": "கேரட், குடைமிளகாய்",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Yakisoba sauce (or soy and tomato sauce)",
"t": "யாகிசோபா சாஸ்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Boil the noodles until just soft, drain and loosen with a little oil.",
"t": "நூடுல்ஸை வெறுமனே வேகவைத்து வடித்து சிறிது எண்ணெய் தடவவும்."
},
{
"e": "Stir-fry the onion and vegetables on high heat for 3 minutes.",
"t": "வெங்காயம், காய்கறிகளை அதிக தீயில் 3 நிமிடம் வதக்கவும்."
},
{
"e": "Add the noodles and sauce and toss for 2 minutes until coated.",
"t": "நூடுல்ஸ், சாஸ் சேர்த்து 2 நிமிடம் புரட்டவும்."
}
]
},
{
"dish": "Pesarattu",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Serve with ginger chutney and upma for the classic MLA pesarattu.",
"note_ta": "இஞ்சி சட்னி, உப்புமாவுடன் பரிமாறினால் MLA பெசரட்டு ஆகும்.",
"ingredients": [
{
"n": "Whole green gram (moong), soaked",
"t": "பாசிப்பயறு",
"q": 1.0,
"u": "cup"
},
{
"n": "Raw rice",
"t": "பச்சரிசி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Ginger",
"t": "இஞ்சி",
"q": 1.0,
"u": "inch"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Onion, finely chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
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
"q": 3.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Soak the moong and rice for 4 hours and grind with the chilli, ginger, cumin and salt to a pouring batter.",
"t": "பாசிப்பயறு, அரிசியை 4 மணி நேரம் ஊறவைத்து மிளகாய், இஞ்சி, சீரகம், உப்புடன் ஊற்றும் பதத்தில் அரைக்கவும்."
},
{
"e": "Pour a ladle on a hot pan and spread thin.",
"t": "சூடான தவாவில் ஒரு கரண்டி ஊற்றி மெல்லியதாகப் பரப்பவும்."
},
{
"e": "Sprinkle onion, drizzle oil and cook until crisp and golden.",
"t": "வெங்காயம் தூவி எண்ணெய் விட்டு மொறுமொறுப்பாக பொன்னிறமாக வேகவிடவும்."
}
]
},
{
"dish": "Uttapam",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Keep the heat low so the uttapam cooks through.",
"note_ta": "குறைந்த தீயில் சமைத்தால் உள்ளே நன்கு வேகும்.",
"ingredients": [
{
"n": "Dosa batter",
"t": "தோசை மாவு",
"q": 3.0,
"u": "cup"
},
{
"n": "Onion, finely chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Tomato, finely chopped",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Pour a thick ladle of batter on a hot greased pan without spreading much.",
"t": "சூடான தவாவில் ஒரு தடிமனான கரண்டி மாவை அதிகம் பரப்பாமல் ஊற்றவும்."
},
{
"e": "Scatter the onion, tomato, chilli and coriander and press lightly.",
"t": "வெங்காயம், தக்காளி, மிளகாய், கொத்தமல்லி தூவி லேசாக அழுத்தவும்."
},
{
"e": "Drizzle oil, cover and cook on low heat, then flip and cook the other side until golden.",
"t": "எண்ணெய் விட்டு மூடி குறைந்த தீயில் வேகவிட்டு திருப்பி மறுபக்கமும் பொன்னிறமாக வேகவிடவும்."
}
]
},
{
"dish": "Masala dosa",
"servings": 4,
"prep": 30,
"cook": 30,
"note": "Spread the dosa thin and crisp, and keep the potato masala moist.",
"note_ta": "தோசையை மெல்லியதாக மொறுமொறுப்பாக ஊற்றி, உருளைக்கிழங்கு மசாலாவை ஈரப்பதத்துடன் வைக்கவும்.",
"ingredients": [
{
"n": "Dosa batter",
"t": "தோசை மாவு",
"q": 3.0,
"u": "cup"
},
{
"n": "Potatoes, boiled and mashed",
"t": "உருளைக்கிழங்கு",
"q": 3.0,
"u": "piece"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chana dal and urad dal",
"t": "கடலைப்பருப்பு, உளுத்தம்பருப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Green chilli, ginger and curry leaves",
"t": "பச்சை மிளகாய், இஞ்சி, கறிவேப்பிலை",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 4.0,
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
"e": "Temper mustard and dals in oil, add chilli, ginger, curry leaves and onion and fry until soft.",
"t": "எண்ணெயில் கடுகு, பருப்புகள் தாளித்து மிளகாய், இஞ்சி, கறிவேப்பிலை, வெங்காயம் சேர்த்து மென்மையாக வதக்கவும்."
},
{
"e": "Add turmeric, salt and the mashed potato with a splash of water and mix for the masala.",
"t": "மஞ்சள், உப்பு, மசித்த உருளைக்கிழங்கு, சிறிது தண்ணீர் சேர்த்துக் கலந்து மசாலா தயாரிக்கவும்."
},
{
"e": "Spread a thin dosa on a hot pan, drizzle oil and cook until crisp.",
"t": "சூடான தவாவில் மெல்லிய தோசை ஊற்றி எண்ணெய் விட்டு மொறுமொறுப்பாக வேகவிடவும்."
},
{
"e": "Put the masala inside, fold and serve with chutney and sambar.",
"t": "மசாலாவை உள்ளே வைத்து மடித்து சட்னி, சாம்பாருடன் பரிமாறவும்."
}
]
},
{
"dish": "Rava dosa",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "The batter is very thin; pour it from a height and do not spread with the ladle.",
"note_ta": "மாவு மிகவும் நீர்த்து இருக்கும்; உயரத்திலிருந்து ஊற்றவும், கரண்டியால் பரப்ப வேண்டாம்.",
"ingredients": [
{
"n": "Rava (semolina)",
"t": "ரவை",
"q": 0.5,
"u": "cup"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 0.5,
"u": "cup"
},
{
"n": "Maida",
"t": "மைதா",
"q": 0.25,
"u": "cup"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.25,
"u": "cup"
},
{
"n": "Onion, green chilli, ginger, cumin",
"t": "வெங்காயம், மிளகாய், இஞ்சி, சீரகம்",
"q": 3.0,
"u": "tbsp"
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
"q": 3.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Mix the rava, rice flour, maida, curd, salt and 3 cups of water to a very thin batter; rest 15 minutes.",
"t": "ரவை, அரிசி மாவு, மைதா, தயிர், உப்பு, 3 கப் தண்ணீர் சேர்த்து மிக நீர்த்த மாவாகக் கலந்து 15 நிமிடம் ஊறவிடவும்."
},
{
"e": "Stir in the onion, chilli, ginger and cumin.",
"t": "வெங்காயம், மிளகாய், இஞ்சி, சீரகம் சேர்த்துக் கலக்கவும்."
},
{
"e": "Pour the batter in a lacy pattern on a very hot pan, drizzle oil and cook until crisp.",
"t": "மிகவும் சூடான தவாவில் வலைபோல ஊற்றி எண்ணெய் விட்டு மொறுமொறுப்பாக வேகவிடவும்."
}
]
},
{
"dish": "Appam",
"servings": 4,
"prep": 30,
"cook": 20,
"note": "Ferment the batter 8 hours; swirl the pan to make the thin lacy edge.",
"note_ta": "மாவை 8 மணி நேரம் புளிக்கவிடவும்; தவாவைச் சுழற்றினால் மெல்லிய ஓரம் வரும்.",
"ingredients": [
{
"n": "Raw rice",
"t": "பச்சரிசி",
"q": 1.5,
"u": "cup"
},
{
"n": "Cooked rice",
"t": "வேகவைத்த சாதம்",
"q": 0.25,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.5,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Yeast or toddy",
"t": "ஈஸ்ட்",
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
"e": "Soak the rice for 4 hours and grind with the cooked rice, coconut, sugar and yeast to a smooth batter.",
"t": "அரிசியை 4 மணி நேரம் ஊறவைத்து சாதம், தேங்காய், சர்க்கரை, ஈஸ்ட்டுடன் நைசாக அரைக்கவும்."
},
{
"e": "Add salt and ferment for 8 hours until frothy.",
"t": "உப்பு சேர்த்து 8 மணி நேரம் நுரைக்கும் வரை புளிக்கவிடவும்."
},
{
"e": "Pour a ladle in a small appam pan, swirl to coat the sides and cover; cook until the centre is fluffy and the edges crisp.",
"t": "சிறிய ஆப்பச் சட்டியில் ஒரு கரண்டி ஊற்றி சுழற்றி மூடி நடுப்பகுதி பஞ்சு போலவும் ஓரங்கள் மொறுமொறுப்பாகவும் வேகவிடவும்."
}
]
},
{
"dish": "Puttu",
"servings": 4,
"prep": 15,
"cook": 10,
"note": "Do not press the layers down; steam must pass through.",
"note_ta": "அடுக்குகளை அழுத்த வேண்டாம்; ஆவி மேலே செல்ல வேண்டும்.",
"ingredients": [
{
"n": "Puttu flour (steamed rice flour)",
"t": "புட்டு மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 1.0,
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
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Sprinkle the water mixed with salt over the flour and rub with your fingers until crumbly.",
"t": "உப்பு கலந்த தண்ணீரை மாவில் தெளித்து விரல்களால் உதிரியாக பிசறவும்."
},
{
"e": "Fill the puttu maker with alternate layers of coconut and the flour.",
"t": "புட்டுக் குழலில் தேங்காய், மாவை மாற்றி மாற்றி அடுக்கவும்."
},
{
"e": "Steam for 8 to 10 minutes. Push out and serve with kadala curry or banana and sugar.",
"t": "8 முதல் 10 நிமிடம் ஆவியில் வேகவிடவும். வெளியே தள்ளி கடலைக் கறி அல்லது வாழைப்பழம், சர்க்கரையுடன் பரிமாறவும்."
}
]
},
{
"dish": "Parotta",
"servings": 4,
"prep": 90,
"cook": 20,
"note": "Resting the oiled dough balls is what makes soft, flaky layers.",
"note_ta": "எண்ணெய் தடவிய மாவை ஊறவிடுவதுதான் மென்மையான அடுக்குகளைத் தரும்.",
"ingredients": [
{
"n": "Maida (refined flour)",
"t": "மைதா",
"q": 3.0,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Milk",
"t": "பால்",
"q": 0.25,
"u": "cup"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 6.0,
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
"e": "Knead the maida with salt, sugar, milk and water into a soft dough; coat with oil and rest 1 hour.",
"t": "மைதாவை உப்பு, சர்க்கரை, பால், தண்ணீருடன் மென்மையாகப் பிசைந்து எண்ணெய் தடவி 1 மணி நேரம் ஊறவிடவும்."
},
{
"e": "Divide into balls, flatten thin, brush with oil, fold into pleats and coil into a round. Rest 20 minutes.",
"t": "உருண்டைகளாக்கி மெல்லியதாகத் தட்டி எண்ணெய் தடவி மடிப்புகளாக மடித்து சுருட்டி வட்டமாக்கி 20 நிமிடம் ஊறவிடவும்."
},
{
"e": "Roll lightly and cook on a hot tawa with oil until golden; clap gently to open the layers.",
"t": "லேசாகத் தேய்த்து சூடான தவாவில் எண்ணெய் விட்டு பொன்னிறமாக வேகவிட்டு மெதுவாகத் தட்டி அடுக்குகளைப் பிரிக்கவும்."
}
]
},
{
"dish": "Kothu parotta",
"servings": 3,
"prep": 15,
"cook": 15,
"note": "Use parottas from the day before; chop them fine with the two spatulas.",
"note_ta": "முதல் நாள் பரோட்டாவைப் பயன்படுத்தி இரண்டு கரண்டிகளால் நன்கு கொத்தவும்.",
"ingredients": [
{
"n": "Parottas, shredded",
"t": "பரோட்டா",
"q": 3.0,
"u": "piece"
},
{
"n": "Eggs",
"t": "முட்டை",
"q": 2.0,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chilli powder and garam masala",
"t": "மிளகாய்த் தூள், கரம் மசாலா",
"q": 1.5,
"u": "tsp"
},
{
"n": "Salna or curry",
"t": "சால்னா",
"q": 1.0,
"u": "cup"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3.0,
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
"e": "Fry the onion and ginger-garlic paste in oil until golden, add the tomato and spices and cook until soft.",
"t": "எண்ணெயில் வெங்காயம், இஞ்சி பூண்டு விழுதைப் பொன்னிறமாக வதக்கி தக்காளி, மசாலாக்கள் சேர்த்து மென்மையாக வதக்கவும்."
},
{
"e": "Push aside, scramble the eggs and mix.",
"t": "ஓரத்தில் தள்ளி முட்டையை உடைத்து வதக்கிக் கலக்கவும்."
},
{
"e": "Add the parotta pieces and salna and chop and toss on high heat for 4 minutes.",
"t": "பரோட்டா துண்டுகள், சால்னா சேர்த்து அதிக தீயில் 4 நிமிடம் கொத்திப் புரட்டவும்."
}
]
},
{
"dish": "Tamarind rice",
"servings": 4,
"prep": 20,
"cook": 25,
"note": "The paste keeps for a week; mix with rice just before serving.",
"note_ta": "விழுது ஒரு வாரம் வரை இருக்கும்; பரிமாறும் முன் சாதத்தில் கலக்கவும்.",
"ingredients": [
{
"n": "Cooked rice, cooled",
"t": "சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Puliyodharai powder or sambar powder",
"t": "புளியோதரைப் பொடி",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chana dal and urad dal",
"t": "கடலைப்பருப்பு, உளுத்தம்பருப்பு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Peanuts",
"t": "வேர்க்கடலை",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Dried red chilli and curry leaves",
"t": "காய்ந்த மிளகாய், கறிவேப்பிலை",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 4.0,
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
"e": "Soak the tamarind and extract thick juice.",
"t": "புளியை ஊறவைத்து கெட்டியான கரைசல் எடுக்கவும்."
},
{
"e": "Temper mustard, dals, peanuts, chilli and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, பருப்புகள், வேர்க்கடலை, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the tamarind juice, salt and powder and cook until thick and the oil separates.",
"t": "புளிக்கரைசல், உப்பு, பொடி சேர்த்து எண்ணெய் பிரிந்து கெட்டியாகும் வரை சமைக்கவும்."
},
{
"e": "Mix with the rice gently.",
"t": "சாதத்தில் மெதுவாகக் கலக்கவும்."
}
]
},
{
"dish": "Coconut rice",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Use freshly grated coconut and do not mash the rice.",
"note_ta": "புதிய தேங்காய் துருவலைப் பயன்படுத்தி சாதத்தை குழைக்காமல் கலக்கவும்.",
"ingredients": [
{
"n": "Cooked rice, cooled",
"t": "சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 1.0,
"u": "cup"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chana dal and urad dal",
"t": "கடலைப்பருப்பு, உளுத்தம்பருப்பு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Cashew nuts",
"t": "முந்திரி",
"q": 8.0,
"u": "piece"
},
{
"n": "Dried red chilli and curry leaves",
"t": "காய்ந்த மிளகாய், கறிவேப்பிலை",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Ghee or oil",
"t": "நெய்",
"q": 2.0,
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
"e": "Heat the ghee and temper mustard, dals, cashews, chilli and curry leaves.",
"t": "நெய்யில் கடுகு, பருப்புகள், முந்திரி, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the coconut and fry for 2 minutes.",
"t": "தேங்காய் சேர்த்து 2 நிமிடம் வறுக்கவும்."
},
{
"e": "Fold in the rice and salt gently and serve.",
"t": "சாதம், உப்பைச் சேர்த்து மெதுவாகக் கலந்து பரிமாறவும்."
}
]
},
{
"dish": "Sambar rice",
"servings": 4,
"prep": 15,
"cook": 30,
"note": "Thin with hot water when serving; it thickens as it sits.",
"note_ta": "பரிமாறும்போது சூடான தண்ணீர் சேர்த்து இளக்கவும்; நிற்கும்போது கெட்டியாகும்.",
"ingredients": [
{
"n": "Rice",
"t": "அரிசி",
"q": 1.0,
"u": "cup"
},
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Mixed vegetables",
"t": "கலவை காய்கறிகள்",
"q": 2.0,
"u": "cup"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Sambar powder",
"t": "சாம்பார் பொடி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 2.0,
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
"e": "Pressure cook the rice and dal together with 5 cups of water until very soft.",
"t": "அரிசி, பருப்பை 5 கப் தண்ணீருடன் குக்கரில் மிகவும் குழைய வேகவிடவும்."
},
{
"e": "Boil the vegetables with tamarind water, sambar powder and salt.",
"t": "காய்கறிகளை புளித்தண்ணீர், சாம்பார் பொடி, உப்புடன் வேகவிடவும்."
},
{
"e": "Mash the rice, add the vegetables and simmer 5 minutes; temper with mustard and curry leaves in ghee.",
"t": "சாதத்தை மசித்து காய்கறிகள் சேர்த்து 5 நிமிடம் கொதிக்கவிட்டு நெய்யில் கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Bisi bele bath",
"servings": 4,
"prep": 20,
"cook": 40,
"note": "Serve with boondi, ghee and potato chips.",
"note_ta": "பூந்தி, நெய், உருளைக்கிழங்கு சிப்ஸுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Rice",
"t": "அரிசி",
"q": 1.0,
"u": "cup"
},
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Mixed vegetables",
"t": "கலவை காய்கறிகள்",
"q": 2.0,
"u": "cup"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Bisi bele bath powder",
"t": "பிசிபேளா பாத் பொடி",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Cashew nuts",
"t": "முந்திரி",
"q": 8.0,
"u": "piece"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 3.0,
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
"e": "Pressure cook the rice and dal with 5 cups of water until very soft.",
"t": "அரிசி, பருப்பை 5 கப் தண்ணீருடன் குக்கரில் மிகவும் குழைய வேகவிடவும்."
},
{
"e": "Cook the vegetables with tamarind water, salt and the bisi bele bath powder until tender.",
"t": "காய்கறிகளை புளித்தண்ணீர், உப்பு, பிசிபேளா பாத் பொடியுடன் வேகவிடவும்."
},
{
"e": "Mix with the rice and dal and simmer 8 minutes, adding hot water to a porridge-like consistency.",
"t": "சாதம், பருப்புடன் கலந்து 8 நிமிடம் கொதிக்கவிட்டு சூடான தண்ணீர் சேர்த்து கஞ்சி பதத்தில் வைக்கவும்."
},
{
"e": "Temper mustard, cashews and curry leaves in ghee and pour over.",
"t": "நெய்யில் கடுகு, முந்திரி, கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Chicken biryani",
"servings": 4,
"prep": 40,
"cook": 45,
"note": "Seal the pot and cook on the lowest heat for the final steam (dum).",
"note_ta": "கடைசி ஆவிக்கு பாத்திரத்தை மூடி மிகக் குறைந்த தீயில் வேகவிடவும் (தம்).",
"ingredients": [
{
"n": "Basmati rice",
"t": "பாசுமதி அரிசி",
"q": 2.0,
"u": "cup"
},
{
"n": "Chicken, pieces",
"t": "கோழிக்கறி",
"q": 600.0,
"u": "g"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 3.0,
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
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli powder and biryani masala",
"t": "மிளகாய்த் தூள், பிரியாணி மசாலா",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Mint and coriander leaves",
"t": "புதினா, கொத்தமல்லி",
"q": 1.0,
"u": "cup"
},
{
"n": "Ghee and oil",
"t": "நெய், எண்ணெய்",
"q": 5.0,
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
"e": "Marinate the chicken with curd, paste, chilli powder, half the masala and salt for 30 minutes.",
"t": "கோழியை தயிர், விழுது, மிளகாய்த் தூள், பாதி மசாலா, உப்புடன் 30 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Fry the onions golden in ghee and oil; set half aside and cook the chicken with the rest and the herbs.",
"t": "நெய், எண்ணெயில் வெங்காயத்தைப் பொன்னிறமாக வதக்கி பாதியை எடுத்து வைத்து மீதியுடன் இலைகளுடன் கோழியை வேகவிடவும்."
},
{
"e": "Boil the soaked rice until 70 percent cooked and layer it over the chicken with the fried onion.",
"t": "ஊறவைத்த அரிசியை 70 சதவீதம் வேகவைத்து கோழியின் மேல் வெங்காயத்துடன் அடுக்கவும்."
},
{
"e": "Seal and cook on the lowest heat for 20 minutes. Rest 10 minutes and serve with raita.",
"t": "மூடி மிகக் குறைந்த தீயில் 20 நிமிடம் வேகவிட்டு 10 நிமிடம் ஊறவிட்டு ரைத்தாவுடன் பரிமாறவும்."
}
]
},
{
"dish": "Mutton biryani",
"servings": 4,
"prep": 40,
"cook": 75,
"note": "Cook the mutton until 80 percent tender before layering.",
"note_ta": "அடுக்குவதற்கு முன் மட்டனை 80 சதவீதம் வேகவிடவும்.",
"ingredients": [
{
"n": "Basmati rice",
"t": "பாசுமதி அரிசி",
"q": 2.0,
"u": "cup"
},
{
"n": "Mutton, pieces",
"t": "மட்டன்",
"q": 700.0,
"u": "g"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 3.0,
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
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli powder and biryani masala",
"t": "மிளகாய்த் தூள், பிரியாணி மசாலா",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Mint and coriander leaves",
"t": "புதினா, கொத்தமல்லி",
"q": 1.0,
"u": "cup"
},
{
"n": "Ghee and oil",
"t": "நெய், எண்ணெய்",
"q": 5.0,
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
"e": "Marinate the mutton with curd, paste, spices and salt for 1 hour.",
"t": "மட்டனை தயிர், விழுது, மசாலாக்கள், உப்புடன் 1 மணி நேரம் ஊறவைக்கவும்."
},
{
"e": "Fry the onions golden; cook the mutton with half of them, the herbs and a little water until 80 percent tender.",
"t": "வெங்காயத்தைப் பொன்னிறமாக வதக்கி பாதியுடன் இலைகள், சிறிது தண்ணீருடன் மட்டனை 80 சதவீதம் வேகவிடவும்."
},
{
"e": "Parboil the soaked rice and layer over the mutton with the remaining onion and ghee.",
"t": "ஊறவைத்த அரிசியை பாதி வேகவைத்து மட்டனின் மேல் மீதமுள்ள வெங்காயம், நெய்யுடன் அடுக்கவும்."
},
{
"e": "Seal and cook on the lowest heat for 25 minutes; rest 10 minutes.",
"t": "மூடி மிகக் குறைந்த தீயில் 25 நிமிடம் வேகவிட்டு 10 நிமிடம் ஊறவிடவும்."
}
]
},
{
"dish": "Egg biryani",
"servings": 4,
"prep": 30,
"cook": 35,
"note": "Fry the boiled eggs lightly with chilli and turmeric before adding.",
"note_ta": "வேகவைத்த முட்டையை மிளகாய், மஞ்சளுடன் லேசாக வறுத்துச் சேர்க்கவும்.",
"ingredients": [
{
"n": "Basmati rice",
"t": "பாசுமதி அரிசி",
"q": 2.0,
"u": "cup"
},
{
"n": "Eggs, boiled",
"t": "முட்டை",
"q": 6.0,
"u": "piece"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 3.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 2.0,
"u": "piece"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.25,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli powder and biryani masala",
"t": "மிளகாய்த் தூள், பிரியாணி மசாலா",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Mint and coriander leaves",
"t": "புதினா, கொத்தமல்லி",
"q": 1.0,
"u": "cup"
},
{
"n": "Ghee and oil",
"t": "நெய், எண்ணெய்",
"q": 4.0,
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
"e": "Fry the onions golden, add the paste, tomato, curd, spices and herbs and cook to a thick masala.",
"t": "வெங்காயத்தைப் பொன்னிறமாக வதக்கி விழுது, தக்காளி, தயிர், மசாலாக்கள், இலைகள் சேர்த்து கெட்டியான மசாலாவாக்கவும்."
},
{
"e": "Lightly fry the eggs with a pinch of chilli powder and turmeric and add to the masala.",
"t": "முட்டைகளை சிறிது மிளகாய்த் தூள், மஞ்சளுடன் லேசாக வறுத்து மசாலாவில் சேர்க்கவும்."
},
{
"e": "Add the rice and water (1:1.5), cook covered on low heat for 18 minutes and rest.",
"t": "அரிசி, தண்ணீர் (1:1.5) சேர்த்து மூடி குறைந்த தீயில் 18 நிமிடம் வேகவிட்டு ஊறவிடவும்."
}
]
},
{
"dish": "Chicken chettinad",
"servings": 4,
"prep": 25,
"cook": 35,
"note": "Dry roast the spices fresh for the authentic Chettinad aroma.",
"note_ta": "உண்மையான செட்டிநாடு மணத்திற்கு மசாலாக்களை புதிதாக வறுத்து அரைக்கவும்.",
"ingredients": [
{
"n": "Chicken, pieces",
"t": "கோழிக்கறி",
"q": 600.0,
"u": "g"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 2.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Coriander seeds",
"t": "மல்லி விதை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Fennel, cumin and pepper",
"t": "சோம்பு, சீரகம், மிளகு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 6.0,
"u": "piece"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 2.0,
"u": "sprig"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 4.0,
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
"e": "Dry roast the coriander, fennel, cumin, pepper, chillies and coconut and grind to a powder.",
"t": "மல்லி, சோம்பு, சீரகம், மிளகு, மிளகாய், தேங்காயை வறுத்துப் பொடிக்கவும்."
},
{
"e": "Fry the onion, ginger-garlic paste and curry leaves in oil, add the tomato and cook until soft.",
"t": "எண்ணெயில் வெங்காயம், விழுது, கறிவேப்பிலை வதக்கி தக்காளி சேர்த்து மென்மையாக வேகவிடவும்."
},
{
"e": "Add the chicken and salt, then the ground masala with 1 cup of water; cook covered until the chicken is tender and the gravy thick.",
"t": "கோழி, உப்பு, அரைத்த மசாலா, 1 கப் தண்ணீர் சேர்த்து கோழி வெந்து குழம்பு கெட்டியாகும் வரை மூடி வேகவிடவும்."
}
]
},
{
"dish": "Egg curry",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Prick the boiled eggs so they soak up the gravy.",
"note_ta": "வேகவைத்த முட்டையைக் குத்தினால் குழம்பை உறிஞ்சும்.",
"ingredients": [
{
"n": "Eggs, boiled",
"t": "முட்டை",
"q": 6.0,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 2.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chilli, coriander powder and garam masala",
"t": "மிளகாய், மல்லித் தூள், கரம் மசாலா",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Coconut milk or water",
"t": "தேங்காய்ப் பால்",
"q": 1.0,
"u": "cup"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3.0,
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
"e": "Fry the onion and paste until golden, add tomato and spices and cook to a thick masala.",
"t": "வெங்காயம், விழுதைப் பொன்னிறமாக வதக்கி தக்காளி, மசாலாக்கள் சேர்த்து கெட்டியாக வேகவிடவும்."
},
{
"e": "Add the coconut milk and salt and simmer 8 minutes.",
"t": "தேங்காய்ப் பால், உப்பு சேர்த்து 8 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the eggs and simmer for 3 more minutes.",
"t": "முட்டைகளைச் சேர்த்து மேலும் 3 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Vatha kuzhambu",
"servings": 4,
"prep": 10,
"cook": 30,
"note": "Sun-dried vegetables like sundakkai give the real taste.",
"note_ta": "சுண்டைக்காய் போன்ற வற்றல்கள் உண்மையான சுவை தரும்.",
"ingredients": [
{
"n": "Sun-dried berries (sundakkai vathal)",
"t": "சுண்டைக்காய் வற்றல்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Shallots",
"t": "சின்ன வெங்காயம்",
"q": 8.0,
"u": "piece"
},
{
"n": "Sambar powder",
"t": "சாம்பார் பொடி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Mustard and fenugreek seeds",
"t": "கடுகு, வெந்தயம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "sprig"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 4.0,
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
"e": "Fry the dried berries in oil until they puff and set aside.",
"t": "வற்றலை எண்ணெயில் பொரித்து எடுக்கவும்."
},
{
"e": "Temper mustard, fenugreek and curry leaves and fry the shallots.",
"t": "கடுகு, வெந்தயம், கறிவேப்பிலை தாளித்து சின்ன வெங்காயம் வதக்கவும்."
},
{
"e": "Add the sambar powder, tamarind juice, salt and jaggery and simmer 15 minutes; add the berries for the last 5.",
"t": "சாம்பார் பொடி, புளிக்கரைசல், உப்பு, வெல்லம் சேர்த்து 15 நிமிடம் கொதிக்கவிட்டு கடைசி 5 நிமிடம் வற்றலைச் சேர்க்கவும்."
}
]
},
{
"dish": "Mor kuzhambu",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Never boil after adding the curd; keep the heat very low.",
"note_ta": "தயிர் சேர்த்த பின் கொதிக்க விடாதீர்கள்; மிகக் குறைந்த தீயில் வைக்கவும்.",
"ingredients": [
{
"n": "Sour curd",
"t": "புளித்த தயிர்",
"q": 1.5,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ash gourd or okra, cubed",
"t": "வெள்ளைப் பூசணி",
"q": 1.5,
"u": "cup"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Mustard, fenugreek seeds and curry leaves",
"t": "கடுகு, வெந்தயம், கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
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
"e": "Cook the vegetable with turmeric and salt until tender.",
"t": "காயை மஞ்சள், உப்புடன் வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin to a paste and whisk with the curd.",
"t": "தேங்காய், மிளகாய், சீரகத்தை விழுதாக அரைத்து தயிருடன் அடிக்கவும்."
},
{
"e": "Add to the vegetable on low heat and warm gently; temper with mustard, fenugreek and curry leaves.",
"t": "காயில் சேர்த்து குறைந்த தீயில் மெதுவாகச் சூடாக்கி கடுகு, வெந்தயம், கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Mint chutney",
"servings": 4,
"prep": 10,
"cook": 0,
"note": "Use fresh mint and add a squeeze of lemon to keep the colour green.",
"note_ta": "புதிய புதினா பயன்படுத்தி எலுமிச்சை சாறு சேர்த்தால் பச்சை நிறம் மாறாது.",
"ingredients": [
{
"n": "Mint leaves",
"t": "புதினா",
"q": 1.0,
"u": "cup"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 0.5,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Roasted gram",
"t": "பொட்டுக்கடலை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 1.0,
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
"e": "Grind all the ingredients with a little water to a smooth paste.",
"t": "எல்லாவற்றையும் சிறிது தண்ணீருடன் நைசாக அரைக்கவும்."
},
{
"e": "Taste and adjust salt and lemon; serve fresh.",
"t": "உப்பு, எலுமிச்சையை சரிபார்த்து புதிதாகப் பரிமாறவும்."
}
]
},
{
"dish": "Onion chutney",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "Cook the onions until soft and sweet for the best flavour.",
"note_ta": "வெங்காயத்தை மென்மையாக இனிப்பாக வதக்கினால் சுவை சிறப்பாக இருக்கும்.",
"ingredients": [
{
"n": "Onions, chopped",
"t": "வெங்காயம்",
"q": 3.0,
"u": "piece"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 5.0,
"u": "piece"
},
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 3.0,
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
"e": "Fry the dal and chillies in oil, then the onions until soft.",
"t": "எண்ணெயில் பருப்பு, மிளகாய் வறுத்து வெங்காயத்தை மென்மையாக வதக்கவும்."
},
{
"e": "Cool and grind with tamarind and salt to a coarse chutney.",
"t": "ஆறவிட்டு புளி, உப்புடன் கொரகொரப்பாக அரைக்கவும்."
},
{
"e": "Temper mustard in oil and pour over.",
"t": "எண்ணெயில் கடுகு தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Peanut chutney",
"servings": 4,
"prep": 10,
"cook": 5,
"note": "Roast the peanuts well and remove the skins for a smooth chutney.",
"note_ta": "வேர்க்கடலையை நன்கு வறுத்து தோல் நீக்கினால் சட்னி மென்மையாக இருக்கும்.",
"ingredients": [
{
"n": "Roasted peanuts",
"t": "வறுத்த வேர்க்கடலை",
"q": 0.5,
"u": "cup"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 4.0,
"u": "piece"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 2.0,
"u": "clove"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
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
"e": "Grind the peanuts, chilli, garlic, tamarind and salt with water to a thick chutney.",
"t": "வேர்க்கடலை, மிளகாய், பூண்டு, புளி, உப்பை தண்ணீருடன் கெட்டியாக அரைக்கவும்."
},
{
"e": "Temper mustard and curry leaves in oil and pour over.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Idli podi",
"servings": 20,
"prep": 10,
"cook": 10,
"note": "Mix 1 tablespoon with sesame oil and serve with idli and dosa.",
"note_ta": "1 மேசைக்கரண்டி பொடியை நல்லெண்ணெயுடன் கலந்து இட்லி, தோசையுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 12.0,
"u": "piece"
},
{
"n": "White sesame seeds",
"t": "வெள்ளை எள்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Asafoetida",
"t": "பெருங்காயம்",
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
"e": "Dry roast the dals, chillies and sesame separately until fragrant.",
"t": "பருப்புகள், மிளகாய், எள்ளை தனித்தனியாக மணம் வரும் வரை வறுக்கவும்."
},
{
"e": "Cool and grind with the asafoetida and salt to a coarse powder.",
"t": "ஆறவிட்டு பெருங்காயம், உப்புடன் கொரகொரப்பாகப் பொடிக்கவும்."
}
]
},
{
"dish": "Veg kurma",
"servings": 4,
"prep": 20,
"cook": 25,
"note": "Serve with parotta, chapati or idiyappam.",
"note_ta": "பரோட்டா, சப்பாத்தி அல்லது இடியாப்பத்துடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Mixed vegetables (potato, carrot, beans, peas)",
"t": "கலவை காய்கறிகள்",
"q": 2.0,
"u": "cup"
},
{
"n": "Onion and tomato",
"t": "வெங்காயம், தக்காளி",
"q": 2.0,
"u": "piece"
},
{
"n": "Coconut, fennel, cashew and green chilli paste",
"t": "தேங்காய் விழுது",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tsp"
},
{
"n": "Kurma or coriander and chilli powder",
"t": "குருமா பொடி",
"q": 2.0,
"u": "tsp"
},
{
"n": "Whole spices",
"t": "பட்டை, கிராம்பு, ஏலக்காய்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3.0,
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
"e": "Fry the whole spices, onion and ginger-garlic paste until golden, add the tomato and powder.",
"t": "மசாலாக்கள், வெங்காயம், இஞ்சி பூண்டு விழுதைப் பொன்னிறமாக வதக்கி தக்காளி, பொடி சேர்க்கவும்."
},
{
"e": "Add the vegetables, salt and water and cook until tender.",
"t": "காய்கறிகள், உப்பு, தண்ணீர் சேர்த்து வேகவிடவும்."
},
{
"e": "Stir in the coconut paste and simmer 8 minutes.",
"t": "தேங்காய் விழுது சேர்த்து 8 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Carrot poriyal",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "Finely grate or chop the carrot so it cooks fast.",
"note_ta": "கேரட்டை நைசாகத் துருவினால் சீக்கிரம் வேகும்.",
"ingredients": [
{
"n": "Carrot, finely chopped",
"t": "கேரட்",
"q": 3.0,
"u": "piece"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Mustard seeds and urad dal",
"t": "கடுகு, உளுத்தம்பருப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
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
"e": "Temper mustard, urad dal, chilli and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, உளுத்தம்பருப்பு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the carrot and salt, sprinkle water, cover and cook 5 minutes.",
"t": "கேரட், உப்பு சேர்த்து தண்ணீர் தெளித்து மூடி 5 நிமிடம் வேகவிடவும்."
},
{
"e": "Stir in the coconut and cook a minute.",
"t": "தேங்காய் சேர்த்து ஒரு நிமிடம் வதக்கவும்."
}
]
},
{
"dish": "Beetroot poriyal",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "Beetroot cooks quickly; do not overcook or it turns soft and wet.",
"note_ta": "பீட்ரூட் சீக்கிரம் வேகும்; அதிகம் வேகவிட்டால் குழைந்து நீராகும்.",
"ingredients": [
{
"n": "Beetroot, grated or diced",
"t": "பீட்ரூட்",
"q": 3.0,
"u": "piece"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Mustard seeds and urad dal",
"t": "கடுகு, உளுத்தம்பருப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
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
"e": "Temper mustard, urad dal, chilli and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, உளுத்தம்பருப்பு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the beetroot and salt, cover and cook for 6 minutes.",
"t": "பீட்ரூட், உப்பு சேர்த்து மூடி 6 நிமிடம் வேகவிடவும்."
},
{
"e": "Mix in the coconut and cook 1 minute.",
"t": "தேங்காய் சேர்த்து 1 நிமிடம் வதக்கவும்."
}
]
},
{
"dish": "Potato roast",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Parboil the potatoes first so they brown quickly.",
"note_ta": "உருளைக்கிழங்கை முதலில் பாதி வேகவைத்தால் சீக்கிரம் பொன்னிறமாகும்.",
"ingredients": [
{
"n": "Potatoes, cubed",
"t": "உருளைக்கிழங்கு",
"q": 4.0,
"u": "piece"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1.5,
"u": "tsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 4.0,
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
"e": "Boil the potatoes until just tender and drain.",
"t": "உருளைக்கிழங்கை வெறுமனே வேகவைத்து வடிக்கவும்."
},
{
"e": "Temper mustard and curry leaves in oil; fry the onion until golden.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளித்து வெங்காயத்தைப் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Add the potatoes, powders and salt and roast on medium heat, turning, until crisp.",
"t": "உருளைக்கிழங்கு, தூள்கள், உப்பு சேர்த்து நடுத்தரத் தீயில் திருப்பி மொறுமொறுப்பாக வறுக்கவும்."
}
]
},
{
"dish": "Vendakkai fry",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Dry the okra completely after washing to avoid stickiness.",
"note_ta": "வெண்டைக்காயைக் கழுவிய பின் முழுவதும் துடைத்தால் பிசுபிசுப்பு இருக்காது.",
"ingredients": [
{
"n": "Okra (vendakkai), chopped",
"t": "வெண்டைக்காய்",
"q": 300.0,
"u": "g"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Rice flour or gram flour",
"t": "அரிசி மாவு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3.0,
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
"e": "Wash the okra, dry well and chop into rounds.",
"t": "வெண்டைக்காயைக் கழுவி நன்கு துடைத்து வட்டமாக நறுக்கவும்."
},
{
"e": "Temper mustard in oil, add the okra and cook uncovered on medium heat until the stickiness goes.",
"t": "எண்ணெயில் கடுகு தாளித்து வெண்டைக்காய் சேர்த்து மூடாமல் நடுத்தரத் தீயில் பிசுபிசுப்பு போகும் வரை வதக்கவும்."
},
{
"e": "Add the powders, flour and salt and fry until crisp.",
"t": "தூள்கள், மாவு, உப்பு சேர்த்து மொறுமொறுப்பாக வறுக்கவும்."
}
]
},
{
"dish": "Raw banana fry",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Soak the sliced banana in water with a pinch of turmeric to prevent darkening.",
"note_ta": "நறுக்கிய வாழைக்காயை மஞ்சள் சேர்த்த தண்ணீரில் போட்டால் கருக்காது.",
"ingredients": [
{
"n": "Raw banana (vazhakkai)",
"t": "வாழைக்காய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3.0,
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
"e": "Peel and slice the banana into thin rounds.",
"t": "வாழைக்காயின் தோல் நீக்கி மெல்லிய வட்டங்களாக நறுக்கவும்."
},
{
"e": "Toss with the powders, rice flour and salt.",
"t": "தூள்கள், அரிசி மாவு, உப்புடன் புரட்டவும்."
},
{
"e": "Shallow fry in oil with curry leaves until crisp and golden.",
"t": "கறிவேப்பிலையுடன் எண்ணெயில் மொறுமொறுப்பாக பொன்னிறமாக வறுக்கவும்."
}
]
},
{
"dish": "Keerai masiyal",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Do not cover while cooking so the greens keep their colour.",
"note_ta": "கீரை நிறம் மாறாமல் இருக்க மூடாமல் சமைக்கவும்.",
"ingredients": [
{
"n": "Spinach or any greens, chopped",
"t": "கீரை",
"q": 4.0,
"u": "cup"
},
{
"n": "Moong dal, cooked",
"t": "வேகவைத்த பாசிப்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard seeds and dried red chilli",
"t": "கடுகு, காய்ந்த மிளகாய்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
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
"e": "Cook the greens with chilli and salt uncovered for 5 minutes.",
"t": "கீரையை மிளகாய், உப்புடன் மூடாமல் 5 நிமிடம் வேகவிடவும்."
},
{
"e": "Add the dal and mash coarsely with a masher.",
"t": "பருப்பு சேர்த்து மத்தால் கொரகொரப்பாக மசிக்கவும்."
},
{
"e": "Temper mustard, cumin, garlic and chilli in oil and pour over.",
"t": "எண்ணெயில் கடுகு, சீரகம், பூண்டு, மிளகாய் தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Cabbage kootu",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Serve with rice and sambar or rasam.",
"note_ta": "சாதம், சாம்பார் அல்லது ரசத்துடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Cabbage, chopped",
"t": "முட்டைக்கோஸ்",
"q": 2.0,
"u": "cup"
},
{
"n": "Moong dal",
"t": "பாசிப்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Green chilli and cumin",
"t": "பச்சை மிளகாய், சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
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
"e": "Cook the dal until soft and the cabbage with salt until tender.",
"t": "பருப்பை குழைய வேகவிடவும்; முட்டைக்கோஸை உப்புடன் வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin and mix with the dal and cabbage.",
"t": "தேங்காய், மிளகாய், சீரகத்தை அரைத்து பருப்பு, முட்டைக்கோஸுடன் கலக்கவும்."
},
{
"e": "Simmer 5 minutes and temper with mustard and curry leaves.",
"t": "5 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Pumpkin kootu",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Pumpkin is sweet; add a pinch of pepper for balance.",
"note_ta": "பூசணி இனிப்பாக இருக்கும்; சிறிது மிளகு சேர்த்தால் சமநிலை வரும்.",
"ingredients": [
{
"n": "Yellow pumpkin, cubed",
"t": "பூசணிக்காய்",
"q": 2.0,
"u": "cup"
},
{
"n": "Moong dal",
"t": "பாசிப்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Green chilli and cumin",
"t": "பச்சை மிளகாய், சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
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
"e": "Cook the dal until soft and the pumpkin with salt until tender.",
"t": "பருப்பை குழைய வேகவிடவும்; பூசணியை உப்புடன் வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin; mix with the dal and pumpkin.",
"t": "தேங்காய், மிளகாய், சீரகத்தை அரைத்து பருப்பு, பூசணியுடன் கலக்கவும்."
},
{
"e": "Simmer 5 minutes and temper with mustard and curry leaves.",
"t": "5 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Avial",
"servings": 4,
"prep": 25,
"cook": 20,
"note": "Add the curd at the end and do not boil it.",
"note_ta": "தயிரை கடைசியில் சேர்த்து கொதிக்க விடாதீர்கள்.",
"ingredients": [
{
"n": "Mixed vegetables (yam, raw banana, beans, drumstick, carrot), cut long",
"t": "கலவை காய்கறிகள்",
"q": 3.0,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 1.0,
"u": "cup"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Curd, whisked",
"t": "தயிர்",
"q": 0.5,
"u": "cup"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "sprig"
},
{
"n": "Coconut oil",
"t": "தேங்காய் எண்ணெய்",
"q": 2.0,
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
"e": "Cook the vegetables with turmeric, salt and a little water until just tender.",
"t": "காய்கறிகளை மஞ்சள், உப்பு, சிறிது தண்ணீருடன் வெறுமனே வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin coarsely and stir in; cook 3 minutes.",
"t": "தேங்காய், மிளகாய், சீரகத்தை கொரகொரப்பாக அரைத்துச் சேர்த்து 3 நிமிடம் வேகவிடவும்."
},
{
"e": "Switch off, mix in the curd, curry leaves and coconut oil.",
"t": "அடுப்பை அணைத்து தயிர், கறிவேப்பிலை, தேங்காய் எண்ணெய் கலக்கவும்."
}
]
},
{
"dish": "Cucumber pachadi",
"servings": 4,
"prep": 10,
"cook": 5,
"note": "Serve chilled with biryani or rice.",
"note_ta": "பிரியாணி அல்லது சாதத்துடன் குளிர்ச்சியாகப் பரிமாறவும்.",
"ingredients": [
{
"n": "Cucumber, grated",
"t": "வெள்ளரிக்காய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
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
"e": "Grind the coconut and chilli to a paste.",
"t": "தேங்காய், மிளகாயை விழுதாக அரைக்கவும்."
},
{
"e": "Mix with the whisked curd, cucumber and salt.",
"t": "அடித்த தயிர், வெள்ளரிக்காய், உப்புடன் கலக்கவும்."
},
{
"e": "Temper mustard and curry leaves in oil and pour over.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Appalam",
"servings": 4,
"prep": 2,
"cook": 5,
"note": "Roast on an open flame or fry quickly; do not let it burn.",
"note_ta": "நெருப்பில் சுடவும் அல்லது வேகமாகப் பொரிக்கவும்; கருகாமல் பார்த்துக் கொள்ளவும்.",
"ingredients": [
{
"n": "Appalam (papad)",
"t": "அப்பளம்",
"q": 8.0,
"u": "piece"
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
"e": "Heat the oil until very hot.",
"t": "எண்ணெயை நன்கு சூடாக்கவும்."
},
{
"e": "Slide in an appalam; it puffs in seconds.",
"t": "ஒரு அப்பளத்தைப் போடவும்; சில நொடிகளில் பொங்கிவிடும்."
},
{
"e": "Turn once, drain and serve at once.",
"t": "ஒருமுறை திருப்பி வடித்து உடனே பரிமாறவும்."
}
]
},
{
"dish": "Mango pickle",
"servings": 20,
"prep": 30,
"cook": 10,
"note": "Keep the jar dry and use a dry spoon; the pickle lasts for months.",
"note_ta": "ஜாடியையும் கரண்டியையும் உலர்வாக வைத்தால் பல மாதம் இருக்கும்.",
"ingredients": [
{
"n": "Raw mangoes, cut in pieces",
"t": "மாங்காய்",
"q": 1.0,
"u": "kg"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 0.25,
"u": "cup"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Fenugreek powder",
"t": "வெந்தயப் பொடி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard seeds and asafoetida",
"t": "கடுகு, பெருங்காயம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 0.5,
"u": "cup"
}
],
"steps": [
{
"e": "Mix the mango pieces with salt and turmeric and leave for 1 to 2 days, draining the water.",
"t": "மாங்காய் துண்டுகளை உப்பு, மஞ்சளுடன் கலந்து 1 முதல் 2 நாள் வைத்து தண்ணீரை வடிக்கவும்."
},
{
"e": "Heat the oil, splutter mustard and asafoetida, cool slightly and mix with the chilli and fenugreek powder.",
"t": "எண்ணெயில் கடுகு, பெருங்காயம் தாளித்து சற்று ஆறவிட்டு மிளகாய், வெந்தயப் பொடியுடன் கலக்கவும்."
},
{
"e": "Mix with the mango, pack in a dry jar and mature for 3 days.",
"t": "மாங்காயுடன் கலந்து உலர்ந்த ஜாடியில் அடைத்து 3 நாள் ஊறவிடவும்."
}
]
},
{
"dish": "Lemon pickle",
"servings": 20,
"prep": 30,
"cook": 10,
"note": "Wait 2 to 3 weeks in a sunny spot for the lemons to soften.",
"note_ta": "எலுமிச்சை மென்மையாக 2 முதல் 3 வாரம் வெயிலில் வைக்கவும்.",
"ingredients": [
{
"n": "Lemons, cut in pieces",
"t": "எலுமிச்சை",
"q": 10.0,
"u": "piece"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Fenugreek powder",
"t": "வெந்தயப் பொடி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard seeds and asafoetida",
"t": "கடுகு, பெருங்காயம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 0.25,
"u": "cup"
}
],
"steps": [
{
"e": "Mix the lemon pieces with salt and turmeric in a dry jar and keep in the sun for 1 week, shaking daily.",
"t": "எலுமிச்சை துண்டுகளை உப்பு, மஞ்சளுடன் உலர்ந்த ஜாடியில் கலந்து தினமும் குலுக்கி 1 வாரம் வெயிலில் வைக்கவும்."
},
{
"e": "Temper mustard and asafoetida in hot oil and mix with the chilli and fenugreek powder.",
"t": "சூடான எண்ணெயில் கடுகு, பெருங்காயம் தாளித்து மிளகாய், வெந்தயப் பொடியுடன் கலக்கவும்."
},
{
"e": "Add to the lemons, mix and let it mature for 2 weeks.",
"t": "எலுமிச்சையில் சேர்த்துக் கலந்து 2 வாரம் ஊறவிடவும்."
}
]
},
{
"dish": "Curd",
"servings": 4,
"prep": 5,
"cook": 0,
"note": "In cold weather keep the pot in a warm place or an oven with the light on.",
"note_ta": "குளிர்காலத்தில் பாத்திரத்தை சூடான இடத்தில் அல்லது விளக்கு எரியும் அடுப்பில் வைக்கவும்.",
"ingredients": [
{
"n": "Milk",
"t": "பால்",
"q": 4.0,
"u": "cup"
},
{
"n": "Curd as starter",
"t": "உறை தயிர்",
"q": 1.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Boil the milk and cool until lukewarm (you can dip a finger comfortably).",
"t": "பாலைக் காய்ச்சி வெதுவெதுப்பாக ஆறவிடவும் (விரல் வைக்கும் அளவு)."
},
{
"e": "Stir in the starter curd.",
"t": "உறை தயிரைக் கலக்கவும்."
},
{
"e": "Cover and leave undisturbed in a warm place for 6 to 8 hours until set; refrigerate.",
"t": "மூடி சூடான இடத்தில் 6 முதல் 8 மணி நேரம் அசைக்காமல் வைத்து தயிரானதும் குளிர்சாதனப் பெட்டியில் வைக்கவும்."
}
]
},
{
"dish": "Buttermilk",
"servings": 4,
"prep": 5,
"cook": 0,
"note": "Add a pinch of asafoetida for a lighter taste.",
"note_ta": "சிறிது பெருங்காயம் சேர்த்தால் லேசான சுவை கிடைக்கும்.",
"ingredients": [
{
"n": "Curd",
"t": "தயிர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Cold water",
"t": "குளிர்ந்த தண்ணீர்",
"q": 3.0,
"u": "cup"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Ginger",
"t": "இஞ்சி",
"q": 0.5,
"u": "inch"
},
{
"n": "Curry leaves and coriander leaves",
"t": "கறிவேப்பிலை, கொத்தமல்லி",
"q": 1.0,
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
"e": "Crush the chilli, ginger and leaves lightly.",
"t": "மிளகாய், இஞ்சி, இலைகளை லேசாக இடிக்கவும்."
},
{
"e": "Whisk the curd with the water and salt until smooth.",
"t": "தயிரை தண்ணீர், உப்புடன் நன்கு அடிக்கவும்."
},
{
"e": "Mix in the crushed mix and serve chilled.",
"t": "இடித்தவற்றைக் கலந்து குளிரவைத்துப் பரிமாறவும்."
}
]
},
{
"dish": "Paruppu vadai",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Grind the dal coarsely with almost no water.",
"note_ta": "பருப்பை தண்ணீர் இல்லாமல் கொரகொரப்பாக அரைக்கவும்.",
"ingredients": [
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 1.0,
"u": "cup"
},
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 4.0,
"u": "piece"
},
{
"n": "Fennel seeds",
"t": "சோம்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Curry leaves and coriander",
"t": "கறிவேப்பிலை, கொத்தமல்லி",
"q": 1.0,
"u": "handful"
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
"e": "Soak the dals for 2 hours, drain and grind coarsely with the chillies, fennel and salt.",
"t": "பருப்புகளை 2 மணி நேரம் ஊறவைத்து வடித்து மிளகாய், சோம்பு, உப்புடன் கொரகொரப்பாக அரைக்கவும்."
},
{
"e": "Mix in the onion and leaves and flatten small balls into discs.",
"t": "வெங்காயம், இலைகளைக் கலந்து சிறு உருண்டைகளை தட்டைகளாக்கவும்."
},
{
"e": "Fry in hot oil until crisp and golden.",
"t": "சூடான எண்ணெயில் மொறுமொறுப்பாக பொன்னிறமாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Murukku",
"servings": 6,
"prep": 30,
"cook": 20,
"note": "Use the star-shaped plate of the murukku press.",
"note_ta": "முறுக்கு நாழியில் நட்சத்திர வடிவ தட்டைப் பயன்படுத்தவும்.",
"ingredients": [
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Urad dal flour (roasted)",
"t": "உளுந்து மாவு",
"q": 0.25,
"u": "cup"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Cumin or sesame seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tbsp"
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
"e": "Mix the flours, butter, seeds and salt, then add water to knead a soft dough.",
"t": "மாவுகள், வெண்ணெய், விதைகள், உப்பைக் கலந்து தண்ணீர் சேர்த்து மென்மையாகப் பிசையவும்."
},
{
"e": "Fill the press and press spirals onto a greased sheet.",
"t": "நாழியில் மாவை நிரப்பி எண்ணெய் தடவிய தாளில் சுருளாகப் பிழியவும்."
},
{
"e": "Fry in medium-hot oil until the bubbles subside and golden; drain and cool.",
"t": "நடுத்தரச் சூட்டு எண்ணெயில் குமிழ்கள் அடங்கி பொன்னிறமாகும் வரை பொரித்து வடித்து ஆறவிடவும்."
}
]
},
{
"dish": "Mirchi bajji",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Use large, mild chillies and slit them to remove the seeds.",
"note_ta": "பெரிய, காரம் குறைந்த மிளகாயைப் பயன்படுத்தி விதைகளை நீக்கவும்.",
"ingredients": [
{
"n": "Bajji chillies",
"t": "பஜ்ஜி மிளகாய்",
"q": 8.0,
"u": "piece"
},
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli powder and asafoetida",
"t": "மிளகாய்த் தூள், பெருங்காயம்",
"q": 1.0,
"u": "tsp"
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
"e": "Slit the chillies lengthwise and remove the seeds.",
"t": "மிளகாயை நீளவாக்கில் கீறி விதைகளை நீக்கவும்."
},
{
"e": "Whisk the flours, spices and salt with water into a thick batter.",
"t": "மாவுகள், மசாலா, உப்பை தண்ணீருடன் கெட்டியாகக் கலக்கவும்."
},
{
"e": "Dip the chillies and fry in hot oil until golden.",
"t": "மிளகாயை மாவில் முக்கி சூடான எண்ணெயில் பொன்னிறமாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Kozhukattai",
"servings": 4,
"prep": 30,
"cook": 20,
"note": "Make a smooth, crack-free dough for the shell; the filling should be dry.",
"note_ta": "மேல்மாவு விரிசல் இல்லாமல் இருக்க வேண்டும்; பூரணம் ஈரமில்லாமல் இருக்க வேண்டும்.",
"ingredients": [
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 1.0,
"u": "cup"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 0.5,
"u": "cup"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 1.0,
"u": "tsp"
}
],
"steps": [
{
"e": "Cook the coconut and jaggery together until dry; add cardamom and cool.",
"t": "தேங்காய், வெல்லத்தை சேர்த்து ஈரம் போகும் வரை சமைத்து ஏலக்காய் சேர்த்து ஆறவிடவும்."
},
{
"e": "Boil the water with oil and salt, stir in the rice flour into a dough and knead while warm.",
"t": "தண்ணீரை எண்ணெய், உப்புடன் கொதிக்கவிட்டு அரிசி மாவைக் கிளறி வெதுவெதுப்பாகப் பிசையவும்."
},
{
"e": "Make a small cup of dough, fill it, seal into a shape and steam for 10 minutes.",
"t": "மாவில் சிறிய கிண்ணம் செய்து பூரணம் நிரப்பி மூடி வடிவமைத்து 10 நிமிடம் ஆவியில் வேகவிடவும்."
}
]
},
{
"dish": "Filter coffee",
"servings": 2,
"prep": 5,
"cook": 10,
"note": "Use fresh coffee powder with a little chicory for the classic taste.",
"note_ta": "கிளாசிக் சுவைக்கு புதிய காபித் தூள், சிறிது சிக்கரி சேர்க்கவும்.",
"ingredients": [
{
"n": "Filter coffee powder",
"t": "காபித் தூள்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Boiling water",
"t": "கொதிக்கும் தண்ணீர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Milk",
"t": "பால்",
"q": 1.0,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 2.0,
"u": "tsp"
}
],
"steps": [
{
"e": "Put the powder in the upper chamber of the filter and pour in the boiling water; leave to drip for 10 minutes.",
"t": "காபித் தூளை வடிகட்டியின் மேல் அறையில் இட்டு கொதிக்கும் தண்ணீர் ஊற்றி 10 நிமிடம் சொட்ட விடவும்."
},
{
"e": "Heat the milk and mix with sugar.",
"t": "பாலைக் காய்ச்சி சர்க்கரை கலக்கவும்."
},
{
"e": "Pour a little decoction into the milk, stir and serve frothy by pouring between two tumblers.",
"t": "சிறிது டிகாக்ஷனைப் பாலில் ஊற்றிக் கலந்து இரண்டு டம்ளர்களுக்கு இடையே ஆற்றி நுரையுடன் பரிமாறவும்."
}
]
},
{
"dish": "Egg podimas",
"servings": 3,
"prep": 5,
"cook": 10,
"note": "Cook until just set; it should stay moist.",
"note_ta": "முட்டை வெறுமனே வெந்தால் போதும்; ஈரப்பதம் இருக்க வேண்டும்.",
"ingredients": [
{
"n": "Eggs",
"t": "முட்டை",
"q": 4.0,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Turmeric powder and pepper",
"t": "மஞ்சள் தூள், மிளகுத் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
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
"e": "Temper mustard and curry leaves in oil and fry the onion and chilli until soft.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளித்து வெங்காயம், மிளகாயை மென்மையாக வதக்கவும்."
},
{
"e": "Add the turmeric, then break in the eggs with salt.",
"t": "மஞ்சள் சேர்த்து முட்டையை உடைத்து உப்புடன் சேர்க்கவும்."
},
{
"e": "Scramble until set; sprinkle pepper and serve.",
"t": "முட்டை வேகும் வரை கிளறி மிளகுத் தூள் தூவிப் பரிமாறவும்."
}
]
},
{
"dish": "Omelette",
"servings": 2,
"prep": 5,
"cook": 5,
"note": "Do not overcook; fold when the top is just set.",
"note_ta": "அதிகம் வேகவிடாதீர்கள்; மேல்பகுதி வெறுமனே வெந்ததும் மடிக்கவும்.",
"ingredients": [
{
"n": "Eggs",
"t": "முட்டை",
"q": 3.0,
"u": "piece"
},
{
"n": "Onion, finely chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli and coriander",
"t": "பச்சை மிளகாய், கொத்தமல்லி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Pepper",
"t": "மிளகுத் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Oil or butter",
"t": "எண்ணெய்",
"q": 1.0,
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
"e": "Beat the eggs with the onion, chilli, coriander, pepper and salt.",
"t": "முட்டையை வெங்காயம், மிளகாய், கொத்தமல்லி, மிளகு, உப்புடன் அடிக்கவும்."
},
{
"e": "Pour into a hot greased pan and spread.",
"t": "சூடான எண்ணெய் தடவிய தவாவில் ஊற்றிப் பரப்பவும்."
},
{
"e": "Cook until set underneath, fold and serve.",
"t": "அடிப்பகுதி வெந்ததும் மடித்துப் பரிமாறவும்."
}
]
},
{
"dish": "Boiled egg",
"servings": 2,
"prep": 2,
"cook": 10,
"note": "For firm yolks cook 10 minutes; for soft yolks 6 minutes.",
"note_ta": "கெட்டியான மஞ்சள் கருவுக்கு 10 நிமிடம்; மென்மையானதுக்கு 6 நிமிடம்.",
"ingredients": [
{
"n": "Eggs",
"t": "முட்டை",
"q": 4.0,
"u": "piece"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": null,
"u": "as_needed"
},
{
"n": "Salt and pepper",
"t": "உப்பு, மிளகு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Place the eggs in a pot, cover with cold water and bring to a boil.",
"t": "முட்டைகளை பாத்திரத்தில் வைத்து குளிர்ந்த தண்ணீர் ஊற்றி கொதிக்கவிடவும்."
},
{
"e": "Switch off, cover and leave for 10 minutes for firm yolks.",
"t": "அடுப்பை அணைத்து மூடி 10 நிமிடம் வைக்கவும்."
},
{
"e": "Cool in cold water, peel and sprinkle salt and pepper.",
"t": "குளிர்ந்த நீரில் ஆறவிட்டு தோல் நீக்கி உப்பு, மிளகு தூவவும்."
}
]
},
{
"dish": "Chicken 65",
"servings": 4,
"prep": 30,
"cook": 20,
"note": "Marinate for at least 30 minutes; fry the curry leaves till crisp for the finish.",
"note_ta": "குறைந்தது 30 நிமிடம் ஊறவைக்கவும்; இறுதியில் கறிவேப்பிலையை மொறுமொறுப்பாகப் பொரித்துச் சேர்க்கவும்.",
"ingredients": [
{
"n": "Boneless chicken, small pieces",
"t": "எலும்பில்லாத கோழி",
"q": 500.0,
"u": "g"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Cornflour and rice flour",
"t": "சோள மாவு, அரிசி மாவு",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Egg",
"t": "முட்டை",
"q": 1.0,
"u": "piece"
},
{
"n": "Curry leaves and green chilli",
"t": "கறிவேப்பிலை, பச்சை மிளகாய்",
"q": 1.0,
"u": "handful"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 1.0,
"u": "tsp"
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
"e": "Marinate the chicken with the paste, chilli powder, curd, salt, lemon and egg for 30 minutes.",
"t": "கோழியை விழுது, மிளகாய்த் தூள், தயிர், உப்பு, எலுமிச்சை, முட்டையுடன் 30 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Add the flours and mix well.",
"t": "மாவுகளைச் சேர்த்து நன்கு கலக்கவும்."
},
{
"e": "Fry in hot oil until crisp and cooked through. Fry the curry leaves and chilli and toss them in.",
"t": "சூடான எண்ணெயில் மொறுமொறுப்பாக உள்ளே வேகும் வரை பொரிக்கவும். கறிவேப்பிலை, மிளகாயைப் பொரித்துச் சேர்த்துப் புரட்டவும்."
}
]
},
{
"dish": "Chicken fry",
"servings": 4,
"prep": 30,
"cook": 25,
"note": "Marinate for at least 30 minutes; dry the chicken first so it browns well.",
"note_ta": "குறைந்தது 30 நிமிடம் ஊறவைக்கவும்; கோழியை முதலில் துடைத்தால் நன்கு பொன்னிறமாகும்.",
"ingredients": [
{
"n": "Chicken, pieces",
"t": "கோழிக்கறி",
"q": 600.0,
"u": "g"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Turmeric and pepper powder",
"t": "மஞ்சள், மிளகுத் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 2.0,
"u": "sprig"
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
"q": 5.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Marinate the chicken with the paste, powders, lemon and salt for 30 minutes.",
"t": "கோழியை விழுது, தூள்கள், எலுமிச்சை, உப்புடன் 30 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Heat the oil and fry the chicken on medium heat, turning, until cooked and browned.",
"t": "எண்ணெயில் நடுத்தரத் தீயில் திருப்பி வேகவிட்டு பொன்னிறமாக வறுக்கவும்."
},
{
"e": "Add curry leaves and fry until crisp. Serve hot.",
"t": "கறிவேப்பிலை சேர்த்து மொறுமொறுப்பாக வறுத்துச் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Fish fry",
"servings": 4,
"prep": 20,
"cook": 15,
"note": "Use firm fish such as seer, pomfret or sardine and marinate at least 20 minutes.",
"note_ta": "வஞ்சிரம், வவ்வால், மத்தி போன்ற மீனைப் பயன்படுத்தி குறைந்தது 20 நிமிடம் ஊறவைக்கவும்.",
"ingredients": [
{
"n": "Fish slices",
"t": "மீன் துண்டுகள்",
"q": 500.0,
"u": "g"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Oil for shallow frying",
"t": "எண்ணெய்",
"q": 5.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Clean the fish and mix with the powders, paste, lemon, rice flour and salt. Rest 20 minutes.",
"t": "மீனைச் சுத்தம் செய்து தூள்கள், விழுது, எலுமிச்சை, அரிசி மாவு, உப்புடன் கலந்து 20 நிமிடம் ஊறவிடவும்."
},
{
"e": "Shallow fry in hot oil, 4 minutes on each side, until crisp.",
"t": "சூடான எண்ணெயில் ஒவ்வொரு பக்கமும் 4 நிமிடம் மொறுமொறுப்பாக வறுக்கவும்."
},
{
"e": "Drain and serve with lemon and onion rings.",
"t": "வடித்து எலுமிச்சை, வெங்காய வளையங்களுடன் பரிமாறவும்."
}
]
},
{
"dish": "Prawn masala",
"servings": 4,
"prep": 20,
"cook": 20,
"note": "Do not overcook the prawns; they turn rubbery after 8 minutes.",
"note_ta": "இறாலை அதிகம் வேகவிடாதீர்கள்; 8 நிமிடத்திற்கு மேல் ரப்பர் போல ஆகிவிடும்.",
"ingredients": [
{
"n": "Prawns, cleaned",
"t": "இறால்",
"q": 500.0,
"u": "g"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 2.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chilli and coriander powder",
"t": "மிளகாய், மல்லித் தூள்",
"q": 2.0,
"u": "tbsp"
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
"q": 1.0,
"u": "sprig"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 4.0,
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
"e": "Fry the onion and ginger-garlic paste in oil until golden, add the tomato and powders and cook to a thick masala.",
"t": "எண்ணெயில் வெங்காயம், விழுதைப் பொன்னிறமாக வதக்கி தக்காளி, தூள்கள் சேர்த்து கெட்டியான மசாலாவாக்கவும்."
},
{
"e": "Add the prawns, salt and curry leaves and cook uncovered for 6 to 8 minutes.",
"t": "இறால், உப்பு, கறிவேப்பிலை சேர்த்து மூடாமல் 6 முதல் 8 நிமிடம் வேகவிடவும்."
},
{
"e": "Cook until the gravy thickens and coats the prawns.",
"t": "குழம்பு கெட்டியாகி இறாலில் ஒட்டும் வரை சமைக்கவும்."
}
]
},
{
"dish": "Mutton chukka",
"servings": 4,
"prep": 20,
"cook": 50,
"note": "Pressure cook the mutton first, then dry roast it to a dark, crumbly masala.",
"note_ta": "மட்டனை முதலில் குக்கரில் வேகவைத்து பின் அடர் நிறத்தில் உதிரியாக வறுக்கவும்.",
"ingredients": [
{
"n": "Mutton, small pieces",
"t": "மட்டன்",
"q": 600.0,
"u": "g"
},
{
"n": "Shallots, chopped",
"t": "சின்ன வெங்காயம்",
"q": 12.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chilli and coriander powder",
"t": "மிளகாய், மல்லித் தூள்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Pepper and fennel powder",
"t": "மிளகு, சோம்புப் பொடி",
"q": 2.0,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 2.0,
"u": "sprig"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 5.0,
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
"e": "Pressure cook the mutton with the paste, turmeric, salt and a little water until tender.",
"t": "மட்டனை விழுது, மஞ்சள், உப்பு, சிறிது தண்ணீருடன் குக்கரில் மென்மையாக வேகவைக்கவும்."
},
{
"e": "Fry the shallots and curry leaves in oil until brown, add the powders and cook until the oil separates.",
"t": "எண்ணெயில் சின்ன வெங்காயம், கறிவேப்பிலையை பழுப்பாக வதக்கி தூள்கள் சேர்த்து எண்ணெய் பிரியும் வரை சமைக்கவும்."
},
{
"e": "Add the mutton and roast on medium heat until the masala clings and turns dark.",
"t": "மட்டனைச் சேர்த்து நடுத்தரத் தீயில் மசாலா ஒட்டி அடர் நிறமாகும் வரை வறுக்கவும்."
}
]
},
{
"dish": "Dal makhani",
"servings": 4,
"prep": 15,
"cook": 60,
"note": "Slow cooking is what makes it creamy; soak the dal overnight.",
"note_ta": "மெதுவாகச் சமைத்தால் கிரீமியாக வரும்; பருப்பை இரவு ஊறவைக்கவும்.",
"ingredients": [
{
"n": "Whole black urad dal",
"t": "முழு கருப்பு உளுந்து",
"q": 1.0,
"u": "cup"
},
{
"n": "Rajma (kidney beans)",
"t": "ராஜ்மா",
"q": 0.25,
"u": "cup"
},
{
"n": "Onion, tomato puree",
"t": "தக்காளி கூழ்",
"q": 1.0,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Cream",
"t": "கிரீம்",
"q": 0.25,
"u": "cup"
},
{
"n": "Chilli powder and garam masala",
"t": "மிளகாய்த் தூள், கரம் மசாலா",
"q": 2.0,
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
"e": "Soak the dal and rajma overnight and pressure cook until very soft.",
"t": "உளுந்து, ராஜ்மாவை இரவு ஊறவைத்து மிகவும் குழைய வேகவிடவும்."
},
{
"e": "Cook the ginger-garlic paste and tomato puree in butter until thick, add the powders and salt.",
"t": "வெண்ணெயில் இஞ்சி பூண்டு விழுது, தக்காளி கூழை கெட்டியாக வதக்கி தூள்கள், உப்பு சேர்க்கவும்."
},
{
"e": "Add the dal and simmer on low for 30 minutes, mashing a few beans.",
"t": "பருப்பைச் சேர்த்து குறைந்த தீயில் 30 நிமிடம் கொதிக்கவிட்டு சிலவற்றை மசிக்கவும்."
},
{
"e": "Stir in the cream and a dot of butter and serve with naan.",
"t": "கிரீம், சிறிது வெண்ணெய் சேர்த்து நானுடன் பரிமாறவும்."
}
]
},
{
"dish": "Kadai paneer",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Roast and crush the coriander and chillies fresh for the kadai masala.",
"note_ta": "கடாய் மசாலாவுக்கு மல்லி, மிளகாயைப் புதிதாக வறுத்து இடிக்கவும்.",
"ingredients": [
{
"n": "Paneer, cubed",
"t": "பனீர்",
"q": 250.0,
"u": "g"
},
{
"n": "Capsicum, cubed",
"t": "குடைமிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Onion and tomato, chopped",
"t": "வெங்காயம், தக்காளி",
"q": 3.0,
"u": "piece"
},
{
"n": "Coriander seeds and dried red chilli (crushed)",
"t": "மல்லி, மிளகாய்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
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
"q": 3.0,
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
"e": "Fry the ginger-garlic paste and onion, add the tomato and cook to a thick masala.",
"t": "இஞ்சி பூண்டு விழுது, வெங்காயம் வதக்கி தக்காளி சேர்த்து கெட்டியான மசாலாவாக்கவும்."
},
{
"e": "Add the crushed kadai masala, garam masala and salt.",
"t": "இடித்த கடாய் மசாலா, கரம் மசாலா, உப்பு சேர்க்கவும்."
},
{
"e": "Add the capsicum and paneer and cook for 5 minutes.",
"t": "குடைமிளகாய், பனீர் சேர்த்து 5 நிமிடம் வேகவிடவும்."
}
]
},
{
"dish": "Matar paneer",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Add the paneer at the end so it stays soft.",
"note_ta": "பனீரை கடைசியில் சேர்த்தால் மென்மையாக இருக்கும்.",
"ingredients": [
{
"n": "Paneer, cubed",
"t": "பனீர்",
"q": 250.0,
"u": "g"
},
{
"n": "Green peas",
"t": "பச்சைப் பட்டாணி",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion and tomato puree",
"t": "வெங்காயம், தக்காளி கூழ்",
"q": 1.5,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chilli, coriander powder and garam masala",
"t": "மிளகாய், மல்லித் தூள், கரம் மசாலா",
"q": 2.0,
"u": "tsp"
},
{
"n": "Cream or cashew paste",
"t": "கிரீம்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Oil or butter",
"t": "எண்ணெய்",
"q": 3.0,
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
"e": "Cook the ginger-garlic paste and onion-tomato puree in oil until the oil separates.",
"t": "எண்ணெயில் இஞ்சி பூண்டு விழுது, வெங்காயம் தக்காளி கூழை எண்ணெய் பிரியும் வரை சமைக்கவும்."
},
{
"e": "Add the powders, peas, salt and 1 cup of water and simmer 8 minutes.",
"t": "தூள்கள், பட்டாணி, உப்பு, 1 கப் தண்ணீர் சேர்த்து 8 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the paneer and cream and cook 3 more minutes.",
"t": "பனீர், கிரீம் சேர்த்து மேலும் 3 நிமிடம் வேகவிடவும்."
}
]
},
{
"dish": "Baingan bharta",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Roast the brinjal directly on the flame for the smoky flavour.",
"note_ta": "கத்தரிக்காயை நேரடியாக நெருப்பில் சுட்டால் புகை மணம் கிடைக்கும்.",
"ingredients": [
{
"n": "Large brinjal",
"t": "பெரிய கத்தரிக்காய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 2.0,
"u": "piece"
},
{
"n": "Green chilli, ginger and garlic",
"t": "பச்சை மிளகாய், இஞ்சி, பூண்டு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chilli and coriander powder",
"t": "மிளகாய், மல்லித் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3.0,
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
"e": "Roast the brinjal over a flame until soft; peel and mash.",
"t": "கத்தரிக்காயை நெருப்பில் மென்மையாகச் சுட்டு தோல் உரித்து மசிக்கவும்."
},
{
"e": "Temper cumin, fry the chilli, ginger, garlic and onion until golden, add the tomato and powders.",
"t": "சீரகம் தாளித்து மிளகாய், இஞ்சி, பூண்டு, வெங்காயம் பொன்னிறமாக வதக்கி தக்காளி, தூள்கள் சேர்க்கவும்."
},
{
"e": "Add the mashed brinjal and salt and cook 8 minutes; garnish with coriander.",
"t": "மசித்த கத்தரிக்காய், உப்பு சேர்த்து 8 நிமிடம் வேகவிட்டு கொத்தமல்லி தூவவும்."
}
]
},
{
"dish": "Bhindi masala",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Dry the okra well before cutting and do not cover while cooking.",
"note_ta": "வெண்டைக்காயை நன்கு துடைத்து நறுக்கி மூடாமல் சமைக்கவும்.",
"ingredients": [
{
"n": "Okra (bhindi), cut",
"t": "வெண்டைக்காய்",
"q": 400.0,
"u": "g"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chilli, coriander and turmeric powder",
"t": "மிளகாய், மல்லி, மஞ்சள் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Amchur or lemon juice",
"t": "மாங்காய்த் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 4.0,
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
"e": "Fry the okra in oil until it loses stickiness; set aside.",
"t": "வெண்டைக்காயை எண்ணெயில் பிசுபிசுப்பு போகும் வரை வறுத்து எடுக்கவும்."
},
{
"e": "Temper cumin, fry the onion until golden, add the tomato and powders.",
"t": "சீரகம் தாளித்து வெங்காயத்தைப் பொன்னிறமாக வதக்கி தக்காளி, தூள்கள் சேர்க்கவும்."
},
{
"e": "Add the okra and salt and cook 5 minutes; finish with amchur.",
"t": "வெண்டைக்காய், உப்பு சேர்த்து 5 நிமிடம் வேகவிட்டு மாங்காய்த் தூள் சேர்க்கவும்."
}
]
},
{
"dish": "Mixed vegetable curry",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Cut all the vegetables to a similar size so they cook evenly.",
"note_ta": "காய்கறிகளை ஒரே அளவில் நறுக்கினால் சமமாக வேகும்.",
"ingredients": [
{
"n": "Mixed vegetables (potato, carrot, beans, peas, cauliflower)",
"t": "கலவை காய்கறிகள்",
"q": 3.0,
"u": "cup"
},
{
"n": "Onion and tomato",
"t": "வெங்காயம், தக்காளி",
"q": 3.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chilli, coriander powder and garam masala",
"t": "மிளகாய், மல்லித் தூள், கரம் மசாலா",
"q": 2.0,
"u": "tsp"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3.0,
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
"e": "Temper cumin, fry the onion and paste until golden, add the tomato and powders.",
"t": "சீரகம் தாளித்து வெங்காயம், விழுதைப் பொன்னிறமாக வதக்கி தக்காளி, தூள்கள் சேர்க்கவும்."
},
{
"e": "Add the vegetables, salt and 1 cup of water; cover and cook until tender.",
"t": "காய்கறிகள், உப்பு, 1 கப் தண்ணீர் சேர்த்து மூடி வேகவிடவும்."
},
{
"e": "Finish with garam masala and coriander.",
"t": "கரம் மசாலா, கொத்தமல்லி சேர்த்து இறக்கவும்."
}
]
},
{
"dish": "Pav bhaji",
"servings": 4,
"prep": 20,
"cook": 30,
"note": "Mash the vegetables well and cook with plenty of butter.",
"note_ta": "காய்கறிகளை நன்கு மசித்து அதிக வெண்ணெயுடன் சமைக்கவும்.",
"ingredients": [
{
"n": "Potatoes, cauliflower, peas, carrot",
"t": "காய்கறிகள்",
"q": 3.0,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 3.0,
"u": "piece"
},
{
"n": "Capsicum, chopped",
"t": "குடைமிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Pav bhaji masala",
"t": "பாவ் பாஜி மசாலா",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Pav (bread rolls)",
"t": "பாவ்",
"q": 8.0,
"u": "piece"
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
"e": "Boil the vegetables until soft and mash well.",
"t": "காய்கறிகளை மென்மையாக வேகவைத்து நன்கு மசிக்கவும்."
},
{
"e": "Fry the onion and capsicum in butter, add the tomato and cook until mushy.",
"t": "வெண்ணெயில் வெங்காயம், குடைமிளகாயை வதக்கி தக்காளி சேர்த்து குழைய வேகவிடவும்."
},
{
"e": "Add the masala, salt and mashed vegetables with a little water and cook 10 minutes.",
"t": "மசாலா, உப்பு, மசித்த காய்கறிகள், சிறிது தண்ணீர் சேர்த்து 10 நிமிடம் சமைக்கவும்."
},
{
"e": "Toast the pav in butter and serve with onion and lemon.",
"t": "பாவை வெண்ணெயில் வாட்டி வெங்காயம், எலுமிச்சையுடன் பரிமாறவும்."
}
]
},
{
"dish": "Poori bhaji",
"servings": 4,
"prep": 25,
"cook": 30,
"note": "Roll the pooris just before frying so they puff well.",
"note_ta": "பொரிப்பதற்கு சற்று முன் பூரியைத் தேய்த்தால் நன்கு பொங்கும்.",
"ingredients": [
{
"n": "Wheat flour",
"t": "கோதுமை மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Potatoes, boiled and cubed",
"t": "உருளைக்கிழங்கு",
"q": 4.0,
"u": "piece"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Green chilli and ginger",
"t": "பச்சை மிளகாய், இஞ்சி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
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
"n": "Oil for frying",
"t": "பொரிக்க எண்ணெய்",
"q": null,
"u": "as_needed"
}
],
"steps": [
{
"e": "Knead a stiff dough with the flour, salt and water; rest 20 minutes.",
"t": "மாவு, உப்பு, தண்ணீரால் கெட்டியாகப் பிசைந்து 20 நிமிடம் ஊறவிடவும்."
},
{
"e": "Make the bhaji: temper mustard, fry the chilli, ginger and onion, add turmeric, potatoes, salt and a little water; mash lightly.",
"t": "பாஜி: கடுகு தாளித்து மிளகாய், இஞ்சி, வெங்காயம் வதக்கி மஞ்சள், உருளைக்கிழங்கு, உப்பு, சிறிது தண்ணீர் சேர்த்து லேசாக மசிக்கவும்."
},
{
"e": "Roll small pooris and fry in hot oil until puffed and golden. Serve with the bhaji.",
"t": "சிறிய பூரிகளைத் தேய்த்து சூடான எண்ணெயில் பொங்கி பொன்னிறமாகப் பொரித்து பாஜியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Chole bhature",
"servings": 4,
"prep": 40,
"cook": 40,
"note": "Soak the chickpeas overnight; ferment the bhatura dough 2 hours.",
"note_ta": "கடலையை இரவு ஊறவைக்கவும்; பதுரா மாவை 2 மணி நேரம் புளிக்கவிடவும்.",
"ingredients": [
{
"n": "Chickpeas, soaked",
"t": "கொண்டைக்கடலை",
"q": 1.5,
"u": "cup"
},
{
"n": "Onion and tomato",
"t": "வெங்காயம், தக்காளி",
"q": 4.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chole masala",
"t": "சோலே மசாலா",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Tea bag or tea water",
"t": "தேநீர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Maida",
"t": "மைதா",
"q": 2.0,
"u": "cup"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.25,
"u": "cup"
},
{
"n": "Baking soda",
"t": "சமையல் சோடா",
"q": 0.25,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 4.0,
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
"e": "Pressure cook the chickpeas with salt and tea water until soft.",
"t": "கடலையை உப்பு, தேநீர் நீருடன் குக்கரில் மென்மையாக வேகவிடவும்."
},
{
"e": "Fry the onion and paste, add the tomato and chole masala, then the chickpeas; simmer 15 minutes.",
"t": "வெங்காயம், விழுதை வதக்கி தக்காளி, சோலே மசாலா, கடலை சேர்த்து 15 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Knead the maida with curd, soda, salt and water into a soft dough; rest 2 hours.",
"t": "மைதாவை தயிர், சோடா, உப்பு, தண்ணீருடன் மென்மையாகப் பிசைந்து 2 மணி நேரம் ஊறவிடவும்."
},
{
"e": "Roll ovals and fry in hot oil until puffed; serve with the chole.",
"t": "நீள்வட்டமாகத் தேய்த்து சூடான எண்ணெயில் பொங்கப் பொரித்து சோலேவுடன் பரிமாறவும்."
}
]
},
{
"dish": "Besan chilla",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "The batter should be thin and without lumps.",
"note_ta": "மாவு நீர்த்து கட்டியில்லாமல் இருக்க வேண்டும்.",
"ingredients": [
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion and tomato, chopped",
"t": "வெங்காயம், தக்காளி",
"q": 2.0,
"u": "piece"
},
{
"n": "Green chilli and coriander",
"t": "பச்சை மிளகாய், கொத்தமல்லி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Ajwain or cumin",
"t": "ஓமம்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Turmeric and chilli powder",
"t": "மஞ்சள், மிளகாய்த் தூள்",
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
"q": 3.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Whisk the flour, spices, salt and water into a thin batter and stir in the vegetables.",
"t": "மாவு, மசாலா, உப்பு, தண்ணீரை நீர்த்துக் கலந்து காய்கறிகள் சேர்க்கவும்."
},
{
"e": "Pour a ladle on a hot greased pan and spread.",
"t": "சூடான எண்ணெய் தடவிய தவாவில் ஒரு கரண்டி ஊற்றிப் பரப்பவும்."
},
{
"e": "Cook both sides until golden and serve with chutney.",
"t": "இருபுறமும் பொன்னிறமாக வேகவிட்டு சட்னியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Methi thepla",
"servings": 4,
"prep": 20,
"cook": 20,
"note": "Add a little curd to keep the theplas soft for days.",
"note_ta": "சிறிது தயிர் சேர்த்தால் தெப்லா பல நாள் மென்மையாக இருக்கும்.",
"ingredients": [
{
"n": "Wheat flour",
"t": "கோதுமை மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Fenugreek leaves (methi), chopped",
"t": "வெந்தயக்கீரை",
"q": 1.0,
"u": "cup"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Chilli, turmeric and cumin powder",
"t": "மிளகாய், மஞ்சள், சீரகத் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Sesame seeds",
"t": "எள்",
"q": 1.0,
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
"q": 4.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Mix the flour, methi, curd, spices, sesame, salt and 1 tablespoon of oil; knead a soft dough with water.",
"t": "மாவு, வெந்தயக்கீரை, தயிர், மசாலா, எள், உப்பு, 1 மேசைக்கரண்டி எண்ணெய் சேர்த்து தண்ணீரால் மென்மையாகப் பிசையவும்."
},
{
"e": "Roll thin rounds.",
"t": "மெல்லிய வட்டங்களாகத் தேய்க்கவும்."
},
{
"e": "Cook on a hot tawa with oil on both sides until brown spots appear.",
"t": "சூடான தவாவில் எண்ணெய் விட்டு இருபுறமும் புள்ளிகள் வரும் வரை வேகவிடவும்."
}
]
},
{
"dish": "Dhokla",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Add the fruit salt just before steaming, mixing gently.",
"note_ta": "ஆவியில் வைக்கும் முன் ஈனோவைச் சேர்த்து மெதுவாகக் கலக்கவும்.",
"ingredients": [
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.5,
"u": "cup"
},
{
"n": "Ginger-chilli paste",
"t": "இஞ்சி மிளகாய் விழுது",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Fruit salt (Eno)",
"t": "ஈனோ",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
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
"e": "Whisk the flour, curd, paste, sugar, salt and water into a smooth batter; rest 10 minutes.",
"t": "மாவு, தயிர், விழுது, சர்க்கரை, உப்பு, தண்ணீரை கட்டியின்றி கலந்து 10 நிமிடம் ஊறவிடவும்."
},
{
"e": "Mix in the fruit salt and pour into a greased plate.",
"t": "ஈனோ சேர்த்துக் கலந்து எண்ணெய் தடவிய தட்டில் ஊற்றவும்."
},
{
"e": "Steam for 15 minutes, cut into squares and pour the mustard and curry leaf tempering over.",
"t": "15 நிமிடம் ஆவியில் வேகவைத்து சதுரங்களாக வெட்டி கடுகு, கறிவேப்பிலை தாளிப்பைக் கொட்டவும்."
}
]
},
{
"dish": "Khichdi",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Serve with ghee, curd and pickle.",
"note_ta": "நெய், தயிர், ஊறுகாயுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Rice",
"t": "அரிசி",
"q": 1.0,
"u": "cup"
},
{
"n": "Moong dal",
"t": "பாசிப்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Ginger, grated",
"t": "இஞ்சி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 2.0,
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
"e": "Wash the rice and dal together.",
"t": "அரிசி, பருப்பை சேர்த்துக் கழுவவும்."
},
{
"e": "Temper cumin and ginger in ghee, add the rice, dal, turmeric, salt and 4 cups of water.",
"t": "நெய்யில் சீரகம், இஞ்சி தாளித்து அரிசி, பருப்பு, மஞ்சள், உப்பு, 4 கப் தண்ணீர் சேர்க்கவும்."
},
{
"e": "Pressure cook for 3 whistles until soft and porridge-like.",
"t": "3 விசில் குக்கரில் குழைய வேகவிடவும்."
}
]
},
{
"dish": "Vegetable pulao",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Do not stir after adding the water, to keep the grains separate.",
"note_ta": "தண்ணீர் சேர்த்த பின் கிளறாதீர்கள்; அரிசி உதிரியாக இருக்கும்.",
"ingredients": [
{
"n": "Basmati rice",
"t": "பாசுமதி அரிசி",
"q": 1.5,
"u": "cup"
},
{
"n": "Mixed vegetables (carrot, beans, peas)",
"t": "கலவை காய்கறிகள்",
"q": 1.5,
"u": "cup"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Whole spices (bay leaf, cinnamon, clove, cardamom)",
"t": "பட்டை, கிராம்பு, ஏலக்காய்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ghee and oil",
"t": "நெய்",
"q": 3.0,
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
"e": "Soak the rice for 20 minutes. Fry the whole spices and onion in ghee until golden.",
"t": "அரிசியை 20 நிமிடம் ஊறவைக்கவும். நெய்யில் மசாலாக்கள், வெங்காயத்தைப் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Add the paste and vegetables and fry for 2 minutes.",
"t": "விழுது, காய்கறிகள் சேர்த்து 2 நிமிடம் வதக்கவும்."
},
{
"e": "Add the rice, 3 cups of water and salt; cover and cook on low for 15 minutes.",
"t": "அரிசி, 3 கப் தண்ணீர், உப்பு சேர்த்து மூடி குறைந்த தீயில் 15 நிமிடம் வேகவிடவும்."
}
]
},
{
"dish": "Kadhi pakora",
"servings": 4,
"prep": 25,
"cook": 30,
"note": "Whisk the curd mixture constantly while it heats to prevent curdling.",
"note_ta": "தயிர் கலவை சூடாகும்போது தொடர்ந்து கிளறினால் திரியாது.",
"ingredients": [
{
"n": "Sour curd",
"t": "புளித்த தயிர்",
"q": 1.5,
"u": "cup"
},
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 0.5,
"u": "cup"
},
{
"n": "Mustard and cumin seeds",
"t": "கடுகு, சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli and curry leaves",
"t": "காய்ந்த மிளகாய், கறிவேப்பிலை",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Turmeric and chilli powder",
"t": "மஞ்சள், மிளகாய்த் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Onion pakoras",
"t": "வெங்காய பகோடா",
"q": 12.0,
"u": "piece"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
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
"e": "Whisk the curd, gram flour, turmeric, chilli powder, salt and 3 cups of water until smooth.",
"t": "தயிர், கடலை மாவு, மஞ்சள், மிளகாய்த் தூள், உப்பு, 3 கப் தண்ணீரை கட்டியின்றி அடிக்கவும்."
},
{
"e": "Cook on medium heat, stirring continuously, then simmer on low for 20 minutes until thick.",
"t": "நடுத்தரத் தீயில் தொடர்ந்து கிளறி சமைத்து குறைந்த தீயில் 20 நிமிடம் கெட்டியாகும் வரை கொதிக்கவிடவும்."
},
{
"e": "Make the pakoras (or use ready ones) and add; temper cumin, mustard, chilli and curry leaves in oil and pour over.",
"t": "பகோடாக்களைச் செய்து (அல்லது தயாரானதை) சேர்த்து எண்ணெயில் சீரகம், கடுகு, மிளகாய், கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Egg bhurji",
"servings": 3,
"prep": 5,
"cook": 10,
"note": "Stir gently so the eggs set in soft curds.",
"note_ta": "மெதுவாகக் கிளறினால் முட்டை மென்மையான துகள்களாக வேகும்.",
"ingredients": [
{
"n": "Eggs",
"t": "முட்டை",
"q": 4.0,
"u": "piece"
},
{
"n": "Onion, finely chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli and coriander",
"t": "பச்சை மிளகாய், கொத்தமல்லி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Turmeric and chilli powder",
"t": "மஞ்சள், மிளகாய்த் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Butter or oil",
"t": "வெண்ணெய்",
"q": 2.0,
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
"e": "Fry the onion and chilli in butter until soft, add the tomato and spices.",
"t": "வெண்ணெயில் வெங்காயம், மிளகாய் வதக்கி தக்காளி, மசாலா சேர்க்கவும்."
},
{
"e": "Break in the eggs with salt and stir gently until just set.",
"t": "முட்டையை உடைத்து உப்புடன் வேகும் வரை மெதுவாகக் கிளறவும்."
},
{
"e": "Garnish with coriander and serve with pav or roti.",
"t": "கொத்தமல்லி தூவி பாவ் அல்லது ரொட்டியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Dhaba chicken curry",
"servings": 4,
"prep": 20,
"cook": 40,
"note": "Cook the onion-tomato masala well until the oil rises for a rich gravy.",
"note_ta": "வெங்காயம் தக்காளி மசாலாவில் எண்ணெய் மிதக்கும் வரை சமைத்தால் கிரேவி கெட்டியாக இருக்கும்.",
"ingredients": [
{
"n": "Chicken, pieces",
"t": "கோழிக்கறி",
"q": 700.0,
"u": "g"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 3.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 3.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli, coriander powder and garam masala",
"t": "மிளகாய், மல்லித் தூள், கரம் மசாலா",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.25,
"u": "cup"
},
{
"n": "Mustard oil or oil",
"t": "எண்ணெய்",
"q": 4.0,
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
"e": "Fry the onions golden in oil, add the paste and cook 2 minutes.",
"t": "எண்ணெயில் வெங்காயத்தைப் பொன்னிறமாக வதக்கி விழுது சேர்த்து 2 நிமிடம் வதக்கவும்."
},
{
"e": "Add the tomatoes and powders and cook until the oil separates.",
"t": "தக்காளி, தூள்கள் சேர்த்து எண்ணெய் பிரியும் வரை சமைக்கவும்."
},
{
"e": "Add the chicken, curd, salt and 1 cup of water; cover and cook until tender, 25 minutes.",
"t": "கோழி, தயிர், உப்பு, 1 கப் தண்ணீர் சேர்த்து மூடி 25 நிமிடம் மென்மையாக வேகவிடவும்."
}
]
},
{
"dish": "Tandoori chicken",
"servings": 4,
"prep": 30,
"cook": 30,
"note": "Marinate overnight for the best flavour; cook in a very hot oven.",
"note_ta": "சிறந்த சுவைக்கு இரவு முழுவதும் ஊறவைத்து மிகவும் சூடான அடுப்பில் சுடவும்.",
"ingredients": [
{
"n": "Chicken legs or pieces, slit",
"t": "கோழிக்கறி",
"q": 800.0,
"u": "g"
},
{
"n": "Thick curd",
"t": "கெட்டியான தயிர்",
"q": 0.75,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Kashmiri chilli powder",
"t": "காஷ்மீரி மிளகாய்த் தூள்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Tandoori masala and garam masala",
"t": "தந்தூரி மசாலா",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Oil or butter",
"t": "எண்ணெய்",
"q": 2.0,
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
"e": "Marinate the chicken with lemon and salt for 15 minutes.",
"t": "கோழியை எலுமிச்சை, உப்புடன் 15 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Mix with the curd, paste, chilli powder, masalas and oil; marinate 4 hours or overnight.",
"t": "தயிர், விழுது, மிளகாய்த் தூள், மசாலாக்கள், எண்ணெயுடன் கலந்து 4 மணி நேரம் அல்லது இரவு ஊறவைக்கவும்."
},
{
"e": "Roast at 220°C for 25 to 30 minutes, turning once and basting with butter, until charred at the edges.",
"t": "220°C இல் 25 முதல் 30 நிமிடம் ஒருமுறை திருப்பி வெண்ணெய் தடவி ஓரங்கள் கருகும் வரை சுடவும்."
}
]
},
{
"dish": "Chicken tikka",
"servings": 4,
"prep": 30,
"cook": 20,
"note": "Thread the pieces on skewers and do not crowd them.",
"note_ta": "துண்டுகளை குச்சியில் நெருக்காமல் கோர்க்கவும்.",
"ingredients": [
{
"n": "Boneless chicken, cubed",
"t": "எலும்பில்லாத கோழி",
"q": 500.0,
"u": "g"
},
{
"n": "Thick curd",
"t": "கெட்டியான தயிர்",
"q": 0.5,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Kashmiri chilli powder and garam masala",
"t": "மிளகாய்த் தூள், கரம் மசாலா",
"q": 2.0,
"u": "tsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
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
"e": "Mix the chicken with all the ingredients and marinate for at least 1 hour.",
"t": "கோழியை எல்லாப் பொருட்களுடனும் கலந்து குறைந்தது 1 மணி நேரம் ஊறவைக்கவும்."
},
{
"e": "Thread on skewers.",
"t": "குச்சிகளில் கோர்க்கவும்."
},
{
"e": "Grill or roast at 220°C for 15 to 20 minutes, turning, until charred in spots. Serve with onion and mint chutney.",
"t": "220°C இல் 15 முதல் 20 நிமிடம் திருப்பி சில இடங்களில் கருகும் வரை சுட்டு வெங்காயம், புதினா சட்னியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Mutton rogan josh",
"servings": 4,
"prep": 20,
"cook": 70,
"note": "Kashmiri chilli powder gives the red colour without too much heat.",
"note_ta": "காஷ்மீரி மிளகாய்த் தூள் காரம் அதிகமில்லாமல் சிவப்பு நிறம் தரும்.",
"ingredients": [
{
"n": "Mutton, pieces",
"t": "மட்டன்",
"q": 700.0,
"u": "g"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Thick curd",
"t": "கெட்டியான தயிர்",
"q": 0.5,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Kashmiri chilli powder",
"t": "காஷ்மீரி மிளகாய்த் தூள்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Fennel and dry ginger powder",
"t": "சோம்பு, சுக்குப் பொடி",
"q": 2.0,
"u": "tsp"
},
{
"n": "Whole spices (cardamom, clove, cinnamon, bay leaf)",
"t": "பட்டை, கிராம்பு, ஏலக்காய்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Mustard oil or ghee",
"t": "எண்ணெய்",
"q": 4.0,
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
"e": "Heat the oil, fry the whole spices and onion until golden.",
"t": "எண்ணெயில் மசாலாக்கள், வெங்காயத்தைப் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Add the mutton and paste and brown for 8 minutes.",
"t": "மட்டன், விழுது சேர்த்து 8 நிமிடம் பழுப்பாக வதக்கவும்."
},
{
"e": "Add the whisked curd, chilli, fennel, ginger powders and salt; cook for 5 minutes.",
"t": "அடித்த தயிர், மிளகாய், சோம்பு, சுக்குப் பொடி, உப்பு சேர்த்து 5 நிமிடம் சமைக்கவும்."
},
{
"e": "Add 2 cups of water, cover and cook on low until tender, about 50 minutes.",
"t": "2 கப் தண்ணீர் சேர்த்து மூடி குறைந்த தீயில் சுமார் 50 நிமிடம் மென்மையாக வேகவிடவும்."
}
]
},
{
"dish": "Mutton keema",
"servings": 4,
"prep": 15,
"cook": 35,
"note": "Serve with pav, naan or rice.",
"note_ta": "பாவ், நான் அல்லது சாதத்துடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Mutton mince",
"t": "மட்டன் கீமா",
"q": 500.0,
"u": "g"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 2.0,
"u": "piece"
},
{
"n": "Green peas",
"t": "பச்சைப் பட்டாணி",
"q": 0.5,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chilli, coriander powder and garam masala",
"t": "மிளகாய், மல்லித் தூள், கரம் மசாலா",
"q": 3.0,
"u": "tsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 4.0,
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
"e": "Fry the onion and paste until golden, add the tomato and powders.",
"t": "வெங்காயம், விழுதைப் பொன்னிறமாக வதக்கி தக்காளி, தூள்கள் சேர்க்கவும்."
},
{
"e": "Add the mince, salt and 1 cup of water and cook covered 20 minutes, breaking up lumps.",
"t": "கீமா, உப்பு, 1 கப் தண்ணீர் சேர்த்து கட்டிகளை உடைத்து மூடி 20 நிமிடம் வேகவிடவும்."
},
{
"e": "Add the peas and cook uncovered until dry and glossy.",
"t": "பட்டாணி சேர்த்து மூடாமல் ஈரம் போகும் வரை வேகவிடவும்."
}
]
},
{
"dish": "Butter naan",
"servings": 4,
"prep": 90,
"cook": 15,
"note": "Rest the dough for 1 hour; brush with butter right after cooking.",
"note_ta": "மாவை 1 மணி நேரம் ஊறவிடவும்; சமைத்தவுடன் வெண்ணெய் தடவவும்.",
"ingredients": [
{
"n": "Maida",
"t": "மைதா",
"q": 2.0,
"u": "cup"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.25,
"u": "cup"
},
{
"n": "Milk",
"t": "பால்",
"q": 0.25,
"u": "cup"
},
{
"n": "Sugar and baking powder",
"t": "சர்க்கரை, பேக்கிங் பவுடர்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 3.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Mix the maida, curd, milk, sugar, baking powder, salt and a little oil into a soft dough; rest 1 hour.",
"t": "மைதா, தயிர், பால், சர்க்கரை, பேக்கிங் பவுடர், உப்பு, சிறிது எண்ணெய் கலந்து மென்மையாகப் பிசைந்து 1 மணி நேரம் ஊறவிடவும்."
},
{
"e": "Divide, roll into ovals and cook on a very hot tawa until puffed with brown spots.",
"t": "பிரித்து நீள்வட்டமாகத் தேய்த்து மிகவும் சூடான தவாவில் பொங்கி புள்ளிகள் வரும் வரை வேகவிடவும்."
},
{
"e": "Brush generously with butter.",
"t": "தாராளமாக வெண்ணெய் தடவவும்."
}
]
},
{
"dish": "Tandoori roti",
"servings": 6,
"prep": 20,
"cook": 10,
"note": "Sprinkle a little water on the back before sticking it to a hot pan.",
"note_ta": "சூடான தவாவில் ஒட்டும் முன் பின்புறம் சிறிது தண்ணீர் தெளிக்கவும்.",
"ingredients": [
{
"n": "Whole wheat flour",
"t": "கோதுமை மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 0.75,
"u": "cup"
},
{
"n": "Butter or ghee",
"t": "வெண்ணெய்",
"q": 1.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Knead the flour, salt and water into a firm dough; rest 20 minutes.",
"t": "மாவு, உப்பு, தண்ணீரால் கெட்டியாகப் பிசைந்து 20 நிமிடம் ஊறவிடவும்."
},
{
"e": "Roll thick rounds.",
"t": "தடிமனான வட்டங்களாகத் தேய்க்கவும்."
},
{
"e": "Cook on a hot tawa, then turn it over the flame until charred in spots; brush with butter.",
"t": "சூடான தவாவில் வேகவிட்டு நெருப்பில் திருப்பிக் காட்டி புள்ளிகள் வரும் வரை சுட்டு வெண்ணெய் தடவவும்."
}
]
},
{
"dish": "Phulka",
"servings": 6,
"prep": 15,
"cook": 15,
"note": "Roll thin and puff directly over a flame.",
"note_ta": "மெல்லியதாகத் தேய்த்து நேரடியாக நெருப்பில் பொங்க விடவும்.",
"ingredients": [
{
"n": "Whole wheat flour",
"t": "கோதுமை மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 0.75,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 1.0,
"u": "tsp"
}
],
"steps": [
{
"e": "Knead a soft dough with the flour, salt and water; rest 15 minutes.",
"t": "மாவு, உப்பு, தண்ணீரால் மென்மையாகப் பிசைந்து 15 நிமிடம் ஊறவிடவும்."
},
{
"e": "Roll thin rounds and cook on a hot tawa for 20 seconds each side.",
"t": "மெல்லிய வட்டங்களாகத் தேய்த்து சூடான தவாவில் ஒவ்வொரு பக்கமும் 20 விநாடி வேகவிடவும்."
},
{
"e": "Place directly on the flame to puff; brush with ghee.",
"t": "நேரடியாக நெருப்பில் வைத்து பொங்கவிட்டு நெய் தடவவும்."
}
]
},
{
"dish": "Kachumber salad",
"servings": 4,
"prep": 10,
"cook": 0,
"note": "Add the salt and lemon just before serving so it stays crisp.",
"note_ta": "பரிமாறும் முன் உப்பு, எலுமிச்சை சேர்த்தால் மொறுமொறுப்பாக இருக்கும்.",
"ingredients": [
{
"n": "Cucumber, diced",
"t": "வெள்ளரிக்காய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Onion, diced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Tomato, diced",
"t": "தக்காளி",
"q": 2.0,
"u": "piece"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chaat masala and salt",
"t": "சாட் மசாலா, உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Mix the cucumber, onion, tomato, chilli and coriander.",
"t": "வெள்ளரிக்காய், வெங்காயம், தக்காளி, மிளகாய், கொத்தமல்லியைக் கலக்கவும்."
},
{
"e": "Season with lemon juice, chaat masala and salt just before serving.",
"t": "பரிமாறும் முன் எலுமிச்சை சாறு, சாட் மசாலா, உப்பு சேர்க்கவும்."
}
]
},
{
"dish": "Jeera aloo",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Do not mash the potatoes; they should be firm and golden.",
"note_ta": "உருளைக்கிழங்கை மசிக்க வேண்டாம்; உறுதியாக பொன்னிறமாக இருக்க வேண்டும்.",
"ingredients": [
{
"n": "Potatoes, boiled and cubed",
"t": "உருளைக்கிழங்கு",
"q": 4.0,
"u": "piece"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Green chilli and ginger",
"t": "பச்சை மிளகாய், இஞ்சி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Turmeric and chilli powder",
"t": "மஞ்சள், மிளகாய்த் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Oil or ghee",
"t": "எண்ணெய்",
"q": 3.0,
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
"e": "Heat the oil, splutter the cumin and fry the chilli and ginger.",
"t": "எண்ணெயில் சீரகம் தாளித்து மிளகாய், இஞ்சி வதக்கவும்."
},
{
"e": "Add the potatoes, turmeric, chilli powder and salt and fry until golden.",
"t": "உருளைக்கிழங்கு, மஞ்சள், மிளகாய்த் தூள், உப்பு சேர்த்து பொன்னிறமாக வறுக்கவும்."
},
{
"e": "Garnish with coriander.",
"t": "கொத்தமல்லி தூவவும்."
}
]
},
{
"dish": "Paneer tikka",
"servings": 4,
"prep": 30,
"cook": 20,
"note": "Do not marinate more than 4 hours or the paneer turns tough.",
"note_ta": "4 மணி நேரத்திற்கு மேல் ஊறவைத்தால் பனீர் கடினமாகும்.",
"ingredients": [
{
"n": "Paneer, cubes",
"t": "பனீர்",
"q": 300.0,
"u": "g"
},
{
"n": "Capsicum and onion, cubes",
"t": "குடைமிளகாய், வெங்காயம்",
"q": 1.0,
"u": "cup"
},
{
"n": "Thick curd",
"t": "கெட்டியான தயிர்",
"q": 0.5,
"u": "cup"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chilli powder, garam masala and kasuri methi",
"t": "மிளகாய்த் தூள், கரம் மசாலா, கசூரி மேத்தி",
"q": 2.0,
"u": "tsp"
},
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
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
"e": "Mix the curd, paste, spices, gram flour, oil and salt; coat the paneer and vegetables and marinate 30 minutes.",
"t": "தயிர், விழுது, மசாலாக்கள், கடலை மாவு, எண்ணெய், உப்பு கலந்து பனீர், காய்கறிகளைப் பூசி 30 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Thread alternately on skewers.",
"t": "மாறி மாறி குச்சிகளில் கோர்க்கவும்."
},
{
"e": "Grill or bake at 220°C for 15 to 20 minutes, turning once, until charred.",
"t": "220°C இல் 15 முதல் 20 நிமிடம் ஒருமுறை திருப்பி கருகும் வரை சுடவும்."
}
]
},
{
"dish": "Mixed veg pakora",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Chop the vegetables thin so they cook through.",
"note_ta": "காய்கறிகளை மெல்லியதாக நறுக்கினால் நன்கு வேகும்.",
"ingredients": [
{
"n": "Mixed vegetables (onion, potato, cauliflower, spinach), thin",
"t": "கலவை காய்கறிகள்",
"q": 3.0,
"u": "cup"
},
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli powder, ajwain and turmeric",
"t": "மிளகாய்த் தூள், ஓமம், மஞ்சள்",
"q": 1.5,
"u": "tsp"
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
"e": "Mix the vegetables with the flours, spices and salt, adding water just to bind.",
"t": "காய்கறிகளை மாவுகள், மசாலா, உப்புடன் கலந்து சேர்க்கத் தேவையான அளவு தண்ணீர் மட்டும் சேர்க்கவும்."
},
{
"e": "Drop small portions in hot oil.",
"t": "சிறு பகுதிகளாக சூடான எண்ணெயில் போடவும்."
},
{
"e": "Fry on medium heat until crisp and golden.",
"t": "நடுத்தரத் தீயில் மொறுமொறுப்பாக பொன்னிறமாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Kachori",
"servings": 4,
"prep": 40,
"cook": 25,
"note": "Fry on low heat so the shell cooks through and turns flaky.",
"note_ta": "குறைந்த தீயில் பொரித்தால் மேல்புறம் உள்ளே வெந்து மொறுமொறுப்பாகும்.",
"ingredients": [
{
"n": "Maida",
"t": "மைதா",
"q": 2.0,
"u": "cup"
},
{
"n": "Moong dal, soaked",
"t": "பாசிப்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Fennel seeds and cumin",
"t": "சோம்பு, சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chilli powder and garam masala",
"t": "மிளகாய்த் தூள், கரம் மசாலா",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ghee or oil for the dough",
"t": "நெய்",
"q": 3.0,
"u": "tbsp"
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
"e": "Knead the maida with ghee, salt and water into a stiff dough; rest 30 minutes.",
"t": "மைதாவை நெய், உப்பு, தண்ணீருடன் கெட்டியாகப் பிசைந்து 30 நிமிடம் ஊறவிடவும்."
},
{
"e": "Grind the dal coarsely and roast it with the spices and salt for the filling.",
"t": "பருப்பைக் கொரகொரப்பாக அரைத்து மசாலா, உப்புடன் வறுத்து பூரணமாக்கவும்."
},
{
"e": "Stuff small dough balls, seal and flatten gently.",
"t": "சிறு மாவு உருண்டைகளில் பூரணம் நிரப்பி மூடி மெதுவாகத் தட்டவும்."
},
{
"e": "Fry on low heat until golden and crisp.",
"t": "குறைந்த தீயில் பொன்னிறமாக மொறுமொறுப்பாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Bhel puri",
"servings": 2,
"prep": 15,
"cook": 0,
"note": "Mix just before serving so the puffed rice stays crisp.",
"note_ta": "பரிமாறும் முன் கலந்தால் பொரி மொறுமொறுப்பாக இருக்கும்.",
"ingredients": [
{
"n": "Puffed rice (murmura)",
"t": "பொரி",
"q": 3.0,
"u": "cup"
},
{
"n": "Sev",
"t": "சேவு",
"q": 0.5,
"u": "cup"
},
{
"n": "Onion, tomato and boiled potato, chopped",
"t": "வெங்காயம், தக்காளி, உருளைக்கிழங்கு",
"q": 1.0,
"u": "cup"
},
{
"n": "Tamarind chutney",
"t": "புளிச் சட்னி",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Green chutney",
"t": "பச்சைச் சட்னி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Roasted peanuts",
"t": "வறுத்த வேர்க்கடலை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Coriander and lemon",
"t": "கொத்தமல்லி, எலுமிச்சை",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chaat masala and salt",
"t": "சாட் மசாலா, உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Mix the puffed rice with the onion, tomato, potato and peanuts.",
"t": "பொரியை வெங்காயம், தக்காளி, உருளைக்கிழங்கு, வேர்க்கடலையுடன் கலக்கவும்."
},
{
"e": "Add the chutneys, chaat masala, salt and lemon and toss quickly.",
"t": "சட்னிகள், சாட் மசாலா, உப்பு, எலுமிச்சை சேர்த்து வேகமாகப் புரட்டவும்."
},
{
"e": "Top with sev and coriander and serve at once.",
"t": "சேவு, கொத்தமல்லி தூவி உடனே பரிமாறவும்."
}
]
},
{
"dish": "Pani puri",
"servings": 4,
"prep": 30,
"cook": 10,
"note": "Chill the spiced water well; fill the puris just before eating.",
"note_ta": "காரத் தண்ணீரை நன்கு குளிரவைக்கவும்; சாப்பிடும் முன் பூரியில் நிரப்பவும்.",
"ingredients": [
{
"n": "Ready puris",
"t": "பானி பூரி",
"q": 24.0,
"u": "piece"
},
{
"n": "Potatoes, boiled and mashed",
"t": "உருளைக்கிழங்கு",
"q": 2.0,
"u": "piece"
},
{
"n": "Boiled chickpeas or sprouts",
"t": "கொண்டைக்கடலை",
"q": 0.5,
"u": "cup"
},
{
"n": "Mint and coriander leaves",
"t": "புதினா, கொத்தமல்லி",
"q": 1.0,
"u": "cup"
},
{
"n": "Green chilli and ginger",
"t": "பச்சை மிளகாய், இஞ்சி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Tamarind pulp and jaggery",
"t": "புளிக்கரைசல், வெல்லம்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Cumin powder and black salt",
"t": "சீரகத் தூள், கல் உப்பு",
"q": 2.0,
"u": "tsp"
},
{
"n": "Cold water",
"t": "குளிர்ந்த தண்ணீர்",
"q": 4.0,
"u": "cup"
}
],
"steps": [
{
"e": "Grind the mint, coriander, chilli and ginger and mix with the water, tamarind, jaggery, cumin and black salt; chill.",
"t": "புதினா, கொத்தமல்லி, மிளகாய், இஞ்சியை அரைத்து தண்ணீர், புளி, வெல்லம், சீரகம், கல் உப்புடன் கலந்து குளிரவைக்கவும்."
},
{
"e": "Mix the potato, chickpeas and a pinch of salt and chilli for the filling.",
"t": "உருளைக்கிழங்கு, கடலை, சிறிது உப்பு, மிளகாய்த் தூள் கலந்து பூரணமாக்கவும்."
},
{
"e": "Crack the top of each puri, add filling and the chilled water, and eat at once.",
"t": "ஒவ்வொரு பூரியின் மேற்புறத்தை உடைத்து பூரணம், குளிர்ந்த நீர் ஊற்றி உடனே சாப்பிடவும்."
}
]
},
{
"dish": "Vada pav",
"servings": 4,
"prep": 25,
"cook": 20,
"note": "Dip the vada in thick gram flour batter and fry on medium heat.",
"note_ta": "வடையை கெட்டியான கடலை மாவில் முக்கி நடுத்தரத் தீயில் பொரிக்கவும்.",
"ingredients": [
{
"n": "Potatoes, boiled",
"t": "உருளைக்கிழங்கு",
"q": 4.0,
"u": "piece"
},
{
"n": "Garlic, green chilli and ginger paste",
"t": "பூண்டு மிளகாய் இஞ்சி விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Pav (bread rolls)",
"t": "பாவ்",
"q": 8.0,
"u": "piece"
},
{
"n": "Dry garlic chutney",
"t": "பூண்டுச் சட்னி",
"q": 3.0,
"u": "tbsp"
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
"e": "Temper mustard, curry leaves and the paste, add turmeric, mashed potato and salt; shape into balls.",
"t": "கடுகு, கறிவேப்பிலை, விழுது தாளித்து மஞ்சள், மசித்த உருளைக்கிழங்கு, உப்பு சேர்த்து உருண்டைகளாக்கவும்."
},
{
"e": "Whisk the gram flour with salt and water into a thick batter; dip the balls and fry until golden.",
"t": "கடலை மாவை உப்பு, தண்ணீருடன் கெட்டியாகக் கலந்து உருண்டைகளை முக்கி பொன்னிறமாகப் பொரிக்கவும்."
},
{
"e": "Slit the pav, spread the chutney, place a vada inside and serve.",
"t": "பாவைப் பிளந்து சட்னி தடவி வடையை உள்ளே வைத்துப் பரிமாறவும்."
}
]
},
{
"dish": "Masala chai",
"servings": 2,
"prep": 2,
"cook": 8,
"note": "Add the tea leaves after the spices have boiled for deeper flavour.",
"note_ta": "மசாலாக்கள் கொதித்த பின் தேயிலை சேர்த்தால் சுவை கூடும்.",
"ingredients": [
{
"n": "Water",
"t": "தண்ணீர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Milk",
"t": "பால்",
"q": 1.0,
"u": "cup"
},
{
"n": "Tea leaves",
"t": "தேயிலை",
"q": 2.0,
"u": "tsp"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 2.0,
"u": "tsp"
},
{
"n": "Crushed ginger",
"t": "இஞ்சி",
"q": 0.5,
"u": "inch"
},
{
"n": "Cardamom",
"t": "ஏலக்காய்",
"q": 2.0,
"u": "piece"
}
],
"steps": [
{
"e": "Boil the water with the ginger and cardamom for 2 minutes.",
"t": "தண்ணீரை இஞ்சி, ஏலக்காயுடன் 2 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the tea leaves and sugar and boil for a minute.",
"t": "தேயிலை, சர்க்கரை சேர்த்து ஒரு நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the milk, bring to a boil and strain into cups.",
"t": "பால் சேர்த்து கொதிக்கவிட்டு கோப்பைகளில் வடிகட்டவும்."
}
]
},
{
"dish": "Sweet lassi",
"servings": 2,
"prep": 5,
"cook": 0,
"note": "Use thick, fresh curd and serve very cold.",
"note_ta": "கெட்டியான புதிய தயிர் பயன்படுத்தி நன்கு குளிரவைத்துப் பரிமாறவும்.",
"ingredients": [
{
"n": "Thick curd",
"t": "கெட்டியான தயிர்",
"q": 1.5,
"u": "cup"
},
{
"n": "Cold milk or water",
"t": "குளிர்ந்த பால்",
"q": 0.5,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Ice cubes",
"t": "ஐஸ் கட்டிகள்",
"q": 4.0,
"u": "piece"
}
],
"steps": [
{
"e": "Blend the curd, milk, sugar and cardamom until smooth and frothy.",
"t": "தயிர், பால், சர்க்கரை, ஏலக்காயை நுரைக்க அடிக்கவும்."
},
{
"e": "Pour over ice and serve cold.",
"t": "ஐஸ் மேல் ஊற்றி குளிர்ச்சியாகப் பரிமாறவும்."
}
]
},
{
"dish": "Gulab jamun",
"servings": 6,
"prep": 20,
"cook": 30,
"note": "Fry on low heat so the jamuns cook inside, and soak them in warm (not hot) syrup.",
"note_ta": "குறைந்த தீயில் பொரித்தால் உள்ளே வேகும்; வெதுவெதுப்பான (சூடில்லாத) பாகில் ஊறவைக்கவும்.",
"ingredients": [
{
"n": "Milk powder",
"t": "பால் பவுடர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Maida",
"t": "மைதா",
"q": 0.25,
"u": "cup"
},
{
"n": "Baking soda",
"t": "சமையல் சோடா",
"q": 1.0,
"u": "pinch"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Milk",
"t": "பால்",
"q": 0.25,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1.5,
"u": "cup"
},
{
"n": "Cardamom",
"t": "ஏலக்காய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Oil or ghee for frying",
"t": "பொரிக்க நெய்",
"q": null,
"u": "as_needed"
}
],
"steps": [
{
"e": "Mix the milk powder, maida, soda and ghee and knead a soft dough with the milk.",
"t": "பால் பவுடர், மைதா, சோடா, நெய் கலந்து பாலுடன் மென்மையாகப் பிசையவும்."
},
{
"e": "Boil the sugar with 1.5 cups of water and cardamom for 5 minutes into a light syrup.",
"t": "சர்க்கரையை 1.5 கப் தண்ணீர், ஏலக்காயுடன் 5 நிமிடம் லேசான பாகாகக் காய்ச்சவும்."
},
{
"e": "Shape smooth, crack-free balls and fry on low heat until deep golden.",
"t": "விரிசல் இல்லாத மென்மையான உருண்டைகளாக்கி குறைந்த தீயில் அடர் பொன்னிறமாகப் பொரிக்கவும்."
},
{
"e": "Soak in the warm syrup for 1 hour.",
"t": "வெதுவெதுப்பான பாகில் 1 மணி நேரம் ஊறவிடவும்."
}
]
},
{
"dish": "Kheer",
"servings": 4,
"prep": 10,
"cook": 45,
"note": "Stir often so the milk does not catch at the bottom.",
"note_ta": "பால் அடிப்பிடிக்காமல் இருக்க அடிக்கடி கிளறவும்.",
"ingredients": [
{
"n": "Basmati rice",
"t": "பாசுமதி அரிசி",
"q": 0.25,
"u": "cup"
},
{
"n": "Full-fat milk",
"t": "பால்",
"q": 4.0,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 0.5,
"u": "cup"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Cashew nuts and raisins",
"t": "முந்திரி, திராட்சை",
"q": 2.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Wash the rice and soak 20 minutes.",
"t": "அரிசியைக் கழுவி 20 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Boil the milk, add the rice and simmer on low for 35 minutes, stirring often, until thick and creamy.",
"t": "பாலைக் கொதிக்கவிட்டு அரிசி சேர்த்து குறைந்த தீயில் 35 நிமிடம் அடிக்கடி கிளறி கெட்டியாகும் வரை கொதிக்கவிடவும்."
},
{
"e": "Add the sugar, cardamom and nuts and cook 5 more minutes.",
"t": "சர்க்கரை, ஏலக்காய், முந்திரி சேர்த்து மேலும் 5 நிமிடம் சமைக்கவும்."
}
]
},
{
"dish": "Gajar halwa",
"servings": 6,
"prep": 15,
"cook": 50,
"note": "Cook the carrots in milk slowly; the longer it cooks, the richer it tastes.",
"note_ta": "கேரட்டை பாலில் மெதுவாகச் சமைக்கவும்; அதிக நேரம் சமைத்தால் சுவை கூடும்.",
"ingredients": [
{
"n": "Carrots, grated",
"t": "கேரட்",
"q": 500.0,
"u": "g"
},
{
"n": "Full-fat milk",
"t": "பால்",
"q": 2.0,
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
"q": 3.0,
"u": "tbsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Cashew nuts and raisins",
"t": "முந்திரி, திராட்சை",
"q": 2.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Cook the grated carrots in the milk on medium heat, stirring, until the milk is absorbed.",
"t": "துருவிய கேரட்டை பாலில் நடுத்தரத் தீயில் கிளறி பால் உறியும் வரை சமைக்கவும்."
},
{
"e": "Add the sugar and cook until the moisture dries.",
"t": "சர்க்கரை சேர்த்து ஈரம் போகும் வரை சமைக்கவும்."
},
{
"e": "Add ghee and cook 5 more minutes; stir in cardamom and nuts fried in ghee.",
"t": "நெய் சேர்த்து மேலும் 5 நிமிடம் சமைத்து ஏலக்காய், நெய்யில் வறுத்த முந்திரி சேர்க்கவும்."
}
]
},
{
"dish": "Jalebi",
"servings": 6,
"prep": 20,
"cook": 30,
"note": "Ferment the batter overnight and make the syrup warm, not hot.",
"note_ta": "மாவை இரவு புளிக்கவிட்டு பாகை வெதுவெதுப்பாக வைக்கவும்.",
"ingredients": [
{
"n": "Maida",
"t": "மைதா",
"q": 1.0,
"u": "cup"
},
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1.5,
"u": "cup"
},
{
"n": "Cardamom powder and saffron",
"t": "ஏலக்காய் தூள், குங்குமப்பூ",
"q": 0.5,
"u": "tsp"
},
{
"n": "Ghee or oil for frying",
"t": "பொரிக்க நெய்",
"q": null,
"u": "as_needed"
}
],
"steps": [
{
"e": "Whisk the maida, gram flour, curd and water into a thick, smooth batter and ferment for 8 hours.",
"t": "மைதா, கடலை மாவு, தயிர், தண்ணீரை கெட்டியாகக் கலந்து 8 மணி நேரம் புளிக்கவிடவும்."
},
{
"e": "Boil the sugar with 1 cup of water, cardamom and saffron to a one-string syrup.",
"t": "சர்க்கரையை 1 கப் தண்ணீர், ஏலக்காய், குங்குமப்பூவுடன் ஒரு கம்பிப் பாகாகக் காய்ச்சவும்."
},
{
"e": "Pour the batter into hot ghee in spirals using a squeeze bottle and fry until crisp.",
"t": "ஸ்க்வீஸ் பாட்டிலில் மாவை சூடான நெய்யில் சுருளாக ஊற்றி மொறுமொறுப்பாகப் பொரிக்கவும்."
},
{
"e": "Dip in the warm syrup for 30 seconds and serve.",
"t": "வெதுவெதுப்பான பாகில் 30 விநாடி முக்கிப் பரிமாறவும்."
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
