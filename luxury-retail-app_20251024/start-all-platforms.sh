#!/bin/bash

# Luxury Retail Multi-Platform Development Script
echo "🚀 Starting Luxury Retail App on all platforms..."

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 > /dev/null
}

# Function to start web app
start_web() {
    echo "🌐 Starting Web App..."
    cd packages/container-app
    npm run dev &
    WEB_PID=$!
    echo "Web app PID: $WEB_PID"
    cd ../..
}

# Function to start Electron app
start_electron() {
    echo "💻 Starting Electron App..."
    cd packages/electron-app
    npm run dev &
    ELECTRON_PID=$!
    echo "Electron app PID: $ELECTRON_PID"
    cd ../..
}

# Function to start iOS app
start_ios() {
    echo "📱 Starting iOS App..."
    cd packages/container-app
    npm run build
    npx cap sync ios
    npx cap run ios &
    cd ../..
}

# Check if web app is already running
if check_port 5176; then
    echo "✅ Web app already running on port 5176"
elif check_port 5175; then
    echo "✅ Web app already running on port 5175"
else
    start_web
    sleep 3  # Wait for web app to start
fi

# Start Electron app
start_electron

echo ""
echo "🎉 All platforms started!"
echo ""
echo "📱 iOS App: Running in iOS Simulator"
echo "💻 Mac App: Running in Electron window"
echo "🌐 Web App: http://localhost:5176 (or 5175)"
echo ""
echo "All platforms use the same React.js codebase!"
echo ""
echo "To stop all apps, press Ctrl+C"
echo ""

# Wait for user to stop
wait
