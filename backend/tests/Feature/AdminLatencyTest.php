<?php

namespace Tests\Feature;

use App\Database\PostgresConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Fewer database round trips per admin request (see PersonalAccessToken, PostgresConnection). */
class AdminLatencyTest extends TestCase
{
    use RefreshDatabase;

    private function me(string $token)
    {
        $this->app['auth']->forgetGuards(); // resolve the token fresh on every request

        return $this->withToken($token)->getJson('/api/auth/me')->assertOk();
    }

    public function test_token_last_used_at_is_written_at_most_every_few_minutes(): void
    {
        $user = User::factory()->create();
        $new = $user->createToken('admin-panel');
        $token = $new->accessToken;

        // First use: recorded
        $this->me($new->plainTextToken);
        $this->assertNotNull($first = $token->fresh()->last_used_at);

        // Used again a minute later: the write is skipped
        $this->travel(1)->minutes();
        $this->me($new->plainTextToken);
        $this->assertTrue($token->fresh()->last_used_at->equalTo($first));

        // Past the resolution window: recorded again
        $this->travel(10)->minutes();
        $this->me($new->plainTextToken);
        $this->assertTrue($token->fresh()->last_used_at->gt($first));
    }

    public function test_other_token_changes_still_save(): void
    {
        $token = User::factory()->create()->createToken('admin-panel')->accessToken;
        $token->forceFill(['last_used_at' => now()])->save();

        $token->update(['name' => 'renamed']);

        $this->assertSame('renamed', $token->fresh()->name);
    }

    public function test_postgres_connection_binds_booleans_as_literals(): void
    {
        $connection = new PostgresConnection(fn () => null, 'db');

        $this->assertSame(['true', 'false', 1, 'x'], $connection->prepareBindings([true, false, 1, 'x']));
    }
}
