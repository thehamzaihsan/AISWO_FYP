#!/bin/bash

# Script to extract Firebase credentials from serviceAccountKey.json
# and display them in a format ready for Vercel environment variables

echo "🔑 Firebase Environment Variables for Vercel"
echo "=============================================="
echo ""
echo "Copy these values to Vercel Dashboard → Settings → Environment Variables"
echo ""

if [ ! -f "serviceAccountKey.json" ]; then
    echo "❌ Error: serviceAccountKey.json not found in current directory"
    echo "Please run this script from the aiswo-backend directory"
    exit 1
fi

echo "📋 FIREBASE_PROJECT_ID:"
jq -r '.project_id' serviceAccountKey.json
echo ""

echo "📋 FIREBASE_PRIVATE_KEY_ID:"
jq -r '.private_key_id' serviceAccountKey.json
echo ""

echo "📋 FIREBASE_CLIENT_EMAIL:"
jq -r '.client_email' serviceAccountKey.json
echo ""

echo "📋 FIREBASE_CLIENT_ID:"
jq -r '.client_id' serviceAccountKey.json
echo ""

echo "📋 FIREBASE_DATABASE_URL:"
echo "https://aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app"
echo ""

echo "📋 FIREBASE_PRIVATE_KEY:"
echo "(Copy the entire private key below, including -----BEGIN and -----END lines)"
echo ""
jq -r '.private_key' serviceAccountKey.json
echo ""

echo "=============================================="
echo "✅ All values extracted!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your aiswo-backend project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add each variable above"
echo "5. Select 'All Environments' for each"
echo "6. Redeploy your project"
