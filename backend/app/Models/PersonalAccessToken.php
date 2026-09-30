<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

/**
 * Sanctum token that records "last used" at most once every few minutes.
 *
 * Sanctum updates last_used_at on every authenticated request — an extra write to the
 * remote database on each admin API call. Nothing here needs it to the second, so the
 * update is skipped while the stored value is recent. Other changes save normally.
 */
class PersonalAccessToken extends SanctumPersonalAccessToken
{
    public const LAST_USED_RESOLUTION_MINUTES = 5;

    protected static function booted(): void
    {
        static::updating(function (self $token) {
            $onlyLastUsed = array_keys($token->getDirty()) === ['last_used_at'];
            $previous = $token->getOriginal('last_used_at');

            if ($onlyLastUsed && $previous && $previous->gt(now()->subMinutes(self::LAST_USED_RESOLUTION_MINUTES))) {
                return false; // cancel the save
            }
        });
    }
}
