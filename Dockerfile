# ────────────────────────────────────────────────────────────────────────────────
# Stage 1 – dependencies
#   Install only production dependencies so the final image is lean.
# ────────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# ────────────────────────────────────────────────────────────────────────────────
# Stage 2 – test / lint (used in CI; not part of the runtime image)
# ────────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS test

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run lint
RUN npm test

# ────────────────────────────────────────────────────────────────────────────────
# Stage 3 – runtime
#   Lightweight image that runs the Express server locally.
#   On AWS Lambda the src/ folder is zipped and deployed directly (not via Docker
#   unless you choose container-image Lambda deployment).
# ────────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy production node_modules from Stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src ./src
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run the local HTTP server (not used inside Lambda)
CMD ["node", "src/server.js"]