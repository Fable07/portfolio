<?php

namespace App\Models;

use App\Models\Concerns\HasMedia;
use Illuminate\Database\Eloquent\Model;

class Hobby extends Model
{
    use HasMedia;

    /**
     * Fields that can be mass assigned
     */
    protected $fillable = [
        'name',
        'icon',
        'description',
        'image',
        'media',
        'order',
    ];

    protected $casts = [
        'image' => 'array', // optional cover photo: single MediaItem or null
        'media' => 'array', // gallery: list of MediaItems (photos, clips, embeds) or null
    ];

    protected array $mediaColumns = ['image', 'media'];
}
