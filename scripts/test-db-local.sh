#!/usr/bin/env bash
# Runs the database rule tests against the LOCAL Supabase (Docker), which has the real Supabase auth / storage / roles.
# Resets the local database first (every migration in supabase/migrations/ is applied from scratch) and again afterwards, so it is left clean.
# Needs Docker Desktop running and `npm run db:start` done once. Never touches homefood-prod.
set -euo pipefail
cd "$(dirname "$0")/.."

CONTAINER="supabase_db_homefood-local"
docker ps --format '{{.Names}}' | grep -qx "$CONTAINER" || { echo "The local database is not running. Start Docker Desktop, then: npm run db:start"; exit 1; }

echo "Resetting the local database (all migrations)..."
npx supabase db reset >/dev/null

echo "Running supabase/tests/rls_test.sql ..."
docker exec -i "$CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -o /dev/null < supabase/tests/rls_test.sql 2>&1 | sed -E "s/^psql:[^ ]+ NOTICE:  //" | tee /tmp/homefood-rls.out || STATUS=$?
echo "----"
echo "checks passed: $(grep -c '^ok ' /tmp/homefood-rls.out || true)"
grep -E "ERROR|FAIL" /tmp/homefood-rls.out && RESULT=1 || RESULT=0

echo "Cleaning up (reset)..."
npx supabase db reset >/dev/null
exit $RESULT
