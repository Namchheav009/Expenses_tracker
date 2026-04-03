#!/bin/sh

set -e

echo "Starting app..."

echo "DB_CONNECTION=${DB_CONNECTION:-unset}"
echo "DB_HOST=${DB_HOST:-unset}"
echo "DB_PORT=${DB_PORT:-unset}"
echo "DB_DATABASE=${DB_DATABASE:-unset}"
echo "DB_USERNAME=${DB_USERNAME:-unset}"
echo "DB_PASSWORD length: ${#DB_PASSWORD}"
echo "DATABASE_URL=${DATABASE_URL:-unset}"

echo "APP_ENV=${APP_ENV:-unset}"
echo "APP_KEY length: ${#APP_KEY}"
echo "APP_DEBUG=${APP_DEBUG:-unset}"
echo "APP_URL=${APP_URL:-unset}"

# Fix permissions for Laravel runtime
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

# Rebuild config cache using runtime environment vars
echo "Caching config..."
php artisan config:cache

echo "Running migrations..."
php artisan migrate --force

echo "Starting PHP-FPM..."
php-fpm -D

echo "Starting Nginx..."
nginx -g "daemon off;"