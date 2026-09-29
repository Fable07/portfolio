<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * CloudinaryMediaStorage — uploads files to Cloudinary (image/video CDN).
 *
 * Recommended for production: automatic resizing, video streaming and fast
 * global delivery, and files don't live on your server.
 *
 * Enable with MEDIA_DRIVER=cloudinary plus CLOUDINARY_CLOUD_NAME,
 * CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.
 * Uses Cloudinary's REST Upload API directly (no SDK dependency).
 *
 * NOTE: written against Cloudinary's documented API but not yet exercised with
 * real credentials — run a test upload after adding your keys.
 */
class CloudinaryMediaStorage implements MediaStorage
{
    private const API = 'https://api.cloudinary.com/v1_1';

    public function __construct(
        private readonly array $config,
        private readonly string $folder,
    ) {}

    public function provider(): string
    {
        return 'cloudinary';
    }

    public function store(UploadedFile $file, string $kind, string $collection): array
    {
        $this->assertConfigured();

        $params = [
            'folder' => "{$this->folder}/{$collection}",
            'public_id' => (string) Str::uuid(),
            'timestamp' => time(),
        ];

        // PDFs go in as "image" resources so Cloudinary can render page 1 as a preview.
        // (Free accounts must allow PDF delivery: Settings → Security → "Allow delivery of PDF and ZIP files".)
        $resourceType = $kind === 'video' ? 'video' : 'image';

        if ($kind === 'image') {
            // Cap stored size: phone photos shrink to 2560 px, smaller images are untouched
            $params['transformation'] = 'c_limit,w_2560,h_2560';
        }

        $response = Http::asMultipart()
            ->attach('file', fopen($file->getRealPath(), 'r'), $file->getClientOriginalName())
            ->post($this->endpoint("{$resourceType}/upload"), $this->signed($params))
            ->throw()
            ->json();

        $url = $response['secure_url'];

        return MediaItem::make([
            'type' => $kind,
            'provider' => $this->provider(),
            // Videos are delivered as MP4 (Cloudinary transcodes on the fly, e.g. iPhone .mov)
            'url' => $kind === 'video' ? preg_replace('#\.\w+$#', '.mp4', $url) : $url,
            'key' => $response['public_id'],
            'resource_type' => $response['resource_type'] ?? $resourceType,
            'mime' => $file->getMimeType(),
            'size' => $response['bytes'] ?? $file->getSize(),
            'width' => $response['width'] ?? null,
            'height' => $response['height'] ?? null,
            'name' => Str::limit($file->getClientOriginalName(), 200, ''),
            // Preview image rendered by Cloudinary: a video's first frame, a PDF's first page
            'thumbnail_url' => match ($kind) {
                'video' => preg_replace('#/upload/(.+)\.\w+$#', '/upload/so_0/$1.jpg', $url),
                'document' => preg_replace('#/upload/(.+)\.\w+$#', '/upload/pg_1,w_1200,c_limit/$1.jpg', $url),
                default => null,
            },
        ]);
    }

    public function delete(array $item): void
    {
        $publicId = $item['key'] ?? null;
        if (! $publicId || ! str_starts_with($publicId, "{$this->folder}/")) {
            return;
        }
        $this->assertConfigured();

        $resourceType = $item['resource_type'] ?? 'image';

        Http::asForm()->post(
            $this->endpoint("{$resourceType}/destroy"),
            $this->signed(['public_id' => $publicId, 'timestamp' => time()]),
        );
    }

    /** Cloudinary signature: sha1 of sorted "key=value&…" params + API secret. */
    private function signed(array $params): array
    {
        ksort($params);
        $toSign = collect($params)->map(fn ($value, $key) => "{$key}={$value}")->implode('&');

        return $params + [
            'api_key' => $this->config['api_key'],
            'signature' => sha1($toSign.$this->config['api_secret']),
        ];
    }

    private function endpoint(string $path): string
    {
        return self::API."/{$this->config['cloud_name']}/{$path}";
    }

    private function assertConfigured(): void
    {
        if (empty($this->config['cloud_name']) || empty($this->config['api_key']) || empty($this->config['api_secret'])) {
            throw new RuntimeException('Cloudinary is not configured. Set CLOUDINARY_* values in .env.');
        }
    }
}
