# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f backend/Dockerfile .

# Every package.json and the lockfile, so dependency layers are cached until they change
FROM node:24-slim AS manifests
WORKDIR /app
COPY . .
RUN mkdir /manifests \
  && find . -name package.json -not -path '*/node_modules/*' -exec cp --parents {} /manifests \; \
  && cp package-lock.json /manifests/

FROM node:24-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=manifests /manifests ./
RUN npm ci --include-workspace-root -w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db -w @fitpulse/api
COPY packages ./packages
COPY backend ./backend
COPY tsconfig.base.json ./
RUN npm run build -w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db -w @fitpulse/api

# IP Geolocation by DB-IP (CC BY 4.0); see docker/fetch-geoip.sh
FROM alpine:3 AS geo
COPY docker/fetch-geoip.sh /fetch-geoip.sh
RUN sh /fetch-geoip.sh

FROM node:24-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production GEOIP_DB=/app/geo/dbip-city-lite.mmdb
WORKDIR /app
COPY --from=manifests /manifests ./
RUN npm ci --omit=dev -w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db -w @fitpulse/api \
  && npm cache clean --force
COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /app/packages/server-core/dist ./packages/server-core/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/db/prisma ./packages/db/prisma
COPY --from=build /app/packages/db/prisma.config.ts ./packages/db/
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/docker-entrypoint.sh ./backend/
COPY --from=geo /geo ./geo
USER node
EXPOSE 3000
ENTRYPOINT ["sh", "backend/docker-entrypoint.sh"]
