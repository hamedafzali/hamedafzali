#!/bin/bash

# Ubuntu Server Setup Script
# Run this script ONCE on the Ubuntu server to prepare it for deployments

set -e

echo "🔧 Setting up Ubuntu Server for Docker Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Run as ubuntu user with sudo privileges."
   exit 1
fi

print_status "Updating system packages..."
sudo apt-get update

print_status "Installing essential packages..."
sudo apt-get install -y curl wget git unzip htop vim ufw

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Remove old versions
    sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Install dependencies
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up the stable repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Add user to docker group
print_status "Adding user to docker group..."
sudo usermod -aG docker hamed

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5001/tcp
sudo ufw --force enable

# Create project directory
print_status "Creating project directory..."
mkdir -p /home/hamed/profile-website
mkdir -p /home/hamed/profile-website/logs
mkdir -p /home/hamed/profile-website/nginx/ssl
mkdir -p /home/hamed/profile-website/scripts

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/profile-website > /dev/null << 'EOF'
/home/hamed/profile-website/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 hamed hamed
}
EOF

# Create monitoring script
print_status "Creating monitoring script..."
cat > /home/hamed/profile-website/scripts/monitor.sh << 'EOF'
#!/bin/bash

# Monitoring script for the profile website
PROJECT_DIR="/home/hamed/profile-website"
cd "$PROJECT_DIR"

echo "🔍 System Status - $(date)"
echo "================================"

# Check disk space
echo "📊 Disk Usage:"
df -h | grep -E "(Filesystem|/dev/)"

# Check memory usage
echo ""
echo "💾 Memory Usage:"
free -h

# Check Docker containers
echo ""
echo "🐳 Docker Containers:"
docker-compose ps

# Check container health
echo ""
echo "🏥 Health Check:"
if curl -f http://localhost:5001/api/health &> /dev/null; then
    echo "✅ Application is healthy"
else
    echo "❌ Application is not responding"
fi

# Check recent logs
echo ""
echo "📋 Recent Logs (last 10 lines):"
docker-compose logs --tail=10 profile-website 2>/dev/null || echo "No logs available"

echo ""
echo "================================"
EOF

chmod +x /home/hamed/profile-website/scripts/monitor.sh

# Create backup script
print_status "Creating backup script..."
cat > /home/hamed/profile-website/scripts/backup.sh << 'EOF'
#!/bin/bash

# Backup script for MongoDB data
PROJECT_DIR="/home/hamed/profile-website"
BACKUP_DIR="/home/hamed/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="portfolio_backup_$DATE.gz"

mkdir -p "$BACKUP_DIR"

echo "💾 Creating MongoDB backup..."

# Create backup
docker-compose exec -T mongodb mongodump --authenticationDatabase admin -u admin -p password123 --db portfolio --gzip --archive="$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_DIR/$BACKUP_FILE"
    
    # Keep only last 7 backups
    cd "$BACKUP_DIR"
    ls -t portfolio_backup_*.gz | tail -n +8 | xargs -r rm
    echo "🧹 Old backups cleaned up"
else
    echo "❌ Backup failed"
    exit 1
fi
EOF

chmod +x /home/hamed/profile-website/scripts/backup.sh

# Create cron jobs
print_status "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/hamed/profile-website/scripts/backup.sh >> /home/hamed/profile-website/logs/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/hamed/profile-website/scripts/monitor.sh >> /home/hamed/profile-website/logs/monitor.log 2>&1") | crontab -

print_status "Cron jobs configured:"
echo "  - Backup: Daily at 2 AM"
echo "  - Monitor: Every 5 minutes"

# Set proper permissions
print_status "Setting permissions..."
sudo chown -R hamed:hamed /home/hamed/profile-website
chmod +x /home/hamed/profile-website/scripts/*.sh

# Create systemd service for auto-restart
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/profile-website.service > /dev/null << 'EOF'
[Unit]
Description=Profile Website Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/hamed/profile-website
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable profile-website.service

print_status "Systemd service created and enabled"

# Display final status
echo ""
print_status "🎉 Ubuntu server setup completed!"
echo ""
echo "📋 Summary:"
echo "  ✅ Docker and Docker Compose installed"
echo "  ✅ Firewall configured (SSH, HTTP, HTTPS, App port)"
echo "  ✅ Project directories created"
echo "  ✅ Monitoring and backup scripts created"
echo "  ✅ Cron jobs configured"
echo "  ✅ Systemd service enabled"
echo ""
echo "🔧 Next steps:"
echo "  1. Log out and log back in to apply docker group changes"
echo "  2. Run 'docker --version' to verify Docker installation"
echo "  3. Run 'docker-compose --version' to verify Docker Compose"
echo "  4. Deploy the application using the deploy-remote.sh script"
echo ""
echo "📁 Important directories:"
echo "  - Project: /home/hamed/profile-website"
echo "  - Logs: /home/hamed/profile-website/logs"
echo "  - Backups: /home/hamed/backups"
echo ""
echo "🔍 Monitoring commands:"
echo "  - Check status: /home/hamed/profile-website/scripts/monitor.sh"
echo "  - Create backup: /home/hamed/profile-website/scripts/backup.sh"
echo "  - View logs: tail -f /home/hamed/profile-website/logs/monitor.log"
