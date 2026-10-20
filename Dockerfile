# STAGE 1: Base build image
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Pin pnpm to the same major as CI (action-setup: version 9). pnpm@latest (v10)
# enforces a minimumReleaseAge supply-chain policy the v9-managed lockfile
# cannot satisfy, breaking parity between CI and container builds.
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# STAGE 2: Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# STAGE 2b: Production-only dependencies. Runtime images must not ship dev
# tooling (vitest/esbuild carry blocking CVEs and are not needed at runtime).
# Fresh install from scratch: `pnpm install --prod` on an existing node_modules
# does not remove previously installed dev packages.
FROM base AS deps-prod
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# STAGE 3: Builder
FROM deps AS build
COPY . .
RUN pnpm run build

# STAGE 4: Alpine Build (Necessary for musl compatibility)
FROM node:22-alpine AS build-alpine
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm run build

# STAGE 4b: Production-only dependencies for the alpine runtime (same reason
# as deps-prod: fresh install so no dev tooling leaks into the runtime image)
FROM node:22-alpine AS deps-alpine-prod
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# --- RUNTIME TARGETS ---

# Native Node healthcheck (no shell/curl available in hardened images)
# Uses the /healthz liveness endpoint exposed by the service.
# Target: runtime-slim (The "Debug" image)
FROM node:22-bookworm-slim AS runtime-slim
ENV PORT=8080
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=deps-prod /app/node_modules ./node_modules
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "dist/index.js"]

# Target: runtime-alpine (The "IoT/Edge" image)
FROM node:22-alpine AS runtime-alpine
ENV PORT=8080
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build-alpine /app/dist ./dist
COPY --from=deps-alpine-prod /app/node_modules ./node_modules
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "dist/index.js"]

# Target: runtime-distroless (The "Hardened" image)
# debian13: current distroless LTS base (bookworm-era libssl3 carries
# unpatched CRITICAL CVE-2026-31789; trixie ships the fixed openssl).
FROM gcr.io/distroless/nodejs22-debian13 AS runtime-distroless
ENV PORT=8080
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=deps-prod /app/node_modules ./node_modules
# nonroot (uid 65532): unprivileged, no shell, no package manager
USER nonroot
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["dist/index.js"]
