#!/bin/sh
# Applies pending migrations when RUN_MIGRATIONS=true, then starts the API.
# Render's pre-deploy command needs a paid plan, so the API container runs them itself.
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  npm run migrate:deploy -w @fitpulse/db
fi

exec node backend/dist/server.js
