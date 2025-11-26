# SSL Auto Setup Guide

## 🚀 Quick Start

### Option 1: Windows (PowerShell)

```powershell
# Run setup script
.\setup-ssl.ps1 -Domain file.bytrix.my.id -Email admin@example.com

# Then start Docker
docker-compose up -d

# Generate certificate
docker-compose exec certbot certbot certonly --webroot -w /var/www/certbot -d file.bytrix.my.id --email admin@example.com --agree-tos --non-interactive

# Check
curl -k https://file.bytrix.my.id/health
```

### Option 2: Linux/macOS (Bash)

```bash
# Run setup script
bash setup-ssl.sh file.bytrix.my.id admin@example.com

# Then start Docker
docker-compose up -d

# Generate certificate
docker-compose exec certbot certbot certonly --webroot -w /var/www/certbot -d file.bytrix.my.id --email admin@example.com --agree-tos --non-interactive

# Check
curl -k https://file.bytrix.my.id/health
```

## 📋 What Happens Automatically

The setup script does:

1. ✅ Creates SSL directory structure
2. ✅ Updates `.env` with your domain
3. ✅ Updates `nginx.conf` with your domain
4. ✅ Creates temporary self-signed certificate
5. ✅ Creates docker-compose env file

## 🐳 Docker Stack

### Services Running:

| Service | Port | Purpose |
|---------|------|---------|
| **bytrix-api** | 3000 | Node.js API (internal) |
| **nginx** | 80, 443 | Reverse proxy with SSL |
| **certbot** | - | Auto SSL renewal |
| **caddy** | 8080, 8443 | Backup reverse proxy |

### SSL Certificate Flow:

```
User Request (HTTPS)
        ↓
   Nginx (Port 443)
        ↓
   Let's Encrypt SSL
        ↓
   Reverse Proxy → Node.js API (3000)
```

### Auto Renewal:

- Certbot checks certificate expiry every 12 hours
- Renews automatically 30 days before expiry
- No manual intervention needed

## 🔄 Switching Between Nginx and Caddy

### Using Nginx (Primary - Port 80/443):
```bash
docker-compose up -d
# Access: https://file.bytrix.my.id
```

### Using Caddy (Backup - Port 8080/8443):
```bash
# Change ports in docker-compose.yml
ports:
  - "80:80"   → "8080:8080"
  - "443:443" → "8443:443"

docker-compose restart caddy
# Access: https://file.bytrix.my.id:8443
```

### Why Two?
- **Nginx**: Lightweight, battle-tested, wide compatibility
- **Caddy**: Simpler config, built-in SSL, auto HTTPS

## 📊 Monitoring

### View Logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f certbot
docker-compose logs -f bytrix-api
docker-compose logs -f caddy
```

### Check SSL Certificate:
```bash
docker-compose exec nginx openssl x509 -in /etc/letsencrypt/live/file.bytrix.my.id/fullchain.pem -text -noout

# Or check expiry only:
docker-compose exec nginx openssl x509 -in /etc/letsencrypt/live/file.bytrix.my.id/fullchain.pem -noout -enddate
```

### Check Services:
```bash
docker-compose ps

# Should show:
# bytrix-api    Up
# bytrix-nginx  Up
# bytrix-certbot Up
# bytrix-caddy  Up
```

## 🔐 Security

### What's Protected:
- ✅ HTTPS/TLS 1.2+
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Auto certificate renewal
- ✅ 100MB upload limit
- ✅ Gzip compression

### SSL Strength:
```
SSL Protocols: TLSv1.2, TLSv1.3
Ciphers: HIGH:!aNULL:!MD5
Session Cache: 10m
```

## 🛠️ Troubleshooting

### Certificate Not Generating?
```bash
# Check DNS first
nslookup file.bytrix.my.id

# Check Certbot logs
docker-compose logs certbot

# Manual renewal
docker-compose exec certbot certbot renew --force-renewal

# Verbose mode
docker-compose exec certbot certbot certonly \
  -w /var/www/certbot \
  -d file.bytrix.my.id \
  --email admin@example.com \
  --agree-tos \
  -vvv
```

### Can't Access HTTPS?
```bash
# Check firewall
ufw status
ufw allow 80/tcp
ufw allow 443/tcp

# Check ports
netstat -tulpn | grep -E ":(80|443)"

# Restart Nginx
docker-compose restart nginx
```

### Domain Not Found?
```bash
# Verify DNS resolution
nslookup file.bytrix.my.id
# Should show your server IP (165.22.244.107)

# Test HTTP to HTTPS redirect
curl -i http://file.bytrix.my.id/health
# Should return 301 redirect
```

### Certificate Renewal Failed?
```bash
# Check renewal logs
docker-compose exec certbot certbot renew --dry-run -v

# Force renewal
docker-compose exec certbot certbot renew --force-renewal -v

# Check certificate validity
docker-compose exec nginx ls -la /etc/letsencrypt/live/file.bytrix.my.id/
```

## 📝 File Structure

```
Groq/
├── docker-compose.yml          # Full stack config
├── nginx.conf                  # Nginx with SSL
├── setup-ssl.sh               # Bash setup script
├── setup-ssl.ps1              # PowerShell setup script
├── .env                        # Main config (auto-updated)
├── .env.docker               # Docker config (auto-generated)
├── caddy/
│   ├── Caddyfile             # Caddy auto-SSL config
│   ├── data/                 # Caddy cert data
│   └── config/               # Caddy config data
└── ssl/
    └── letsencrypt/
        ├── live/
        │   └── file.bytrix.my.id/
        │       ├── fullchain.pem
        │       └── privkey.pem
        └── archive/
```

## 🔗 Useful Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart nginx

# View real-time logs
docker-compose logs -f

# Execute command in container
docker-compose exec nginx sh

# Scale services (if needed)
docker-compose up -d --scale bytrix-api=2

# Remove all containers and volumes
docker-compose down -v

# Update single environment variable
docker-compose exec bytrix-api \
  sh -c "export DOMAIN=new.domain.com && npm start"
```

## ✅ Verification Checklist

- [ ] Domain pointing to server (DNS resolved)
- [ ] Ports 80 and 443 open
- [ ] Docker and Docker Compose installed
- [ ] Setup script ran successfully
- [ ] `docker-compose up -d` started all services
- [ ] Certificate generated (`certbot` logs show success)
- [ ] HTTPS access works: `curl -k https://file.bytrix.my.id/health`
- [ ] Certificate valid: `openssl x509 -in ssl/.../fullchain.pem -noout -text`

## 📞 Support

If something goes wrong:

1. **Check logs**: `docker-compose logs -f`
2. **Verify DNS**: `nslookup file.bytrix.my.id`
3. **Check ports**: `netstat -tulpn | grep -E ":(80|443)"`
4. **Test locally**: `curl -k https://localhost/health`
5. **Review configs**: Check `nginx.conf`, `caddy/Caddyfile`

---

For more details, see `README.md` and `CONFIGURATION.md`
