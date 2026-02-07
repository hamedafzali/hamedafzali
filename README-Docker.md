# Docker and Cloudflare Tunnel Setup

This guide explains how to run Hamed's Profile Website using Docker and expose it to the internet using Cloudflare Tunnel.

## 🐳 Docker Setup

### Prerequisites
- Docker installed on your system
- Docker Compose installed
- Node.js 18+ (for local development)

### Quick Start

1. **Run the setup script:**
   ```bash
   ./scripts/setup-docker.sh
   ```

2. **Manual setup (if needed):**
   ```bash
   # Build and start the container
   docker-compose up --build -d
   
   # Check if it's running
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

### Docker Configuration Files

- **`Dockerfile`**: Multi-stage build configuration
- **`docker-compose.yml`**: Container orchestration with optional MongoDB
- **`.dockerignore`**: Files to exclude from Docker build
- **`backend/healthcheck.js`**: Container health check

### Container Features

- **Multi-stage build**: Optimized image size
- **Non-root user**: Enhanced security
- **Health checks**: Automatic monitoring
- **Volume mounting**: Persistent logs
- **Environment variables**: Production configuration

## 🌐 Cloudflare Tunnel Setup

### Prerequisites
- Cloudflare account
- Domain registered with Cloudflare
- cloudflared installed (included in setup script)

### Configuration

1. **Update tunnel configuration:**
   Edit `cloudflare-tunnel.yml` and replace `your-domain.com` with your actual domain:
   ```yaml
   ingress:
     - hostname: your-actual-domain.com
       service: http://localhost:5001
   ```

2. **Authenticate with Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```

3. **Create the tunnel:**
   ```bash
   cloudflared tunnel create hamed-profile-tunnel
   ```

4. **Set up DNS:**
   ```bash
   cloudflared tunnel route dns hamed-profile-tunnel your-actual-domain.com
   ```

5. **Start the tunnel:**
   ```bash
   ./scripts/start-tunnel.sh
   ```

### Tunnel Configuration Files

- **`cloudflare-tunnel.yml`**: Tunnel routing configuration
- **`scripts/setup-docker.sh`**: Automated setup script
- **`scripts/start-tunnel.sh`**: Tunnel startup script

## 🗄️ Database Options

### Option 1: Local MongoDB (Recommended for Development)
```bash
# Start with MongoDB
docker-compose --profile mongodb up -d
```

### Option 2: External MongoDB
Update environment variables in `docker-compose.yml`:
```yaml
environment:
  - MONGODB_URI=mongodb://your-external-mongodb:27017/portfolio
```

### Option 3: MongoDB Atlas
Update environment variables:
```yaml
environment:
  - MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
```

## 📋 Environment Variables

Create a `.env` file in the project root:

```env
# Application
NODE_ENV=production
PORT=5001

# Database
MONGODB_URI=mongodb://host.docker.internal:27017/portfolio

# Optional: MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# Optional: CORS settings
CORS_ORIGIN=https://your-domain.com
```

## 🔧 Useful Commands

### Docker Commands
```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Check container status
docker-compose ps

# Execute commands in container
docker-compose exec profile-website npm run seed
```

### Tunnel Commands
```bash
# Start tunnel
./scripts/start-tunnel.sh

# List tunnels
cloudflared tunnel list

# Delete tunnel
cloudflared tunnel delete hamed-profile-tunnel

# Test tunnel
curl https://your-domain.com/api/health
```

## 🌍 Access URLs

- **Local Development**: http://localhost:5001
- **Production (via Tunnel)**: https://your-domain.com
- **Health Check**: http://localhost:5001/api/health

## 🔒 Security Considerations

1. **Use HTTPS**: Cloudflare Tunnel automatically provides HTTPS
2. **Environment Variables**: Never commit sensitive data to Git
3. **Database Security**: Use strong passwords for MongoDB
4. **Container Security**: Running as non-root user
5. **Network Security**: Only expose necessary ports

## 🐛 Troubleshooting

### Container Issues
```bash
# Check container logs
docker-compose logs profile-website

# Check if container is running
docker-compose ps

# Restart container
docker-compose restart profile-website

# Rebuild container
docker-compose up --build --force-recreate
```

### Tunnel Issues
```bash
# Check tunnel status
cloudflared tunnel list

# Test local endpoint
curl http://localhost:5001/api/health

# Check tunnel configuration
cloudflared tunnel ingress validate
```

### Database Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB
docker-compose exec mongodb mongo portfolio

# Seed database
docker-compose exec profile-website npm run seed
```

## 📝 Production Deployment

For production deployment:

1. **Use MongoDB Atlas** instead of local MongoDB
2. **Set up monitoring** with tools like PM2 or Docker health checks
3. **Configure backups** for your database
4. **Set up SSL certificates** (handled by Cloudflare)
5. **Monitor logs** and set up alerts
6. **Use environment variables** for all configuration

## 🔄 CI/CD Integration

You can integrate this setup with CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Build and Deploy
  run: |
    docker-compose up --build -d
    cloudflared tunnel --config cloudflare-tunnel.yml run
```

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify your Cloudflare domain configuration
3. Ensure ports 5001 and 27017 are available
4. Check your internet connection for tunnel access

---

**Note**: This setup is optimized for development and small-scale production. For high-traffic production environments, consider additional scaling and monitoring solutions.
