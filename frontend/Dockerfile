# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f frontend/Dockerfile .

FROM node:24-slim AS manifests
WORKDIR /app
COPY . .
RUN mkdir /manifests \
  && find . -name package.json -not -path '*/node_modules/*' -exec cp --parents {} /manifests \; \
  && cp package-lock.json /manifests/

FROM node:24-slim AS build
WORKDIR /app
COPY --from=manifests /manifests ./
RUN npm ci --include-workspace-root -w @fitpulse/contracts -w @fitpulse/web
COPY tsconfig.base.json ./
COPY packages/contracts ./packages/contracts
COPY frontend ./frontend
# Public settings baked into the bundle at build time
ARG VITE_SITE_URL
ARG VITE_ADS_ENABLED=false
ARG VITE_ERROR_ENDPOINT
ENV VITE_SITE_URL=$VITE_SITE_URL VITE_ADS_ENABLED=$VITE_ADS_ENABLED VITE_ERROR_ENDPOINT=$VITE_ERROR_ENDPOINT
RUN npm run build -w @fitpulse/web

FROM nginxinc/nginx-unprivileged:alpine AS runtime
ENV PORT=8080 API_UPSTREAM=http://api:3000 NGINX_ENVSUBST_FILTER="^(PORT|API_UPSTREAM)$"
COPY frontend/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 8080
