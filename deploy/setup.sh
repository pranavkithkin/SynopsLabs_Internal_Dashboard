#!/bin/bash

# ============================================
# Synops Labs Dashboard - Server Setup Script
# Run this ONCE on a fresh server
# ============================================

set -e  # Exit on error

echo "==================================="
echo "Synops Labs Dashboard - Server Setup"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

echo -e "${GREEN}Step 2: Installing required packages...${NC}"
apt-get install -y \
    curl \
    git \
    wget \
    vim \
    ufw \
    certbot \
    python3-certbot-nginx

echo -e "${GREEN}Step 3: Installing Docker...${NC}"
# Remove old Docker versions
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Start Docker service
systemctl start docker
systemctl enable docker

echo -e "${GREEN}Step 4: Installing Docker Compose...${NC}"
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

echo -e "${GREEN}Step 5: Configuring firewall...${NC}"
# Allow SSH, HTTP, and HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo -e "${GREEN}Step 6: Creating application directories...${NC}"
mkdir -p /opt/synops-dashboard
mkdir -p /opt/synops-dashboard/credentials
mkdir -p /opt/synops-dashboard/logs
mkdir -p /opt/synops-dashboard/backups
mkdir -p /opt/synops-dashboard/deploy/ssl

echo -e "${GREEN}Step 7: Setting up log rotation...${NC}"
cat > /etc/logrotate.d/synops-dashboard << EOF
/opt/synops-dashboard/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
EOF

echo -e "${GREEN}Step 8: Creating deployment user...${NC}"
# Create a deployment user (optional but recommended)
if ! id "synops" &>/dev/null; then
    useradd -m -s /bin/bash synops
    usermod -aG docker synops
    echo -e "${YELLOW}Created user 'synops'. Set password with: passwd synops${NC}"
fi

echo ""
echo -e "${GREEN}==================================="
echo "Server Setup Complete!"
echo "===================================${NC}"
echo ""
echo "Next steps:"
echo "1. Copy your repository to /opt/synops-dashboard"
echo "2. Copy Google Sheets credentials to /opt/synops-dashboard/credentials/"
echo "3. Create .env.production file with your configuration"
echo "4. Set up SSL certificates (see DEPLOYMENT_GUIDE.md)"
echo "5. Run ./deploy/deploy.sh to start the application"
echo ""
echo -e "${YELLOW}IMPORTANT: Don't forget to configure your DNS to point to this server!${NC}"
echo "           dashboard.synopslabs.com -> $(curl -s ifconfig.me)"
echo ""
