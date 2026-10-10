-- HomeFood · 0016: standard recipes (English + Tamil) for the 160 South Indian dishes added in 0015
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Same shape as the recipes in 0011: quantities are for `servings` people and the app scales them. They are drafts
-- (written by Claude): the family should check ingredients and seasoning before relying on them.
-- Safe to run twice: a dish that already has a standard recipe is skipped.

with src as (
  select * from jsonb_to_recordset($json$
[
{
"dish": "Rava idli",
"servings": 4,
"prep": 20,
"cook": 15,
"note": "Batter thickens on standing; add a splash of water before steaming.",
"note_ta": "நிற்கும்போது மாவு கெட்டியாகும்; ஆவியில் வைக்கும் முன் சிறிது தண்ணீர் சேர்க்கவும்.",
"ingredients": [
{
"n": "Rava (semolina)",
"t": "ரவை",
"q": 1.5,
"u": "cup"
},
{
"n": "Curd",
"t": "தயிர்",
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
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
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
"n": "Ghee",
"t": "நெய்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Fruit salt or baking soda",
"t": "ஈனோ அல்லது சமையல் சோடா",
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
"e": "Dry roast the rava for 3 to 4 minutes until it smells nutty, then let it cool.",
"t": "ரவையை 3 முதல் 4 நிமிடம் வாசனை வரும் வரை வறுத்து ஆறவிடவும்."
},
{
"e": "Heat the ghee, splutter the mustard, fry the chana dal, cashews and chopped chilli, and mix into the rava.",
"t": "நெய்யில் கடுகு தாளித்து, கடலைப்பருப்பு, முந்திரி, நறுக்கிய மிளகாயை வறுத்து ரவையில் கலக்கவும்."
},
{
"e": "Add the curd, salt and enough water to make a thick idli batter. Rest for 15 minutes.",
"t": "தயிர், உப்பு சேர்த்து, தேவையான தண்ணீர் விட்டு கெட்டியான இட்லி மாவு பதத்தில் கலந்து 15 நிமிடம் ஊறவிடவும்."
},
{
"e": "Stir in the fruit salt, fill greased idli moulds and steam for 12 minutes.",
"t": "ஈனோ சேர்த்துக் கலந்து, எண்ணெய் தடவிய இட்லித் தட்டில் ஊற்றி 12 நிமிடம் ஆவியில் வேகவிடவும்."
}
]
},
{
"dish": "Podi idli",
"servings": 4,
"prep": 5,
"cook": 10,
"note": "Use idlis from yesterday's batch if you like; they fry up even better.",
"note_ta": "நேற்றைய இட்லிகளையும் பயன்படுத்தலாம்; இன்னும் சுவையாக இருக்கும்.",
"ingredients": [
{
"n": "Mini idlis or cut idlis",
"t": "மினி இட்லி",
"q": 12.0,
"u": "piece"
},
{
"n": "Idli podi (gunpowder)",
"t": "இட்லி பொடி",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 2.0,
"u": "tbsp"
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
"q": 1.0,
"u": "sprig"
}
],
"steps": [
{
"e": "Heat the oil, splutter the mustard and add the curry leaves.",
"t": "எண்ணெயைக் காயவைத்து கடுகு தாளித்து கறிவேப்பிலை சேர்க்கவும்."
},
{
"e": "Add the idlis and toss on medium heat for 3 to 4 minutes until lightly crisp at the edges.",
"t": "இட்லிகளைச் சேர்த்து நடுத்தரத் தீயில் 3 முதல் 4 நிமிடம் ஓரங்கள் லேசாக மொறுமொறுக்கும் வரை புரட்டவும்."
},
{
"e": "Sprinkle the podi, toss well to coat and serve hot.",
"t": "இட்லி பொடியைத் தூவி நன்கு புரட்டி சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Mini idli sambar",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Pour the hot sambar over the idlis just before serving so they stay soft.",
"note_ta": "பரிமாறும் முன் மட்டும் சூடான சாம்பாரை இட்லிகள் மேல் ஊற்றவும்; அப்போது மென்மையாக இருக்கும்.",
"ingredients": [
{
"n": "Mini idlis",
"t": "மினி இட்லி",
"q": 24.0,
"u": "piece"
},
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Mixed vegetables (carrot, drumstick, onion)",
"t": "கலவை காய்கறிகள்",
"q": 1.5,
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
"u": "tsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ghee",
"t": "நெய்",
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
"e": "Pressure cook the dal with turmeric until soft and mash lightly.",
"t": "துவரம்பருப்பை மஞ்சள் தூளுடன் குக்கரில் வேகவைத்து லேசாக மசிக்கவும்."
},
{
"e": "Boil the vegetables with tamarind water, sambar powder and salt until tender.",
"t": "காய்கறிகளைப் புளிக்கரைசல், சாம்பார் பொடி, உப்புடன் வேகும் வரை கொதிக்கவிடவும்."
},
{
"e": "Add the dal, simmer for 5 minutes, then temper with mustard in ghee.",
"t": "பருப்பைச் சேர்த்து 5 நிமிடம் கொதிக்கவிட்டு, நெய்யில் கடுகு தாளித்துக் கொட்டவும்."
},
{
"e": "Place the idlis in a bowl, ladle the hot sambar over them and serve.",
"t": "இட்லிகளை கிண்ணத்தில் வைத்து சூடான சாம்பாரை ஊற்றிப் பரிமாறவும்."
}
]
},
{
"dish": "Set dosa",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Cook on one side only, covered, for a soft sponge-like dosa.",
"note_ta": "ஒரு பக்கம் மட்டும் மூடி வேகவிட்டால் மென்மையான பஞ்சு போன்ற தோசை கிடைக்கும்.",
"ingredients": [
{
"n": "Dosa batter",
"t": "தோசை மாவு",
"q": 3.0,
"u": "cup"
},
{
"n": "Poha (soaked)",
"t": "அவல்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 2.0,
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
"e": "Stir the soaked poha and curd into the fermented batter and keep it a little thicker than regular dosa batter.",
"t": "புளித்த மாவில் ஊறவைத்த அவல், தயிரைக் கலந்து சாதாரண தோசை மாவை விட சற்று கெட்டியாக வைக்கவும்."
},
{
"e": "Heat a pan, pour a small ladle of batter and do not spread it.",
"t": "தவாவைச் சூடாக்கி சிறிய கரண்டி மாவை ஊற்றவும்; பரப்ப வேண்டாம்."
},
{
"e": "Drizzle a little oil, cover and cook on low heat until the top is set and bubbly. Do not flip.",
"t": "சிறிது எண்ணெய் விட்டு மூடி, குறைந்த தீயில் மேல்பகுதி வெந்து குமிழ்கள் வரும் வரை வேகவிடவும்; திருப்ப வேண்டாம்."
},
{
"e": "Stack three together and serve with chutney and sagu or sambar.",
"t": "மூன்றாக அடுக்கி சட்னி, சாம்பாருடன் பரிமாறவும்."
}
]
},
{
"dish": "Neer dosa",
"servings": 4,
"prep": 20,
"cook": 15,
"note": "The batter should be as thin as buttermilk.",
"note_ta": "மாவு மோர் போல நீர்த்து இருக்க வேண்டும்.",
"ingredients": [
{
"n": "Raw rice",
"t": "பச்சரிசி",
"q": 1.0,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
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
"q": 1.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Soak the rice for 2 hours, then grind with the coconut and salt to a very smooth, thin batter.",
"t": "அரிசியை 2 மணி நேரம் ஊறவைத்து, தேங்காய், உப்புடன் மிக நைசாக நீர்த்த மாவாக அரைக்கவும்."
},
{
"e": "Heat a non-stick pan and lightly grease it.",
"t": "தவாவைச் சூடாக்கி லேசாக எண்ணெய் தடவவும்."
},
{
"e": "Stir the batter, pour it from a height to cover the pan and cook covered for 1 minute; no need to flip.",
"t": "மாவைக் கலக்கி உயரத்திலிருந்து தவா முழுவதும் ஊற்றி மூடி 1 நிமிடம் வேகவிடவும்; திருப்ப வேண்டாம்."
},
{
"e": "Fold into a triangle and serve with coconut chutney or curry.",
"t": "முக்கோணமாக மடித்து தேங்காய் சட்னி அல்லது குழம்புடன் பரிமாறவும்."
}
]
},
{
"dish": "Adai",
"servings": 4,
"prep": 20,
"cook": 20,
"note": "Keep the batter coarse, not smooth, for crisp adai.",
"note_ta": "மொறுமொறுப்புக்கு மாவை நைசாக இல்லாமல் கொரகொரப்பாக அரைக்கவும்.",
"ingredients": [
{
"n": "Raw rice",
"t": "பச்சரிசி",
"q": 1.0,
"u": "cup"
},
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
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
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "sprig"
},
{
"n": "Asafoetida",
"t": "பெருங்காயம்",
"q": 1.0,
"u": "pinch"
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
"e": "Soak the rice and all dals together for 3 hours.",
"t": "அரிசி, எல்லா பருப்புகளையும் சேர்த்து 3 மணி நேரம் ஊறவைக்கவும்."
},
{
"e": "Grind coarsely with the chillies, asafoetida and salt. Stir in the onion and curry leaves.",
"t": "மிளகாய், பெருங்காயம், உப்புடன் கொரகொரப்பாக அரைத்து வெங்காயம், கறிவேப்பிலை கலக்கவும்."
},
{
"e": "Pour a ladle on a hot pan, spread thick, and drizzle oil around and in the centre.",
"t": "சூடான தவாவில் ஒரு கரண்டி மாவை சற்று கனமாகப் பரப்பி, ஓரங்களிலும் நடுவிலும் எண்ணெய் விடவும்."
},
{
"e": "Cook both sides until golden and crisp. Serve with avial or jaggery and butter.",
"t": "இருபுறமும் பொன்னிறமாக மொறுமொறுப்பாக வேகவிட்டு அவியல் அல்லது வெல்லம், வெண்ணெயுடன் பரிமாறவும்."
}
]
},
{
"dish": "Ragi dosa",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Add a little rice flour if the dosa tears.",
"note_ta": "தோசை கிழிந்தால் சிறிது அரிசி மாவு சேர்க்கவும்.",
"ingredients": [
{
"n": "Ragi flour",
"t": "ராகி மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 0.25,
"u": "cup"
},
{
"n": "Urad dal flour or dosa batter",
"t": "உளுந்து மாவு",
"q": 0.25,
"u": "cup"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.5,
"u": "cup"
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
"e": "Mix the flours, curd, salt and water into a thin batter. Rest for 15 minutes.",
"t": "மாவுகள், தயிர், உப்பு, தண்ணீர் சேர்த்து நீர்த்த மாவாகக் கலந்து 15 நிமிடம் வைக்கவும்."
},
{
"e": "Stir in the onion. Heat a pan and pour the batter in a circle from the edge inwards.",
"t": "வெங்காயத்தைக் கலந்து, சூடான தவாவில் ஓரத்திலிருந்து உள்நோக்கி வட்டமாக மாவை ஊற்றவும்."
},
{
"e": "Drizzle oil, cook until crisp, fold and serve with chutney.",
"t": "எண்ணெய் விட்டு மொறுமொறுப்பாக வேகவைத்து மடித்து சட்னியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Wheat dosa",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Rest the batter for 10 minutes; it thickens as the flour absorbs water.",
"note_ta": "மாவை 10 நிமிடம் ஊறவிடவும்; மாவு தண்ணீரை உறிஞ்சி கெட்டியாகும்.",
"ingredients": [
{
"n": "Wheat flour",
"t": "கோதுமை மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
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
"n": "Cumin seeds",
"t": "சீரகம்",
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
"e": "Whisk the flours, curd, cumin and salt with water into a smooth, runny batter.",
"t": "மாவுகள், தயிர், சீரகம், உப்பை தண்ணீருடன் கட்டியில்லாமல் நீர்த்து கலக்கவும்."
},
{
"e": "Pour on a hot greased pan and spread thin.",
"t": "சூடான எண்ணெய் தடவிய தவாவில் ஊற்றி மெல்லியதாகப் பரப்பவும்."
},
{
"e": "Drizzle oil, cook both sides until golden and serve with chutney.",
"t": "எண்ணெய் விட்டு இருபுறமும் பொன்னிறமாக வேகவிட்டு சட்னியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Kal dosai",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Cook covered on low heat so the dosa stays soft inside.",
"note_ta": "குறைந்த தீயில் மூடி வேகவிட்டால் உள்ளே மென்மையாக இருக்கும்.",
"ingredients": [
{
"n": "Dosa batter",
"t": "தோசை மாவு",
"q": 3.0,
"u": "cup"
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
"e": "Heat a heavy tawa on low heat and grease it.",
"t": "கனமான தவாவைக் குறைந்த தீயில் சூடாக்கி எண்ணெய் தடவவும்."
},
{
"e": "Pour a ladle of batter and spread slightly to a small thick round.",
"t": "ஒரு கரண்டி மாவை ஊற்றி சிறிய கனமான வட்டமாக லேசாகப் பரப்பவும்."
},
{
"e": "Cover and cook until the top is set, flip once for 30 seconds and serve soft with sambar.",
"t": "மூடி மேல்பகுதி வேகும் வரை சமைத்து, ஒருமுறை திருப்பி 30 விநாடி வேகவைத்து சாம்பாருடன் மென்மையாகப் பரிமாறவும்."
}
]
},
{
"dish": "Egg dosa",
"servings": 2,
"prep": 5,
"cook": 10,
"note": "Add a pinch of pepper and chopped onion on the egg for extra flavour.",
"note_ta": "முட்டையின் மேல் மிளகுத்தூள், நறுக்கிய வெங்காயம் தூவினால் கூடுதல் சுவை.",
"ingredients": [
{
"n": "Dosa batter",
"t": "தோசை மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Eggs",
"t": "முட்டை",
"q": 2.0,
"u": "piece"
},
{
"n": "Pepper powder",
"t": "மிளகுத் தூள்",
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
"q": 2.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Spread a dosa on a hot pan and drizzle a little oil.",
"t": "சூடான தவாவில் தோசை ஊற்றி சிறிது எண்ணெய் விடவும்."
},
{
"e": "Beat an egg with salt and pepper and pour it over the dosa while the top is still wet, spreading with the spoon.",
"t": "முட்டையை உப்பு, மிளகுடன் அடித்து தோசை வேகும் முன் மேலே ஊற்றி கரண்டியால் பரப்பவும்."
},
{
"e": "Cook until the egg sets, flip briefly, fold and serve hot.",
"t": "முட்டை வெந்ததும் ஒருமுறை திருப்பி மடித்து சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Khara bath",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Serve with a spoon of coconut chutney or raita.",
"note_ta": "தேங்காய் சட்னி அல்லது ரைத்தாவுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Rava (semolina)",
"t": "ரவை",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion, tomato, carrot, peas (chopped)",
"t": "கலவை காய்கறிகள்",
"q": 1.5,
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
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Ghee or oil",
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
"e": "Dry roast the rava until fragrant and set aside.",
"t": "ரவையை வாசனை வரும் வரை வறுத்து தனியே வைக்கவும்."
},
{
"e": "Heat the ghee, splutter the mustard, fry the dals, cashews and chillies, then the vegetables with salt.",
"t": "நெய்யில் கடுகு தாளித்து, பருப்புகள், முந்திரி, மிளகாய் வறுத்து காய்கறிகளையும் உப்பையும் சேர்த்து வதக்கவும்."
},
{
"e": "Add 2.5 cups of hot water, bring to a boil, then pour in the rava while stirring.",
"t": "2.5 கப் சூடான தண்ணீர் சேர்த்து கொதிக்கவிட்டு, கிளறியபடி ரவையைக் கொட்டவும்."
},
{
"e": "Cover and cook on low for 5 minutes, fluff and serve hot.",
"t": "மூடி குறைந்த தீயில் 5 நிமிடம் வேகவைத்து கிளறிப் பரிமாறவும்."
}
]
},
{
"dish": "Semiya upma",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Roast the vermicelli well so it does not turn sticky.",
"note_ta": "சேமியாவை நன்கு வறுத்தால் ஒட்டாமல் உதிரியாக இருக்கும்.",
"ingredients": [
{
"n": "Vermicelli (semiya)",
"t": "சேமியா",
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
"n": "Oil or ghee",
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
"e": "Roast the vermicelli in a little oil until golden and set aside.",
"t": "சேமியாவை சிறிது எண்ணெயில் பொன்னிறமாக வறுத்து தனியே வைக்கவும்."
},
{
"e": "Temper mustard, dals, chilli and curry leaves; fry the onion until soft.",
"t": "கடுகு, பருப்புகள், மிளகாய், கறிவேப்பிலை தாளித்து வெங்காயத்தை மென்மையாக வதக்கவும்."
},
{
"e": "Add 3 cups of water and salt, bring to a boil, add the vermicelli and stir.",
"t": "3 கப் தண்ணீர், உப்பு சேர்த்து கொதிக்கவிட்டு சேமியாவைச் சேர்த்துக் கிளறவும்."
},
{
"e": "Cover and cook on low for 3 to 4 minutes until the water is absorbed.",
"t": "மூடி குறைந்த தீயில் 3 முதல் 4 நிமிடம் தண்ணீர் உறிஞ்சும் வரை வேகவிடவும்."
}
]
},
{
"dish": "Godhumai rava upma",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Broken wheat (dalia) has more fibre than semolina.",
"note_ta": "கோதுமை ரவையில் நார்ச்சத்து அதிகம்.",
"ingredients": [
{
"n": "Broken wheat (godhumai rava)",
"t": "கோதுமை ரவை",
"q": 1.0,
"u": "cup"
},
{
"n": "Mixed vegetables, chopped",
"t": "கலவை காய்கறிகள்",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
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
"e": "Dry roast the broken wheat for 3 minutes.",
"t": "கோதுமை ரவையை 3 நிமிடம் வறுக்கவும்."
},
{
"e": "Temper mustard, urad dal and chilli; fry the onion and vegetables with salt.",
"t": "கடுகு, உளுத்தம்பருப்பு, மிளகாய் தாளித்து வெங்காயம், காய்கறிகளை உப்புடன் வதக்கவும்."
},
{
"e": "Add 2.5 cups of boiling water, stir in the wheat, cover and cook on low for 10 minutes.",
"t": "2.5 கப் கொதிக்கும் தண்ணீர் சேர்த்து ரவையைக் கிளறி, மூடி குறைந்த தீயில் 10 நிமிடம் வேகவிடவும்."
}
]
},
{
"dish": "Arisi upma",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Soak the rice rava for 15 minutes for a softer upma.",
"note_ta": "அரிசி ரவையை 15 நிமிடம் ஊறவைத்தால் மென்மையாக இருக்கும்.",
"ingredients": [
{
"n": "Rice rava (broken rice)",
"t": "அரிசி ரவை",
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
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
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
"e": "Boil the toor dal with 3 cups of water until half cooked.",
"t": "துவரம்பருப்பை 3 கப் தண்ணீரில் பாதி வேகும் வரை வேகவிடவும்."
},
{
"e": "Temper mustard, chillies and curry leaves in oil and add them with salt to the water.",
"t": "எண்ணெயில் கடுகு, மிளகாய், கறிவேப்பிலை தாளித்து உப்புடன் தண்ணீரில் சேர்க்கவும்."
},
{
"e": "Add the rice rava slowly while stirring, then the coconut; cover and cook on low for 10 minutes.",
"t": "அரிசி ரவையைக் கிளறியபடி மெதுவாகச் சேர்த்து, தேங்காய் சேர்த்து மூடி குறைந்த தீயில் 10 நிமிடம் வேகவிடவும்."
}
]
},
{
"dish": "Samai upma",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Little millet cooks quickly; do not overcook or it gets mushy.",
"note_ta": "சாமை சீக்கிரம் வேகும்; அதிகம் வேகவைத்தால் குழைந்துவிடும்.",
"ingredients": [
{
"n": "Little millet (samai)",
"t": "சாமை",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion, carrot, beans (chopped)",
"t": "வெங்காயம், காய்கறிகள்",
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
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Ginger, grated",
"t": "இஞ்சி",
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
"e": "Rinse the millet and drain well.",
"t": "சாமையைக் கழுவி நன்கு வடிக்கவும்."
},
{
"e": "Temper mustard, urad dal, chilli and ginger; fry the onion and vegetables with salt.",
"t": "கடுகு, உளுத்தம்பருப்பு, மிளகாய், இஞ்சி தாளித்து வெங்காயம், காய்கறிகளை உப்புடன் வதக்கவும்."
},
{
"e": "Add the millet and 2 cups of water, cover and cook on low for 12 minutes. Fluff and serve.",
"t": "சாமையையும் 2 கப் தண்ணீரையும் சேர்த்து மூடி குறைந்த தீயில் 12 நிமிடம் வேகவைத்து கிளறிப் பரிமாறவும்."
}
]
},
{
"dish": "Kuzhi paniyaram",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Use leftover idli or dosa batter.",
"note_ta": "மீதமான இட்லி அல்லது தோசை மாவைப் பயன்படுத்தலாம்.",
"ingredients": [
{
"n": "Idli or dosa batter",
"t": "இட்லி மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Onion, finely chopped",
"t": "வெங்காயம்",
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
"n": "Mustard seeds",
"t": "கடுகு",
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
"e": "Temper the mustard, chilli, curry leaves and onion in a little oil and mix into the batter with salt.",
"t": "சிறிது எண்ணெயில் கடுகு, மிளகாய், கறிவேப்பிலை, வெங்காயம் தாளித்து உப்புடன் மாவில் கலக்கவும்."
},
{
"e": "Heat the paniyaram pan, add a few drops of oil to each hollow and fill two-thirds with batter.",
"t": "பணியாரக் கல்லைச் சூடாக்கி ஒவ்வொரு குழியிலும் சில துளி எண்ணெய் விட்டு மூன்றில் இரண்டு பங்கு மாவு ஊற்றவும்."
},
{
"e": "Cook on low until golden underneath, turn and cook the other side. Serve with chutney.",
"t": "குறைந்த தீயில் அடிப்பக்கம் பொன்னிறமானதும் திருப்பி மறுபக்கம் வேகவிட்டு சட்னியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Idiyappam",
"servings": 4,
"prep": 20,
"cook": 10,
"note": "Use hot water and mix with a spoon first; the dough is hot to touch.",
"note_ta": "சூடான தண்ணீரை முதலில் கரண்டியால் கலக்கவும்; மாவு சூடாக இருக்கும்.",
"ingredients": [
{
"n": "Idiyappam flour (rice flour)",
"t": "இடியாப்ப மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Hot water",
"t": "சூடான தண்ணீர்",
"q": 2.25,
"u": "cup"
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
"e": "Mix the flour, salt and oil, then stir in the hot water to form a soft dough.",
"t": "மாவு, உப்பு, எண்ணெய் கலந்து சூடான தண்ணீர் சேர்த்து மென்மையான மாவாகப் பிசையவும்."
},
{
"e": "Fill a sev press with dough and press circles onto greased idli plates.",
"t": "சேவை நாழியில் மாவை நிரப்பி எண்ணெய் தடவிய இட்லித் தட்டுகளில் வட்டமாகப் பிழியவும்."
},
{
"e": "Steam for 8 to 10 minutes. Serve with coconut milk, sugar, stew or kurma.",
"t": "8 முதல் 10 நிமிடம் ஆவியில் வேகவிடவும். தேங்காய்ப்பால், சர்க்கரை, ஸ்டூ அல்லது குருமாவுடன் பரிமாறவும்."
}
]
},
{
"dish": "Poori",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Roll evenly and keep the oil hot so the pooris puff.",
"note_ta": "சமமாகத் தேய்த்து எண்ணெயை நன்கு சூடாக வைத்தால் பூரி பொங்கும்.",
"ingredients": [
{
"n": "Wheat flour",
"t": "கோதுமை மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Rava (fine semolina)",
"t": "ரவை",
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
"e": "Mix the flour, rava and salt, and knead a stiff dough with water. Rest for 20 minutes.",
"t": "மாவு, ரவை, உப்பை கலந்து தண்ணீர் விட்டு கெட்டியாகப் பிசைந்து 20 நிமிடம் ஊறவிடவும்."
},
{
"e": "Make small balls and roll into 4-inch rounds.",
"t": "சிறு உருண்டைகளாக்கி 4 அங்குல வட்டங்களாகத் தேய்க்கவும்."
},
{
"e": "Fry in hot oil, pressing gently so it puffs, until golden on both sides. Drain and serve with potato masala.",
"t": "சூடான எண்ணெயில் மெதுவாக அழுத்தி பொங்கவிட்டு இருபுறமும் பொன்னிறமாகப் பொரிக்கவும். வடித்து உருளைக்கிழங்கு மசாலாவுடன் பரிமாறவும்."
}
]
},
{
"dish": "Sambar vada",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Soak the fried vadas in warm sambar for 5 minutes for a soft, juicy bite.",
"note_ta": "வறுத்த வடைகளை சூடான சாம்பாரில் 5 நிமிடம் ஊறவைத்தால் மென்மையாக ருசியாக இருக்கும்.",
"ingredients": [
{
"n": "Medu vadas",
"t": "மெதுவடை",
"q": 8.0,
"u": "piece"
},
{
"n": "Sambar",
"t": "சாம்பார்",
"q": 3.0,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 1.0,
"u": "handful"
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
"e": "Make the medu vadas and fry until golden (or use ready-made ones).",
"t": "மெதுவடைகளைச் செய்து பொன்னிறமாகப் பொரிக்கவும் (அல்லது தயாராக உள்ளவற்றைப் பயன்படுத்தவும்)."
},
{
"e": "Heat the sambar and add the vadas for 5 minutes.",
"t": "சாம்பாரைச் சூடாக்கி வடைகளை 5 நிமிடம் ஊறவிடவும்."
},
{
"e": "Serve in bowls topped with onion, coriander and a little ghee.",
"t": "கிண்ணங்களில் வெங்காயம், கொத்தமல்லி, சிறிது நெய் மேலே தூவிப் பரிமாறவும்."
}
]
},
{
"dish": "Thayir vada",
"servings": 4,
"prep": 15,
"cook": 10,
"note": "Use thick, fresh curd and chill before serving.",
"note_ta": "கெட்டியான புதிய தயிரைப் பயன்படுத்தி குளிர வைத்துப் பரிமாறவும்.",
"ingredients": [
{
"n": "Medu vadas",
"t": "மெதுவடை",
"q": 8.0,
"u": "piece"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 2.0,
"u": "cup"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 0.5,
"u": "tsp"
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
"e": "Soak the fried vadas in warm salted water for 2 minutes and press out the water gently.",
"t": "பொரித்த வடைகளை சூடான உப்புத் தண்ணீரில் 2 நிமிடம் ஊறவைத்து மெதுவாகப் பிழியவும்."
},
{
"e": "Whisk the curd with salt and chopped chilli and pour over the vadas.",
"t": "தயிரை உப்பு, நறுக்கிய மிளகாயுடன் அடித்து வடைகள் மேல் ஊற்றவும்."
},
{
"e": "Temper the mustard, pour over, garnish with coriander and chill.",
"t": "கடுகு தாளித்து ஊற்றி கொத்தமல்லி தூவி குளிரவைக்கவும்."
}
]
},
{
"dish": "Pazhaya sadam",
"servings": 2,
"prep": 5,
"cook": 0,
"note": "Soak cooked rice overnight in water; add curd and salt in the morning.",
"note_ta": "சாதத்தை இரவு முழுவதும் தண்ணீரில் ஊறவைத்து காலையில் தயிர், உப்பு சேர்க்கவும்.",
"ingredients": [
{
"n": "Cooked rice",
"t": "சாதம்",
"q": 2.0,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 2.0,
"u": "cup"
},
{
"n": "Curd or buttermilk",
"t": "தயிர்",
"q": 0.5,
"u": "cup"
},
{
"n": "Shallots",
"t": "சின்ன வெங்காயம்",
"q": 6.0,
"u": "piece"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
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
"e": "The night before, soak the cooked rice in water in a clay or steel pot and keep it covered.",
"t": "முதல் நாள் இரவு சாதத்தை மண் அல்லது எவர்சில்வர் பாத்திரத்தில் தண்ணீரில் ஊறவைத்து மூடி வைக்கவும்."
},
{
"e": "In the morning, mash the rice lightly in its water and mix in the curd and salt.",
"t": "காலையில் சாதத்தை தண்ணீரோடு லேசாக மசித்து தயிர், உப்பு கலக்கவும்."
},
{
"e": "Serve with shallots, green chilli and a pickle or fried fish.",
"t": "சின்ன வெங்காயம், பச்சை மிளகாய், ஊறுகாய் அல்லது மீன் வறுவலுடன் பரிமாறவும்."
}
]
},
{
"dish": "Mor kali",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Stir constantly so no lumps form.",
"note_ta": "கட்டி விழாமல் தொடர்ந்து கிளறவும்.",
"ingredients": [
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Sour buttermilk",
"t": "புளித்த மோர்",
"q": 2.5,
"u": "cup"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
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
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
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
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
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
"e": "Whisk the rice flour with the buttermilk and salt until smooth.",
"t": "அரிசி மாவை மோர், உப்புடன் கட்டியின்றி கலக்கவும்."
},
{
"e": "Temper mustard, urad dal, chilli and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, உளுத்தம்பருப்பு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Pour in the buttermilk mixture and stir on medium heat until it thickens into a soft mass, about 10 minutes.",
"t": "மோர் கலவையை ஊற்றி நடுத்தரத் தீயில் மென்மையான கட்டியாகும் வரை சுமார் 10 நிமிடம் கிளறவும்."
},
{
"e": "Serve hot with pickle or thokku.",
"t": "சூடாக ஊறுகாய் அல்லது தொக்குடன் பரிமாறவும்."
}
]
},
{
"dish": "Thinai pongal",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Foxtail millet pongal tastes best with sambar and chutney.",
"note_ta": "தினை பொங்கல் சாம்பார், சட்னியுடன் நன்றாக இருக்கும்.",
"ingredients": [
{
"n": "Foxtail millet (thinai)",
"t": "தினை",
"q": 1.0,
"u": "cup"
},
{
"n": "Moong dal",
"t": "பாசிப்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Pepper and cumin",
"t": "மிளகு, சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ginger, grated",
"t": "இஞ்சி",
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
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
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
"e": "Dry roast the moong dal lightly, then pressure cook with the millet and 4 cups of water until soft.",
"t": "பாசிப்பருப்பை லேசாக வறுத்து தினையுடன் 4 கப் தண்ணீர் சேர்த்து குழைய வேகவிடவும்."
},
{
"e": "Heat the ghee, fry the pepper, cumin, ginger, cashews and curry leaves.",
"t": "நெய்யில் மிளகு, சீரகம், இஞ்சி, முந்திரி, கறிவேப்பிலை வறுக்கவும்."
},
{
"e": "Mix into the cooked millet with salt and mash gently. Serve hot.",
"t": "வெந்த தினையில் உப்புடன் கலந்து லேசாக மசித்துச் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Ragi roti",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Pat the roti with wet fingers on a banana leaf or plastic sheet.",
"note_ta": "ஈரக்கையால் வாழை இலை அல்லது பிளாஸ்டிக் தாளில் தட்டவும்.",
"ingredients": [
{
"n": "Ragi flour",
"t": "ராகி மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Onion, finely chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
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
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Mix the flour with the onion, coconut, chilli, leaves and salt.",
"t": "மாவை வெங்காயம், தேங்காய், மிளகாய், இலைகள், உப்புடன் கலக்கவும்."
},
{
"e": "Add warm water gradually and knead a soft dough.",
"t": "வெதுவெதுப்பான தண்ணீரை சிறிது சிறிதாகச் சேர்த்து மென்மையாகப் பிசையவும்."
},
{
"e": "Pat out thin rounds by hand and cook on a hot tawa with a little oil until brown spots appear on both sides.",
"t": "கையால் மெல்லியதாகத் தட்டி சூடான தவாவில் எண்ணெய் விட்டு இருபுறமும் புள்ளிகள் வரும் வரை வேகவிடவும்."
}
]
},
{
"dish": "Akki roti",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Use warm water so the dough binds well.",
"note_ta": "வெதுவெதுப்பான தண்ணீரால் மாவு நன்கு சேரும்.",
"ingredients": [
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
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
"n": "Dill or coriander leaves",
"t": "கொத்தமல்லி",
"q": 1.0,
"u": "handful"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
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
"q": 3.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Mix the flour with the onion, coconut, chilli, leaves, cumin and salt.",
"t": "மாவை வெங்காயம், தேங்காய், மிளகாய், இலை, சீரகம், உப்புடன் கலக்கவும்."
},
{
"e": "Add warm water and knead into a soft dough.",
"t": "வெதுவெதுப்பான தண்ணீர் சேர்த்து மென்மையாகப் பிசையவும்."
},
{
"e": "Pat a ball on a greased sheet into a thin round, lay it on a hot tawa and cook with oil on both sides until golden.",
"t": "எண்ணெய் தடவிய தாளில் உருண்டையை மெல்லிய வட்டமாகத் தட்டி சூடான தவாவில் எண்ணெய் விட்டு இருபுறமும் பொன்னிறமாக வேகவிடவும்."
}
]
},
{
"dish": "Vangi bath",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Brinjal can be replaced with other vegetables.",
"note_ta": "கத்தரிக்காயை மற்ற காய்கறிகளாலும் மாற்றலாம்.",
"ingredients": [
{
"n": "Cooked rice",
"t": "வேகவைத்த சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Brinjal, cut long",
"t": "கத்தரிக்காய்",
"q": 250.0,
"u": "g"
},
{
"n": "Vangi bath powder",
"t": "வாங்கி பாத் பொடி",
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
"n": "Peanuts",
"t": "வேர்க்கடலை",
"q": 2.0,
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
"e": "Heat the oil, splutter the mustard, fry the peanuts and curry leaves.",
"t": "எண்ணெயில் கடுகு தாளித்து வேர்க்கடலை, கறிவேப்பிலை வறுக்கவும்."
},
{
"e": "Add the brinjal with salt and a splash of water; cook covered until soft.",
"t": "கத்தரிக்காயை உப்பு, சிறிது தண்ணீருடன் சேர்த்து மூடி மென்மையாக வேகவிடவும்."
},
{
"e": "Stir in the vangi bath powder, then fold in the rice gently and heat through.",
"t": "வாங்கி பாத் பொடியைச் சேர்த்து சாதத்தை மெதுவாகக் கலந்து சூடாக்கவும்."
}
]
},
{
"dish": "Veechu parotta",
"servings": 4,
"prep": 90,
"cook": 20,
"note": "Rest the oiled dough balls for at least 1 hour; this is what makes the layers.",
"note_ta": "எண்ணெய் தடவிய மாவு உருண்டைகளை குறைந்தது 1 மணி நேரம் ஊறவிட்டால் அடுக்குகள் கிடைக்கும்.",
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
"e": "Knead the maida with salt, sugar, milk and water into a very soft dough; coat with oil and rest 30 minutes.",
"t": "மைதாவை உப்பு, சர்க்கரை, பால், தண்ணீருடன் மிகவும் மென்மையாகப் பிசைந்து எண்ணெய் தடவி 30 நிமிடம் ஊறவிடவும்."
},
{
"e": "Divide into balls, soak them in oil and rest for 1 hour.",
"t": "உருண்டைகளாக்கி எண்ணெயில் ஊறவைத்து 1 மணி நேரம் வைக்கவும்."
},
{
"e": "Stretch each ball very thin on an oiled surface, fold into a square layer by layer and flatten gently.",
"t": "எண்ணெய் தடவிய மேடையில் ஒவ்வொரு உருண்டையையும் மிக மெல்லியதாக இழுத்து அடுக்கடுக்காக சதுரமாக மடித்து மெதுவாகத் தட்டவும்."
},
{
"e": "Cook on a hot tawa with oil until golden, then crush gently to separate the layers.",
"t": "சூடான தவாவில் எண்ணெய் விட்டு பொன்னிறமாக வேகவைத்து அடுக்குகள் பிரிய மெதுவாக அடிக்கவும்."
}
]
},
{
"dish": "Chilli parotta",
"servings": 3,
"prep": 15,
"cook": 15,
"note": "Use parottas from the day before; they absorb the sauce better.",
"note_ta": "முதல் நாள் பரோட்டாவைப் பயன்படுத்தினால் சாஸை நன்கு உறிஞ்சும்.",
"ingredients": [
{
"n": "Parotta, torn in pieces",
"t": "பரோட்டா",
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
"n": "Capsicum, sliced",
"t": "குடைமிளகாய்",
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
"n": "Soy sauce",
"t": "சோயா சாஸ்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Tomato sauce",
"t": "தக்காளி சாஸ்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli sauce",
"t": "மிளகாய் சாஸ்",
"q": 1.0,
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
"e": "Heat the oil and fry the ginger-garlic paste, onion and capsicum on high heat for 2 minutes.",
"t": "எண்ணெயில் இஞ்சி பூண்டு விழுது, வெங்காயம், குடைமிளகாயை அதிக தீயில் 2 நிமிடம் வதக்கவும்."
},
{
"e": "Add the soy, tomato and chilli sauces and a pinch of salt.",
"t": "சோயா, தக்காளி, மிளகாய் சாஸ்கள், சிறிது உப்பு சேர்க்கவும்."
},
{
"e": "Toss in the parotta pieces until well coated and crisp at the edges. Serve hot.",
"t": "பரோட்டா துண்டுகளைச் சேர்த்து சாஸ் படிந்து ஓரங்கள் மொறுமொறுக்கும் வரை புரட்டிச் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Ragi koozh",
"servings": 4,
"prep": 5,
"cook": 15,
"note": "Serve cool, topped with shallots and a pinch of salt in the summer.",
"note_ta": "கோடையில் சின்ன வெங்காயம், சிறிது உப்புடன் குளிர்ச்சியாகப் பரிமாறவும்.",
"ingredients": [
{
"n": "Ragi flour",
"t": "ராகி மாவு",
"q": 0.5,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 3.0,
"u": "cup"
},
{
"n": "Buttermilk",
"t": "மோர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Shallots, chopped",
"t": "சின்ன வெங்காயம்",
"q": 4.0,
"u": "piece"
}
],
"steps": [
{
"e": "Mix the ragi flour with 1 cup of water into a smooth paste with no lumps.",
"t": "ராகி மாவை 1 கப் தண்ணீருடன் கட்டியின்றி கரைக்கவும்."
},
{
"e": "Boil 2 cups of water, add the paste and stir on low heat for 8 to 10 minutes until thick and glossy.",
"t": "2 கப் தண்ணீரைக் கொதிக்கவிட்டு கரைத்த மாவை ஊற்றி குறைந்த தீயில் 8 முதல் 10 நிமிடம் கெட்டியாகும் வரை கிளறவும்."
},
{
"e": "Cool, whisk in the buttermilk and salt, and serve with shallots.",
"t": "ஆறவிட்டு மோர், உப்பு கலந்து சின்ன வெங்காயத்துடன் பரிமாறவும்."
}
]
},
{
"dish": "Kambu koozh",
"servings": 4,
"prep": 5,
"cook": 15,
"note": "Soaking the flour overnight gives a naturally cooling drink.",
"note_ta": "மாவை இரவு ஊறவைத்தால் இயற்கையாகக் குளிர்ச்சி தரும்.",
"ingredients": [
{
"n": "Pearl millet flour (kambu)",
"t": "கம்பு மாவு",
"q": 0.5,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 3.0,
"u": "cup"
},
{
"n": "Buttermilk",
"t": "மோர்",
"q": 1.0,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
},
{
"n": "Green chilli (optional)",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
}
],
"steps": [
{
"e": "Mix the flour with a cup of water to a smooth paste.",
"t": "மாவை 1 கப் தண்ணீருடன் கட்டியின்றி கரைக்கவும்."
},
{
"e": "Boil the rest of the water, pour in the paste and stir on low heat until it thickens, about 10 minutes.",
"t": "மீதமுள்ள தண்ணீரைக் கொதிக்கவிட்டு கரைத்த மாவை ஊற்றி குறைந்த தீயில் சுமார் 10 நிமிடம் கெட்டியாகும் வரை கிளறவும்."
},
{
"e": "Cool, mix with buttermilk and salt and serve.",
"t": "ஆறவிட்டு மோர், உப்பு கலந்து பரிமாறவும்."
}
]
},
{
"dish": "Ragi mudde",
"servings": 4,
"prep": 5,
"cook": 20,
"note": "Eat with sambar or a spicy curry; swallow in small pieces.",
"note_ta": "சாம்பார் அல்லது காரக் குழம்புடன் சிறு துண்டுகளாக விழுங்கி உண்ணவும்.",
"ingredients": [
{
"n": "Ragi flour",
"t": "ராகி மாவு",
"q": 1.5,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
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
"n": "Ghee",
"t": "நெய்",
"q": 1.0,
"u": "tsp"
}
],
"steps": [
{
"e": "Bring the water and salt to a boil and sprinkle in half the ragi flour; cook for 2 minutes without stirring.",
"t": "தண்ணீர், உப்பைக் கொதிக்கவிட்டு பாதி ராகி மாவைத் தூவி கிளறாமல் 2 நிமிடம் வேகவிடவும்."
},
{
"e": "Add the rest of the flour, stir hard with a wooden spoon to break the lumps and cook on low for 8 minutes.",
"t": "மீதமுள்ள மாவைச் சேர்த்து மரக்கரண்டியால் கட்டிகளை உடைத்து அழுத்திக் கிளறி குறைந்த தீயில் 8 நிமிடம் வேகவிடவும்."
},
{
"e": "With wet hands, shape into balls, brush with ghee and serve hot.",
"t": "ஈரக்கையால் உருண்டைகளாக்கி நெய் தடவிச் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Ulundu kali",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Serve warm with a spoon of sesame oil on top.",
"note_ta": "வெதுவெதுப்பாக மேலே நல்லெண்ணெய் ஊற்றிப் பரிமாறவும்.",
"ingredients": [
{
"n": "Black urad dal with skin",
"t": "கருப்பு உளுந்து",
"q": 0.5,
"u": "cup"
},
{
"n": "Raw rice",
"t": "பச்சரிசி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 0.5,
"u": "cup"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
}
],
"steps": [
{
"e": "Dry roast the urad dal and rice separately and grind to a fine flour.",
"t": "உளுந்து, அரிசியைத் தனித்தனியாக வறுத்து நைசாக மாவாக அரைக்கவும்."
},
{
"e": "Melt the jaggery in a little water, strain and boil.",
"t": "வெல்லத்தை சிறிது தண்ணீரில் கரைத்து வடிகட்டிக் கொதிக்கவிடவும்."
},
{
"e": "Add the flour with 1.5 cups of water, stir continuously on low heat until it thickens, adding sesame oil as it cooks.",
"t": "மாவையும் 1.5 கப் தண்ணீரையும் சேர்த்து குறைந்த தீயில் கிளறி, நல்லெண்ணெய் சேர்த்தபடி கெட்டியாகும் வரை சமைக்கவும்."
},
{
"e": "Add cardamom and serve warm.",
"t": "ஏலக்காய் தூள் சேர்த்து வெதுவெதுப்பாகப் பரிமாறவும்."
}
]
},
{
"dish": "Sakkarai pongal",
"servings": 4,
"prep": 10,
"cook": 30,
"note": "Cook the rice and dal very soft before adding the jaggery syrup.",
"note_ta": "வெல்லப் பாகு சேர்க்கும் முன் அரிசியையும் பருப்பையும் நன்கு குழைய வேகவிடவும்.",
"ingredients": [
{
"n": "Raw rice",
"t": "பச்சரிசி",
"q": 0.75,
"u": "cup"
},
{
"n": "Moong dal",
"t": "பாசிப்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
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
"n": "Ghee",
"t": "நெய்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Cashew nuts and raisins",
"t": "முந்திரி, திராட்சை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
}
],
"steps": [
{
"e": "Dry roast the dal, then cook with the rice, milk and 2 cups of water until very soft.",
"t": "பருப்பை வறுத்து அரிசியுடன் பால், 2 கப் தண்ணீர் சேர்த்து மிகவும் குழைய வேகவிடவும்."
},
{
"e": "Melt the jaggery in a little water, strain and simmer for 3 minutes.",
"t": "வெல்லத்தை சிறிது தண்ணீரில் கரைத்து வடிகட்டி 3 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Mash the rice, add the syrup and cook on low for 5 minutes, stirring.",
"t": "சாதத்தை மசித்து பாகு சேர்த்து குறைந்த தீயில் கிளறியபடி 5 நிமிடம் சமைக்கவும்."
},
{
"e": "Fry the cashews and raisins in ghee, add with the cardamom and the remaining ghee.",
"t": "நெய்யில் முந்திரி, திராட்சையை வறுத்து ஏலக்காய், மீதமுள்ள நெய்யுடன் சேர்க்கவும்."
}
]
},
{
"dish": "Sukku malli coffee",
"servings": 4,
"prep": 5,
"cook": 10,
"note": "Good for colds; add a little palm jaggery to sweeten.",
"note_ta": "சளிக்கு நல்லது; இனிப்புக்கு சிறிது கருப்பட்டி சேர்க்கவும்.",
"ingredients": [
{
"n": "Dry ginger powder (sukku)",
"t": "சுக்குப் பொடி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Coriander seeds",
"t": "மல்லி விதை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Pepper",
"t": "மிளகு",
"q": 0.5,
"u": "tsp"
},
{
"n": "Cardamom",
"t": "ஏலக்காய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Palm jaggery",
"t": "கருப்பட்டி",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 4.0,
"u": "cup"
}
],
"steps": [
{
"e": "Lightly crush the coriander seeds, pepper and cardamom.",
"t": "மல்லி விதை, மிளகு, ஏலக்காயை லேசாக இடிக்கவும்."
},
{
"e": "Boil with the water, dry ginger and jaggery for 8 to 10 minutes.",
"t": "தண்ணீர், சுக்கு, கருப்பட்டியுடன் 8 முதல் 10 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Strain and serve hot.",
"t": "வடிகட்டிச் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Badam milk",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Soak the almonds for 4 hours to peel easily.",
"note_ta": "பாதாமை 4 மணி நேரம் ஊறவைத்தால் தோல் எளிதாக உரியும்.",
"ingredients": [
{
"n": "Milk",
"t": "பால்",
"q": 4.0,
"u": "cup"
},
{
"n": "Almonds",
"t": "பாதாம்",
"q": 20.0,
"u": "piece"
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
"q": 0.5,
"u": "tsp"
},
{
"n": "Saffron strands",
"t": "குங்குமப்பூ",
"q": 1.0,
"u": "pinch"
}
],
"steps": [
{
"e": "Soak, peel and grind the almonds with a little milk to a smooth paste.",
"t": "பாதாமை ஊறவைத்து தோல் நீக்கி சிறிது பாலுடன் நைசாக அரைக்கவும்."
},
{
"e": "Boil the remaining milk, add the paste, sugar and saffron, and simmer for 8 minutes.",
"t": "மீதமுள்ள பாலைக் கொதிக்கவிட்டு விழுது, சர்க்கரை, குங்குமப்பூ சேர்த்து 8 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the cardamom and serve warm or chilled.",
"t": "ஏலக்காய் தூள் சேர்த்து சூடாகவோ குளிரவைத்தோ பரிமாறவும்."
}
]
},
{
"dish": "Paper roast",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Spread the batter as thin as you can; it should shatter when you break it.",
"note_ta": "மாவை முடிந்தவரை மெல்லியதாகப் பரப்பவும்; உடைக்கும்போது மொறுமொறுவென உடைய வேண்டும்.",
"ingredients": [
{
"n": "Dosa batter",
"t": "தோசை மாவு",
"q": 3.0,
"u": "cup"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Ghee or oil",
"t": "நெய்",
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
"e": "Thin the batter with a little water and stir in the rice flour and salt.",
"t": "மாவை சிறிது தண்ணீரில் இளக்கி அரிசி மாவு, உப்பு சேர்த்துக் கலக்கவும்."
},
{
"e": "Pour a ladle on a very hot tawa and spread in thin circles to make a large, wide dosa.",
"t": "மிகவும் சூடான தவாவில் ஒரு கரண்டி மாவை ஊற்றி மெல்லிய வட்டங்களாகப் பரப்பி பெரிய அகன்ற தோசையாக்கவும்."
},
{
"e": "Drizzle ghee all over and cook on medium heat until deep golden and crisp. Roll and serve with chutney and sambar.",
"t": "நெய்யை முழுவதும் தெளித்து நடுத்தரத் தீயில் அடர் பொன்னிறமாக மொறுமொறுப்பாக வேகவிடவும். சுருட்டி சட்னி, சாம்பாருடன் பரிமாறவும்."
}
]
},
{
"dish": "Pidi kozhukattai",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Salted and sweet versions both use the same dough shaped by hand.",
"note_ta": "உப்பு, இனிப்பு இரண்டுக்கும் ஒரே மாவு; கையால் பிடித்து வடிவமைக்கவும்.",
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
"q": 1.25,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 0.5,
"u": "tsp"
},
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 2.0,
"u": "piece"
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
"e": "Temper mustard, urad dal and chilli in oil, add the water and salt and boil.",
"t": "எண்ணெயில் கடுகு, உளுத்தம்பருப்பு, மிளகாய் தாளித்து தண்ணீர், உப்பு சேர்த்துக் கொதிக்கவிடவும்."
},
{
"e": "Lower the heat, add the coconut and slowly stir in the rice flour until it forms a soft dough.",
"t": "தீயைக் குறைத்து தேங்காய் சேர்த்து அரிசி மாவை மெதுவாகக் கிளறி மென்மையான மாவாக்கவும்."
},
{
"e": "When warm, press small portions in your palm to make finger-shaped pieces.",
"t": "வெதுவெதுப்பாக இருக்கும்போது சிறு உருண்டைகளை உள்ளங்கையில் அழுத்தி விரல் வடிவில் பிடிக்கவும்."
},
{
"e": "Steam for 10 minutes and serve warm.",
"t": "10 நிமிடம் ஆவியில் வேகவைத்து சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Paal kozhukattai",
"servings": 4,
"prep": 20,
"cook": 20,
"note": "Cook the balls gently in the milk; do not boil hard or they break.",
"note_ta": "உருண்டைகளை பாலில் மெதுவாக வேகவிடவும்; வேகமாகக் கொதித்தால் உடைந்துவிடும்.",
"ingredients": [
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Hot water",
"t": "சூடான தண்ணீர்",
"q": 0.75,
"u": "cup"
},
{
"n": "Milk",
"t": "பால்",
"q": 2.0,
"u": "cup"
},
{
"n": "Coconut milk",
"t": "தேங்காய்ப் பால்",
"q": 0.5,
"u": "cup"
},
{
"n": "Jaggery or sugar",
"t": "வெல்லம்",
"q": 0.5,
"u": "cup"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
}
],
"steps": [
{
"e": "Knead the rice flour with hot water and a pinch of salt into a soft dough and roll into small balls.",
"t": "அரிசி மாவை சிறிது உப்புடன் சூடான தண்ணீரால் மென்மையாகப் பிசைந்து சிறிய உருண்டைகளாக்கவும்."
},
{
"e": "Boil the milk with 1 cup of water, drop in the balls and simmer for 10 minutes until they float.",
"t": "பாலை 1 கப் தண்ணீருடன் கொதிக்கவிட்டு உருண்டைகளைப் போட்டு மிதக்கும் வரை 10 நிமிடம் வேகவிடவும்."
},
{
"e": "Add the jaggery syrup, coconut milk and cardamom, warm through and serve.",
"t": "வெல்லப் பாகு, தேங்காய்ப்பால், ஏலக்காய் சேர்த்து சூடாக்கிப் பரிமாறவும்."
}
]
},
{
"dish": "Aloo bonda",
"servings": 4,
"prep": 20,
"cook": 20,
"note": "Make sure the potato filling is cool before dipping in batter.",
"note_ta": "உருளைக்கிழங்கு பூரணம் ஆறிய பின் மாவில் முக்கவும்.",
"ingredients": [
{
"n": "Potatoes, boiled",
"t": "உருளைக்கிழங்கு",
"q": 3.0,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
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
"n": "Oil for frying",
"t": "பொரிக்க எண்ணெய்",
"q": null,
"u": "as_needed"
}
],
"steps": [
{
"e": "Temper mustard, onion, ginger, chilli and turmeric; mix with the mashed potato and salt and shape into balls.",
"t": "கடுகு, வெங்காயம், இஞ்சி, மிளகாய், மஞ்சள் தாளித்து மசித்த உருளைக்கிழங்கு, உப்புடன் கலந்து உருண்டைகளாக்கவும்."
},
{
"e": "Whisk the gram flour, rice flour and salt with water into a thick batter.",
"t": "கடலை மாவு, அரிசி மாவு, உப்பை தண்ணீருடன் கெட்டியான மாவாகக் கலக்கவும்."
},
{
"e": "Dip the balls in the batter and fry in hot oil until golden.",
"t": "உருண்டைகளை மாவில் முக்கி சூடான எண்ணெயில் பொன்னிறமாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Masala vadai",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Grind the dal coarsely, with no water at all.",
"note_ta": "பருப்பை தண்ணீர் விடாமல் கொரகொரப்பாக அரைக்கவும்.",
"ingredients": [
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Fennel seeds",
"t": "சோம்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ginger, chopped",
"t": "இஞ்சி",
"q": 1.0,
"u": "tsp"
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
"e": "Soak the dal for 2 hours, drain and grind coarsely with the chillies, fennel and salt.",
"t": "பருப்பை 2 மணி நேரம் ஊறவைத்து வடித்து மிளகாய், சோம்பு, உப்புடன் கொரகொரப்பாக அரைக்கவும்."
},
{
"e": "Mix in the onion, ginger and leaves.",
"t": "வெங்காயம், இஞ்சி, இலைகளைக் கலக்கவும்."
},
{
"e": "Flatten small balls into discs and fry in hot oil until crisp and golden.",
"t": "சிறு உருண்டைகளை தட்டையாக்கி சூடான எண்ணெயில் மொறுமொறுப்பாக பொன்னிறமாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Keerai vadai",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Any greens such as spinach or amaranth work.",
"note_ta": "பசலை, தண்டுக்கீரை போன்ற எந்தக் கீரையும் பயன்படுத்தலாம்.",
"ingredients": [
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 1.0,
"u": "cup"
},
{
"n": "Spinach or amaranth leaves, chopped",
"t": "கீரை",
"q": 2.0,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Fennel seeds",
"t": "சோம்பு",
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
"e": "Soak the dal for 2 hours, drain and grind coarsely with the chillies, fennel and salt.",
"t": "பருப்பை 2 மணி நேரம் ஊறவைத்து வடித்து மிளகாய், சோம்பு, உப்புடன் கொரகொரப்பாக அரைக்கவும்."
},
{
"e": "Mix in the greens and onion.",
"t": "கீரை, வெங்காயம் சேர்த்துக் கலக்கவும்."
},
{
"e": "Shape into discs and fry in hot oil on medium heat until crisp.",
"t": "தட்டைகளாக்கி நடுத்தரத் தீயில் சூடான எண்ணெயில் மொறுமொறுப்பாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Vazhaipoo vadai",
"servings": 4,
"prep": 25,
"cook": 20,
"note": "Clean the banana flower in buttermilk water to avoid blackening.",
"note_ta": "வாழைப்பூ கருப்பாகாமல் இருக்க மோர்த் தண்ணீரில் சுத்தம் செய்யவும்.",
"ingredients": [
{
"n": "Banana flower, cleaned and chopped",
"t": "வாழைப்பூ",
"q": 1.0,
"u": "cup"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Fennel seeds",
"t": "சோம்பு",
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
"e": "Soak the dal for 2 hours, drain and grind coarsely with the chillies, fennel and salt.",
"t": "பருப்பை 2 மணி நேரம் ஊறவைத்து வடித்து மிளகாய், சோம்பு, உப்புடன் கொரகொரப்பாக அரைக்கவும்."
},
{
"e": "Mix in the chopped banana flower and onion.",
"t": "நறுக்கிய வாழைப்பூ, வெங்காயம் சேர்த்துக் கலக்கவும்."
},
{
"e": "Shape into discs and fry until golden and cooked through.",
"t": "தட்டைகளாக்கி பொன்னிறமாக உள்ளே வேகும் வரை பொரிக்கவும்."
}
]
},
{
"dish": "Onion pakoda",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Do not add water to the batter; the onion releases enough.",
"note_ta": "மாவில் தண்ணீர் சேர்க்க வேண்டாம்; வெங்காயத்தில் இருந்தே போதுமான நீர் வரும்.",
"ingredients": [
{
"n": "Onions, thinly sliced",
"t": "வெங்காயம்",
"q": 3.0,
"u": "piece"
},
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 0.75,
"u": "cup"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Green chilli, chopped",
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
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
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
"e": "Mix the sliced onions with salt and let them rest for 10 minutes.",
"t": "வெங்காயத்தை உப்புடன் கலந்து 10 நிமிடம் வைக்கவும்."
},
{
"e": "Add the flours, chilli, chilli powder and curry leaves and mix to a crumbly batter.",
"t": "மாவுகள், மிளகாய், மிளகாய்த் தூள், கறிவேப்பிலை சேர்த்து உதிரியாகக் கலக்கவும்."
},
{
"e": "Drop small portions into hot oil and fry on medium heat until crisp and golden.",
"t": "சிறு பகுதிகளாக சூடான எண்ணெயில் போட்டு நடுத்தரத் தீயில் மொறுமொறுப்பாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Banana bajji",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Use firm raw bananas and slice them thin.",
"note_ta": "கெட்டியான வாழைக்காயை மெல்லியதாக நறுக்கவும்.",
"ingredients": [
{
"n": "Raw banana",
"t": "வாழைக்காய்",
"q": 2.0,
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
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Asafoetida",
"t": "பெருங்காயம்",
"q": 1.0,
"u": "pinch"
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
"e": "Peel the bananas and slice lengthwise into thin strips.",
"t": "வாழைக்காயின் தோலை நீக்கி நீளவாக்கில் மெல்லிய துண்டுகளாக நறுக்கவும்."
},
{
"e": "Whisk the flours, chilli powder, asafoetida and salt with water into a thick coating batter.",
"t": "மாவுகள், மிளகாய்த் தூள், பெருங்காயம், உப்பை தண்ணீருடன் கெட்டியான மாவாகக் கலக்கவும்."
},
{
"e": "Dip the slices and fry in hot oil until golden. Serve with chutney.",
"t": "துண்டுகளை மாவில் முக்கி சூடான எண்ணெயில் பொன்னிறமாகப் பொரித்து சட்னியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Potato bajji",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Slice potatoes thin so they cook through.",
"note_ta": "உருளைக்கிழங்கை மெல்லியதாக நறுக்கினால் நன்கு வேகும்.",
"ingredients": [
{
"n": "Potatoes, thinly sliced",
"t": "உருளைக்கிழங்கு",
"q": 3.0,
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
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Asafoetida",
"t": "பெருங்காயம்",
"q": 1.0,
"u": "pinch"
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
"e": "Mix the flours, chilli powder, asafoetida and salt with water into a thick batter.",
"t": "மாவுகள், மிளகாய்த் தூள், பெருங்காயம், உப்பை தண்ணீருடன் கெட்டியான மாவாகக் கலக்கவும்."
},
{
"e": "Dip each potato slice in the batter.",
"t": "ஒவ்வொரு உருளைக்கிழங்குத் துண்டையும் மாவில் முக்கவும்."
},
{
"e": "Fry in hot oil on medium heat until golden and cooked inside.",
"t": "சூடான எண்ணெயில் நடுத்தரத் தீயில் பொன்னிறமாக உள்ளே வேகும் வரை பொரிக்கவும்."
}
]
},
{
"dish": "Vegetable cutlet",
"servings": 4,
"prep": 25,
"cook": 20,
"note": "Chill the shaped cutlets for 15 minutes so they hold their shape.",
"note_ta": "வடிவமைத்த கட்லெட்டை 15 நிமிடம் குளிரவைத்தால் உடையாமல் இருக்கும்.",
"ingredients": [
{
"n": "Potatoes, boiled",
"t": "உருளைக்கிழங்கு",
"q": 2.0,
"u": "piece"
},
{
"n": "Carrot, beans, peas (finely chopped)",
"t": "கலவை காய்கறிகள்",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
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
"n": "Garam masala",
"t": "கரம் மசாலா",
"q": 1.0,
"u": "tsp"
},
{
"n": "Bread crumbs",
"t": "ரொட்டித் தூள்",
"q": 0.5,
"u": "cup"
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
"e": "Sauté the onion, ginger-garlic paste and vegetables with salt until soft.",
"t": "வெங்காயம், இஞ்சி பூண்டு விழுது, காய்கறிகளை உப்புடன் மென்மையாக வதக்கவும்."
},
{
"e": "Mix with the mashed potato and garam masala and shape into patties.",
"t": "மசித்த உருளைக்கிழங்கு, கரம் மசாலாவுடன் கலந்து தட்டைகளாக்கவும்."
},
{
"e": "Coat in bread crumbs and shallow fry on a pan until crisp and golden on both sides.",
"t": "ரொட்டித் தூளில் புரட்டி தவாவில் எண்ணெய் விட்டு இருபுறமும் மொறுமொறுப்பாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Thattai",
"servings": 4,
"prep": 20,
"cook": 20,
"note": "Roll the dough thin and prick it for crisp thattai.",
"note_ta": "மாவை மெல்லியதாகத் தேய்த்து குத்தினால் மொறுமொறுப்பாக வரும்.",
"ingredients": [
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Urad dal flour",
"t": "உளுந்து மாவு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Soaked chana dal",
"t": "ஊறவைத்த கடலைப்பருப்பு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Peanuts, crushed",
"t": "வேர்க்கடலை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Butter or hot oil",
"t": "வெண்ணெய்",
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
"e": "Mix all the ingredients except the oil for frying, adding water to make a stiff dough.",
"t": "பொரிக்கும் எண்ணெய் தவிர எல்லாவற்றையும் கலந்து தண்ணீர் சேர்த்து கெட்டியாகப் பிசையவும்."
},
{
"e": "Pat small balls into thin discs on a wet sheet and prick with a fork.",
"t": "சிறு உருண்டைகளை ஈரத் தாளில் மெல்லிய வட்டங்களாகத் தட்டி முள்கரண்டியால் குத்தவும்."
},
{
"e": "Fry in medium-hot oil until the bubbles subside. Cool and store airtight.",
"t": "நடுத்தரச் சூட்டு எண்ணெயில் குமிழ்கள் அடங்கும் வரை பொரித்து ஆறவிட்டு காற்றுப் புகாத டப்பாவில் வைக்கவும்."
}
]
},
{
"dish": "Seedai",
"servings": 4,
"prep": 25,
"cook": 20,
"note": "Make sure the balls are completely dry-textured and without cracks, to avoid bursting.",
"note_ta": "உருண்டைகளில் விரிசல் இல்லாமல் இருந்தால் வெடிக்காது.",
"ingredients": [
{
"n": "Rice flour (roasted)",
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
"n": "Cumin or sesame seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
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
"e": "Mix the flours, seeds, butter and salt, adding water gradually to a smooth soft dough.",
"t": "மாவுகள், விதைகள், வெண்ணெய், உப்பைக் கலந்து தண்ணீர் சிறிது சிறிதாகச் சேர்த்து மென்மையாகப் பிசையவும்."
},
{
"e": "Roll into small marble-size balls.",
"t": "சிறிய கோலி அளவு உருண்டைகளாக்கவும்."
},
{
"e": "Fry on medium-low heat until the sound of bubbling stops and they turn golden.",
"t": "நடுத்தரக் குறைந்த தீயில் குமிழ் சத்தம் அடங்கி பொன்னிறமாகும் வரை பொரிக்கவும்."
}
]
},
{
"dish": "Ribbon pakoda",
"servings": 4,
"prep": 20,
"cook": 20,
"note": "Use the ribbon plate of the murukku press.",
"note_ta": "முறுக்கு நாழியில் ரிப்பன் தட்டைப் பயன்படுத்தவும்.",
"ingredients": [
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Asafoetida",
"t": "பெருங்காயம்",
"q": 1.0,
"u": "pinch"
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
"e": "Mix the flours with butter, chilli powder, asafoetida and salt; add water and knead a soft dough.",
"t": "மாவுகளை வெண்ணெய், மிளகாய்த் தூள், பெருங்காயம், உப்புடன் கலந்து தண்ணீர் சேர்த்து மென்மையாகப் பிசையவும்."
},
{
"e": "Fill the press with the ribbon plate and press long strips into hot oil.",
"t": "முறுக்கு நாழியில் ரிப்பன் தட்டை வைத்து நீளமாக சூடான எண்ணெயில் பிழியவும்."
},
{
"e": "Fry until crisp and golden, drain, cool and break into pieces.",
"t": "மொறுமொறுப்பாக பொன்னிறமாக பொரித்து வடித்து ஆறவிட்டு துண்டுகளாக உடைக்கவும்."
}
]
},
{
"dish": "Mixture",
"servings": 8,
"prep": 15,
"cook": 30,
"note": "A little of each fried item is enough; store airtight for 2 weeks.",
"note_ta": "ஒவ்வொன்றிலும் சிறிது போதும்; காற்றுப் புகாமல் வைத்தால் 2 வாரம் வரை இருக்கும்.",
"ingredients": [
{
"n": "Sev or ribbon pakoda",
"t": "சேவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Boondi",
"t": "பூந்தி",
"q": 1.0,
"u": "cup"
},
{
"n": "Fried peanuts",
"t": "வறுத்த வேர்க்கடலை",
"q": 0.5,
"u": "cup"
},
{
"n": "Poha (fried)",
"t": "அவல்",
"q": 1.0,
"u": "cup"
},
{
"n": "Curry leaves, fried",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "handful"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
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
"e": "Fry the poha, curry leaves and peanuts separately until crisp.",
"t": "அவல், கறிவேப்பிலை, வேர்க்கடலையை தனித்தனியாகப் பொரிக்கவும்."
},
{
"e": "Combine everything in a large bowl.",
"t": "எல்லாவற்றையும் பெரிய பாத்திரத்தில் கலக்கவும்."
},
{
"e": "Sprinkle the chilli powder and salt and toss well.",
"t": "மிளகாய்த் தூள், உப்பைத் தூவி நன்கு புரட்டவும்."
}
]
},
{
"dish": "Kara sev",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Use the sev plate with medium holes.",
"note_ta": "நடுத்தர துளைகள் உள்ள சேவு தட்டைப் பயன்படுத்தவும்.",
"ingredients": [
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 1.5,
"u": "cup"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 0.5,
"u": "cup"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1.5,
"u": "tsp"
},
{
"n": "Pepper powder",
"t": "மிளகுத் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Asafoetida",
"t": "பெருங்காயம்",
"q": 1.0,
"u": "pinch"
},
{
"n": "Hot oil",
"t": "சூடான எண்ணெய்",
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
"n": "Oil for frying",
"t": "பொரிக்க எண்ணெய்",
"q": null,
"u": "as_needed"
}
],
"steps": [
{
"e": "Mix the flours with the spices, salt and hot oil, then add water to make a soft dough.",
"t": "மாவுகளை மசாலாக்கள், உப்பு, சூடான எண்ணெயுடன் கலந்து தண்ணீர் சேர்த்து மென்மையாகப் பிசையவும்."
},
{
"e": "Press the dough through the sev plate into hot oil in circles.",
"t": "மாவை சேவு தட்டில் வைத்து சூடான எண்ணெயில் வட்டமாகப் பிழியவும்."
},
{
"e": "Fry until golden and the sizzling stops; drain, cool and crumble.",
"t": "பொன்னிறமாகி சத்தம் அடங்கும் வரை பொரித்து வடித்து ஆறவிட்டு உதிர்க்கவும்."
}
]
},
{
"dish": "Verkadalai sundal",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Soak the peanuts for 6 hours first.",
"note_ta": "வேர்க்கடலையை முதலில் 6 மணி நேரம் ஊறவைக்கவும்.",
"ingredients": [
{
"n": "Raw peanuts, soaked",
"t": "வேர்க்கடலை",
"q": 1.5,
"u": "cup"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
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
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
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
"e": "Pressure cook the peanuts with salt until soft but whole; drain.",
"t": "வேர்க்கடலையை உப்புடன் குக்கரில் உடையாமல் மென்மையாக வேகவைத்து வடிக்கவும்."
},
{
"e": "Temper mustard, chilli and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Toss in the peanuts and coconut and serve warm.",
"t": "வேர்க்கடலை, தேங்காய் சேர்த்துப் புரட்டி சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Corn sundal",
"servings": 4,
"prep": 5,
"cook": 10,
"note": "Add a squeeze of lemon at the end.",
"note_ta": "கடைசியில் எலுமிச்சை சாறு பிழியவும்.",
"ingredients": [
{
"n": "Sweet corn kernels",
"t": "ஸ்வீட் கார்ன்",
"q": 2.0,
"u": "cup"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "sprig"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
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
"e": "Boil the corn in salted water for 5 minutes and drain.",
"t": "சோளத்தை உப்புத் தண்ணீரில் 5 நிமிடம் வேகவைத்து வடிக்கவும்."
},
{
"e": "Temper mustard, chilli and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the corn and coconut, toss for a minute and serve.",
"t": "சோளம், தேங்காய் சேர்த்து ஒரு நிமிடம் புரட்டிப் பரிமாறவும்."
}
]
},
{
"dish": "Banana chips",
"servings": 6,
"prep": 15,
"cook": 20,
"note": "Slice as thin as possible; soak slices in salted turmeric water for 10 minutes first.",
"note_ta": "முடிந்தவரை மெல்லியதாக நறுக்கி, உப்பு மஞ்சள் தண்ணீரில் 10 நிமிடம் ஊறவைக்கவும்.",
"ingredients": [
{
"n": "Raw banana (nendran)",
"t": "வாழைக்காய்",
"q": 3.0,
"u": "piece"
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
"n": "Coconut oil for frying",
"t": "தேங்காய் எண்ணெய்",
"q": null,
"u": "as_needed"
}
],
"steps": [
{
"e": "Peel the bananas and soak in salted turmeric water for 10 minutes.",
"t": "வாழைக்காயின் தோலை நீக்கி உப்பு மஞ்சள் தண்ணீரில் 10 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Slice thinly directly into hot oil.",
"t": "நேரடியாக சூடான எண்ணெயில் மெல்லியதாக சீவிப் போடவும்."
},
{
"e": "Fry until crisp and the bubbling slows, drain on paper and sprinkle a little salt water.",
"t": "மொறுமொறுப்பாகி குமிழ்கள் குறையும் வரை பொரித்து காகிதத்தில் வடித்து சிறிது உப்புத் தண்ணீர் தெளிக்கவும்."
}
]
},
{
"dish": "Chicken lollipop",
"servings": 4,
"prep": 30,
"cook": 20,
"note": "Marinate for at least 1 hour for the best flavour.",
"note_ta": "சிறந்த சுவைக்கு குறைந்தது 1 மணி நேரம் ஊறவைக்கவும்.",
"ingredients": [
{
"n": "Chicken winglets",
"t": "சிக்கன் விங்ஸ்",
"q": 12.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Soy sauce",
"t": "சோயா சாஸ்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Cornflour",
"t": "சோள மாவு",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Egg",
"t": "முட்டை",
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
"n": "Oil for frying",
"t": "பொரிக்க எண்ணெய்",
"q": null,
"u": "as_needed"
}
],
"steps": [
{
"e": "Mix the chicken with the paste, chilli powder, soy sauce, salt and egg; marinate for 1 hour.",
"t": "சிக்கனை விழுது, மிளகாய்த் தூள், சோயா சாஸ், உப்பு, முட்டையுடன் கலந்து 1 மணி நேரம் ஊறவைக்கவும்."
},
{
"e": "Add the cornflour and rice flour and coat evenly.",
"t": "சோள மாவு, அரிசி மாவு சேர்த்து சமமாகப் பூசவும்."
},
{
"e": "Fry in hot oil on medium heat for 10 to 12 minutes until golden and cooked through.",
"t": "சூடான எண்ணெயில் நடுத்தரத் தீயில் 10 முதல் 12 நிமிடம் பொன்னிறமாக வேகும் வரை பொரிக்கவும்."
}
]
},
{
"dish": "Mutton kola urundai",
"servings": 4,
"prep": 25,
"cook": 20,
"note": "Keep the mince dry; roast the fried gram well before grinding.",
"note_ta": "கறி விழுது ஈரமாக இல்லாமல் இருக்க வேண்டும்; பொட்டுக்கடலையை நன்கு வறுத்து அரைக்கவும்.",
"ingredients": [
{
"n": "Mutton mince",
"t": "மட்டன் கீமா",
"q": 400.0,
"u": "g"
},
{
"n": "Fried gram (pottukadalai), powdered",
"t": "பொட்டுக்கடலை",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Onion, finely chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Fennel seeds",
"t": "சோம்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Garam masala",
"t": "கரம் மசாலா",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
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
"e": "Mix the mince with the gram powder, onion, paste, spices and salt.",
"t": "கறியை பொட்டுக்கடலைத் தூள், வெங்காயம், விழுது, மசாலாக்கள், உப்புடன் கலக்கவும்."
},
{
"e": "Shape into small balls.",
"t": "சிறிய உருண்டைகளாக்கவும்."
},
{
"e": "Deep fry on medium heat until browned and cooked through.",
"t": "நடுத்தரத் தீயில் பழுப்பு நிறமாக உள்ளே வேகும் வரை பொரிக்கவும்."
}
]
},
{
"dish": "Mangalore buns",
"servings": 6,
"prep": 60,
"cook": 20,
"note": "Rest the dough for 6 to 8 hours or overnight.",
"note_ta": "மாவை 6 முதல் 8 மணி நேரம் அல்லது இரவு முழுவதும் ஊறவிடவும்.",
"ingredients": [
{
"n": "Ripe bananas, mashed",
"t": "நன்கு பழுத்த வாழைப்பழம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Maida (refined flour)",
"t": "மைதா",
"q": 2.0,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
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
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Baking soda",
"t": "சமையல் சோடா",
"q": 0.25,
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
"e": "Mash the bananas with sugar, curd, cumin, soda and salt.",
"t": "வாழைப்பழத்தை சர்க்கரை, தயிர், சீரகம், சோடா, உப்புடன் மசிக்கவும்."
},
{
"e": "Knead in the maida to a soft dough, cover and rest for 6 to 8 hours.",
"t": "மைதாவைச் சேர்த்து மென்மையாகப் பிசைந்து மூடி 6 முதல் 8 மணி நேரம் வைக்கவும்."
},
{
"e": "Roll into thick discs and fry in hot oil until puffed and golden. Serve with coconut chutney.",
"t": "தடிமனான வட்டங்களாகத் தேய்த்து சூடான எண்ணெயில் பொங்கி பொன்னிறமாகப் பொரித்து தேங்காய் சட்னியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Adhirasam",
"servings": 6,
"prep": 30,
"cook": 30,
"note": "The rice flour and jaggery dough should be like thick halwa and rested a day for best results.",
"note_ta": "அரிசி மாவு, வெல்லக் கலவை கெட்டியான அல்வா பதத்தில் இருக்க வேண்டும்; ஒரு நாள் ஊறவிட்டால் சிறப்பு.",
"ingredients": [
{
"n": "Raw rice (soaked, dried and powdered)",
"t": "பச்சரிசி மாவு",
"q": 2.0,
"u": "cup"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 1.0,
"u": "cup"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Sesame seeds",
"t": "எள்",
"q": 1.0,
"u": "tbsp"
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
"e": "Boil the jaggery with a little water to a soft-ball syrup.",
"t": "வெல்லத்தை சிறிது தண்ணீருடன் மென்மையான உருண்டை பதம் வரும் வரை காய்ச்சவும்."
},
{
"e": "Stir in the rice flour and cardamom to make a soft dough; cover and rest overnight.",
"t": "அரிசி மாவு, ஏலக்காய் சேர்த்துக் கிளறி மென்மையான மாவாக்கி மூடி இரவு முழுவதும் வைக்கவும்."
},
{
"e": "Pat into thick discs on an oiled sheet with sesame and fry on low heat until golden, pressing out the oil.",
"t": "எண்ணெய் தடவிய தாளில் எள்ளுடன் தடிமனான வட்டங்களாகத் தட்டி குறைந்த தீயில் பொன்னிறமாகப் பொரித்து எண்ணெயை அழுத்தி வடிக்கவும்."
}
]
},
{
"dish": "Ellu urundai",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Dry roast the sesame well but do not let it brown.",
"note_ta": "எள்ளை நன்கு வறுக்கவும்; ஆனால் பழுப்பாக விடாதீர்கள்.",
"ingredients": [
{
"n": "Black sesame seeds",
"t": "கருப்பு எள்",
"q": 1.0,
"u": "cup"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 0.75,
"u": "cup"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
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
"e": "Dry roast the sesame until it pops, then cool.",
"t": "எள்ளை வெடிக்கும் வரை வறுத்து ஆறவிடவும்."
},
{
"e": "Melt the jaggery in a little water and boil to a soft-ball syrup.",
"t": "வெல்லத்தை சிறிது தண்ணீரில் கரைத்து மென்மையான உருண்டை பதம் வரும் வரை காய்ச்சவும்."
},
{
"e": "Mix in the sesame and cardamom, grease your hands with ghee and shape into balls while warm.",
"t": "எள், ஏலக்காய் சேர்த்துக் கலந்து நெய் தடவிய கையால் சூடாக இருக்கும்போதே உருண்டைகளாக்கவும்."
}
]
},
{
"dish": "Kadalai mittai",
"servings": 6,
"prep": 5,
"cook": 20,
"note": "Shape quickly while the mixture is hot.",
"note_ta": "கலவை சூடாக இருக்கும்போதே வேகமாக வடிவமைக்கவும்.",
"ingredients": [
{
"n": "Raw peanuts, roasted and skinned",
"t": "வேர்க்கடலை",
"q": 1.0,
"u": "cup"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 0.75,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.25,
"u": "tsp"
}
],
"steps": [
{
"e": "Melt the jaggery with 3 tablespoons of water and boil until a drop forms a hard thread in cold water.",
"t": "வெல்லத்தை 3 மேசைக்கரண்டி தண்ணீருடன் காய்ச்சி குளிர்ந்த நீரில் விட்டால் கெட்டியான நூல் பதம் வரும் வரை கொதிக்கவிடவும்."
},
{
"e": "Stir in the peanuts and cardamom quickly.",
"t": "வேர்க்கடலை, ஏலக்காயை வேகமாகக் கலக்கவும்."
},
{
"e": "Pour onto a greased plate, flatten, cut into pieces while warm and cool.",
"t": "நெய் தடவிய தட்டில் ஊற்றி தட்டையாக்கி சூடாக இருக்கும்போதே வெட்டி ஆறவிடவும்."
}
]
},
{
"dish": "Sweet paniyaram",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Use ripe banana for natural sweetness.",
"note_ta": "இயற்கையான இனிப்புக்கு பழுத்த வாழைப்பழம் சேர்க்கவும்.",
"ingredients": [
{
"n": "Rice flour",
"t": "அரிசி மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Jaggery, grated",
"t": "வெல்லம்",
"q": 0.75,
"u": "cup"
},
{
"n": "Ripe banana, mashed",
"t": "வாழைப்பழம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Ghee or oil",
"t": "நெய்",
"q": 3.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Mix the flour, jaggery, banana, coconut and cardamom with a little water to a thick batter.",
"t": "மாவு, வெல்லம், வாழைப்பழம், தேங்காய், ஏலக்காயை சிறிது தண்ணீருடன் கெட்டியான மாவாகக் கலக்கவும்."
},
{
"e": "Heat the paniyaram pan, add ghee in each hollow and fill with batter.",
"t": "பணியாரக் கல்லைச் சூடாக்கி ஒவ்வொரு குழியிலும் நெய் விட்டு மாவை ஊற்றவும்."
},
{
"e": "Cook on low heat, turning, until dark golden all around.",
"t": "குறைந்த தீயில் திருப்பிப் போட்டு அனைத்துப் பக்கமும் பொன்னிறமாக வேகவிடவும்."
}
]
},
{
"dish": "Pazham pori",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Use ripe nendran (plantain); it fries up sweet and soft.",
"note_ta": "பழுத்த நேந்திரம் பழம் இனிப்பாக மென்மையாகப் பொரியும்.",
"ingredients": [
{
"n": "Ripe nendran bananas",
"t": "நேந்திரம் பழம்",
"q": 3.0,
"u": "piece"
},
{
"n": "Maida (refined flour)",
"t": "மைதா",
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
"n": "Sugar",
"t": "சர்க்கரை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 1.0,
"u": "pinch"
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
"e": "Whisk the maida, rice flour, sugar, turmeric and salt with water into a thick batter.",
"t": "மைதா, அரிசி மாவு, சர்க்கரை, மஞ்சள், உப்பை தண்ணீருடன் கெட்டியான மாவாகக் கலக்கவும்."
},
{
"e": "Slice the bananas lengthwise into thick pieces.",
"t": "வாழைப்பழத்தை நீளவாக்கில் தடிமனாக நறுக்கவும்."
},
{
"e": "Dip in the batter and fry in hot oil on medium heat until golden.",
"t": "மாவில் முக்கி சூடான எண்ணெயில் நடுத்தரத் தீயில் பொன்னிறமாகப் பொரிக்கவும்."
}
]
},
{
"dish": "Unniyappam",
"servings": 4,
"prep": 20,
"cook": 20,
"note": "Rest the batter for 2 hours so the rice flour softens.",
"note_ta": "அரிசி மாவு மென்மையாக 2 மணி நேரம் ஊறவிடவும்.",
"ingredients": [
{
"n": "Raw rice flour",
"t": "அரிசி மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 0.75,
"u": "cup"
},
{
"n": "Ripe banana, mashed",
"t": "வாழைப்பழம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Coconut bits, fried in ghee",
"t": "தேங்காய்த் துண்டுகள்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Baking soda",
"t": "சமையல் சோடா",
"q": 1.0,
"u": "pinch"
},
{
"n": "Ghee or oil",
"t": "நெய்",
"q": 4.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Melt the jaggery in a little water and strain.",
"t": "வெல்லத்தை சிறிது தண்ணீரில் கரைத்து வடிகட்டவும்."
},
{
"e": "Mix with the flour, banana, cardamom and soda to a thick batter; stir in the coconut and rest for 2 hours.",
"t": "மாவு, வாழைப்பழம், ஏலக்காய், சோடாவுடன் கெட்டியான மாவாகக் கலந்து தேங்காய் சேர்த்து 2 மணி நேரம் வைக்கவும்."
},
{
"e": "Heat the appe pan with ghee in each hollow, fill two-thirds and cook on low heat, turning, until dark brown.",
"t": "அப்பக்கல்லில் ஒவ்வொரு குழியிலும் நெய் விட்டு மூன்றில் இரண்டு பங்கு மாவு ஊற்றி குறைந்த தீயில் திருப்பி அடர் பழுப்பு வரை வேகவிடவும்."
}
]
},
{
"dish": "Poli",
"servings": 6,
"prep": 40,
"cook": 30,
"note": "Both the filling and the dough should be soft so the poli rolls thin without tearing.",
"note_ta": "பூரணமும் மாவும் மென்மையாக இருந்தால் போளி கிழியாமல் மெல்லியதாக வரும்.",
"ingredients": [
{
"n": "Maida or wheat flour",
"t": "மைதா",
"q": 1.5,
"u": "cup"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 1.0,
"u": "cup"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 1.0,
"u": "cup"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 1.0,
"u": "pinch"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 4.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Pressure cook the chana dal until soft, drain, and cook with the jaggery until thick; mash and add cardamom.",
"t": "கடலைப்பருப்பை குழைய வேகவைத்து வடித்து வெல்லத்துடன் கெட்டியாகும் வரை சமைத்து மசித்து ஏலக்காய் சேர்க்கவும்."
},
{
"e": "Knead the flour with turmeric, ghee and water into a very soft dough and rest.",
"t": "மாவை மஞ்சள், நெய், தண்ணீருடன் மிகவும் மென்மையாகப் பிசைந்து ஊறவிடவும்."
},
{
"e": "Stuff the dough balls with the filling, roll thin and cook on a tawa with ghee until golden.",
"t": "மாவு உருண்டைகளில் பூரணம் வைத்து மெல்லியதாகத் தேய்த்து தவாவில் நெய் விட்டு பொன்னிறமாக வேகவிடவும்."
}
]
},
{
"dish": "Mysore pak",
"servings": 8,
"prep": 10,
"cook": 25,
"note": "Add the hot ghee in small batches and stir fast; the mixture bubbles and sets quickly.",
"note_ta": "சூடான நெய்யை சிறிது சிறிதாகச் சேர்த்து வேகமாகக் கிளறவும்; கலவை வேகமாகப் பொங்கி கெட்டியாகும்.",
"ingredients": [
{
"n": "Gram flour (sieved)",
"t": "கடலை மாவு",
"q": 1.0,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 2.0,
"u": "cup"
},
{
"n": "Ghee (melted, hot)",
"t": "நெய்",
"q": 1.5,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 0.75,
"u": "cup"
}
],
"steps": [
{
"e": "Dry roast the gram flour for 2 minutes and mix with 2 tablespoons of ghee.",
"t": "கடலை மாவை 2 நிமிடம் வறுத்து 2 மேசைக்கரண்டி நெய்யுடன் கலக்கவும்."
},
{
"e": "Boil the sugar with the water to a one-string syrup.",
"t": "சர்க்கரையை தண்ணீருடன் ஒரு கம்பிப் பாகு வரும் வரை காய்ச்சவும்."
},
{
"e": "Lower the heat, add the flour in a stream, then the hot ghee a little at a time, stirring constantly until frothy and pulling away from the pan.",
"t": "தீயைக் குறைத்து மாவை கொட்டி, சூடான நெய்யை சிறிது சிறிதாகச் சேர்த்து நுரைத்து கடாயில் ஒட்டாமல் வரும் வரை கிளறவும்."
},
{
"e": "Pour into a greased tray, cut into pieces while warm and cool.",
"t": "நெய் தடவிய தட்டில் ஊற்றி சூடாக இருக்கும்போதே வெட்டி ஆறவிடவும்."
}
]
},
{
"dish": "Rava laddu",
"servings": 12,
"prep": 10,
"cook": 20,
"note": "The sugar should be powdered fine and the rava roasted evenly.",
"note_ta": "சர்க்கரையை நைசாகப் பொடிக்கவும்; ரவையை சமமாக வறுக்கவும்.",
"ingredients": [
{
"n": "Rava (semolina)",
"t": "ரவை",
"q": 1.0,
"u": "cup"
},
{
"n": "Sugar, powdered",
"t": "சர்க்கரை",
"q": 0.75,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 0.25,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Cashew nuts and raisins",
"t": "முந்திரி, திராட்சை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Warm milk",
"t": "பால்",
"q": 0.25,
"u": "cup"
}
],
"steps": [
{
"e": "Fry the cashews and raisins in ghee and set aside. Roast the rava in the same ghee until fragrant.",
"t": "முந்திரி, திராட்சையை நெய்யில் வறுத்து எடுக்கவும். அதே நெய்யில் ரவையை வாசனை வரும் வரை வறுக்கவும்."
},
{
"e": "Mix in the coconut, sugar, cardamom and nuts.",
"t": "தேங்காய், சர்க்கரை, ஏலக்காய், முந்திரி கலந்து கொள்ளவும்."
},
{
"e": "Sprinkle warm milk a little at a time and shape into balls while the mixture is warm.",
"t": "வெதுவெதுப்பான பாலைச் சிறிது சிறிதாகத் தெளித்து கலவை சூடாக இருக்கும்போதே உருண்டைகளாக்கவும்."
}
]
},
{
"dish": "Boondi laddu",
"servings": 12,
"prep": 40,
"cook": 40,
"note": "Shape the laddus while the mixture is warm.",
"note_ta": "கலவை சூடாக இருக்கும்போதே லட்டு பிடிக்கவும்.",
"ingredients": [
{
"n": "Gram flour",
"t": "கடலை மாவு",
"q": 1.5,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1.5,
"u": "cup"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Cashew nuts and raisins fried in ghee",
"t": "முந்திரி, திராட்சை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Food colour (optional)",
"t": "உணவு நிறம்",
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
"e": "Whisk the gram flour with water into a smooth, flowing batter.",
"t": "கடலை மாவை தண்ணீருடன் கட்டியின்றி ஓடும் பதத்தில் கலக்கவும்."
},
{
"e": "Pour the batter through a perforated ladle into hot oil and fry the tiny drops of boondi until just firm; drain.",
"t": "துளையுள்ள கரண்டியில் மாவை ஊற்றி சூடான எண்ணெயில் சிறு பூந்திகளாக வெறுமனே உறுதியாகும் வரை பொரித்து வடிக்கவும்."
},
{
"e": "Boil the sugar with water to a one-string syrup, add cardamom, colour and the boondi.",
"t": "சர்க்கரையை தண்ணீருடன் ஒரு கம்பிப் பாகு வரை காய்ச்சி ஏலக்காய், நிறம், பூந்தி சேர்க்கவும்."
},
{
"e": "Add the nuts and shape into balls while warm.",
"t": "முந்திரி, திராட்சை சேர்த்து சூடாக இருக்கும்போதே உருண்டைகளாக்கவும்."
}
]
},
{
"dish": "Badusha",
"servings": 10,
"prep": 30,
"cook": 30,
"note": "Do not knead hard; a soft touch gives the flaky layers.",
"note_ta": "அழுத்திப் பிசையாதீர்கள்; மென்மையாகப் பிசைந்தால் அடுக்குகள் கிடைக்கும்.",
"ingredients": [
{
"n": "Maida (refined flour)",
"t": "மைதா",
"q": 2.0,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 0.5,
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
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1.5,
"u": "cup"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
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
"e": "Mix the maida, ghee, curd and soda into a soft dough with a little water; rest for 20 minutes.",
"t": "மைதா, நெய், தயிர், சோடாவை சிறிது தண்ணீருடன் மென்மையாகப் பிசைந்து 20 நிமிடம் வைக்கவும்."
},
{
"e": "Make small balls and press a dent in the centre.",
"t": "சிறு உருண்டைகளாக்கி நடுவில் குழி வைக்கவும்."
},
{
"e": "Fry on low heat until golden. Make a one-string sugar syrup with cardamom.",
"t": "குறைந்த தீயில் பொன்னிறமாகப் பொரிக்கவும். ஏலக்காயுடன் ஒரு கம்பிப் பாகு தயாரிக்கவும்."
},
{
"e": "Dip the hot badushas in the warm syrup for a minute and cool on a plate.",
"t": "சூடான பாதுஷாக்களை வெதுவெதுப்பான பாகில் ஒரு நிமிடம் முக்கி தட்டில் ஆறவிடவும்."
}
]
},
{
"dish": "Paal payasam",
"servings": 4,
"prep": 10,
"cook": 40,
"note": "Cook the rice in milk on low heat and stir often to prevent sticking.",
"note_ta": "அரிசியை பாலில் குறைந்த தீயில் சமைத்து அடிக்கடி கிளறினால் அடிப்பிடிக்காது.",
"ingredients": [
{
"n": "Raw rice",
"t": "பச்சரிசி",
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
"n": "Cashew nuts and raisins fried in ghee",
"t": "முந்திரி, திராட்சை",
"q": 2.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Rinse the rice and cook it in 1 cup of water until soft.",
"t": "அரிசியைக் கழுவி 1 கப் தண்ணீரில் மென்மையாக வேகவிடவும்."
},
{
"e": "Add the milk and simmer on low heat for 25 minutes, stirring often, until creamy.",
"t": "பால் சேர்த்து குறைந்த தீயில் 25 நிமிடம் அடிக்கடி கிளறி கெட்டியாகும் வரை கொதிக்கவிடவும்."
},
{
"e": "Stir in the sugar and cardamom, cook for 5 more minutes, and top with fried nuts.",
"t": "சர்க்கரை, ஏலக்காய் சேர்த்து மேலும் 5 நிமிடம் சமைத்து வறுத்த முந்திரியுடன் பரிமாறவும்."
}
]
},
{
"dish": "Javvarisi payasam",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Soak the sago for 30 minutes so it cooks evenly.",
"note_ta": "ஜவ்வரிசியை 30 நிமிடம் ஊறவைத்தால் சமமாக வேகும்.",
"ingredients": [
{
"n": "Sago (javvarisi)",
"t": "ஜவ்வரிசி",
"q": 0.5,
"u": "cup"
},
{
"n": "Milk",
"t": "பால்",
"q": 3.0,
"u": "cup"
},
{
"n": "Sugar or jaggery",
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
"n": "Cashew nuts and raisins fried in ghee",
"t": "முந்திரி, திராட்சை",
"q": 2.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Soak the sago, then cook it in 1 cup of water until translucent.",
"t": "ஜவ்வரிசியை ஊறவைத்து 1 கப் தண்ணீரில் வெளிப்படையாகும் வரை வேகவிடவும்."
},
{
"e": "Add the milk and simmer for 10 minutes.",
"t": "பால் சேர்த்து 10 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Stir in the sugar and cardamom, top with the fried nuts and serve warm or chilled.",
"t": "சர்க்கரை, ஏலக்காய் சேர்த்து வறுத்த முந்திரியுடன் சூடாகவோ குளிரவைத்தோ பரிமாறவும்."
}
]
},
{
"dish": "Jigarthanda",
"servings": 2,
"prep": 15,
"cook": 0,
"note": "Madurai's famous cool drink; best served very cold.",
"note_ta": "மதுரையின் புகழ்பெற்ற குளிர்பானம்; நன்கு குளிர்வித்துப் பரிமாறவும்.",
"ingredients": [
{
"n": "Milk, boiled and chilled",
"t": "பால்",
"q": 2.0,
"u": "cup"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Nannari syrup",
"t": "நன்னாரி சிரப்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Badam pisin (almond gum), soaked",
"t": "பாதாம் பிசின்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Ice cream",
"t": "ஐஸ்கிரீம்",
"q": 2.0,
"u": "piece"
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
"e": "Soak the almond gum for 6 hours until it swells like jelly.",
"t": "பாதாம் பிசினை 6 மணி நேரம் ஊறவைத்து ஜெல்லி போல பெருக்கவிடவும்."
},
{
"e": "Mix the chilled milk with the sugar and nannari syrup.",
"t": "குளிர்ந்த பாலை சர்க்கரை, நன்னாரி சிரப்புடன் கலக்கவும்."
},
{
"e": "Put the gum in glasses, pour in the milk, add ice and top with a scoop of ice cream.",
"t": "கண்ணாடி கோப்பைகளில் பிசினை வைத்து பாலை ஊற்றி ஐஸ், ஒரு ஸ்கூப் ஐஸ்கிரீம் சேர்த்துப் பரிமாறவும்."
}
]
},
{
"dish": "Panakam",
"servings": 4,
"prep": 5,
"cook": 0,
"note": "A traditional offering for Rama Navami; best made fresh.",
"note_ta": "ராம நவமிக்கான பாரம்பரிய நைவேத்தியம்; புதிதாகச் செய்வது சிறந்தது.",
"ingredients": [
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 0.5,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 4.0,
"u": "cup"
},
{
"n": "Dry ginger powder",
"t": "சுக்குப் பொடி",
"q": 0.5,
"u": "tsp"
},
{
"n": "Cardamom powder",
"t": "ஏலக்காய் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 1.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Dissolve the jaggery in the water and strain out any impurities.",
"t": "வெல்லத்தை தண்ணீரில் கரைத்து அசுத்தங்களை வடிகட்டவும்."
},
{
"e": "Stir in the dry ginger, cardamom and lemon juice.",
"t": "சுக்கு, ஏலக்காய், எலுமிச்சை சாறு சேர்த்துக் கலக்கவும்."
},
{
"e": "Serve chilled.",
"t": "குளிரவைத்துப் பரிமாறவும்."
}
]
},
{
"dish": "Nannari sarbath",
"servings": 2,
"prep": 5,
"cook": 0,
"note": "Add a few sabja (basil) seeds soaked in water for extra cooling.",
"note_ta": "கூடுதல் குளிர்ச்சிக்கு ஊறவைத்த சப்ஜா விதைகளைச் சேர்க்கவும்.",
"ingredients": [
{
"n": "Nannari syrup",
"t": "நன்னாரி சிரப்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Cold water",
"t": "குளிர்ந்த தண்ணீர்",
"q": 2.0,
"u": "cup"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Ice cubes",
"t": "ஐஸ் கட்டிகள்",
"q": 6.0,
"u": "piece"
}
],
"steps": [
{
"e": "Mix the nannari syrup with the cold water and lemon juice.",
"t": "நன்னாரி சிரப்பை குளிர்ந்த தண்ணீர், எலுமிச்சை சாறுடன் கலக்கவும்."
},
{
"e": "Pour over ice and serve at once.",
"t": "ஐஸ் மேல் ஊற்றி உடனே பரிமாறவும்."
}
]
},
{
"dish": "Elaneer",
"servings": 1,
"prep": 2,
"cook": 0,
"note": "Choose a heavy, fresh tender coconut.",
"note_ta": "கனமான புதிய இளநீரைத் தேர்ந்தெடுக்கவும்.",
"ingredients": [
{
"n": "Tender coconut",
"t": "இளநீர்",
"q": 1.0,
"u": "piece"
}
],
"steps": [
{
"e": "Chill the tender coconut for an hour if you like.",
"t": "விரும்பினால் இளநீரை 1 மணி நேரம் குளிர வைக்கவும்."
},
{
"e": "Cut open the top, pour the water into a glass and scoop out the soft malai to eat.",
"t": "மேற்புறத்தை வெட்டி தண்ணீரை டம்ளரில் ஊற்றி மென்மையான வழுக்கையையும் சாப்பிடவும்."
}
]
},
{
"dish": "Rose milk",
"servings": 2,
"prep": 5,
"cook": 0,
"note": "Adjust the syrup to taste; chill the milk first.",
"note_ta": "சிரப்பை சுவைக்கேற்ப சேர்க்கவும்; பாலை முதலில் குளிர வைக்கவும்.",
"ingredients": [
{
"n": "Cold milk",
"t": "குளிர்ந்த பால்",
"q": 2.0,
"u": "cup"
},
{
"n": "Rose syrup",
"t": "ரோஸ் சிரப்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Sugar (optional)",
"t": "சர்க்கரை",
"q": 1.0,
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
"e": "Stir the rose syrup into the cold milk until evenly pink.",
"t": "ரோஸ் சிரப்பை குளிர்ந்த பாலில் சமமாகப் பிங்க் நிறம் வரும் வரை கலக்கவும்."
},
{
"e": "Add sugar if you like, pour over ice and serve.",
"t": "விரும்பினால் சர்க்கரை சேர்த்து ஐஸ் மேல் ஊற்றிப் பரிமாறவும்."
}
]
},
{
"dish": "Curry leaf rice",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Dry roast the curry leaves until crisp for the best aroma.",
"note_ta": "கறிவேப்பிலையை மொறுமொறுப்பாக வறுத்தால் சிறந்த மணம் கிடைக்கும்.",
"ingredients": [
{
"n": "Cooked rice, cooled",
"t": "சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 2.0,
"u": "handful"
},
{
"n": "Urad dal and chana dal",
"t": "உளுத்தம்பருப்பு, கடலைப்பருப்பு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 4.0,
"u": "piece"
},
{
"n": "Pepper",
"t": "மிளகு",
"q": 0.5,
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
"e": "Dry roast the dals, chillies and pepper, then the curry leaves until crisp; grind to a coarse powder with salt.",
"t": "பருப்புகள், மிளகாய், மிளகை வறுத்து, பின் கறிவேப்பிலையை மொறுமொறுப்பாக வறுத்து உப்புடன் கொரகொரப்பாகப் பொடிக்கவும்."
},
{
"e": "Temper mustard in oil and add the rice.",
"t": "எண்ணெயில் கடுகு தாளித்து சாதத்தைச் சேர்க்கவும்."
},
{
"e": "Sprinkle the powder over the rice and mix gently.",
"t": "பொடியை சாதத்தின் மேல் தூவி மெதுவாகக் கலக்கவும்."
}
]
},
{
"dish": "Pudina rice",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Do not overcook the mint paste or it turns bitter.",
"note_ta": "புதினா விழுதை அதிகம் வதக்கினால் கசக்கும்.",
"ingredients": [
{
"n": "Cooked rice, cooled",
"t": "சாதம்",
"q": 3.0,
"u": "cup"
},
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
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Ginger and garlic",
"t": "இஞ்சி, பூண்டு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Whole spices (cinnamon, clove)",
"t": "பட்டை, கிராம்பு",
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
"e": "Grind the mint, coriander, chilli, ginger and garlic to a fine paste.",
"t": "புதினா, கொத்தமல்லி, மிளகாய், இஞ்சி, பூண்டை விழுதாக அரைக்கவும்."
},
{
"e": "Heat the oil, fry the whole spices and onion until soft.",
"t": "எண்ணெயில் பட்டை, கிராம்பு, வெங்காயத்தை மென்மையாக வதக்கவும்."
},
{
"e": "Add the paste and salt and cook for 3 minutes until the raw smell goes.",
"t": "விழுது, உப்பு சேர்த்து பச்சை வாசனை போகும் வரை 3 நிமிடம் வதக்கவும்."
},
{
"e": "Fold in the rice gently and serve with raita.",
"t": "சாதத்தை மெதுவாகக் கலந்து ரைத்தாவுடன் பரிமாறவும்."
}
]
},
{
"dish": "Ellu sadam",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Roast the sesame until it just starts to pop and smell nutty.",
"note_ta": "எள் வெடித்து நறுமணம் வரும் வரை மட்டும் வறுக்கவும்.",
"ingredients": [
{
"n": "Cooked rice, cooled",
"t": "சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "White sesame seeds",
"t": "வெள்ளை எள்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 4.0,
"u": "piece"
},
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
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
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
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
"e": "Dry roast the sesame, urad dal and chillies separately and grind to a coarse powder with salt.",
"t": "எள், உளுத்தம்பருப்பு, மிளகாயை தனித்தனியாக வறுத்து உப்புடன் கொரகொரப்பாகப் பொடிக்கவும்."
},
{
"e": "Temper the mustard in sesame oil and add the rice.",
"t": "நல்லெண்ணெயில் கடுகு தாளித்து சாதத்தைச் சேர்க்கவும்."
},
{
"e": "Mix in the powder and serve with appalam.",
"t": "பொடியைக் கலந்து அப்பளத்துடன் பரிமாறவும்."
}
]
},
{
"dish": "Mango rice",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Choose firm, sour raw mangoes.",
"note_ta": "புளிப்பான கெட்டி மாங்காயைத் தேர்ந்தெடுக்கவும்.",
"ingredients": [
{
"n": "Cooked rice, cooled",
"t": "சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Raw mango, grated",
"t": "மாங்காய்",
"q": 1.0,
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
"u": "tbsp"
},
{
"n": "Peanuts",
"t": "வேர்க்கடலை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Green chilli and dried red chilli",
"t": "பச்சை, காய்ந்த மிளகாய்",
"q": 3.0,
"u": "piece"
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
"e": "Heat the oil, splutter the mustard, fry the dals, peanuts, chillies and curry leaves.",
"t": "எண்ணெயில் கடுகு தாளித்து பருப்புகள், வேர்க்கடலை, மிளகாய், கறிவேப்பிலை வறுக்கவும்."
},
{
"e": "Add the turmeric and grated mango, and cook for 2 minutes with salt.",
"t": "மஞ்சள், துருவிய மாங்காய், உப்பு சேர்த்து 2 நிமிடம் வதக்கவும்."
},
{
"e": "Toss in the rice gently and serve.",
"t": "சாதத்தை மெதுவாகக் கலந்து பரிமாறவும்."
}
]
},
{
"dish": "Nei sorru",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Serve with chicken or vegetable kurma.",
"note_ta": "சிக்கன் அல்லது காய்கறி குருமாவுடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Basmati or seeraga samba rice",
"t": "பாசுமதி அரிசி",
"q": 2.0,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Whole spices (cinnamon, clove, cardamom)",
"t": "பட்டை, கிராம்பு, ஏலக்காய்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Cashew nuts",
"t": "முந்திரி",
"q": 10.0,
"u": "piece"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 3.5,
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
"e": "Wash and soak the rice for 20 minutes; drain.",
"t": "அரிசியைக் கழுவி 20 நிமிடம் ஊறவைத்து வடிக்கவும்."
},
{
"e": "Heat the ghee, fry the cashews and set aside; fry the spices and onion until golden.",
"t": "நெய்யில் முந்திரியை வறுத்து எடுத்து, மசாலாக்கள், வெங்காயத்தைப் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Add the rice, water and salt, bring to a boil, then cover and cook on low for 15 minutes.",
"t": "அரிசி, தண்ணீர், உப்பு சேர்த்து கொதிக்கவிட்டு மூடி குறைந்த தீயில் 15 நிமிடம் வேகவிடவும்."
},
{
"e": "Fluff and top with the cashews.",
"t": "கிளறி முந்திரியைத் தூவவும்."
}
]
},
{
"dish": "Paruppu sadam",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Serve with ghee, appalam and a pickle.",
"note_ta": "நெய், அப்பளம், ஊறுகாயுடன் பரிமாறவும்.",
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
"n": "Shallots",
"t": "சின்ன வெங்காயம்",
"q": 8.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Mustard and cumin seeds",
"t": "கடுகு, சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 4.0,
"u": "clove"
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
"e": "Pressure cook the rice and dal together with 4 cups of water, turmeric and salt until very soft.",
"t": "அரிசி, பருப்பை 4 கப் தண்ணீர், மஞ்சள், உப்புடன் குக்கரில் மிகவும் குழைய வேகவிடவும்."
},
{
"e": "Heat the ghee, temper mustard and cumin; fry the garlic, shallots and tomato until soft.",
"t": "நெய்யில் கடுகு, சீரகம் தாளித்து பூண்டு, சின்ன வெங்காயம், தக்காளியை மென்மையாக வதக்கவும்."
},
{
"e": "Mash the rice and dal, stir in the tempering and serve hot.",
"t": "சாதம், பருப்பை மசித்து தாளிப்பைச் சேர்த்து சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Rasam sadam",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Make the rice soft and a little mushy to mix well with rasam.",
"note_ta": "சாதத்தை சற்று குழைய வேகவைத்தால் ரசத்துடன் நன்றாகக் கலக்கும்.",
"ingredients": [
{
"n": "Cooked rice",
"t": "சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Rasam",
"t": "ரசம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 1.0,
"u": "handful"
}
],
"steps": [
{
"e": "Mash the hot rice lightly.",
"t": "சூடான சாதத்தை லேசாக மசிக்கவும்."
},
{
"e": "Heat the rasam until frothy but do not boil hard.",
"t": "ரசத்தை நுரைத்து வரும் வரை சூடாக்கவும்; வேகமாகக் கொதிக்க விடாதீர்கள்."
},
{
"e": "Pour over the rice, add ghee and coriander and serve with appalam.",
"t": "சாதத்தின் மேல் ஊற்றி நெய், கொத்தமல்லி சேர்த்து அப்பளத்துடன் பரிமாறவும்."
}
]
},
{
"dish": "Dindigul biryani",
"servings": 4,
"prep": 30,
"cook": 45,
"note": "Use seeraga samba rice and plenty of pepper for the true Dindigul taste.",
"note_ta": "திண்டுக்கல் சுவைக்கு சீரகச் சம்பா அரிசி, மிளகு அதிகம் பயன்படுத்தவும்.",
"ingredients": [
{
"n": "Seeraga samba rice",
"t": "சீரகச் சம்பா அரிசி",
"q": 2.0,
"u": "cup"
},
{
"n": "Mutton or chicken",
"t": "மட்டன்",
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
"n": "Tomato",
"t": "தக்காளி",
"q": 2.0,
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
"n": "Biryani spices and pepper",
"t": "பிரியாணி மசாலா, மிளகு",
"q": 2.0,
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
"e": "Marinate the meat with curd, ginger-garlic paste, half the spices and salt for 30 minutes.",
"t": "கறியை தயிர், இஞ்சி பூண்டு விழுது, பாதி மசாலா, உப்புடன் 30 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Fry the onion in ghee and oil until golden, add the tomato, remaining spices and mint, then the meat. Cook until the meat is tender.",
"t": "நெய், எண்ணெயில் வெங்காயத்தைப் பொன்னிறமாக வதக்கி தக்காளி, மீதி மசாலா, புதினா, பின் கறி சேர்த்து வேகும் வரை சமைக்கவும்."
},
{
"e": "Add the washed rice and 3.5 cups of water; bring to a boil and cook covered on low heat for 15 to 20 minutes.",
"t": "கழுவிய அரிசி, 3.5 கப் தண்ணீர் சேர்த்து கொதிக்கவிட்டு மூடி குறைந்த தீயில் 15 முதல் 20 நிமிடம் வேகவிடவும்."
},
{
"e": "Rest for 10 minutes, fluff with coriander and serve with raita.",
"t": "10 நிமிடம் ஊறவிட்டு கொத்தமல்லியுடன் கிளறி ரைத்தாவுடன் பரிமாறவும்."
}
]
},
{
"dish": "Prawn biryani",
"servings": 4,
"prep": 30,
"cook": 40,
"note": "Add the prawns last so they stay tender.",
"note_ta": "இறாலை கடைசியில் சேர்த்தால் மென்மையாக இருக்கும்.",
"ingredients": [
{
"n": "Basmati rice",
"t": "பாசுமதி அரிசி",
"q": 2.0,
"u": "cup"
},
{
"n": "Prawns, cleaned",
"t": "இறால்",
"q": 500.0,
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
"q": 2.0,
"u": "piece"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Biryani masala",
"t": "பிரியாணி மசாலா",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 0.25,
"u": "cup"
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
"e": "Marinate the prawns with turmeric, chilli powder and salt for 15 minutes.",
"t": "இறாலை மஞ்சள், மிளகாய்த் தூள், உப்புடன் 15 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Fry the onion until golden, add the paste, tomato, masala, curd and herbs and cook to a thick masala.",
"t": "வெங்காயத்தைப் பொன்னிறமாக வதக்கி விழுது, தக்காளி, மசாலா, தயிர், இலைகளைச் சேர்த்து கெட்டியான மசாலாவாக்கவும்."
},
{
"e": "Add the rice and water (1:1.5), cook until nearly done, then place the prawns on top.",
"t": "அரிசி, தண்ணீர் (1:1.5) சேர்த்து பாதி வெந்ததும் இறாலை மேலே வைக்கவும்."
},
{
"e": "Cover and cook on low for 10 minutes. Serve hot with raita.",
"t": "மூடி குறைந்த தீயில் 10 நிமிடம் வேகவிட்டு ரைத்தாவுடன் சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Mushroom biryani",
"servings": 4,
"prep": 25,
"cook": 35,
"note": "Do not wash the mushrooms; wipe them clean so they do not turn watery.",
"note_ta": "காளானைக் கழுவாமல் துடைத்து சுத்தம் செய்யவும்; இல்லையெனில் தண்ணீராகிவிடும்.",
"ingredients": [
{
"n": "Basmati rice",
"t": "பாசுமதி அரிசி",
"q": 2.0,
"u": "cup"
},
{
"n": "Button mushrooms, quartered",
"t": "காளான்",
"q": 300.0,
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
"n": "Curd",
"t": "தயிர்",
"q": 0.25,
"u": "cup"
},
{
"n": "Biryani masala",
"t": "பிரியாணி மசாலா",
"q": 2.0,
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
"e": "Fry the onion until golden, add the paste, tomato, masala, curd and herbs and cook until thick.",
"t": "வெங்காயத்தைப் பொன்னிறமாக வதக்கி விழுது, தக்காளி, மசாலா, தயிர், இலைகளைச் சேர்த்து கெட்டியாகும் வரை சமைக்கவும்."
},
{
"e": "Add the mushrooms with salt and cook for 5 minutes.",
"t": "காளான், உப்பு சேர்த்து 5 நிமிடம் வதக்கவும்."
},
{
"e": "Add the soaked rice and water (1:1.5) and cook covered on low for 15 minutes.",
"t": "ஊறவைத்த அரிசி, தண்ணீர் (1:1.5) சேர்த்து மூடி குறைந்த தீயில் 15 நிமிடம் வேகவிடவும்."
}
]
},
{
"dish": "Arachuvitta sambar",
"servings": 4,
"prep": 20,
"cook": 30,
"note": "The freshly ground masala gives this sambar its special taste.",
"note_ta": "புதிதாக அரைத்த மசாலா இந்த சாம்பாருக்கு தனிச் சுவை தரும்.",
"ingredients": [
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
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Coriander seeds",
"t": "மல்லி விதை",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 4.0,
"u": "piece"
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
"e": "Pressure cook the dal until soft and mash.",
"t": "பருப்பை குழைய வேகவைத்து மசிக்கவும்."
},
{
"e": "Roast the coriander, chana dal, chillies and fenugreek in a little oil, then grind with the coconut and water.",
"t": "மல்லி, கடலைப்பருப்பு, மிளகாய், வெந்தயத்தை சிறிது எண்ணெயில் வறுத்து தேங்காயுடன் தண்ணீர் சேர்த்து அரைக்கவும்."
},
{
"e": "Boil the vegetables with tamarind water and salt, add the ground masala and the dal and simmer 8 minutes.",
"t": "காய்கறிகளை புளித்தண்ணீர், உப்புடன் வேகவிட்டு அரைத்த மசாலா, பருப்பு சேர்த்து 8 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Temper with mustard and serve.",
"t": "கடுகு தாளித்துக் கொட்டிப் பரிமாறவும்."
}
]
},
{
"dish": "Murungakkai sambar",
"servings": 4,
"prep": 15,
"cook": 30,
"note": "Add the drumsticks along with the tamarind water so they cook through.",
"note_ta": "முருங்கைக்காயை புளித்தண்ணீருடன் சேர்த்தால் நன்கு வேகும்.",
"ingredients": [
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Drumsticks, cut in pieces",
"t": "முருங்கைக்காய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Onion and tomato",
"t": "வெங்காயம், தக்காளி",
"q": 2.0,
"u": "piece"
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
"n": "Mustard seeds",
"t": "கடுகு",
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
"e": "Pressure cook the dal with turmeric and mash.",
"t": "பருப்பை மஞ்சளுடன் வேகவைத்து மசிக்கவும்."
},
{
"e": "Boil the drumsticks, onion and tomato with tamarind water, sambar powder and salt until tender.",
"t": "முருங்கைக்காய், வெங்காயம், தக்காளியை புளித்தண்ணீர், சாம்பார் பொடி, உப்புடன் வேகவிடவும்."
},
{
"e": "Add the dal, simmer for 5 minutes and temper with mustard and curry leaves.",
"t": "பருப்பைச் சேர்த்து 5 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Kara kuzhambu",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Sesame oil gives the authentic taste; the gravy thickens as it cools.",
"note_ta": "நல்லெண்ணெய் உண்மையான சுவை தரும்; ஆறும்போது குழம்பு கெட்டியாகும்.",
"ingredients": [
{
"n": "Tamarind",
"t": "புளி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Shallots",
"t": "சின்ன வெங்காயம்",
"q": 10.0,
"u": "piece"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 8.0,
"u": "clove"
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
"e": "Soak the tamarind in warm water and extract 2 cups of juice.",
"t": "புளியை வெந்நீரில் ஊறவைத்து 2 கப் புளிக்கரைசல் எடுக்கவும்."
},
{
"e": "Heat the oil, splutter mustard and fenugreek, then fry the shallots, garlic and curry leaves.",
"t": "எண்ணெயில் கடுகு, வெந்தயம் தாளித்து சின்ன வெங்காயம், பூண்டு, கறிவேப்பிலை வதக்கவும்."
},
{
"e": "Add the sambar powder, tamarind juice, salt and jaggery; simmer for 15 minutes until the oil floats on top.",
"t": "சாம்பார் பொடி, புளிக்கரைசல், உப்பு, வெல்லம் சேர்த்து எண்ணெய் மேலே மிதக்கும் வரை 15 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Puli kuzhambu",
"servings": 4,
"prep": 10,
"cook": 30,
"note": "Goes well with potato roast and appalam.",
"note_ta": "உருளைக்கிழங்கு வறுவல், அப்பளத்துடன் நன்றாக இருக்கும்.",
"ingredients": [
{
"n": "Tamarind",
"t": "புளி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Vegetable (brinjal, drumstick or okra)",
"t": "காய்கறி",
"q": 1.5,
"u": "cup"
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
"e": "Extract 2 cups of tamarind juice.",
"t": "2 கப் புளிக்கரைசல் எடுக்கவும்."
},
{
"e": "Temper mustard and fenugreek in oil, fry the shallots, vegetables and curry leaves for 3 minutes.",
"t": "எண்ணெயில் கடுகு, வெந்தயம் தாளித்து சின்ன வெங்காயம், காய்கறிகள், கறிவேப்பிலையை 3 நிமிடம் வதக்கவும்."
},
{
"e": "Add the sambar powder, juice, salt and jaggery and simmer for 15 to 20 minutes until thick.",
"t": "சாம்பார் பொடி, புளிக்கரைசல், உப்பு, வெல்லம் சேர்த்து 15 முதல் 20 நிமிடம் கெட்டியாகும் வரை கொதிக்கவிடவும்."
}
]
},
{
"dish": "Milagu kuzhambu",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Pepper is the main flavour and good for colds.",
"note_ta": "மிளகு முக்கிய சுவை; சளிக்கு நல்லது.",
"ingredients": [
{
"n": "Tamarind",
"t": "புளி",
"q": 1.5,
"u": "tbsp"
},
{
"n": "Pepper",
"t": "மிளகு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
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
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
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
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "sprig"
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
"e": "Roast the pepper, dal, cumin and chillies and grind to a coarse powder.",
"t": "மிளகு, பருப்பு, சீரகம், மிளகாயை வறுத்து கொரகொரப்பாகப் பொடிக்கவும்."
},
{
"e": "Temper mustard and curry leaves in oil, add the tamarind juice, salt and the powder.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளித்து புளிக்கரைசல், உப்பு, பொடியைச் சேர்க்கவும்."
},
{
"e": "Simmer for 12 minutes until thick. Serve with rice and ghee.",
"t": "12 நிமிடம் கெட்டியாகும் வரை கொதிக்கவிட்டு சாதம், நெய்யுடன் பரிமாறவும்."
}
]
},
{
"dish": "Poondu kuzhambu",
"servings": 4,
"prep": 10,
"cook": 30,
"note": "Whole garlic cloves turn sweet and soft in the gravy.",
"note_ta": "முழு பூண்டு பற்கள் குழம்பில் இனிப்பாக மென்மையாகிவிடும்.",
"ingredients": [
{
"n": "Garlic cloves, peeled",
"t": "பூண்டு",
"q": 20.0,
"u": "clove"
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
"q": 6.0,
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
"e": "Fry the garlic and shallots in oil until lightly golden.",
"t": "பூண்டு, சின்ன வெங்காயத்தை எண்ணெயில் லேசாகப் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Temper mustard, fenugreek and curry leaves; add the sambar powder and tamarind juice with salt.",
"t": "கடுகு, வெந்தயம், கறிவேப்பிலை தாளித்து சாம்பார் பொடி, புளிக்கரைசல், உப்பு சேர்க்கவும்."
},
{
"e": "Add the fried garlic and simmer for 20 minutes until the oil separates.",
"t": "வதக்கிய பூண்டைச் சேர்த்து எண்ணெய் பிரியும் வரை 20 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Kathirikai kuzhambu",
"servings": 4,
"prep": 15,
"cook": 30,
"note": "Keep the brinjal in large pieces so it does not melt.",
"note_ta": "கத்தரிக்காயைப் பெரிய துண்டுகளாக வைத்தால் குழையாது.",
"ingredients": [
{
"n": "Brinjal, cut in pieces",
"t": "கத்தரிக்காய்",
"q": 250.0,
"u": "g"
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
"n": "Tomato",
"t": "தக்காளி",
"q": 1.0,
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
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
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
"e": "Fry the brinjal in a little oil until lightly browned and set aside.",
"t": "கத்தரிக்காயை சிறிது எண்ணெயில் லேசாக வதக்கி எடுக்கவும்."
},
{
"e": "Temper mustard, fenugreek and curry leaves; fry the shallots and tomato until soft.",
"t": "கடுகு, வெந்தயம், கறிவேப்பிலை தாளித்து சின்ன வெங்காயம், தக்காளியை மென்மையாக வதக்கவும்."
},
{
"e": "Add the sambar powder, tamarind juice, salt and brinjal and simmer 15 minutes.",
"t": "சாம்பார் பொடி, புளிக்கரைசல், உப்பு, கத்தரிக்காய் சேர்த்து 15 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Paruppu urundai kuzhambu",
"servings": 4,
"prep": 40,
"cook": 35,
"note": "The dal balls cook in the simmering gravy; do not stir hard.",
"note_ta": "பருப்பு உருண்டைகள் கொதிக்கும் குழம்பில் வேகும்; அதிகமாகக் கிளறாதீர்கள்.",
"ingredients": [
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 0.25,
"u": "cup"
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
"n": "Tamarind",
"t": "புளி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Sambar powder",
"t": "சாம்பார் பொடி",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Shallots",
"t": "சின்ன வெங்காயம்",
"q": 6.0,
"u": "piece"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
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
"e": "Soak the dals for 1 hour, then grind coarsely with the chillies, fennel and salt.",
"t": "பருப்புகளை 1 மணி நேரம் ஊறவைத்து மிளகாய், சோம்பு, உப்புடன் கொரகொரப்பாக அரைக்கவும்."
},
{
"e": "Steam the dal mixture as small balls for 10 minutes.",
"t": "அரைத்ததை சிறு உருண்டைகளாக்கி 10 நிமிடம் ஆவியில் வேகவிடவும்."
},
{
"e": "Make a gravy of shallots, sambar powder and tamarind juice with a mustard tempering; simmer 10 minutes.",
"t": "கடுகு தாளித்து சின்ன வெங்காயம், சாம்பார் பொடி, புளிக்கரைசலுடன் குழம்பு தயாரித்து 10 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Gently add the balls and simmer for 8 more minutes.",
"t": "உருண்டைகளை மெதுவாகச் சேர்த்து மேலும் 8 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Paagarkai pitlai",
"servings": 4,
"prep": 15,
"cook": 30,
"note": "A little jaggery balances the bitterness.",
"note_ta": "சிறிது வெல்லம் கசப்பைச் சமன் செய்யும்.",
"ingredients": [
{
"n": "Bitter gourd, sliced",
"t": "பாகற்காய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Coriander seeds",
"t": "மல்லி விதை",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 4.0,
"u": "piece"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
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
"e": "Cook the dal until soft. Roast the coriander, chana dal and chillies and grind with the coconut.",
"t": "பருப்பை குழைய வேகவிடவும். மல்லி, கடலைப்பருப்பு, மிளகாயை வறுத்து தேங்காயுடன் அரைக்கவும்."
},
{
"e": "Cook the bitter gourd in tamarind water with salt and jaggery until tender.",
"t": "பாகற்காயை புளித்தண்ணீர், உப்பு, வெல்லத்துடன் வேகவிடவும்."
},
{
"e": "Add the dal and ground masala and simmer 8 minutes; temper with mustard.",
"t": "பருப்பு, அரைத்த மசாலா சேர்த்து 8 நிமிடம் கொதிக்கவிட்டு கடுகு தாளிக்கவும்."
}
]
},
{
"dish": "Paruppu",
"servings": 4,
"prep": 5,
"cook": 20,
"note": "The simplest daily dal, eaten with ghee and rice.",
"note_ta": "தினசரி பருப்பு; நெய், சாதத்துடன் சாப்பிடவும்.",
"ingredients": [
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 1.0,
"u": "cup"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
},
{
"n": "Ghee",
"t": "நெய்",
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
"e": "Pressure cook the dal with turmeric and 3 cups of water until very soft.",
"t": "பருப்பை மஞ்சளுடன் 3 கப் தண்ணீர் சேர்த்து மிகவும் குழைய வேகவிடவும்."
},
{
"e": "Mash with salt.",
"t": "உப்புடன் மசிக்கவும்."
},
{
"e": "Temper cumin and crushed garlic in ghee and pour over.",
"t": "நெய்யில் சீரகம், இடித்த பூண்டு தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Tomato pappu",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "A popular Andhra-style dal; goes with rice and ghee.",
"note_ta": "ஆந்திரா பாணி பருப்பு; சாதம், நெய்யுடன் சாப்பிடவும்.",
"ingredients": [
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 1.0,
"u": "cup"
},
{
"n": "Tomatoes",
"t": "தக்காளி",
"q": 3.0,
"u": "piece"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Mustard and cumin seeds",
"t": "கடுகு, சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 4.0,
"u": "clove"
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
"e": "Pressure cook the dal with the tomatoes, chilli and turmeric until soft.",
"t": "பருப்பை தக்காளி, மிளகாய், மஞ்சளுடன் குழைய வேகவிடவும்."
},
{
"e": "Mash with salt and a little water to a thick consistency.",
"t": "உப்பு, சிறிது தண்ணீருடன் கெட்டியாக மசிக்கவும்."
},
{
"e": "Temper mustard, cumin, garlic and curry leaves in oil and pour over.",
"t": "எண்ணெயில் கடுகு, சீரகம், பூண்டு, கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Thakkali kothsu",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "A tangy side for pongal and idli.",
"note_ta": "பொங்கல், இட்லிக்கு ஏற்ற புளிப்பான துணை.",
"ingredients": [
{
"n": "Tomatoes, chopped",
"t": "தக்காளி",
"q": 4.0,
"u": "piece"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sambar powder",
"t": "சாம்பார் பொடி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
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
"e": "Temper mustard and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the tomatoes and cook until mushy, then the tamarind, sambar powder, jaggery and salt.",
"t": "தக்காளியை குழைய வதக்கி புளி, சாம்பார் பொடி, வெல்லம், உப்பு சேர்க்கவும்."
},
{
"e": "Simmer for 5 minutes until thick.",
"t": "5 நிமிடம் கெட்டியாகும் வரை கொதிக்கவிடவும்."
}
]
},
{
"dish": "Kathirikai kothsu",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Roast the brinjal over flame first for a smoky taste if you like.",
"note_ta": "விரும்பினால் முதலில் கத்தரிக்காயை நெருப்பில் சுட்டால் புகை வாசனை கிடைக்கும்.",
"ingredients": [
{
"n": "Brinjal, chopped",
"t": "கத்தரிக்காய்",
"q": 250.0,
"u": "g"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sambar powder",
"t": "சாம்பார் பொடி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
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
"e": "Temper mustard and curry leaves in oil, add the brinjal and cook until soft.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளித்து கத்தரிக்காயை மென்மையாக வதக்கவும்."
},
{
"e": "Add the tamarind juice, sambar powder, jaggery and salt.",
"t": "புளிக்கரைசல், சாம்பார் பொடி, வெல்லம், உப்பு சேர்க்கவும்."
},
{
"e": "Simmer until thick and mash lightly.",
"t": "கெட்டியாகும் வரை கொதிக்கவிட்டு லேசாக மசிக்கவும்."
}
]
},
{
"dish": "Salna",
"servings": 4,
"prep": 15,
"cook": 30,
"note": "A thin, spicy gravy to go with parotta.",
"note_ta": "பரோட்டாவுடன் சாப்பிட ஏற்ற மெல்லிய காரக் குழம்பு.",
"ingredients": [
{
"n": "Onion, sliced",
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
"n": "Mixed vegetables",
"t": "கலவை காய்கறிகள்",
"q": 1.0,
"u": "cup"
},
{
"n": "Coconut, fennel and poppy seeds paste",
"t": "தேங்காய் சோம்பு விழுது",
"q": 3.0,
"u": "tbsp"
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
"u": "tsp"
},
{
"n": "Whole spices (cinnamon, clove, cardamom)",
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
"e": "Fry the whole spices, onion and paste until golden.",
"t": "மசாலாக்கள், வெங்காயம், விழுதைப் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Add the tomato, powders and vegetables with salt and cook until soft.",
"t": "தக்காளி, தூள்கள், காய்கறிகள், உப்பு சேர்த்து மென்மையாக வேகவிடவும்."
},
{
"e": "Add the coconut paste and 2 cups of water and simmer for 15 minutes.",
"t": "தேங்காய் விழுது, 2 கப் தண்ணீர் சேர்த்து 15 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Kadala curry",
"servings": 4,
"prep": 15,
"cook": 30,
"note": "Soak the black chickpeas overnight.",
"note_ta": "கருப்புக் கடலையை இரவு முழுவதும் ஊறவைக்கவும்.",
"ingredients": [
{
"n": "Black chickpeas (kala chana), soaked",
"t": "கருப்புக் கடலை",
"q": 1.0,
"u": "cup"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
},
{
"n": "Chilli, coriander and garam masala powders",
"t": "மசாலா தூள்கள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Mustard seeds and curry leaves",
"t": "கடுகு, கறிவேப்பிலை",
"q": 1.0,
"u": "tsp"
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
"e": "Pressure cook the chickpeas with salt until soft.",
"t": "கடலையை உப்புடன் குக்கரில் மென்மையாக வேகவிடவும்."
},
{
"e": "Fry the onion and tomato with the powders until a thick masala forms; add the coconut ground with a little water.",
"t": "வெங்காயம், தக்காளியை தூள்களுடன் கெட்டியான மசாலாவாக வதக்கி தண்ணீருடன் அரைத்த தேங்காயைச் சேர்க்கவும்."
},
{
"e": "Add the chickpeas and simmer 10 minutes; temper with mustard and curry leaves. Serve with puttu.",
"t": "கடலையைச் சேர்த்து 10 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளித்து புட்டுடன் பரிமாறவும்."
}
]
},
{
"dish": "Veg stew",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Serve with appam or idiyappam.",
"note_ta": "ஆப்பம் அல்லது இடியாப்பத்துடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Potato, carrot, beans, peas (cubed)",
"t": "காய்கறிகள்",
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
"e": "Pour in the thick coconut milk and warm through without boiling.",
"t": "கெட்டியான தேங்காய்ப் பாலை ஊற்றி கொதிக்க விடாமல் சூடாக்கவும்."
}
]
},
{
"dish": "Lemon rasam",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Add the lemon juice off the heat to keep the flavour fresh.",
"note_ta": "எலுமிச்சை சாற்றை அடுப்பை அணைத்த பின் சேர்த்தால் புத்துணர்ச்சி இருக்கும்.",
"ingredients": [
{
"n": "Toor dal, cooked and mashed",
"t": "வேகவைத்த துவரம்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Rasam powder",
"t": "ரசப்பொடி",
"q": 2.0,
"u": "tsp"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சை சாறு",
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
"e": "Boil the tomato with the rasam powder, turmeric, salt and 3 cups of water for 5 minutes.",
"t": "தக்காளியை ரசப்பொடி, மஞ்சள், உப்பு, 3 கப் தண்ணீருடன் 5 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the dal water and bring to a froth.",
"t": "பருப்புத் தண்ணீர் சேர்த்து நுரை வரும் வரை சூடாக்கவும்."
},
{
"e": "Switch off, add the lemon juice and a tempering of mustard and curry leaves in ghee.",
"t": "அடுப்பை அணைத்து எலுமிச்சை சாறு சேர்த்து நெய்யில் கடுகு, கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Tomato rasam",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Crush the tomatoes well by hand for a tangier rasam.",
"note_ta": "தக்காளியை கையால் நன்கு பிசைந்தால் புளிப்பு கூடும்.",
"ingredients": [
{
"n": "Tomatoes",
"t": "தக்காளி",
"q": 3.0,
"u": "piece"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Toor dal, cooked",
"t": "வேகவைத்த துவரம்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Rasam powder",
"t": "ரசப்பொடி",
"q": 2.0,
"u": "tsp"
},
{
"n": "Garlic, crushed",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
},
{
"n": "Mustard and cumin seeds",
"t": "கடுகு, சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Ghee",
"t": "நெய்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
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
"e": "Boil the crushed tomatoes with tamarind, rasam powder, garlic and salt for 8 minutes.",
"t": "பிசைந்த தக்காளியை புளி, ரசப்பொடி, பூண்டு, உப்புடன் 8 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the dal water and 2 cups of water and heat until frothy.",
"t": "பருப்புத் தண்ணீர், 2 கப் தண்ணீர் சேர்த்து நுரை வரும் வரை சூடாக்கவும்."
},
{
"e": "Temper mustard and cumin in ghee, pour over and garnish with coriander.",
"t": "நெய்யில் கடுகு, சீரகம் தாளித்து ஊற்றி கொத்தமல்லி தூவவும்."
}
]
},
{
"dish": "Pepper rasam",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Excellent for colds and sore throats.",
"note_ta": "சளி, தொண்டைக்கு மிகவும் நல்லது.",
"ingredients": [
{
"n": "Pepper",
"t": "மிளகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Cumin seeds",
"t": "சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Toor dal, cooked",
"t": "வேகவைத்த துவரம்பருப்பு",
"q": 0.25,
"u": "cup"
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
"e": "Crush the pepper, cumin and garlic coarsely.",
"t": "மிளகு, சீரகம், பூண்டை கொரகொரப்பாக இடிக்கவும்."
},
{
"e": "Boil the tamarind water with salt, add the crushed mix and the dal water; heat until frothy.",
"t": "புளித்தண்ணீரை உப்புடன் கொதிக்கவிட்டு இடித்த கலவை, பருப்புத் தண்ணீர் சேர்த்து நுரை வரும் வரை சூடாக்கவும்."
},
{
"e": "Temper mustard and curry leaves in ghee and pour over.",
"t": "நெய்யில் கடுகு, கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Poondu rasam",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "Garlic cooked lightly keeps the rasam gentle on the stomach.",
"note_ta": "பூண்டை லேசாக வேகவிட்டால் ரசம் வயிற்றுக்கு இதமாக இருக்கும்.",
"ingredients": [
{
"n": "Garlic, crushed",
"t": "பூண்டு",
"q": 8.0,
"u": "clove"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Rasam powder",
"t": "ரசப்பொடி",
"q": 2.0,
"u": "tsp"
},
{
"n": "Toor dal, cooked",
"t": "வேகவைத்த துவரம்பருப்பு",
"q": 0.25,
"u": "cup"
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
"e": "Boil the tamarind water with the tomato, rasam powder, salt and half the garlic for 6 minutes.",
"t": "புளித்தண்ணீரை தக்காளி, ரசப்பொடி, உப்பு, பாதி பூண்டுடன் 6 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the dal water and heat until frothy.",
"t": "பருப்புத் தண்ணீர் சேர்த்து நுரை வரும் வரை சூடாக்கவும்."
},
{
"e": "Fry the remaining garlic with mustard and curry leaves in ghee and pour over.",
"t": "மீதமுள்ள பூண்டு, கடுகு, கறிவேப்பிலையை நெய்யில் வறுத்துக் கொட்டவும்."
}
]
},
{
"dish": "Paruppu rasam",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "A thicker rasam made with more dal.",
"note_ta": "அதிக பருப்பு சேர்த்த கெட்டியான ரசம்.",
"ingredients": [
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Rasam powder",
"t": "ரசப்பொடி",
"q": 2.0,
"u": "tsp"
},
{
"n": "Mustard and cumin seeds",
"t": "கடுகு, சீரகம்",
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
"n": "Ghee",
"t": "நெய்",
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
"e": "Cook the dal until very soft and mash with 2 cups of water.",
"t": "பருப்பை மிகவும் குழைய வேகவைத்து 2 கப் தண்ணீருடன் மசிக்கவும்."
},
{
"e": "Boil the tomato with tamarind water, rasam powder and salt for 5 minutes.",
"t": "தக்காளியை புளித்தண்ணீர், ரசப்பொடி, உப்புடன் 5 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the dal, heat until frothy and temper with mustard, cumin and curry leaves in ghee.",
"t": "பருப்பைச் சேர்த்து நுரைக்கும் வரை சூடாக்கி நெய்யில் கடுகு, சீரகம், கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Olan",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "A mild Kerala side; do not add spices apart from green chilli.",
"note_ta": "கேரளாவின் மென்மையான சைட் டிஷ்; பச்சை மிளகாயைத் தவிர மசாலா சேர்க்க வேண்டாம்.",
"ingredients": [
{
"n": "Ash gourd (or pumpkin), cubed",
"t": "வெள்ளைப் பூசணி",
"q": 2.0,
"u": "cup"
},
{
"n": "Black-eyed peas, cooked",
"t": "காராமணி",
"q": 0.5,
"u": "cup"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
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
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Cook the gourd with green chilli and salt in a little water until tender.",
"t": "பூசணியை பச்சை மிளகாய், உப்புடன் சிறிது தண்ணீரில் வேகவிடவும்."
},
{
"e": "Add the cooked peas and pour in the thick coconut milk; warm gently without boiling.",
"t": "வேகவைத்த காராமணியைச் சேர்த்து கெட்டியான தேங்காய்ப் பாலை ஊற்றி கொதிக்க விடாமல் சூடாக்கவும்."
},
{
"e": "Finish with coconut oil and curry leaves.",
"t": "தேங்காய் எண்ணெய், கறிவேப்பிலை சேர்த்து இறக்கவும்."
}
]
},
{
"dish": "Erissery",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Made with pumpkin and red beans, topped with fried coconut.",
"note_ta": "பூசணி, சிவப்புக் காராமணியுடன் தேங்காய் வறுத்துச் சேர்க்கவும்.",
"ingredients": [
{
"n": "Pumpkin, cubed",
"t": "பூசணிக்காய்",
"q": 2.0,
"u": "cup"
},
{
"n": "Red cowpeas (vanpayar), cooked",
"t": "சிவப்பு காராமணி",
"q": 0.5,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
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
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
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
"e": "Cook the pumpkin and peas with turmeric, chilli and salt until soft.",
"t": "பூசணி, காராமணியை மஞ்சள், மிளகாய், உப்புடன் மென்மையாக வேகவிடவும்."
},
{
"e": "Grind half the coconut with cumin and mix in; mash lightly.",
"t": "பாதி தேங்காயை சீரகத்துடன் அரைத்துச் சேர்த்து லேசாக மசிக்கவும்."
},
{
"e": "Fry the remaining coconut with mustard and curry leaves in coconut oil until golden and pour over.",
"t": "மீதமுள்ள தேங்காயை கடுகு, கறிவேப்பிலையுடன் தேங்காய் எண்ணெயில் பொன்னிறமாக வறுத்துக் கொட்டவும்."
}
]
},
{
"dish": "Pulissery",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Sour curd gives the real taste; do not boil after adding it.",
"note_ta": "புளித்த தயிர் உண்மையான சுவை தரும்; சேர்த்த பின் கொதிக்க விடாதீர்கள்.",
"ingredients": [
{
"n": "Ripe mango or ash gourd",
"t": "மாம்பழம்",
"q": 1.5,
"u": "cup"
},
{
"n": "Sour curd",
"t": "புளித்த தயிர்",
"q": 1.5,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.5,
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
"n": "Coconut oil",
"t": "தேங்காய் எண்ணெய்",
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
"e": "Cook the mango or gourd with turmeric, salt and a little water until soft.",
"t": "மாம்பழம் அல்லது பூசணியை மஞ்சள், உப்பு, சிறிது தண்ணீருடன் மென்மையாக வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin to a paste and stir in.",
"t": "தேங்காய், மிளகாய், சீரகத்தை விழுதாக அரைத்துச் சேர்க்கவும்."
},
{
"e": "Lower the heat, whisk in the curd and warm without boiling.",
"t": "தீயைக் குறைத்து தயிரை அடித்துச் சேர்த்து கொதிக்க விடாமல் சூடாக்கவும்."
},
{
"e": "Temper with mustard, fenugreek and curry leaves in coconut oil.",
"t": "தேங்காய் எண்ணெயில் கடுகு, வெந்தயம், கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Cabbage thoran",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "Do not cover the pan so the cabbage stays crisp and bright.",
"note_ta": "முட்டைக்கோஸ் மொறுமொறுப்பாக இருக்க மூடாமல் சமைக்கவும்.",
"ingredients": [
{
"n": "Cabbage, finely shredded",
"t": "முட்டைக்கோஸ்",
"q": 3.0,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.5,
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
"q": 0.5,
"u": "tsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
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
"e": "Crush the coconut, chilli and cumin coarsely together.",
"t": "தேங்காய், மிளகாய், சீரகத்தை சேர்த்து கொரகொரப்பாக இடிக்கவும்."
},
{
"e": "Temper mustard, urad dal and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, உளுத்தம்பருப்பு, கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the cabbage and salt, cook 3 minutes, then add the coconut mix and cook 3 more minutes.",
"t": "முட்டைக்கோஸ், உப்பு சேர்த்து 3 நிமிடம் வதக்கி தேங்காய்க் கலவையைச் சேர்த்து மேலும் 3 நிமிடம் வேகவிடவும்."
}
]
},
{
"dish": "Chow chow kootu",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Serve with rice and sambar or rasam.",
"note_ta": "சாதம், சாம்பார் அல்லது ரசத்துடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Chow chow, cubed",
"t": "சௌசௌ",
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
"e": "Cook the dal until soft. Cook the chow chow with salt until tender.",
"t": "பருப்பை குழைய வேகவிடவும். சௌசௌவை உப்புடன் வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin to a paste and mix with the dal and vegetable.",
"t": "தேங்காய், மிளகாய், சீரகத்தை விழுதாக அரைத்து பருப்பு, காயுடன் கலக்கவும்."
},
{
"e": "Simmer 5 minutes and temper with mustard and curry leaves.",
"t": "5 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Avarakkai kootu",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Cluster-free flat beans cook faster; string them well.",
"note_ta": "நார் நீக்கி நறுக்கினால் அவரைக்காய் சீக்கிரம் வேகும்.",
"ingredients": [
{
"n": "Flat beans (avarakkai), chopped",
"t": "அவரைக்காய்",
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
"e": "Cook the dal until soft. Cook the beans with salt until tender.",
"t": "பருப்பை குழைய வேகவிடவும். அவரைக்காயை உப்புடன் வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin and mix with the dal and beans.",
"t": "தேங்காய், மிளகாய், சீரகத்தை அரைத்து பருப்பு, அவரையுடன் கலக்கவும்."
},
{
"e": "Simmer 5 minutes and temper with mustard and curry leaves.",
"t": "5 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Poricha kootu",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "A coconut-pepper kootu with mixed vegetables.",
"note_ta": "காய்கறிகளுடன் செய்யும் தேங்காய் மிளகு கூட்டு.",
"ingredients": [
{
"n": "Mixed vegetables (cabbage, beans, carrot)",
"t": "கலவை காய்கறிகள்",
"q": 2.0,
"u": "cup"
},
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
},
{
"n": "Pepper and cumin",
"t": "மிளகு, சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
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
"e": "Cook the dal until soft and the vegetables with salt until tender.",
"t": "பருப்பை குழைய வேகவிடவும்; காய்கறிகளை உப்புடன் வேகவிடவும்."
},
{
"e": "Fry the urad dal with pepper and cumin, then grind with the coconut.",
"t": "உளுத்தம்பருப்பை மிளகு, சீரகத்துடன் வறுத்து தேங்காயுடன் அரைக்கவும்."
},
{
"e": "Mix everything, simmer 5 minutes and temper with mustard and curry leaves.",
"t": "எல்லாவற்றையும் கலந்து 5 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Peerkangai kootu",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Use the peel too; it is full of fibre.",
"note_ta": "தோலையும் பயன்படுத்தினால் நார்ச்சத்து அதிகம்.",
"ingredients": [
{
"n": "Ridge gourd, cubed",
"t": "பீர்க்கங்காய்",
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
"e": "Cook the dal until soft. Cook the ridge gourd with salt until tender.",
"t": "பருப்பை குழைய வேகவிடவும். பீர்க்கங்காயை உப்புடன் வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin and mix everything.",
"t": "தேங்காய், மிளகாய், சீரகத்தை அரைத்து எல்லாவற்றையும் கலக்கவும்."
},
{
"e": "Simmer 5 minutes and temper with mustard and curry leaves.",
"t": "5 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Pudalangai kootu",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Scrape out the seeds of mature snake gourd before cooking.",
"note_ta": "முற்றிய புடலங்காயின் விதைகளை நீக்கிச் சமைக்கவும்.",
"ingredients": [
{
"n": "Snake gourd, chopped",
"t": "புடலங்காய்",
"q": 2.0,
"u": "cup"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
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
"e": "Cook the chana dal until soft. Cook the snake gourd with salt until tender.",
"t": "கடலைப்பருப்பை குழைய வேகவிடவும். புடலங்காயை உப்புடன் வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin and mix with the dal and gourd.",
"t": "தேங்காய், மிளகாய், சீரகத்தை அரைத்து பருப்பு, காயுடன் கலக்கவும்."
},
{
"e": "Simmer 5 minutes and temper with mustard and curry leaves.",
"t": "5 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Suraikkai kootu",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Bottle gourd is mild and cooling; good for hot days.",
"note_ta": "சுரைக்காய் மென்மையானது, குளிர்ச்சி தரும்; வெயில் நாட்களுக்கு நல்லது.",
"ingredients": [
{
"n": "Bottle gourd, cubed",
"t": "சுரைக்காய்",
"q": 2.0,
"u": "cup"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
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
"e": "Cook the chana dal until soft. Cook the bottle gourd with salt until tender.",
"t": "கடலைப்பருப்பை குழைய வேகவிடவும். சுரைக்காயை உப்புடன் வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin and mix with the dal and gourd.",
"t": "தேங்காய், மிளகாய், சீரகத்தை அரைத்து பருப்பு, காயுடன் கலக்கவும்."
},
{
"e": "Simmer 5 minutes and temper with mustard and curry leaves.",
"t": "5 நிமிடம் கொதிக்கவிட்டு கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Keerai kootu",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Do not cover the pot while cooking greens to keep their green colour.",
"note_ta": "கீரையின் பச்சை நிறம் மாறாமல் இருக்க மூடாமல் சமைக்கவும்.",
"ingredients": [
{
"n": "Greens (spinach or vallarai), chopped",
"t": "கீரை",
"q": 3.0,
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
"n": "Garlic",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
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
"e": "Cook the dal until soft. Cook the greens with salt for 5 minutes.",
"t": "பருப்பை குழைய வேகவிடவும். கீரையை உப்புடன் 5 நிமிடம் வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and cumin and mix everything.",
"t": "தேங்காய், மிளகாய், சீரகத்தை அரைத்து எல்லாவற்றையும் கலக்கவும்."
},
{
"e": "Temper with mustard, garlic and curry leaves and pour over.",
"t": "கடுகு, பூண்டு, கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Beans usili",
"servings": 4,
"prep": 20,
"cook": 20,
"note": "Steam the dal crumble well so it is soft and not raw.",
"note_ta": "பருப்பு உதிரியை நன்கு ஆவியில் வேகவைத்தால் பச்சை வாசனை இருக்காது.",
"ingredients": [
{
"n": "French beans, finely chopped",
"t": "பீன்ஸ்",
"q": 250.0,
"u": "g"
},
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 3.0,
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
"e": "Soak the dals for 1 hour, grind coarsely with the chillies and salt, and steam as a block for 10 minutes; crumble.",
"t": "பருப்புகளை 1 மணி நேரம் ஊறவைத்து மிளகாய், உப்புடன் கொரகொரப்பாக அரைத்து 10 நிமிடம் ஆவியில் வேகவைத்து உதிர்க்கவும்."
},
{
"e": "Cook the beans with salt and a splash of water until tender.",
"t": "பீன்ஸை உப்பு, சிறிது தண்ணீருடன் வேகவிடவும்."
},
{
"e": "Temper mustard and curry leaves in oil, add the beans and the crumble and toss until dry.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளித்து பீன்ஸ், பருப்பு உதிரியைச் சேர்த்து ஈரம் போகும் வரை புரட்டவும்."
}
]
},
{
"dish": "Cluster beans poriyal",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Cluster beans can be slightly bitter; the coconut balances it.",
"note_ta": "கொத்தவரங்காய் சற்று கசக்கும்; தேங்காய் அதைச் சமன் செய்யும்.",
"ingredients": [
{
"n": "Cluster beans (kothavarangai), chopped",
"t": "கொத்தவரங்காய்",
"q": 250.0,
"u": "g"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
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
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
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
"e": "Add the beans, salt and a splash of water; cover and cook until tender.",
"t": "பீன்ஸ், உப்பு, சிறிது தண்ணீர் சேர்த்து மூடி வேகவிடவும்."
},
{
"e": "Stir in the coconut and cook a minute more.",
"t": "தேங்காய் சேர்த்து மேலும் ஒரு நிமிடம் வதக்கவும்."
}
]
},
{
"dish": "Kovakkai fry",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Slice thin so they crisp up.",
"note_ta": "மெல்லியதாக நறுக்கினால் மொறுமொறுப்பாக வரும்.",
"ingredients": [
{
"n": "Ivy gourd (kovakkai), sliced",
"t": "கோவக்காய்",
"q": 250.0,
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
"n": "Rice flour",
"t": "அரிசி மாவு",
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
"e": "Toss the sliced gourd with the powders, rice flour and salt.",
"t": "நறுக்கிய கோவக்காயை தூள்கள், அரிசி மாவு, உப்புடன் புரட்டவும்."
},
{
"e": "Temper mustard and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the gourd and cook uncovered on medium heat, stirring, until crisp and golden.",
"t": "கோவக்காயைச் சேர்த்து மூடாமல் நடுத்தரத் தீயில் கிளறி மொறுமொறுப்பாக பொன்னிறமாக வதக்கவும்."
}
]
},
{
"dish": "Senaikizhangu fry",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Boil the yam with a little tamarind to avoid itchiness.",
"note_ta": "அரிப்பு வராமல் இருக்க சேனைக்கிழங்கை சிறிது புளி சேர்த்து வேகவைக்கவும்.",
"ingredients": [
{
"n": "Elephant foot yam (senai), cubed",
"t": "சேனைக்கிழங்கு",
"q": 300.0,
"u": "g"
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
"e": "Boil the yam cubes in salted water until just tender and drain.",
"t": "சேனைக்கிழங்கை உப்புத் தண்ணீரில் வெறுமனே வேகவைத்து வடிக்கவும்."
},
{
"e": "Coat with the powders and rice flour.",
"t": "தூள்கள், அரிசி மாவு பூசவும்."
},
{
"e": "Shallow fry in oil with curry leaves until crisp and golden.",
"t": "கறிவேப்பிலையுடன் எண்ணெயில் மொறுமொறுப்பாக பொன்னிறமாக வறுக்கவும்."
}
]
},
{
"dish": "Chepankizhangu roast",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Boil the colocasia until just done, not mushy, before roasting.",
"note_ta": "சேப்பங்கிழங்கை குழையாமல் வேகவைத்த பின் வறுக்கவும்.",
"ingredients": [
{
"n": "Colocasia (chepankizhangu)",
"t": "சேப்பங்கிழங்கு",
"q": 300.0,
"u": "g"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 1.5,
"u": "tsp"
},
{
"n": "Coriander powder",
"t": "மல்லித் தூள்",
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
"e": "Pressure cook the colocasia for 2 whistles, cool, peel and slice.",
"t": "சேப்பங்கிழங்கை 2 விசில் வேகவைத்து ஆறவிட்டு தோல் நீக்கி நறுக்கவும்."
},
{
"e": "Toss with the powders and salt.",
"t": "தூள்கள், உப்புடன் புரட்டவும்."
},
{
"e": "Shallow fry in oil with curry leaves, turning, until crisp and golden.",
"t": "கறிவேப்பிலையுடன் எண்ணெயில் திருப்பிப் போட்டு மொறுமொறுப்பாக பொன்னிறமாக வறுக்கவும்."
}
]
},
{
"dish": "Kathirikai poriyal",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Keep the brinjal in small cubes and cook it uncovered.",
"note_ta": "கத்தரிக்காயை சிறு துண்டுகளாக நறுக்கி மூடாமல் வதக்கவும்.",
"ingredients": [
{
"n": "Brinjal, cubed",
"t": "கத்தரிக்காய்",
"q": 300.0,
"u": "g"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Mustard and urad dal",
"t": "கடுகு, உளுத்தம்பருப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chilli and coriander powder",
"t": "மிளகாய், மல்லித் தூள்",
"q": 2.0,
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
"e": "Temper mustard, urad dal and curry leaves in oil; fry the onion until soft.",
"t": "எண்ணெயில் கடுகு, உளுத்தம்பருப்பு, கறிவேப்பிலை தாளித்து வெங்காயத்தை மென்மையாக வதக்கவும்."
},
{
"e": "Add the brinjal, powders and salt and cook on medium heat, stirring, until tender and lightly browned.",
"t": "கத்தரிக்காய், தூள்கள், உப்பு சேர்த்து நடுத்தரத் தீயில் கிளறி மென்மையாக லேசாகப் பழுக்கும் வரை வதக்கவும்."
}
]
},
{
"dish": "Vazhaipoo poriyal",
"servings": 4,
"prep": 30,
"cook": 15,
"note": "Clean the florets: remove the stamens and hard parts.",
"note_ta": "பூக்களில் உள்ள நரம்பு, கடினப் பகுதிகளை நீக்கவும்.",
"ingredients": [
{
"n": "Banana flower, cleaned and chopped",
"t": "வாழைப்பூ",
"q": 2.0,
"u": "cup"
},
{
"n": "Moong dal, cooked",
"t": "வேகவைத்த பாசிப்பருப்பு",
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
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
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
"e": "Boil the chopped flower in salted water for 5 minutes and squeeze out the water.",
"t": "நறுக்கிய வாழைப்பூவை உப்புத் தண்ணீரில் 5 நிமிடம் வேகவைத்து தண்ணீரைப் பிழியவும்."
},
{
"e": "Temper mustard, chilli and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the flower and dal, cook until dry and finish with coconut.",
"t": "வாழைப்பூ, பருப்பு சேர்த்து ஈரம் போகும் வரை வதக்கி தேங்காய் சேர்க்கவும்."
}
]
},
{
"dish": "Vazhaithandu poriyal",
"servings": 4,
"prep": 20,
"cook": 15,
"note": "Soak the chopped stem in buttermilk water to stop it darkening.",
"note_ta": "நறுக்கிய வாழைத்தண்டை மோர்த் தண்ணீரில் போட்டால் கருக்காது.",
"ingredients": [
{
"n": "Banana stem, finely chopped",
"t": "வாழைத்தண்டு",
"q": 2.0,
"u": "cup"
},
{
"n": "Moong dal, cooked",
"t": "வேகவைத்த பாசிப்பருப்பு",
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
"n": "Mustard seeds",
"t": "கடுகு",
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
"e": "Remove any fibres while chopping the stem and keep it in buttermilk water.",
"t": "நறுக்கும்போது நார்களை நீக்கி மோர்த் தண்ணீரில் போடவும்."
},
{
"e": "Temper mustard, chilli and curry leaves in oil.",
"t": "எண்ணெயில் கடுகு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."
},
{
"e": "Add the drained stem with salt and cook until tender; stir in the dal and coconut.",
"t": "வடித்த தண்டை உப்புடன் வேகவிட்டு பருப்பு, தேங்காய் சேர்க்கவும்."
}
]
},
{
"dish": "Vazhakkai podimas",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Boil the raw banana whole with the skin to keep it firm.",
"note_ta": "வாழைக்காயை தோலுடன் வேகவைத்தால் உதிரியாக இருக்கும்.",
"ingredients": [
{
"n": "Raw banana",
"t": "வாழைக்காய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
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
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 3.0,
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
"e": "Boil the bananas until soft, then peel and crumble.",
"t": "வாழைக்காயை வேகவைத்து தோல் உரித்து உதிர்க்கவும்."
},
{
"e": "Temper mustard, urad dal and chilli in oil; fry the onion with turmeric.",
"t": "எண்ணெயில் கடுகு, உளுத்தம்பருப்பு, மிளகாய் தாளித்து வெங்காயத்தை மஞ்சளுடன் வதக்கவும்."
},
{
"e": "Add the banana crumble, salt and coconut and toss well.",
"t": "வாழைக்காய் உதிர், உப்பு, தேங்காய் சேர்த்து நன்கு புரட்டவும்."
}
]
},
{
"dish": "Murungai keerai poriyal",
"servings": 4,
"prep": 15,
"cook": 10,
"note": "Pluck the leaves from the stems before measuring.",
"note_ta": "இலைகளைக் காம்பிலிருந்து பறித்து அளக்கவும்.",
"ingredients": [
{
"n": "Drumstick leaves",
"t": "முருங்கைக்கீரை",
"q": 3.0,
"u": "cup"
},
{
"n": "Moong dal, cooked",
"t": "வேகவைத்த பாசிப்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Shallots, chopped",
"t": "சின்ன வெங்காயம்",
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
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 2.0,
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
"e": "Temper mustard and chilli in oil and fry the shallots until soft.",
"t": "எண்ணெயில் கடுகு, மிளகாய் தாளித்து சின்ன வெங்காயத்தை மென்மையாக வதக்கவும்."
},
{
"e": "Add the leaves with salt, cook uncovered for 4 minutes.",
"t": "இலைகள், உப்பு சேர்த்து மூடாமல் 4 நிமிடம் வதக்கவும்."
},
{
"e": "Add the dal and coconut and cook until dry.",
"t": "பருப்பு, தேங்காய் சேர்த்து ஈரம் போகும் வரை வதக்கவும்."
}
]
},
{
"dish": "Pudalangai poriyal",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Young snake gourd needs no peeling.",
"note_ta": "இளம் புடலங்காய்க்கு தோல் சீவ வேண்டாம்.",
"ingredients": [
{
"n": "Snake gourd, chopped",
"t": "புடலங்காய்",
"q": 250.0,
"u": "g"
},
{
"n": "Moong dal, cooked",
"t": "வேகவைத்த பாசிப்பருப்பு",
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
"e": "Add the snake gourd and salt and cook covered for 8 minutes.",
"t": "புடலங்காய், உப்பு சேர்த்து மூடி 8 நிமிடம் வேகவிடவும்."
},
{
"e": "Stir in the dal and coconut and cook until dry.",
"t": "பருப்பு, தேங்காய் சேர்த்து ஈரம் போகும் வரை வதக்கவும்."
}
]
},
{
"dish": "Mochai poriyal",
"servings": 4,
"prep": 15,
"cook": 25,
"note": "Soak the field beans overnight.",
"note_ta": "மொச்சையை இரவு முழுவதும் ஊறவைக்கவும்.",
"ingredients": [
{
"n": "Field beans (mochai), soaked",
"t": "மொச்சை",
"q": 1.0,
"u": "cup"
},
{
"n": "Shallots, chopped",
"t": "சின்ன வெங்காயம்",
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
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
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
"e": "Pressure cook the beans with salt until soft and drain.",
"t": "மொச்சையை உப்புடன் மென்மையாக வேகவைத்து வடிக்கவும்."
},
{
"e": "Temper mustard, chilli and curry leaves in oil and fry the shallots.",
"t": "எண்ணெயில் கடுகு, மிளகாய், கறிவேப்பிலை தாளித்து சின்ன வெங்காயம் வதக்கவும்."
},
{
"e": "Add the beans and coconut and toss for 3 minutes.",
"t": "மொச்சை, தேங்காய் சேர்த்து 3 நிமிடம் புரட்டவும்."
}
]
},
{
"dish": "Gutti vankaya",
"servings": 4,
"prep": 25,
"cook": 25,
"note": "Slit the brinjals in a cross and keep the stem on so they hold their shape.",
"note_ta": "கத்தரிக்காயை காம்புடன் குறுக்காகக் கீறினால் வடிவம் மாறாது.",
"ingredients": [
{
"n": "Small round brinjals",
"t": "சிறிய கத்தரிக்காய்",
"q": 8.0,
"u": "piece"
},
{
"n": "Peanuts",
"t": "வேர்க்கடலை",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Sesame seeds",
"t": "எள்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Dry coconut, grated",
"t": "கொப்பரைத் தேங்காய்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Coriander powder",
"t": "மல்லித் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Tamarind paste",
"t": "புளி விழுது",
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
"e": "Dry roast the peanuts, sesame and coconut and grind with the powders, tamarind and salt to a coarse masala.",
"t": "வேர்க்கடலை, எள், தேங்காயை வறுத்து தூள்கள், புளி, உப்புடன் கொரகொரப்பாக அரைக்கவும்."
},
{
"e": "Stuff the masala into the slit brinjals.",
"t": "மசாலாவை கீறிய கத்தரிக்காய்களில் நிரப்பவும்."
},
{
"e": "Cook in oil on low heat, covered, turning now and then, until tender; add leftover masala with a splash of water.",
"t": "எண்ணெயில் குறைந்த தீயில் மூடி அவ்வப்போது திருப்பி வேகவிடவும்; மீதமுள்ள மசாலாவை சிறிது தண்ணீருடன் சேர்க்கவும்."
}
]
},
{
"dish": "Mor milagai",
"servings": 8,
"prep": 10,
"cook": 5,
"note": "Sun-dry the soaked chillies for 2 to 3 days until crisp, then fry briefly.",
"note_ta": "ஊறவைத்த மிளகாய்களை 2 முதல் 3 நாள் வெயிலில் காயவைத்து மொறுமொறுப்பான பின் லேசாகப் பொரிக்கவும்.",
"ingredients": [
{
"n": "Green chillies, slit",
"t": "பச்சை மிளகாய்",
"q": 20.0,
"u": "piece"
},
{
"n": "Thick sour curd",
"t": "கெட்டியான புளித்த தயிர்",
"q": 1.0,
"u": "cup"
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
"e": "Soak the chillies in curd and salt for a day.",
"t": "மிளகாயை தயிர், உப்பில் ஒரு நாள் ஊறவைக்கவும்."
},
{
"e": "Dry them in the sun for 2 to 3 days until completely crisp; store.",
"t": "2 முதல் 3 நாள் வெயிலில் முழுவதும் மொறுமொறுப்பாகும் வரை காயவைத்து சேமிக்கவும்."
},
{
"e": "Fry a few in hot oil for a few seconds and serve with curd rice.",
"t": "சில மிளகாய்களை சூடான எண்ணெயில் சில நொடிகள் பொரித்து தயிர் சாதத்துடன் பரிமாறவும்."
}
]
},
{
"dish": "Vadam",
"servings": 8,
"prep": 20,
"cook": 5,
"note": "Dry thoroughly in strong sun, turning once a day.",
"note_ta": "நல்ல வெயிலில் தினமும் ஒருமுறை திருப்பி முழுவதும் காயவைக்கவும்.",
"ingredients": [
{
"n": "Sago (javvarisi)",
"t": "ஜவ்வரிசி",
"q": 1.0,
"u": "cup"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 5.0,
"u": "cup"
},
{
"n": "Green chilli paste",
"t": "பச்சை மிளகாய் விழுது",
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
"e": "Boil the water with salt, chilli paste and cumin, add the sago and cook until clear and thick.",
"t": "தண்ணீரை உப்பு, மிளகாய் விழுது, சீரகத்துடன் கொதிக்கவிட்டு ஜவ்வரிசியைச் சேர்த்து தெளிவாகவும் கெட்டியாகவும் வரும் வரை வேகவிடவும்."
},
{
"e": "Drop small spoons on a plastic sheet and sun-dry for 2 to 3 days until hard.",
"t": "சிறு கரண்டிகளாக பிளாஸ்டிக் தாளில் ஊற்றி 2 முதல் 3 நாள் வெயிலில் கெட்டியாகும் வரை காயவைக்கவும்."
},
{
"e": "Fry in hot oil for a few seconds until puffed and serve with rice.",
"t": "சூடான எண்ணெயில் சில நொடிகள் பொங்கும் வரை பொரித்து சாதத்துடன் பரிமாறவும்."
}
]
},
{
"dish": "Pottukadalai chutney",
"servings": 4,
"prep": 5,
"cook": 5,
"note": "Thin with water to the consistency you like.",
"note_ta": "விரும்பிய பதத்திற்கு தண்ணீர் சேர்த்து இளக்கவும்.",
"ingredients": [
{
"n": "Roasted gram (pottukadalai)",
"t": "பொட்டுக்கடலை",
"q": 0.5,
"u": "cup"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 2.0,
"u": "clove"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
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
"e": "Grind the roasted gram with chilli, garlic, salt and water to a smooth chutney.",
"t": "பொட்டுக்கடலையை மிளகாய், பூண்டு, உப்பு, தண்ணீருடன் நைசாக அரைக்கவும்."
},
{
"e": "Temper mustard and curry leaves in oil and pour over.",
"t": "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Coriander chutney",
"servings": 4,
"prep": 10,
"cook": 5,
"note": "Add a small piece of tamarind or a few drops of lemon for tang.",
"note_ta": "புளிப்புக்கு சிறிது புளி அல்லது சில துளி எலுமிச்சை சாறு சேர்க்கவும்.",
"ingredients": [
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி",
"q": 2.0,
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
"q": 3.0,
"u": "piece"
},
{
"n": "Roasted gram",
"t": "பொட்டுக்கடலை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 2.0,
"u": "clove"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
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
"e": "Grind the coriander, coconut, chilli, gram, garlic and salt with a little water to a smooth paste.",
"t": "கொத்தமல்லி, தேங்காய், மிளகாய், பொட்டுக்கடலை, பூண்டு, உப்பை சிறிது தண்ணீருடன் நைசாக அரைக்கவும்."
},
{
"e": "Temper mustard in a little oil and pour over.",
"t": "சிறிது எண்ணெயில் கடுகு தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Curry leaf chutney",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "Fry the leaves until they turn crisp so the chutney keeps for 2 days.",
"note_ta": "இலைகளை மொறுமொறுப்பாக வறுத்தால் சட்னி 2 நாள் வைக்கலாம்.",
"ingredients": [
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 1.0,
"u": "cup"
},
{
"n": "Grated coconut",
"t": "தேங்காய் துருவல்",
"q": 0.25,
"u": "cup"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 3.0,
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
"n": "Garlic",
"t": "பூண்டு",
"q": 2.0,
"u": "clove"
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
"e": "Fry the urad dal, chillies and curry leaves in oil until crisp.",
"t": "உளுத்தம்பருப்பு, மிளகாய், கறிவேப்பிலையை எண்ணெயில் மொறுமொறுப்பாக வறுக்கவும்."
},
{
"e": "Grind with the coconut, tamarind, garlic, salt and a little water.",
"t": "தேங்காய், புளி, பூண்டு, உப்பு, சிறிது தண்ணீருடன் அரைக்கவும்."
}
]
},
{
"dish": "Ginger chutney",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "Serve with idli or dosa; a little goes a long way.",
"note_ta": "இட்லி, தோசையுடன் பரிமாறவும்; சிறிது போதும்.",
"ingredients": [
{
"n": "Ginger, chopped",
"t": "இஞ்சி",
"q": 3.0,
"u": "inch"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 4.0,
"u": "piece"
},
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
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
"e": "Fry the dal, chillies and ginger in oil until golden.",
"t": "பருப்பு, மிளகாய், இஞ்சியை எண்ணெயில் பொன்னிறமாக வறுக்கவும்."
},
{
"e": "Grind with the tamarind, jaggery, salt and a little water.",
"t": "புளி, வெல்லம், உப்பு, சிறிது தண்ணீருடன் அரைக்கவும்."
},
{
"e": "Temper mustard in oil and pour over.",
"t": "எண்ணெயில் கடுகு தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Kara chutney",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "Very spicy; reduce the chillies for children.",
"note_ta": "மிகவும் காரம்; குழந்தைகளுக்கு மிளகாயைக் குறைக்கவும்.",
"ingredients": [
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
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 8.0,
"u": "piece"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 4.0,
"u": "clove"
},
{
"n": "Tamarind",
"t": "புளி",
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
"e": "Fry the chillies, garlic, onion and tomato in oil until soft.",
"t": "மிளகாய், பூண்டு, வெங்காயம், தக்காளியை எண்ணெயில் மென்மையாக வதக்கவும்."
},
{
"e": "Cool, then grind with tamarind and salt to a coarse chutney.",
"t": "ஆறவிட்டு புளி, உப்புடன் கொரகொரப்பாக அரைக்கவும்."
},
{
"e": "Heat a little sesame oil and fry the chutney for 2 minutes.",
"t": "சிறிது நல்லெண்ணெயில் சட்னியை 2 நிமிடம் வதக்கவும்."
}
]
},
{
"dish": "Brinjal chutney",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Roast the brinjal on an open flame for a smoky taste.",
"note_ta": "கத்தரிக்காயை நெருப்பில் சுட்டால் புகை மணம் கிடைக்கும்.",
"ingredients": [
{
"n": "Brinjal",
"t": "கத்தரிக்காய்",
"q": 2.0,
"u": "piece"
},
{
"n": "Onion",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 4.0,
"u": "piece"
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
"e": "Roast the brinjals until soft, peel and mash.",
"t": "கத்தரிக்காயை மென்மையாகச் சுட்டு தோல் உரித்து மசிக்கவும்."
},
{
"e": "Fry the onion and chillies in oil, grind with the tamarind and salt.",
"t": "வெங்காயம், மிளகாயை எண்ணெயில் வதக்கி புளி, உப்புடன் அரைக்கவும்."
},
{
"e": "Mix with the mashed brinjal and temper with mustard.",
"t": "மசித்த கத்தரிக்காயுடன் கலந்து கடுகு தாளிக்கவும்."
}
]
},
{
"dish": "Tomato thokku",
"servings": 8,
"prep": 10,
"cook": 30,
"note": "Cook until the oil separates for a longer shelf life.",
"note_ta": "எண்ணெய் பிரியும் வரை சமைத்தால் நீண்ட நாள் இருக்கும்.",
"ingredients": [
{
"n": "Ripe tomatoes, chopped",
"t": "தக்காளி",
"q": 6.0,
"u": "piece"
},
{
"n": "Tamarind",
"t": "புளி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Fenugreek powder",
"t": "வெந்தயப் பொடி",
"q": 0.5,
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
"e": "Heat the oil, splutter the mustard and add the tomatoes with salt and tamarind.",
"t": "எண்ணெயில் கடுகு தாளித்து தக்காளி, உப்பு, புளி சேர்க்கவும்."
},
{
"e": "Cook until mushy, then add the chilli and fenugreek powder.",
"t": "குழைய வதக்கி மிளகாய்த் தூள், வெந்தயப் பொடி சேர்க்கவும்."
},
{
"e": "Cook on low until thick and the oil separates, about 20 minutes.",
"t": "குறைந்த தீயில் எண்ணெய் பிரியும் வரை கெட்டியாகும் வரை சுமார் 20 நிமிடம் சமைக்கவும்."
}
]
},
{
"dish": "Fish thokku",
"servings": 4,
"prep": 20,
"cook": 25,
"note": "Use firm fish like seer or sheer and keep the pieces whole.",
"note_ta": "வஞ்சிரம் போன்ற உறுதியான மீனைப் பயன்படுத்தி துண்டுகளை உடையாமல் வைக்கவும்.",
"ingredients": [
{
"n": "Firm fish pieces",
"t": "மீன் துண்டுகள்",
"q": 400.0,
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
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Tamarind paste",
"t": "புளி விழுது",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard and fenugreek seeds",
"t": "கடுகு, வெந்தயம்",
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
"e": "Temper mustard and fenugreek in oil, fry the onion and ginger-garlic paste.",
"t": "எண்ணெயில் கடுகு, வெந்தயம் தாளித்து வெங்காயம், இஞ்சி பூண்டு விழுதை வதக்கவும்."
},
{
"e": "Add the tomato, chilli powder, tamarind and salt and cook to a thick masala.",
"t": "தக்காளி, மிளகாய்த் தூள், புளி, உப்பு சேர்த்து கெட்டியான மசாலாவாக்கவும்."
},
{
"e": "Add the fish gently, cover and cook on low for 10 minutes until the masala clings and the oil separates.",
"t": "மீனை மெதுவாகச் சேர்த்து மூடி குறைந்த தீயில் 10 நிமிடம் மசாலா ஒட்டி எண்ணெய் பிரியும் வரை வேகவிடவும்."
}
]
},
{
"dish": "Garlic pickle",
"servings": 20,
"prep": 20,
"cook": 15,
"note": "Dry the garlic fully before using; keep in a dry jar.",
"note_ta": "பூண்டை முழுவதும் உலர்த்தி உபயோகிக்கவும்; உலர்ந்த பாட்டிலில் வைக்கவும்.",
"ingredients": [
{
"n": "Garlic cloves, peeled",
"t": "பூண்டு",
"q": 250.0,
"u": "g"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Tamarind paste",
"t": "புளி விழுது",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Mustard and fenugreek powder",
"t": "கடுகு, வெந்தயப் பொடி",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 0.5,
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
"e": "Heat the oil, fry the garlic until lightly golden.",
"t": "எண்ணெயில் பூண்டை லேசாகப் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Add the tamarind, chilli powder, salt and the spice powder and cook on low until the oil separates.",
"t": "புளி, மிளகாய்த் தூள், உப்பு, மசாலாப் பொடி சேர்த்து குறைந்த தீயில் எண்ணெய் பிரியும் வரை சமைக்கவும்."
},
{
"e": "Cool completely and store in a clean dry jar.",
"t": "முழுவதும் ஆறவிட்டு சுத்தமான உலர்ந்த ஜாடியில் சேமிக்கவும்."
}
]
},
{
"dish": "Gongura pickle",
"servings": 20,
"prep": 20,
"cook": 20,
"note": "Dry the sorrel leaves in shade before cooking; the pickle tastes better after 2 days.",
"note_ta": "கோங்குரா இலைகளை நிழலில் உலர்த்தி சமைக்கவும்; 2 நாளுக்குப் பிறகு ருசி கூடும்.",
"ingredients": [
{
"n": "Gongura (sorrel) leaves",
"t": "கோங்குரா இலை",
"q": 4.0,
"u": "cup"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 12.0,
"u": "piece"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 10.0,
"u": "clove"
},
{
"n": "Mustard and fenugreek seeds",
"t": "கடுகு, வெந்தயம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 0.5,
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
"e": "Wilt the leaves in 2 tablespoons of oil until they reduce and the water evaporates.",
"t": "இலைகளை 2 மேசைக்கரண்டி எண்ணெயில் சுருங்கி நீர் வற்றும் வரை வதக்கவும்."
},
{
"e": "Roast and grind the chillies, fenugreek and salt; grind the leaves coarsely with garlic.",
"t": "மிளகாய், வெந்தயம், உப்பை வறுத்துப் பொடித்து இலைகளை பூண்டுடன் கொரகொரப்பாக அரைக்கவும்."
},
{
"e": "Temper mustard in the remaining oil, add the mixture and cook on low for 5 minutes. Cool and store.",
"t": "மீதமுள்ள எண்ணெயில் கடுகு தாளித்து கலவையைச் சேர்த்து குறைந்த தீயில் 5 நிமிடம் சமைத்து ஆறவிட்டு சேமிக்கவும்."
}
]
},
{
"dish": "Avakaya",
"servings": 30,
"prep": 30,
"cook": 0,
"note": "Needs 2 to 3 days to mature; keep in a dry ceramic or glass jar.",
"note_ta": "பதமாக 2 முதல் 3 நாள் ஆகும்; உலர்ந்த பீங்கான் அல்லது கண்ணாடி ஜாடியில் வைக்கவும்.",
"ingredients": [
{
"n": "Raw mangoes, cut in pieces",
"t": "மாங்காய்",
"q": 1.0,
"u": "kg"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 0.5,
"u": "cup"
},
{
"n": "Mustard powder",
"t": "கடுகுப் பொடி",
"q": 0.25,
"u": "cup"
},
{
"n": "Fenugreek powder",
"t": "வெந்தயப் பொடி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Sesame oil",
"t": "நல்லெண்ணெய்",
"q": 1.0,
"u": "cup"
}
],
"steps": [
{
"e": "Wipe the mango pieces completely dry.",
"t": "மாங்காய் துண்டுகளை முழுவதும் துடைத்து உலர்த்தவும்."
},
{
"e": "Mix the chilli, mustard, fenugreek powders and salt, then toss the mango pieces in it.",
"t": "மிளகாய், கடுகு, வெந்தயப் பொடிகள், உப்பை கலந்து மாங்காய் துண்டுகளை அதில் புரட்டவும்."
},
{
"e": "Add the oil, mix well, pack into a dry jar, and let it mature for 2 to 3 days, stirring daily.",
"t": "எண்ணெய் சேர்த்து நன்கு கலந்து உலர்ந்த ஜாடியில் அடைத்து 2 முதல் 3 நாள் தினமும் கிளறி ஊறவிடவும்."
}
]
},
{
"dish": "Narthangai pickle",
"servings": 20,
"prep": 30,
"cook": 20,
"note": "Use ripe, thin-skinned citron and leave it to mature for a few days.",
"note_ta": "பழுத்த, மெல்லிய தோல் நார்த்தங்காயைப் பயன்படுத்தி சில நாள் ஊறவிடவும்.",
"ingredients": [
{
"n": "Narthangai (citron), cut in small pieces",
"t": "நார்த்தங்காய்",
"q": 5.0,
"u": "piece"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 3.0,
"u": "tbsp"
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
"q": 0.5,
"u": "cup"
}
],
"steps": [
{
"e": "Mix the citron pieces with salt and turmeric and leave for 2 days, turning once a day.",
"t": "நார்த்தங்காய் துண்டுகளை உப்பு, மஞ்சளுடன் கலந்து 2 நாள் தினமும் ஒருமுறை புரட்டி வைக்கவும்."
},
{
"e": "Temper mustard and asafoetida in hot oil, add the chilli and fenugreek powder, and mix with the citron.",
"t": "சூடான எண்ணெயில் கடுகு, பெருங்காயம் தாளித்து மிளகாய், வெந்தயப் பொடி சேர்த்து நார்த்தங்காயுடன் கலக்கவும்."
},
{
"e": "Cool and store in a dry jar.",
"t": "ஆறவிட்டு உலர்ந்த ஜாடியில் சேமிக்கவும்."
}
]
},
{
"dish": "Milagai podi",
"servings": 20,
"prep": 10,
"cook": 10,
"note": "Mix with sesame oil or ghee and serve with idli and dosa.",
"note_ta": "நல்லெண்ணெய் அல்லது நெய்யுடன் கலந்து இட்லி, தோசையுடன் பரிமாறவும்.",
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
},
{
"e": "Store airtight for up to a month.",
"t": "காற்றுப் புகாமல் ஒரு மாதம் வரை சேமிக்கலாம்."
}
]
},
{
"dish": "Paruppu podi",
"servings": 20,
"prep": 10,
"cook": 10,
"note": "Eat with hot rice and ghee.",
"note_ta": "சூடான சாதம், நெய்யுடன் சாப்பிடவும்.",
"ingredients": [
{
"n": "Toor dal",
"t": "துவரம்பருப்பு",
"q": 0.5,
"u": "cup"
},
{
"n": "Chana dal",
"t": "கடலைப்பருப்பு",
"q": 0.25,
"u": "cup"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 6.0,
"u": "piece"
},
{
"n": "Pepper and cumin",
"t": "மிளகு, சீரகம்",
"q": 1.0,
"u": "tsp"
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
"e": "Dry roast the dals, chillies, pepper and cumin separately until fragrant.",
"t": "பருப்புகள், மிளகாய், மிளகு, சீரகத்தை தனித்தனியாக மணம் வரும் வரை வறுக்கவும்."
},
{
"e": "Cool and grind with the asafoetida and salt to a coarse powder.",
"t": "ஆறவிட்டு பெருங்காயம், உப்புடன் கொரகொரப்பாகப் பொடிக்கவும்."
}
]
},
{
"dish": "Karuveppilai podi",
"servings": 20,
"prep": 10,
"cook": 15,
"note": "Dry roast the leaves on low heat until they crumble.",
"note_ta": "இலைகளை குறைந்த தீயில் உதிரும் வரை வறுக்கவும்.",
"ingredients": [
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 2.0,
"u": "cup"
},
{
"n": "Urad dal",
"t": "உளுத்தம் பருப்பு",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Dried red chilli",
"t": "காய்ந்த மிளகாய்",
"q": 8.0,
"u": "piece"
},
{
"n": "Pepper",
"t": "மிளகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Tamarind",
"t": "புளி",
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
"e": "Dry roast the curry leaves until crisp; set aside.",
"t": "கறிவேப்பிலையை மொறுமொறுப்பாக வறுத்து எடுக்கவும்."
},
{
"e": "Roast the dal, chillies and pepper until fragrant.",
"t": "உளுத்தம்பருப்பு, மிளகாய், மிளகை மணம் வரும் வரை வறுக்கவும்."
},
{
"e": "Grind everything with the tamarind and salt to a coarse powder.",
"t": "எல்லாவற்றையும் புளி, உப்புடன் கொரகொரப்பாகப் பொடிக்கவும்."
}
]
},
{
"dish": "Beetroot pachadi",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "Add the curd after cooling so it does not split.",
"note_ta": "தயிரை ஆறிய பின் சேர்த்தால் திரியாது.",
"ingredients": [
{
"n": "Beetroot, grated",
"t": "பீட்ரூட்",
"q": 1.0,
"u": "cup"
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
"q": 3.0,
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
"e": "Cook the beetroot with a little water and salt until tender and cool.",
"t": "பீட்ரூட்டை சிறிது தண்ணீர், உப்புடன் வேகவைத்து ஆறவிடவும்."
},
{
"e": "Grind the coconut with the chilli and mix in with the whisked curd.",
"t": "தேங்காயை மிளகாயுடன் அரைத்து அடித்த தயிருடன் கலக்கவும்."
},
{
"e": "Mix with the beetroot and temper with mustard and curry leaves.",
"t": "பீட்ரூட்டுடன் கலந்து கடுகு, கறிவேப்பிலை தாளிக்கவும்."
}
]
},
{
"dish": "Pineapple pachadi",
"servings": 4,
"prep": 10,
"cook": 10,
"note": "A sweet-sour side often served at feasts.",
"note_ta": "விருந்துகளில் பரிமாறப்படும் இனிப்பு புளிப்பு சைட் டிஷ்.",
"ingredients": [
{
"n": "Pineapple, small pieces",
"t": "அன்னாசிப்பழம்",
"q": 1.5,
"u": "cup"
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
"q": 0.25,
"u": "cup"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Sugar or jaggery",
"t": "சர்க்கரை",
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
"e": "Cook the pineapple with a little water, salt and sugar until soft.",
"t": "அன்னாசியை சிறிது தண்ணீர், உப்பு, சர்க்கரையுடன் மென்மையாக வேகவிடவும்."
},
{
"e": "Grind the coconut, chilli and mustard to a paste and stir in.",
"t": "தேங்காய், மிளகாய், கடுகை விழுதாக அரைத்துச் சேர்க்கவும்."
},
{
"e": "Cool slightly, fold in the whisked curd and serve.",
"t": "சற்று ஆறவிட்டு அடித்த தயிரைக் கலந்து பரிமாறவும்."
}
]
},
{
"dish": "Mango pachadi",
"servings": 4,
"prep": 10,
"cook": 15,
"note": "A Tamil New Year speciality that balances sweet, sour and bitter.",
"note_ta": "தமிழ் புத்தாண்டு சிறப்பு உணவு; இனிப்பு, புளிப்பு, கசப்பு கலந்தது.",
"ingredients": [
{
"n": "Raw mango, chopped",
"t": "மாங்காய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Jaggery",
"t": "வெல்லம்",
"q": 0.25,
"u": "cup"
},
{
"n": "Green chilli",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Neem flowers (optional)",
"t": "வேப்பம்பூ",
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
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 1.0,
"u": "pinch"
}
],
"steps": [
{
"e": "Cook the mango with water and salt until soft.",
"t": "மாங்காயை தண்ணீர், உப்புடன் மென்மையாக வேகவிடவும்."
},
{
"e": "Add the jaggery and chilli and simmer until thick.",
"t": "வெல்லம், மிளகாய் சேர்த்து கெட்டியாகும் வரை கொதிக்கவிடவும்."
},
{
"e": "Temper mustard and neem flowers in oil and pour over.",
"t": "எண்ணெயில் கடுகு, வேப்பம்பூ தாளித்துக் கொட்டவும்."
}
]
},
{
"dish": "Onion pachadi",
"servings": 4,
"prep": 10,
"cook": 0,
"note": "Serve fresh with biryani or pulao.",
"note_ta": "பிரியாணி அல்லது புலாவுடன் புதிதாகப் பரிமாறவும்.",
"ingredients": [
{
"n": "Onions, finely chopped",
"t": "வெங்காயம்",
"q": 2.0,
"u": "piece"
},
{
"n": "Curd",
"t": "தயிர்",
"q": 1.0,
"u": "cup"
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
"q": 1.0,
"u": "handful"
},
{
"n": "Cumin powder",
"t": "சீரகத் தூள்",
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
"e": "Whisk the curd with salt and cumin.",
"t": "தயிரை உப்பு, சீரகத் தூளுடன் அடிக்கவும்."
},
{
"e": "Stir in the onion, chopped chilli and coriander.",
"t": "வெங்காயம், நறுக்கிய மிளகாய், கொத்தமல்லி சேர்த்துக் கலக்கவும்."
},
{
"e": "Chill for 10 minutes and serve.",
"t": "10 நிமிடம் குளிரவைத்துப் பரிமாறவும்."
}
]
},
{
"dish": "Nattu kozhi kuzhambu",
"servings": 4,
"prep": 20,
"cook": 50,
"note": "Country chicken takes longer to cook; pressure cook for 4 to 5 whistles.",
"note_ta": "நாட்டுக்கோழி வேக நேரம் ஆகும்; 4 முதல் 5 விசில் குக்கரில் வேகவிடவும்.",
"ingredients": [
{
"n": "Country chicken, cut",
"t": "நாட்டுக்கோழி",
"q": 700.0,
"u": "g"
},
{
"n": "Shallots",
"t": "சின்ன வெங்காயம்",
"q": 10.0,
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
"q": 3.0,
"u": "tbsp"
},
{
"n": "Coconut and fennel paste",
"t": "தேங்காய் சோம்பு விழுது",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Whole spices",
"t": "பட்டை, கிராம்பு, ஏலக்காய்",
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
"e": "Heat the oil, fry the whole spices and shallots until golden, then the ginger-garlic paste and tomato.",
"t": "எண்ணெயில் மசாலாக்கள், சின்ன வெங்காயத்தைப் பொன்னிறமாக வதக்கி இஞ்சி பூண்டு விழுது, தக்காளி சேர்க்கவும்."
},
{
"e": "Add the powders, chicken and salt and fry for 5 minutes.",
"t": "தூள்கள், கோழி, உப்பு சேர்த்து 5 நிமிடம் வதக்கவும்."
},
{
"e": "Add 2 cups of water, pressure cook for 4 to 5 whistles, then stir in the coconut paste and simmer 10 minutes.",
"t": "2 கப் தண்ணீர் சேர்த்து 4 முதல் 5 விசில் குக்கரில் வேகவிட்டு தேங்காய் விழுது சேர்த்து 10 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Pepper chicken",
"servings": 4,
"prep": 15,
"cook": 30,
"note": "Use freshly crushed pepper for the best heat.",
"note_ta": "புதிதாக இடித்த மிளகு சிறந்த காரம் தரும்.",
"ingredients": [
{
"n": "Chicken, small pieces",
"t": "கோழிக்கறி",
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
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Crushed pepper",
"t": "இடித்த மிளகு",
"q": 2.0,
"u": "tsp"
},
{
"n": "Fennel and cumin seeds",
"t": "சோம்பு, சீரகம்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Curry leaves",
"t": "கறிவேப்பிலை",
"q": 2.0,
"u": "sprig"
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
"e": "Fry the fennel, cumin, onion and ginger-garlic paste in oil until golden.",
"t": "எண்ணெயில் சோம்பு, சீரகம், வெங்காயம், இஞ்சி பூண்டு விழுதைப் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Add the chicken, turmeric and salt and cook for 5 minutes.",
"t": "கோழி, மஞ்சள், உப்பு சேர்த்து 5 நிமிடம் வதக்கவும்."
},
{
"e": "Cover and cook on low until tender, then add the pepper and curry leaves and fry until the gravy dries.",
"t": "மூடி குறைந்த தீயில் வேகவிட்டு மிளகு, கறிவேப்பிலை சேர்த்து குழம்பு வற்றும் வரை வறுக்கவும்."
}
]
},
{
"dish": "Chicken stew",
"servings": 4,
"prep": 15,
"cook": 35,
"note": "Serve with appam or idiyappam.",
"note_ta": "ஆப்பம் அல்லது இடியாப்பத்துடன் பரிமாறவும்.",
"ingredients": [
{
"n": "Chicken, pieces",
"t": "கோழிக்கறி",
"q": 500.0,
"u": "g"
},
{
"n": "Potato and carrot, cubed",
"t": "உருளைக்கிழங்கு, கேரட்",
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
"n": "Green chilli and ginger",
"t": "பச்சை மிளகாய், இஞ்சி",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Whole spices and pepper",
"t": "பட்டை, கிராம்பு, மிளகு",
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
"e": "Sauté the spices, onion, chilli and ginger in coconut oil without browning.",
"t": "தேங்காய் எண்ணெயில் மசாலாக்கள், வெங்காயம், மிளகாய், இஞ்சியை நிறம் மாறாமல் வதக்கவும்."
},
{
"e": "Add the chicken, vegetables, salt and 1.5 cups of water and cook until tender.",
"t": "கோழி, காய்கறிகள், உப்பு, 1.5 கப் தண்ணீர் சேர்த்து வேகவிடவும்."
},
{
"e": "Pour in the coconut milk and warm through without boiling.",
"t": "தேங்காய்ப் பாலை ஊற்றி கொதிக்க விடாமல் சூடாக்கவும்."
}
]
},
{
"dish": "Mutton kuzhambu",
"servings": 4,
"prep": 20,
"cook": 50,
"note": "Slow cooking makes the mutton tender and the gravy rich.",
"note_ta": "மெதுவாகச் சமைத்தால் மட்டன் மென்மையாகி குழம்பு கெட்டியாகும்.",
"ingredients": [
{
"n": "Mutton, pieces",
"t": "மட்டன்",
"q": 600.0,
"u": "g"
},
{
"n": "Shallots",
"t": "சின்ன வெங்காயம்",
"q": 10.0,
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
"q": 3.0,
"u": "tbsp"
},
{
"n": "Coconut and fennel paste",
"t": "தேங்காய் சோம்பு விழுது",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Whole spices",
"t": "பட்டை, கிராம்பு, ஏலக்காய்",
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
"e": "Fry the whole spices, shallots, ginger-garlic paste and tomato in oil until thick.",
"t": "எண்ணெயில் மசாலாக்கள், சின்ன வெங்காயம், இஞ்சி பூண்டு விழுது, தக்காளியை கெட்டியாக வதக்கவும்."
},
{
"e": "Add the powders, mutton and salt and fry for 8 minutes.",
"t": "தூள்கள், மட்டன், உப்பு சேர்த்து 8 நிமிடம் வதக்கவும்."
},
{
"e": "Add 3 cups of water and pressure cook for 6 whistles, then add the coconut paste and simmer 10 minutes.",
"t": "3 கப் தண்ணீர் சேர்த்து 6 விசில் குக்கரில் வேகவிட்டு தேங்காய் விழுது சேர்த்து 10 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Egg masala",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Prick the boiled eggs lightly so the masala flavours them.",
"note_ta": "வேகவைத்த முட்டையில் லேசாக கீறினால் மசாலா உள்ளே செல்லும்.",
"ingredients": [
{
"n": "Eggs, boiled and peeled",
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
"n": "Chilli and coriander powder",
"t": "மிளகாய், மல்லித் தூள்",
"q": 2.0,
"u": "tbsp"
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
"e": "Fry the onion and ginger-garlic paste in oil until golden, add the tomato and powders and cook to a thick masala.",
"t": "வெங்காயம், இஞ்சி பூண்டு விழுதை எண்ணெயில் பொன்னிறமாக வதக்கி தக்காளி, தூள்கள் சேர்த்து கெட்டியாக வேகவிடவும்."
},
{
"e": "Add salt and a cup of water and simmer for 5 minutes.",
"t": "உப்பு, 1 கப் தண்ணீர் சேர்த்து 5 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Add the eggs and garam masala and simmer for 3 more minutes.",
"t": "முட்டை, கரம் மசாலா சேர்த்து மேலும் 3 நிமிடம் கொதிக்கவிடவும்."
}
]
},
{
"dish": "Kerala egg roast",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "The onion-tomato masala should be cooked until the oil separates.",
"note_ta": "வெங்காயம் தக்காளி மசாலாவில் எண்ணெய் பிரியும் வரை சமைக்கவும்.",
"ingredients": [
{
"n": "Eggs, boiled and peeled",
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
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Kashmiri chilli powder",
"t": "காஷ்மீரி மிளகாய்த் தூள்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Coriander and garam masala powder",
"t": "மல்லித் தூள், கரம் மசாலா",
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
"n": "Coconut oil",
"t": "தேங்காய் எண்ணெய்",
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
"e": "Fry the sliced onions in coconut oil until deep golden with the curry leaves.",
"t": "தேங்காய் எண்ணெயில் வெங்காயத்தை கறிவேப்பிலையுடன் அடர் பொன்னிறமாக வதக்கவும்."
},
{
"e": "Add the paste, tomato, powders and salt and cook until the oil separates.",
"t": "இஞ்சி பூண்டு விழுது, தக்காளி, தூள்கள், உப்பு சேர்த்து எண்ணெய் பிரியும் வரை சமைக்கவும்."
},
{
"e": "Slit the eggs lightly, coat with the masala and cook for 3 minutes.",
"t": "முட்டைகளை லேசாகக் கீறி மசாலாவில் புரட்டி 3 நிமிடம் வேகவிடவும்."
}
]
},
{
"dish": "Nethili fry",
"servings": 4,
"prep": 15,
"cook": 15,
"note": "Clean the anchovies well and dry them before marinating.",
"note_ta": "நெத்திலியை நன்கு சுத்தம் செய்து உலர்த்தி ஊறவைக்கவும்.",
"ingredients": [
{
"n": "Anchovies (nethili), cleaned",
"t": "நெத்திலி மீன்",
"q": 300.0,
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
"q": 0.25,
"u": "tsp"
},
{
"n": "Ginger-garlic paste",
"t": "இஞ்சி பூண்டு விழுது",
"q": 1.0,
"u": "tsp"
},
{
"n": "Rice flour",
"t": "அரிசி மாவு",
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
"e": "Marinate the fish with the powders, paste, lemon and salt for 20 minutes.",
"t": "மீனை தூள்கள், விழுது, எலுமிச்சை, உப்புடன் 20 நிமிடம் ஊறவைக்கவும்."
},
{
"e": "Coat lightly with rice flour.",
"t": "அரிசி மாவை லேசாகப் பூசவும்."
},
{
"e": "Shallow fry in hot oil until crisp, about 3 minutes per side.",
"t": "சூடான எண்ணெயில் ஒவ்வொரு பக்கமும் சுமார் 3 நிமிடம் மொறுமொறுப்பாக வறுக்கவும்."
}
]
},
{
"dish": "Fish moilee",
"servings": 4,
"prep": 15,
"cook": 20,
"note": "Use a firm white fish and do not boil after adding the coconut milk.",
"note_ta": "உறுதியான வெள்ளை மீனைப் பயன்படுத்தி தேங்காய்ப் பால் சேர்த்த பின் கொதிக்க விடாதீர்கள்.",
"ingredients": [
{
"n": "Fish pieces",
"t": "மீன் துண்டுகள்",
"q": 500.0,
"u": "g"
},
{
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli, slit",
"t": "பச்சை மிளகாய்",
"q": 3.0,
"u": "piece"
},
{
"n": "Ginger, julienned",
"t": "இஞ்சி",
"q": 1.0,
"u": "inch"
},
{
"n": "Tomato",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Thick coconut milk",
"t": "கெட்டியான தேங்காய்ப் பால்",
"q": 1.0,
"u": "cup"
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
"e": "Sauté the onion, chilli, ginger and curry leaves in coconut oil until soft.",
"t": "தேங்காய் எண்ணெயில் வெங்காயம், மிளகாய், இஞ்சி, கறிவேப்பிலையை மென்மையாக வதக்கவும்."
},
{
"e": "Add the tomato, turmeric, salt, thin coconut milk or water and the fish; cook gently for 8 minutes.",
"t": "தக்காளி, மஞ்சள், உப்பு, நீர்த்த தேங்காய்ப் பால் அல்லது தண்ணீர், மீன் சேர்த்து 8 நிமிடம் மெதுவாக வேகவிடவும்."
},
{
"e": "Pour in the thick coconut milk and warm through without boiling.",
"t": "கெட்டியான தேங்காய்ப் பாலை ஊற்றி கொதிக்க விடாமல் சூடாக்கவும்."
}
]
},
{
"dish": "Crab masala",
"servings": 4,
"prep": 25,
"cook": 30,
"note": "Crack the claws lightly so the masala reaches the meat.",
"note_ta": "நண்டுக் கால்களை லேசாக உடைத்தால் மசாலா உள்ளே செல்லும்.",
"ingredients": [
{
"n": "Crab, cleaned and cut",
"t": "நண்டு",
"q": 800.0,
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
"n": "Pepper powder",
"t": "மிளகுத் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Coconut paste",
"t": "தேங்காய் விழுது",
"q": 2.0,
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
"e": "Fry the onion and ginger-garlic paste until golden, add the tomato and powders and cook to a thick masala.",
"t": "வெங்காயம், இஞ்சி பூண்டு விழுதைப் பொன்னிறமாக வதக்கி தக்காளி, தூள்கள் சேர்த்து கெட்டியான மசாலாவாக்கவும்."
},
{
"e": "Add the crab, salt and 1 cup of water; cover and cook for 15 minutes.",
"t": "நண்டு, உப்பு, 1 கப் தண்ணீர் சேர்த்து மூடி 15 நிமிடம் வேகவிடவும்."
},
{
"e": "Stir in the coconut paste, pepper and curry leaves and cook until the gravy thickens.",
"t": "தேங்காய் விழுது, மிளகு, கறிவேப்பிலை சேர்த்து குழம்பு கெட்டியாகும் வரை சமைக்கவும்."
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
