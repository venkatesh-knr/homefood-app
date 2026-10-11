-- HomeFood · 0027: a cuisine that dishes still use cannot be deleted
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- An Admin can rename or delete the cuisines their own home added (migration 0001 already allows it; the shared cuisines are read-only).
-- Until now deleting one quietly cleared the cuisine of every dish that used it (the column is set to empty). That would silently
-- change the family's dishes, so deleting is now refused while any dish still uses the cuisine. The app checks first and explains
-- in plain words; this rule is the safety net underneath it.

create or replace function public.guard_cuisine_in_use() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.dishes d where d.cuisine_id = old.id) then
    raise exception 'This cuisine still has dishes. Change or remove them first.' using errcode = 'P0001';
  end if;
  return old;
end $$;

drop trigger if exists cuisine_in_use_guard on public.cuisines;
create trigger cuisine_in_use_guard before delete on public.cuisines
  for each row execute function public.guard_cuisine_in_use();
