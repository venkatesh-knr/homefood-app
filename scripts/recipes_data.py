# Standard recipes (drafted, to be checked by the family). Used by gen-recipes.py to write migration 0011.
# I(name, name_ta, quantity, unit)  -- quantity None for the two unit kinds 'to_taste' / 'as_needed'.
# Each recipe: dish name (must exist in the shared catalogue), base servings, prep min, cook min, ingredients, steps [(en, ta)], note (en, ta).


def I(name, ta, qty, unit):
    return (name, ta, qty, unit)


R = []


def recipe(dish, servings, prep, cook, ingredients, steps, note=None):
    R.append(dict(dish=dish, servings=servings, prep=prep, cook=cook, ingredients=ingredients, steps=steps, note=note))


# ───────────────────────────── South Indian ─────────────────────────────
recipe("Idli", 4, 20, 15,
       [I("Idli rice", "இட்லி அரிசி", 2, "cup"), I("Urad dal", "உளுந்து", 0.5, "cup"), I("Fenugreek seeds", "வெந்தயம்", 0.5, "tsp"),
        I("Salt", "உப்பு", None, "to_taste"), I("Water for grinding", "அரைக்கத் தண்ணீர்", None, "as_needed")],
       [("Soak the rice, and the urad dal with the fenugreek, in separate bowls for 4 to 5 hours.",
         "அரிசியையும், வெந்தயத்துடன் உளுந்தையும் தனித்தனியாக 4 முதல் 5 மணி நேரம் ஊறவைக்கவும்."),
        ("Grind the dal to a smooth, fluffy batter and the rice to a fine, slightly grainy batter. Mix both with salt.",
         "உளுந்தை மிருதுவாகவும் பஞ்சு போலவும், அரிசியை மெல்லிய ரவை பதத்திலும் அரைத்து, உப்பு சேர்த்துக் கலக்கவும்."),
        ("Cover and let the batter ferment for 8 to 10 hours, until it has risen and is bubbly.",
         "மூடி வைத்து 8 முதல் 10 மணி நேரம் புளிக்க விடவும்; மாவு பொங்கி நுரைத்து இருக்க வேண்டும்."),
        ("Grease the idli moulds, fill with batter and steam for 10 to 12 minutes.",
         "இட்லித் தட்டில் எண்ணெய் தடவி மாவு ஊற்றி, 10 முதல் 12 நிமிடம் ஆவியில் வேகவைக்கவும்."),
        ("Rest for 2 minutes, then lift out with a wet spoon. Serve hot with chutney and sambar.",
         "2 நிமிடம் ஆறவிட்டு, ஈரக் கரண்டியால் எடுக்கவும். சட்னி, சாம்பாருடன் சூடாகப் பரிமாறவும்.")],
       ("Batter keeps 3 days in the fridge. Serve with coconut chutney and sambar.", "மாவை குளிர்சாதனப் பெட்டியில் 3 நாள் வைக்கலாம். தேங்காய் சட்னி, சாம்பாருடன் பரிமாறவும்."))

recipe("Dosa", 4, 15, 20,
       [I("Idli rice", "இட்லி அரிசி", 2, "cup"), I("Urad dal", "உளுந்து", 0.5, "cup"), I("Fenugreek seeds", "வெந்தயம்", 0.5, "tsp"),
        I("Salt", "உப்பு", None, "to_taste"), I("Oil", "எண்ணெய்", 4, "tbsp")],
       [("Soak, grind and ferment the batter as for idli (8 to 10 hours).", "இட்லிக்குச் செய்வது போல மாவை ஊறவைத்து அரைத்து 8 முதல் 10 மணி நேரம் புளிக்க விடவும்."),
        ("Thin the batter with a little water to a pouring consistency and add salt.", "மாவில் சிறிது தண்ணீர் சேர்த்து ஊற்றும் பதத்தில் தளர்த்தி, உப்பு சேர்க்கவும்."),
        ("Heat a flat pan, wipe with oil, pour a ladle of batter and spread in a circle.", "தோசைக்கல்லைச் சூடாக்கி எண்ணெய் தடவி, ஒரு கரண்டி மாவை ஊற்றி வட்டமாகப் பரப்பவும்."),
        ("Drizzle oil around the edges and cook until golden and crisp. Fold and serve.", "ஓரங்களில் எண்ணெய் விட்டு பொன்னிறமாக மொறுமொறுப்பாக வேகவிடவும். மடித்துப் பரிமாறவும்.")],
       ("Serve with coconut chutney and sambar.", "தேங்காய் சட்னி, சாம்பாருடன் பரிமாறவும்."))

recipe("Ven Pongal", 4, 10, 20,
       [I("Raw rice", "பச்சரிசி", 1, "cup"), I("Moong dal (split yellow)", "பாசிப்பருப்பு", 0.5, "cup"), I("Water", "தண்ணீர்", 4.5, "cup"),
        I("Ghee", "நெய்", 3, "tbsp"), I("Black pepper, whole", "மிளகு", 1, "tsp"), I("Cumin seeds", "சீரகம்", 1, "tsp"),
        I("Ginger, grated", "இஞ்சி", 1, "tsp"), I("Cashews", "முந்திரி", 10, "piece"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"),
        I("Salt", "உப்பு", None, "to_taste")],
       [("Dry roast the moong dal on low heat until it smells nutty, about 3 minutes.", "பாசிப்பருப்பை சிறு தீயில் மணம் வரும் வரை, சுமார் 3 நிமிடம் வறுக்கவும்."),
        ("Wash the rice and dal together. Pressure cook with the water and salt for 4 to 5 whistles.", "அரிசியையும் பருப்பையும் சேர்த்துக் கழுவி, தண்ணீர், உப்புடன் 4 முதல் 5 விசில் வரை குக்கரில் வேகவிடவும்."),
        ("Let the pressure drop, open and mash lightly with a ladle.", "ஆவி அடங்கியதும் திறந்து, கரண்டியால் லேசாக மசிக்கவும்."),
        ("Heat the ghee. Fry the cashews golden, then add pepper, cumin, ginger and curry leaves.", "நெய்யைக் காயவைத்து முந்திரியைப் பொன்னிறமாக வறுத்து, மிளகு, சீரகம், இஞ்சி, கறிவேப்பிலை சேர்க்கவும்."),
        ("Pour the tempering over the pongal and mix well. Add a little hot water if it is too thick.", "தாளிப்பைப் பொங்கலில் ஊற்றிக் கலக்கவும். கெட்டியாக இருந்தால் சிறிது வெந்நீர் சேர்க்கவும்."),
        ("Serve hot with sambar and coconut chutney.", "சாம்பார், தேங்காய் சட்னியுடன் சூடாகப் பரிமாறவும்.")],
       ("Serve with sambar and coconut chutney.", "சாம்பார், தேங்காய் சட்னியுடன் பரிமாறவும்."))

recipe("Sambar", 4, 15, 30,
       [I("Toor dal", "துவரம்பருப்பு", 0.75, "cup"), I("Mixed vegetables (drumstick, carrot, brinjal, pumpkin)", "கலவை காய்கறிகள்", 2, "cup"),
        I("Tamarind", "புளி", 1, "tbsp"), I("Sambar powder", "சாம்பார் பொடி", 2, "tbsp"), I("Turmeric powder", "மஞ்சள் தூள்", 0.5, "tsp"),
        I("Mustard seeds", "கடுகு", 1, "tsp"), I("Dried red chilli", "வரமிளகாய்", 2, "piece"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"),
        I("Oil", "எண்ணெய்", 2, "tsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Pressure cook the dal with turmeric until very soft, then mash well.", "பருப்பை மஞ்சள் தூளுடன் குழைய வேகவைத்து நன்கு மசிக்கவும்."),
        ("Soak the tamarind in warm water and extract the juice.", "புளியை வெந்நீரில் ஊறவைத்துக் கரைத்து சாறு எடுக்கவும்."),
        ("Boil the vegetables in the tamarind water with salt and sambar powder until tender.", "காய்கறிகளைப் புளிக்கரைசல், உப்பு, சாம்பார் பொடியுடன் வேகும் வரை கொதிக்கவிடவும்."),
        ("Add the mashed dal, simmer 5 minutes and adjust water and salt.", "மசித்த பருப்பைச் சேர்த்து 5 நிமிடம் கொதிக்கவிட்டு, தண்ணீர், உப்பைச் சரிபார்க்கவும்."),
        ("Heat oil, splutter the mustard, fry the chillies and curry leaves and pour over the sambar.", "எண்ணெயில் கடுகு வெடிக்கவிட்டு, மிளகாய், கறிவேப்பிலை வறுத்து சாம்பாரில் சேர்க்கவும்.")],
       ("Serve with rice, idli or dosa.", "சாதம், இட்லி அல்லது தோசையுடன் பரிமாறவும்."))

recipe("Rasam", 4, 10, 15,
       [I("Tomato, chopped", "தக்காளி", 2, "piece"), I("Tamarind", "புளி", 1, "tbsp"), I("Rasam powder", "ரசப் பொடி", 2, "tsp"),
        I("Toor dal, cooked", "வேகவைத்த துவரம்பருப்பு", 0.25, "cup"), I("Garlic, crushed", "பூண்டு", 3, "clove"), I("Mustard seeds", "கடுகு", 1, "tsp"),
        I("Cumin seeds", "சீரகம்", 1, "tsp"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"), I("Coriander leaves", "கொத்தமல்லி", 1, "handful"),
        I("Ghee or oil", "நெய் அல்லது எண்ணெய்", 2, "tsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Mix the tamarind juice with 3 cups water, the tomatoes, rasam powder, garlic and salt. Boil 8 minutes.", "புளிக்கரைசலை 3 கப் தண்ணீருடன் தக்காளி, ரசப் பொடி, பூண்டு, உப்பு சேர்த்து 8 நிமிடம் கொதிக்கவிடவும்."),
        ("Add the cooked dal and a little of its water. Heat until frothy, but do not boil hard.", "வேகவைத்த பருப்பையும் சிறிது தண்ணீரையும் சேர்த்து, நுரைத்து வரும் வரை சூடாக்கவும்; பொங்க விட வேண்டாம்."),
        ("Heat ghee, splutter mustard and cumin, add curry leaves and pour over the rasam.", "நெய்யில் கடுகு, சீரகம் தாளித்து கறிவேப்பிலை சேர்த்து ரசத்தில் ஊற்றவும்."),
        ("Finish with coriander leaves. Serve hot with rice.", "கொத்தமல்லி தூவி, சாதத்துடன் சூடாகப் பரிமாறவும்.")],
       ("A spoon of rasam over hot rice with a little ghee is classic.", "சூடான சாதத்தில் ரசமும் சிறிது நெய்யும் சேர்த்துச் சாப்பிடுவது வழக்கம்."))

recipe("Curd rice", 4, 10, 10,
       [I("Cooked rice", "வேகவைத்த சாதம்", 2, "cup"), I("Curd", "தயிர்", 1.5, "cup"), I("Milk", "பால்", 0.5, "cup"),
        I("Mustard seeds", "கடுகு", 1, "tsp"), I("Urad dal", "உளுந்து", 1, "tsp"), I("Green chilli, chopped", "பச்சை மிளகாய்", 1, "piece"),
        I("Ginger, grated", "இஞ்சி", 1, "tsp"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"), I("Oil", "எண்ணெய்", 1, "tsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Mash the warm rice well and mix in the milk and salt.", "வெதுவெதுப்பான சாதத்தை நன்கு மசித்து பால், உப்பு சேர்த்துக் கலக்கவும்."),
        ("Let it cool, then stir in the curd.", "ஆறியதும் தயிரைச் சேர்த்துக் கிளறவும்."),
        ("Heat oil, splutter the mustard, fry the urad dal, chilli, ginger and curry leaves.", "எண்ணெயில் கடுகு, உளுந்து, மிளகாய், இஞ்சி, கறிவேப்பிலை தாளிக்கவும்."),
        ("Pour the tempering over the rice and mix. Serve cool with pickle.", "தாளிப்பை சாதத்தில் ஊற்றிக் கலந்து, ஊறுகாயுடன் குளிர்ச்சியாகப் பரிமாறவும்.")],
       ("Add pomegranate or grapes for a sweet touch.", "மாதுளை அல்லது திராட்சை சேர்த்தால் இனிப்புச் சுவை கூடும்."))

recipe("Upma", 4, 10, 15,
       [I("Rava (semolina)", "ரவை", 1, "cup"), I("Water", "தண்ணீர்", 2.5, "cup"), I("Onion, chopped", "வெங்காயம்", 1, "piece"),
        I("Green chilli", "பச்சை மிளகாய்", 2, "piece"), I("Ginger, grated", "இஞ்சி", 1, "tsp"), I("Mustard seeds", "கடுகு", 1, "tsp"),
        I("Urad dal", "உளுந்து", 1, "tsp"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"), I("Oil or ghee", "எண்ணெய் அல்லது நெய்", 2, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Dry roast the rava until lightly fragrant and set aside.", "ரவையை மணம் வரும் வரை வறுத்துத் தனியே வைக்கவும்."),
        ("Heat oil, splutter the mustard, fry the urad dal, chillies, ginger and curry leaves, then the onion until soft.", "எண்ணெயில் கடுகு, உளுந்து, மிளகாய், இஞ்சி, கறிவேப்பிலை தாளித்து, வெங்காயத்தை வதக்கவும்."),
        ("Add the water and salt and bring to a rolling boil.", "தண்ணீர், உப்பு சேர்த்து நன்கு கொதிக்கவிடவும்."),
        ("Lower the heat, pour in the rava slowly while stirring so no lumps form.", "தீயைக் குறைத்து, கட்டி விழாமல் கிளறிக்கொண்டே ரவையைத் தூவவும்."),
        ("Cover and cook 3 minutes, mix and serve hot with chutney.", "மூடி 3 நிமிடம் வேகவிட்டு, கிளறி சட்னியுடன் சூடாகப் பரிமாறவும்.")],
       None)

recipe("Lemon rice", 4, 10, 15,
       [I("Cooked rice", "வேகவைத்த சாதம்", 3, "cup"), I("Lemon juice", "எலுமிச்சை சாறு", 3, "tbsp"), I("Peanuts", "வேர்க்கடலை", 2, "tbsp"),
        I("Mustard seeds", "கடுகு", 1, "tsp"), I("Chana dal", "கடலைப்பருப்பு", 1, "tsp"), I("Green chilli", "பச்சை மிளகாய்", 2, "piece"),
        I("Turmeric powder", "மஞ்சள் தூள்", 0.5, "tsp"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"), I("Oil", "எண்ணெய்", 2, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Spread the cooked rice on a plate to cool and keep the grains separate.", "வேகவைத்த சாதத்தை ஒரு தட்டில் பரப்பி உதிரியாக ஆறவிடவும்."),
        ("Heat oil, fry the peanuts, then splutter the mustard and fry the chana dal, chillies and curry leaves.", "எண்ணெயில் வேர்க்கடலை வறுத்து, கடுகு, கடலைப்பருப்பு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."),
        ("Add turmeric and salt, switch off the heat and stir in the lemon juice.", "மஞ்சள் தூள், உப்பு சேர்த்து தீயை அணைத்து எலுமிச்சை சாறு கலக்கவும்."),
        ("Fold in the rice gently until evenly yellow. Serve with papad or chips.", "சாதத்தைச் சேர்த்து மெதுவாகக் கலக்கவும். அப்பளத்துடன் பரிமாறவும்.")],
       ("Add the lemon juice off the heat so the rice does not turn bitter.", "தீயை அணைத்த பின் எலுமிச்சை சாறு சேர்த்தால் கசப்பு வராது."))

recipe("Tomato rice", 4, 10, 20,
       [I("Basmati or raw rice", "அரிசி", 1.5, "cup"), I("Tomato, chopped", "தக்காளி", 4, "piece"), I("Onion, sliced", "வெங்காயம்", 1, "piece"),
        I("Ginger-garlic paste", "இஞ்சி பூண்டு விழுது", 1, "tsp"), I("Red chilli powder", "மிளகாய்த் தூள்", 1, "tsp"), I("Garam masala", "கரம் மசாலா", 0.5, "tsp"),
        I("Oil", "எண்ணெய்", 3, "tbsp"), I("Mint leaves", "புதினா", 1, "handful"), I("Water", "தண்ணீர்", 3, "cup"), I("Salt", "உப்பு", None, "to_taste")],
       [("Heat oil, fry the onion until golden, then the ginger-garlic paste.", "எண்ணெயில் வெங்காயத்தைப் பொன்னிறமாக வதக்கி, இஞ்சி பூண்டு விழுது சேர்க்கவும்."),
        ("Add the tomatoes, chilli powder, garam masala and salt and cook until mushy.", "தக்காளி, மிளகாய்த் தூள், கரம் மசாலா, உப்பு சேர்த்துக் குழைய வதக்கவும்."),
        ("Add the washed rice, mint and water. Bring to a boil.", "கழுவிய அரிசி, புதினா, தண்ணீர் சேர்த்துக் கொதிக்கவிடவும்."),
        ("Cover and cook on low heat until the water is absorbed, about 15 minutes. Rest 5 minutes, then fluff.", "மூடி சிறு தீயில் தண்ணீர் வற்றும் வரை, சுமார் 15 நிமிடம் வேகவிடவும். 5 நிமிடம் கழித்து உதிர்த்து விடவும்.")],
       ("Serve with raita and papad.", "ரைத்தா, அப்பளத்துடன் பரிமாறவும்."))

recipe("Coconut chutney", 4, 10, 5,
       [I("Grated coconut", "துருவிய தேங்காய்", 1, "cup"), I("Roasted gram (pottukadalai)", "பொட்டுக்கடலை", 2, "tbsp"), I("Green chilli", "பச்சை மிளகாய்", 2, "piece"),
        I("Ginger", "இஞ்சி", 0.5, "inch"), I("Mustard seeds", "கடுகு", 0.5, "tsp"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"),
        I("Oil", "எண்ணெய்", 1, "tsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Grind the coconut, roasted gram, chillies, ginger and salt with a little water to a smooth paste.", "தேங்காய், பொட்டுக்கடலை, மிளகாய், இஞ்சி, உப்பை சிறிது தண்ணீருடன் மிருதுவாக அரைக்கவும்."),
        ("Heat oil, splutter the mustard and curry leaves.", "எண்ணெயில் கடுகு, கறிவேப்பிலை தாளிக்கவும்."),
        ("Pour the tempering over the chutney and mix.", "தாளிப்பை சட்னியில் ஊற்றிக் கலக்கவும்.")],
       ("Best eaten the same day.", "அன்றே சாப்பிடுவது நல்லது."))

recipe("Tomato chutney", 4, 10, 15,
       [I("Tomato, chopped", "தக்காளி", 4, "piece"), I("Onion, chopped", "வெங்காயம்", 1, "piece"), I("Dried red chilli", "வரமிளகாய்", 4, "piece"),
        I("Garlic", "பூண்டு", 3, "clove"), I("Mustard seeds", "கடுகு", 0.5, "tsp"), I("Oil", "எண்ணெய்", 2, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Heat 1 tbsp oil and fry the chillies, garlic and onion until soft.", "1 மேசைக்கரண்டி எண்ணெயில் மிளகாய், பூண்டு, வெங்காயத்தை வதக்கவும்."),
        ("Add the tomatoes and salt and cook until they turn pulpy and the oil separates.", "தக்காளி, உப்பு சேர்த்து குழைந்து எண்ணெய் பிரியும் வரை வதக்கவும்."),
        ("Cool and grind to a coarse or smooth paste as you like.", "ஆறவிட்டு விருப்பப்படி கொரகொரப்பாகவோ மிருதுவாகவோ அரைக்கவும்."),
        ("Temper mustard in the remaining oil and pour over.", "மீதி எண்ணெயில் கடுகு தாளித்துச் சட்னியில் ஊற்றவும்.")],
       None)

recipe("Beans poriyal", 4, 10, 12,
       [I("Green beans, finely chopped", "பீன்ஸ்", 3, "cup"), I("Grated coconut", "துருவிய தேங்காய்", 3, "tbsp"), I("Mustard seeds", "கடுகு", 1, "tsp"),
        I("Urad dal", "உளுந்து", 1, "tsp"), I("Dried red chilli", "வரமிளகாய்", 2, "piece"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"),
        I("Oil", "எண்ணெய்", 1, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Heat oil, splutter the mustard, fry the urad dal, chillies and curry leaves.", "எண்ணெயில் கடுகு, உளுந்து, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."),
        ("Add the beans, salt and a splash of water. Cover and cook 8 minutes, stirring now and then.", "பீன்ஸ், உப்பு, சிறிது தண்ணீர் சேர்த்து மூடி, அவ்வப்போது கிளறி 8 நிமிடம் வேகவிடவும்."),
        ("Stir in the coconut, cook 2 minutes more and serve with rice.", "தேங்காய் சேர்த்து மேலும் 2 நிமிடம் வதக்கி சாதத்துடன் பரிமாறவும்.")],
       None)

recipe("Cabbage poriyal", 4, 10, 12,
       [I("Cabbage, finely chopped", "முட்டைக்கோஸ்", 4, "cup"), I("Grated coconut", "துருவிய தேங்காய்", 3, "tbsp"), I("Mustard seeds", "கடுகு", 1, "tsp"),
        I("Chana dal", "கடலைப்பருப்பு", 1, "tsp"), I("Green chilli", "பச்சை மிளகாய்", 2, "piece"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"),
        I("Oil", "எண்ணெய்", 1, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Heat oil, splutter the mustard, fry the chana dal, chillies and curry leaves.", "எண்ணெயில் கடுகு, கடலைப்பருப்பு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."),
        ("Add the cabbage and salt and cook covered on low heat for 6 to 8 minutes.", "முட்டைக்கோஸ், உப்பு சேர்த்து சிறு தீயில் மூடி 6 முதல் 8 நிமிடம் வேகவிடவும்."),
        ("Add the coconut, mix and cook 2 minutes. Serve hot.", "தேங்காய் சேர்த்துக் கிளறி 2 நிமிடம் வதக்கி சூடாகப் பரிமாறவும்.")],
       None)

recipe("Medu vada", 4, 15, 20,
       [I("Urad dal", "உளுந்து", 1, "cup"), I("Green chilli, chopped", "பச்சை மிளகாய்", 2, "piece"), I("Ginger, grated", "இஞ்சி", 1, "tsp"),
        I("Black pepper, crushed", "மிளகு", 1, "tsp"), I("Curry leaves, chopped", "கறிவேப்பிலை", 1, "sprig"), I("Onion, chopped", "வெங்காயம்", 1, "piece"),
        I("Salt", "உப்பு", None, "to_taste"), I("Oil for frying", "பொரிக்க எண்ணெய்", None, "as_needed")],
       [("Soak the dal for 2 hours, drain and grind with very little water to a thick, fluffy batter.", "உளுந்தை 2 மணி நேரம் ஊறவைத்து, மிகக் குறைந்த தண்ணீரில் கெட்டியாகவும் பஞ்சு போலவும் அரைக்கவும்."),
        ("Mix in the chillies, ginger, pepper, curry leaves, onion and salt.", "மிளகாய், இஞ்சி, மிளகு, கறிவேப்பிலை, வெங்காயம், உப்பு சேர்த்துக் கலக்கவும்."),
        ("Wet your hands, shape a ball, flatten and make a hole in the centre.", "கையை நனைத்து உருண்டை எடுத்து தட்டி, நடுவில் துளையிடவும்."),
        ("Deep fry on medium heat until golden and crisp. Drain and serve hot with chutney and sambar.", "நடுத்தர தீயில் பொன்னிறமாக மொறுமொறுப்பாகப் பொரித்து எடுத்து, சட்னி, சாம்பாருடன் சூடாகப் பரிமாறவும்.")],
       None)

recipe("Sundal", 4, 10, 15,
       [I("Chickpeas, soaked overnight", "கொண்டைக்கடலை", 1, "cup"), I("Grated coconut", "துருவிய தேங்காய்", 3, "tbsp"), I("Mustard seeds", "கடுகு", 1, "tsp"),
        I("Dried red chilli", "வரமிளகாய்", 2, "piece"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"), I("Oil", "எண்ணெய்", 1, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Pressure cook the soaked chickpeas with salt until soft but whole. Drain.", "ஊறவைத்த கொண்டைக்கடலையை உப்புடன் உடையாமல் வேகவைத்து வடிக்கவும்."),
        ("Heat oil, splutter the mustard and fry the chillies and curry leaves.", "எண்ணெயில் கடுகு, மிளகாய், கறிவேப்பிலை தாளிக்கவும்."),
        ("Add the chickpeas and coconut, toss for 2 minutes and serve warm.", "கடலை, தேங்காய் சேர்த்து 2 நிமிடம் புரட்டி சூடாகப் பரிமாறவும்.")],
       None)

recipe("Rava kesari", 4, 5, 20,
       [I("Rava (semolina)", "ரவை", 1, "cup"), I("Sugar", "சர்க்கரை", 1, "cup"), I("Water", "தண்ணீர்", 2, "cup"), I("Ghee", "நெய்", 4, "tbsp"),
        I("Cashews", "முந்திரி", 10, "piece"), I("Cardamom powder", "ஏலக்காய்த் தூள்", 0.5, "tsp"), I("Saffron or food colour", "குங்குமப்பூ", 1, "pinch")],
       [("Fry the cashews in 1 tbsp ghee and set aside. Roast the rava in 2 tbsp ghee until fragrant.", "முந்திரியை 1 மேசைக்கரண்டி நெய்யில் வறுத்து எடுக்கவும். ரவையை 2 மேசைக்கரண்டி நெய்யில் மணம் வரும் வரை வறுக்கவும்."),
        ("Boil the water with the saffron. Pour it slowly over the rava, stirring to avoid lumps.", "குங்குமப்பூவுடன் தண்ணீரைக் கொதிக்கவிட்டு, கட்டி விழாமல் கிளறிக்கொண்டே ரவையில் ஊற்றவும்."),
        ("When the rava is cooked, add the sugar. It will turn loose, then thicken again.", "ரவை வெந்ததும் சர்க்கரை சேர்க்கவும்; முதலில் இளகி, பிறகு கெட்டியாகும்."),
        ("Add the remaining ghee, cardamom and cashews. Mix and serve warm.", "மீதி நெய், ஏலக்காய், முந்திரி சேர்த்துக் கலந்து சூடாகப் பரிமாறவும்.")],
       None)

recipe("Semiya payasam", 4, 5, 20,
       [I("Vermicelli (semiya)", "சேமியா", 0.5, "cup"), I("Milk", "பால்", 3, "cup"), I("Sugar", "சர்க்கரை", 0.5, "cup"), I("Ghee", "நெய்", 2, "tbsp"),
        I("Cashews", "முந்திரி", 8, "piece"), I("Raisins", "உலர் திராட்சை", 1, "tbsp"), I("Cardamom powder", "ஏலக்காய்த் தூள்", 0.5, "tsp")],
       [("Fry the cashews and raisins in ghee and set aside. Roast the vermicelli in the same ghee until golden.", "முந்திரி, திராட்சையை நெய்யில் வறுத்து எடுக்கவும். அதே நெய்யில் சேமியாவைப் பொன்னிறமாக வறுக்கவும்."),
        ("Add the milk and simmer until the vermicelli is soft, about 8 minutes.", "பால் சேர்த்து சேமியா மென்மையாகும் வரை, சுமார் 8 நிமிடம் கொதிக்கவிடவும்."),
        ("Stir in the sugar and cardamom and cook 3 more minutes.", "சர்க்கரை, ஏலக்காய் சேர்த்து மேலும் 3 நிமிடம் கொதிக்கவிடவும்."),
        ("Top with the cashews and raisins. Serve warm or chilled.", "முந்திரி, திராட்சை சேர்த்து சூடாகவோ குளிரவைத்தோ பரிமாறவும்.")],
       None)

recipe("Vegetable biryani", 4, 20, 35,
       [I("Basmati rice", "பாஸ்மதி அரிசி", 2, "cup"), I("Mixed vegetables", "கலவை காய்கறிகள்", 3, "cup"), I("Onion, sliced", "வெங்காயம்", 2, "piece"),
        I("Curd", "தயிர்", 0.5, "cup"), I("Ginger-garlic paste", "இஞ்சி பூண்டு விழுது", 1, "tbsp"), I("Biryani masala", "பிரியாணி மசாலா", 2, "tbsp"),
        I("Mint and coriander leaves", "புதினா, கொத்தமல்லி", 1, "bunch"), I("Ghee or oil", "நெய் அல்லது எண்ணெய்", 4, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Wash and soak the rice for 20 minutes. Fry the onions until deep golden and set half aside.", "அரிசியைக் கழுவி 20 நிமிடம் ஊறவைக்கவும். வெங்காயத்தை நன்கு பொன்னிறமாக வறுத்து பாதியை எடுத்து வைக்கவும்."),
        ("Cook the vegetables with the ginger-garlic paste, curd, biryani masala and salt for 8 minutes.", "காய்கறிகளை இஞ்சி பூண்டு விழுது, தயிர், பிரியாணி மசாலா, உப்புடன் 8 நிமிடம் வேகவிடவும்."),
        ("Boil the rice in salted water until 70% cooked and drain.", "அரிசியை உப்பு நீரில் 70% வேகும் வரை வேகவைத்து வடிக்கவும்."),
        ("Layer the rice over the vegetables with herbs, fried onion and ghee. Seal and cook on low heat for 20 minutes.", "காய்கறிகளின் மேல் சாதம், கீரைகள், வறுத்த வெங்காயம், நெய் அடுக்கி மூடி சிறு தீயில் 20 நிமிடம் தம்மில் வேகவிடவும்."),
        ("Rest 5 minutes, mix gently and serve with raita.", "5 நிமிடம் கழித்து மெதுவாகக் கிளறி ரைத்தாவுடன் பரிமாறவும்.")],
       ("Serve with raita.", "ரைத்தாவுடன் பரிமாறவும்."))

recipe("Chicken curry", 4, 15, 40,
       [I("Chicken, curry cut", "கோழி இறைச்சி", 600, "g"), I("Onion, chopped", "வெங்காயம்", 2, "piece"), I("Tomato, chopped", "தக்காளி", 2, "piece"),
        I("Ginger-garlic paste", "இஞ்சி பூண்டு விழுது", 1, "tbsp"), I("Chilli powder", "மிளகாய்த் தூள்", 2, "tsp"), I("Coriander powder", "மல்லித் தூள்", 1, "tbsp"),
        I("Turmeric powder", "மஞ்சள் தூள்", 0.5, "tsp"), I("Oil", "எண்ணெய்", 3, "tbsp"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"), I("Salt", "உப்பு", None, "to_taste")],
       [("Heat oil, add curry leaves and onions and fry until golden brown.", "எண்ணெயில் கறிவேப்பிலை, வெங்காயம் சேர்த்துப் பொன்னிறமாக வதக்கவும்."),
        ("Add the ginger-garlic paste and cook until the raw smell goes, then the tomatoes until soft.", "இஞ்சி பூண்டு விழுதைப் பச்சை வாசனை போகும் வரை வதக்கி, தக்காளி சேர்த்துக் குழைய வதக்கவும்."),
        ("Add the chilli, coriander and turmeric powders and salt, then the chicken. Mix well.", "மிளகாய், மல்லி, மஞ்சள் தூள்கள், உப்பு, கோழி சேர்த்து நன்கு கிளறவும்."),
        ("Add a cup of water, cover and simmer 25 minutes until the chicken is tender and the gravy thick.", "ஒரு கப் தண்ணீர் சேர்த்து மூடி, கோழி வேகும் வரை 25 நிமிடம் கொதிக்கவிட்டு கெட்டியாக்கவும்.")],
       ("Serve with rice, chapati or parotta.", "சாதம், சப்பாத்தி அல்லது பரோட்டாவுடன் பரிமாறவும்."))

recipe("Fish curry", 4, 15, 25,
       [I("Fish pieces", "மீன் துண்டுகள்", 500, "g"), I("Tamarind", "புளி", 1, "tbsp"), I("Onion, sliced", "வெங்காயம்", 1, "piece"), I("Tomato, chopped", "தக்காளி", 2, "piece"),
        I("Chilli powder", "மிளகாய்த் தூள்", 2, "tsp"), I("Coriander powder", "மல்லித் தூள்", 1, "tbsp"), I("Turmeric powder", "மஞ்சள் தூள்", 0.5, "tsp"),
        I("Fenugreek seeds", "வெந்தயம்", 0.25, "tsp"), I("Mustard seeds", "கடுகு", 1, "tsp"), I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"), I("Oil", "எண்ணெய்", 3, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Heat oil, splutter the mustard and fenugreek, then add the curry leaves and onion and fry until soft.", "எண்ணெயில் கடுகு, வெந்தயம் தாளித்து கறிவேப்பிலை, வெங்காயத்தை வதக்கவும்."),
        ("Add the tomatoes and the chilli, coriander and turmeric powders and cook until mushy.", "தக்காளி, மிளகாய், மல்லி, மஞ்சள் தூள்கள் சேர்த்துக் குழைய வதக்கவும்."),
        ("Add the tamarind water, salt and 1 cup of water. Boil for 8 minutes.", "புளிக்கரைசல், உப்பு, 1 கப் தண்ணீர் சேர்த்து 8 நிமிடம் கொதிக்கவிடவும்."),
        ("Slide in the fish and simmer 8 to 10 minutes without stirring hard. Rest before serving.", "மீனைச் சேர்த்து அதிகம் கிளறாமல் 8 முதல் 10 நிமிடம் கொதிக்கவிட்டு, சிறிது நேரம் வைத்து பரிமாறவும்.")],
       ("Tastes better the next day. Check the fish for bones.", "மறுநாள் இன்னும் சுவையாக இருக்கும். மீனில் முள் உள்ளதா எனப் பார்க்கவும்."))

# ───────────────────────────── North Indian ─────────────────────────────
recipe("Chapati", 4, 15, 15,
       [I("Whole wheat flour (atta)", "கோதுமை மாவு", 2, "cup"), I("Water", "தண்ணீர்", 0.75, "cup"), I("Salt", "உப்பு", 0.5, "tsp"), I("Oil", "எண்ணெய்", 1, "tbsp")],
       [("Mix the flour, salt and oil. Add water gradually and knead to a soft dough.", "மாவு, உப்பு, எண்ணெயைக் கலந்து, தண்ணீரை சிறிது சிறிதாக ஊற்றி மிருதுவாகப் பிசையவும்."),
        ("Cover and rest the dough for 20 minutes.", "மூடி 20 நிமிடம் ஊறவிடவும்."),
        ("Divide into 8 balls and roll each into a thin circle.", "8 உருண்டைகளாகப் பிரித்து ஒவ்வொன்றையும் மெல்லிய வட்டமாகத் தேய்க்கவும்."),
        ("Cook on a hot tawa until brown spots appear on both sides, pressing lightly so it puffs. Brush with ghee.", "சூடான தவாவில் இருபுறமும் புள்ளிகள் வரும் வரை சுட்டு, லேசாக அழுத்தி உப்ப வைத்து, நெய் தடவவும்.")],
       ("Serve with dal, kurma or any curry.", "பருப்பு, குருமா அல்லது ஏதேனும் கறியுடன் பரிமாறவும்."))

recipe("Aloo paratha", 4, 25, 20,
       [I("Whole wheat flour", "கோதுமை மாவு", 2, "cup"), I("Potatoes, boiled and mashed", "உருளைக்கிழங்கு", 3, "piece"), I("Green chilli, chopped", "பச்சை மிளகாய்", 2, "piece"),
        I("Coriander leaves", "கொத்தமல்லி", 1, "handful"), I("Cumin seeds", "சீரகம்", 1, "tsp"), I("Chilli powder", "மிளகாய்த் தூள்", 0.5, "tsp"),
        I("Ghee or oil", "நெய் அல்லது எண்ணெய்", 4, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Knead the flour with water and a pinch of salt into a soft dough and rest 15 minutes.", "மாவை தண்ணீர், சிறிது உப்புடன் மிருதுவாகப் பிசைந்து 15 நிமிடம் ஊறவிடவும்."),
        ("Mix the potato with the chilli, coriander, cumin, chilli powder and salt for the filling.", "உருளைக்கிழங்குடன் மிளகாய், கொத்தமல்லி, சீரகம், மிளகாய்த் தூள், உப்பு கலந்து பூரணம் தயாரிக்கவும்."),
        ("Roll a ball of dough into a small circle, place filling in the centre, seal and roll out gently.", "மாவு உருண்டையை சிறிய வட்டமாகத் தேய்த்து நடுவில் பூரணம் வைத்து மூடி, மெதுவாகத் தேய்க்கவும்."),
        ("Cook on a hot tawa with ghee on both sides until golden and crisp.", "சூடான தவாவில் நெய் தடவி இருபுறமும் பொன்னிறமாகச் சுடவும்.")],
       ("Serve with curd, butter or pickle.", "தயிர், வெண்ணெய் அல்லது ஊறுகாயுடன் பரிமாறவும்."))

recipe("Paneer butter masala", 4, 15, 25,
       [I("Paneer, cubed", "பனீர்", 250, "g"), I("Tomato puree", "தக்காளி விழுது", 1.5, "cup"), I("Onion, chopped", "வெங்காயம்", 1, "piece"), I("Cashews", "முந்திரி", 10, "piece"),
        I("Butter", "வெண்ணெய்", 3, "tbsp"), I("Cream", "க்ரீம்", 0.25, "cup"), I("Kashmiri chilli powder", "காஷ்மீரி மிளகாய்த் தூள்", 1, "tsp"),
        I("Garam masala", "கரம் மசாலா", 0.5, "tsp"), I("Kasuri methi", "கசூரி மேத்தி", 1, "tsp"), I("Sugar", "சர்க்கரை", 1, "tsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Cook the onion, tomato puree and cashews with a little water until soft, then blend to a smooth paste.", "வெங்காயம், தக்காளி விழுது, முந்திரியை சிறிது தண்ணீருடன் வேகவைத்து மிருதுவாக அரைக்கவும்."),
        ("Melt the butter, add the paste, chilli powder, salt and sugar and cook 8 minutes.", "வெண்ணெயை உருக்கி விழுது, மிளகாய்த் தூள், உப்பு, சர்க்கரை சேர்த்து 8 நிமிடம் வேகவிடவும்."),
        ("Add the paneer and a little water, simmer 5 minutes.", "பனீர், சிறிது தண்ணீர் சேர்த்து 5 நிமிடம் கொதிக்கவிடவும்."),
        ("Stir in the cream, garam masala and crushed kasuri methi. Serve with naan or roti.", "க்ரீம், கரம் மசாலா, நொறுக்கிய கசூரி மேத்தி சேர்த்து நான் அல்லது ரொட்டியுடன் பரிமாறவும்.")],
       ("Soak the paneer in warm water for 10 minutes to keep it soft.", "பனீரை 10 நிமிடம் வெந்நீரில் ஊறவைத்தால் மென்மையாக இருக்கும்."))

recipe("Chole", 4, 15, 35,
       [I("Chickpeas, soaked overnight", "கொண்டைக்கடலை", 1.5, "cup"), I("Onion, chopped", "வெங்காயம்", 2, "piece"), I("Tomato, chopped", "தக்காளி", 2, "piece"),
        I("Ginger-garlic paste", "இஞ்சி பூண்டு விழுது", 1, "tbsp"), I("Chole masala", "சோலே மசாலா", 2, "tbsp"), I("Tea bag (for colour)", "தேநீர்ப் பை", 1, "piece"),
        I("Oil", "எண்ணெய்", 3, "tbsp"), I("Coriander leaves", "கொத்தமல்லி", 1, "handful"), I("Salt", "உப்பு", None, "to_taste")],
       [("Pressure cook the chickpeas with salt and the tea bag until very soft. Drain, keeping the water.", "கொண்டைக்கடலையை உப்பு, தேநீர்ப் பையுடன் குழைய வேகவைத்து, நீரைத் தனியே வைத்து வடிக்கவும்."),
        ("Fry the onion until golden, add the ginger-garlic paste, then the tomatoes until soft.", "வெங்காயத்தைப் பொன்னிறமாக வதக்கி, இஞ்சி பூண்டு விழுது, தக்காளி சேர்த்துக் குழைய வதக்கவும்."),
        ("Add the chole masala and the chickpeas with 1 cup of the cooking water.", "சோலே மசாலா, கடலை, 1 கப் வேகவைத்த நீரைச் சேர்க்கவும்."),
        ("Simmer 15 minutes, mashing a few chickpeas to thicken. Top with coriander.", "15 நிமிடம் கொதிக்கவிட்டு, சில கடலைகளை மசித்துக் கெட்டியாக்கி கொத்தமல்லி தூவவும்.")],
       ("Serve with bhature, poori or rice.", "பதூரா, பூரி அல்லது சாதத்துடன் பரிமாறவும்."))

recipe("Dal tadka", 4, 10, 30,
       [I("Toor dal", "துவரம்பருப்பு", 1, "cup"), I("Turmeric powder", "மஞ்சள் தூள்", 0.5, "tsp"), I("Tomato, chopped", "தக்காளி", 2, "piece"), I("Onion, chopped", "வெங்காயம்", 1, "piece"),
        I("Garlic, chopped", "பூண்டு", 4, "clove"), I("Cumin seeds", "சீரகம்", 1, "tsp"), I("Dried red chilli", "வரமிளகாய்", 2, "piece"), I("Chilli powder", "மிளகாய்த் தூள்", 0.5, "tsp"),
        I("Ghee", "நெய்", 2, "tbsp"), I("Coriander leaves", "கொத்தமல்லி", 1, "handful"), I("Salt", "உப்பு", None, "to_taste")],
       [("Pressure cook the dal with turmeric and 3 cups water until soft. Whisk smooth.", "பருப்பை மஞ்சள் தூள், 3 கப் தண்ணீருடன் குழைய வேகவைத்துக் கடையவும்."),
        ("Cook the onion and tomato with a little salt until soft, then add to the dal and simmer 5 minutes.", "வெங்காயம், தக்காளியை உப்புடன் வதக்கி, பருப்பில் சேர்த்து 5 நிமிடம் கொதிக்கவிடவும்."),
        ("For the tadka, heat ghee, crackle the cumin, then fry garlic and dried chillies. Add the chilli powder off the heat.", "தாளிக்க நெய்யில் சீரகம் வெடிக்கவிட்டு பூண்டு, வரமிளகாய் வறுக்கவும். தீயை அணைத்து மிளகாய்த் தூள் சேர்க்கவும்."),
        ("Pour the tadka over the dal and top with coriander.", "தாளிப்பைப் பருப்பில் ஊற்றி கொத்தமல்லி தூவவும்.")],
       ("Serve with jeera rice or roti.", "ஜீரா சாதம் அல்லது ரொட்டியுடன் பரிமாறவும்."))

recipe("Jeera rice", 4, 10, 20,
       [I("Basmati rice", "பாஸ்மதி அரிசி", 1.5, "cup"), I("Cumin seeds", "சீரகம்", 1.5, "tsp"), I("Ghee", "நெய்", 2, "tbsp"), I("Bay leaf", "பிரியாணி இலை", 1, "piece"),
        I("Water", "தண்ணீர்", 3, "cup"), I("Salt", "உப்பு", None, "to_taste")],
       [("Wash the rice and soak for 15 minutes, then drain.", "அரிசியைக் கழுவி 15 நிமிடம் ஊறவைத்து வடிக்கவும்."),
        ("Heat ghee, crackle the cumin and bay leaf.", "நெய்யில் சீரகம், பிரியாணி இலை தாளிக்கவும்."),
        ("Add the rice, fry for a minute, then add the water and salt.", "அரிசியைச் சேர்த்து ஒரு நிமிடம் வறுத்து, தண்ணீர், உப்பு சேர்க்கவும்."),
        ("Cover and cook on low heat for 12 to 15 minutes until the water is absorbed. Rest and fluff.", "மூடி சிறு தீயில் 12 முதல் 15 நிமிடம் தண்ணீர் வற்றும் வரை வேகவிட்டு, சிறிது நேரம் வைத்து உதிர்க்கவும்.")],
       None)

recipe("Palak paneer", 4, 15, 25,
       [I("Spinach", "பசலைக் கீரை", 4, "cup"), I("Paneer, cubed", "பனீர்", 200, "g"), I("Onion, chopped", "வெங்காயம்", 1, "piece"), I("Tomato, chopped", "தக்காளி", 1, "piece"),
        I("Ginger-garlic paste", "இஞ்சி பூண்டு விழுது", 1, "tsp"), I("Green chilli", "பச்சை மிளகாய்", 2, "piece"), I("Cumin seeds", "சீரகம்", 1, "tsp"), I("Cream", "க்ரீம்", 2, "tbsp"),
        I("Oil", "எண்ணெய்", 2, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Blanch the spinach for 2 minutes, cool in cold water and blend with the green chillies.", "கீரையை 2 நிமிடம் வெந்நீரில் போட்டு குளிர்ந்த நீரில் எடுத்து, பச்சை மிளகாயுடன் அரைக்கவும்."),
        ("Heat oil, crackle the cumin, fry the onion, ginger-garlic paste and tomato until soft.", "எண்ணெயில் சீரகம் வெடிக்கவிட்டு வெங்காயம், இஞ்சி பூண்டு விழுது, தக்காளியை வதக்கவும்."),
        ("Add the spinach puree and salt and simmer 5 minutes.", "கீரை விழுது, உப்பு சேர்த்து 5 நிமிடம் கொதிக்கவிடவும்."),
        ("Add the paneer and cream, simmer 3 minutes and serve.", "பனீர், க்ரீம் சேர்த்து 3 நிமிடம் கொதிக்கவிட்டுப் பரிமாறவும்.")],
       None)

recipe("Rajma masala", 4, 15, 40,
       [I("Rajma (kidney beans), soaked overnight", "ராஜ்மா", 1, "cup"), I("Onion, chopped", "வெங்காயம்", 2, "piece"), I("Tomato puree", "தக்காளி விழுது", 1, "cup"),
        I("Ginger-garlic paste", "இஞ்சி பூண்டு விழுது", 1, "tbsp"), I("Rajma masala or garam masala", "ராஜ்மா மசாலா", 1.5, "tbsp"), I("Chilli powder", "மிளகாய்த் தூள்", 1, "tsp"),
        I("Oil or ghee", "எண்ணெய் அல்லது நெய்", 3, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Pressure cook the soaked rajma with salt until soft, about 6 whistles.", "ஊறவைத்த ராஜ்மாவை உப்புடன் சுமார் 6 விசில் வரை குழைய வேகவைக்கவும்."),
        ("Fry the onion until golden, add the ginger-garlic paste and the tomato puree and cook until the oil separates.", "வெங்காயத்தைப் பொன்னிறமாக வதக்கி இஞ்சி பூண்டு விழுது, தக்காளி விழுது சேர்த்து எண்ணெய் பிரியும் வரை வதக்கவும்."),
        ("Add the masalas, then the rajma with its water.", "மசாலாக்கள், ராஜ்மா, வேகவைத்த நீரைச் சேர்க்கவும்."),
        ("Simmer 15 to 20 minutes, mashing a few beans to thicken. Serve with rice.", "15 முதல் 20 நிமிடம் கொதிக்கவிட்டு, சில பீன்ஸை மசித்துக் கெட்டியாக்கி சாதத்துடன் பரிமாறவும்.")],
       None)

recipe("Aloo gobi", 4, 15, 25,
       [I("Potatoes, cubed", "உருளைக்கிழங்கு", 2, "piece"), I("Cauliflower florets", "காலிஃபிளவர்", 3, "cup"), I("Onion, chopped", "வெங்காயம்", 1, "piece"), I("Tomato, chopped", "தக்காளி", 1, "piece"),
        I("Cumin seeds", "சீரகம்", 1, "tsp"), I("Turmeric powder", "மஞ்சள் தூள்", 0.5, "tsp"), I("Coriander powder", "மல்லித் தூள்", 1, "tsp"), I("Chilli powder", "மிளகாய்த் தூள்", 0.5, "tsp"),
        I("Oil", "எண்ணெய்", 3, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Heat oil, crackle the cumin, fry the onion and tomato until soft.", "எண்ணெயில் சீரகம் வெடிக்கவிட்டு வெங்காயம், தக்காளியை வதக்கவும்."),
        ("Add the powders and salt, then the potatoes and cauliflower. Mix well.", "தூள்கள், உப்பு, உருளைக்கிழங்கு, காலிஃபிளவர் சேர்த்துக் கிளறவும்."),
        ("Cover and cook on low heat for 15 minutes, stirring now and then, until tender.", "மூடி சிறு தீயில் அவ்வப்போது கிளறி 15 நிமிடம் வேகவிடவும்.")],
       None)

recipe("Butter chicken", 4, 20, 35,
       [I("Chicken, boneless", "கோழி இறைச்சி", 500, "g"), I("Curd", "தயிர்", 0.5, "cup"), I("Ginger-garlic paste", "இஞ்சி பூண்டு விழுது", 1, "tbsp"), I("Kashmiri chilli powder", "காஷ்மீரி மிளகாய்த் தூள்", 1, "tbsp"),
        I("Tomato puree", "தக்காளி விழுது", 1.5, "cup"), I("Butter", "வெண்ணெய்", 3, "tbsp"), I("Cream", "க்ரீம்", 0.25, "cup"), I("Garam masala", "கரம் மசாலா", 1, "tsp"),
        I("Kasuri methi", "கசூரி மேத்தி", 1, "tsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Marinate the chicken in the curd, half the ginger-garlic paste, chilli powder and salt for at least 30 minutes.", "கோழியை தயிர், பாதி இஞ்சி பூண்டு விழுது, மிளகாய்த் தூள், உப்புடன் குறைந்தது 30 நிமிடம் ஊறவைக்கவும்."),
        ("Pan fry or grill the chicken until browned at the edges.", "கோழியை விளிம்புகள் பழுப்பாகும் வரை வறுக்கவும் அல்லது கிரில் செய்யவும்."),
        ("Melt the butter, fry the remaining paste, add the tomato puree and cook 10 minutes.", "வெண்ணெயை உருக்கி மீதி விழுதை வதக்கி, தக்காளி விழுது சேர்த்து 10 நிமிடம் வேகவிடவும்."),
        ("Add the chicken and a little water, simmer 10 minutes, then stir in the cream, garam masala and kasuri methi.", "கோழி, சிறிது தண்ணீர் சேர்த்து 10 நிமிடம் கொதிக்கவிட்டு, க்ரீம், கரம் மசாலா, கசூரி மேத்தி சேர்க்கவும்.")],
       ("Serve with naan or jeera rice.", "நான் அல்லது ஜீரா சாதத்துடன் பரிமாறவும்."))

recipe("Poha", 4, 10, 10,
       [I("Thick poha (flattened rice)", "அவல்", 2, "cup"), I("Onion, chopped", "வெங்காயம்", 1, "piece"), I("Potato, small cubes", "உருளைக்கிழங்கு", 1, "piece"), I("Peanuts", "வேர்க்கடலை", 2, "tbsp"),
        I("Mustard seeds", "கடுகு", 1, "tsp"), I("Green chilli", "பச்சை மிளகாய்", 2, "piece"), I("Turmeric powder", "மஞ்சள் தூள்", 0.5, "tsp"), I("Lemon juice", "எலுமிச்சை சாறு", 1, "tbsp"),
        I("Curry leaves", "கறிவேப்பிலை", 1, "sprig"), I("Oil", "எண்ணெய்", 2, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Rinse the poha in a sieve until soft but not mushy. Mix with salt and a pinch of turmeric.", "அவலை சல்லடையில் மென்மையாகும் வரை, குழையாமல் கழுவி, உப்பு, சிறிது மஞ்சள் தூள் கலக்கவும்."),
        ("Heat oil, fry the peanuts, splutter the mustard, then add the chillies, curry leaves, potato and onion.", "எண்ணெயில் வேர்க்கடலை வறுத்து, கடுகு, மிளகாய், கறிவேப்பிலை, உருளைக்கிழங்கு, வெங்காயம் சேர்த்து வதக்கவும்."),
        ("When the potato is cooked, add the poha and mix gently for 2 minutes.", "உருளைக்கிழங்கு வெந்ததும் அவலைச் சேர்த்து மெதுவாக 2 நிமிடம் கிளறவும்."),
        ("Finish with lemon juice and serve hot.", "எலுமிச்சை சாறு சேர்த்துச் சூடாகப் பரிமாறவும்.")],
       None)

recipe("Boondi raita", 4, 5, 0,
       [I("Curd", "தயிர்", 2, "cup"), I("Boondi", "பூந்தி", 0.5, "cup"), I("Roasted cumin powder", "வறுத்த சீரகத் தூள்", 0.5, "tsp"), I("Chilli powder", "மிளகாய்த் தூள்", 0.25, "tsp"),
        I("Salt", "உப்பு", None, "to_taste")],
       [("Whisk the curd smooth with salt and a splash of water.", "தயிரை உப்பு, சிறிது தண்ணீருடன் மிருதுவாகக் கடையவும்."),
        ("Soak the boondi in warm water for 2 minutes, squeeze and fold into the curd.", "பூந்தியை வெந்நீரில் 2 நிமிடம் ஊறவைத்துப் பிழிந்து தயிரில் கலக்கவும்."),
        ("Sprinkle with cumin and chilli powder. Serve chilled.", "சீரகத் தூள், மிளகாய்த் தூள் தூவி குளிர்ச்சியாகப் பரிமாறவும்.")],
       None)

recipe("Cucumber raita", 4, 10, 0,
       [I("Curd", "தயிர்", 2, "cup"), I("Cucumber, grated", "வெள்ளரிக்காய்", 1, "piece"), I("Roasted cumin powder", "வறுத்த சீரகத் தூள்", 0.5, "tsp"),
        I("Coriander leaves", "கொத்தமல்லி", 1, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Squeeze the water out of the grated cucumber.", "துருவிய வெள்ளரிக்காயிலிருந்து தண்ணீரைப் பிழிந்து எடுக்கவும்."),
        ("Whisk the curd with salt and fold in the cucumber and cumin.", "தயிரை உப்புடன் கடைந்து வெள்ளரிக்காய், சீரகத் தூள் சேர்க்கவும்."),
        ("Top with coriander and serve chilled.", "கொத்தமல்லி தூவி குளிர்ச்சியாகப் பரிமாறவும்.")],
       None)

# ───────────────────────────── European / Japanese ─────────────────────────────
recipe("Pasta aglio e olio", 4, 5, 15,
       [I("Spaghetti", "ஸ்பகெட்டி", 300, "g"), I("Garlic, thinly sliced", "பூண்டு", 6, "clove"), I("Olive oil", "ஆலிவ் எண்ணெய்", 5, "tbsp"), I("Chilli flakes", "மிளகாய்த் துகள்கள்", 1, "tsp"),
        I("Parsley, chopped", "பார்ஸ்லி", 2, "tbsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Boil the spaghetti in well salted water until al dente. Keep a cup of the pasta water.", "ஸ்பகெட்டியை உப்பு நீரில் சற்று கடினமாக இருக்கும்படி வேகவைத்து, ஒரு கப் வடிநீரை எடுத்து வைக்கவும்."),
        ("Warm the olive oil on low heat and gently cook the garlic until pale gold. Add the chilli flakes.", "ஆலிவ் எண்ணெயை சிறு தீயில் சூடாக்கி பூண்டை வெளிர் பொன்னிறமாக வதக்கி, மிளகாய்த் துகள்கள் சேர்க்கவும்."),
        ("Add the drained pasta and a splash of pasta water and toss until glossy.", "வடித்த பாஸ்தாவையும் சிறிது வடிநீரையும் சேர்த்து பளபளப்பாகும் வரை புரட்டவும்."),
        ("Finish with parsley and serve at once.", "பார்ஸ்லி தூவி உடனே பரிமாறவும்.")],
       None)

recipe("Grilled cheese sandwich", 2, 5, 8,
       [I("Bread slices", "ரொட்டித் துண்டுகள்", 4, "slice"), I("Cheese, sliced or grated", "சீஸ்", 100, "g"), I("Butter", "வெண்ணெய்", 2, "tbsp")],
       [("Butter one side of each slice of bread.", "ஒவ்வொரு துண்டின் ஒரு பக்கத்திலும் வெண்ணெய் தடவவும்."),
        ("Put the cheese between two slices, buttered sides out.", "இரண்டு துண்டுகளுக்கு நடுவில் சீஸை வைத்து, வெண்ணெய் தடவிய பக்கம் வெளியே இருக்கும்படி வைக்கவும்."),
        ("Cook on a pan over medium-low heat 3 minutes each side, until golden and the cheese melts.", "நடுத்தர-சிறு தீயில் இருபுறமும் 3 நிமிடம் பொன்னிறமாகவும் சீஸ் உருகும் வரையிலும் சுடவும்.")],
       None)

recipe("Vegetable soup", 4, 10, 25,
       [I("Mixed vegetables, diced (carrot, beans, peas)", "கலவை காய்கறிகள்", 3, "cup"), I("Onion, chopped", "வெங்காயம்", 1, "piece"), I("Garlic, chopped", "பூண்டு", 2, "clove"),
        I("Water or stock", "தண்ணீர் அல்லது ஸ்டாக்", 5, "cup"), I("Butter or oil", "வெண்ணெய் அல்லது எண்ணெய்", 1, "tbsp"), I("Black pepper", "மிளகுத் தூள்", 0.5, "tsp"), I("Salt", "உப்பு", None, "to_taste")],
       [("Heat the butter and cook the onion and garlic until soft.", "வெண்ணெயில் வெங்காயம், பூண்டை மென்மையாக வதக்கவும்."),
        ("Add the vegetables and cook 2 minutes, then pour in the water and add salt.", "காய்கறிகளைச் சேர்த்து 2 நிமிடம் வதக்கி, தண்ணீர், உப்பு சேர்க்கவும்."),
        ("Simmer 15 to 20 minutes until the vegetables are tender.", "காய்கறிகள் வேகும் வரை 15 முதல் 20 நிமிடம் கொதிக்கவிடவும்."),
        ("Season with pepper and serve hot.", "மிளகுத் தூள் சேர்த்துச் சூடாகப் பரிமாறவும்.")],
       None)

recipe("Miso soup", 2, 5, 10,
       [I("Water", "தண்ணீர்", 3, "cup"), I("Dashi powder", "தாஷி தூள்", 1, "tsp"), I("Miso paste", "மிசோ விழுது", 2, "tbsp"), I("Tofu, cubed", "டோஃபு", 100, "g"),
        I("Spring onion, sliced", "வெங்காயத்தாள்", 1, "piece")],
       [("Bring the water and dashi powder to a gentle simmer.", "தண்ணீர், தாஷி தூளை மெதுவாகக் கொதிக்கவிடவும்."),
        ("Add the tofu and heat through for 2 minutes.", "டோஃபுவைச் சேர்த்து 2 நிமிடம் சூடாக்கவும்."),
        ("Turn the heat off. Dissolve the miso in a ladle of the broth and stir it in. Do not boil after this.", "தீயை அணைத்து, ஒரு கரண்டி குழம்பில் மிசோவைக் கரைத்துச் சேர்க்கவும். இதன் பின் கொதிக்க விட வேண்டாம்."),
        ("Top with spring onion and serve at once.", "வெங்காயத்தாள் தூவி உடனே பரிமாறவும்.")],
       ("Miso contains soy. Check the dashi for fish.", "மிசோவில் சோயா உள்ளது. தாஷியில் மீன் உள்ளதா எனப் பார்க்கவும்."))

recipe("Chicken teriyaki", 2, 10, 15,
       [I("Chicken thighs, boneless", "கோழி இறைச்சி", 400, "g"), I("Soy sauce", "சோயா சாஸ்", 3, "tbsp"), I("Mirin or honey", "மிரின் அல்லது தேன்", 2, "tbsp"), I("Sugar", "சர்க்கரை", 1, "tbsp"),
        I("Ginger, grated", "இஞ்சி", 1, "tsp"), I("Garlic, grated", "பூண்டு", 1, "clove"), I("Oil", "எண்ணெய்", 1, "tbsp"), I("Sesame seeds", "எள்", 1, "tsp")],
       [("Mix the soy sauce, mirin, sugar, ginger and garlic for the sauce.", "சோயா சாஸ், மிரின், சர்க்கரை, இஞ்சி, பூண்டைக் கலந்து சாஸ் தயாரிக்கவும்."),
        ("Sear the chicken skin side down in hot oil until browned, then flip and cook through.", "கோழியை சூடான எண்ணெயில் தோல் பக்கம் கீழே வைத்துப் பழுப்பாக வறுத்து, திருப்பிப் போட்டு வேகவிடவும்."),
        ("Pour the sauce over and simmer, spooning it over until thick and glossy.", "சாஸை ஊற்றி, கரண்டியால் மேலே ஊற்றிக்கொண்டே கெட்டியாகவும் பளபளப்பாகவும் ஆகும் வரை கொதிக்கவிடவும்."),
        ("Slice, sprinkle with sesame and serve with rice.", "துண்டுகளாக்கி எள் தூவி சாதத்துடன் பரிமாறவும்.")],
       ("Contains soy and wheat (in soy sauce).", "சோயா, கோதுமை (சோயா சாஸில்) உள்ளது."))
