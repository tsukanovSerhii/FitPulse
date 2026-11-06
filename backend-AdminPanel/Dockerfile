# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f backend-AdminPanel/Dockerfile .

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
RUN npm ci --include-workspace-root -w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db -w @fitpulse/admin-api
COPY packages ./packages
COPY backend-AdminPanel ./backend-AdminPanel
COPY tsconfig.base.json ./
RUN npm run build -w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db -w @fitpulse/admin-api

FROM node:24-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app
COPY --from=manifests /manifests ./
RUN npm ci --omit=dev -w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db -w @fitpulse/admin-api \
  && npm cache clean --force
COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /app/packages/server-core/dist ./packages/server-core/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/backend-AdminPanel/dist ./backend-AdminPanel/dist
USER node
EXPOSE 3001
CMD ["node", "backend-AdminPanel/dist/server.js"]
