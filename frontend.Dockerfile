# ---- Stage 1: Build Environment ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for caching
COPY package*.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY apps/client/package*.json ./apps/client/

# Install dependencies with legacy peer deps and reduced verbosity
RUN npm install --legacy-peer-deps --loglevel=error

# Copy all source code
COPY . .

# Build shared types first
WORKDIR /app/packages/shared-types
RUN npm run build

# Build the Expo web app
WORKDIR /app/apps/client
ENV EXPO_PUBLIC_API_URL=https://jctop.zeabur.app/api/v1
ENV EXPO_ROUTER_APP_ROOT=./src/app
RUN npm run build:static

# ---- Stage 2: Production Server ----
FROM nginx:1.25-alpine

# Copy built static files to nginx
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]