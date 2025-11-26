#!/bin/bash
# Docker build script for Music Player

set -e

echo "🐳 Building Music Player Docker image..."

IMAGE_NAME="music-player"
IMAGE_TAG="${1:-latest}"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

# Build the Docker image
docker build \
  --tag "$FULL_IMAGE_NAME" \
  --progress=plain \
  .

echo "✅ Docker image built successfully: $FULL_IMAGE_NAME"
echo ""
echo "To run the image locally:"
echo "  docker run -p 3000:3000 --env-file .env.production $FULL_IMAGE_NAME"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose -f docker-compose.yml up"
