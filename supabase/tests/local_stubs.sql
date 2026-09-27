-- Stand-ins for the parts of Supabase the migrations rely on, so the database
-- rules can be tested on a plain local PostgreSQL. Never run this on Supabase.
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
grant usage on schema public, auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
-- No default table privileges: like a Supabase project with "Automatically expose
-- new tables" turned off, the migration must grant access explicitly.
revoke all on schema public from public;
grant usage on schema public to anon;
