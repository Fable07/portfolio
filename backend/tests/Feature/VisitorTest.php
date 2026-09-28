<?php

namespace Tests\Feature;

use App\Models\Visitor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Anonymous visitor counter (S6: validated visitor_id, rare cleanup). */
class VisitorTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_new_visitor_id_is_recorded_and_counted(): void
    {
        $this->postJson('/api/visitors/increment', ['visitor_id' => 'abc123'])
            ->assertOk()
            ->assertJsonPath('count', 1);

        $this->assertSame(1, Visitor::count());
    }

    public function test_the_same_visitor_id_within_14_days_is_not_double_counted(): void
    {
        $this->postJson('/api/visitors/increment', ['visitor_id' => 'abc123'])->assertOk();
        $this->postJson('/api/visitors/increment', ['visitor_id' => 'abc123'])
            ->assertOk()
            ->assertJsonPath('count', 1);

        $this->assertSame(1, Visitor::count());
    }

    public function test_visitor_id_is_required(): void
    {
        $this->postJson('/api/visitors/increment', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('visitor_id');
    }

    public function test_visitor_id_must_be_a_string_of_at_most_64_characters(): void
    {
        $this->postJson('/api/visitors/increment', ['visitor_id' => str_repeat('a', 65)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('visitor_id');

        $this->postJson('/api/visitors/increment', ['visitor_id' => ['not', 'a', 'string']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('visitor_id');
    }

    public function test_count_endpoint_reports_unique_visitors_without_recording_one(): void
    {
        Visitor::insert([
            ['visitor_id' => 'a', 'visited_at' => now()],
            ['visitor_id' => 'b', 'visited_at' => now()],
        ]);

        $this->getJson('/api/visitors/count')
            ->assertOk()
            ->assertJsonPath('count', 2);

        $this->assertSame(2, Visitor::count());
    }
}
