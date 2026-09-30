<?php

namespace App\Providers;

use App\Database\PostgresConnection;
use App\Models\PersonalAccessToken;
use App\Services\Media\MediaManager;
use Illuminate\Database\Connection;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // One shared MediaManager per request (it caches the storage drivers it creates)
        $this->app->singleton(MediaManager::class);

        // Postgres with emulated prepares — see App\Database\PostgresConnection
        Connection::resolverFor('pgsql', fn ($pdo, $database, $prefix, $config) => new PostgresConnection($pdo, $database, $prefix, $config));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
}
