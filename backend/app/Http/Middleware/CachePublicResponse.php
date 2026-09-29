<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Caches the public read-only JSON (projects, hobbies, resume, …) so visitors don't wait
 * on a database round trip every time — Render (Singapore) → Supabase (Sydney) adds ~1 s.
 *
 * Invalidation: every successful admin write bumps a version number (see FlushPublicCache),
 * which retires all cached responses at once. The TTL is a safety net for edits made
 * outside this server (local dev shares the same database, or edits in Supabase directly).
 *
 * Skipped for signed-in admins and for requests with a query string (?drafts=1), so drafts
 * are never cached and random query strings can't fill the cache. Only 200s are stored.
 */
class CachePublicResponse
{
    private const VERSION_KEY = 'public-response:version';

    public static function flush(): void
    {
        Cache::forever(self::VERSION_KEY, (int) Cache::get(self::VERSION_KEY, 0) + 1);
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('GET') || $request->getQueryString() !== null
            || $request->bearerToken() || auth('sanctum')->check()) {
            return $next($request);
        }

        $key = 'public-response:' . Cache::get(self::VERSION_KEY, 0) . ':' . $request->path();

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
