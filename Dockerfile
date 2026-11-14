# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3001 HOSTNAME=0.0.0.0
RUN addgroup -S jamogo && adduser -S jamogo -G jamogo

COPY --from=builder /app/public ./public
COPY --from=builder --chown=jamogo:jamogo /app/.next/standalone ./
COPY --from=builder --chown=jamogo:jamogo /app/.next/static ./.next/static

USER jamogo
EXPOSE 3001
CMD ["node", "server.js"]
