FROM php:8.2-fpm
RUN apt-get update && apt-get install -y \
git curl libpng-dev libonig-dev \
libxml2-dev libpq-dev zip unzip nginx
RUN docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY . .
RUN composer install --no-dev --optimize-autoloader
RUN mkdir -p storage/framework/sessions \
storage/framework/views \
storage/framework/cache \
storage/logs bootstrap/cache
RUN chown -R www-data:www-data /var/www
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache
COPY nginx.conf /etc/nginx/sites-enabled/default
EXPOSE 10000
COPY start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]