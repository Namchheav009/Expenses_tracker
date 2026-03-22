#!/bin/bash
# Clear and rebuild caches
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
# Run database migrations
php artisan migrate --force
# Seed admin user (first time only)
php artisan db:seed --class=DatabaseSeeder --force
# Fix permissions
chmod -R 775 /var/www/storage /var/www/bootstrap/cache
# Start services
php-fpm -D
nginx -g "daemon off;"