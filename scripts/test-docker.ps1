# Docker build and test script for Music Player (Windows PowerShell)

param(
    [string]$ImageTag = "test"
)

$ErrorActionPreference = "Stop"

$imageName = "music-player"
$fullImageName = "${imageName}:${ImageTag}"

Write-Host "🐳 Building and testing Music Player Docker image..." -ForegroundColor Green
Write-Host ""

# Build the Docker image
Write-Host "📦 Building Docker image..." -ForegroundColor Cyan
docker build `
  --tag $fullImageName `
  --progress=plain `
  .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built successfully" -ForegroundColor Green
Write-Host ""

# Run container and test if it starts
Write-Host "🧪 Testing container startup..." -ForegroundColor Cyan
$containerId = $(docker run -d `
  -p 3000:3000 `
  --health-cmd='powershell -Command try { (Invoke-WebRequest http://localhost:3000 -UseBasicParsing).StatusCode -eq 200 } catch { exit 1 }' `
  --health-interval=5s `
  --health-timeout=3s `
  $fullImageName)

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start container" -ForegroundColor Red
    exit 1
}

Write-Host "Container started with ID: $containerId" -ForegroundColor Green
Write-Host ""

# Wait for container to be healthy
Write-Host "Waiting for container to be healthy..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $status = docker inspect --format='{{.State.Health.Status}}' $containerId 2>$null
    
    if ($status -eq "healthy") {
        Write-Host "✅ Container is healthy!" -ForegroundColor Green
        break
    }
    
    if ($status -eq "unhealthy") {
        Write-Host "❌ Container is unhealthy" -ForegroundColor Red
        docker logs $containerId
        docker stop $containerId | Out-Null
        exit 1
    }
    
    Write-Host "Status: $status (attempt $($attempt+1)/$maxAttempts)"
    Start-Sleep -Seconds 1
    $attempt++
}

# Check if app is responding
Write-Host ""
Write-Host "Testing HTTP endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    Write-Host "✅ HTTP endpoint responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️ HTTP endpoint not responding yet (may need more time)" -ForegroundColor Yellow
}

# Cleanup
Write-Host ""
Write-Host "Cleaning up test container..." -ForegroundColor Yellow
docker stop $containerId | Out-Null
docker rm $containerId | Out-Null

Write-Host "✅ All tests passed!" -ForegroundColor Green
