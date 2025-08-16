# Zeabur optimized Dockerfile for frontend
FROM node:18-alpine

WORKDIR /app

# Copy all package.json files
COPY package*.json ./
COPY apps/client/package*.json ./apps/client/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy and build shared-types
COPY packages/shared-types ./packages/shared-types
WORKDIR /app/packages/shared-types
RUN npm run build || echo "No build script for shared-types"

# Copy client source code
WORKDIR /app
COPY apps/client ./apps/client

WORKDIR /app/apps/client

EXPOSE 3000

# Install expo if needed
RUN npx expo --version || npm install expo

# Start Expo web server in production mode
CMD ["npx", "expo", "start", "--web", "--port", "3000", "--no-dev", "--lan"]