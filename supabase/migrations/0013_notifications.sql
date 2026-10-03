-- HomeFood · 0013: in-app notifications (the bell)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Notifications are written by database triggers, so they appear whichever device made the change, and nobody can
-- create or fake one from the app: signed-in users can only read their own, mark them read, or delete them.
-- Events (see docs/spec.md, Notifications): week published · a published meal changed · you were set as a cook ·
-- a new suggestion (Admins + the Planner) · your suggestion accepted / declined · a new comment · the Planner kept a
-- dish despite disagreement (to those who disagreed) · a Planner turn was assigned to you.
-- Repeats of the same event for the same person and meal within 10 minutes (while still unread) are merged into one,
-- so a Planner editing a meal several times doesn't flood everyone. Only people with a login get notifications.
-- Not built yet: phone push, per-person muting, allergen alerts and "your turn starts tomorrow" reminders.

create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  profile_id   uuid not null references public.profiles (id) on delete cascade,   -- who it is for
  type         text not null check (type in ('week_published', 'slot_changed', 'cook_assigned', 'suggestion_new', 'suggestion_accepted',
                                             'suggestion_declined', 'comment_new', 'kept_despite', 'turn_assigned')),
  slot_id      uuid references public.meal_slots (id) on delete cascade,
  actor_id     uuid references public.profiles (id) on delete set null,           -- who did it
  data         jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  read_at      timestamptz
);
create index notifications_profile_idx on public.notifications (profile_id, created_at desc);

alter table public.notifications enable row level security;
create policy notifications_read on public.notifications for select to authenticated using (profile_id = public.my_profile_id());
create policy notifications_update on public.notifications for update to authenticated
  using (profile_id = public.my_profile_id()) with check (profile_id = public.my_profile_id());
create policy notifications_delete on public.notifications for delete to authenticated using (profile_id = public.my_profile_id());

grant select, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- ── Writing notifications (triggers only; not callable from the app) ──
create or replace function public.slot_info(p_slot uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'date', s.date, 'meal', s.meal, 'source', s.source, 'place', s.place_name,
    'dish_en', coalesce((select n.name from public.dish_names n where n.dish_id = s.main_dish_id and n.language = 'en'),
                        (select d.name from public.dishes d where d.id = s.main_dish_id)),
    'dish_ta', (select n.name from public.dish_names n where n.dish_id = s.main_dish_id and n.language = 'ta'))
  from public.meal_slots s where s.id = p_slot
$$;

create or replace function public.notify(p_profile uuid, p_type text, p_slot uuid, p_data jsonb default '{}')
returns void language plpgsql security definer set search_path = '' as $$
declare actor uuid := public.my_profile_id(); hh uuid;
begin
  if p_profile is null or p_profile = actor then return; end if;
  select household_id into hh from public.profiles where id = p_profile and user_id is not null;
  if hh is null then return; end if;
  update public.notifications set created_at = now(), data = p_data, actor_id = actor
   where profile_id = p_profile and type = p_type and slot_id is not distinct from p_slot
     and read_at is null and created_at > now() - interval '10 minutes';
  if found then return; end if;
  insert into public.notifications (household_id, profile_id, type, slot_id, actor_id, data)
  values (hh, p_profile, p_type, p_slot, actor, coalesce(p_data, '{}'));
end $$;

create or replace function public.notify_home(p_household uuid, p_type text, p_slot uuid, p_data jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  for r in select id from public.profiles where household_id = p_household and user_id is not null loop
    perform public.notify(r.id, p_type, p_slot, p_data);
  end loop;
end $$;

-- Admins plus whoever holds the Planner turn for that day.
create or replace function public.notify_planners(p_household uuid, p_date date, p_type text, p_slot uuid, p_data jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  for r in
    select p.id from public.profiles p
    where p.household_id = p_household and p.user_id is not null
      and (p.role = 'admin' or exists (select 1 from public.planner_turns t where t.profile_id = p.id and t.status = 'approved'
                                       and p_date between t.start_date and t.end_date))
  loop
    perform public.notify(r.id, p_type, p_slot, p_data);
  end loop;
end $$;

-- ── Triggers ──
create or replace function public.trg_week_published() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'published' and old.status is distinct from 'published' then
    perform public.notify_home(new.household_id, 'week_published', null, jsonb_build_object('week_start', new.week_start));
  end if;
  return new;
end $$;
create trigger week_plans_notify after update of status on public.week_plans
  for each row execute function public.trg_week_published();

create or replace function public.trg_slot_notify() returns trigger
language plpgsql security definer set search_path = '' as $$
declare published boolean; r record;
begin
  select (status = 'published') into published from public.week_plans where id = new.week_plan_id;
  if tg_op = 'INSERT' then
    if published then perform public.notify_home(new.household_id, 'slot_changed', new.id, public.slot_info(new.id)); end if;
  else
    if published and (old.main_dish_id is distinct from new.main_dish_id or old.source is distinct from new.source
                      or old.place_name is distinct from new.place_name) then
      perform public.notify_home(new.household_id, 'slot_changed', new.id, public.slot_info(new.id));
    end if;
    if new.kept_despite_disagree and not old.kept_despite_disagree then
      for r in select profile_id from public.meal_slot_votes where slot_id = new.id and vote = 'disagree' loop
        perform public.notify(r.profile_id, 'kept_despite', new.id, public.slot_info(new.id));
      end loop;
    end if;
  end if;
  return new;
end $$;
create trigger meal_slots_notify after insert or update on public.meal_slots
  for each row execute function public.trg_slot_notify();

-- Saving a meal re-writes its cooks, so only tell someone once a day about the same meal.
create or replace function public.trg_cook_notify() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.notifications n where n.profile_id = new.profile_id and n.type = 'cook_assigned'
                 and n.slot_id = new.slot_id and n.created_at > now() - interval '1 day') then
    perform public.notify(new.profile_id, 'cook_assigned', new.slot_id, public.slot_info(new.slot_id));
  end if;
  return new;
end $$;
create trigger meal_slot_cooks_notify after insert on public.meal_slot_cooks
  for each row execute function public.trg_cook_notify();

create or replace function public.trg_suggestion_notify() returns trigger
language plpgsql security definer set search_path = '' as $$
declare info jsonb;
begin
  info := public.slot_info(new.slot_id) || jsonb_build_object(
    'suggested_en', coalesce((select n.name from public.dish_names n where n.dish_id = new.dish_id and n.language = 'en'), (select d.name from public.dishes d where d.id = new.dish_id), new.free_text),
    'suggested_ta', (select n.name from public.dish_names n where n.dish_id = new.dish_id and n.language = 'ta'));
  if tg_op = 'INSERT' then
    perform public.notify_planners(public.slot_household(new.slot_id), public.slot_date(new.slot_id), 'suggestion_new', new.slot_id, info);
  elsif new.status in ('accepted', 'declined') and old.status = 'open' then
    perform public.notify(new.profile_id, 'suggestion_' || new.status, new.slot_id, info);
  end if;
  return new;
end $$;
create trigger meal_slot_suggestions_notify after insert or update of status on public.meal_slot_suggestions
  for each row execute function public.trg_suggestion_notify();

-- A new comment goes to the Planner/Admins and to anyone who already voted or commented on that meal.
create or replace function public.trg_comment_notify() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r record; info jsonb;
begin
  info := public.slot_info(new.slot_id);
  perform public.notify_planners(public.slot_household(new.slot_id), public.slot_date(new.slot_id), 'comment_new', new.slot_id, info);
  for r in select profile_id from public.meal_slot_votes where slot_id = new.slot_id
           union select profile_id from public.meal_slot_comments where slot_id = new.slot_id loop
    perform public.notify(r.profile_id, 'comment_new', new.slot_id, info);
  end loop;
  return new;
end $$;
create trigger meal_slot_comments_notify after insert on public.meal_slot_comments
  for each row execute function public.trg_comment_notify();

create or replace function public.trg_turn_notify() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'approved' then
    perform public.notify(new.profile_id, 'turn_assigned', null,
      jsonb_build_object('scope', new.scope, 'start_date', new.start_date, 'end_date', new.end_date));
  end if;
  return new;
end $$;
create trigger planner_turns_notify after insert on public.planner_turns
  for each row execute function public.trg_turn_notify();

-- The writers are internal: the app cannot call them directly (e.g. to send a fake notification).
revoke execute on function
  public.slot_info(uuid), public.notify(uuid, text, uuid, jsonb), public.notify_home(uuid, text, uuid, jsonb),
  public.notify_planners(uuid, date, text, uuid, jsonb),
  public.trg_week_published(), public.trg_slot_notify(), public.trg_cook_notify(), public.trg_suggestion_notify(),
  public.trg_comment_notify(), public.trg_turn_notify()
from public, anon, authenticated;
