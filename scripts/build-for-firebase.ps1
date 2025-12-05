# Production Build Script for Firebase Hosting (Windows)
# This script builds the app with static export for Firebase deployment

Write-Host "🚀 Building for Firebase Hosting..." -ForegroundColor Green

# Step 1: Temporarily enable static export
Write-Host "📝 Configuring for static export..." -ForegroundColor Yellow

$productionConfig = @"
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
"@

# Backup original config
Copy-Item "next.config.ts" "next.config.backup.ts" -Force

# Write production config
Set-Content "next.config.ts" $productionConfig

# Step 2: Build
Write-Host "🔨 Building Next.js application..." -ForegroundColor Yellow
npm run build

$buildStatus = $LASTEXITCODE

# Step 3: Restore original config
Write-Host "🔄 Restoring development config..." -ForegroundColor Yellow
Move-Item "next.config.backup.ts" "next.config.ts" -Force

if ($buildStatus -ne 0) {
  Write-Host "❌ Build failed!" -ForegroundColor Red
  exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "📁 Static files are in the 'out' directory" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test locally: firebase emulators:start"
Write-Host "2. Deploy: firebase deploy --only hosting"
