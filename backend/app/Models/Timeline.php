<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Timeline extends Model
{
    // Migration created a singular "timeline" table (Laravel would guess "timelines")
    protected $table = 'timeline';

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
