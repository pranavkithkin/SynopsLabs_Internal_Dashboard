#!/bin/bash

# ============================================
# Synops Labs Dashboard - Deployment Script
# Run this to deploy or update the application
# ============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_DIR="/opt/synops-dashboard"
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${BLUE}"
echo "==================================="
echo " Synops Labs Dashboard Deployment"
echo "==================================="
echo -e "${NC}"

# Check if running from correct directory
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}Error: Must run from application directory${NC}"
    echo "Expected location: $APP_DIR"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    echo "Please create .env.production from .env.production.example"
    exit 1
fi

# Check if credentials exist
if [ ! -f "credentials/google-sheets-credentials.json" ]; then
    echo -e "${YELLOW}Warning: Google Sheets credentials not found${NC}"
    echo "Make sure to upload credentials/google-sheets-credentials.json"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}Step 1: Loading environment variables...${NC}"
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${GREEN}Step 2: Pulling latest code from git...${NC}"
git pull origin main || echo -e "${YELLOW}Warning: Could not pull from git${NC}"

echo -e "${GREEN}Step 3: Building Docker images...${NC}"
docker-compose -f $COMPOSE_FILE build --no-cache

echo -e "${GREEN}Step 4: Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down

echo -e "${GREEN}Step 5: Starting new containers...${NC}"
docker-compose -f $COMPOSE_FILE up -d

echo -e "${GREEN}Step 6: Waiting for services to be healthy...${NC}"
sleep 10

# Check service health
echo -e "${BLUE}Checking service status...${NC}"
docker-compose -f $COMPOSE_FILE ps

echo -e "${GREEN}Step 7: Running database migrations (if any)...${NC}"
docker-compose -f $COMPOSE_FILE exec -T backend python -c "
from database.connection import engine, Base
Base.metadata.create_all(bind=engine)
print('Database tables created/verified')
" || echo -e "${YELLOW}Note: Database migration skipped or not needed${NC}"

echo -e "${GREEN}Step 8: Cleaning up old Docker images...${NC}"
docker image prune -f

echo ""
echo -e "${GREEN}==================================="
echo " Deployment Complete!"
echo "===================================${NC}"
echo ""
echo "Your dashboard should now be running at:"
echo -e "${BLUE}https://dashboard.synopslabs.com${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose -f $COMPOSE_FILE logs -f"
echo "  Restart services: docker-compose -f $COMPOSE_FILE restart"
echo "  Stop services:    docker-compose -f $COMPOSE_FILE down"
echo "  Service status:   docker-compose -f $COMPOSE_FILE ps"
echo ""
