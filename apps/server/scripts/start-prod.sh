#!/bin/sh

echo "Starting production server..."

# Run migrations
echo "Running database migrations..."
npm run migration:run

# Start the server
echo "Starting NestJS server..."
node dist/main