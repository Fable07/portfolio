<?php

namespace App\Support;

use App\Services\Media\MediaItem;
use App\Services\Media\VideoEmbed;
use Illuminate\Validation\Rule;

/**
 * MediaRules — validation rules for media JSON sent by the admin when saving content.
 *
 *   $request->validate([
 *       'title' => 'required|string',
 *       ...MediaRules::many('media'),   // gallery (array of items)
 *       ...MediaRules::one('badge'),    // single item or null
 *   ]);
 *
 * Only the keys listed here survive $request->validate(), so unknown keys are dropped.
 */
class MediaRules
{
    public static function many(string $field, int $max = 30): array
    {
        return [
            $field => ['nullable', 'array', 'list', "max:{$max}"],
            ...self::itemRules("{$field}.*"),
        ];
    }

    public static function one(string $field): array
    {
        return [
            $field => ['nullable', 'array'],
            ...self::itemRules($field, requiredIfPresent: true),
        ];
    }

    private static function itemRules(string $prefix, bool $requiredIfPresent = false): array
    {
        // For a single optional item, fields are required only when the item itself is sent
        $required = $requiredIfPresent ? "required_with:{$prefix}" : 'required';

        return [
            "{$prefix}.id" => [$required, 'string', 'max:64'],
            "{$prefix}.type" => [$required, Rule::in(MediaItem::TYPES)],
            "{$prefix}.provider" => [$required, Rule::in(MediaItem::PROVIDERS)],
            "{$prefix}.url" => [$required, 'url:http,https', 'max:2048'],
            "{$prefix}.key" => ['nullable', 'string', 'max:512', 'not_regex:#\.\.#'],
            "{$prefix}.resource_type" => ['nullable', Rule::in(['image', 'video', 'raw'])],
            "{$prefix}.mime" => ['nullable', 'string', 'max:100'],
            "{$prefix}.size" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.width" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.height" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.name" => ['nullable', 'string', 'max:255'],
            "{$prefix}.alt" => ['nullable', 'string', 'max:500'],
            "{$prefix}.thumbnail_url" => ['nullable', 'url:http,https', 'max:2048'],
            // iframe sources are limited to YouTube (privacy mode) and Vimeo players
            "{$prefix}.embed_url" => ['nullable', 'string', 'max:255', 'regex:'.VideoEmbed::EMBED_URL_PATTERN],
        ];
    }
}
