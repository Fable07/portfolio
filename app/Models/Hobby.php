<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hobby extends Model
{
    /**
     * Fields that can be mass assigned
     */
    protected $fillable = [
        'name',
        'icon',
        'description',
        'order',
    ];
}
