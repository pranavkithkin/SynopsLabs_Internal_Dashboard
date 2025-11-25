# Quick Deploy Reference

Essential commands for deploying and managing your dashboard.

## 🚀 First Time Setup

```bash
# 1. Configure DNS
# Point dashboard.synopslabs.com to your server IP

# 2. SSH into server
ssh root@YOUR_SERVER_IP

# 3. Clone repository
cd /opt
git clone YOUR_REPOSITORY_URL synops-dashboard
cd synops-dashboard

# 4. Run setup
sudo ./deploy/setup.sh

# 5. Upload credentials
# From local: scp credentials/google-sheets-credentials.json root@IP:/opt/synops-dashboard/credentials/

# 6. Configure environment
cp .env.production.example .env.production
nano .env.production
# Fill in: DB_PASSWORD, GOOGLE_SHEETS_ID, OPENAI_API_KEY, JWT secrets

# 7. Setup SSL
sudo ./deploy/setup-ssl.sh

# 8. Deploy
./deploy/deploy.sh

# 9. Verify
https://dashboard.synopslabs.com
```

## 🔄 Update Workflow

**Local machine:**
```bash
git add .
git commit -m "Update description"
git push origin main
```

**Server:**
```bash
# Quick update (minor changes)
./deploy/update.sh

# Full rebuild (dependency changes)
./deploy/deploy.sh
```

## 📊 Monitoring

```bash
# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs (all services)
docker-compose -f docker-compose.prod.yml logs -f

# View logs (specific service)
docker-compose -f docker-compose.prod.yml logs -f backend

# Resource usage
docker stats

# Disk usage
docker system df
```

## 🔧 Common Commands

```bash
# Restart service
docker-compose -f docker-compose.prod.yml restart backend

# Restart all
docker-compose -f docker-compose.prod.yml restart

# Stop all
docker-compose -f docker-compose.prod.yml down

# Start all
docker-compose -f docker-compose.prod.yml up -d

# Rebuild service
docker-compose -f docker-compose.prod.yml up -d --build backend
```

## 💾 Backup & Restore

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U synops_user synops_labs > backup_$(date +%Y%m%d).sql

# Restore database
cat backup_20250125.sql | docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U synops_user -d synops_labs
```

## 🧹 Cleanup

```bash
# Remove unused images
docker image prune -a

# Clean entire system
docker system prune -a

# View space usage
du -sh /var/lib/docker
```

## 🔐 SSL Management

```bash
# Renew certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Re-run SSL setup
sudo ./deploy/setup-ssl.sh
```

## 🚨 Troubleshooting

```bash
# Service won't start
docker-compose -f docker-compose.prod.yml logs SERVICE_NAME

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check environment variables
docker-compose -f docker-compose.prod.yml exec backend env

# Database connection test
docker-compose -f docker-compose.prod.yml exec backend \
  python -c "from database.connection import engine; print('Connected!' if engine else 'Failed')"

# Check firewall
sudo ufw status

# Check DNS
nslookup dashboard.synopslabs.com
```

## 📱 Health Checks

```bash
# Frontend
curl http://localhost:3000

# Backend
curl http://localhost:8000/api/auth/login

# Full stack
curl https://dashboard.synopslabs.com

# All at once
docker-compose -f docker-compose.prod.yml ps
```

## 🎯 Performance

```bash
# View container stats
docker stats --no-stream

# Check database size
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U synops_user -d synops_labs -c "\l+"

# Optimize database
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U synops_user -d synops_labs -c "VACUUM ANALYZE;"
```

## 📝 Environment Variables

**Required for production `.env.production`:**

```bash
DB_PASSWORD=strong_password
GOOGLE_SHEETS_ID=your_spreadsheet_id
OPENAI_API_KEY=sk-your-key
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
```

## 🌐 GCP Specific

```bash
# Create VM
gcloud compute instances create synops-dashboard \
  --machine-type=e2-small \
  --zone=us-central1-a \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud

# SSH
gcloud compute ssh synops-dashboard --zone=us-central1-a

# Get IP
gcloud compute instances describe synops-dashboard \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

## ⚡ Quick Recovery

**If something breaks:**

```bash
# 1. Check what's wrong
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs

# 2. Restart everything
docker-compose -f docker-compose.prod.yml restart

# 3. Still broken? Rebuild
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Nuclear option
docker-compose -f docker-compose.prod.yml down -v
docker system prune -a -f
./deploy/deploy.sh
```

---

For detailed explanations, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
