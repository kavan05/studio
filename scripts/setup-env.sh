#!/bin/bash
# ============================================
# FILE: scripts/setup-env.sh
# Make executable: chmod +x scripts/setup-env.sh
# ============================================

echo "🔧 BizHub API - Environment Setup"
echo "=================================="

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backup created as .env.local.backup"
    cp .env.local .env.local.backup
fi

# Copy from example
if [ ! -f ".env.example" ]; then
    echo "❌ .env.example not found!"
    exit 1
fi

cp .env.example .env.local
echo "✅ Created .env.local from .env.example"

echo ""
echo "📝 Please edit .env.local and fill in your Firebase configuration:"
echo "   1. Go to Firebase Console"
echo "   2. Project Settings > General"
echo "   3. Scroll to 'Your apps' section"
echo "   4. Copy the firebaseConfig values"
echo ""
echo "Required values:"
echo "  - NEXT_PUBLIC_FIREBASE_API_KEY"
echo "  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "  - NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "  - NEXT_PUBLIC_FIREBASE_APP_ID"
echo ""