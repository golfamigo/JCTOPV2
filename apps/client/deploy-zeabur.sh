#!/bin/bash

echo "Starting Zeabur deployment build..."

# Clean previous builds
rm -rf dist web-build

# Set production environment
export NODE_ENV=production
export EXPO_PUBLIC_API_URL=https://jctop.zeabur.app/api/v1

# Build for production
echo "Building for production..."
npm run build:static

echo "Build complete! Ready for Zeabur deployment."
echo "Files are in the 'dist' directory."