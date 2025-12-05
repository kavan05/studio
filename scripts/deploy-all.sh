#!/bin/bash
# ============================================
# FILE: scripts/deploy-all.sh
# Make executable: chmod +x scripts/deploy-all.sh
# ============================================

echo "🚀 BizHub API - Full Deployment Script"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Please install it:${NC}"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
echo -e "${YELLOW}🔐 Checking Firebase authentication...${NC}"
firebase login:list
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Not logged in to Firebase. Running login...${NC}"
    firebase login
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local not found. Please create it from .env.example${NC}"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install root dependencies${NC}"
    exit 1
fi

cd functions
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install function dependencies${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 2: Build Functions
echo -e "${YELLOW}🔨 Building Cloud Functions...${NC}"
cd functions
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build functions${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Functions built${NC}"

# Step 3: Build Next.js
echo -e "${YELLOW}🔨 Building Next.js application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build Next.js app${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Next.js built${NC}"

# Step 4: Deploy Firestore Rules
echo -e "${YELLOW}🔒 Deploying Firestore rules...${NC}"
firebase deploy --only firestore:rules
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to deploy Firestore rules${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Firestore rules deployed${NC}"

# Step 5: Deploy Firestore Indexes
echo -e "${YELLOW}🗂️  Deploying Firestore indexes...${NC}"
firebase deploy --only firestore:indexes
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to deploy Firestore indexes${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Firestore indexes deployed${NC}"

# Step 6: Deploy Functions
echo -e "${YELLOW}☁️  Deploying Cloud Functions...${NC}"
firebase deploy --only functions
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to deploy functions${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Cloud Functions deployed${NC}"

# Step 7: Deploy Hosting
echo -e "${YELLOW}🌐 Deploying to Firebase Hosting...${NC}"
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to deploy hosting${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Hosting deployed${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "========================================"
echo "Your BizHub API is now live!"
echo ""
echo "Next steps:"
echo "1. Visit your Firebase Console to check deployments"
echo "2. Test your API endpoints"
echo "3. Monitor function logs with: firebase functions:log"
echo ""