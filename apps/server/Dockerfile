# Production Dockerfile - excludes test files
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy all packages and apps
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install dependencies
RUN npm install --only=production --ignore-scripts

# Install dev dependencies needed for build
RUN npm install typescript @types/node --no-save

# Create production tsconfig for server (excludes test files)
WORKDIR /app/apps/server
RUN cat > tsconfig.production.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": false,
    "sourceMap": false
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/**/*.e2e-spec.ts",
    "dist",
    "node_modules",
    "coverage"
  ]
}
EOF

# Build shared-types first
WORKDIR /app/packages/shared-types
RUN npx tsc

# Build the server without test files
WORKDIR /app/apps/server
RUN npx tsc -p tsconfig.production.json

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