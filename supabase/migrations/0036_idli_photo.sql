-- HomeFood · 0036: a better photo for Idli
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- The first Idli photo (0014: idlis in a steamer pot, with a newspaper under it) is replaced by idlis on a banana leaf with sambar and
-- chutney. Photo: Sutapa Pal, CC BY-SA 4.0, via Wikimedia Commons (https://commons.wikimedia.org/wiki/File:Idli_Sambar-Noida-UP-SP004.jpg).
-- The file is public/dish-photos/idli-2.webp (a new name, so phones do not keep showing the old picture from their cache).
-- A home's own photo for Idli (dish_photo_overrides) still wins, so nothing a home chose is touched.

update public.dishes
set photo_path = 'static/idli-2.webp',
    photo_credit = 'Sutapa Pal, CC BY-SA 4.0, via Wikimedia Commons'
where household_id is null and name = 'Idli';
