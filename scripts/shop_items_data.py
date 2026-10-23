# The shared list of common shopping items (migration 0033, "common_shop_items"). One line per item, fields separated by " | ":
#   name | Tamil name | aliases (separated by ";", used to match recipe ingredients and typed words) | browse tab | usual amount | unit |
#   flags | pack sizes | grams per cup | grams per piece
# browse tab: vegetables, fruits, groceries, dairy_eggs, other (the section is worked out from it: vegetables and fruits -> veg_fruit).
# unit: g, kg, ml, L, pcs, bunch, pack (never cups or spoons).
# flags: P = perishable (vegetables, fruit, greens, milk, curd, paneer, eggs, meat, fish, bread: worked out exactly from recipes, rounded up
#        to 50 g / 100 ml / whole pieces); S = pantry staple (salt, oil, spices, curry leaves...: shown unticked under "Usually at home");
#        - = neither. Anything that is not P is not calculated exactly: the app suggests the smallest usual pack that covers the need.
# pack sizes: this item's own packs in grams or ml, e.g. "1000,5000" for oil (blank = the standard packs: 100, 200, 250, 500 g, 1, 2, 5 kg
#        or 200, 500 ml, 1, 2, 5 L).
# grams per cup: how much a cup of the item weighs (only for items bought by weight; liquids are 240 ml a cup). Used only inside the app
#        to turn a recipe's cups and spoons into g or ml; the list itself never shows them.
# grams per piece: what one piece weighs (an onion, a tomato...), to turn a recipe's pieces into grams, or the other way round for
#        items bought by the piece (coconut, lemon).
# The Tamil names are everyday market words; the family should check them (docs/tamil-review.html).

import re

TABS = ['vegetables', 'fruits', 'groceries', 'dairy_eggs', 'other']
UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'bunch', 'pack']
SECTION_OF_TAB = {'vegetables': 'veg_fruit', 'fruits': 'veg_fruit', 'groceries': 'grocery', 'dairy_eggs': 'dairy_eggs', 'other': 'other'}

# Recipe ingredient lines that need nothing from the shop (made at home, or just water).
IGNORED = ['water', 'cold water', 'hot water', 'warm water', 'ice cube', 'ice', 'cooked rice', 'cooled cooked rice', 'water for grinding', 'water for soaking']

TEXT = """
# ── Vegetables ──
Tomato | தக்காளி | tomatoes | vegetables | 1 | kg | P | | | 100
Onion | வெங்காயம் | big onion;onions;red onion | vegetables | 1 | kg | P | | | 120
Small onion | சின்ன வெங்காயம் | shallots;shallot;sambar onion | vegetables | 500 | g | P | | | 15
Potato | உருளைக்கிழங்கு | potatoes;aloo | vegetables | 1 | kg | P | | | 150
Carrot | கேரட் | carrots | vegetables | 500 | g | P | | | 80
Beans | பீன்ஸ் | french beans;green beans | vegetables | 250 | g | P | | | 8
Brinjal | கத்தரிக்காய் | eggplant;aubergine;baingan | vegetables | 500 | g | P | | | 100
Lady's finger | வெண்டைக்காய் | okra;ladies finger;lady finger;bhindi | vegetables | 250 | g | P | | | 15
Drumstick | முருங்கைக்காய் | drumsticks | vegetables | 2 | pcs | P | | |
Cabbage | முட்டைக்கோஸ் | | vegetables | 1 | pcs | P | | | 800
Cauliflower | காலிஃபிளவர் | gobi;cauliflower florets | vegetables | 1 | pcs | P | | | 500
Coriander leaves | கொத்தமல்லி | coriander;cilantro;fresh coriander;coriander leaf | vegetables | 1 | bunch | P | | |
Mint leaves | புதினா | mint;pudina;mint leaf | vegetables | 1 | bunch | P | | |
Curry leaves | கறிவேப்பிலை | curry leaf | vegetables | 1 | bunch | PS | | |
Green chilli | பச்சை மிளகாய் | green chillies;green chili;fresh chilli;chilli;chillies | vegetables | 100 | g | P | | | 5
Ginger | இஞ்சி | fresh ginger;grated ginger;crushed ginger | vegetables | 100 | g | PS | | |
Garlic | பூண்டு | garlic pods;garlic cloves | vegetables | 100 | g | PS | | | 4
Pumpkin | பூசணிக்காய் | yellow pumpkin | vegetables | 500 | g | P | | |
Ash gourd | வெண்பூசணி | winter melon;white pumpkin | vegetables | 500 | g | P | | |
Bottle gourd | சுரைக்காய் | lauki;dudhi | vegetables | 500 | g | P | | |
Ridge gourd | பீர்க்கங்காய் | turai | vegetables | 500 | g | P | | |
Snake gourd | புடலங்காய் | | vegetables | 500 | g | P | | |
Bitter gourd | பாகற்காய் | karela;bitter melon | vegetables | 250 | g | P | | |
Cluster beans | கொத்தவரங்காய் | gawar | vegetables | 250 | g | P | | |
Ivy gourd | கோவைக்காய் | tindora;kovakkai | vegetables | 250 | g | P | | |
Raw banana | வாழைக்காய் | plantain;raw plantain | vegetables | 2 | pcs | P | | |
Banana flower | வாழைப்பூ | banana blossom | vegetables | 1 | pcs | P | | |
Banana stem | வாழைத்தண்டு | plantain stem | vegetables | 1 | pcs | P | | |
Yam | சேனைக்கிழங்கு | elephant foot yam;suran | vegetables | 500 | g | P | | |
Colocasia | சேப்பங்கிழங்கு | taro;arbi;taro root | vegetables | 500 | g | P | | |
Sweet potato | சர்க்கரைவள்ளிக்கிழங்கு | | vegetables | 500 | g | P | | |
Tapioca | மரவள்ளிக்கிழங்கு | cassava | vegetables | 500 | g | P | | |
Beetroot | பீட்ரூட் | beet | vegetables | 500 | g | P | | |
Radish | முள்ளங்கி | mooli;white radish | vegetables | 500 | g | P | | |
Capsicum | குடைமிளகாய் | bell pepper;green capsicum | vegetables | 250 | g | P | | |
Cucumber | வெள்ளரிக்காய் | | vegetables | 500 | g | P | | |
Green peas | பச்சைப் பட்டாணி | peas;fresh peas;frozen peas | vegetables | 250 | g | P | | |
Spinach | பசலைக்கீரை | palak | vegetables | 1 | bunch | P | | |
Greens | கீரை | keerai;amaranth leaves;murungai keerai;fenugreek leaves;methi leaves;spinach leaves | vegetables | 1 | bunch | P | | |
Lemon | எலுமிச்சை | lime;lemon juice;lime juice | vegetables | 4 | pcs | P | | | 45
Raw mango | மாங்காய் | green mango | vegetables | 2 | pcs | P | | | 250
Coconut | தேங்காய் | grated coconut;fresh coconut;coconut scrapings;coconut pieces | vegetables | 2 | pcs | P | | 90 | 180
Spring onion | வெங்காயத்தாள் | scallion;green onion | vegetables | 1 | bunch | P | | |
Mushroom | காளான் | button mushroom | vegetables | 200 | g | P | | |
Corn | சோளம் | sweet corn;corn kernels | vegetables | 2 | pcs | P | | |
Mixed vegetables | கலவை காய்கறிகள் | mixed vegetable;mixed veg;vegetables;vegetable | vegetables | 500 | g | P | | |
# ── Fruits ──
Banana | வாழைப்பழம் | ripe banana | fruits | 12 | pcs | P | | | 100
Apple | ஆப்பிள் | | fruits | 1 | kg | P | | | 150
Orange | ஆரஞ்சு | | fruits | 1 | kg | P | | |
Sweet lime | மோசம்பி | mosambi | fruits | 1 | kg | P | | |
Papaya | பப்பாளி | | fruits | 1 | pcs | P | | |
Guava | கொய்யா | | fruits | 500 | g | P | | |
Grapes | திராட்சை | | fruits | 500 | g | P | | |
Mango | மாம்பழம் | ripe mango | fruits | 1 | kg | P | | | 250
Pomegranate | மாதுளை | | fruits | 1 | kg | P | | |
Watermelon | தர்பூசணி | | fruits | 1 | pcs | P | | |
Pineapple | அன்னாசி | | fruits | 1 | pcs | P | | |
Sapota | சப்போட்டா | chikoo | fruits | 500 | g | P | | |
# ── Groceries: rice, flours, dals ──
Rice | அரிசி | raw rice;ponni rice;white rice;samba rice | groceries | 5 | kg | - | | 190 |
Idli rice | இட்லி அரிசி | | groceries | 1 | kg | - | | 190 |
Parboiled rice | புழுங்கல் அரிசி | boiled rice;usna rice | groceries | 5 | kg | - | | 190 |
Basmati rice | பாசுமதி அரிசி | basmati | groceries | 1 | kg | - | | 190 |
Toor dal | துவரம் பருப்பு | tur dal;arhar dal;toor dhal;pigeon pea | groceries | 1 | kg | - | | 200 |
Urad dal | உளுத்தம் பருப்பு | urad;ulundu;urad dhal;black gram;whole urad dal;black urad dal;whole black urad dal;udad dal;உளுந்து | groceries | 500 | g | - | | 200 |
Moong dal | பாசிப்பருப்பு | mung dal;green gram dal;yellow moong dal;moong | groceries | 500 | g | - | | 200 |
Chana dal | கடலைப்பருப்பு | bengal gram dal;split chickpeas | groceries | 500 | g | - | | 200 |
Masoor dal | மசூர் பருப்பு | red lentils;masoor | groceries | 500 | g | - | | 200 |
Green gram | பச்சைப்பயறு | whole moong;green moong;whole green gram | groceries | 500 | g | - | | 200 |
Chickpeas | கொண்டைக்கடலை | chana;kabuli chana;white chickpeas;channa | groceries | 500 | g | - | | 190 |
Black chickpeas | கருப்பு கொண்டைக்கடலை | kala chana;black chana | groceries | 500 | g | - | | 190 |
Rajma | ராஜ்மா | kidney beans | groceries | 500 | g | - | | 190 |
Dried peas | காய்ந்த பட்டாணி | dry peas;white peas;dried green peas;vatana | groceries | 500 | g | - | | 190 |
Horse gram | கொள்ளு | kollu | groceries | 500 | g | - | | 190 |
Cowpeas | தட்டைப்பயறு | lobia;black eyed peas | groceries | 500 | g | - | | 190 |
Wheat flour | கோதுமை மாவு | atta;whole wheat flour;wheat atta;wheat | groceries | 1 | kg | - | | 120 |
Maida | மைதா | refined flour;all purpose flour;plain flour | groceries | 500 | g | - | | 125 |
Rice flour | அரிசி மாவு | | groceries | 500 | g | - | | 150 |
Gram flour | கடலை மாவு | besan;chickpea flour | groceries | 500 | g | - | | 100 |
Rava | ரவை | semolina;sooji;suji;bombay rava;rava semolina | groceries | 500 | g | - | | 170 |
Vermicelli | சேமியா | semiya | groceries | 200 | g | - | | 90 |
Poha | அவல் | flattened rice;aval;thick poha;thin poha | groceries | 500 | g | - | | 100 |
Ragi flour | கேழ்வரகு மாவு | ragi;finger millet flour | groceries | 500 | g | - | | 130 |
Sago | ஜவ்வரிசி | sabudana;javvarisi | groceries | 250 | g | - | | 160 |
Corn flour | சோள மாவு | cornflour;corn starch;cornstarch | groceries | 200 | g | - | | 120 |
Fried gram | பொட்டுக்கடலை | pottukadalai;roasted gram;roasted chana | groceries | 200 | g | - | | 160 |
Puffed rice | பொரி | murmura;pori | groceries | 1 | pack | - | | |
Bread crumbs | ரொட்டித் தூள் | breadcrumbs | groceries | 200 | g | - | | 110 |
Noodles | நூடுல்ஸ் | | groceries | 1 | pack | - | | |
Pasta | பாஸ்தா | | groceries | 1 | pack | - | | |
Dosa batter | தோசை மாவு | idli batter;idli dosa batter;batter | groceries | 1 | pack | - | | |
# ── Groceries: sugar, oil, spices ──
Sugar | சர்க்கரை | white sugar;powdered sugar;castor sugar | groceries | 1 | kg | - | | 200 |
Jaggery | வெல்லம் | jaggery powder;grated jaggery;powdered jaggery | groceries | 500 | g | - | | 150 |
Salt | உப்பு | rock salt;sea salt | groceries | 1 | kg | S | |
Oil | எண்ணெய் | cooking oil;vegetable oil;sunflower oil;refined oil;oil for frying;groundnut oil | groceries | 1 | L | S | 1000,5000 |
Sesame oil | நல்லெண்ணெய் | gingelly oil;til oil | groceries | 500 | ml | S | 500,1000 |
Coconut oil | தேங்காய் எண்ணெய் | | groceries | 500 | ml | S | 500,1000 |
Tamarind | புளி | tamarind paste;tamarind pulp | groceries | 250 | g | S | |
Mustard seeds | கடுகு | mustard | groceries | 100 | g | S | |
Cumin seeds | சீரகம் | cumin;jeera;cumin powder | groceries | 100 | g | S | |
Fennel seeds | சோம்பு | saunf;fennel | groceries | 100 | g | S | |
Fenugreek seeds | வெந்தயம் | methi seeds;fenugreek;fenugreek powder | groceries | 100 | g | S | |
Coriander seeds | மல்லி | dhania;coriander seed | groceries | 200 | g | S | |
Black pepper | மிளகு | pepper;pepper powder;black pepper powder;peppercorns | groceries | 100 | g | S | |
Dried red chilli | காய்ந்த மிளகாய் | red chilli;whole red chilli;dry red chilli;dried chilli;dry chilli | groceries | 100 | g | S | |
Turmeric powder | மஞ்சள் தூள் | turmeric;haldi | groceries | 100 | g | S | |
Chilli powder | மிளகாய்த் தூள் | red chilli powder;chili powder | groceries | 100 | g | S | |
Coriander powder | மல்லித் தூள் | dhania powder | groceries | 100 | g | S | |
Kashmiri chilli powder | காஷ்மீரி மிளகாய்த் தூள் | kashmiri chili powder | groceries | 100 | g | S | |
Sambar powder | சாம்பார் பொடி | sambar masala | groceries | 100 | g | S | |
Rasam powder | ரசம் பொடி | | groceries | 100 | g | S | |
Garam masala | கரம் மசாலா | | groceries | 100 | g | S | |
Biryani masala | பிரியாணி மசாலா | | groceries | 100 | g | S | |
Asafoetida | பெருங்காயம் | hing;asafetida | groceries | 50 | g | S | |
Cardamom | ஏலக்காய் | cardamom powder;elaichi;cardamom pods | groceries | 50 | g | S | |
Cloves | கிராம்பு | clove | groceries | 50 | g | S | |
Cinnamon | பட்டை | cinnamon stick;dalchini | groceries | 50 | g | S | |
Whole spices | மசாலாப் பொருட்கள் | whole masala;whole spice | groceries | 100 | g | S | |
Ginger-garlic paste | இஞ்சி பூண்டு விழுது | ginger garlic paste | groceries | 200 | g | S | |
Sesame seeds | எள் | white sesame seeds;black sesame seeds;til | groceries | 100 | g | S | |
Baking soda | சமையல் சோடா | soda bicarbonate;cooking soda | groceries | 100 | g | S | |
Baking powder | பேக்கிங் பவுடர் | | groceries | 100 | g | S | |
# ── Groceries: nuts, dried fruit, ready items ──
Cashew nuts | முந்திரி | cashews;cashew;cashew nut | groceries | 100 | g | - | | |
Almonds | பாதாம் | almond | groceries | 100 | g | - | | |
Raisins | உலர் திராட்சை | dry grapes;kismis | groceries | 100 | g | - | | |
Peanuts | வேர்க்கடலை | groundnuts;roasted peanuts;peanut | groceries | 500 | g | - | | 150 |
Dates | பேரீச்சை | | groceries | 250 | g | - | | |
Coconut milk | தேங்காய்ப் பால் | thick coconut milk;thin coconut milk;coconut milk powder | groceries | 1 | pack | - | | |
Soy sauce | சோயா சாஸ் | | groceries | 200 | ml | - | | |
Vinegar | வினிகர் | | groceries | 200 | ml | - | | |
Papad | அப்பளம் | appalam;papadam | groceries | 1 | pack | - | | |
Pickle | ஊறுகாய் | mango pickle;lemon pickle | groceries | 1 | pack | - | | |
# ── Dairy & eggs ──
Milk | பால் | full-fat milk;toned milk;full fat milk;cow milk | dairy_eggs | 1 | L | P | | |
Curd | தயிர் | yogurt;yoghurt;thick curd;sour curd;dahi | dairy_eggs | 500 | g | P | | 245 |
Buttermilk | மோர் | chaas | dairy_eggs | 500 | ml | P | | |
Paneer | பனீர் | cottage cheese | dairy_eggs | 200 | g | P | | |
Butter | வெண்ணெய் | amul butter | dairy_eggs | 100 | g | - | 100,200,500 | 227 |
Ghee | நெய் | | dairy_eggs | 200 | ml | - | 200,500,1000 | |
Cheese | சீஸ் | cheese slice;grated cheese;mozzarella;mozzarella cheese | dairy_eggs | 200 | g | - | | 110 |
Cream | கிரீம் | fresh cream;malai | dairy_eggs | 200 | ml | - | 200,500 | |
Eggs | முட்டை | egg | dairy_eggs | 12 | pcs | P | | |
# ── Other: meat and fish, bread, household ──
Chicken | கோழிக்கறி | chicken pieces;boneless chicken | other | 500 | g | P | | |
Mutton | ஆட்டிறைச்சி | lamb;goat meat;mutton pieces;mutton mince;mince | other | 500 | g | P | | |
Fish | மீன் | fish fillet;fish pieces;fish slices | other | 500 | g | P | | |
Prawns | இறால் | shrimp | other | 250 | g | P | | |
Bread | ரொட்டி | bread slices;sandwich bread;brown bread | other | 1 | pack | P | | |
Tea powder | தேயிலைத் தூள் | tea leaves;tea;chai powder | other | 250 | g | - | | |
Coffee powder | காபி தூள் | coffee;filter coffee powder | other | 200 | g | - | | |
Biscuits | பிஸ்கட் | | other | 2 | pack | - | | |
Dish soap | பாத்திரம் கழுவும் சோப் | dishwash;dish wash | other | 1 | pack | - | | |
Washing powder | சலவைத் தூள் | detergent | other | 1 | pack | - | | |
"""


def rows():
    out = []
    for line in TEXT.strip().splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        p = [x.strip() for x in re.split(r'\s*\|\s*', line)]
        # trailing blank fields ("... | | | ") may be missing: pad back to 10 fields
        while len(p) < 10:
            p.append('')
        assert len(p) == 10, (line, len(p))
        name, ta, aliases, tab, usual, unit, flags, packs, cup, piece = p
        out.append({
            'name_en': name, 'name_ta': ta, 'aliases': [a.strip() for a in aliases.split(';') if a.strip()],
            'tab': tab, 'section': SECTION_OF_TAB[tab], 'usual': float(usual), 'unit': unit,
            'perishable': 'P' in flags, 'staple': 'S' in flags,
            'packs': [float(x) for x in packs.split(',')] if packs else None,
            'g_per_cup': float(cup) if cup else None, 'g_per_piece': float(piece) if piece else None,
        })
    return out
