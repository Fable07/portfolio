<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Contact form (public) and inbox (admin only). */
class MessageTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_replace([
            'name' => 'Recruiter',
            'email' => 'hiring@example.com',
            'subject' => 'Interview',
            'body' => 'Hi Jefferson, we would like to talk about a role.',
        ], $overrides);
    }

    public function test_anyone_can_send_a_message(): void
    {
        $this->postJson('/api/messages', $this->payload())
            ->assertCreated()
            ->assertJsonPath('message', 'Thanks — your message was sent.');

        $message = Message::sole();
        $this->assertSame('hiring@example.com', $message->email);
        $this->assertNull($message->read_at); // starts unread
        $this->assertArrayHasKey('ip', $message->meta);
    }

    public function test_message_fields_are_validated(): void
    {
        $this->postJson('/api/messages', $this->payload(['email' => 'not-an-email']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->postJson('/api/messages', $this->payload(['body' => 'too short']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('body');

        $this->assertSame(0, Message::count());
    }

    public function test_honeypot_submissions_are_silently_dropped(): void
    {
        $this->postJson('/api/messages', $this->payload(['website' => 'http://spam.example']))
            ->assertCreated(); // bots get a normal-looking answer

        $this->assertSame(0, Message::count());
    }

    public function test_sending_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/messages', $this->payload())->assertCreated();
        }

        $this->postJson('/api/messages', $this->payload())->assertStatus(429);
        $this->assertSame(5, Message::count());
    }

    public function test_only_admins_can_read_manage_and_delete_messages(): void
    {
        $message = Message::create($this->payload());

        $this->getJson('/api/messages')->assertUnauthorized();
        $this->putJson("/api/messages/{$message->id}", ['read' => true])->assertUnauthorized();
        $this->deleteJson("/api/messages/{$message->id}")->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/messages')
            ->assertOk()
            ->assertJsonPath('unread', 1)
            ->assertJsonPath('data.0.is_read', false)
            ->assertJsonPath('data.0.subject', 'Interview');

        $this->putJson("/api/messages/{$message->id}", ['read' => true])
            ->assertOk()
            ->assertJsonPath('is_read', true);
        $this->getJson('/api/messages')->assertJsonPath('unread', 0);

        // Marking it unread again clears the timestamp
        $this->putJson("/api/messages/{$message->id}", ['read' => false])->assertJsonPath('is_read', false);

        $this->deleteJson("/api/messages/{$message->id}")->assertOk();
        $this->assertSame(0, Message::count());
    }
}
