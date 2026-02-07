#!/bin/bash

# Docker and Cloudflare Tunnel Setup Script
# This script sets up the Docker container and Cloudflare tunnel for your profile website

set -e

echo "🚀 Setting up Docker and Cloudflare Tunnel for Hamed's Profile Website"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Cloudflare tunnel is installed
if ! command -v cloudflared &> /dev/null; then
    print_warning "Cloudflare tunnel is not installed. Installing..."
    
    # Detect OS and architecture
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [[ $(uname -m) == "x86_64" ]]; then
            wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
            sudo dpkg -i cloudflared-linux-amd64.deb
        else
            wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-386.deb
            sudo dpkg -i cloudflared-linux-386.deb
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if [[ $(uname -m) == "arm64" ]]; then
            brew install cloudflared
        else
            brew install cloudflared
        fi
    else
        print_error "Unsupported OS. Please install cloudflared manually from https://github.com/cloudflare/cloudflared/releases"
        exit 1
    fi
    
    print_status "Cloudflare tunnel installed successfully!"
fi

# Create logs directory
mkdir -p logs

# Build and start Docker container
print_status "Building and starting Docker container..."
docker-compose up --build -d

# Wait for container to be ready
print_status "Waiting for container to be ready..."
sleep 10

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    print_status "Docker container is running successfully!"
else
    print_error "Docker container failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Test local endpoint
print_status "Testing local endpoint..."
if curl -f http://localhost:5001/api/health &> /dev/null; then
    print_status "Local endpoint is working!"
else
    print_warning "Local endpoint not responding yet. Waiting a bit more..."
    sleep 5
    if curl -f http://localhost:5001/api/health &> /dev/null; then
        print_status "Local endpoint is working!"
    else
        print_error "Local endpoint is not responding. Check logs with: docker-compose logs"
        exit 1
    fi
fi

# Cloudflare Tunnel Setup
print_status "Setting up Cloudflare Tunnel..."

# Check if tunnel already exists
if cloudflared tunnel list | grep -q "hamed-profile-tunnel"; then
    print_warning "Tunnel 'hamed-profile-tunnel' already exists. Skipping tunnel creation."
else
    print_status "Creating Cloudflare tunnel..."
    cloudflared tunnel create hamed-profile-tunnel
    print_status "Tunnel created successfully!"
fi

# Get tunnel credentials
print_status "Getting tunnel credentials..."
cloudflared tunnel route dns hamed-profile-tunnel your-domain.com  # Replace with your actual domain

print_status "Setup completed successfully!"
echo ""
echo "🎉 Your profile website is now running in Docker!"
echo ""
echo "📋 Next Steps:"
echo "1. Update 'your-domain.com' in cloudflare-tunnel.yml with your actual domain"
echo "2. Run the tunnel with: cloudflared tunnel --config cloudflare-tunnel.yml run"
echo "3. Your website will be accessible at your domain"
echo ""
echo "🔧 Useful Commands:"
echo "- View logs: docker-compose logs -f"
echo "- Stop container: docker-compose down"
echo "- Restart container: docker-compose restart"
echo "- Check container status: docker-compose ps"
echo ""
echo "🌐 Local URL: http://localhost:5001"
echo "🌐 Tunnel URL: https://your-domain.com (after setting up tunnel)"
