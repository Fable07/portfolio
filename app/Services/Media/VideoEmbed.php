<?php

namespace App\Services\Media;

/**
 * VideoEmbed — turns a YouTube or Vimeo link into a media item.
 *
 * Linked videos cost no storage: only the link is saved, and the public site
 * plays them in an <iframe>. Only these two hosts are accepted, because the
 * embed URL is rendered as an iframe on the public site.
 */
class VideoEmbed
{
    /** Allowed iframe sources — also enforced when saving content (see MediaRules). */
    public const EMBED_URL_PATTERN = '#^https://(www\.youtube-nocookie\.com/embed/[\w-]{11}|player\.vimeo\.com/video/\d+)$#';

    public static function fromUrl(string $url): ?array
    {
        // youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
        if (preg_match('#^https?://(?:www\.|m\.)?(?:youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/)|youtu\.be/)([\w-]{11})#', $url, $m)) {
            return MediaItem::make([
                'type' => 'embed',
                'provider' => 'youtube',
                'url' => "https://www.youtube.com/watch?v={$m[1]}",
                'embed_url' => "https://www.youtube-nocookie.com/embed/{$m[1]}",
                'thumbnail_url' => "https://i.ytimg.com/vi/{$m[1]}/hqdefault.jpg",
            ]);
        }

        // vimeo.com/ID or player.vimeo.com/video/ID
        if (preg_match('#^https?://(?:www\.)?(?:player\.)?vimeo\.com/(?:video/)?(\d+)#', $url, $m)) {
            return MediaItem::make([
                'type' => 'embed',
                'provider' => 'vimeo',
                'url' => "https://vimeo.com/{$m[1]}",
                'embed_url' => "https://player.vimeo.com/video/{$m[1]}",
            ]);
        }

        return null;
    }
}
