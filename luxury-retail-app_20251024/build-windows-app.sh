#!/bin/bash

# Luxury Retail Electron App Build Script for Windows
echo "🚀 Building Luxury Retail Desktop App for Windows..."

# Navigate to project root
cd "$(dirname "$0")/../.."

echo "📦 Building web app..."
cd packages/container-app
npm run build

echo "📋 Copying web app to Electron..."
cd ../electron-app
rm -rf web-app
cp -r ../container-app/dist ./web-app

echo "🔨 Building Electron app for Windows..."
npm run build:win

echo "✅ Windows build complete! Check the dist folder for your Windows app."
echo "📁 App location: packages/electron-app/dist/"
echo ""
echo "📦 Available Windows builds:"
echo "  - NSIS Installer (.exe)"
echo "  - Portable App (.exe)"
echo ""
echo "🎯 To test on Windows:"
echo "  1. Copy the .exe file to a Windows machine"
echo "  2. Run the installer or portable app"
echo "  3. The app will connect to your web server"
