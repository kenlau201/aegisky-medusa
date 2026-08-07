#!/bin/bash
# ============================================================
# Aegisky Medusa - SSL Certificate Setup (Let's Encrypt)
# Sprint 4: Production HTTPS
#
# Run on Linux production server as root
# Requires: nginx, certbot
# ============================================================

set -e

DOMAIN="aegisky.com"
STAGING_DOMAIN="staging.aegisky.com"
EMAIL="admin@aegisky.com"

echo "============================================================"
echo "  Aegisky Medusa - SSL Certificate Setup"
echo "============================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo)"
    exit 1
fi

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "[1/4] Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
else
    echo "[1/4] certbot already installed"
fi

# Create webroot for ACME challenge
echo "[2/4] Setting up ACME challenge directory..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

# Copy nginx config
echo "[3/4] Installing nginx config..."
cp nginx/nginx.conf.prod /etc/nginx/sites-available/aegisky
ln -sf /etc/nginx/sites-available/aegisky /etc/nginx/sites-enabled/aegisky
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Obtain SSL certificate
echo "[4/4] Obtaining SSL certificate for $DOMAIN..."
certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d $STAGING_DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect

# Set up auto-renewal
echo ""
echo "Setting up automatic renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Create staging htpasswd
echo ""
echo "Creating staging basic auth..."
if ! command -v htpasswd &> /dev/null; then
    apt-get install -y apache2-utils
fi
htpasswd -c /etc/nginx/.htpasswd staging

echo ""
echo "============================================================"
echo "  SSL setup complete!"
echo ""
echo "  Production: https://$DOMAIN"
echo "  Staging:    https://$STAGING_DOMAIN"
echo ""
echo "  Certificates auto-renew via certbot.timer"
echo "  Renewal test: certbot renew --dry-run"
echo "============================================================"
