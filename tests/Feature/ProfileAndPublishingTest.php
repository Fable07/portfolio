<?php

namespace Tests\Feature;

use App\Models\Certification;
use App\Models\Hobby;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Phase 3: editable profile, drafts/featured, and reordering. */
class ProfileAndPublishingTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public', ['url' => 'http://localhost/storage']);
        config(['media.driver' => 'local', 'media.folder' => 'portfolio-test']);
    }

    private function actingAsAdmin(): void
    {
        Sanctum::actingAs(User::factory()->create());
    }

    private function uploadImage(string $collection): array
    {
        return $this->postJson('/api/media', [
            'collection' => $collection,
            'file' => UploadedFile::fake()->createWithContent('icon.png', base64_decode(self::PNG)),
        ])->assertCreated()->json();
    }

    private function profilePayload(array $overrides = []): array
    {
        return array_replace([
            'name' => 'Jefferson S. Caragay',
            'handle' => 'jefferson',
            'email' => 'me@example.com',
            'availability' => 'Open to work',
            'roles' => ['Aspiring Fullstack Developer'],
            'about' => ['I build modern web experiences.'],
            'skill_groups' => [
                ['title' => 'Frameworks', 'skills' => [['name' => 'Vue JS', 'icon' => 'vue-js.png']]],
            ],
            'social_links' => [
                ['label' => 'GitHub', 'href' => 'https://github.com/Fable07', 'icon' => 'github.png'],
                ['label' => 'Email', 'href' => 'mailto:me@example.com', 'icon' => 'gmail.png'],
            ],
        ], $overrides);
    }

    /* ── Profile ─────────────────────────────────────────────── */

    public function test_profile_is_null_until_saved_and_then_public(): void
    {
        $this->getJson('/api/profile')->assertOk()->assertContent('{}');

        $this->putJson('/api/profile', $this->profilePayload())->assertUnauthorized();

        $this->actingAsAdmin();
        $this->putJson('/api/profile', $this->profilePayload())
            ->assertOk()
            ->assertJsonPath('skill_groups.0.skills.0.name', 'Vue JS');

        $this->getJson('/api/profile')->assertOk()->assertJsonPath('availability', 'Open to work');
    }

    public function test_profile_rejects_unsafe_links_and_icon_names(): void
    {
        $this->actingAsAdmin();

        $this->putJson('/api/profile', $this->profilePayload([
            'social_links' => [['label' => 'Bad', 'href' => 'javascript:alert(1)']],
        ]))->assertUnprocessable()->assertJsonValidationErrors('social_links.0.href');

        $this->putJson('/api/profile', $this->profilePayload([
            'skill_groups' => [['title' => 'X', 'skills' => [['name' => 'Y', 'icon' => '../../.env']]]],
        ]))->assertUnprocessable()->assertJsonValidationErrors('skill_groups.0.skills.0.icon');
    }

    public function test_removed_custom_skill_icon_and_avatar_files_are_deleted(): void
    {
        $this->actingAsAdmin();
        $icon = $this->uploadImage('profile');
        $avatar = $this->uploadImage('profile');

        $this->putJson('/api/profile', $this->profilePayload([
            'avatar' => $avatar,
            'skill_groups' => [['title' => 'Tools', 'skills' => [['name' => 'Custom', 'icon_media' => $icon]]]],
        ]))->assertOk()->assertJsonPath('skill_groups.0.skills.0.icon_media.key', $icon['key']);

        // Replace the custom icon with a built-in one and remove the avatar
        $this->putJson('/api/profile', $this->profilePayload([
            'avatar' => null,
            'skill_groups' => [['title' => 'Tools', 'skills' => [['name' => 'Custom', 'icon' => 'git.png']]]],
        ]))->assertOk();

        Storage::disk('public')->assertMissing($icon['key']);
        Storage::disk('public')->assertMissing($avatar['key']);
    }

    /* ── Drafts & featured ───────────────────────────────────── */

    public function test_drafts_are_hidden_from_visitors_but_visible_to_admin(): void
    {
        $published = Project::create(['title' => 'Live']);
        $draft = Project::create(['title' => 'Secret', 'is_published' => false]);
        Certification::create(['title' => 'Draft cert', 'is_published' => false]);

        $this->getJson('/api/projects')->assertJsonCount(1)->assertJsonPath('0.title', 'Live');
        $this->getJson('/api/projects?drafts=1')->assertJsonCount(1); // ignored for guests
        $this->getJson("/api/projects/{$draft->id}")->assertNotFound();
        $this->getJson('/api/certifications')->assertJsonCount(0);

        $this->actingAsAdmin();
        $this->getJson('/api/projects?drafts=1')->assertJsonCount(2);
        $this->getJson("/api/projects/{$draft->id}")->assertOk();
        $this->getJson('/api/certifications?drafts=1')->assertJsonCount(1);
        $this->assertTrue($published->fresh()->is_published);
    }

    public function test_partial_update_toggles_featured_and_published(): void
    {
        $this->actingAsAdmin();
        $project = Project::create(['title' => 'Portfolio', 'description' => 'Keep me']);

        $this->putJson("/api/projects/{$project->id}", ['is_featured' => true, 'is_published' => false])
            ->assertOk()
            ->assertJsonPath('is_featured', true)
            ->assertJsonPath('is_published', false)
            ->assertJsonPath('description', 'Keep me');
    }

    /* ── Reordering ──────────────────────────────────────────── */

    public function test_every_list_can_be_reordered(): void
    {
        $this->actingAsAdmin();
        $a = Hobby::create(['name' => 'A']);
        $b = Hobby::create(['name' => 'B']);

        $this->putJson('/api/hobbies/reorder', ['order' => [$b->id, $a->id]])->assertOk();
        $this->getJson('/api/hobbies')->assertJsonPath('0.name', 'B');

        $c1 = Certification::create(['title' => 'One']);
        $c2 = Certification::create(['title' => 'Two']);
        $this->putJson('/api/certifications/reorder', ['order' => [$c2->id, $c1->id]])->assertOk();
        $this->getJson('/api/certifications')->assertJsonPath('0.title', 'Two');

        $this->putJson('/api/timeline/reorder', ['order' => ['x']])->assertUnprocessable();
    }
}
