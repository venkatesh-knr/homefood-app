#!/usr/bin/env bash
# Runs the database rule tests against a throwaway local PostgreSQL database.
# Needs PostgreSQL 15+ installed locally (psql + createdb). Does not touch Supabase.
set -euo pipefail
cd "$(dirname "$0")/.."

DB="homefood_test_$$"
createdb "$DB"
trap 'dropdb --if-exists "$DB"' EXIT

psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/tests/local_stubs.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0001_core_schema.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0003_seed_cuisines.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0004_invite_details.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0005_seed_dishes.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0006_meal_slot_eaters.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0007_dish_stock_photos.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0008_dish_stock_photos_rest.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0009_more_indian_dishes.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0010_meal_discussion.sql
psql -v ON_ERROR_STOP=1 -o /dev/null -d "$DB" -f supabase/tests/rls_test.sql 2>&1 | sed -E "s/^psql:[^ ]+ NOTICE:  //"
