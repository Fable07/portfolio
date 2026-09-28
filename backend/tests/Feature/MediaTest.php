<?php

namespace Tests\Feature;

use App\Models\Certification;
use App\Models\Project;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Media system: uploads, embeds, validation of media JSON, and storage cleanup.
 * Uses an in-memory SQLite database and a fake disk — nothing real is touched.
 */
class MediaTest extends TestCase
{
    use RefreshDatabase;

    // 1×1 transparent PNG
    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public', ['url' => 'http://localhost/storage']); // absolute URLs, like the real disk
        config(['media.driver' => 'local', 'media.folder' => 'portfolio-test']);
    }

    private function actingAsAdmin(): void
    {
        Sanctum::actingAs(User::factory()->create());
    }

    private function png(string $name = 'shot.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode(self::PNG));
    }

    private function upload(string $collection, UploadedFile $file)
    {
        return $this->postJson('/api/media', ['collection' => $collection, 'file' => $file]);
    }

    /* ── Uploads ─────────────────────────────────────────────── */

    public function test_guests_cannot_upload(): void
    {
        $this->upload('projects', $this->png())->assertUnauthorized();
    }

    public function test_admin_uploads_an_image_and_gets_media_json(): void
    {
        $this->actingAsAdmin();

        $item = $this->upload('projects', $this->png())
            ->assertCreated()
            ->assertJsonPath('type', 'image')
            ->assertJsonPath('provider', 'local')
            ->assertJsonPath('mime', 'image/png')
            ->assertJsonPath('width', 1)
            ->assertJsonPath('name', 'shot.png')
            ->json();

        $this->assertMatchesRegularExpression('#^portfolio-test/projects/[0-9a-f-]{36}\.png$#', $item['key']);
        Storage::disk('public')->assertExists($item['key']);
    }

    public function test_file_type_must_match_the_collection(): void
    {
        $this->actingAsAdmin();
        $pdf = UploadedFile::fake()->createWithContent('cv.pdf', "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");

        $this->upload('projects', $pdf)->assertUnprocessable()->assertJsonValidationErrors('file');
        $this->upload('resume', $pdf)->assertCreated()->assertJsonPath('type', 'document');
        $this->upload('resume', $this->png())->assertUnprocessable();
    }

    public function test_svg_uploads_are_rejected(): void
    {
        $this->actingAsAdmin();
        $svg = UploadedFile::fake()->createWithContent('x.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

        $this->upload('projects', $svg)->assertUnprocessable();
    }

    public function test_oversized_images_are_rejected(): void
    {
        $this->actingAsAdmin();
        config(['media.kinds.image.max_kb' => 1]);

        $this->upload('projects', $this->png()->size(50))->assertUnprocessable()->assertJsonValidationErrors('file');
    }

    public function test_unsaved_upload_can_be_deleted_but_never_outside_the_media_folder(): void
    {
        $this->actingAsAdmin();
        $item = $this->upload('projects', $this->png())->json();
        Storage::disk('public')->put('important.txt', 'keep me');

        $this->deleteJson('/api/media', ['provider' => 'local', 'key' => 'important.txt'])->assertOk();
        $this->deleteJson('/api/media', ['provider' => 'local', 'key' => 'portfolio-test/../important.txt'])->assertOk();
        Storage::disk('public')->assertExists('important.txt');

        $this->deleteJson('/api/media', ['provider' => 'local', 'key' => $item['key']])->assertOk();
        Storage::disk('public')->assertMissing($item['key']);
    }

    /* ── Embeds ──────────────────────────────────────────────── */

    public function test_youtube_and_vimeo_links_become_embeds(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/media/embed', ['url' => 'https://youtu.be/dQw4w9WgXcQ'])
            ->assertCreated()
            ->assertJsonPath('provider', 'youtube')
            ->assertJsonPath('embed_url', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');

        $this->postJson('/api/media/embed', ['url' => 'https://vimeo.com/76979871'])
            ->assertCreated()
            ->assertJsonPath('embed_url', 'https://player.vimeo.com/video/76979871');

        $this->postJson('/api/media/embed', ['url' => 'https://evil.example/video'])->assertUnprocessable();
    }

    /* ── Media JSON on content ──────────────────────────────── */

    public function test_project_gallery_is_saved_as_json_and_sets_the_thumbnail(): void
    {
        $this->actingAsAdmin();
        $image = $this->upload('projects', $this->png())->json();
        $video = $this->postJson('/api/media/embed', ['url' => 'https://youtu.be/dQw4w9WgXcQ'])->json();

        $project = $this->postJson('/api/projects', ['title' => 'Portfolio', 'media' => [$video, $image]])
            ->assertCreated()
            ->assertJsonCount(2, 'media')
            ->assertJsonPath('thumbnail_url', $image['url'])
            ->json();

        // Public endpoints return the gallery
        $this->getJson("/api/projects/{$project['id']}")->assertOk()->assertJsonPath('media.1.key', $image['key']);
    }

    public function test_unknown_embed_hosts_are_rejected_when_saving(): void
    {
        $this->actingAsAdmin();
        $evil = [
            'id' => 'x', 'type' => 'embed', 'provider' => 'youtube',
            'url' => 'https://youtube.com/watch?v=abc', 'embed_url' => 'https://evil.example/embed',
        ];

        $this->postJson('/api/projects', ['title' => 'X', 'media' => [$evil]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('media.0.embed_url');
    }

    public function test_removing_an_item_deletes_only_that_file(): void
    {
        $this->actingAsAdmin();
        $first = $this->upload('projects', $this->png('a.png'))->json();
        $second = $this->upload('projects', $this->png('b.png'))->json();
        $id = $this->postJson('/api/projects', ['title' => 'P', 'media' => [$first, $second]])->json('id');

        $this->putJson("/api/projects/{$id}", ['title' => 'P', 'media' => [$second]])
            ->assertOk()
            ->assertJsonPath('thumbnail_url', $second['url']);

        Storage::disk('public')->assertMissing($first['key']);
        Storage::disk('public')->assertExists($second['key']);
    }

    public function test_deleting_content_deletes_its_files(): void
    {
        $this->actingAsAdmin();
        $image = $this->upload('projects', $this->png())->json();
        $badge = $this->upload('certifications', $this->png())->json();
        $projectId = $this->postJson('/api/projects', ['title' => 'P', 'media' => [$image]])->json('id');
        $certId = $this->postJson('/api/certifications', ['title' => 'C', 'badge' => $badge])
            ->assertJsonPath('badge_url', $badge['url'])
            ->json('id');

        $this->deleteJson("/api/projects/{$projectId}")->assertOk();
        $this->deleteJson("/api/certifications/{$certId}")->assertOk();

        Storage::disk('public')->assertMissing($image['key']);
        Storage::disk('public')->assertMissing($badge['key']);
        $this->assertSame(0, Project::count() + Certification::count());
    }

    public function test_resume_pdf_upload_then_switch_back_to_url(): void
    {
        $this->actingAsAdmin();
        $pdf = $this->upload('resume', UploadedFile::fake()->createWithContent('cv.pdf', "%PDF-1.4\n%%EOF"))->json();

        $this->putJson('/api/resume', ['pdf' => $pdf])->assertOk()->assertJsonPath('pdf_url', $pdf['url']);

        $this->putJson('/api/resume', ['pdf_url' => '/resume.pdf'])
            ->assertOk()
            ->assertJsonPath('pdf', null)
            ->assertJsonPath('pdf_url', '/resume.pdf');

        Storage::disk('public')->assertMissing($pdf['key']);
        $this->assertSame(1, Resume::count());
    }

    /* ── Regression ─────────────────────────────────────────── */

    public function test_timeline_endpoint_uses_the_timeline_table(): void
    {
        $this->getJson('/api/timeline')->assertOk()->assertExactJson([]);
    }
}
