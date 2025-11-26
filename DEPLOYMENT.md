# Production Deployment Guide

## Overview

Panduan lengkap untuk men-deploy aplikasi Bytrix API ke production environment.

---

## Option 1: Deploy ke VPS/Server Lokal

### Prerequisites
- Server dengan OS Linux (Ubuntu 20.04+) atau Windows Server
- Node.js LTS v18+
- Reverse proxy (Nginx atau Apache)
- SSL certificate (Let's Encrypt)
- Process manager (PM2)

### Step 1: Setup Server

#### Ubuntu/Linux:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Verify installations
node --version
npm --version
pm2 --version
```

### Step 2: Transfer Project to Server

```bash
# Option A: Using Git
cd /home/username
git clone <your-repo-url> bytrix-api
cd bytrix-api

# Option B: Using SCP
scp -r . username@server-ip:/home/username/bytrix-api
```

### Step 3: Install & Configure

```bash
cd /home/username/bytrix-api

# Install dependencies
npm install

# Setup .env file
cp .env.example .env
nano .env  # Edit dengan nilai production Anda
```

### Step 4: Start Application with PM2

```bash
# Start application
pm2 start src/index.js --name "bytrix-api" --env production

# Make it auto-start on server reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs bytrix-api
```

### Step 5: Setup Nginx Reverse Proxy

Create file `/etc/nginx/sites-available/bytrix-api`:

```nginx
upstream bytrix_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name file.bytrix.my.id;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name file.bytrix.my.id;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/file.bytrix.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/file.bytrix.my.id/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;

    # Request limits
    client_max_body_size 100m;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;

    # Proxy settings
    location / {
        proxy_pass http://bytrix_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Disable access to sensitive files
    location ~ /\.env {
        deny all;
    }

    # Logging
    access_log /var/log/nginx/bytrix-api-access.log;
    error_log /var/log/nginx/bytrix-api-error.log;
}
```

Enable site dan test Nginx:
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/bytrix-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Setup SSL Certificate

#### Option A: Cloudflare SSL (Recommended - Fully Automatic)

1. Login ke Cloudflare dashboard
2. Pilih domain `file.bytrix.my.id`
3. Pergi ke **SSL/TLS > Overview**
4. Pastikan **Flexible SSL** atau **Full SSL** sudah aktif (default)
5. Done! Cloudflare auto-issue & renew certificate

**Keuntungan:**
- Fully automatic
- No manual renewal needed
- Free
- Works immediately

#### Option B: Let's Encrypt (Manual Setup)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d file.bytrix.my.id

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

**Note:** Jika pakai Let's Encrypt, uncomment HTTPS block di `nginx.conf`

### Step 7: Monitoring & Logs

```bash
# View PM2 logs
pm2 logs bytrix-api

# View Nginx logs
sudo tail -f /var/log/nginx/bytrix-api-error.log

# Monitor system resources
pm2 monit

# PM2 dashboard
pm2 web  # Access di http://server-ip:9615
```

---

## Option 2: Deploy ke Docker

### Prerequisites
- Docker installed
- Docker Compose (optional)

### Step 1: Create Dockerfile

File sudah included: `Dockerfile`

### Step 2: Build Docker Image

```bash
# Build image
docker build -t bytrix-api:1.0.0 .

# Tag for registry (e.g., Docker Hub)
docker tag bytrix-api:1.0.0 username/bytrix-api:1.0.0
```

### Step 3: Run Container

```bash
# Run container
docker run -d \
  --name bytrix-api \
  -p 3000:3000 \
  --env-file .env \
  -v /data/uploads:/app/uploads \
  bytrix-api:1.0.0

# View logs
docker logs -f bytrix-api

# Stop container
docker stop bytrix-api
```

### Step 4: Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  bytrix-api:
    build: .
    container_name: bytrix-api
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - LOG_LEVEL=info
      - S3_ENDPOINT=${S3_ENDPOINT}
      - S3_REGION=${S3_REGION}
      - S3_ACCESS_KEY=${S3_ACCESS_KEY}
      - S3_SECRET_KEY=${S3_SECRET_KEY}
      - S3_BUCKET=${S3_BUCKET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - GPT_API_KEY=${GPT_API_KEY}
      - GPT_API_URL=${GPT_API_URL}
      - DOMAIN=${DOMAIN}
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network

  nginx:
    image: nginx:latest
    container_name: bytrix-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - bytrix-api
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

Run dengan Docker Compose:
```bash
docker-compose up -d
docker-compose logs -f bytrix-api
```

---

## Option 3: Deploy ke Cloud Platform

### Heroku

```bash
# Login
heroku login

# Create app
heroku create bytrix-api

# Add buildpack
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set S3_ENDPOINT=...
# ... set other variables

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-18 bytrix-api

# Create environment
eb create bytrix-api-prod

# Deploy
eb deploy

# View logs
eb logs
```

### Railway / Render / Vercel

Follow provider-specific documentation untuk setup.

---

## Monitoring & Maintenance

### Health Checks

Setup monitoring untuk uptime:

```bash
# Cron job untuk health check (setiap 5 menit)
*/5 * * * * curl -f https://file.bytrix.my.id/health || mail -s "Bytrix API Down" admin@example.com
```

### Log Rotation

Setup logrotate untuk Nginx logs:

```bash
# File: /etc/logrotate.d/bytrix-api
/var/log/nginx/bytrix-api*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d)

# Backup database (if using)
pg_dump $DATABASE_URL > $BACKUP_DIR/db-$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db-$DATE.sql s3://backup-bucket/db-$DATE.sql
```

### Monitoring Tools

**Recommended:**
- **PM2 Monitoring**: `pm2 web`
- **Sentry**: Error tracking
- **DataDog**: Infrastructure monitoring
- **New Relic**: Application monitoring
- **Grafana**: Dashboards

---

## Security Checklist

- ✅ SSL/TLS enabled (HTTPS)
- ✅ Environment variables secured
- ✅ Rate limiting configured
- ✅ CORS properly configured
- ✅ Input validation enabled
- ✅ Database RLS enabled
- ✅ Firewall rules configured
- ✅ Regular backups scheduled
- ✅ Security headers set
- ✅ Logs monitoring active

---

## Performance Optimization

```bash
# Enable gzip compression
# Already configured in Nginx

# Set proper cache headers
# Configure in Express middleware

# Database query optimization
# Use proper indexes in Supabase

# S3 optimization
# Use CloudFront CDN if needed
```

---

## Troubleshooting Deployment

### Application won't start
```bash
pm2 logs bytrix-api --lines 100
node src/index.js  # Manual test
```

### Port already in use
```bash
netstat -tlnp | grep 3000
lsof -i :3000
kill -9 <PID>
```

### SSL certificate issues
```bash
sudo certbot renew --dry-run
sudo certbot certificates
```

### Database connection errors
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY
- Check network connectivity
- Verify JWT token validity

---

## Update & Rollback

### Update to new version
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart application
pm2 restart bytrix-api
```

### Rollback to previous version
```bash
# Revert code
git revert HEAD

# Restart
pm2 restart bytrix-api
```

---

**Version:** 1.0.0  
**Last Updated:** November 2024
