#!/bin/bash

# Sync Images Across All Micro-Frontends
# This script ensures all apps have the same images

echo "🔄 Syncing images across all micro-frontends..."

# Source directory (container-app has the master images)
SOURCE_DIR="packages/container-app/public"
TARGET_DIRS=(
    "packages/app1-product-list/public"
    "packages/app2-product-detail/public"
)

# Create target directories if they don't exist
for dir in "${TARGET_DIRS[@]}"; do
    mkdir -p "$dir"
done

# Copy all image files
echo "📁 Copying images from $SOURCE_DIR to all micro-frontends..."
for dir in "${TARGET_DIRS[@]}"; do
    echo "  → Copying to $dir"
    cp "$SOURCE_DIR"/image_*.jpg "$dir"/ 2>/dev/null || echo "    No images found in source"
done

echo "✅ Image sync complete!"
echo ""
echo "🌐 Micro-Frontend URLs:"
echo "  Container App: http://localhost:5175"
echo "  App1 (Product List): http://localhost:5173"
echo "  App2 (Product Details): http://localhost:5174"
echo ""
echo "🎯 Test the micro-frontend architecture:"
echo "  1. Visit http://localhost:5175"
echo "  2. Click 'App #1' to load Product List"
echo "  3. Click any product to navigate to Product Details"
echo "  4. Click back button to return to Product List"
