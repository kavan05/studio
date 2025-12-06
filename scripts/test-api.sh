#!/bin/bash
echo "🧪 Testing BizHub API Endpoints"
echo "================================"

# Get API URL from user or use default
read -p "Enter your API URL (or press Enter for http://127.0.0.1:5000/v1): " API_URL
if [ -z "$API_URL" ]; then
    API_URL="http://127.0.0.1:5000/v1"
fi

read -p "Enter your API Key (bh_live_...): " API_KEY
if [ -z "$API_KEY" ]; then
    echo "❌ API Key is required. You can get one by signing up in the application."
    exit 1
fi

echo ""
echo "Testing with API URL: $API_URL"
echo "================================"
echo ""

# Test 1: Health Check (does not require API key)
echo "1️⃣  Testing health endpoint..."
curl -s "$API_URL/../health" | jq '.'
echo ""

# Test 2: Search by name
echo "2️⃣  Testing search endpoint (name=maple)..."
curl -s -H "Authorization: Bearer $API_KEY" \
     "$API_URL/businesses/search?name=maple&limit=2" | jq '.'
echo ""

# Test 3: Get stats
echo "3️⃣  Testing stats endpoint..."
curl -s -H "Authorization: Bearer $API_KEY" \
     "$API_URL/stats" | jq '.'
echo ""

# Test 4: Get nearby businesses
echo "4️⃣  Testing nearby endpoint (lat=43.65, lng=-79.38)..."
curl -s -H "Authorization: Bearer $API_KEY" \
     "$API_URL/businesses/nearby?lat=43.65&lng=-79.38&radius=10&limit=5" | jq '.'
echo ""

echo "✅ API tests complete!"
