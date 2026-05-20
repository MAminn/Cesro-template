FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Pin pnpm via corepack (matches the "packageManager" field in package.json).
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Install dependencies (incl. devDependencies — required because `pnpm start`
# runs `tsx`, which lives in devDependencies).
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Production runtime
FROM base AS runner
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production

# `pnpm start` runs `tsx ./server/server.ts`, which imports TS source at
# runtime via the #root path alias. Copy the whole built tree so every
# referenced folder (pages, components, frontend, lib, layouts, hooks,
# context, tsconfig.json, vite.config.ts, etc.) is present.
COPY --from=builder /app ./

# Create uploads dir and drop root.
RUN mkdir -p /app/uploads \
    && chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:${PORT:-3000}/ || exit 1

CMD ["pnpm", "start"]