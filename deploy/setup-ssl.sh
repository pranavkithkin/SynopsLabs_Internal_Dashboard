#!/bin/bash

# ============================================
# SSL Certificate Setup with Let's Encrypt
# Run this after DNS is configured
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="dashboard.synopslabs.com"
EMAIL="pranav@synopslabs.com"  # Change this to your email
SSL_DIR="/opt/synops-dashboard/deploy/ssl"

echo -e "${BLUE}"
echo "==================================="
echo " SSL Certificate Setup"
echo "==================================="
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

echo -e "${GREEN}Step 1: Checking DNS configuration...${NC}"
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
SERVER_IP=$(curl -s ifconfig.me)

echo "Domain IP: $DOMAIN_IP"
echo "Server IP: $SERVER_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo -e "${YELLOW}Warning: DNS not pointing to this server yet${NC}"
    echo "Please update your DNS records and wait for propagation"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}Step 2: Stopping nginx if running...${NC}"
docker-compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true

echo -e "${GREEN}Step 3: Obtaining SSL certificate...${NC}"
certbot certonly --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

echo -e "${GREEN}Step 4: Copying certificates to deployment directory...${NC}"
mkdir -p $SSL_DIR
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/
chmod 644 $SSL_DIR/*.pem

echo -e "${GREEN}Step 5: Setting up auto-renewal...${NC}"
# Create renewal hook
cat > /etc/letsencrypt/renewal-hooks/deploy/synops-dashboard.sh << 'EOF'
#!/bin/bash
cp /etc/letsencrypt/live/dashboard.synopslabs.com/fullchain.pem /opt/synops-dashboard/deploy/ssl/
cp /etc/letsencrypt/live/dashboard.synopslabs.com/privkey.pem /opt/synops-dashboard/deploy/ssl/
cd /opt/synops-dashboard && docker-compose -f docker-compose.prod.yml restart nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/synops-dashboard.sh

# Test renewal
certbot renew --dry-run

echo ""
echo -e "${GREEN}==================================="
echo " SSL Setup Complete!"
echo "===================================${NC}"
echo ""
echo "Certificates are stored in: $SSL_DIR"
echo "Auto-renewal is configured and will run automatically"
echo ""
echo "You can now start nginx with:"
echo "  docker-compose -f docker-compose.prod.yml up -d nginx"
echo ""
