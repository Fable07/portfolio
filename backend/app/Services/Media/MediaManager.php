<?php

namespace App\Services\Media;

/**
 * MediaManager — picks the right storage driver.
 *
 *  • uploads()        → driver for NEW uploads (MEDIA_DRIVER in .env)
 *  • for($provider)   → driver that owns an EXISTING item (so old local files can
 *                       still be deleted after you switch to Cloudinary)
 *  • deleteMany()     → remove stored files; embeds (YouTube/Vimeo) have nothing to delete
 */
class MediaManager
{
    /** @var array<string, MediaStorage> */
    private array $drivers = [];

    public function uploads(): MediaStorage
    {
        return $this->for(config('media.driver'));
    }

    public function for(string $provider): ?MediaStorage
    {
        return $this->drivers[$provider] ??= match ($provider) {
            'local' => new LocalMediaStorage(config('media.local_disk'), config('media.folder')),
            'cloudinary' => new CloudinaryMediaStorage(config('media.cloudinary'), config('media.folder')),
            default => null,
        };
    }

    public function deleteMany(array $items): void
    {
        foreach ($items as $item) {
            try {
                $this->for($item['provider'] ?? '')?->delete($item);
            } catch (\Throwable $e) {
                // A failed cleanup must never break saving content — just log it
                report($e);
            }
        }
    }
}
