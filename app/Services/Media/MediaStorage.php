<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;

/**
 * MediaStorage — contract every storage driver implements (local disk, Cloudinary…).
 *
 * Controllers never talk to a specific driver; they ask MediaManager for one.
 * That is what makes the storage provider swappable via .env.
 */
interface MediaStorage
{
    /** Provider name saved in each media item, e.g. 'local' or 'cloudinary'. */
    public function provider(): string;

    /**
     * Store an uploaded file and describe it.
     *
     * @param  string  $kind        'image' | 'video' | 'document'
     * @param  string  $collection  'projects' | 'certifications' | 'hobbies' | 'resume'
     * @return array  Media item (see MediaItem::make)
     */
    public function store(UploadedFile $file, string $kind, string $collection): array;

    /** Delete the stored file behind a media item. Must not throw if it's already gone. */
    public function delete(array $item): void;
}
