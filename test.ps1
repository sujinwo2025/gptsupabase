# PowerShell Testing Script untuk Windows
# Simpan sebagai test.ps1 dan jalankan: .\test.ps1

param(
    [string]$ApiUrl = "http://localhost:3000",
    [string]$JwtToken = "your_jwt_token_here",
    [string]$FilePath = ".\test-file.txt"
)

# Helper functions
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Yellow
}

# Test 1: Health Check
Write-Header "Test 1: Health Check"
try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/health" -Method Get
    if ($response.status -eq "ok") {
        Write-Success "Health check passed"
        $response | ConvertTo-Json | Write-Host
    }
}
catch {
    Write-Error "Health check failed: $_"
}

# Test 2: API Info
Write-Header "Test 2: API Info"
try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/v1" -Method Get
    Write-Success "API info retrieved"
    $response | ConvertTo-Json | Write-Host
}
catch {
    Write-Error "API info retrieval failed: $_"
}

# Test 3: Generate Text
Write-Header "Test 3: Generate Text (GPT)"
try {
    $body = @{
        prompt = "Write a short introduction to cloud computing"
        temperature = 0.7
        max_tokens = 150
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$ApiUrl/api/v1/gpt/generate" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $JwtToken"
            "Content-Type" = "application/json"
        } `
        -Body $body

    if ($response.status -eq "ok") {
        Write-Success "Text generation successful"
        $response | ConvertTo-Json | Write-Host
    }
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Error "Authentication failed. Set -JwtToken parameter"
    } else {
        Write-Error "Text generation failed: $_"
    }
}

# Test 4: File Upload
Write-Header "Test 4: File Upload"

# Create test file if not exists
if (-not (Test-Path $FilePath)) {
    Write-Host "Creating test file..."
    "This is a test file for upload testing" | Out-File -FilePath $FilePath
}

try {
    $form = @{
        file = Get-Item -Path $FilePath
    }

    $response = Invoke-WebRequest -Uri "$ApiUrl/api/v1/files/upload" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $JwtToken"
        } `
        -Form $form `
        -ContentType "multipart/form-data"

    $responseBody = $response.Content | ConvertFrom-Json
    
    if ($responseBody.status -eq "ok") {
        Write-Success "File uploaded successfully"
        $fileId = $responseBody.data.id
        $responseBody | ConvertTo-Json | Write-Host
        
        # Test 5: Get File
        Write-Header "Test 5: Get File Metadata"
        try {
            $response = Invoke-RestMethod -Uri "$ApiUrl/api/v1/files/$fileId" -Method Get
            if ($response.status -eq "ok") {
                Write-Success "File metadata retrieved"
                $response | ConvertTo-Json | Write-Host
            }
        }
        catch {
            Write-Error "File metadata retrieval failed: $_"
        }
    }
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Error "Authentication failed. Set -JwtToken parameter"
    } else {
        Write-Error "File upload failed: $_"
    }
}

Write-Header "Testing completed!"
Write-Success "All tests completed. Check results above."
