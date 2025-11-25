# Synops Labs Dashboard - Deployment Guide

Complete guide for deploying the Synops Labs Dashboard to any cloud provider.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Local Testing](#local-testing)
4. [Cloud Provider Setup](#cloud-provider-setup)
5. [Initial Deployment](#initial-deployment)
6. [Update Workflow](#update-workflow)
7. [SSL/HTTPS Setup](#ssl-https-setup)
8. [Monitoring & Logs](#monitoring--logs)
9. [Backup Strategy](#backup-strategy)
10. [Troubleshooting](#troubleshooting)
11. [Migration Guide](#migration-guide)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Git repository with dashboard code
- ✅ Domain name (dashboard.synopslabs.com)
- ✅ Google Sheets credentials JSON file
- ✅ OpenAI API key
- ✅ Cloud server (GCP, AWS, Hostinger, or any VPS)
- ✅ Basic SSH knowledge

---

## Quick Start

**The simplest deployment workflow:**

```bash
# On your local machine
1. Make changes to code
2. git add . && git commit -m "Update"
3. git push origin main

# On your server (one-time setup)
4. Run: sudo ./deploy/setup.sh
5. Configure .env.production
6. Run: sudo ./deploy/setup-ssl.sh
7. Run: ./deploy/deploy.sh

# On your server (updates)
8. Run: ./deploy/update.sh
```

---

## Local Testing

Before deploying to production, test locally with Docker:

### 1. Build and run locally

```bash
# Build images
docker-compose build

# Start all services
docker-compose up

# Access dashboard
open http://localhost:3000
```

### 2. Test the full stack

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Database**: localhost:5432

### 3. Stop when done

```bash
docker-compose down
```

---

## Cloud Provider Setup

Choose your cloud provider and follow the setup:

### Option 1: Google Cloud Platform (GCP)

**Recommended for using your $300 credit:**

```bash
# 1. Create a GCP account and enable billing
# 2. Create a new VM instance
gcloud compute instances create synops-dashboard \
  --machine-type=e2-small \
  --zone=us-central1-a \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server

# 3. Configure firewall rules
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --target-tags http-server

gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --target-tags https-server

# 4. Get your server IP
gcloud compute instances describe synops-dashboard \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# 5. SSH into the server
gcloud compute ssh synops-dashboard --zone=us-central1-a
```

**Cost estimate:** ~$14/month (e2-small) - lasts ~21 months with $300 credit

### Option 2: AWS EC2

```bash
# 1. Launch EC2 instance (t2.small or t3.small)
# 2. Configure security group:
#    - Allow port 22 (SSH)
#    - Allow port 80 (HTTP)
#    - Allow port 443 (HTTPS)
# 3. Download key pair (.pem file)
# 4. SSH into server:
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-server-ip
```

**Cost estimate:** ~$15/month (t3.small)

### Option 3: Hostinger VPS

```bash
# 1. Purchase VPS plan (KVM 1 or higher)
# 2. Receive server credentials via email
# 3. SSH into server:
ssh root@your-server-ip
```

**Cost estimate:** ~$5-9/month (Best value!)

### Option 4: Any VPS Provider

Requirements:
- **OS**: Ubuntu 20.04 or 22.04
- **RAM**: Minimum 2GB, recommended 4GB
- **CPU**: Minimum 1 core, recommended 2 cores
- **Storage**: Minimum 20GB
- **Ports**: 22, 80, 443 open

---

## Initial Deployment

### Step 1: Configure DNS

Point your domain to your server:

```bash
# A Record:
# Name: dashboard
# Type: A
# Value: YOUR_SERVER_IP
# TTL: 3600
```

Wait 5-15 minutes for DNS propagation. Verify:

```bash
ping dashboard.synopslabs.com
```

### Step 2: SSH into your server

```bash
ssh root@YOUR_SERVER_IP
# or
ssh ubuntu@YOUR_SERVER_IP
```

### Step 3: Run server setup script

```bash
# Download and run setup
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/deploy/setup.sh -o setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

Or manually:

```bash
# Clone repository
cd /opt
git clone YOUR_REPOSITORY_URL synops-dashboard
cd synops-dashboard

# Run setup
sudo ./deploy/setup.sh
```

### Step 4: Upload Google Sheets credentials

From your local machine:

```bash
# Upload credentials file
scp credentials/google-sheets-credentials.json \
  root@YOUR_SERVER_IP:/opt/synops-dashboard/credentials/
```

### Step 5: Create production environment file

```bash
cd /opt/synops-dashboard

# Copy template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Fill in these values:**

```bash
DB_PASSWORD=your_strong_password_here
GOOGLE_SHEETS_ID=your_spreadsheet_id
OPENAI_API_KEY=sk-your-openai-key
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
```

### Step 6: Set up SSL certificates

```bash
# Run SSL setup script
sudo ./deploy/setup-ssl.sh
```

This will:
- Obtain SSL certificate from Let's Encrypt
- Configure auto-renewal
- Set up HTTPS

### Step 7: Deploy the application

```bash
# Run deployment script
./deploy/deploy.sh
```

This will:
- Build Docker images
- Start all containers
- Run database migrations
- Verify health

### Step 8: Verify deployment

```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Visit your dashboard
open https://dashboard.synopslabs.com
```

---

## Update Workflow

**The simple 3-step update process:**

### On your local machine:

```bash
# 1. Make changes
nano components/some-file.tsx

# 2. Commit and push
git add .
git commit -m "Update feature X"
git push origin main
```

### On your server:

```bash
# 3. Quick update (for minor changes)
./deploy/update.sh

# OR full rebuild (for dependency changes)
./deploy/deploy.sh
```

That's it! Your changes are live.

---

## SSL/HTTPS Setup

### Automatic SSL with Let's Encrypt

The `setup-ssl.sh` script handles everything:

```bash
sudo ./deploy/setup-ssl.sh
```

### Manual SSL setup

If you have your own certificates:

```bash
# Copy certificates
cp your-certificate.pem deploy/ssl/fullchain.pem
cp your-private-key.pem deploy/ssl/privkey.pem

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Renewing certificates

Certificates auto-renew. To manually renew:

```bash
sudo certbot renew
sudo ./deploy/setup-ssl.sh
```

---

## Monitoring & Logs

### View logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Check service health

```bash
# Service status
docker-compose -f docker-compose.prod.yml ps

# Resource usage
docker stats

# Disk usage
docker system df
```

### Health check endpoints

```bash
# Frontend
curl http://localhost:3000

# Backend
curl http://localhost:8000/api/auth/login

# Full stack
curl https://dashboard.synopslabs.com
```

---

## Backup Strategy

### Database backups

**Automatic daily backups:**

```bash
# Create backup script
cat > /opt/synops-dashboard/deploy/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/synops-dashboard/backups"
docker-compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U synops_user synops_labs > $BACKUP_DIR/db_backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/synops-dashboard/deploy/backup.sh

# Add to cron
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/synops-dashboard/deploy/backup.sh") | crontab -
```

**Manual backup:**

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U synops_user synops_labs > backup_$(date +%Y%m%d).sql

# Backup credentials
tar -czf credentials_backup.tar.gz credentials/
```

**Restore from backup:**

```bash
# Restore database
cat backup_20250125.sql | docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U synops_user -d synops_labs
```

---

## Troubleshooting

### Containers won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Database connection errors

```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL
```

### SSL certificate errors

```bash
# Check certificate files
ls -la /opt/synops-dashboard/deploy/ssl/

# Re-run SSL setup
sudo ./deploy/setup-ssl.sh

# Check nginx config
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Out of disk space

```bash
# Clean Docker system
docker system prune -a

# Remove old images
docker image prune -a

# Check disk usage
df -h
du -sh /var/lib/docker
```

### Can't access dashboard

```bash
# Check if services are running
docker-compose -f docker-compose.prod.yml ps

# Check firewall
sudo ufw status

# Check DNS
nslookup dashboard.synopslabs.com

# Check nginx logs
docker-compose -f docker-compose.prod.yml logs nginx
```

---

## Migration Guide

### Moving to a different cloud provider

**Process:**

1. **Set up new server** (follow Cloud Provider Setup)
2. **Backup current data** (database + credentials)
3. **Deploy to new server** (follow Initial Deployment)
4. **Restore data** (from backups)
5. **Update DNS** (point to new server IP)
6. **Wait for DNS propagation** (5-60 minutes)
7. **Decommission old server**

**Detailed steps:**

```bash
# On OLD server - Backup
cd /opt/synops-dashboard
./deploy/backup.sh
scp backups/latest_backup.sql new-server:/tmp/

# On NEW server - Setup
sudo ./deploy/setup.sh
# Upload credentials
# Configure .env.production
sudo ./deploy/setup-ssl.sh
./deploy/deploy.sh

# Restore data
cat /tmp/latest_backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U synops_user -d synops_labs

# Update DNS to new server IP
# Wait for propagation

# Test new server
curl https://dashboard.synopslabs.com

# Verify everything works
# Then shut down old server
```

---

## Performance Optimization

### For small instances (1-2GB RAM)

```yaml
# In docker-compose.prod.yml, reduce resource limits:
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

### Enable caching

```bash
# Add to nginx.conf (already configured)
# - Browser caching for static assets
# - Gzip compression
# - Connection keep-alive
```

### Database optimization

```bash
# Inside postgres container
docker-compose -f docker-compose.prod.yml exec postgres psql -U synops_user -d synops_labs

# Analyze tables
ANALYZE;

# Vacuum dead rows
VACUUM;
```

---

## Security Best Practices

1. **Change default passwords** in `.env.production`
2. **Use strong JWT secrets** (generate with `openssl rand -hex 32`)
3. **Keep SSL certificates updated** (auto-renewal configured)
4. **Regular backups** (automated daily)
5. **Update regularly** (follow Update Workflow)
6. **Monitor logs** for suspicious activity
7. **Use firewall** (configured by setup script)
8. **Limit SSH access** (use SSH keys, disable password auth)

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review logs: `docker-compose -f docker-compose.prod.yml logs -f`
3. Contact Synops Labs team

---

**Built with ❤️ by Synops Labs**
