# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f frontend-AdminPanel/Dockerfile .

FROM node:24-slim AS manifests
WORKDIR /app
COPY . .
RUN mkdir /manifests \
  && find . -name package.json -not -path '*/node_modules/*' -exec cp --parents {} /manifests \; \
  && cp package-lock.json /manifests/

FROM node:24-slim AS build
WORKDIR /app
COPY --from=manifests /manifests ./
RUN npm ci --include-workspace-root -w @fitpulse/contracts -w @fitpulse/admin-web
COPY tsconfig.base.json ./
COPY packages/contracts ./packages/contracts
COPY frontend-AdminPanel ./frontend-AdminPanel
RUN npm run build -w @fitpulse/contracts -w @fitpulse/admin-web

FROM nginxinc/nginx-unprivileged:alpine AS runtime
ENV PORT=8080 API_UPSTREAM=http://admin-api:3001 NGINX_ENVSUBST_FILTER="^(PORT|API_UPSTREAM)$"
COPY frontend-AdminPanel/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/frontend-AdminPanel/dist /usr/share/nginx/html
EXPOSE 8080
