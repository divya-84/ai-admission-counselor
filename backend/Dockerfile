# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
RUN npm ci
COPY shared/ ./shared/
COPY backend/ ./backend/
RUN npm run build -w shared
RUN npm run build -w backend
# Generate Prisma Client in builder
WORKDIR /app/backend
RUN npx prisma generate

# Production Stage
FROM node:24-alpine AS runner
WORKDIR /app
COPY package*.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
RUN npm ci --omit=dev
# Copy built dists
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
# Copy generated Prisma Client from builder node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 5000
ENV NODE_ENV=production
WORKDIR /app/backend
CMD ["node", "dist/index.js"]
