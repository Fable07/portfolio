<?php

namespace App\Services\Media;

use Illuminate\Support\Str;

/**
 * MediaItem — the JSON shape stored in the database for every image, video,
 * document or embedded video. Files themselves live in the storage provider.
 *
 * {
 *   "id":            "9b1d…",                 unique id (used by the admin UI)
 *   "type":          "image|video|document|embed",
 *   "provider":      "local|cloudinary|youtube|vimeo",
 *   "url":           "https://…",              public URL to show / download
 *   "key":           "portfolio-dev/projects/9b1d….webp", storage path or Cloudinary public_id (null for embeds)
 *   "resource_type": "image|video|raw",        Cloudinary only (needed to delete)
 *   "mime":          "image/webp",
 *   "size":          48213,                    bytes
 *   "width":         1280, "height": 720,      images only (when known)
 *   "name":          "screenshot.webp",        original file name
 *   "alt":           "Dashboard screenshot",   accessibility text (editable in admin)
 *   "thumbnail_url": "https://…",              poster / preview image (videos & embeds)
 *   "embed_url":     "https://www.youtube-nocookie.com/embed/…"  iframe src (embeds only)
 * }
 */
class MediaItem
{
    public const TYPES = ['image', 'video', 'document', 'embed'];

    public const PROVIDERS = ['local', 'cloudinary', 'youtube', 'vimeo'];

    /** Build a normalized item — every key is always present. */
    public static function make(array $attributes): array
    {
        return array_merge([
            'id' => (string) Str::uuid(),
            'type' => null,
            'provider' => null,
            'url' => null,
            'key' => null,
            'resource_type' => null,
            'mime' => null,
            'size' => null,
            'width' => null,
            'height' => null,
            'name' => null,
            'alt' => null,
            'thumbnail_url' => null,
            'embed_url' => null,
        ], $attributes);
    }

    /**
     * Turn a column value into a flat list of items.
     * Handles both "many" (gallery array) and "one" (single item) columns, and null.
     */
    public static function list(mixed $value): array
    {
        if (! is_array($value) || $value === []) {
            return [];
        }

        return array_is_list($value) ? array_values(array_filter($value, 'is_array')) : [$value];
    }

    /** Items present in $before but missing from $after (compared by storage key). */
    public static function removed(mixed $before, mixed $after): array
    {
        $keep = collect(self::list($after))->pluck('key')->filter()->all();

        return collect(self::list($before))
            ->filter(fn (array $item) => ! empty($item['key']) && ! in_array($item['key'], $keep, true))
            ->values()
            ->all();
    }

    /** First image item (or video/embed thumbnail) — used for card thumbnails. */
    public static function coverUrl(mixed $value): ?string
    {
        foreach (self::list($value) as $item) {
            if (($item['type'] ?? null) === 'image') {
                return $item['url'] ?? null;
            }
        }
        foreach (self::list($value) as $item) {
            if (! empty($item['thumbnail_url'])) {
                return $item['thumbnail_url'];
            }
        }

        return null;
    }
}
