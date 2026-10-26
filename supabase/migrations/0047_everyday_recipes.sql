-- HomeFood · 0047: standard recipes (English + Tamil) for 32 everyday dishes of migration 0046 (bread, oats, eggs, fruit, noodles, rice, soups)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Same shape as the recipes in 0011: quantities are for `servings` people and the app scales them. They are drafts
-- (written by Claude): the family should check ingredients and seasoning before relying on them.
-- Safe to run twice: a dish that already has a standard recipe is skipped.

with src as (
  select * from jsonb_to_recordset($json$
[
{
"dish": "Bread toast",
"servings": 2,
"prep": 2,
"cook": 5,
"note": "Butter the bread while it is still hot so it melts in.",
"note_ta": "ரொட்டி சூடாக இருக்கும்போதே வெண்ணெய் தடவினால் நன்கு உருகி ஒட்டும்.",
"ingredients": [
{
"n": "Bread",
"t": "ரொட்டி",
"q": 4.0,
"u": "slice"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 2.0,
"u": "tsp"
}
],
"steps": [
{
"e": "Heat a tawa or toaster and toast the bread slices until golden on both sides.",
"t": "தோசைக்கல் அல்லது டோஸ்டரைச் சூடாக்கி ரொட்டித் துண்டுகளை இருபுறமும் பொன்னிறமாக வாட்டவும்."
},
{
"e": "Spread butter on the hot toast and serve at once.",
"t": "சூடான டோஸ்ட்டில் வெண்ணெய் தடவி உடனே பரிமாறவும்."
}
]
},
{
"dish": "Peanut butter toast",
"servings": 2,
"prep": 2,
"cook": 5,
"note": "Choose a peanut butter without added sugar if you can.",
"note_ta": "முடிந்தால் சர்க்கரை சேர்க்காத வேர்க்கடலை வெண்ணெயைத் தேர்ந்தெடுக்கவும்.",
"ingredients": [
{
"n": "Bread",
"t": "ரொட்டி",
"q": 4.0,
"u": "slice"
},
{
"n": "Peanut butter",
"t": "வேர்க்கடலை வெண்ணெய்",
"q": 3.0,
"u": "tbsp"
}
],
"steps": [
{
"e": "Toast the bread slices until golden and crisp.",
"t": "ரொட்டித் துண்டுகளைப் பொன்னிறமாக மொறுமொறுப்பாக வாட்டவும்."
},
{
"e": "Spread the peanut butter on the toast and serve.",
"t": "டோஸ்ட்டில் வேர்க்கடலை வெண்ணெய் தடவிப் பரிமாறவும்."
}
]
},
{
"dish": "Jam bread",
"servings": 2,
"prep": 2,
"cook": 0,
"note": "A thin layer of jam is enough; add a few banana slices for more filling.",
"note_ta": "ஜாம் மெல்லியதாகத் தடவினால் போதும்; வயிறு நிறைய வாழைப்பழத் துண்டுகளும் சேர்க்கலாம்.",
"ingredients": [
{
"n": "Bread",
"t": "ரொட்டி",
"q": 4.0,
"u": "slice"
},
{
"n": "Fruit jam",
"t": "பழ ஜாம்",
"q": 4.0,
"u": "tsp"
}
],
"steps": [
{
"e": "Spread the jam evenly on two slices of bread.",
"t": "இரண்டு ரொட்டித் துண்டுகளில் ஜாமை சமமாகத் தடவவும்."
},
{
"e": "Cover with the other slices, press lightly and cut in half.",
"t": "மற்ற துண்டுகளால் மூடி லேசாக அழுத்தி இரண்டாக வெட்டவும்."
}
]
},
{
"dish": "Bread omelette",
"servings": 2,
"prep": 10,
"cook": 10,
"note": "Press the bread into the egg so it soaks up the mixture before you flip it.",
"note_ta": "ரொட்டியை முட்டைக் கலவையில் அழுத்தினால் கலவையை நன்கு உறிஞ்சும்; பிறகு திருப்பிப் போடவும்.",
"ingredients": [
{
"n": "Eggs",
"t": "முட்டை",
"q": 4.0,
"u": "piece"
},
{
"n": "Bread",
"t": "ரொட்டி",
"q": 4.0,
"u": "slice"
},
{
"n": "Onion, finely chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli, chopped",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Coriander leaves, chopped",
"t": "கொத்தமல்லி இலை",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Oil or butter",
"t": "எண்ணெய் அல்லது வெண்ணெய்",
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
"e": "Beat the eggs with the onion, chilli, coriander and salt.",
"t": "முட்டையுடன் வெங்காயம், மிளகாய், கொத்தமல்லி, உப்பு சேர்த்து அடிக்கவும்."
},
{
"e": "Heat the oil on a tawa and pour half of the egg mixture. Place two bread slices on it and press.",
"t": "தோசைக்கல்லில் எண்ணெய் சூடாக்கி பாதி முட்டைக் கலவையை ஊற்றவும். அதன் மேல் இரண்டு ரொட்டித் துண்டுகளை வைத்து அழுத்தவும்."
},
{
"e": "Flip when the egg is set, cook the other side for a minute and cut in half. Repeat with the rest.",
"t": "முட்டை வெந்ததும் திருப்பிப் போட்டு மறுபுறம் ஒரு நிமிடம் வேகவிட்டு இரண்டாக வெட்டவும். மீதியையும் இதேபோல் செய்யவும்."
}
]
},
{
"dish": "Veg sandwich",
"servings": 2,
"prep": 10,
"cook": 0,
"note": "Pat the cucumber and tomato dry so the bread stays crisp.",
"note_ta": "வெள்ளரி, தக்காளியைத் துடைத்து ஈரம் போக்கினால் ரொட்டி நனையாது.",
"ingredients": [
{
"n": "Bread",
"t": "ரொட்டி",
"q": 4.0,
"u": "slice"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Cucumber, sliced",
"t": "வெள்ளரிக்காய்",
"q": 0.5,
"u": "piece"
},
{
"n": "Tomato, sliced",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Onion, thinly sliced",
"t": "வெங்காயம்",
"q": 0.5,
"u": "piece"
},
{
"n": "Green chutney or tomato sauce",
"t": "பச்சை சட்னி அல்லது தக்காளி சாஸ்",
"q": 2.0,
"u": "tbsp"
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
"e": "Butter the bread and spread the chutney on two slices.",
"t": "ரொட்டிக்கு வெண்ணெய் தடவி இரண்டு துண்டுகளில் சட்னி தடவவும்."
},
{
"e": "Arrange the cucumber, tomato and onion, sprinkle salt and pepper.",
"t": "வெள்ளரி, தக்காளி, வெங்காயத்தை அடுக்கி உப்பு, மிளகு தூவவும்."
},
{
"e": "Cover with the other slices, press and cut into halves. Toast if you like.",
"t": "மற்ற துண்டுகளால் மூடி அழுத்தி இரண்டாக வெட்டவும். விரும்பினால் டோஸ்ட் செய்யலாம்."
}
]
},
{
"dish": "Egg sandwich",
"servings": 2,
"prep": 10,
"cook": 10,
"note": "Do not overcook the eggs: a firm but moist yolk keeps the filling soft.",
"note_ta": "முட்டையை அதிகம் வேகவிடாதீர்கள்; மஞ்சள் கரு மென்மையாக இருந்தால் பூரணம் மிருதுவாக இருக்கும்.",
"ingredients": [
{
"n": "Eggs, boiled",
"t": "வேகவைத்த முட்டை",
"q": 3.0,
"u": "piece"
},
{
"n": "Bread",
"t": "ரொட்டி",
"q": 4.0,
"u": "slice"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Onion, finely chopped",
"t": "வெங்காயம்",
"q": 2.0,
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
"e": "Peel and mash the boiled eggs with the onion, pepper and salt.",
"t": "வேகவைத்த முட்டைகளை உரித்து வெங்காயம், மிளகு, உப்புடன் மசிக்கவும்."
},
{
"e": "Butter the bread, spread the egg filling on two slices and cover with the rest.",
"t": "ரொட்டிக்கு வெண்ணெய் தடவி இரண்டு துண்டுகளில் முட்டைப் பூரணம் பரப்பி மற்றவற்றால் மூடவும்."
},
{
"e": "Cut in half and serve, plain or toasted.",
"t": "இரண்டாக வெட்டி அப்படியே அல்லது டோஸ்ட் செய்து பரிமாறவும்."
}
]
},
{
"dish": "Bread upma",
"servings": 2,
"prep": 10,
"cook": 10,
"note": "Use day-old bread; fresh bread turns mushy.",
"note_ta": "முந்தைய நாள் ரொட்டியைப் பயன்படுத்தவும்; புதிய ரொட்டி குழைந்துவிடும்.",
"ingredients": [
{
"n": "Bread",
"t": "ரொட்டி",
"q": 6.0,
"u": "slice"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
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
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli, chopped",
"t": "பச்சை மிளகாய்",
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
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
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
"e": "Tear the bread into small pieces.",
"t": "ரொட்டியைச் சிறு துண்டுகளாகக் கிள்ளிக் கொள்ளவும்."
},
{
"e": "Heat the oil, splutter the mustard, then fry the curry leaves, onion and chilli until soft.",
"t": "எண்ணெயைச் சூடாக்கி கடுகு பொரிந்ததும் கறிவேப்பிலை, வெங்காயம், மிளகாயை மென்மையாகும்வரை வதக்கவும்."
},
{
"e": "Add the tomato, turmeric and salt and cook until the tomato softens.",
"t": "தக்காளி, மஞ்சள் தூள், உப்பு சேர்த்து தக்காளி குழையும்வரை வதக்கவும்."
},
{
"e": "Add the bread, sprinkle a little water, toss for 2 minutes and serve hot.",
"t": "ரொட்டியைச் சேர்த்து சிறிது தண்ணீர் தெளித்து 2 நிமிடம் கிளறி சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Oats porridge",
"servings": 2,
"prep": 2,
"cook": 8,
"note": "Add a few nuts or fruit pieces for more flavour; sweeten with a little jaggery if needed.",
"note_ta": "சுவைக்காக சில கொட்டைகள் அல்லது பழத் துண்டுகள் சேர்க்கலாம்; தேவைப்பட்டால் சிறிது வெல்லம் சேர்க்கவும்.",
"ingredients": [
{
"n": "Rolled oats",
"t": "ஓட்ஸ்",
"q": 1.0,
"u": "cup"
},
{
"n": "Milk",
"t": "பால்",
"q": 2.0,
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
"e": "Bring the milk to a boil in a pan.",
"t": "ஒரு பாத்திரத்தில் பாலைக் கொதிக்கவிடவும்."
},
{
"e": "Add the oats and a pinch of salt and cook on low heat for 5 minutes, stirring, until thick.",
"t": "ஓட்ஸ், சிறிது உப்பு சேர்த்து குறைந்த தீயில் கிளறிக்கொண்டே 5 நிமிடம் கெட்டியாகும்வரை வேகவிடவும்."
},
{
"e": "Serve warm.",
"t": "சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Savoury oats",
"servings": 2,
"prep": 10,
"cook": 10,
"note": "Add a spoon of curd at the end for a tangy taste.",
"note_ta": "கடைசியில் ஒரு ஸ்பூன் தயிர் சேர்த்தால் புளிப்புச் சுவை கிடைக்கும்.",
"ingredients": [
{
"n": "Rolled oats",
"t": "ஓட்ஸ்",
"q": 1.0,
"u": "cup"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 0.5,
"u": "tsp"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Carrot, grated",
"t": "கேரட்",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli, chopped",
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
"n": "Water",
"t": "தண்ணீர்",
"q": 2.0,
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
"e": "Heat the oil, splutter the mustard and fry the curry leaves, onion and chilli.",
"t": "எண்ணெயைச் சூடாக்கி கடுகு பொரிந்ததும் கறிவேப்பிலை, வெங்காயம், மிளகாயை வதக்கவும்."
},
{
"e": "Add the carrot and cook for 2 minutes, then add the oats and fry for 1 minute.",
"t": "கேரட் சேர்த்து 2 நிமிடம் வதக்கி, ஓட்ஸ் சேர்த்து 1 நிமிடம் வறுக்கவும்."
},
{
"e": "Pour in the water and salt and cook, stirring, until soft and thick. Serve hot.",
"t": "தண்ணீர், உப்பு சேர்த்து கிளறிக்கொண்டே மென்மையாகவும் கெட்டியாகவும் ஆகும்வரை வேகவிட்டு சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Cornflakes with milk",
"servings": 1,
"prep": 2,
"cook": 0,
"note": "Add the milk just before eating so the flakes stay crisp.",
"note_ta": "சாப்பிடும் முன்பே பால் சேர்த்தால் கார்ன்ஃப்ளேக்ஸ் மொறுமொறுப்பாக இருக்கும்.",
"ingredients": [
{
"n": "Cornflakes",
"t": "கார்ன்ஃப்ளேக்ஸ்",
"q": 1.0,
"u": "cup"
},
{
"n": "Cold milk",
"t": "குளிர்ந்த பால்",
"q": 1.0,
"u": "cup"
}
],
"steps": [
{
"e": "Put the cornflakes in a bowl.",
"t": "கார்ன்ஃப்ளேக்ஸை ஒரு கிண்ணத்தில் போடவும்."
},
{
"e": "Pour the cold milk over it and eat at once.",
"t": "குளிர்ந்த பாலை ஊற்றி உடனே சாப்பிடவும்."
}
]
},
{
"dish": "Scrambled eggs",
"servings": 2,
"prep": 3,
"cook": 5,
"note": "Take the pan off the heat while the eggs still look slightly wet; they finish cooking in the heat.",
"note_ta": "முட்டை இன்னும் சற்று ஈரமாக இருக்கும்போதே அடுப்பிலிருந்து இறக்கவும்; சூட்டிலேயே வெந்துவிடும்.",
"ingredients": [
{
"n": "Eggs",
"t": "முட்டை",
"q": 4.0,
"u": "piece"
},
{
"n": "Milk",
"t": "பால்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 2.0,
"u": "tsp"
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
"e": "Beat the eggs with the milk, salt and pepper.",
"t": "முட்டையுடன் பால், உப்பு, மிளகு சேர்த்து அடிக்கவும்."
},
{
"e": "Melt the butter in a pan on low heat and pour in the eggs.",
"t": "ஒரு பாத்திரத்தில் குறைந்த தீயில் வெண்ணெயை உருக்கி முட்டைக் கலவையை ஊற்றவும்."
},
{
"e": "Stir gently with a spoon until soft curds form. Serve at once.",
"t": "கரண்டியால் மெதுவாகக் கிளறி மென்மையான கட்டிகள் உருவானதும் உடனே பரிமாறவும்."
}
]
},
{
"dish": "Half-boiled egg",
"servings": 2,
"prep": 1,
"cook": 6,
"note": "Timing is for a medium egg taken straight from the fridge.",
"note_ta": "நேரம் குளிர்சாதனப் பெட்டியிலிருந்து எடுத்த நடுத்தர அளவு முட்டைக்கானது.",
"ingredients": [
{
"n": "Eggs",
"t": "முட்டை",
"q": 2.0,
"u": "piece"
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
"e": "Lower the eggs gently into boiling water.",
"t": "முட்டைகளைக் கொதிக்கும் நீரில் மெதுவாக இறக்கவும்."
},
{
"e": "Boil for 5 to 6 minutes for a soft, runny yolk.",
"t": "மென்மையான, ஓடும் மஞ்சள் கருவுக்கு 5 முதல் 6 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Cool in cold water for a minute, peel or crack the top, and sprinkle salt and pepper.",
"t": "குளிர்ந்த நீரில் ஒரு நிமிடம் வைத்து, தோலை உரித்து அல்லது மேல்பகுதியை உடைத்து உப்பு, மிளகு தூவவும்."
}
]
},
{
"dish": "Egg roll",
"servings": 2,
"prep": 15,
"cook": 15,
"note": "Roll while the chapati is warm so it does not crack.",
"note_ta": "சப்பாத்தி சூடாக இருக்கும்போதே சுருட்டினால் வெடிக்காது.",
"ingredients": [
{
"n": "Chapati",
"t": "சப்பாத்தி",
"q": 2.0,
"u": "piece"
},
{
"n": "Eggs",
"t": "முட்டை",
"q": 2.0,
"u": "piece"
},
{
"n": "Onion, thinly sliced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Green chilli, chopped",
"t": "பச்சை மிளகாய்",
"q": 1.0,
"u": "piece"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
"u": "tsp"
},
{
"n": "Tomato sauce or green chutney",
"t": "தக்காளி சாஸ் அல்லது பச்சை சட்னி",
"q": 2.0,
"u": "tbsp"
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
"e": "Beat the eggs with salt and pepper. Mix half of the onion and the chilli into it.",
"t": "முட்டையுடன் உப்பு, மிளகு சேர்த்து அடித்து பாதி வெங்காயம், மிளகாயைக் கலக்கவும்."
},
{
"e": "Heat a little oil, pour half the egg on the pan and place a chapati on top; cook until set, then flip.",
"t": "சிறிது எண்ணெய் சூடாக்கி பாதி முட்டையை ஊற்றி அதன் மேல் சப்பாத்தி வைத்து வெந்ததும் திருப்பவும்."
},
{
"e": "Spread the sauce, add the remaining raw onion, roll tightly and cut in half. Repeat for the second roll.",
"t": "சாஸ் தடவி மீதி பச்சை வெங்காயம் வைத்து இறுக்கமாகச் சுருட்டி இரண்டாக வெட்டவும். இரண்டாவது ரோலையும் இதேபோல் செய்யவும்."
}
]
},
{
"dish": "Egg fried rice",
"servings": 2,
"prep": 10,
"cook": 15,
"note": "Use cold, day-old rice so the grains stay separate.",
"note_ta": "குளிர்ந்த, முந்தைய நாள் சாதத்தைப் பயன்படுத்தினால் உதிரியாக இருக்கும்.",
"ingredients": [
{
"n": "Cooked rice, cold",
"t": "வேகவைத்த சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Eggs",
"t": "முட்டை",
"q": 3.0,
"u": "piece"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Garlic, chopped",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
},
{
"n": "Spring onion, chopped",
"t": "வெங்காயத்தாள்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Carrot and beans, finely chopped",
"t": "கேரட், பீன்ஸ்",
"q": 0.5,
"u": "cup"
},
{
"n": "Soy sauce",
"t": "சோயா சாஸ்",
"q": 2.0,
"u": "tsp"
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
"e": "Heat 1 tbsp oil, scramble the eggs with a pinch of salt and set aside.",
"t": "1 மேசைக்கரண்டி எண்ணெயைச் சூடாக்கி முட்டையை சிறிது உப்புடன் உதிர்த்துப் பொரித்து தனியே வைக்கவும்."
},
{
"e": "In the same pan heat the rest of the oil and fry the garlic, then the carrot and beans on high heat for 2 minutes.",
"t": "அதே கடாயில் மீதி எண்ணெயைச் சூடாக்கி பூண்டையும் பிறகு கேரட், பீன்ஸையும் அதிக தீயில் 2 நிமிடம் வதக்கவும்."
},
{
"e": "Add the rice, soy sauce, pepper and salt and toss for 3 minutes.",
"t": "சாதம், சோயா சாஸ், மிளகு, உப்பு சேர்த்து 3 நிமிடம் கிளறவும்."
},
{
"e": "Fold in the eggs and spring onion and serve hot.",
"t": "முட்டை, வெங்காயத்தாள் சேர்த்துக் கலந்து சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Fruit bowl",
"servings": 2,
"prep": 10,
"cook": 0,
"note": "Add a squeeze of lemon to stop apple and banana from turning brown.",
"note_ta": "ஆப்பிள், வாழைப்பழம் கருக்காமல் இருக்க சிறிது எலுமிச்சைச் சாறு பிழியவும்.",
"ingredients": [
{
"n": "Papaya, cubed",
"t": "பப்பாளி",
"q": 1.0,
"u": "cup"
},
{
"n": "Apple, cubed",
"t": "ஆப்பிள்",
"q": 1.0,
"u": "piece"
},
{
"n": "Banana, sliced",
"t": "வாழைப்பழம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Pomegranate or grapes",
"t": "மாதுளை அல்லது திராட்சை",
"q": 0.5,
"u": "cup"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சைச் சாறு",
"q": 1.0,
"u": "tsp"
}
],
"steps": [
{
"e": "Wash and cut all the fruit into bite-size pieces.",
"t": "எல்லாப் பழங்களையும் கழுவி சிறு துண்டுகளாக நறுக்கவும்."
},
{
"e": "Mix with the lemon juice in a bowl and serve fresh.",
"t": "எலுமிச்சைச் சாறுடன் ஒரு கிண்ணத்தில் கலந்து புதிதாகப் பரிமாறவும்."
}
]
},
{
"dish": "Milk",
"servings": 2,
"prep": 1,
"cook": 5,
"note": "Stir while heating so a skin does not form and the milk does not stick.",
"note_ta": "சூடாக்கும்போது கிளறினால் ஆடை படியாது; பால் அடிப்பிடிக்காது.",
"ingredients": [
{
"n": "Milk",
"t": "பால்",
"q": 2.0,
"u": "cup"
},
{
"n": "Sugar or jaggery",
"t": "சர்க்கரை அல்லது வெல்லம்",
"q": 2.0,
"u": "tsp"
}
],
"steps": [
{
"e": "Heat the milk on medium heat, stirring, until it just comes to a boil.",
"t": "பாலை நடுத்தர தீயில் கிளறிக்கொண்டே பொங்கும் நிலைவரை சூடாக்கவும்."
},
{
"e": "Pour into glasses, add sugar if you like and serve warm.",
"t": "டம்ளர்களில் ஊற்றி விரும்பினால் சர்க்கரை சேர்த்து சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Fresh fruit juice",
"servings": 2,
"prep": 10,
"cook": 0,
"note": "Drink soon after making it; it loses its taste and colour when kept.",
"note_ta": "செய்தவுடன் குடிக்கவும்; வைத்திருந்தால் சுவையும் நிறமும் குறையும்.",
"ingredients": [
{
"n": "Orange or sweet lime",
"t": "ஆரஞ்சு அல்லது சாத்துக்குடி",
"q": 4.0,
"u": "piece"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 2.0,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 1.0,
"u": "pinch"
},
{
"n": "Ice cubes",
"t": "ஐஸ் துண்டுகள்",
"q": 4.0,
"u": "piece"
}
],
"steps": [
{
"e": "Cut the fruit in half and squeeze out the juice; strain out the seeds.",
"t": "பழங்களை இரண்டாக வெட்டி சாற்றைப் பிழிந்து விதைகளை வடிகட்டவும்."
},
{
"e": "Stir in the sugar and a pinch of salt until dissolved.",
"t": "சர்க்கரை, சிறிது உப்பு சேர்த்துக் கரையும்வரை கலக்கவும்."
},
{
"e": "Pour over ice in glasses and serve.",
"t": "ஐஸ் துண்டுகள் போட்ட டம்ளர்களில் ஊற்றிப் பரிமாறவும்."
}
]
},
{
"dish": "Lemon juice",
"servings": 2,
"prep": 5,
"cook": 0,
"note": "Add the sugar and salt to taste; chilled water makes it more refreshing.",
"note_ta": "சர்க்கரை, உப்பை சுவைக்கேற்ப சேர்க்கவும்; குளிர்ந்த நீர் அதிக புத்துணர்ச்சி தரும்.",
"ingredients": [
{
"n": "Lemon",
"t": "எலுமிச்சை",
"q": 2.0,
"u": "piece"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 4.0,
"u": "tsp"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 1.0,
"u": "pinch"
},
{
"n": "Cold water",
"t": "குளிர்ந்த நீர்",
"q": 2.0,
"u": "cup"
}
],
"steps": [
{
"e": "Squeeze the lemons into a jug and remove the seeds.",
"t": "எலுமிச்சைகளைப் பிழிந்து ஜக்கில் விட்டு விதைகளை நீக்கவும்."
},
{
"e": "Add the sugar, salt and cold water and stir until dissolved. Serve cold.",
"t": "சர்க்கரை, உப்பு, குளிர்ந்த நீர் சேர்த்துக் கரையும்வரை கலந்து குளிர்ச்சியாகப் பரிமாறவும்."
}
]
},
{
"dish": "Rice kanji",
"servings": 2,
"prep": 5,
"cook": 25,
"note": "Add a little buttermilk and salt when serving for a cooling meal.",
"note_ta": "பரிமாறும்போது சிறிது மோர், உப்பு சேர்த்தால் குளிர்ச்சியான உணவாகும்.",
"ingredients": [
{
"n": "Rice",
"t": "அரிசி",
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
"n": "Salt",
"t": "உப்பு",
"q": null,
"u": "to_taste"
}
],
"steps": [
{
"e": "Wash the rice and boil it with the water in a covered pan.",
"t": "அரிசியைக் கழுவி தண்ணீருடன் மூடி வைத்து கொதிக்கவிடவும்."
},
{
"e": "Cook on low heat for 20 to 25 minutes until the rice is very soft and the water turns thick.",
"t": "குறைந்த தீயில் 20 முதல் 25 நிமிடம் அரிசி நன்கு குழைந்து தண்ணீர் கெட்டியாகும்வரை வேகவிடவும்."
},
{
"e": "Add salt, mash lightly and serve warm.",
"t": "உப்பு சேர்த்து லேசாக மசித்து சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Lemon sevai",
"servings": 2,
"prep": 10,
"cook": 10,
"note": "Mix the lemon juice in after turning off the heat so it stays fresh.",
"note_ta": "அடுப்பை அணைத்த பிறகு எலுமிச்சைச் சாறைக் கலந்தால் புதிய சுவை நிற்கும்.",
"ingredients": [
{
"n": "Rice sevai (rice noodles)",
"t": "அரிசி சேவை",
"q": 200.0,
"u": "g"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 0.5,
"u": "tsp"
},
{
"n": "Urad dal and chana dal",
"t": "உளுத்தம் பருப்பு, கடலைப் பருப்பு",
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
"n": "Turmeric powder",
"t": "மஞ்சள் தூள்",
"q": 0.25,
"u": "tsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சைச் சாறு",
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
"e": "Soak the sevai in hot water for a few minutes if it is dry, drain and keep loose.",
"t": "சேவை காய்ந்ததாக இருந்தால் சில நிமிடம் வெந்நீரில் ஊறவைத்து வடிகட்டி உதிரியாக வைக்கவும்."
},
{
"e": "Heat the oil, splutter the mustard, fry the dals and peanuts until golden, then the chilli and curry leaves.",
"t": "எண்ணெயைச் சூடாக்கி கடுகு பொரிந்ததும் பருப்புகள், வேர்க்கடலையைப் பொன்னிறமாக வறுத்து மிளகாய், கறிவேப்பிலையைச் சேர்க்கவும்."
},
{
"e": "Add the turmeric, salt and sevai and toss gently for 2 minutes.",
"t": "மஞ்சள் தூள், உப்பு, சேவை சேர்த்து மெதுவாக 2 நிமிடம் கிளறவும்."
},
{
"e": "Switch off, mix in the lemon juice and serve.",
"t": "அடுப்பை அணைத்து எலுமிச்சைச் சாறு கலந்து பரிமாறவும்."
}
]
},
{
"dish": "Coconut sevai",
"servings": 2,
"prep": 10,
"cook": 10,
"note": "Use freshly grated coconut for the best taste.",
"note_ta": "புதிதாகத் துருவிய தேங்காயைப் பயன்படுத்தினால் சுவை சிறப்பாக இருக்கும்.",
"ingredients": [
{
"n": "Rice sevai (rice noodles)",
"t": "அரிசி சேவை",
"q": 200.0,
"u": "g"
},
{
"n": "Grated coconut",
"t": "துருவிய தேங்காய்",
"q": 0.5,
"u": "cup"
},
{
"n": "Coconut oil or oil",
"t": "தேங்காய் எண்ணெய் அல்லது எண்ணெய்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Mustard seeds",
"t": "கடுகு",
"q": 0.5,
"u": "tsp"
},
{
"n": "Urad dal and chana dal",
"t": "உளுத்தம் பருப்பு, கடலைப் பருப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Dry red chilli",
"t": "வற்றல் மிளகாய்",
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
"n": "Cashew nuts",
"t": "முந்திரி",
"q": 6.0,
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
"e": "Soak the sevai in hot water for a few minutes if it is dry, drain and keep loose.",
"t": "சேவை காய்ந்ததாக இருந்தால் சில நிமிடம் வெந்நீரில் ஊறவைத்து வடிகட்டி உதிரியாக வைக்கவும்."
},
{
"e": "Heat the oil, splutter the mustard, fry the dals, cashews, chilli and curry leaves until golden.",
"t": "எண்ணெயைச் சூடாக்கி கடுகு பொரிந்ததும் பருப்புகள், முந்திரி, மிளகாய், கறிவேப்பிலையைப் பொன்னிறமாக வறுக்கவும்."
},
{
"e": "Add the coconut and fry for 1 minute, then add the sevai and salt and toss gently. Serve warm.",
"t": "தேங்காய் சேர்த்து 1 நிமிடம் வறுத்து சேவை, உப்பு சேர்த்து மெதுவாகக் கிளறி சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Vegetable fried rice",
"servings": 2,
"prep": 15,
"cook": 15,
"note": "Keep the heat high and do not crowd the pan so the vegetables stay crunchy.",
"note_ta": "தீயை அதிகமாக வைத்து கடாயில் நெரிசல் இல்லாமல் செய்தால் காய்கறிகள் மொறுமொறுப்பாக இருக்கும்.",
"ingredients": [
{
"n": "Cooked rice, cold",
"t": "வேகவைத்த சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Garlic, chopped",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
},
{
"n": "Carrot, beans and cabbage, finely chopped",
"t": "கேரட், பீன்ஸ், முட்டைக்கோஸ்",
"q": 1.0,
"u": "cup"
},
{
"n": "Spring onion, chopped",
"t": "வெங்காயத்தாள்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Soy sauce",
"t": "சோயா சாஸ்",
"q": 2.0,
"u": "tsp"
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
"e": "Heat the oil on high heat and fry the garlic for a few seconds.",
"t": "எண்ணெயை அதிக தீயில் சூடாக்கி பூண்டை சில வினாடிகள் வதக்கவும்."
},
{
"e": "Add the vegetables and stir-fry for 3 minutes until just tender.",
"t": "காய்கறிகளைச் சேர்த்து 3 நிமிடம் லேசாக வேகும்வரை வதக்கவும்."
},
{
"e": "Add the rice, soy sauce, pepper and salt and toss well for 3 minutes.",
"t": "சாதம், சோயா சாஸ், மிளகு, உப்பு சேர்த்து 3 நிமிடம் நன்கு கிளறவும்."
},
{
"e": "Sprinkle the spring onion and serve hot.",
"t": "வெங்காயத்தாள் தூவி சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Chicken fried rice",
"servings": 2,
"prep": 20,
"cook": 20,
"note": "Cut the chicken small so it cooks through quickly.",
"note_ta": "கோழியைச் சிறிய துண்டுகளாக வெட்டினால் விரைவாக வெந்துவிடும்.",
"ingredients": [
{
"n": "Cooked rice, cold",
"t": "வேகவைத்த சாதம்",
"q": 3.0,
"u": "cup"
},
{
"n": "Boneless chicken, small pieces",
"t": "எலும்பில்லாத கோழி",
"q": 200.0,
"u": "g"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 3.0,
"u": "tbsp"
},
{
"n": "Garlic, chopped",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
},
{
"n": "Carrot and beans, finely chopped",
"t": "கேரட், பீன்ஸ்",
"q": 0.5,
"u": "cup"
},
{
"n": "Spring onion, chopped",
"t": "வெங்காயத்தாள்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Soy sauce",
"t": "சோயா சாஸ்",
"q": 2.0,
"u": "tsp"
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
"e": "Season the chicken with salt and pepper and stir-fry in 1 tbsp oil until cooked through; set aside.",
"t": "கோழிக்கு உப்பு, மிளகு சேர்த்து 1 மேசைக்கரண்டி எண்ணெயில் வேகும்வரை வதக்கி தனியே வைக்கவும்."
},
{
"e": "Heat the rest of the oil, fry the garlic, then the carrot and beans for 2 minutes.",
"t": "மீதி எண்ணெயைச் சூடாக்கி பூண்டையும் பிறகு கேரட், பீன்ஸையும் 2 நிமிடம் வதக்கவும்."
},
{
"e": "Add the rice, soy sauce and salt and toss on high heat for 3 minutes.",
"t": "சாதம், சோயா சாஸ், உப்பு சேர்த்து அதிக தீயில் 3 நிமிடம் கிளறவும்."
},
{
"e": "Mix in the chicken and spring onion and serve hot.",
"t": "கோழி, வெங்காயத்தாளைக் கலந்து சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Veg noodles",
"servings": 2,
"prep": 15,
"cook": 15,
"note": "Rinse the boiled noodles in cold water so they do not stick together.",
"note_ta": "வேகவைத்த நூடுல்ஸை குளிர்ந்த நீரில் அலசினால் ஒட்டாமல் இருக்கும்.",
"ingredients": [
{
"n": "Noodles",
"t": "நூடுல்ஸ்",
"q": 200.0,
"u": "g"
},
{
"n": "Oil",
"t": "எண்ணெய்",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Garlic, chopped",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
},
{
"n": "Carrot, cabbage and capsicum, thinly sliced",
"t": "கேரட், முட்டைக்கோஸ், குடைமிளகாய்",
"q": 1.0,
"u": "cup"
},
{
"n": "Spring onion, chopped",
"t": "வெங்காயத்தாள்",
"q": 4.0,
"u": "tbsp"
},
{
"n": "Soy sauce",
"t": "சோயா சாஸ்",
"q": 2.0,
"u": "tsp"
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
"e": "Boil the noodles in salted water until just cooked, drain and rinse in cold water.",
"t": "நூடுல்ஸை உப்பு நீரில் வேகவைத்து வடிகட்டி குளிர்ந்த நீரில் அலசவும்."
},
{
"e": "Heat the oil on high heat, fry the garlic and vegetables for 3 minutes.",
"t": "எண்ணெயை அதிக தீயில் சூடாக்கி பூண்டு, காய்கறிகளை 3 நிமிடம் வதக்கவும்."
},
{
"e": "Add the noodles, soy sauce, pepper and salt and toss for 2 minutes. Garnish with spring onion.",
"t": "நூடுல்ஸ், சோயா சாஸ், மிளகு, உப்பு சேர்த்து 2 நிமிடம் கிளறி வெங்காயத்தாள் தூவவும்."
}
]
},
{
"dish": "Instant noodles",
"servings": 1,
"prep": 2,
"cook": 5,
"note": "Add an egg or some vegetables while it boils to make it a fuller meal.",
"note_ta": "கொதிக்கும்போது ஒரு முட்டை அல்லது காய்கறிகள் சேர்த்தால் முழு உணவாகும்.",
"ingredients": [
{
"n": "Instant noodles with seasoning sachet",
"t": "இன்ஸ்டன்ட் நூடுல்ஸ்",
"q": 1.0,
"u": "piece"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 1.5,
"u": "cup"
}
],
"steps": [
{
"e": "Boil the water in a pan.",
"t": "ஒரு பாத்திரத்தில் தண்ணீரைக் கொதிக்கவிடவும்."
},
{
"e": "Add the noodles and cook for 2 to 3 minutes, stirring.",
"t": "நூடுல்ஸைச் சேர்த்து கிளறிக்கொண்டே 2 முதல் 3 நிமிடம் வேகவிடவும்."
},
{
"e": "Stir in the seasoning, cook for a minute and serve hot.",
"t": "மசாலாவைச் சேர்த்து ஒரு நிமிடம் கொதிக்கவிட்டு சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Veg roll",
"servings": 2,
"prep": 15,
"cook": 15,
"note": "Roll while the chapati is warm; wrap the bottom in paper to eat on the go.",
"note_ta": "சப்பாத்தி சூடாக இருக்கும்போதே சுருட்டவும்; எடுத்துச் செல்ல கீழ்ப்பகுதியைக் காகிதத்தில் சுற்றவும்.",
"ingredients": [
{
"n": "Chapati",
"t": "சப்பாத்தி",
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
"n": "Onion, sliced",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Cabbage and carrot, shredded",
"t": "முட்டைக்கோஸ், கேரட்",
"q": 1.0,
"u": "cup"
},
{
"n": "Capsicum, sliced",
"t": "குடைமிளகாய்",
"q": 0.5,
"u": "piece"
},
{
"n": "Garam masala",
"t": "கரம் மசாலா",
"q": 0.5,
"u": "tsp"
},
{
"n": "Tomato sauce or green chutney",
"t": "தக்காளி சாஸ் அல்லது பச்சை சட்னி",
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
"e": "Heat the oil and stir-fry the onion and vegetables on high heat for 3 minutes.",
"t": "எண்ணெயைச் சூடாக்கி வெங்காயம், காய்கறிகளை அதிக தீயில் 3 நிமிடம் வதக்கவும்."
},
{
"e": "Add the garam masala and salt and mix.",
"t": "கரம் மசாலா, உப்பு சேர்த்துக் கலக்கவும்."
},
{
"e": "Spread the sauce on each warm chapati, put the filling in the middle and roll tightly.",
"t": "ஒவ்வொரு சூடான சப்பாத்தியிலும் சாஸ் தடவி நடுவில் பூரணம் வைத்து இறுக்கமாகச் சுருட்டவும்."
}
]
},
{
"dish": "Sprouts salad",
"servings": 2,
"prep": 10,
"cook": 5,
"note": "Steam the sprouts for 5 minutes if you prefer them softer.",
"note_ta": "மென்மையாக விரும்பினால் முளைகட்டிய பயறை 5 நிமிடம் ஆவியில் வேகவைக்கவும்.",
"ingredients": [
{
"n": "Green gram sprouts",
"t": "முளைகட்டிய பச்சைப் பயறு",
"q": 1.5,
"u": "cup"
},
{
"n": "Cucumber, chopped",
"t": "வெள்ளரிக்காய்",
"q": 0.5,
"u": "cup"
},
{
"n": "Tomato, chopped",
"t": "தக்காளி",
"q": 1.0,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 0.5,
"u": "piece"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி இலை",
"q": 2.0,
"u": "tbsp"
},
{
"n": "Lemon juice",
"t": "எலுமிச்சைச் சாறு",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Chaat masala or pepper",
"t": "சாட் மசாலா அல்லது மிளகு",
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
"e": "Mix the sprouts, cucumber, tomato, onion and coriander in a bowl.",
"t": "முளைகட்டிய பயறு, வெள்ளரி, தக்காளி, வெங்காயம், கொத்தமல்லியை ஒரு கிண்ணத்தில் கலக்கவும்."
},
{
"e": "Add the lemon juice, chaat masala and salt, toss and serve at once.",
"t": "எலுமிச்சைச் சாறு, சாட் மசாலா, உப்பு சேர்த்துக் கலந்து உடனே பரிமாறவும்."
}
]
},
{
"dish": "Boiled corn",
"servings": 2,
"prep": 5,
"cook": 20,
"note": "Rub with a little lemon, salt and chilli powder for a street-style snack.",
"note_ta": "சிறிது எலுமிச்சை, உப்பு, மிளகாய்த் தூள் தடவினால் தெருக்கடை சுவை கிடைக்கும்.",
"ingredients": [
{
"n": "Corn on the cob",
"t": "சோளக் கதிர்",
"q": 2.0,
"u": "piece"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 1.0,
"u": "tsp"
},
{
"n": "Lemon",
"t": "எலுமிச்சை",
"q": 0.5,
"u": "piece"
},
{
"n": "Chilli powder",
"t": "மிளகாய்த் தூள்",
"q": 0.25,
"u": "tsp"
}
],
"steps": [
{
"e": "Remove the husk and silk and boil the corn in salted water for 15 to 20 minutes until tender.",
"t": "மேல் தோலையும் நார்களையும் நீக்கி சோளத்தை உப்பு நீரில் 15 முதல் 20 நிமிடம் மென்மையாகும்வரை வேகவிடவும்."
},
{
"e": "Drain and rub with lemon, salt and chilli powder. Serve hot.",
"t": "வடிகட்டி எலுமிச்சை, உப்பு, மிளகாய்த் தூள் தடவி சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Roasted peanuts",
"servings": 4,
"prep": 2,
"cook": 10,
"note": "Keep stirring; peanuts darken quickly once they start to smell roasted.",
"note_ta": "கிளறிக்கொண்டே இருக்கவும்; வறுத்த வாசனை வந்ததும் வேர்க்கடலை விரைவாகக் கருகும்.",
"ingredients": [
{
"n": "Raw peanuts",
"t": "பச்சை வேர்க்கடலை",
"q": 1.0,
"u": "cup"
},
{
"n": "Salt",
"t": "உப்பு",
"q": 0.5,
"u": "tsp"
}
],
"steps": [
{
"e": "Dry-roast the peanuts in a heavy pan on medium-low heat, stirring, for 8 to 10 minutes until the skins crack and they smell roasted.",
"t": "கனமான கடாயில் வேர்க்கடலையை நடுத்தர குறைந்த தீயில் கிளறிக்கொண்டே 8 முதல் 10 நிமிடம் தோல் வெடித்து வறுத்த வாசனை வரும்வரை வறுக்கவும்."
},
{
"e": "Sprinkle salt, cool and serve.",
"t": "உப்பு தூவி ஆறவிட்டுப் பரிமாறவும்."
}
]
},
{
"dish": "Tomato soup",
"servings": 4,
"prep": 10,
"cook": 25,
"note": "Blend it smooth and strain for a restaurant-style soup.",
"note_ta": "மென்மையாக அரைத்து வடிகட்டினால் உணவகச் சூப் போல் இருக்கும்.",
"ingredients": [
{
"n": "Tomatoes, chopped",
"t": "தக்காளி",
"q": 6.0,
"u": "piece"
},
{
"n": "Onion, chopped",
"t": "வெங்காயம்",
"q": 1.0,
"u": "piece"
},
{
"n": "Garlic",
"t": "பூண்டு",
"q": 3.0,
"u": "clove"
},
{
"n": "Butter",
"t": "வெண்ணெய்",
"q": 1.0,
"u": "tbsp"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 3.0,
"u": "cup"
},
{
"n": "Black pepper",
"t": "மிளகுத் தூள்",
"q": 0.5,
"u": "tsp"
},
{
"n": "Sugar",
"t": "சர்க்கரை",
"q": 1.0,
"u": "pinch"
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
"e": "Melt the butter and fry the onion and garlic until soft.",
"t": "வெண்ணெயை உருக்கி வெங்காயம், பூண்டை மென்மையாகும்வரை வதக்கவும்."
},
{
"e": "Add the tomatoes and water and simmer for 15 minutes until very soft.",
"t": "தக்காளி, தண்ணீர் சேர்த்து 15 நிமிடம் நன்கு குழையும்வரை கொதிக்கவிடவும்."
},
{
"e": "Cool slightly, blend smooth and strain.",
"t": "சற்று ஆறவிட்டு மென்மையாக அரைத்து வடிகட்டவும்."
},
{
"e": "Return to the pan, add salt, pepper and sugar, simmer for 3 minutes and serve hot.",
"t": "மீண்டும் பாத்திரத்தில் ஊற்றி உப்பு, மிளகு, சர்க்கரை சேர்த்து 3 நிமிடம் கொதிக்கவிட்டு சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Sweet corn soup",
"servings": 4,
"prep": 10,
"cook": 20,
"note": "Add the cornflour paste slowly while stirring so there are no lumps.",
"note_ta": "சோள மாவுக் கலவையைக் கிளறிக்கொண்டே மெதுவாக ஊற்றினால் கட்டி விழாது.",
"ingredients": [
{
"n": "Sweet corn kernels",
"t": "ஸ்வீட் கார்ன்",
"q": 1.0,
"u": "cup"
},
{
"n": "Carrot and beans, finely chopped",
"t": "கேரட், பீன்ஸ்",
"q": 0.5,
"u": "cup"
},
{
"n": "Garlic, chopped",
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
"n": "Water",
"t": "தண்ணீர்",
"q": 4.0,
"u": "cup"
},
{
"n": "Cornflour",
"t": "சோள மாவு",
"q": 2.0,
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
"e": "Coarsely crush half of the corn. Fry the garlic in the oil for a few seconds.",
"t": "பாதி சோளத்தைக் கரகரப்பாக அரைக்கவும். எண்ணெயில் பூண்டை சில வினாடிகள் வதக்கவும்."
},
{
"e": "Add the corn, carrot, beans and water and boil for 10 minutes.",
"t": "சோளம், கேரட், பீன்ஸ், தண்ணீர் சேர்த்து 10 நிமிடம் கொதிக்கவிடவும்."
},
{
"e": "Mix the cornflour with a little cold water and pour in slowly, stirring, until the soup thickens.",
"t": "சோள மாவை சிறிது குளிர்ந்த நீரில் கரைத்து கிளறிக்கொண்டே மெதுவாக ஊற்றி சூப் கெட்டியாகும்வரை கொதிக்கவிடவும்."
},
{
"e": "Add salt and pepper and serve hot.",
"t": "உப்பு, மிளகு சேர்த்து சூடாகப் பரிமாறவும்."
}
]
},
{
"dish": "Chicken soup",
"servings": 4,
"prep": 15,
"cook": 40,
"note": "Skim off the foam while it simmers for a clear soup.",
"note_ta": "கொதிக்கும்போது நுரையை நீக்கினால் தெளிவான சூப் கிடைக்கும்.",
"ingredients": [
{
"n": "Chicken with bones",
"t": "எலும்புடன் கோழி",
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
"n": "Garlic",
"t": "பூண்டு",
"q": 4.0,
"u": "clove"
},
{
"n": "Ginger",
"t": "இஞ்சி",
"q": 1.0,
"u": "inch"
},
{
"n": "Carrot, chopped",
"t": "கேரட்",
"q": 1.0,
"u": "piece"
},
{
"n": "Black pepper",
"t": "மிளகுத் தூள்",
"q": 1.0,
"u": "tsp"
},
{
"n": "Water",
"t": "தண்ணீர்",
"q": 5.0,
"u": "cup"
},
{
"n": "Coriander leaves",
"t": "கொத்தமல்லி இலை",
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
"e": "Put the chicken, onion, garlic, ginger, carrot and water in a pot and bring to a boil, skimming the foam.",
"t": "கோழி, வெங்காயம், பூண்டு, இஞ்சி, கேரட், தண்ணீரை ஒரு பாத்திரத்தில் போட்டு கொதிக்கவிட்டு நுரையை நீக்கவும்."
},
{
"e": "Simmer on low heat for 30 minutes until the chicken is tender.",
"t": "குறைந்த தீயில் 30 நிமிடம் கோழி வேகும்வரை கொதிக்கவிடவும்."
},
{
"e": "Take out the bones, shred the meat back into the soup, and add salt and pepper.",
"t": "எலும்புகளை எடுத்து இறைச்சியைப் பிய்த்து சூப்பில் சேர்த்து உப்பு, மிளகு சேர்க்கவும்."
},
{
"e": "Garnish with coriander and serve hot.",
"t": "கொத்தமல்லி தூவி சூடாகப் பரிமாறவும்."
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
