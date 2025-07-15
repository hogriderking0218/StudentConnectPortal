#!/bin/bash
# Build script for Vercel deployment

echo "Building Revelsy for Vercel..."

# Install dependencies
npm install

# Build the frontend and backend
npm run build

echo "Build complete!"