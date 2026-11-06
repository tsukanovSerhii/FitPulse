#!/bin/sh
# Applies pending migrations when RUN_MIGRATIONS=true, then starts the API.
# Render's pre-deploy command needs a paid plan, so the API container runs them itself.
# A database that is asleep or down must not keep the API from starting: after a few tries the
# server starts anyway, /api/health answers and /api/health/ready reports the database.
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  attempt=1
  until npm run migrate:deploy -w @fitpulse/db; do
    if [ "$attempt" -ge "${MIGRATION_ATTEMPTS:-3}" ]; then
      echo "WARNING: migrations failed after $attempt attempts; starting the API without them" >&2
      break
    fi
    attempt=$((attempt + 1))
    sleep "${MIGRATION_RETRY_SECONDS:-5}"
  done
fi

exec node backend/dist/server.js
