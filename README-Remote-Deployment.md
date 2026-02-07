# Remote Docker Deployment Guide

This guide explains how to deploy Hamed's Profile Website to a remote Ubuntu server from your local machine.

## 🎯 Overview

Deploy your React/Node.js application to a remote Ubuntu server using Docker containers with automated scripts for easy management.

## 📋 Prerequisites

### Local Machine

- SSH key pair (`~/.ssh/id_rsa`)
- Docker and Docker Compose (for local testing)
- Git

### Remote Server (Ubuntu)

- Ubuntu 20.04 or 22.04
- SSH access with key-based authentication
- At least 2GB RAM
- At least 10GB disk space

## 🚀 Quick Start

### 1. Initial Server Setup (One-time)

SSH into your Ubuntu server and run the setup script:

```bash
# Copy setup script to server
scp scripts/setup-ubuntu-server.sh hamed@your-server-ip:/tmp/
scp scripts/setup-ubuntu-server.sh hamed@192.168.178.46:/tmp/

# SSH into server
ssh hamed@your-server-ip
ssh hamed@192.168.178.46 

# Run setup script
chmod +x /tmp/setup-ubuntu-server.sh
sudo /tmp/setup-ubuntu-server.sh

# Log out and log back in to apply docker group changes
exit
ssh hamed@your-server-ip
```

### 2. Deploy from Local Machine

```bash
# Update configuration in scripts/deploy-remote.sh
nano scripts/deploy-remote.sh

# Deploy to remote server
./scripts/deploy-remote.sh --host your-server-ip
```

### 3. Manage Remote Deployment

```bash
# Check status
./scripts/manage-remote.sh --host your-server-ip status

# View logs
./scripts/manage-remote.sh --host your-server-ip logs

# Restart containers
./scripts/manage-remote.sh --host your-server-ip restart
```

## 📁 File Structure

```
profile-website/
├── scripts/
│   ├── deploy-remote.sh          # Main deployment script
│   ├── setup-ubuntu-server.sh    # One-time server setup
│   └── manage-remote.sh          # Management operations
├── docker-compose.remote.yml    # Remote Docker configuration
├── nginx/
│   └── nginx.conf                # Nginx reverse proxy
└── README-Remote-Deployment.md   # This file
```

## 🔧 Configuration

### Update Deployment Script

Edit `scripts/deploy-remote.sh`:

```bash
# Configuration
REMOTE_USER="hamed"
REMOTE_HOST="your-server-ip"      # Update with your server IP
REMOTE_PATH="/home/hamed/profile-website"
SSH_KEY="$HOME/.ssh/id_rsa"        # Update with your SSH key path
```

### Environment Variables

Create `.env` file on remote server:

```bash
# SSH into server
ssh hamed@your-server-ip

# Edit environment file
nano /home/hamed/profile-website/.env
```

Example `.env`:

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://admin:password123@mongodb:27017/portfolio?authSource=admin
MONGO_ROOT_PASSWORD=password123
CORS_ORIGIN=https://your-domain.com
```

## 🌐 Network Configuration

### Firewall Settings

The setup script configures UFW firewall to allow:

- SSH (port 22)
- HTTP (port 80)
- HTTPS (port 443)
- Application (port 5001)

### SSL/HTTPS Setup

For production, configure SSL certificates:

```bash
# SSH into server
ssh hamed@your-server-ip

# Create SSL directory
mkdir -p /home/hamed/profile-website/nginx/ssl

# Option 1: Self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /home/hamed/profile-website/nginx/ssl/key.pem \
  -out /home/hamed/profile-website/nginx/ssl/cert.pem

# Option 2: Let's Encrypt (recommended for production)
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /home/hamed/profile-website/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /home/hamed/profile-website/nginx/ssl/key.pem
```

## 📊 Monitoring and Maintenance

### Built-in Monitoring

The setup includes automated monitoring:

```bash
# View system status
./scripts/manage-remote.sh --host your-server-ip monitor

# View monitoring logs
ssh hamed@your-server-ip "tail -f /home/hamed/profile-website/logs/monitor.log"
```

### Automated Backups

Daily database backups are configured:

```bash
# Create manual backup
./scripts/manage-remote.sh --host your-server-ip backup

# View backup logs
ssh hamed@your-server-ip "tail -f /home/hamed/profile-website/logs/backup.log"
```

### Log Management

```bash
# View application logs
./scripts/manage-remote.sh --host your-server-ip logs

# View all logs
ssh hamed@your-server-ip "docker-compose logs -f"

# View specific service logs
ssh hamed@your-server-ip "docker-compose logs -f profile-website"
```

## 🛠️ Management Commands

### Using manage-remote.sh

```bash
# Basic operations
./scripts/manage-remote.sh --host your-server-ip status     # Check status
./scripts/manage-remote.sh --host your-server-ip logs       # View logs
./scripts/manage-remote.sh --host your-server-ip restart    # Restart containers
./scripts/manage-remote.sh --host your-server-ip stop       # Stop containers
./scripts/manage-remote.sh --host your-server-ip start      # Start containers

# Advanced operations
./scripts/manage-remote.sh --host your-server-ip update     # Update and redeploy
./scripts/manage-remote.sh --host your-server-ip backup     # Create backup
./scripts/manage-remote.sh --host your-server-ip monitor    # System monitoring
./scripts/manage-remote.sh --host your-server-ip ssh        # SSH into server
./scripts/manage-remote.sh --host your-server-ip clean      # Clean Docker resources
```

### Manual Docker Commands

```bash
# SSH into server
ssh hamed@your-server-ip

# Navigate to project directory
cd /home/hamed/profile-website

# Docker Compose commands
docker-compose ps                    # Check status
docker-compose logs -f               # View logs
docker-compose restart              # Restart containers
docker-compose down                 # Stop containers
docker-compose up -d                # Start containers
docker-compose pull                 # Pull latest images
docker-compose up --build -d        # Build and start
```

## 🔒 Security Considerations

### SSH Security

1. **Use SSH keys only** (disable password authentication)
2. **Change default SSH port** if desired
3. **Use fail2ban** to prevent brute force attacks

```bash
# On remote server
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
```

### Docker Security

1. **Non-root containers**: All containers run as non-root users
2. **Network isolation**: Containers use isolated networks
3. **Resource limits**: Consider adding memory/CPU limits

### Application Security

1. **Environment variables**: Never commit sensitive data
2. **Database authentication**: Use strong passwords
3. **SSL/TLS**: Always use HTTPS in production
4. **Regular updates**: Keep system and containers updated

## 🚨 Troubleshooting

### Common Issues

#### SSH Connection Failed

```bash
# Check SSH key
ssh -i ~/.ssh/id_rsa hamed@your-server-ip

# Add SSH key to agent
ssh-add ~/.ssh/id_rsa
```

#### Docker Permission Denied

```bash
# SSH into server and check docker group
groups hamed

# Add user to docker group if needed
sudo usermod -aG docker hamed
# Log out and log back in
```

#### Container Not Starting

```bash
# Check logs
ssh hamed@your-server-ip "cd /home/hamed/profile-website && docker-compose logs"

# Check disk space
ssh hamed@your-server-ip "df -h"

# Check memory
ssh hamed@your-server-ip "free -h"
```

#### Application Not Responding

```bash
# Check health endpoint
curl http://your-server-ip:5001/api/health

# Check if port is accessible
telnet your-server-ip 5001
```

### Debug Mode

For detailed debugging:

```bash
# Deploy with debug output
./scripts/deploy-remote.sh --host your-server-ip --debug

# View detailed container info
ssh hamed@your-server-ip "docker inspect profile-website"
```

## 📈 Performance Optimization

### Database Optimization

```bash
# MongoDB optimization (on remote server)
ssh hamed@your-server-ip
docker-compose exec mongodb mongo --eval "db.runCommand({compact: 'portfolio'})"
```

### Container Optimization

Add resource limits to `docker-compose.remote.yml`:

```yaml
services:
  profile-website:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
        reservations:
          memory: 256M
          cpus: "0.25"
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to remote server
        run: |
          chmod +x scripts/deploy-remote.sh
          ./scripts/deploy-remote.sh --host ${{ secrets.SERVER_IP }}
        env:
          SERVER_IP: ${{ secrets.SERVER_IP }}
```

## 📞 Support

### Getting Help

1. **Check logs**: Always check application logs first
2. **Verify connectivity**: Ensure server is accessible
3. **Check resources**: Verify disk space and memory
4. **Review configuration**: Check environment variables

### Emergency Recovery

```bash
# Complete reset (last resort)
ssh hamed@your-server-ip
cd /home/hamed/profile-website
docker-compose down -v
docker system prune -a
./scripts/deploy-on-server.sh
```

---

**Note**: This setup is designed for production deployment with security and monitoring in mind. Adjust configurations based on your specific requirements.
