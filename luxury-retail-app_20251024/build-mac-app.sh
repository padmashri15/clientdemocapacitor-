#!/bin/bash

# Luxury Retail Electron App Build Script
echo "🚀 Building Luxury Retail Desktop App for macOS..."

# Navigate to project root
cd "$(dirname "$0")/../.."

echo "📦 Building web app..."
cd packages/container-app
npm run build

echo "📋 Copying web app to Electron..."
cd ../electron-app
rm -rf web-app
cp -r ../container-app/dist ./web-app

echo "🔨 Building Electron app for macOS..."
npm run build:mac

echo "✅ Build complete! Check the dist folder for your macOS app."
echo "📁 App location: packages/electron-app/dist/"
