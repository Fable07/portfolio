<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Public content responses are cached until an admin write (CachePublicResponse / FlushPublicCache). */
class PublicCacheTest extends TestCase
{
    use RefreshDatabase;

    private function publishedProject(string $title): Project
    {
        return Project::create(['title' => $title, 'is_published' => true]);
    }

    /** Sanctum::actingAs sticks to the guard; drop it so the next request is a visitor again. */
    private function actAsVisitor(): void
    {
        $this->app['auth']->forgetGuards();
    }

    public function test_public_response_is_served_from_cache(): void
    {
        $this->publishedProject('First');

        $this->getJson('/api/projects')->assertOk()->assertHeader('X-Cache', 'MISS')->assertJsonCount(1);

        // Written straight to the database (like an edit from local dev): not visible until the cache clears
        $this->publishedProject('Second');

        $this->getJson('/api/projects')->assertOk()->assertHeader('X-Cache', 'HIT')->assertJsonCount(1);
    }

    public function test_admin_write_clears_the_cache(): void
    {
        $project = $this->publishedProject('Old title');
        $this->getJson('/api/projects')->assertHeader('X-Cache', 'MISS');

        Sanctum::actingAs(User::factory()->create());
        $this->putJson("/api/projects/{$project->id}", ['title' => 'New title'])->assertOk();
        $this->actAsVisitor();

        $this->getJson('/api/projects')
            ->assertHeader('X-Cache', 'MISS')
            ->assertJsonPath('0.title', 'New title');
    }

    public function test_failed_admin_write_keeps_the_cache(): void
    {
        $project = $this->publishedProject('Title');
        $this->getJson('/api/projects')->assertHeader('X-Cache', 'MISS');

        Sanctum::actingAs(User::factory()->create());
        $this->putJson("/api/projects/{$project->id}", ['title' => str_repeat('x', 300)])->assertUnprocessable();
        $this->actAsVisitor();

        $this->getJson('/api/projects')->assertHeader('X-Cache', 'HIT');
    }

    public function test_admins_and_query_strings_bypass_the_cache(): void
    {
        $this->publishedProject('Published');
        Project::create(['title' => 'Draft', 'is_published' => false]);
        $this->getJson('/api/projects')->assertJsonCount(1);

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/projects?drafts=1')->assertHeaderMissing('X-Cache')->assertJsonCount(2);
        $this->getJson('/api/projects')->assertHeaderMissing('X-Cache');
    }

    public function test_errors_are_not_cached(): void
    {
        $this->getJson('/api/projects/999')->assertNotFound()->assertHeaderMissing('X-Cache');

        $project = $this->publishedProject('Now exists');
        $this->getJson("/api/projects/{$project->id}")->assertOk()->assertHeader('X-Cache', 'MISS');
    }
}
