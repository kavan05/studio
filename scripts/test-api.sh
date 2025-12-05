#!/bin/bash
echo "🧪 Testing BizHub API Endpoints"
echo "================================"

# Get API URL from user or use default
read -p "Enter your API URL (or press Enter for local): " API_URL
if [ -z "$API_URL" ]; then
    API_URL="http://localhost:5001/your-project/us-central1/api/api/v1"
fi

read -p "Enter your API Key: " API_KEY
if [ -z "$API_KEY" ]; then
    echo "❌ API Key is required"
    exit 1
fi

echo ""
echo "Testing endpoint: $API_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
curl -s "$API_URL/../health" | jq '.'
echo ""

# Test 2: Search by name
echo "2️⃣  Testing search endpoint..."
curl -s -H "Authorization: Bearer $API_KEY" \
     "$API_URL/businesses/search?name=maple&limit=2" | jq '.'
echo ""

# Test 3: Get stats
echo "3️⃣  Testing stats endpoint..."
curl -s -H "Authorization: Bearer $API_KEY" \
     "$API_URL/stats" | jq '.'
echo ""

echo "✅ API tests complete!"
