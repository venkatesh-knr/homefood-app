-- HomeFood · shared cuisines (dishes are seeded in build step 3)
-- Adding a cuisine later is just another row here: no code change.

insert into public.cuisines (id, household_id, parent_id, name, name_ta, sort_order) values
  ('00000000-0000-4000-8000-000000000001', null, null, 'Indian', 'இந்திய', 10),
  ('00000000-0000-4000-8000-000000000002', null, '00000000-0000-4000-8000-000000000001', 'South Indian', 'தென்னிந்திய', 11),
  ('00000000-0000-4000-8000-000000000003', null, '00000000-0000-4000-8000-000000000001', 'North Indian', 'வட இந்திய', 12),
  ('00000000-0000-4000-8000-000000000004', null, null, 'European', 'ஐரோப்பிய', 20),
  ('00000000-0000-4000-8000-000000000005', null, null, 'Japanese', 'ஜப்பானிய', 30)
on conflict (id) do nothing;
