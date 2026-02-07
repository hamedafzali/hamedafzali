#!/bin/bash

# Remote Server Management Script
# This script provides common management operations for the remote deployment

set -e

echo "🛠️  Remote Server Management Script"

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

# Configuration
REMOTE_USER="hamed"
REMOTE_HOST="your-server-ip"  # Replace with your actual server IP
SSH_KEY="$HOME/.ssh/id_rsa"
REMOTE_PATH="/home/hamed/profile-website"

# Parse command line arguments
COMMAND=""
SERVICE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            REMOTE_HOST="$2"
            shift 2
            ;;
        --user)
            REMOTE_USER="$2"
            shift 2
            ;;
        status|logs|restart|stop|start|update|backup|monitor|ssh|clean)
            COMMAND="$1"
            shift
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
done

show_help() {
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Options:"
    echo "  --host HOST     Remote server IP address"
    echo "  --user USER     Remote user (default: hamed)"
    echo ""
    echo "Commands:"
    echo "  status          Show container status"
    echo "  logs            Show application logs"
    echo "  restart         Restart containers"
    echo "  stop            Stop containers"
    echo "  start           Start containers"
    echo "  update          Update and redeploy"
    echo "  backup          Create database backup"
    echo "  monitor         Show system monitoring"
    echo "  ssh             SSH into server"
    echo "  clean           Clean up unused Docker resources"
    echo ""
    echo "Examples:"
    echo "  $0 --host 192.168.1.100 status"
    echo "  $0 --host 192.168.1.100 logs"
    echo "  $0 --host 192.168.1.100 restart"
}

# Validate configuration
if [[ "$REMOTE_HOST" == "your-server-ip" ]]; then
    print_error "Please update REMOTE_HOST with your actual server IP or use --host option"
    exit 1
fi

if [[ -z "$COMMAND" ]]; then
    print_error "Please specify a command"
    show_help
    exit 1
fi

# Function to execute remote commands
execute_remote() {
    ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_PATH && $1"
}

# Function to execute remote commands with sudo
execute_remote_sudo() {
    ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_PATH && sudo $1"
}

# Check SSH connection
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$REMOTE_USER@$REMOTE_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    print_error "Cannot connect to remote server. Please check:"
    echo "  - Server IP is correct: $REMOTE_HOST"
    echo "  - SSH key exists: $SSH_KEY"
    echo "  - SSH key is added to remote server's authorized_keys"
    exit 1
fi

# Execute commands
case "$COMMAND" in
    "status")
        print_header "Container Status"
        execute_remote "docker-compose ps"
        echo ""
        print_status "Health Check:"
        if ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "curl -f http://localhost:5001/api/health" 2>/dev/null; then
            print_status "✅ Application is healthy"
        else
            print_warning "❌ Application is not responding"
        fi
        ;;

    "logs")
        print_header "Application Logs"
        execute_remote "docker-compose logs -f --tail=50"
        ;;

    "restart")
        print_header "Restarting Containers"
        execute_remote "docker-compose restart"
        sleep 10
        print_status "Containers restarted. Checking status..."
        execute_remote "docker-compose ps"
        ;;

    "stop")
        print_header "Stopping Containers"
        execute_remote "docker-compose down"
        print_status "Containers stopped"
        ;;

    "start")
        print_header "Starting Containers"
        execute_remote "docker-compose up -d"
        sleep 10
        print_status "Containers started. Checking status..."
        execute_remote "docker-compose ps"
        ;;

    "update")
        print_header "Updating Application"
        print_status "Pulling latest changes..."
        # This assumes you're using git on the remote server
        execute_remote "git pull origin main 2>/dev/null || echo 'Not a git repository, skipping pull'"
        
        print_status "Rebuilding and restarting containers..."
        execute_remote "docker-compose down"
        execute_remote "docker-compose up --build -d"
        
        sleep 15
        print_status "Update completed. Checking status..."
        execute_remote "docker-compose ps"
        ;;

    "backup")
        print_header "Creating Database Backup"
        execute_remote "./scripts/backup.sh"
        ;;

    "monitor")
        print_header "System Monitoring"
        execute_remote "./scripts/monitor.sh"
        ;;

    "ssh")
        print_header "SSH into Server"
        echo "Connecting to $REMOTE_USER@$REMOTE_HOST..."
        ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST"
        ;;

    "clean")
        print_header "Cleaning Docker Resources"
        execute_remote "docker system prune -f"
        execute_remote "docker volume prune -f"
        execute_remote "docker image prune -f"
        print_status "Docker cleanup completed"
        ;;

    *)
        print_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac

echo ""
print_status "✅ Command completed successfully!"
