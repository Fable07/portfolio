<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** After a successful admin write, retire the cached public responses (CachePublicResponse). */
class FlushPublicCache
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethodSafe() && $response->isSuccessful()) {
            CachePublicResponse::flush();
        }

        return $response;
    }
}
