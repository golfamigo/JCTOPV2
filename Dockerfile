# Production Dockerfile for JCTOPV2 backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy only backend and shared packages
COPY packages/shared-types/ ./packages/shared-types/
COPY packages/config/ ./packages/config/
COPY apps/server/ ./apps/server/

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Install TypeScript for building
RUN npm install typescript --no-save

# Build shared-types first
WORKDIR /app/packages/shared-types
RUN npm run build

# Build the server
WORKDIR /app/apps/server
RUN npx nest build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared-types ./packages/shared-types

# Copy runtime files
COPY apps/server/src/migrations ./apps/server/src/migrations
COPY apps/server/data-source.ts ./apps/server/
COPY apps/server/scripts/start-prod.sh ./apps/server/scripts/
RUN chmod +x ./apps/server/scripts/start-prod.sh

WORKDIR /app/apps/server

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["sh", "scripts/start-prod.sh"]