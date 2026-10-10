-- HomeFood · 0019: who actually ate what (meal attendance)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Until now every planned meal counted as eaten by everyone marked as eating it. This adds one small table for the exceptions:
-- no row = ate a normal portion. A row records "small" or "large" portion, "skipped" or "ate elsewhere".
-- Who may write: a person for themself, or the Admin for anyone in the home (Paati and the others who never log in). Only for meals
-- up to today (Asia/Kolkata, the default time zone), only for family members (the helper is never counted), and only inside the home.
-- Reading is open to the home. Nutrition and history use it: skipped and "ate elsewhere" are left out, small/large count 75% / 125%.

create table public.meal_attendance (
  slot_id    uuid not null references public.meal_slots (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status     text not null default 'ate' check (status in ('ate', 'skipped', 'elsewhere')),
  portion    text not null default 'normal' check (portion in ('small', 'normal', 'large')),
  updated_at timestamptz not null default now(),
  primary key (slot_id, profile_id),
  check (status = 'ate' or portion = 'normal')
);

alter table public.meal_attendance enable row level security;

create or replace function public.is_family_profile(p_profile uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = p_profile and kind = 'family')
$$;

create policy attendance_read on public.meal_attendance for select to authenticated
  using (public.slot_household(slot_id) = public.my_household_id());

create policy attendance_write on public.meal_attendance for all to authenticated
  using (
    public.slot_household(slot_id) = public.my_household_id()
    and public.profile_household(profile_id) = public.slot_household(slot_id)
    and (profile_id = public.my_profile_id() or public.is_admin())
    and public.slot_date(slot_id) <= (now() at time zone 'Asia/Kolkata')::date
  )
  with check (
    public.slot_household(slot_id) = public.my_household_id()
    and public.profile_household(profile_id) = public.slot_household(slot_id)
    and (profile_id = public.my_profile_id() or public.is_admin())
    and public.slot_date(slot_id) <= (now() at time zone 'Asia/Kolkata')::date
    and public.is_family_profile(profile_id)
  );

grant select, insert, update, delete on public.meal_attendance to authenticated;
revoke execute on function public.is_family_profile(uuid) from public, anon;
grant execute on function public.is_family_profile(uuid) to authenticated;
