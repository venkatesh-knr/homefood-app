-- HomeFood · 0010: votes, comments and suggestions on a meal (the "Discussion" screen)
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run.
-- Spec: anyone with a login can agree/disagree, comment and suggest a dish; the Planner (or an Admin) has the
-- final say, so only they can accept or decline a suggestion, or clear votes when a dish is swapped.
-- Everything hangs off meal_slots and is visible only inside the same home.

create table public.meal_slot_votes (
  slot_id    uuid not null references public.meal_slots (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  vote       text not null check (vote in ('agree', 'disagree')),
  updated_at timestamptz not null default now(),
  primary key (slot_id, profile_id)                      -- one vote per person per meal, changeable
);

create table public.meal_slot_comments (
  id         uuid primary key default gen_random_uuid(),
  slot_id    uuid not null references public.meal_slots (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index meal_slot_comments_slot_idx on public.meal_slot_comments (slot_id, created_at);

create table public.meal_slot_suggestions (
  id          uuid primary key default gen_random_uuid(),
  slot_id     uuid not null references public.meal_slots (id) on delete cascade,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  dish_id     uuid references public.dishes (id) on delete cascade,
  free_text   text check (char_length(btrim(free_text)) between 1 and 120),
  status      text not null default 'open' check (status in ('open', 'accepted', 'declined')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  check (dish_id is not null or free_text is not null)  -- a dish from the catalogue, or a few words
);
create index meal_slot_suggestions_slot_idx on public.meal_slot_suggestions (slot_id, created_at);

alter table public.meal_slot_votes       enable row level security;
alter table public.meal_slot_comments    enable row level security;
alter table public.meal_slot_suggestions enable row level security;

-- Votes: everyone in the home sees them; you only ever write your own. The Planner can clear a meal's votes
-- (when they swap the dish, the old votes no longer mean anything).
create policy votes_read on public.meal_slot_votes for select to authenticated
  using (public.slot_household(slot_id) = public.my_household_id());
create policy votes_write on public.meal_slot_votes for insert to authenticated
  with check (profile_id = public.my_profile_id() and public.slot_household(slot_id) = public.my_household_id());
create policy votes_update on public.meal_slot_votes for update to authenticated
  using (profile_id = public.my_profile_id() and public.slot_household(slot_id) = public.my_household_id())
  with check (profile_id = public.my_profile_id() and public.slot_household(slot_id) = public.my_household_id());
create policy votes_delete on public.meal_slot_votes for delete to authenticated
  using (public.slot_household(slot_id) = public.my_household_id()
         and (profile_id = public.my_profile_id() or public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id))));

-- Comments: write as yourself; remove your own (an Admin can remove anyone's). No editing.
create policy comments_read on public.meal_slot_comments for select to authenticated
  using (public.slot_household(slot_id) = public.my_household_id());
create policy comments_write on public.meal_slot_comments for insert to authenticated
  with check (profile_id = public.my_profile_id() and public.slot_household(slot_id) = public.my_household_id());
create policy comments_delete on public.meal_slot_comments for delete to authenticated
  using (public.slot_household(slot_id) = public.my_household_id()
         and (profile_id = public.my_profile_id() or public.is_admin()));

-- Suggestions: anyone proposes (always starts open); only the Planner/Admin resolves; you can withdraw your own.
create policy suggestions_read on public.meal_slot_suggestions for select to authenticated
  using (public.slot_household(slot_id) = public.my_household_id());
create policy suggestions_write on public.meal_slot_suggestions for insert to authenticated
  with check (profile_id = public.my_profile_id() and status = 'open'
              and public.slot_household(slot_id) = public.my_household_id());
create policy suggestions_resolve on public.meal_slot_suggestions for update to authenticated
  using (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id)))
  with check (public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id)));
create policy suggestions_delete on public.meal_slot_suggestions for delete to authenticated
  using (public.slot_household(slot_id) = public.my_household_id()
         and (profile_id = public.my_profile_id()
              or public.can_plan(public.slot_household(slot_id), public.slot_date(slot_id))));

grant select, insert, update, delete on
  public.meal_slot_votes, public.meal_slot_comments, public.meal_slot_suggestions
to authenticated;
