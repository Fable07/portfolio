<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    protected $fillable = ['visitor_id', 'visited_at'];

    public $timestamps = false;

    protected $casts = [
        'visited_at' => 'datetime',
    ];
}
