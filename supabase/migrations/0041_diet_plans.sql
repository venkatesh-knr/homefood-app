-- HomeFood · 0041: diet plans
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run (after 0040). Safe to run twice.
-- A diet plan is a set of foods to avoid and to focus on: low-carb / keto, paleo, Mediterranean, high-protein, vegan, Jain, low-salt (DASH-style),
-- senior-friendly. The foods themselves (and which dishes fit) live in the app, matched on the diet tags of 0040. Here a plan is only a person
-- FOLLOWING it. One person, a couple or a whole group simply have a row each; everyone else keeps the family meal. The app stores the plan someone
-- chose and never a diagnosis; every plan screen says "General guidance, not medical advice".
--   * Everyone in the home can READ who follows what (the Planner and the cooks need it).
--   * A person starts or stops their own; the Admin does it for a family member nobody has logged in as yet (same rule as everyday preferences).
--   * The restrictive plans (low-carb / keto, paleo) cannot be set for anyone under 18, nor for someone whose birth year is not known.
--   * Deleting an account removes the person's plans (the trigger of 0039 is extended).

create table if not exists public.diet_plan_follows (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  plan       text not null check (plan in ('low_carb', 'paleo', 'mediterranean', 'high_protein', 'vegan', 'jain', 'low_salt', 'senior')),
  since      date not null default current_date,
  set_by     uuid references public.profiles (id) on delete set null,
  primary key (profile_id, plan)
);

create or replace function public.guard_diet_plan_follow() returns trigger
language plpgsql security definer set search_path = '' as $$
declare born smallint;
begin
  if tg_op = 'INSERT' then
    new.set_by := public.my_profile_id();
    if new.plan in ('low_carb', 'paleo') then
      select birth_year into born from public.profiles where id = new.profile_id;
      if born is null then raise exception 'Add a birth year first: this plan is only for adults'; end if;
      if extract(year from now())::int - born < 18 then raise exception 'This plan cannot be set for anyone under 18'; end if;
    end if;
  elsif new.profile_id <> old.profile_id or new.plan <> old.plan then
    raise exception 'A plan cannot be moved to another person';
  end if;
  return new;
end $$;
drop trigger if exists diet_plan_follows_guard on public.diet_plan_follows;
create trigger diet_plan_follows_guard before insert or update on public.diet_plan_follows
  for each row execute function public.guard_diet_plan_follow();

alter table public.diet_plan_follows enable row level security;
drop policy if exists plan_follows_read on public.diet_plan_follows;
create policy plan_follows_read on public.diet_plan_follows for select to authenticated
  using (public.profile_household(profile_id) = public.my_household_id());
drop policy if exists plan_follows_write on public.diet_plan_follows;
create policy plan_follows_write on public.diet_plan_follows for all to authenticated
  using (public.can_set_diet_for(profile_id)) with check (public.can_set_diet_for(profile_id));
grant select, insert, update, delete on public.diet_plan_follows to authenticated;

-- ── a deleted account takes the person's plans with it (extends 0039) ──
create or replace function public.clear_diet_rows() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.profile_preferences where profile_id = new.id;
  delete from public.diet_plan_follows where profile_id = new.id;
  return new;
end $$;
