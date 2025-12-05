#!/bin/bash

# Production Build Script for Firebase Hosting
# This script builds the app with static export for Firebase deployment

echo "🚀 Building for Firebase Hosting..."

# Step 1: Temporarily enable static export
echo "📝 Configuring for static export..."
cat > next.config.temp.ts << 'EOF'
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
EOF

# Backup original config
cp next.config.ts next.config.backup.ts

# Use production config
mv next.config.temp.ts next.config.ts

# Step 2: Build
echo "🔨 Building Next.js application..."
npm run build

BUILD_STATUS=$?

# Step 3: Restore original config
echo "🔄 Restoring development config..."
mv next.config.backup.ts next.config.ts

if [ $BUILD_STATUS -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Static files are in the 'out' directory"
echo ""
echo "Next steps:"
echo "1. Test locally: firebase emulators:start"
echo "2. Deploy: firebase deploy --only hosting"
