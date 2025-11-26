#!/bin/bash

# Bytrix API Testing Script
# Gunakan script ini untuk test semua endpoints

set -e

# Configuration
API_BASE_URL="http://localhost:3000"
JWT_TOKEN="${JWT_TOKEN:-your_jwt_token_here}"
FILE_PATH="${FILE_PATH:-./test-file.pdf}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${YELLOW}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Test 1: Health Check
print_header "Test 1: Health Check"
response=$(curl -s -X GET "$API_BASE_URL/health")
if echo "$response" | jq -e '.status == "ok"' > /dev/null; then
    print_success "Health check passed"
    echo "Response: $response"
else
    print_error "Health check failed"
    echo "Response: $response"
    exit 1
fi

# Test 2: API Info
print_header "Test 2: API Info"
response=$(curl -s -X GET "$API_BASE_URL/api/v1")
if echo "$response" | jq -e '.name' > /dev/null; then
    print_success "API info retrieved"
    echo "$response" | jq '.'
else
    print_error "API info retrieval failed"
    echo "Response: $response"
fi

# Test 3: Generate Text (dengan authentication)
print_header "Test 3: Generate Text (GPT)"
response=$(curl -s -X POST "$API_BASE_URL/api/v1/gpt/generate" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "prompt": "Write a short introduction to cloud computing",
        "temperature": 0.7,
        "max_tokens": 150
    }')

if echo "$response" | jq -e '.status == "ok"' > /dev/null 2>&1; then
    print_success "Text generation successful"
    echo "$response" | jq '.'
else
    echo "Response: $response"
    if echo "$response" | grep -q "AUTHENTICATION_ERROR\|Missing"; then
        print_error "Authentication failed. Set JWT_TOKEN environment variable"
    else
        print_error "Text generation failed"
    fi
fi

# Test 4: File Upload (create test file if not exists)
print_header "Test 4: File Upload"
if [ ! -f "$FILE_PATH" ]; then
    echo "Creating test file..."
    echo "This is a test file for upload testing" > test-file.txt
    FILE_PATH="test-file.txt"
fi

response=$(curl -s -X POST "$API_BASE_URL/api/v1/files/upload" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -F "file=@$FILE_PATH")

if echo "$response" | jq -e '.status == "ok"' > /dev/null 2>&1; then
    print_success "File uploaded successfully"
    FILE_ID=$(echo "$response" | jq -r '.data.id')
    echo "$response" | jq '.'
    echo -e "\n${GREEN}File ID: $FILE_ID${NC}"
    
    # Test 5: Get File (menggunakan FILE_ID dari upload)
    print_header "Test 5: Get File Metadata"
    response=$(curl -s -X GET "$API_BASE_URL/api/v1/files/$FILE_ID")
    
    if echo "$response" | jq -e '.status == "ok"' > /dev/null 2>&1; then
        print_success "File metadata retrieved"
        echo "$response" | jq '.'
    else
        print_error "File metadata retrieval failed"
        echo "Response: $response"
    fi
else
    echo "Response: $response"
    if echo "$response" | grep -q "AUTHENTICATION_ERROR"; then
        print_error "Authentication failed. Set JWT_TOKEN environment variable"
    else
        print_error "File upload failed"
    fi
fi

print_header "Testing completed!"
print_success "All tests completed. Check results above."
