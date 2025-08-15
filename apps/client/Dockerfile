# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY ../../package*.json ../../
COPY ../../packages/shared-types ./packages/shared-types

# Copy client app
COPY . ./apps/client

# Install dependencies
WORKDIR /app
RUN npm ci

# Build the app
WORKDIR /app/apps/client
ENV EXPO_ROUTER_APP_ROOT=./src/app
ENV NODE_ENV=production
RUN npm run build:web

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to host the static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/apps/client/web-build ./web-build

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "web-build", "-l", "3000"]