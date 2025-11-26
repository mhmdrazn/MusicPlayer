# Docker build script for Music Player (Windows PowerShell)

param(
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"

$imageName = "music-player"
$fullImageName = "${imageName}:${ImageTag}"

Write-Host "🐳 Building Music Player Docker image..." -ForegroundColor Green
Write-Host "Image: $fullImageName" -ForegroundColor Cyan

# Build the Docker image
docker build `
  --tag $fullImageName `
  --progress=plain `
  .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker image built successfully: $fullImageName" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the image locally:" -ForegroundColor Yellow
    Write-Host "  docker run -p 3000:3000 --env-file .env.production $fullImageName"
    Write-Host ""
    Write-Host "Or use docker-compose:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.yml up"
} else {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}
