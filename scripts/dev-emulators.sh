#!/bin/bash
# ============================================
# FILE: scripts/dev-emulators.sh
# Make executable: chmod +x scripts/dev-emulators.sh
# ============================================

echo "🧪 Starting Firebase Emulators"
echo "=============================="

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found. Please run this from project root."
    exit 1
fi

# Build functions first
echo "🔨 Building functions..."
cd functions
npm run build
cd ..

# Start emulators
echo "🚀 Starting emulators..."
firebase emulators:start
