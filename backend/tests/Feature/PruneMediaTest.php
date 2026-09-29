<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** media:prune finds files no content references and deletes them only with --force. */
class PruneMediaTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public', ['url' => 'http://localhost/storage']);
        config(['media.driver' => 'local', 'media.folder' => 'portfolio-test']);
        Sanctum::actingAs(User::factory()->create());
    }

    private function upload(string $collection): array
    {
        $png = UploadedFile::fake()->createWithContent('x.png', base64_decode(self::PNG));

        return $this->postJson('/api/media', ['collection' => $collection, 'file' => $png])->json();
    }

    public function test_only_unreferenced_files_are_listed_and_deleted_with_force(): void
    {
        $projectImage = $this->upload('projects');
        $hobbyClip = $this->upload('hobbies');
        $orphan = $this->upload('hobbies'); // uploaded, never saved to any content
        Storage::disk('public')->put('portfolio-test/notes.txt', 'not ours'); // not a media key

        $this->postJson('/api/projects', ['title' => 'P', 'media' => [$projectImage]])->assertCreated();
        $this->postJson('/api/hobbies', ['name' => 'H', 'media' => [$hobbyClip]])->assertCreated();
        $this->travel(2)->days();

        $this->artisan('media:prune')->expectsOutputToContain('3 stored, 2 referenced, 1 orphaned')->assertSuccessful();
        Storage::disk('public')->assertExists($orphan['key']); // dry run

        $this->artisan('media:prune', ['--force' => true])->assertSuccessful();
        Storage::disk('public')->assertMissing($orphan['key']);
        Storage::disk('public')->assertExists([$projectImage['key'], $hobbyClip['key'], 'portfolio-test/notes.txt']);
    }

    public function test_recent_uploads_are_kept_for_forms_still_open(): void
    {
        $fresh = $this->upload('projects');

        $this->artisan('media:prune', ['--force' => true])->expectsOutputToContain('0 orphaned')->assertSuccessful();
        Storage::disk('public')->assertExists($fresh['key']);
    }
}
