<?php

namespace App\Console\Commands;

use App\Models\Certification;
use App\Models\Hobby;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Resume;
use App\Services\Media\MediaManager;
use Illuminate\Console\Command;

/**
 * media:prune — delete stored files that no content references any more ("orphans").
 *
 * Normal deletes already clean up (HasMedia + the admin's media session). Orphans only
 * appear when that cleanup couldn't run: the tab was closed mid-edit, a network error,
 * or a file uploaded while testing. This is the occasional sweep for those.
 *
 *   php artisan media:prune              dry run: list orphans, delete nothing
 *   php artisan media:prune --force      delete them
 *
 * Files younger than --hours (default 24) are skipped: they may belong to a form that
 * is still open and not saved yet. Runs against MEDIA_DRIVER's storage and MEDIA_FOLDER.
 */
class PruneMedia extends Command
{
    protected $signature = 'media:prune
        {--force : Delete the orphans (without it, only list them)}
        {--hours=24 : Skip files uploaded within this many hours}';

    protected $description = 'Delete uploaded files that no content references (dry run unless --force)';

    /** Every model that stores media items (see HasMedia). */
    private const MODELS = [Project::class, Certification::class, Hobby::class, Profile::class, Resume::class];

    public function handle(MediaManager $media): int
    {
        $storage = $media->uploads();
        $provider = $storage->provider();

        $referenced = collect(self::MODELS)
            ->flatMap(fn (string $model) => $model::all()->flatMap->mediaItems())
            ->where('provider', $provider)
            ->pluck('key')
            ->filter()
            ->flip();

        $cutoff = now()->subHours((int) $this->option('hours'));
        $stored = collect($storage->stored());
        $orphans = $stored
            ->reject(fn (array $file) => $referenced->has($file['key']))
            ->filter(fn (array $file) => $file['created_at']->lt($cutoff))
            ->values();

        $this->info("{$provider} · folder ".config('media.folder').": {$stored->count()} stored, {$referenced->count()} referenced, {$orphans->count()} orphaned.");

        if ($orphans->isEmpty()) {
            return self::SUCCESS;
        }

        $this->table(['Key', 'Type', 'Uploaded'], $orphans->map(fn (array $file) => [
            $file['key'], $file['resource_type'] ?? '-', $file['created_at']->toDateTimeString(),
        ]));

        if (! $this->option('force')) {
            $this->comment('Dry run — nothing deleted. Re-run with --force to delete these files.');

            return self::SUCCESS;
        }

        // Nothing referenced but files exist: likely the wrong database, not a real cleanup
        if ($referenced->isEmpty() && ! $this->confirm('No content references ANY file. Delete everything listed?')) {
            return self::FAILURE;
        }

        $media->deleteMany($orphans->map(fn (array $file) => ['provider' => $provider] + $file)->all());
        $this->info("Deleted {$orphans->count()} orphaned file(s).");

        return self::SUCCESS;
    }
}
