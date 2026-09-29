<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Caches the public read-only JSON (projects, hobbies, resume, …) so visitors don't wait
 * on a database round trip every time — Render (Singapore) → Supabase (Sydney) adds ~1 s.
 *
 * Invalidation: every successful admin write sets a new content version (see FlushPublicCache),
 * which retires all cached responses at once. The version lives in the shared database's
 * `cache` table, so a save from the local admin (same database) reaches the live API too;
 * each server re-reads it at most every `cache.public_version_check` seconds (30).
 * The TTL is a safety net for edits made in Supabase directly.
 *
 * Skipped for signed-in admins and for requests with a query string (?drafts=1), so drafts
 * are never cached and random query strings can't fill the cache. Only 200s are stored.
 */
class CachePublicResponse
{
    // Row in the shared `cache` table, written directly so it doesn't depend on each
    // server's CACHE_STORE / CACHE_PREFIX settings
    private const VERSION_ROW = 'portfolio:public-content-version';

    private const VERSION_MEMO_KEY = 'public-response:version-memo';

    public static function flush(): void
    {
        DB::table('cache')->upsert(
            ['key' => self::VERSION_ROW, 'value' => (string) Str::uuid(), 'expiration' => 2147483647],
            ['key'],
            ['value', 'expiration'],
        );
        Cache::forget(self::VERSION_MEMO_KEY); // this server sees its own change immediately
    }

    /** Shared content version, read from the database at most every few seconds. */
    private static function version(): string
    {
        return Cache::remember(
            self::VERSION_MEMO_KEY,
            (int) config('cache.public_version_check'),
            fn () => (string) DB::table('cache')->where('key', self::VERSION_ROW)->value('value'),
        );
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('GET') || $request->getQueryString() !== null
            || $request->bearerToken() || auth('sanctum')->check()) {
            return $next($request);
        }

        $key = 'public-response:' . self::version() . ':' . $request->path();

        if ($cached = Cache::get($key)) {
            return response($cached, 200, ['Content-Type' => 'application/json', 'X-Cache' => 'HIT']);
        }

        $response = $next($request);

        if ($response->getStatusCode() === 200) {
            Cache::put($key, $response->getContent(), (int) config('cache.public_ttl'));
            $response->headers->set('X-Cache', 'MISS');
        }

        return $response;
    }
}
