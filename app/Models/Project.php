<?php

namespace App\Models;

use App\Models\Concerns\HasMedia;
use App\Services\Media\MediaItem;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasMedia;

    protected $fillable = [
        'title',
        'description',
        'tech_stack',
        'project_url',
        'github_url',
        'thumbnail_url',
        'media',
        'order',
        'is_published',
        'is_featured',
    ];

    protected $casts = [
        'media' => 'array', // gallery: list of MediaItem JSON objects
        'is_published' => 'boolean', // false = draft, hidden from the public site
        'is_featured' => 'boolean', // shown in "Featured projects" on the home page
    ];

    /** JSON columns whose files HasMedia cleans up */
    protected array $mediaColumns = ['media'];

    protected static function booted(): void
    {
        // Keep thumbnail_url in sync with the gallery's first image (used by project cards)
        static::saving(function (Project $project) {
            if (! $project->isDirty('media')) {
                return;
            }
            $cover = MediaItem::coverUrl($project->media);
            $previousCover = MediaItem::coverUrl($project->getOriginal('media'));

            if ($cover) {
                $project->thumbnail_url = $cover;
            } elseif ($previousCover && $project->thumbnail_url === $previousCover) {
                $project->thumbnail_url = null; // gallery emptied — don't point at a deleted file
            }
        });
    }
}
