# Everyday dishes the catalogue was missing (migration 0046): bread, oats and cereal breakfasts, eggs done the everyday ways, fruit, noodles and fried rice,
# rolls, soups. Found by the scenario tests ("completely retest": what does a family actually plan for breakfast and snacks?).
# One line per dish, fields separated by " | ":
# name | Tamil name | cuisine (SI South Indian, NI North Indian, EU European) | meal types | course | diet | app tags | allergens | prep minutes | serving |
#   kcal | protein g | carbs g | fat g | fibre g | sugar g | sodium mg | main ingredients (comma separated, for the diet tags)
# Nutrition values are ESTIMATES for a typical home portion (same approach as migrations 0012 and 0015).
# tags used by the app: steamed, fried, spicy, sweet, caffeine.  Leave a field empty for "none".
TEXT = """
# ── Bread, cereal and oats ──
Bread toast | ரொட்டி டோஸ்ட் | EU | breakfast,snacks | both | veg | | wheat,milk | 5 | 2 slices with butter | 190 | 6 | 28 | 6 | 2 | 3 | 380 | bread, butter
Peanut butter toast | வேர்க்கடலை வெண்ணெய் டோஸ்ட் | EU | breakfast,snacks | both | veg | | wheat,peanut | 5 | 2 slices | 300 | 11 | 30 | 15 | 4 | 5 | 400 | bread, peanut butter
Jam bread | ஜாம் ரொட்டி | EU | breakfast,snacks | both | veg | sweet | wheat | 3 | 2 slices with jam | 210 | 5 | 42 | 2 | 2 | 14 | 330 | bread, jam
Bread omelette | பிரெட் ஆம்லெட் | NI | breakfast,snacks,dinner | main | egg | | egg,wheat,milk | 10 | 1 bread omelette (2 eggs, 2 slices) | 340 | 16 | 28 | 18 | 2 | 3 | 560 | egg, bread, onion, oil
Veg sandwich | வெஜ் சாண்ட்விச் | EU | breakfast,snacks | main | veg | | wheat,milk | 10 | 1 sandwich (2 slices) | 260 | 8 | 38 | 8 | 3 | 5 | 520 | bread, cucumber, tomato, butter
Egg sandwich | முட்டை சாண்ட்விச் | EU | breakfast,snacks | main | egg | | egg,wheat,milk | 10 | 1 sandwich (2 slices) | 300 | 13 | 30 | 14 | 2 | 4 | 540 | egg, bread, butter
Bread upma | பிரெட் உப்புமா | SI | breakfast,snacks | main | veg | | wheat | 15 | 1 cup | 260 | 6 | 38 | 9 | 2 | 3 | 480 | bread, onion, oil
Oats porridge | ஓட்ஸ் கஞ்சி | EU | breakfast | main | veg | | milk | 10 | 1 bowl made with milk | 220 | 9 | 34 | 6 | 4 | 9 | 90 | oats, milk
Savoury oats | காரமான ஓட்ஸ் | SI | breakfast | main | veg | | | 15 | 1 bowl | 200 | 7 | 30 | 6 | 4 | 2 | 420 | oats, onion, carrot, oil
Cornflakes with milk | கார்ன்ஃப்ளேக்ஸ் பாலுடன் | EU | breakfast | main | veg | | milk | 3 | 1 bowl | 210 | 7 | 38 | 3 | 1 | 12 | 260 | rice and corn flakes, milk
# ── Eggs the everyday ways ──
Scrambled eggs | ஸ்க்ராம்பிள்டு முட்டை | EU | breakfast,dinner | both | egg | | egg,milk | 8 | 2 eggs | 200 | 13 | 2 | 15 | 0 | 1 | 330 | egg, butter
Half-boiled egg | ஹாஃப் பாயில் முட்டை | SI | breakfast | both | egg | | egg | 6 | 1 egg | 78 | 6.3 | 0.6 | 5.3 | 0 | 0.6 | 140 | egg
Egg roll | முட்டை ரோல் | NI | snacks,dinner | main | egg | | egg,wheat | 20 | 1 roll | 350 | 14 | 38 | 16 | 2 | 3 | 620 | egg, chapati, onion
Egg fried rice | முட்டை ஃப்ரைடு ரைஸ் | SI | lunch,dinner | main | egg | | egg,soy | 25 | 1 plate | 420 | 14 | 56 | 15 | 2 | 3 | 820 | rice, egg, spring onion
# ── Fruit, milk and juice ──
Fruit bowl | பழக் கிண்ணம் | SI | breakfast,snacks | both | veg | | | 5 | 1 bowl (150 g) | 90 | 1 | 22 | 0.3 | 3 | 16 | 5 | papaya, apple, banana
Banana | வாழைப்பழம் | SI | breakfast,snacks | both | veg | | | 1 | 1 medium | 90 | 1 | 23 | 0.3 | 2.6 | 12 | 1 | banana
Milk | பால் | SI | breakfast,snacks | side | veg | | milk | 3 | 1 glass (250 ml) | 150 | 8 | 12 | 8 | 0 | 11 | 100 | milk
Fresh fruit juice | பழச்சாறு | SI | breakfast,snacks | side | veg | sweet | | 8 | 1 glass (250 ml) | 110 | 1 | 26 | 0.2 | 0.5 | 22 | 5 | orange
Lemon juice | எலுமிச்சை சாறு | SI | snacks | side | veg | | | 5 | 1 glass (250 ml) | 70 | 0 | 18 | 0 | 0 | 16 | 150 | lemon, sugar
# ── Kanji, sevai and rice ──
Rice kanji | அரிசி கஞ்சி | SI | breakfast,dinner | main | veg | | | 20 | 1 bowl | 130 | 3 | 28 | 0.5 | 1 | 0.5 | 160 | rice
Lemon sevai | எலுமிச்சை சேவை | SI | breakfast | main | veg | | peanut | 20 | 1 cup | 250 | 5 | 42 | 7 | 2 | 1 | 480 | rice noodles, lemon, peanuts, mustard
Coconut sevai | தேங்காய் சேவை | SI | breakfast | main | veg | | | 20 | 1 cup | 270 | 5 | 42 | 9 | 3 | 1 | 400 | rice noodles, coconut
Vegetable fried rice | வெஜிடபிள் ஃப்ரைடு ரைஸ் | SI | lunch,dinner | main | veg | | soy | 25 | 1 plate | 350 | 8 | 56 | 10 | 3 | 3 | 780 | rice, carrot, beans, spring onion
Chicken fried rice | சிக்கன் ஃப்ரைடு ரைஸ் | SI | lunch,dinner | main | non_veg | | soy | 30 | 1 plate | 450 | 20 | 56 | 15 | 2 | 3 | 880 | rice, chicken, spring onion
# ── Noodles, rolls, snacks and soup ──
Veg noodles | வெஜ் நூடுல்ஸ் | EU | lunch,dinner,snacks | main | veg | | wheat,soy | 20 | 1 plate | 360 | 9 | 58 | 10 | 4 | 4 | 820 | noodles, carrot, cabbage
Instant noodles | இன்ஸ்டன்ட் நூடுல்ஸ் | EU | snacks,dinner | main | veg | | wheat | 8 | 1 pack (70 g dry) | 350 | 7 | 52 | 13 | 2 | 3 | 1100 | noodles
Veg roll | வெஜ் ரோல் | NI | snacks,dinner | main | veg | | wheat | 20 | 1 roll | 300 | 8 | 42 | 12 | 3 | 3 | 540 | chapati, cabbage, carrot, onion
Sprouts salad | முளைகட்டிய பயறு சாலட் | SI | breakfast,snacks | main | veg | | | 10 | 1 bowl | 150 | 10 | 22 | 2 | 6 | 3 | 180 | green gram sprouts, cucumber, tomato, onion
Boiled corn | வேகவைத்த சோளம் | SI | snacks | main | veg | steamed | | 15 | 1 cob | 130 | 4 | 29 | 1.5 | 3 | 5 | 20 | corn
Roasted peanuts | வறுத்த வேர்க்கடலை | SI | snacks | side | veg | | peanut | 10 | 1 handful (30 g) | 170 | 7 | 5 | 14 | 3 | 1 | 5 | peanuts
Tomato soup | தக்காளி சூப் | EU | snacks,dinner | side | veg | | milk | 20 | 1 bowl | 90 | 2 | 14 | 3 | 2 | 8 | 520 | tomato, onion, butter
Sweet corn soup | ஸ்வீட் கார்ன் சூப் | EU | snacks,dinner | side | veg | | | 20 | 1 bowl | 100 | 3 | 18 | 2 | 2 | 4 | 600 | sweet corn, carrot, cornflour
Chicken soup | சிக்கன் சூப் | EU | snacks,dinner | side | non_veg | | | 30 | 1 bowl | 110 | 10 | 8 | 4 | 1 | 2 | 540 | chicken, onion, garlic
"""

# dishes that count as "a vegetable dish" for the weekly balance banner (tag 'vegetable', migration 0024)
VEGETABLE = {'Veg sandwich', 'Vegetable fried rice', 'Veg noodles', 'Veg roll', 'Sprouts salad', 'Tomato soup', 'Sweet corn soup', 'Savoury oats', 'Fruit bowl'}

CUISINES = {'SI': '00000000-0000-4000-8000-000000000002', 'NI': '00000000-0000-4000-8000-000000000003', 'EU': '00000000-0000-4000-8000-000000000004'}


def rows():
    out = []
    for line in TEXT.strip().splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        f = [x.strip() for x in line.split('|')]
        assert len(f) == 18, (len(f), line)
        name, ta, cu, meals, course, diet, tags, allergens, prep, serving, kcal, protein, carbs, fat, fibre, sugar, sodium, ing = f
        out.append(dict(name=name, ta=ta, name_ta=ta, cuisine_key=cu, cuisine_id=CUISINES[cu], meals=meals, course=course, diet=diet, tags=tags, allergens=allergens, prep=int(prep), serving=serving,
                        kcal=float(kcal), protein=float(protein), carbs=float(carbs), fat=float(fat), fibre=float(fibre), sugar=float(sugar), sodium=float(sodium),
                        ingredients=[x.strip() for x in ing.split(',') if x.strip()]))
    return out


def all_tags(r):
    """The tags of one dish: the app tags, the diet tags worked out by the same rules as migration 0040, and 'vegetable' where it applies."""
    import diet_tag_rules

    d = dict(name=r['name'], kcal=r['kcal'], protein=r['protein'], carbs=r['carbs'], fat=r['fat'], fibre=r['fibre'], sugar=r['sugar'], sodium=r['sodium'],
             tags=[t for t in r['tags'].split(',') if t], ingredients=[(i, '', '') for i in r['ingredients']])
    out = list(d['tags']) + [t for t in diet_tag_rules.rule_tags(d)[0] if t not in d['tags']]
    if r['name'] in VEGETABLE:
        out.append('vegetable')
    return diet_tag_rules.apply_fixes(r['name'], r['course'], out)[1]
