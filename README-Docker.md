# Docker Production Setup

Simple Docker setup for running Ginga Frontend in production.

## Quick Start

### Option 1: Using Docker Compose (Recommended)
```bash
# Build and run with docker compose
docker compose up -d

# Access the app at http://localhost:3000
```

### Option 2: Using Docker directly
```bash
# Run the provided script
./docker-run.sh

# Or manually:
docker build -t ginga-frontend .
docker run -d --name ginga-frontend -p 3000:3000 -e REACT_APP_API_URL=http://185.105.187.118:8000/api/v1 --restart unless-stopped ginga-frontend
```

### Option 3: Using Docker with custom environment
```bash
# Create your .env file
cp env.example .env
# Edit .env with your API URL

# Run with custom environment
docker run -d --name ginga-frontend -p 3000:3000 --env-file .env --restart unless-stopped ginga-frontend
```

## Environment Variables

- `REACT_APP_API_URL`: Your backend API URL (default: http://185.105.187.118:8000/api/v1)

## Useful Commands

```bash
# Stop the container
docker stop ginga-frontend

# Remove the container
docker rm ginga-frontend

# View logs
docker logs ginga-frontend

# Rebuild and restart
docker compose down
docker compose up -d --build
```

## Production Notes

- The app runs on port 3000 by default
- Uses Node.js and serve for static file hosting
- Supports React Router (SPA routing)
- Environment variable support for API URL 