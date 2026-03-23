#!/bin/sh

set -e

echo "Fixing permissions..."
chmod -R 775 /var/www/storage /var/www/bootstrap/cache || true

if [ ! -f /var/www/public/build/manifest.json ]; then
    echo "WARNING: Vite manifest missing at /var/www/public/build/manifest.json"
    echo "Attempting to build assets..."

    if command -v npm >/dev/null 2>&1; then
        cd /var/www
        npm ci
        npm run build
    else
        echo "ERROR: npm not installed in runtime image. Pre-build assets in build stage or install node/npm to runtime."
        exit 1
    fi
fi

echo "Clearing Laravel caches..."
php artisan config:clear || true
php artisan cache:clear || true
php artisan route:clear || true
php artisan view:clear || true

echo "Caching config..."
php artisan config:cache

echo "Running migrations..."
php artisan migrate --force

echo "Starting PHP-FPM..."
php-fpm -D

echo "Starting Nginx..."
nginx -g "daemon off;"