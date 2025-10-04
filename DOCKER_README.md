# Stock Market Sentiment Analysis - Docker Setup

This project includes Docker configuration to run both the FastAPI backend and Next.js frontend in separate containers.

## 🐳 Docker Architecture

- **Backend Container**: FastAPI server with sentiment analysis model (Port 8000)
- **Frontend Container**: Next.js application (Port 3000)
- **Network**: Custom bridge network for service communication
- **Health Checks**: Automated health monitoring for both services

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose V2 (comes with Docker Desktop)
- At least 4GB RAM available for containers
- Ports 3000 and 8000 available on your system

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository and navigate to project directory
cd "Stock Market Sentiment Analysis"

# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Manual Container Management

```bash
# Build backend image
cd backend
docker build -t sentiment-backend .

# Build frontend image
cd ../frontend
docker build -t sentiment-frontend .

# Create network
docker network create sentiment-analysis-network

# Run backend container
docker run -d \
  --name sentiment-backend \
  --network sentiment-analysis-network \
  -p 8000:8000 \
  sentiment-backend

# Run frontend container
docker run -d \
  --name sentiment-frontend \
  --network sentiment-analysis-network \
  -p 3000:3000 \
  -e BACKEND_URL=http://sentiment-backend:8000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  sentiment-frontend
```

## 🔗 Access URLs

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Development Commands

```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend

# Restart a specific service
docker-compose restart backend

# Rebuild and restart after code changes
docker-compose up --build --force-recreate

# Clean up everything (containers, networks, images)
docker-compose down --rmi all --volumes --remove-orphans

# Shell into a running container
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/sh
```

## 🏗️ Container Details

### Backend Container (FastAPI)

- **Base Image**: python:3.11-slim
- **Dependencies**: FastAPI, PyTorch, Transformers, Uvicorn
- **Model**: Custom FinBERT sentiment analysis model
- **Health Check**: API documentation endpoint
- **Auto-reload**: Enabled for development

### Frontend Container (Next.js)

- **Base Image**: node:18-alpine (multi-stage build)
- **Build**: Optimized production build
- **Security**: Non-root user execution
- **Health Check**: Application homepage
- **Standalone**: Self-contained runtime

## 📊 Monitoring & Health Checks

Both containers include health checks that monitor:

- Backend: API availability on /docs endpoint
- Frontend: Application responsiveness on homepage

Check container health:

```bash
docker-compose ps  # Shows health status
docker inspect <container_name> | grep Health -A 10
```

## 🔧 Configuration

### Environment Variables

Backend `.env` file (optional):

```env
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

Frontend environment (configured in docker-compose.yml):

```env
NODE_ENV=production
BACKEND_URL=http://backend:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Volume Mounts

The docker-compose configuration includes:

- Model directory mounted as read-only for easy updates
- Optional data persistence volumes

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**:

   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8000
   ```

2. **Model loading errors**:

   ```bash
   # Check if model file exists
   docker-compose exec backend ls -la /app/model/
   ```

3. **Network connectivity**:

   ```bash
   # Test backend from frontend container
   docker-compose exec frontend curl http://backend:8000/docs
   ```

4. **Memory issues**:
   ```bash
   # Check Docker resource usage
   docker stats
   ```

### Logs and Debugging

```bash
# View detailed logs
docker-compose logs --follow --tail=100

# Debug specific service
docker-compose logs backend --follow

# Check container resource usage
docker-compose top
```

## 🚀 Production Deployment

For production deployment:

1. **Remove development flags**:

   - Remove `--reload` from backend CMD
   - Ensure NODE_ENV=production

2. **Security enhancements**:

   - Use specific CORS origins instead of "\*"
   - Add authentication middleware
   - Use secrets for sensitive data

3. **Resource limits**:

   ```yaml
   deploy:
     resources:
       limits:
         cpus: "0.5"
         memory: 1G
   ```

4. **Use Docker secrets**:
   ```yaml
   secrets:
     model_key:
       external: true
   ```

## 📝 Notes

- The sentiment analysis model (~500MB) is included in the backend container
- First startup may take longer due to model loading
- Frontend API calls are configured to work with the containerized backend
- All services restart automatically unless stopped manually

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Ensure Docker Desktop is running and has sufficient resources
4. Check container logs for specific error messages
