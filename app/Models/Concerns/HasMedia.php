<?php

namespace App\Models\Concerns;

use App\Services\Media\MediaItem;
use App\Services\Media\MediaManager;

/**
 * HasMedia — for models with media JSON columns.
 *
 * Declare the columns on the model:
 *     protected array $mediaColumns = ['media'];
 *
 * Then storage stays tidy automatically:
 *  • updated → files removed from a column are deleted from storage
 *  • deleted → all of the record's files are deleted from storage
 *
 * (Remember to also cast those columns to 'array'.)
 */
trait HasMedia
{
    public static function bootHasMedia(): void
    {
        static::updated(function (self $model) {
            $removed = [];
            foreach ($model->mediaColumns as $column) {
                if ($model->wasChanged($column)) {
                    // getOriginal() still holds the pre-update value inside the "updated" event
                    array_push($removed, ...MediaItem::removed($model->getOriginal($column), $model->{$column}));
                }
            }
            app(MediaManager::class)->deleteMany($removed);
        });

        static::deleted(function (self $model) {
            $all = [];
            foreach ($model->mediaColumns as $column) {
                array_push($all, ...MediaItem::list($model->{$column}));
            }
            app(MediaManager::class)->deleteMany($all);
        });
    }
}
