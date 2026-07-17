# PrepWise API — production container image.
# Builds cleanly for Render, Google Cloud Run, AWS, or any Docker host.

FROM node:20-slim AS base
WORKDIR /app

# OpenSSL is required by Prisma's query engine on Debian slim images.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

# npm ci uses package-lock.json for reproducible installs; falls back to
# npm install if no lockfile has been committed yet.
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

# Cloud Run injects PORT — the app already reads process.env.PORT via env.js.
CMD ["node", "src/server.js"]
