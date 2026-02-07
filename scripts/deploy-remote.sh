#!/bin/bash

# Remote Docker Deployment Script
# This script deploys the application to a remote Ubuntu server

set -e

echo "🚀 Remote Docker Deployment for Hamed's Profile Website"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Configuration - Update these values
REMOTE_USER="hamed"
REMOTE_HOST="your-server-ip"  # Replace with your Ubuntu server IP
REMOTE_PATH="/home/hamed/profile-website"
SSH_KEY="$HOME/.ssh/id_rsa"   # Update with your SSH key path
PROJECT_NAME="profile-website"

# Parse command line arguments
SKIP_BUILD=false
SKIP_DB=false
SKIP_NGINX=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-db)
            SKIP_DB=true
            shift
            ;;
        --skip-nginx)
            SKIP_NGINX=true
            shift
            ;;
        --host)
            REMOTE_HOST="$2"
            shift 2
            ;;
        --user)
            REMOTE_USER="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate configuration
if [[ "$REMOTE_HOST" == "your-server-ip" ]]; then
    print_error "Please update REMOTE_HOST with your actual server IP"
    exit 1
fi

print_header "Configuration"
print_status "Remote User: $REMOTE_USER"
print_status "Remote Host: $REMOTE_HOST"
print_status "Remote Path: $REMOTE_PATH"
print_status "SSH Key: $SSH_KEY"
echo ""

# Function to execute remote commands
execute_remote() {
    ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "$1"
}

# Function to copy files to remote
copy_to_remote() {
    scp -i "$SSH_KEY" -r "$1" "$REMOTE_USER@$REMOTE_HOST:$2"
}

# Check SSH connection
print_header "Checking SSH Connection"
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$REMOTE_USER@$REMOTE_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    print_error "Cannot connect to remote server. Please check:"
    echo "  - Server IP is correct: $REMOTE_HOST"
    echo "  - SSH key exists: $SSH_KEY"
    echo "  - SSH key is added to remote server's authorized_keys"
    echo "  - Server is accessible"
    exit 1
fi
print_status "SSH connection successful!"
echo ""

# Prepare local files
print_header "Preparing Local Files"

# Create deployment package
DEPLOY_DIR="./deploy-package"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files
print_status "Creating deployment package..."
cp -r frontend "$DEPLOY_DIR/"
cp -r backend "$DEPLOY_DIR/"
cp -r scripts "$DEPLOY_DIR/"
cp Dockerfile "$DEPLOY_DIR/"
cp docker-compose.remote.yml "$DEPLOY_DIR/docker-compose.yml"
cp .dockerignore "$DEPLOY_DIR/"
cp mongo-init.js "$DEPLOY_DIR/"
cp .env.example "$DEPLOY_DIR/.env"

# Create nginx directory and config
mkdir -p "$DEPLOY_DIR/nginx"
cat > "$DEPLOY_DIR/nginx/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server profile-website:5001;
    }

    server {
        listen 80;
        server_name _;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name _;

        # SSL configuration (will be updated with actual certificates)
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/health {
            proxy_pass http://app/api/health;
            access_log off;
        }
    }
}
EOF

# Create remote deployment script
cat > "$DEPLOY_DIR/scripts/deploy-on-server.sh" << 'EOF'
#!/bin/bash

# Server-side deployment script
set -e

PROJECT_DIR="/home/hamed/profile-website"
cd "$PROJECT_DIR"

echo "🐳 Deploying on Ubuntu server..."

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Pull latest images (if any)
echo "Pulling latest images..."
docker-compose pull

# Build and start containers
echo "Building and starting containers..."
docker-compose up --build -d

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 15

# Check if containers are running
echo "Checking container status..."
docker-compose ps

# Seed database if it's a fresh deployment
if ! docker-compose exec -T mongodb mongo portfolio --eval "db.getCollectionNames()" | grep -q "projects"; then
    echo "Seeding database..."
    docker-compose exec -T profile-website npm run seed
fi

# Show logs
echo "Showing recent logs..."
docker-compose logs --tail=20

echo "✅ Deployment completed!"
echo "🌐 Application is running on port 5001"
echo "🔗 Check health: curl http://localhost:5001/api/health"
EOF

chmod +x "$DEPLOY_DIR/scripts/deploy-on-server.sh"

print_status "Deployment package created successfully!"
echo ""

# Deploy to remote server
print_header "Deploying to Remote Server"

# Create remote directory
print_status "Creating remote directory..."
execute_remote "mkdir -p $REMOTE_PATH"

# Copy deployment package
print_status "Copying files to remote server..."
scp -i "$SSH_KEY" -r "$DEPLOY_DIR"/* "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

print_status "Files copied successfully!"
echo ""

# Setup remote server
print_header "Setting up Remote Server"

# Check if Docker is installed on remote
if ! execute_remote "command -v docker &> /dev/null"; then
    print_status "Docker not found on remote server. Installing..."
    execute_remote "
        sudo apt-get update
        sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable' | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        sudo usermod -aG docker ubuntu
    "
    print_status "Docker installed on remote server"
fi

# Check if Docker Compose is installed
if ! execute_remote "command -v docker-compose &> /dev/null"; then
    print_status "Docker Compose not found. Installing..."
    execute_remote "
        sudo curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    "
    print_status "Docker Compose installed on remote server"
fi

# Create environment file on remote
print_status "Setting up environment file..."
execute_remote "
    cd $REMOTE_PATH
    if [ ! -f .env ]; then
        cp .env.example .env
        echo 'Please edit .env file on remote server with your configuration'
    fi
"

# Run deployment on remote server
print_header "Running Deployment on Remote Server"
execute_remote "cd $REMOTE_PATH && ./scripts/deploy-on-server.sh"

echo ""
print_header "Deployment Summary"
print_status "✅ Application deployed to $REMOTE_HOST"
print_status "🌐 Local access: http://$REMOTE_HOST:5001"
print_status "🔍 Health check: curl http://$REMOTE_HOST:5001/api/health"

# Show container status
echo ""
print_status "Container status on remote server:"
execute_remote "cd $REMOTE_PATH && docker-compose ps"

echo ""
print_header "Next Steps"
echo "1. SSH into the server: ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST"
echo "2. Edit environment: cd $REMOTE_PATH && nano .env"
echo "3. Restart if needed: docker-compose restart"
echo "4. View logs: docker-compose logs -f"
echo "5. Set up SSL certificates for nginx"
echo ""
print_status "🎉 Remote deployment completed successfully!"
