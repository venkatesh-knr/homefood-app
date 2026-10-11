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
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0011_recipes.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0012_nutrition.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0013_notifications.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0014_dish_photos_static.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0015_more_south_indian_dishes.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0016_south_indian_recipes.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0017_more_recipes.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0018_south_indian_photos_more.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0019_meal_attendance.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0020_tamil_wording_fixes.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0021_breakfast_dinner_overlap.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0022_dish_favourites.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0023_week_start_choice.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0024_weekly_balance.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/migrations/0025_recipe_edit.sql
psql -v ON_ERROR_STOP=1 -o /dev/null -d "$DB" -f supabase/tests/rls_test.sql 2>&1 | sed -E "s/^psql:[^ ]+ NOTICE:  //"
