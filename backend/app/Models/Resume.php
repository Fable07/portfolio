<?php

namespace App\Models;

use App\Models\Concerns\HasMedia;
use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    use HasMedia;

    protected $table = 'resume';

    protected $fillable = ['pdf_url', 'pdf'];

    protected $casts = [
        'pdf' => 'array', // uploaded PDF: single MediaItem or null
    ];

    protected array $mediaColumns = ['pdf'];

    protected static function booted(): void
    {
        // An uploaded PDF wins over a pasted URL
        static::saving(function (Resume $resume) {
            if (! $resume->isDirty('pdf')) {
                return;
            }
            $previousUrl = $resume->getOriginal('pdf')['url'] ?? null;

            if (! empty($resume->pdf['url'])) {
                $resume->pdf_url = $resume->pdf['url'];
            } elseif ($previousUrl && $resume->pdf_url === $previousUrl) {
                $resume->pdf_url = null; // uploaded PDF removed without a replacement URL
            }
        });
    }
}
