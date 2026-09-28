# Production image — nginx + php-fpm in one container, managed by supervisord.
#
# One container is deliberate: hosts like Render, Railway and Fly expose a single port,
# and this API is small. nginx serves public/ and passes PHP to php-fpm over a socket.
#
#   docker build -t portfolio-api .
#   docker run -p 8001:80 --env-file .env.production portfolio-api
#
# Composer runs in its own stage so the shipped image has no Composer and no dev packages.

# ── Stage 1: dependencies ──
FROM composer:2 AS vendor

WORKDIR /app

# Only the manifests: this layer is cached until the dependencies change
COPY composer.json composer.lock ./

# --no-scripts because artisan isn't copied yet (package:discover would fail)
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader

# ── Stage 2: runtime ──
FROM php:8.2-fpm-alpine AS production

# nginx + supervisord run the two processes; postgresql-dev is only needed to compile pdo_pgsql
RUN apk add --no-cache nginx supervisor \
    && apk add --no-cache --virtual .build-deps postgresql-dev \
    && docker-php-ext-install pdo_pgsql bcmath opcache \
    && apk del .build-deps

# Sensible PHP settings for an API that accepts uploads (see config/media.php limits)
COPY docker/php.ini /usr/local/etc/php/conf.d/99-portfolio.ini
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

WORKDIR /app

COPY --from=vendor /app/vendor ./vendor
COPY . .

# The scripts skipped in stage 1, now that artisan exists
RUN composer dump-autoload --no-dev --optimize --no-interaction \
    && php artisan package:discover --ansi

# php-fpm runs as www-data, so it must own the writable directories
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && php artisan storage:link || true

EXPOSE 80

# Laravel's built-in health endpoint
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD php -r 'exit(@file_get_contents("http://127.0.0.1/up") ? 0 : 1);'

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
