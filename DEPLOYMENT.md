# 🚀 BizHub API - Deployment Guide

## Prerequisites

- Node.js 20+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created
- Git installed

## Initial Setup (One-time)

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Firebase

```bash
# Login to Firebase
firebase login

# Initialize project (if not done)
firebase init

# Select your project
firebase use --add
# Enter project alias (e.g., "production")
# Select your Firebase project
```

### 3. Set Environment Variables

```bash
# Run setup script
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh

# Edit .env.local with your Firebase config
nano .env.local
# or
code .env.local
```

Get your Firebase config from:
1. Firebase Console
2. Project Settings > General
3. Your apps > Config
4. Copy values to .env.local

## Local Development

### Start Emulators

```bash
# Make script executable
chmod +x scripts/dev-emulators.sh

# Start emulators
./scripts/dev-emulators.sh
```

This will start:
- Auth Emulator: http://localhost:9099
- Functions Emulator: http://localhost:5001
- Firestore Emulator: http://localhost:8080
- Hosting Emulator: http://localhost:5000
- Emulator UI: http://localhost:4000

### Run Next.js Dev Server

In a separate terminal:

```bash
npm run dev
```

Visit: http://localhost:3000

## Production Deployment

### Option 1: Full Deployment (Automated)

```bash
# Make script executable
chmod +x scripts/deploy-all.sh

# Run deployment
./scripts/deploy-all.sh
```

This script will:
1. ✅ Check Firebase authentication
2. ✅ Install dependencies
3. ✅ Build Cloud Functions
4. ✅ Build Next.js app
5. ✅ Deploy Firestore rules
6. ✅ Deploy Firestore indexes
7. ✅ Deploy Cloud Functions
8. ✅ Deploy Hosting

### Option 2: Manual Deployment

```bash
# 1. Build functions
cd functions
npm run build
cd ..

# 2. Build Next.js
npm run build

# 3. Deploy everything
firebase deploy

# Or deploy specific services:
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only functions
firebase deploy --only hosting
```

## Post-Deployment Steps

### 1. Verify Deployment

```bash
# Check function URLs
firebase functions:list

# Check hosting URL
firebase hosting:sites:list
```

### 2. Test API

```bash
# Make test script executable
chmod +x scripts/test-api.sh

# Run tests
./scripts/test-api.sh
```

Or test manually:

```bash
# Get your function URL from Firebase Console
export API_URL="https://us-central1-your-project.cloudfunctions.net/api/api/v1"
export API_KEY="your_api_key_here"

# Test health endpoint
curl "$API_URL/../health"

# Test search endpoint
curl -H "Authorization: Bearer $API_KEY" \
     "$API_URL/businesses/search?name=test"
```

### 3. Create Admin User

In Firebase Console > Firestore:

```javascript
// Create document in 'admins' collection
{
  uid: "your_firebase_auth_uid",
  role: "admin",
  email: "admin@yourdomain.com",
  createdAt: new Date()
}
```

### 4. Trigger Initial Data Sync

Option A - Via Firebase Console:
1. Go to Functions
2. Find `syncBusinessData`
3. Click "Test function"

Option B - Via CLI:
```bash
firebase functions:log --only syncBusinessData
```

Option C - Wait for scheduled run (Sunday 2 AM EST)

## Monitoring

### View Logs

```bash
# All function logs
firebase functions:log

# Specific function
firebase functions:log --only api

# Follow logs in real-time
firebase functions:log --only api --follow
```

### Monitor Performance

1. Firebase Console > Functions
2. Firebase Console > Firestore > Usage
3. Google Cloud Console > Monitoring

## Troubleshooting

### Issue: Functions not deploying

```bash
# Clear functions cache
rm -rf functions/lib
rm -rf functions/node_modules
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### Issue: CORS errors

Check `functions/src/index.ts`:
```typescript
app.use(cors({ origin: true }));
```

### Issue: Firestore indexes not created

```bash
# Deploy indexes explicitly
firebase deploy --only firestore:indexes

# Check index creation status in Firebase Console
```

### Issue: Environment variables not working

```bash
# Verify .env.local exists
ls -la .env.local

# Check Next.js config
cat next.config.ts

# Restart dev server
npm run dev
```

## Rollback

If deployment fails:

```bash
# View deployment history
firebase hosting:channel:list

# Rollback functions
firebase functions:delete functionName

# Redeploy previous version
git checkout <previous-commit>
firebase deploy
```

## Cost Management

### Set Budget Alerts

1. Google Cloud Console
2. Billing > Budgets & alerts
3. Create budget
4. Set alert at 50%, 90%, 100%

### Monitor Usage

```bash
# Firestore usage
firebase firestore:usage

# Functions invocations
# Check Firebase Console > Functions > Usage tab
```

## Security Checklist

- [ ] Firestore rules deployed and tested
- [ ] API keys secured (not in code)
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Admin users created
- [ ] Budget alerts set
- [ ] Monitoring configured

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Monitor function logs
3. ✅ Set up budget alerts
4. ✅ Configure custom domain (optional)
5. ✅ Set up CI/CD (optional)
6. ✅ Add SSL certificate (automatic with Firebase Hosting)

## Support

- Firebase Documentation: https://firebase.google.com/docs
- GitHub Issues: [Your repo URL]
- Email: support@yourdomain.com

---

**🎉 Congratulations! Your BizHub API is now live!**
