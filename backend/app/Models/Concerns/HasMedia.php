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
 * If media sits deeper inside a column (e.g. icons inside skill groups), override
 * mediaIn($column, $value) to return the flat list of media items for that column.
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
                    array_push($removed, ...MediaItem::removed(
                        $model->mediaIn($column, $model->getOriginal($column)),
                        $model->mediaIn($column, $model->{$column}),
                    ));
                }
            }
            app(MediaManager::class)->deleteMany($removed);
        });

        static::deleted(fn (self $model) => app(MediaManager::class)->deleteMany($model->mediaItems()));
    }

    /** Every media item this record currently references, across all its media columns. */
    public function mediaItems(): array
    {
        $all = [];
        foreach ($this->mediaColumns as $column) {
            array_push($all, ...$this->mediaIn($column, $this->{$column}));
        }

        return $all;
    }

    /** Media items stored in a column (default: the column itself is an item or a list of items). */
    public function mediaIn(string $column, mixed $value): array
    {
        return MediaItem::list($value);
    }
}
