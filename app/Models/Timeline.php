<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Timeline extends Model
{
    /**
     * Fields that can be mass assigned
     */
    protected $fillable = [
        'type',         // 'education' or 'work'
        'title',
        'institution',
        'location',
        'start_date',
        'end_date',
        'description',
        'order',
    ];
}
