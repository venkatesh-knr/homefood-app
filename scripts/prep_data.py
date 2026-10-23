# Prep reminders for the standard recipes (migration 0034, "recipe_prep"): the things to do AHEAD of cooking.
# One line per dish:   dish | kind | lead | hours | text key
#   kind: soak, batter_ferment, set_curd, thaw, marinate, sprout, other
#   lead: night_before = do it the evening before (shown on Today's "Tonight · for tomorrow" card, and the cooks get the 7 pm reminder)
#         hours_before = do it N hours before the meal the same day (shown on Today in the morning)
#   hours: night_before: how long it needs, shown as "needs about N hours" (blank = "overnight" for a soak, nothing for others);
#          hours_before: how many hours before the meal (required)
#   text key: the wording below (English and Tamil)
# Dish names must be shared catalogue dishes that have a standard recipe (checked by scripts/gen-prep.py).
# Not seeded because no catalogue dish needs it: sprouts (kind "sprout" is ready for a home's own recipe).
# The thaw rows assume frozen meat or fish; a home with fresh meat just ignores or ticks them.
# The Tamil texts are the polite "-வும்" form used in the mockups; the family should check them (docs/tamil-review.html).

TEXTS = {
    'batter': ('Grind the batter and leave it to ferment', 'மாவு அரைத்துப் புளிக்க வைக்கவும்'),
    'buns': ('Mix the banana dough and leave it to rest overnight', 'வாழைப்பழ மாவைக் கலந்து இரவு முழுவதும் ஊற வைக்கவும்'),
    'chickpeas': ('Soak the chickpeas overnight', 'கொண்டைக்கடலையை இரவு ஊற வைக்கவும்'),
    'rajma': ('Soak the rajma overnight', 'ராஜ்மாவை இரவு ஊற வைக்கவும்'),
    'makhani': ('Soak the whole urad and rajma overnight', 'முழு உளுந்தையும் ராஜ்மாவையும் இரவு ஊற வைக்கவும்'),
    'greengram': ('Soak the green gram overnight', 'பச்சைப்பயறை இரவு ஊற வைக்கவும்'),
    'vada': ('Soak the dal for the vadas', 'வடைக்குப் பருப்பை ஊற வைக்கவும்'),
    'chanadal': ('Soak the chana dal', 'கடலைப்பருப்பை ஊற வைக்கவும்'),
    'adai': ('Soak the rice and dals', 'அரிசியையும் பருப்புகளையும் ஊற வைக்கவும்'),
    'peanuts': ('Soak the peanuts', 'வேர்க்கடலையை ஊற வைக்கவும்'),
    'curd': ('Set the curd', 'தயிர் உறை ஊற்றவும்'),
    'thaw_chicken': ('Move the chicken from the freezer to the fridge', 'கோழிக்கறியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
    'thaw_mutton': ('Move the mutton from the freezer to the fridge', 'ஆட்டிறைச்சியை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
    'thaw_fish': ('Move the fish from the freezer to the fridge', 'மீனை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
    'thaw_prawns': ('Move the prawns from the freezer to the fridge', 'இறாலை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
    'thaw_crab': ('Move the crab from the freezer to the fridge', 'நண்டை ஃப்ரீசரிலிருந்து எடுத்து ஃப்ரிட்ஜில் வைக்கவும்'),
    'marinate_chicken': ('Marinate the chicken with curd and spices', 'கோழிக்கறியைத் தயிர், மசாலாவுடன் ஊற வைக்கவும்'),
    'marinate_mutton': ('Marinate the mutton with curd and spices', 'ஆட்டிறைச்சியைத் தயிர், மசாலாவுடன் ஊற வைக்கவும்'),
    'marinate_paneer': ('Marinate the paneer', 'பனீரை மசாலாவில் ஊற வைக்கவும்'),
    'pazhaya': ('Soak the cooked rice in water overnight', 'சோற்றை இரவு முழுவதும் தண்ணீரில் ஊற வைக்கவும்'),
    'kambu': ('Mix the pearl millet flour with water and leave it to ferment', 'கம்பு மாவைத் தண்ணீரில் கலந்து புளிக்க வைக்கவும்'),
}

TEXT = """
# ── Batters: grind and ferment the evening before ──
Idli | batter_ferment | night_before | 8 | batter
Dosa | batter_ferment | night_before | 8 | batter
Masala dosa | batter_ferment | night_before | 8 | batter
Egg dosa | batter_ferment | night_before | 8 | batter
Set dosa | batter_ferment | night_before | 8 | batter
Kal dosai | batter_ferment | night_before | 8 | batter
Uttapam | batter_ferment | night_before | 8 | batter
Appam | batter_ferment | night_before | 8 | batter
Kuzhi paniyaram | batter_ferment | night_before | 8 | batter
Podi idli | batter_ferment | night_before | 8 | batter
Mini idli sambar | batter_ferment | night_before | 8 | batter
Mangalore buns | batter_ferment | night_before | 8 | buns
Kambu koozh | batter_ferment | night_before | 8 | kambu
Pazhaya sadam | other | night_before | | pazhaya
# ── Soaking pulses ──
Chole | soak | night_before | | chickpeas
Chole bhature | soak | night_before | | chickpeas
Kadala curry | soak | night_before | | chickpeas
Sundal | soak | night_before | | chickpeas
Rajma masala | soak | night_before | | rajma
Dal makhani | soak | night_before | | makhani
Pesarattu | soak | night_before | | greengram
Medu vada | soak | hours_before | 3 | vada
Sambar vada | soak | hours_before | 3 | vada
Thayir vada | soak | hours_before | 3 | vada
Paruppu vadai | soak | hours_before | 2 | chanadal
Adai | soak | hours_before | 4 | adai
Verkadalai sundal | soak | hours_before | 4 | peanuts
# ── Setting curd ──
Curd | set_curd | night_before | 8 | curd
Curd rice | set_curd | night_before | 8 | curd
Cucumber raita | set_curd | night_before | 8 | curd
Boondi raita | set_curd | night_before | 8 | curd
# ── Thawing frozen meat and fish ──
Chicken curry | thaw | night_before | | thaw_chicken
Chicken fry | thaw | night_before | | thaw_chicken
Chicken 65 | thaw | night_before | | thaw_chicken
Chicken chettinad | thaw | night_before | | thaw_chicken
Chicken stew | thaw | night_before | | thaw_chicken
Dhaba chicken curry | thaw | night_before | | thaw_chicken
Pepper chicken | thaw | night_before | | thaw_chicken
Roast chicken | thaw | night_before | | thaw_chicken
Chicken lollipop | thaw | night_before | | thaw_chicken
Chicken teriyaki | thaw | night_before | | thaw_chicken
Nattu kozhi kuzhambu | thaw | night_before | | thaw_chicken
Mutton chukka | thaw | night_before | | thaw_mutton
Mutton keema | thaw | night_before | | thaw_mutton
Mutton kuzhambu | thaw | night_before | | thaw_mutton
Mutton rogan josh | thaw | night_before | | thaw_mutton
Mutton kola urundai | thaw | night_before | | thaw_mutton
Fish curry | thaw | night_before | | thaw_fish
Fish fry | thaw | night_before | | thaw_fish
Fish moilee | thaw | night_before | | thaw_fish
Nethili fry | thaw | night_before | | thaw_fish
Fish thokku | thaw | night_before | | thaw_fish
Prawn masala | thaw | night_before | | thaw_prawns
Crab masala | thaw | night_before | | thaw_crab
# ── Marinating ──
Chicken biryani | marinate | night_before | 8 | marinate_chicken
Dindigul biryani | marinate | night_before | 8 | marinate_chicken
Mutton biryani | marinate | night_before | 8 | marinate_mutton
Tandoori chicken | marinate | night_before | 8 | marinate_chicken
Chicken tikka | marinate | night_before | 8 | marinate_chicken
Butter chicken | marinate | hours_before | 4 | marinate_chicken
Paneer tikka | marinate | hours_before | 2 | marinate_paneer
"""


def rows():
    out = []
    for line in TEXT.strip().splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        dish, kind, lead, hours, key = [x.strip() for x in line.split('|')]
        out.append({'dish': dish, 'kind': kind, 'lead': lead, 'hours': int(hours) if hours else None, 'key': key})
    return out
