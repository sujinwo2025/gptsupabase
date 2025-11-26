#!/bin/bash

# Certbot Auto-Setup Script
# Runs on container startup to auto-generate SSL certificate

set -e

DOMAIN=${DOMAIN:-file.bytrix.my.id}
EMAIL=${EMAIL:-admin@example.com}
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
WEBROOT="/var/www/certbot"

echo "=================================================="
echo "Bytrix Certbot - Auto SSL Setup"
echo "=================================================="
echo ""
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Certificate Path: $CERT_PATH"
echo ""

# Wait for Nginx to be ready
echo "Waiting for Nginx to be ready..."
for i in {1..30}; do
    if nc -z nginx 80 2>/dev/null; then
        echo "✓ Nginx is ready"
        break
    fi
    echo "  Waiting... ($i/30)"
    sleep 1
done

# Check if certificate already exists
if [ -f "$CERT_PATH/fullchain.pem" ]; then
    echo "✓ Certificate already exists"
    echo "Certificate valid until:"
    openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate
else
    echo "Generating new SSL certificate from Let's Encrypt..."
    
    # Generate certificate
    certbot certonly \
        --webroot \
        -w $WEBROOT \
        -d $DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --non-interactive \
        --quiet \
        --expand
    
    if [ -f "$CERT_PATH/fullchain.pem" ]; then
        echo "✓ Certificate generated successfully!"
        echo "Certificate valid until:"
        openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate
    else
        echo "⚠ Certificate generation may have failed, continuing anyway..."
        echo "  Certbot will retry on next renewal cycle"
    fi
fi

echo ""
echo "Starting certificate renewal monitoring..."
echo "=================================================="
echo ""

# Run renewal daemon
trap exit TERM
while :; do
    certbot renew --webroot -w $WEBROOT --quiet --non-interactive
    sleep 12h & wait ${!}
done
