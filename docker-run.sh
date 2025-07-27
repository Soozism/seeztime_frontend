#!/bin/bash

# Simple Docker run script for Ginga Frontend

echo "🚀 Starting Ginga Frontend with Docker..."

# Build the image
echo "📦 Building Docker image..."
docker build -t ginga-frontend .

# Run the container
echo "🏃 Running container..."
docker run -d \
  --name ginga-frontend \
  -p 3000:3000 \
  -e REACT_APP_API_URL=http://185.105.187.118:8000/api/v1 \
  --restart unless-stopped \
  ginga-frontend

echo "✅ Ginga Frontend is running on http://localhost:3000"
echo "🔧 To stop: docker stop ginga-frontend"
echo "🗑️  To remove: docker rm ginga-frontend" 