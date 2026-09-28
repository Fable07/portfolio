<?php

namespace App\Models;

use App\Models\Concerns\HasMedia;
use App\Services\Media\MediaItem;
use Illuminate\Database\Eloquent\Model;

/**
 * Profile — the single row holding "about the owner" content shown on the home page,
 * /about, the terminal and the command palette. Edited in /admin/profile.
 */
class Profile extends Model
{
    use HasMedia;

    protected $table = 'profile';

    protected $fillable = [
        'name', 'handle', 'email', 'location', 'availability',
        'roles', 'about', 'avatar', 'skill_groups', 'social_links',
    ];

    protected $casts = [
        'roles' => 'array',
        'about' => 'array',
        'avatar' => 'array',
        'skill_groups' => 'array',
        'social_links' => 'array',
    ];

    protected array $mediaColumns = ['avatar', 'skill_groups'];

    /** Skill icons are nested inside skill_groups, so collect them for HasMedia cleanup. */
    public function mediaIn(string $column, mixed $value): array
    {
        if ($column !== 'skill_groups') {
            return MediaItem::list($value);
        }

        return collect($value ?? [])
            ->flatMap(fn ($group) => $group['skills'] ?? [])
            ->pluck('icon_media')
            ->filter(fn ($item) => is_array($item))
            ->values()
            ->all();
    }
}
