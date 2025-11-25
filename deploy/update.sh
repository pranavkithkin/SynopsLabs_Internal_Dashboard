#!/bin/bash

# ============================================
# Synops Labs Dashboard - Quick Update Script
# For minor updates without full rebuild
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${BLUE}"
echo "==================================="
echo " Quick Update - Synops Dashboard"
echo "==================================="
echo -e "${NC}"

echo -e "${GREEN}Step 1: Pulling latest code...${NC}"
git pull origin main

echo -e "${GREEN}Step 2: Restarting containers...${NC}"
docker-compose -f $COMPOSE_FILE restart

echo -e "${GREEN}Step 3: Checking status...${NC}"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo -e "${GREEN}Update complete!${NC}"
echo "If you made changes to dependencies, run ./deploy/deploy.sh instead"
echo ""
