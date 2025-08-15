#!/bin/bash

# Set environment variables
export NODE_ENV=production
export EXPO_PUBLIC_API_URL=https://jctop.zeabur.app/api/v1

# Build the web version
echo "Building web version..."
npx expo export:web --output-dir dist

echo "Build complete!"