# Quick Start - ONE COMMAND DEPLOYMENT ✅

## 🚀 Choose Your Deployment Platform

### 🟣 OPTION 1: Vercel (Easiest - Recommended for Beginners)

**Best For:** Free hosting, automatic scaling, global CDN

```bash
# Step 1: Install Vercel CLI
npm install -g vercel

# Step 2: Deploy (follow prompts to connect GitHub)
vercel --prod

# Step 3: Add environment variables
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
# ... add all variables

# Step 4: Redeploy
vercel --prod
```

**Total time: ~5 minutes** ⚡  
**Cost:** FREE (up to 10 requests/sec)  
**Features:** Auto-scaling, global CDN, automatic SSL, monitoring included

**✅ API live at:** `https://your-project.vercel.app`  
**📚 Full guide:** See `VERCEL_DEPLOYMENT.md`

---

### 🐳 OPTION 2: Docker Compose - Windows / macOS / Linux

**Best For:** Full control, custom domains, self-hosted

```bash
# Step 1: Run one-click setup (Windows)
.\init.bat file.bytrix.my.id admin@bytrix.my.id

# OR for Linux/macOS:
bash init.sh file.bytrix.my.id admin@bytrix.my.id

# Step 2: Start everything - THAT'S IT!
docker-compose up -d

# Monitor (optional)
docker-compose logs -f
```

**Total time: ~30 seconds** ⚡

## 📋 What Happens Automatically (Docker Compose)

1. ✅ Directories created
2. ✅ .env configured with domain
3. ✅ nginx.conf updated
4. ✅ Docker stack starts (4 services)
5. ✅ Certbot generates SSL certificate
6. ✅ Nginx loads with HTTPS
7. ✅ API running
8. ✅ Auto-renewal scheduled

## ✅ Verify It's Working

```bash
# Check all services
docker-compose ps

# Expected output:
# bytrix-api      Up
# bytrix-nginx    Up
# bytrix-certbot  Up
# bytrix-caddy    Up

# Test HTTPS
curl -k https://file.bytrix.my.id/health

# Should return:
# {"status":"ok","message":"Service is running"}
```

---

## 🔧 Platform Compatibility

| Platform | Status | Setup Time | Cost |
|----------|--------|-----------|------|
| Windows (Docker) | ✅ Tested | 1 minute | Docker Desktop |
| macOS (Docker) | ✅ Tested | 1 minute | Docker Desktop |
| Linux (Docker) | ✅ Tested | 1 minute | Free |
| Ubuntu 18.04+ | ✅ Tested | 1 minute | Free |
| Debian 9+ | ✅ Tested | 1 minute | Free |
| Vercel | ✅ Tested | 5 minutes | FREE |

---

## 📊 What's Auto-Configured

| Component | Status | Port |
|-----------|--------|------|
| Node.js API | ✅ Auto | 3000 (internal) |
| Nginx + SSL | ✅ Auto | 80, 443 |
| Let's Encrypt | ✅ Auto | Generated on startup |
| Certbot Renewal | ✅ Auto | Every 12h |
| Caddy Backup | ✅ Auto | 8080, 8443 |

---

## 🎯 Ubuntu/Debian Linux Setup

### Prerequisites Check

```bash
# Check OS version
cat /etc/os-release

# Should show Ubuntu 18.04+, 20.04+, 22.04+
# OR Debian 9+, 10+, 11+, 12+
```

### Install Dependencies

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Verify
docker --version
docker-compose --version
```

### One-Click Deploy

```bash
# Run setup (creates directories, updates configs)
bash init.sh file.bytrix.my.id admin@bytrix.my.id

# Deploy all services
docker-compose up -d

# Monitor
docker-compose logs -f certbot
```

**That's it! API is live on Ubuntu/Debian too!**

---

## 🌐 Vercel Deployment (Advanced)

### Quick Deploy (Git + Vercel)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Bytrix API"
git push -u origin main

# 2. Deploy to Vercel
vercel --prod
(Follow prompts, choose import from GitHub)

# 3. Add environment variables
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_REGION
... (add all required vars)

# 4. Redeploy
vercel --prod
```

**5 minutes later... API is live on Vercel!**

### Custom Domain on Vercel

```bash
# In Vercel Dashboard:
# 1. Settings → Domains
# 2. Add: file.bytrix.my.id
# 3. Update DNS records (Vercel shows exact settings)
# 4. Wait 24 hours for propagation
```

**Full guide:** See `VERCEL_DEPLOYMENT.md`

---

## 💡 Quick Comparison

```
DOCKER COMPOSE          VERCEL (Serverless)
────────────────────────────────────────────
$5-20/month VPS         FREE (small apps)
Full control            Managed by Vercel
Manual scaling          Auto-scaling
SSH access              No SSH
Custom config           Limited config
SSH access              Web console only
Any OS                  Web-based
```

---

## ⚡ Key Commands

```bash
# DOCKER COMPOSE COMMANDS

# Start everything
docker-compose up -d

# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f certbot    # SSL generation
docker-compose logs -f nginx      # Reverse proxy
docker-compose logs -f bytrix-api # Your API

# Check certificate
docker-compose exec nginx \
  openssl x509 -in /etc/letsencrypt/live/file.bytrix.my.id/fullchain.pem \
  -noout -enddate

# Stop everything
docker-compose down

# Restart specific service
docker-compose restart nginx

# VERCEL COMMANDS

# Deploy
vercel --prod

# View logs
vercel logs --follow

# Add environment variable
vercel env add VARIABLE_NAME

# List deployments
vercel list
```

---

## ✨ Features (All Automatic)

✅ **Let's Encrypt SSL** - Free certificate, auto-generated on startup  
✅ **Auto Renewal** - Renews every 12 hours, 30 days before expiry  
✅ **Zero Downtime** - Nginx auto-reloads new certificates  
✅ **Nginx Reverse Proxy** - Handles HTTPS/HTTP termination  
✅ **Caddy Backup** - Failover option if Nginx fails  
✅ **Docker Compose** - Easy deployment & scaling  
✅ **Vercel Support** - Serverless deployment with CDN  
✅ **Multi-Platform** - Windows, macOS, Linux (Ubuntu 18.04+, Debian 9+)  
✅ **Security Headers** - HSTS, X-Frame-Options, etc.  
✅ **Gzip Compression** - Faster responses  
✅ **HTTP/2** - Modern protocol support  

---

## 🎯 One-Time Setup Commands

### Windows (Docker Compose)
```bash
# Initial setup
.\init.bat file.bytrix.my.id admin@bytrix.my.id

# Deploy
docker-compose up -d

# Done! API is live at https://file.bytrix.my.id
```

### Linux/Ubuntu/Debian (Docker Compose)
```bash
# Initial setup
bash init.sh file.bytrix.my.id admin@bytrix.my.id

# Deploy
docker-compose up -d

# Done! API is live at https://file.bytrix.my.id
```

### Vercel (Serverless)
```bash
# Install CLI
npm install -g vercel

# Deploy
vercel --prod

# Done! API is live at https://your-project.vercel.app
```

---

## 🛠️ Troubleshooting (Usually Not Needed!)

### Docker Compose Issues

**Certificate not generating?**
```bash
docker-compose logs certbot
# Check for domain/DNS issues
# Usually resolves in 30 seconds
```

**Can't reach HTTPS?**
```bash
# Wait a minute and try again
sleep 60
curl -k https://file.bytrix.my.id/health

# If still issues:
docker-compose logs nginx
docker-compose logs bytrix-api
```

**Nginx won't start?**
```bash
docker-compose exec nginx nginx -t
docker-compose logs nginx
docker-compose restart nginx
```

### Linux/Ubuntu/Debian Specific

**init.sh: command not found**
```bash
# Make executable first
chmod +x init.sh
bash init.sh file.bytrix.my.id admin@bytrix.my.id
```

**Missing dependencies**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y docker.io docker-compose openssl

# Check
docker --version
docker-compose --version
```

**Port 80/443 already in use**
```bash
# Check what's using it
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Kill the process or change ports in nginx.conf
```

### Vercel Issues

**Environment variables not working?**
```bash
# Go to Vercel Dashboard → Settings → Environment Variables
# Redeploy after adding:
vercel --prod
```

**"Cannot find module" error?**
```bash
# Ensure dependencies
npm install

# Redeploy
vercel --prod
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `init.bat` / `init.sh` | One-click setup (run once) |
| `docker-compose.yml` | Full stack (4 services) |
| `nginx.conf` | Auto-configured |
| `caddy/Caddyfile` | Auto-configured |
| `.env` | Auto-generated |
| `nginx-entrypoint.sh` | Auto-waits for cert |
| `certbot-entrypoint.sh` | Auto-generates cert |
| `vercel.json` | Vercel configuration |
| `api/index.js` | Vercel serverless handler |
| `VERCEL_DEPLOYMENT.md` | Complete Vercel guide |

---

## ✅ Verification Checklist

After running `docker-compose up -d`:

- [ ] All 4 services show "Up" in `docker-compose ps`
- [ ] No errors in `docker-compose logs`
- [ ] Certbot shows "Successfully received certificate"
- [ ] HTTPS works: `curl -k https://file.bytrix.my.id/health`
- [ ] Certificate is valid (not self-signed after 30 seconds)

After deploying to Vercel:

- [ ] Deployment successful in Vercel dashboard
- [ ] Environment variables set
- [ ] Health endpoint works: `curl https://your-project.vercel.app/health`
- [ ] Custom domain configured (if using custom domain)
- [ ] DNS propagated (24 hours for custom domain)

---

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| `QUICK_START.md` | This file - fast deployment |
| `VERCEL_DEPLOYMENT.md` | Complete Vercel guide + Ubuntu/Debian + Troubleshooting |
| `SSL_SETUP_GUIDE.md` | SSL/certificate details |
| `CONFIGURATION.md` | Configuration options |
| `ONE_CLICK_DEPLOYMENT.md` | Complete automation reference |
| `PHASE9_AUTOMATION_COMPLETE.txt` | Full project status |
| `README.md` | API documentation |

---

## 📞 Support & Resources

For detailed guides:
- `VERCEL_DEPLOYMENT.md` - Vercel setup, Ubuntu/Debian troubleshooting
- `SSL_SETUP_GUIDE.md` - SSL/certificate details
- `CONFIGURATION.md` - Configuration reference
- `README.md` - API documentation

Official Docs:
- Docker: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- Vercel: https://vercel.com/docs
- Let's Encrypt: https://letsencrypt.org
- Certbot: https://certbot.eff.org

---

**That's it!** 🎉

Choose your platform:
- **Beginners:** Use Vercel (5 minutes, FREE)
- **Self-hosted:** Use Docker Compose (1 minute)
- **Linux:** Use Docker Compose (1 minute, fully compatible)

Everything else is automatic! 🚀

