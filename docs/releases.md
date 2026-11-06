# Branches, releases and the local database

How HomeFood is released now that Home v1 is frozen and phase 2 (kitchen types: PG / hostel, flatmates / co-living, old-age home) is being built.

## The rules

| | `main` | `phase2/kitchen-types` |
| --- | --- | --- |
| What it is | The live family app, **Home v1** (tag `v1.0.0`) | Phase 2 work |
| Who uses it | The family, at https://venkatesh-knr.github.io/homefood-app/ | Nobody yet: development only |
| Changes allowed | Bug fixes only, tagged `v1.0.x` | New features, new migrations (0049 onwards) |
| Database | `homefood-prod` (Supabase cloud, Mumbai) | **Local Supabase in Docker** (see below). Never `homefood-prod` |
| Deploys the site | Yes, on every push to `main` (GitHub Pages) | No. The deploy workflow only runs for `main` |
| CI (build, test, lint, database rule tests) | Yes | Yes (also `release/**` branches and pull requests) |

1. **Fix on `main` first**, tag it (`v1.0.1`, `v1.0.2` ...), then merge `main` into `phase2/kitchen-types` so phase 2 never loses a fix:
   ```bash
   git checkout main && git pull
   # ... fix, npm run build && npm test && npm run lint, commit, push ...
   git tag -a v1.0.1 -m "HomeFood Home v1.0.1 - <what was fixed>" && git push origin v1.0.1
   git checkout phase2/kitchen-types && git merge main
   ```
2. **Phase 2 migrations (0049 onwards) are tested on the local database only.** They go to `homefood-prod` only when phase 2 is merged to `main`.
3. **When phase 2 is tested:** merge `phase2/kitchen-types` into `main`, run the new migrations on `homefood-prod` (SQL Editor, in order, after taking a backup), push, and tag `v2.0.0`. If v1 still needs fixes after that, create `release/1.x` from the `v1.0.0` tag (or the last `v1.0.x`) and fix there.
4. **Families must never see PG / business features.** The kitchen type of a home decides which features are on; the Home (family) kitchen type shows exactly what Home v1 shows today. Every phase 2 feature has to be switched off for a family home, and a test has to prove it.
5. Git author email stays the GitHub noreply address.

## Tags and releases so far

| Tag | What | Link |
| --- | --- | --- |
| `v1.0.0` | Home v1, migrations 0001-0048 | https://github.com/venkatesh-knr/homefood-app/releases/tag/v1.0.0 |

## The local database (Docker + Supabase CLI)

A complete copy of the HomeFood backend (Postgres, sign-in, storage, an email catcher) runs in Docker on your PC. It starts empty apart from the shared catalogue that the migrations insert (dishes, recipes, shop items ...).

Needs **Docker Desktop** running (Windows: https://www.docker.com/products/docker-desktop/ , install, restart, open it and wait for "Engine running"). The Supabase CLI is run with `npx supabase ...` (nothing else to install).

| What | Command (from the repo folder) |
| --- | --- |
| Start it (first time downloads about 2 GB) | `npm run db:start` |
| Stop it (keeps the data) | `npm run db:stop` |
| See its addresses and keys | `npm run db:status` |
| Wipe it and re-apply **every migration** in `supabase/migrations/` | `npm run db:reset` |
| Run the database rule tests (`supabase/tests/rls_test.sql`) against it | `npm run test:db:local` (it resets the database first and again afterwards) |
| Run the app against it | `npm run dev` (reads `.env.development.local`) |

- **Addresses:** API `http://127.0.0.1:54321`, database `postgresql://postgres:postgres@127.0.0.1:54322/postgres`, Studio (tables, SQL editor) `http://127.0.0.1:54323`.
- **Sign-in emails never leave your PC.** The 6-digit code arrives in **Mailpit: http://127.0.0.1:54324**. Open it, read the code, type it into the app.
- **`.env.development.local`** holds the local API URL and the local publishable key (git-ignored, like every `.env.*` file). The local keys are the standard Supabase demo keys and only work on your own PC. **Never put the `service_role` / secret key of `homefood-prod`, or its database password, anywhere in this repo.**
- A new migration: add `supabase/migrations/00NN_name.sql`, run `npm run db:reset`, then `npm run test:db:local`. Add its checks to `supabase/tests/rls_test.sql` (and the file to `scripts/test-db.sh`, which CI uses).
- CI still runs `scripts/test-db.sh` on a plain Postgres on every push, so a migration is checked twice: here with the real Supabase pieces, in CI on plain Postgres.

## Backing up the live database (`homefood-prod`)

Do this **before every migration run on `homefood-prod`**, and now and then. The file contains your family's data: save it **outside this repo folder** (the repo is public) and never commit it.

1. Supabase dashboard › your project › **Connect** › **Session pooler** › copy the connection string (it looks like `postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres`; put your database password in place of `[YOUR-PASSWORD]`).
2. Make a folder for backups outside the repo, e.g. `D:\HomeFoodBackups`.
3. Run (PowerShell, one line; uses Docker so no Postgres install is needed; `postgres:17` matches the live server, use `postgres:15` if the dashboard says Postgres 15):

```powershell
docker run --rm -v D:\HomeFoodBackups:/backup postgres:17 pg_dump "postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres" --format=custom --no-owner --no-privileges --file=/backup/homefood-prod-YYYY-MM-DD.dump
```

   This writes the whole database (schema and data, including the `auth` users and the `storage` file list) as `D:\HomeFoodBackups\homefood-prod-YYYY-MM-DD.dump`. A readable copy of the schema and data of the app's own tables, if you want one:

```powershell
docker run --rm -v D:\HomeFoodBackups:/backup postgres:17 pg_dump "<same connection string>" --schema=public --no-owner --no-privileges --file=/backup/homefood-prod-public-YYYY-MM-DD.sql
```

4. Check the file is not empty (several MB).

**Photos:** the family's own photos live in Supabase Storage (bucket `dish-photos`), not in the database dump (the dump only lists them). To back them up, Storage › `dish-photos` › download the folders, or use `npx supabase storage cp` after `npx supabase login`. The bundled stock photos are in this repo (`public/dish-photos/`).

**Restoring** (only if ever needed, into a new or local database): `pg_restore --no-owner --dbname=<target> homefood-prod-YYYY-MM-DD.dump`.
