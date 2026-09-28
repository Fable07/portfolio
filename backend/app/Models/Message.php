<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A message sent through the public contact form (read in /admin/messages). */
class Message extends Model
{
    protected $fillable = ['name', 'email', 'subject', 'body', 'read_at', 'meta'];

    protected $casts = [
        'read_at' => 'datetime',
        'meta' => 'array',
    ];

    protected $appends = ['is_read'];

    /** Convenience flag for the frontend (read_at itself stays available). */
    public function getIsReadAttribute(): bool
    {
        return $this->read_at !== null;
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
