#!/bin/sh

echo "Starting production server..."

# Skip migrations for now - will run them manually after deployment
echo "Skipping database migrations for initial deployment..."

# Start the server
echo "Starting NestJS server..."
node dist/main