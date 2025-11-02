#!/bin/bash

# Luxury Retail Universal Build Script
echo "🚀 Building Luxury Retail Desktop App for All Platforms..."

# Navigate to project root
cd "$(dirname "$0")/../.."

echo "📦 Building web app..."
cd packages/container-app
npm run build

echo "📋 Copying web app to Electron..."
cd ../electron-app
rm -rf web-app
cp -r ../container-app/dist ./web-app

echo "🔨 Building Electron app for all platforms..."
echo ""

# Build for macOS
echo "🍎 Building for macOS..."
npm run build:mac

echo ""

# Build for Windows
echo "🪟 Building for Windows..."
npm run build:win

echo ""

# Build for Linux
echo "🐧 Building for Linux..."
npm run build:linux

echo ""
echo "✅ Universal build complete! Check the dist folder for all platform apps."
echo "📁 App location: packages/electron-app/dist/"
echo ""
echo "📦 Available builds:"
echo "  🍎 macOS: DMG installer"
echo "  🪟 Windows: NSIS installer + Portable app"
echo "  🐧 Linux: AppImage + DEB package"
echo ""
echo "🎯 All apps use the same React.js codebase!"
echo "🌐 All apps connect to: http://localhost:5176"
