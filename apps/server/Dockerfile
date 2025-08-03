# Production Dockerfile - excludes test files
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy all packages and apps
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install only production dependencies at root level
RUN npm ci --only=production --ignore-scripts

# Install minimal build dependencies
RUN npm install typescript --no-save --production=false

# Build shared-types first
WORKDIR /app/packages/shared-types
RUN npm run build

# Build the server using npm script (which uses the updated tsconfig.json)
WORKDIR /app/apps/server
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared-types ./packages/shared-types

# Copy necessary runtime files
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