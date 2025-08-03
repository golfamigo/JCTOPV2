# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY apps/server/package*.json ./apps/server/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Install all dependencies
RUN npm ci

# Copy source code
COPY apps/server ./apps/server
COPY packages/shared-types ./packages/shared-types

# Build the server
WORKDIR /app/apps/server
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Copy workspace structure for dependencies
RUN npm ci --only=production

# Copy built application and necessary files
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared-types ./packages/shared-types
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules

# Copy migration files
COPY apps/server/src/migrations ./apps/server/src/migrations
COPY apps/server/data-source.ts ./apps/server/

# Copy start script
COPY apps/server/scripts/start-prod.sh ./apps/server/scripts/
RUN chmod +x ./apps/server/scripts/start-prod.sh

WORKDIR /app/apps/server

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of necessary files
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Start the application
CMD ["sh", "scripts/start-prod.sh"]