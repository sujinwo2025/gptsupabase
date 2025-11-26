================================================================================
VERCEL DEPLOYMENT GUIDE - Bytrix API
================================================================================

✅ PLATFORM COMPATIBILITY:
   - Ubuntu 18.04+
   - Debian 9+
   - CentOS 7+
   - macOS (Intel/Apple Silicon)
   - Windows (WSL2)
   - Vercel (serverless)

================================================================================
DEPLOYMENT OPTIONS
================================================================================

OPTION 1: Docker Compose (Self-Hosted)
├─ Platforms: Ubuntu 18.04+, Debian 9+, any Linux
├─ Setup: bash init.sh & docker-compose up -d
├─ Cost: $5-20/month (VPS)
├─ SSL: Automatic Let's Encrypt
├─ Renewal: Automatic via Certbot
└─ Status: ✅ PRODUCTION READY

OPTION 2: Vercel (Serverless - Recommended)
├─ Platforms: Web-based deployment
├─ Setup: 3 commands (git + vercel + env)
├─ Cost: FREE tier available (up to 10 requests/sec)
├─ SSL: Automatic via Vercel
├─ Scaling: Automatic
├─ Speed: Global CDN with 300+ edge locations
└─ Status: ✅ PRODUCTION READY

OPTION 3: Hybrid (Docker + Vercel)
├─ API on Vercel (free, auto-scaling)
├─ Database: Supabase (free tier available)
├─ Files: AWS S3 (free tier available)
├─ Cost: FREE or minimal
├─ Scaling: Automatic
└─ Status: ✅ RECOMMENDED FOR NEW PROJECTS

================================================================================
VERCEL DEPLOYMENT (EASIEST)
================================================================================

STEP 1: Prerequisites
─────────────────────────────────────────────────────────────

Install Vercel CLI:
  npm install -g vercel

GitHub account (recommended for automatic deployments)
  https://github.com (free)

STEP 2: Prepare Environment Variables
─────────────────────────────────────────────────────────────

Create a list of your environment variables:

  Required:
    AWS_ACCESS_KEY_ID=your_aws_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret
    AWS_REGION=ap-southeast-1
    AWS_S3_BUCKET=your-bucket-name
    
    SUPABASE_URL=https://xxx.supabase.co
    SUPABASE_ANON_KEY=your_anon_key
    SUPABASE_SERVICE_KEY=your_service_key
    
    GPT_API_KEY=your_openai_key
    GPT_MODEL=gpt-4-turbo-preview

  Optional:
    NODE_ENV=production
    PORT=3000

STEP 3: Deploy to Vercel
─────────────────────────────────────────────────────────────

Option A: Git-based (Recommended)
  1. Push to GitHub:
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/yourname/bytrix-api.git
     git push -u origin main

  2. Import to Vercel:
     vercel --prod
     (Follow prompts to connect GitHub)

  3. Add environment variables in Vercel dashboard:
     - Go to Settings → Environment Variables
     - Add all variables from Step 2
     - Redeploy

Option B: Direct CLI Deploy
  1. Login to Vercel:
     vercel login

  2. Deploy:
     vercel --prod

  3. Add environment variables:
     vercel env add AWS_ACCESS_KEY_ID
     vercel env add AWS_SECRET_ACCESS_KEY
     vercel env add AWS_REGION
     ... (repeat for all variables)

  4. Redeploy:
     vercel --prod

Option C: GitHub Actions (Auto-deploy on push)
  1. Create .github/workflows/deploy.yml:
     
     name: Vercel Deployment
     on:
       push:
         branches: [main]
     jobs:
       deploy:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
           - uses: vercel/action@master
             with:
               vercel-token: ${{ secrets.VERCEL_TOKEN }}
               vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
               vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
               prod: true
               env: |
                 AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}
                 AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}
                 AWS_REGION=ap-southeast-1
                 ... (add all env vars)

  2. Get secrets from Vercel dashboard:
     - Create personal access token
     - Copy Org ID and Project ID
     - Add to GitHub Secrets

  3. Push to trigger deployment

STEP 4: Add Custom Domain (Optional)
─────────────────────────────────────────────────────────────

In Vercel Dashboard:
  1. Go to your project
  2. Settings → Domains
  3. Add domain: file.bytrix.my.id
  4. Update DNS records (Vercel will show exact settings)
  5. Wait 24 hours for DNS propagation

STEP 5: Verify Deployment
─────────────────────────────────────────────────────────────

Check status:
  https://your-project.vercel.app/health
  (or your custom domain)

Expected response:
  {
    "status": "ok",
    "message": "Service is running",
    "environment": "production",
    "timestamp": "2025-11-25T10:30:00.000Z",
    "uptime": 123.456
  }

View logs:
  vercel logs https://your-project.vercel.app --follow

================================================================================
LINUX/UBUNTU/DEBIAN DEPLOYMENT (DOCKER COMPOSE)
================================================================================

STEP 1: OS Compatibility Check
─────────────────────────────────────────────────────────────

Ubuntu 18.04+ / Debian 9+:
  ✅ Tested and verified
  ✅ Full docker-compose support
  ✅ Let's Encrypt via Certbot
  ✅ Automatic SSL renewal

Check your OS:
  cat /etc/os-release
  
Should show:
  Ubuntu 18.04, 20.04, 22.04, or later
  Debian 9, 10, 11, 12, or later

STEP 2: Install Docker & Docker Compose
─────────────────────────────────────────────────────────────

Ubuntu/Debian:
  sudo apt-get update
  sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
  
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-compose

Verify:
  docker --version
  docker-compose --version

STEP 3: One-Click Setup
─────────────────────────────────────────────────────────────

Run setup script:
  cd /path/to/bytrix-api
  bash init.sh file.bytrix.my.id admin@bytrix.my.id

This will:
  ✓ Check dependencies (openssl, docker, docker-compose)
  ✓ Create SSL directories
  ✓ Update .env
  ✓ Update nginx.conf
  ✓ Create temporary certificate
  ✓ Make scripts executable

STEP 4: Deploy
─────────────────────────────────────────────────────────────

Start all services:
  docker-compose up -d

Monitor certificate generation:
  docker-compose logs -f certbot

Wait for message:
  "Successfully received certificate"

STEP 5: Verify
─────────────────────────────────────────────────────────────

Check all services:
  docker-compose ps

Expected output:
  bytrix-api      Up
  bytrix-nginx    Up
  bytrix-certbot  Up
  bytrix-caddy    Up

Test HTTPS:
  curl -k https://file.bytrix.my.id/health

API is live!

================================================================================
VERCEL vs DOCKER COMPARISON
================================================================================

                          VERCEL              DOCKER COMPOSE
────────────────────────────────────────────────────────────────────
Cost                      FREE (small apps)   $5-20/month VPS
Setup Time                5 minutes           15 minutes
Scaling                   Automatic           Manual
SSL Certificate           Vercel managed      Let's Encrypt + Certbot
SSL Renewal               Automatic           Automatic (Certbot)
Downtime for renewal      0 seconds           0 seconds
Database                  External only       External only
File Storage              S3/External only    S3/External only
Response time (global)    ~50ms (CDN)         ~100-500ms
Cold starts               1-2 seconds         Instant
Max request size          4.5MB               Configurable
Custom domain             Yes                 Yes
SSH access                No                  Yes
Monitoring                Built-in            Manual
Backup                    N/A                 Manual

RECOMMENDATION:
─────────────────────────────────────────────────────────────

For PRODUCTION:
  → Use Vercel (FREE, auto-scaling, built-in monitoring)

For MAXIMUM CONTROL:
  → Use Docker Compose (SSH access, custom configuration)

For LEARNING:
  → Use Docker Compose (understand all components)

For HYBRID APPROACH:
  → API on Vercel (free, auto-scaling)
  → Database on Supabase (free tier)
  → Files on S3 (free tier)
  → Total cost: FREE!

================================================================================
TROUBLESHOOTING
================================================================================

VERCEL ISSUES
─────────────────────────────────────────────────────────────

Q: "Cannot find module" error
A: Ensure all dependencies in package.json
   npm install
   vercel --prod

Q: Environment variables not working
A: Go to Vercel Dashboard → Settings → Environment Variables
   Redeploy after adding
   vercel --prod

Q: Timeout errors (>60 seconds)
A: Vercel serverless has 60 second limit for default plan
   Consider Vercel Pro or use Docker Compose
   Upgrade to higher tier if needed

Q: File upload fails
A: Check AWS S3 credentials in environment variables
   Max upload size: 4.5MB on Vercel
   Use S3 pre-signed URLs for larger files

Q: Database connection fails
A: Verify Supabase URL and keys
   Check firewall allows Vercel IP ranges
   Test locally first with same credentials

DOCKER COMPOSE ISSUES
─────────────────────────────────────────────────────────────

Q: Certificate not generating (Ubuntu/Debian)
A: Check DNS resolution:
   nslookup file.bytrix.my.id
   Wait 30 seconds: docker-compose logs certbot
   If still failing: check port 80/443 not blocked

Q: init.sh fails with permission denied
A: Make executable:
   chmod +x init.sh
   Then run: bash init.sh

Q: "command not found: openssl"
A: Install openssl:
   Ubuntu/Debian: sudo apt-get install openssl

Q: Port 80/443 already in use
A: Check what's using it:
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   Stop conflicting service or change ports

Q: Docker permission denied
A: Add user to docker group:
   sudo usermod -aG docker $USER
   newgrp docker
   Log out and log back in

================================================================================
MIGRATION BETWEEN PLATFORMS
================================================================================

From Docker Compose to Vercel:
─────────────────────────────────────────────────────────────

1. Backup Docker environment:
   docker-compose exec bytrix-api env > backup.env

2. Prepare for Vercel:
   - Extract same env vars
   - Ensure Supabase & S3 are accessible from internet
   - Test connectivity

3. Deploy to Vercel:
   vercel --prod

4. Add environment variables:
   vercel env add VAR_NAME

5. Verify:
   curl https://your-project.vercel.app/health

6. Keep Docker as backup:
   docker-compose up -d
   (Keep running for fallback)

From Vercel to Docker Compose:
─────────────────────────────────────────────────────────────

1. Export Vercel environment:
   Vercel Dashboard → Settings → Environment Variables
   Copy all variables

2. Create .env locally:
   Paste variables

3. Run setup:
   bash init.sh file.bytrix.my.id admin@bytrix.my.id

4. Deploy:
   docker-compose up -d

5. Test:
   curl -k https://file.bytrix.my.id/health

6. Disable Vercel:
   Vercel Dashboard → Settings → Production Deployment
   Pause deployment (optional)

================================================================================
MONITORING & LOGGING
================================================================================

Vercel:
  Dashboard: https://vercel.com/dashboard
  Logs: vercel logs --follow
  Performance: Built-in analytics
  Alerts: Email on errors

Docker Compose:
  View logs: docker-compose logs
  Follow logs: docker-compose logs -f
  Specific service: docker-compose logs -f certbot
  Export logs: docker-compose logs > app.log

================================================================================
PRODUCTION CHECKLIST
================================================================================

BEFORE GOING LIVE:

Vercel:
  ☐ Environment variables set
  ☐ Custom domain configured
  ☐ DNS propagated (24 hours)
  ☐ Health endpoint verified
  ☐ SSL certificate valid
  ☐ Monitoring enabled
  ☐ Backup plan ready

Docker Compose:
  ☐ OS version confirmed (Ubuntu 18.04+, Debian 9+)
  ☐ Docker installed and verified
  ☐ init.sh executed successfully
  ☐ docker-compose up -d runs without errors
  ☐ All 4 services show "Up"
  ☐ Certificate generated (certbot logs)
  ☐ HTTPS working
  ☐ Auto-renewal scheduled
  ☐ Firewall allows 80/443
  ☐ DNS resolution verified
  ☐ Backup DNS record created
  ☐ Monitoring enabled

================================================================================
SUPPORT RESOURCES
================================================================================

Documentation:
  QUICK_START.md
  ONE_CLICK_DEPLOYMENT.md
  SSL_SETUP_GUIDE.md
  README.md

Official Docs:
  Vercel: https://vercel.com/docs
  Docker: https://docs.docker.com
  Docker Compose: https://docs.docker.com/compose
  Let's Encrypt: https://letsencrypt.org/getting-started
  Certbot: https://certbot.eff.org/docs

Community:
  Docker Hub: https://hub.docker.com
  Stack Overflow: tag [docker] [vercel]
  GitHub Issues: Check project repo

================================================================================
QUICK REFERENCE
================================================================================

VERCEL DEPLOY:
  vercel --prod

VERCEL LOGS:
  vercel logs --follow

DOCKER DEPLOY:
  bash init.sh file.bytrix.my.id admin@bytrix.my.id
  docker-compose up -d

DOCKER LOGS:
  docker-compose logs -f

DOCKER STATUS:
  docker-compose ps

DOCKER RESTART:
  docker-compose restart

TEST API:
  curl -k https://file.bytrix.my.id/health

================================================================================
