<?php

namespace App\Models;

use App\Models\Concerns\HasMedia;
use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    use HasMedia;

    protected $fillable = [
        'title',
        'issuer',
        'date',
        'credential_url',
        'badge_url',
        'badge',
        'order',
    ];

    protected $casts = [
        'badge' => 'array', // single MediaItem (uploaded badge image) or null
    ];

    protected array $mediaColumns = ['badge'];

    protected static function booted(): void
    {
        // An uploaded badge wins over a pasted badge URL
        static::saving(function (Certification $certification) {
            if (! $certification->isDirty('badge')) {
                return;
            }
            $previousUrl = $certification->getOriginal('badge')['url'] ?? null;

            if (! empty($certification->badge['url'])) {
                $certification->badge_url = $certification->badge['url'];
            } elseif ($previousUrl && $certification->badge_url === $previousUrl) {
                $certification->badge_url = null; // badge removed — don't point at a deleted file
            }
        });
    }
}
