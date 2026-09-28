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
        'order',
    ];

    protected $casts = [
        'image' => 'array', // optional photo: single MediaItem or null
    ];

    protected array $mediaColumns = ['image'];
}
