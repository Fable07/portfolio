<?php

/*
|--------------------------------------------------------------------------
| Media configuration
|--------------------------------------------------------------------------
|
| Uploaded files (images, videos, PDFs) are stored OUTSIDE the database by a
| "media driver". The database only keeps a small JSON description of each
| file (url, type, size…) — see App\Services\Media\MediaItem for the shape.
|
| Switching storage later (e.g. local → Cloudinary) only needs .env changes:
|
|   MEDIA_DRIVER=cloudinary
|   CLOUDINARY_CLOUD_NAME=… CLOUDINARY_API_KEY=… CLOUDINARY_API_SECRET=…
|
| Existing items keep working because each item remembers its own provider.
|
*/

return [

    // Where NEW uploads go: 'local' (Laravel public disk) or 'cloudinary'
    'driver' => env('MEDIA_DRIVER', 'local'),

    // Top-level folder for uploads. Use a different value per environment
    // (e.g. portfolio-dev / portfolio-prod) so dev uploads never mix with the live site.
    'folder' => env('MEDIA_FOLDER', 'portfolio-dev'),

    // Laravel filesystem disk used by the local driver (needs `php artisan storage:link`)
    'local_disk' => env('MEDIA_LOCAL_DISK', 'public'),

    'cloudinary' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
        'api_key' => env('CLOUDINARY_API_KEY'),
        'api_secret' => env('CLOUDINARY_API_SECRET'),
    ],

    /*
    | File kinds: accepted extensions and max size in kilobytes.
    | Keep video max below PHP's upload_max_filesize (24M in docker/php.ini).
    | SVG is intentionally not allowed — it can carry scripts.
    | MOV (phone clips) is served as MP4 by Cloudinary; with the local driver only
    | browsers that support QuickTime can play it.
    */
    'kinds' => [
        'image' => ['mimes' => ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp'], 'max_kb' => (int) env('MEDIA_MAX_IMAGE_KB', 5120)],
        'video' => ['mimes' => ['mp4', 'webm', 'mov'], 'max_kb' => (int) env('MEDIA_MAX_VIDEO_KB', 20480)],
        'document' => ['mimes' => ['pdf'], 'max_kb' => (int) env('MEDIA_MAX_DOCUMENT_KB', 10240)],
    ],

    // Which file kinds each content type ("collection") may upload
    'collections' => [
        'projects' => ['image', 'video', 'document'],
        'certifications' => ['image', 'document'], // badge image or the certificate PDF
        'hobbies' => ['image', 'video'], // cover photo and a gallery of short clips
        'resume' => ['document'],
        'profile' => ['image', 'video'], // avatar (a video avatar plays on hover) and skill icons
    ],

    // Max items in a project or hobby gallery
    'max_gallery_items' => 30,
];
