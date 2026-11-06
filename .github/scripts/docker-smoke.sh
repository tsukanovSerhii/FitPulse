#!/bin/sh
# Starts the production images on one network and checks what a browser would see.
# Expects images fitpulse-api, fitpulse-admin-api, fitpulse-web, fitpulse-admin-web to be built.
set -eu

NET=fitpulse-smoke
DB_URL=postgresql://fitpulse:fitpulse@db:5432/fitpulse
SECRET=ci-only-secret-that-is-at-least-32-characters

cleanup() {
  docker logs api 2>&1 | tail -n 40 || true
  docker rm -f db redis api api-nodb admin-api web admin-web >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
}
trap cleanup EXIT

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

# wait_for <url> <seconds>
wait_for() {
  i=0
  until curl -fsS "$1" >/dev/null 2>&1; do
    i=$((i + 1))
    [ "$i" -ge "$2" ] && fail "$1 did not answer within $2 s"
    sleep 1
  done
}

docker network create "$NET" >/dev/null
docker run -d --name db --network "$NET" -e POSTGRES_USER=fitpulse -e POSTGRES_PASSWORD=fitpulse -e POSTGRES_DB=fitpulse postgres:17-alpine >/dev/null
docker run -d --name redis --network "$NET" redis:7-alpine >/dev/null
until docker exec db pg_isready -U fitpulse -d fitpulse >/dev/null 2>&1; do sleep 1; done

docker run -d --name api --network "$NET" -p 3000:3000 -e NODE_ENV=production -e RUN_MIGRATIONS=true \
  -e DATABASE_URL="$DB_URL" -e REDIS_URL=redis://redis:6379 -e JWT_SECRET="$SECRET" fitpulse-api >/dev/null
docker run -d --name admin-api --network "$NET" -p 3001:3001 -e NODE_ENV=production \
  -e DATABASE_URL="$DB_URL" -e REDIS_URL=redis://redis:6379 -e ADMIN_JWT_SECRET="$SECRET" fitpulse-admin-api >/dev/null

wait_for http://localhost:3000/api/health 60
wait_for http://localhost:3001/api/health 60
curl -fsS http://localhost:3000/api/health/ready | grep -q '"status":"ok"' || fail 'api is not ready (migrations or connections)'
curl -fsS http://localhost:3001/api/health/ready | grep -q '"status":"ok"' || fail 'admin api is not ready'
docker exec db psql -U fitpulse -d fitpulse -tAc "SELECT count(*) FROM _prisma_migrations" | grep -q '^[1-9]' || fail 'migrations were not applied'

docker run -d --name web --network "$NET" -p 8080:8080 -e API_UPSTREAM=http://api:3000 fitpulse-web >/dev/null
docker run -d --name admin-web --network "$NET" -p 8081:8080 -e API_UPSTREAM=http://admin-api:3001 fitpulse-admin-web >/dev/null
wait_for http://localhost:8080/ 30
wait_for http://localhost:8081/ 30

# Prerendered page and a client-side route both load after a refresh
curl -fsS http://localhost:8080/exercise/bench-press | grep -q '<title>' || fail 'prerendered page missing'
curl -fsS http://localhost:8080/plans | grep -q 'id="root"' || fail 'app route does not fall back to index.html'
curl -fsSI http://localhost:8080/sw.js | grep -qi 'cache-control: no-cache' || fail 'sw.js must not be cached'
curl -fsSI http://localhost:8080/plans | grep -qi 'cache-control: no-cache' || fail 'HTML must be revalidated after a deploy'

# /api goes through nginx to the API, body included
curl -fsS http://localhost:8080/api/health | grep -q '"status":"ok"' || fail 'web does not proxy /api/health'
curl -sS -X POST -H 'content-type: application/json' -d '{"a":1}' http://localhost:8080/api/nope | grep -q '"NOT_FOUND"' \
  || fail 'POST through the proxy did not reach the API'
curl -fsS http://localhost:8081/api/health | grep -q '"status":"ok"' || fail 'admin web does not proxy /api/health'
curl -fsS http://localhost:8081/some/admin/route | grep -q 'id="root"' || fail 'admin route does not fall back to index.html'

# A database that is down on start-up must not keep the API from answering its health check
docker run -d --name api-nodb --network "$NET" -p 3002:3000 -e NODE_ENV=production -e RUN_MIGRATIONS=true   -e MIGRATION_RETRY_SECONDS=1 -e DATABASE_URL=postgresql://fitpulse:fitpulse@no-such-db:5432/fitpulse   -e REDIS_URL=redis://redis:6379 -e JWT_SECRET="$SECRET" fitpulse-api >/dev/null
wait_for http://localhost:3002/api/health 90
[ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3002/api/health/ready)" = 503 ]   || fail 'ready must report 503 while the database is down'

echo 'Docker smoke test passed'
