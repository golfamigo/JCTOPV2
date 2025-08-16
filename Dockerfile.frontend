# Frontend service Dockerfile for Zeabur deployment
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy shared types and client packages
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY apps/client/package*.json ./apps/client/

# Install dependencies
RUN npm install --only=production --legacy-peer-deps

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY apps/client/package*.json ./apps/client/

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY packages/shared-types ./packages/shared-types
COPY apps/client ./apps/client

# Build shared types first
WORKDIR /app/packages/shared-types
RUN npm run build

# Production stage for frontend
FROM base AS runner
WORKDIR /app/apps/client

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expo

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Copy dependencies and built files
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/client/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types/dist /app/packages/shared-types/dist
COPY --from=builder /app/apps/client ./

# Change ownership
RUN chown -R expo:nodejs /app
USER expo

EXPOSE 3000

ENV NODE_ENV=production
ENV EXPO_PUBLIC_API_URL=https://jctop.zeabur.app/api/v1
ENV PORT=3000

# Start Expo development server in production mode
CMD ["npx", "expo", "start", "--web", "--port", "3000", "--host", "0.0.0.0"]