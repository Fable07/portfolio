<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Cloudinary driver against a faked API: resource types, delivery URLs and previews. */
class CloudinaryUploadTest extends TestCase
{
    use RefreshDatabase;

    private const BASE = 'https://res.cloudinary.com/demo';

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'media.driver' => 'cloudinary',
            'media.folder' => 'portfolio-test',
            'media.cloudinary' => ['cloud_name' => 'demo', 'api_key' => 'key', 'api_secret' => 'secret'],
        ]);
        Sanctum::actingAs(User::factory()->create());
    }

    private function fakeUpload(string $resourceType, string $path): void
    {
        Http::fake(["api.cloudinary.com/v1_1/demo/{$resourceType}/upload" => Http::response([
            'secure_url' => self::BASE."/{$resourceType}/upload/v1/{$path}",
            'public_id' => 'portfolio-test/x/'.pathinfo($path, PATHINFO_FILENAME),
            'resource_type' => $resourceType,
            'bytes' => 100,
        ])]);
    }

    public function test_video_is_delivered_as_mp4_with_a_poster(): void
    {
        $this->fakeUpload('video', 'clip.mov');
        $mov = UploadedFile::fake()->createWithContent('clip.mov', "\x00\x00\x00\x14ftypqt  \x00\x00\x00\x00qt  ");

        $this->postJson('/api/media', ['collection' => 'hobbies', 'file' => $mov])
            ->assertCreated()
            ->assertJsonPath('type', 'video')
            ->assertJsonPath('url', self::BASE.'/video/upload/v1/clip.mp4')
            ->assertJsonPath('thumbnail_url', self::BASE.'/video/upload/so_0/v1/clip.jpg');
    }

    public function test_pdf_is_an_image_resource_with_a_page_one_preview(): void
    {
        $this->fakeUpload('image', 'cert.pdf');
        $pdf = UploadedFile::fake()->createWithContent('cert.pdf', "%PDF-1.4\n%%EOF");

        $this->postJson('/api/media', ['collection' => 'certifications', 'file' => $pdf])
            ->assertCreated()
            ->assertJsonPath('type', 'document')
            ->assertJsonPath('resource_type', 'image')
            ->assertJsonPath('url', self::BASE.'/image/upload/v1/cert.pdf')
            ->assertJsonPath('thumbnail_url', self::BASE.'/image/upload/pg_1,w_1200,c_limit/v1/cert.jpg');

        Http::assertSent(fn (Request $request) => ! str_contains($request->body(), 'c_limit,w_2560'));
    }

    public function test_deleting_content_destroys_the_asset_and_purges_the_cdn(): void
    {
        Http::fake(['api.cloudinary.com/v1_1/demo/video/destroy' => Http::response(['result' => 'ok'])]);
        $clip = [
            'id' => 'c1', 'type' => 'video', 'provider' => 'cloudinary', 'resource_type' => 'video',
            'url' => self::BASE.'/video/upload/v1/portfolio-test/hobbies/abc.mp4', 'key' => 'portfolio-test/hobbies/abc',
        ];
        $id = $this->postJson('/api/hobbies', ['name' => 'H', 'media' => [$clip]])->assertCreated()->json('id');

        $this->deleteJson("/api/hobbies/{$id}")->assertOk();

        Http::assertSent(fn (Request $request) => $request['public_id'] === 'portfolio-test/hobbies/abc'
            && $request['invalidate'] === 'true');
    }

    public function test_stored_lists_every_resource_type_across_pages(): void
    {
        Http::fake([
            'api.cloudinary.com/v1_1/demo/resources/image/upload*' => Http::sequence()
                ->push(['resources' => [['public_id' => 'portfolio-test/a', 'created_at' => '2026-01-01T00:00:00Z']], 'next_cursor' => 'n2'])
                ->push(['resources' => [['public_id' => 'portfolio-test/b', 'created_at' => '2026-01-02T00:00:00Z']]]),
            'api.cloudinary.com/v1_1/demo/resources/video/upload*' => Http::response(['resources' => [['public_id' => 'portfolio-test/c', 'created_at' => '2026-01-03T00:00:00Z']]]),
            'api.cloudinary.com/v1_1/demo/resources/raw/upload*' => Http::response(['resources' => []]),
        ]);

        $stored = collect(app(\App\Services\Media\MediaManager::class)->uploads()->stored());

        $this->assertSame(['portfolio-test/a', 'portfolio-test/b', 'portfolio-test/c'], $stored->pluck('key')->all());
        $this->assertSame('video', $stored[2]['resource_type']);
        Http::assertSent(fn (Request $request) => str_contains($request->url(), 'next_cursor=n2')
            && str_contains($request->url(), 'prefix=portfolio-test%2F'));
    }

    public function test_images_are_capped_at_upload_and_the_cap_is_signed(): void
    {
        $this->fakeUpload('image', 'photo.png');
        $png = UploadedFile::fake()->createWithContent('photo.png', base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        ));

        $this->postJson('/api/media', ['collection' => 'projects', 'file' => $png])->assertCreated();

        Http::assertSent(function (Request $request) {
            $fields = collect($request->data())->pluck('contents', 'name');
            $signed = collect($fields)->except(['file', 'api_key', 'signature'])->sortKeys()
                ->map(fn ($value, $key) => "{$key}={$value}")->implode('&');

            return $fields['transformation'] === 'c_limit,w_2560,h_2560'
                && $fields['signature'] === sha1($signed.'secret');
        });
    }
}
