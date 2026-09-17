<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title',
        'description',
        'tech_stack',
        'project_url',
        'github_url',
        'thumbnail_url',
        'order',
    ];
}
