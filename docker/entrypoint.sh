#!/bin/sh
# Runs once per container start, before nginx and php-fpm.
#
#   1. refuses to start without an APP_KEY (a missing key breaks token encryption)
#   2. caches config/routes/views — reads one compiled file instead of parsing many
#   3. optionally runs migrations (RUN_MIGRATIONS=true)
#
# Migrations are opt-in on purpose: dev and production share ONE Supabase database
# (see DEPLOYMENT.md), so a container starting with the wrong branch must not
# silently change the live schema.
set -e

cd /app

if [ -z "$APP_KEY" ]; then
    echo "entrypoint: APP_KEY is not set — generate one with 'php artisan key:generate --show'" >&2
    exit 1
fi

# storage/ is usually a mounted volume, so fix ownership on every start
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# Media files are served from public/storage → storage/app/public
[ -L public/storage ] || php artisan storage:link || true

# Render/Railway/Fly assign the port via $PORT; nginx.conf ships with 80 as the default.
# Rewriting the listen directive here keeps one image working on any of them.
PORT="${PORT:-80}"
if [ "$PORT" != "80" ]; then
    echo "entrypoint: binding nginx to port $PORT"
    sed -i "s/listen 80 default_server;/listen ${PORT} default_server;/" /etc/nginx/nginx.conf
fi

echo "entrypoint: caching configuration"
php artisan config:cache
php artisan route:cache
php artisan view:cache

if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "entrypoint: running migrations"
    php artisan migrate --force
fi

echo "entrypoint: ready"
exec "$@"
