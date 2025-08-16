# Zeabur optimized Dockerfile for backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy all package.json files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY packages/shared-types ./packages/shared-types
COPY apps/server ./apps/server

# Build shared types
WORKDIR /app/packages/shared-types
RUN npm run build || echo "No build script for shared-types"

# Build backend
WORKDIR /app/apps/server
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Install production dependencies and required build tools
RUN npm install --production --legacy-peer-deps && \
    npm install -g ts-node typescript

# Copy built files
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY apps/server/data-source.ts ./apps/server/
COPY apps/server/src/migrations ./apps/server/src/migrations

WORKDIR /app/apps/server

EXPOSE 3000

CMD ["node", "dist/main"]