-- HomeFood · 0024: the weekly balance banner (Week tab)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- The Week tab shows the Planner and Admin a gentle, dismissible note when the week looks unbalanced: the same main dish 3 or more times,
-- fried dishes in more than 4 meals, a day with no vegetable dish, or 3 or more dine-out / order-in meals in a row. The Admin can change the
-- three numbers in Home settings; these columns hold them (the defaults are the ones above). They are covered by the same rule as the rest of
-- the home's settings: only the Admin can change them.
-- A day's vegetables are found by a tag: the dishes below get the tag "vegetable" (shared dishes only; a home can add the tag to its own dishes).

alter table public.households add column if not exists balance_same_main smallint not null default 3;
alter table public.households add column if not exists balance_fried     smallint not null default 4;
alter table public.households add column if not exists balance_out_run   smallint not null default 3;

alter table public.households drop constraint if exists households_balance_same_main_check;
alter table public.households add constraint households_balance_same_main_check check (balance_same_main between 2 and 14);
alter table public.households drop constraint if exists households_balance_fried_check;
alter table public.households add constraint households_balance_fried_check check (balance_fried between 0 and 28);
alter table public.households drop constraint if exists households_balance_out_run_check;
alter table public.households add constraint households_balance_out_run_check check (balance_out_run between 2 and 14);

update public.dishes
   set tags = array_append(tags, 'vegetable')
 where household_id is null
   and not ('vegetable' = any (tags))
   and name in (
    'Beans poriyal',
    'Cabbage poriyal',
    'Carrot poriyal',
    'Beetroot poriyal',
    'Potato roast',
    'Vendakkai fry',
    'Raw banana fry',
    'Cabbage thoran',
    'Beans usili',
    'Cluster beans poriyal',
    'Kovakkai fry',
    'Senaikizhangu fry',
    'Chepankizhangu roast',
    'Kathirikai poriyal',
    'Vazhaipoo poriyal',
    'Vazhaithandu poriyal',
    'Vazhakkai podimas',
    'Murungai keerai poriyal',
    'Pudalangai poriyal',
    'Mochai poriyal',
    'Gutti vankaya',
    'Aloo gobi',
    'Baingan bharta',
    'Bhindi masala',
    'Mixed vegetable curry',
    'Jeera aloo',
    'Keerai masiyal',
    'Cabbage kootu',
    'Pumpkin kootu',
    'Chow chow kootu',
    'Avarakkai kootu',
    'Poricha kootu',
    'Peerkangai kootu',
    'Pudalangai kootu',
    'Suraikkai kootu',
    'Keerai kootu',
    'Avial',
    'Veg kurma',
    'Veg stew',
    'Olan',
    'Erissery',
    'Thakkali kothsu',
    'Kathirikai kothsu',
    'Paagarkai pitlai',
    'Palak paneer',
    'Matar paneer',
    'Kachumber salad',
    'Cucumber pachadi',
    'Beetroot pachadi',
    'Vegetable soup'
   );
