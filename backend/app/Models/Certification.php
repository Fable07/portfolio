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
        'is_published',
    ];

    protected $casts = [
        'badge' => 'array', // single MediaItem (uploaded badge image) or null
        'is_published' => 'boolean', // false = draft, hidden from the public site
    ];

    protected array $mediaColumns = ['badge'];

    protected static function booted(): void
    {
        // An uploaded badge wins over a pasted badge URL
        static::saving(function (Certification $certification) {
            if (! $certification->isDirty('badge')) {
                return;
            }
            $previousUrl = self::badgeImageUrl($certification->getOriginal('badge'));
            $imageUrl = self::badgeImageUrl($certification->badge);

            if ($imageUrl) {
                $certification->badge_url = $imageUrl;
            } elseif ($previousUrl && $certification->badge_url === $previousUrl) {
                $certification->badge_url = null; // badge removed — don't point at a deleted file
            }
        });
    }

    /** Image to show for a badge item — for a certificate PDF, its page-1 preview (Cloudinary only). */
    private static function badgeImageUrl(?array $badge): ?string
    {
        $url = ($badge['type'] ?? null) === 'document' ? ($badge['thumbnail_url'] ?? null) : ($badge['url'] ?? null);

        return $url ?: null;
    }
}
