#!/bin/bash

# Cloudflare Tunnel Start Script
# This script starts the Cloudflare tunnel for your profile website

set -e

echo "🌐 Starting Cloudflare Tunnel for Hamed's Profile Website"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    print_error "Cloudflare tunnel is not installed. Please run setup-docker.sh first."
    exit 1
fi

# Check if Docker container is running
if ! docker-compose ps | grep -q "Up"; then
    print_warning "Docker container is not running. Starting it..."
    docker-compose up -d
    sleep 10
fi

# Check if local endpoint is working
print_status "Checking local endpoint..."
if ! curl -f http://localhost:5001/api/health &> /dev/null; then
    print_error "Local endpoint is not responding. Please check Docker container."
    exit 1
fi

print_status "Local endpoint is working!"

# Check if tunnel config exists
if [ ! -f "cloudflare-tunnel.yml" ]; then
    print_error "cloudflare-tunnel.yml not found. Please create it first."
    exit 1
fi

# Check if credentials file exists
CREDENTIALS_FILE="$HOME/.cloudflared/hamed-profile-tunnel.json"
if [ ! -f "$CREDENTIALS_FILE" ]; then
    print_error "Tunnel credentials file not found at $CREDENTIALS_FILE"
    print_status "Please run: cloudflared tunnel login"
    print_status "Then: cloudflared tunnel create hamed-profile-tunnel"
    exit 1
fi

print_status "Starting Cloudflare tunnel..."
echo "This will expose your local website to the internet via Cloudflare."
echo "Press Ctrl+C to stop the tunnel."
echo ""

# Start the tunnel
cloudflared tunnel --config cloudflare-tunnel.yml run
