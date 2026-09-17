<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    protected $fillable = [
        'title',
        'issuer',
        'date',
        'credential_url',
        'badge_url',
        'order',
    ];
}
