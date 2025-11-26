#!/bin/bash

# Test script for the enhanced Mistral AI chatbot
# This script tests various query types to verify AI-powered responses

echo "🧪 Testing Enhanced Mistral AI Chatbot"
echo "========================================"
echo ""

BASE_URL="http://localhost:5000"

# Function to test a query
test_query() {
    local query="$1"
    local description="$2"
    
    echo "📝 Test: $description"
    echo "Query: \"$query\""
    echo "Response:"
    
    curl -s -X POST "$BASE_URL/chatbot/message" \
        -H "Content-Type: application/json" \
        -d "{\"userId\": \"test-user\", \"message\": \"$query\"}" | \
        jq -r '.response' | sed 's/^/  /'
    
    echo ""
    echo "---"
    echo ""
}

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 3

# Test 1: Operational Query - Bin Status
test_query "What is the status of bin1?" "Operational Query - Specific Bin Status"

# Test 2: Operational Query - Operator Assignment
test_query "Which bins is the operator managing?" "Operational Query - Operator Assignments"

# Test 3: Operational Query - Natural Language
test_query "Can you tell me about the bins that need emptying?" "Natural Language - Bins Needing Attention"

# Test 4: Operational Query - Comparison
test_query "Which bin is the fullest right now?" "Comparison Query - Fullest Bin"

# Test 5: Environmental Query
test_query "How can I reduce plastic waste at home?" "Environmental Query - Waste Reduction"

# Test 6: Mixed Query
test_query "Which bins are critical and what should I do about recycling?" "Mixed Query - Operational + Environmental"

# Test 7: Natural Variation
test_query "Hey, can you give me a quick overview of all the bins?" "Natural Language Variation"

# Test 8: Environmental - Composting
test_query "What are the best practices for composting?" "Environmental Query - Composting"

echo "✅ All tests completed!"
echo ""
echo "Note: Make sure the backend server is running with:"
echo "  cd /home/hamzaihsan/Desktop/AISWO_FYP/aiswo-backend"
echo "  node server.js"
