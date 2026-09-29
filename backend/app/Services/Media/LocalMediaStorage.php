<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * LocalMediaStorage — saves files on this server's disk (storage/app/public).
 *
 * Good for development. Files are served from APP_URL/storage/… after running
 * `php artisan storage:link` once. For production, prefer MEDIA_DRIVER=cloudinary
 * so files are served from a CDN and survive server/container rebuilds.
 */
class LocalMediaStorage implements MediaStorage
{
    public function __construct(
        private readonly string $disk,
        private readonly string $folder,
    ) {}

    public function provider(): string
    {
        return 'local';
    }

    public function store(UploadedFile $file, string $kind, string $collection): array
    {
        // Name files by UUID + extension detected from the file CONTENT (not the
        // user-supplied name), so uploads can't overwrite each other or fake a type.
        $extension = strtolower($file->guessExtension() ?: $file->getClientOriginalExtension());
        $key = "{$this->folder}/{$collection}/".Str::uuid().".{$extension}";

        Storage::disk($this->disk)->putFileAs(dirname($key), $file, basename($key));

        [$width, $height] = $kind === 'image' ? $this->dimensions($file) : [null, null];

        return MediaItem::make([
            'type' => $kind,
            'provider' => $this->provider(),
            'url' => Storage::disk($this->disk)->url($key),
            'key' => $key,
            'mime' => $file->getMimeType(),
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'name' => Str::limit($file->getClientOriginalName(), 200, ''),
        ]);
    }

    public function delete(array $item): void
    {
        $key = $item['key'] ?? null;

        // Only ever delete inside our own media folder (blocks "../" tricks)
        if (! $key || ! $this->ownsKey($key)) {
            return;
        }

        Storage::disk($this->disk)->delete($key);
    }

    public function stored(): iterable
    {
        $disk = Storage::disk($this->disk);

        foreach ($disk->allFiles($this->folder) as $key) {
            if ($this->ownsKey($key)) {
                yield ['key' => $key, 'resource_type' => null, 'created_at' => Carbon::createFromTimestamp($disk->lastModified($key))];
            }
        }
    }

    /** True for keys like "portfolio-dev/projects/<uuid>.png". */
    public function ownsKey(string $key): bool
    {
        $folder = preg_quote($this->folder, '#');

        return (bool) preg_match("#^{$folder}/[a-z]+/[0-9a-f-]{36}\.[a-z0-9]{2,5}$#", $key);
    }

    /** @return array{0: ?int, 1: ?int} */
    private function dimensions(UploadedFile $file): array
    {
        $size = @getimagesize($file->getRealPath());

        return $size ? [$size[0], $size[1]] : [null, null];
    }
}
