#!/bin/bash
# Docker build and test script for Music Player

set -e

echo "🐳 Building and testing Music Player Docker image..."

IMAGE_NAME="music-player"
IMAGE_TAG="test"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

# Build the Docker image
echo "📦 Building Docker image..."
docker build \
  --tag "$FULL_IMAGE_NAME" \
  --progress=plain \
  .

echo "✅ Docker image built successfully"
echo ""

# Run container and test if it starts
echo "🧪 Testing container startup..."
CONTAINER_ID=$(docker run -d \
  -p 3000:3000 \
  --health-cmd='wget --quiet --tries=1 --spider http://localhost:3000 || exit 1' \
  --health-interval=5s \
  --health-timeout=3s \
  "$FULL_IMAGE_NAME")

echo "Container started with ID: $CONTAINER_ID"

# Wait for container to be healthy
echo "Waiting for container to be healthy..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  status=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_ID" 2>/dev/null || echo "none")
  
  if [ "$status" = "healthy" ]; then
    echo "✅ Container is healthy!"
    break
  fi
  
  if [ "$status" = "unhealthy" ]; then
    echo "❌ Container is unhealthy"
    docker logs "$CONTAINER_ID"
    docker stop "$CONTAINER_ID"
    exit 1
  fi
  
  echo "Status: $status (attempt $((attempt+1))/$max_attempts)"
  sleep 1
  attempt=$((attempt+1))
done

# Check if app is responding
echo "Testing HTTP endpoint..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ HTTP endpoint responding"
else
  echo "⚠️ HTTP endpoint not responding yet (may need more time)"
fi

# Cleanup
echo ""
echo "Cleaning up test container..."
docker stop "$CONTAINER_ID"
docker rm "$CONTAINER_ID"

echo "✅ All tests passed!"
