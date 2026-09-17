<?php

namespace App\Http\Controllers;

use App\Models\Timeline;
use Illuminate\Http\Request;

class TimelineController extends Controller
{
    /**
     * GET /api/timeline
     * Return all timeline entries ordered by order field then date
     */
    public function index()
    {
        return response()->json(
            Timeline::orderBy('order')->orderBy('start_date', 'desc')->get()
        );
    }

    /**
     * POST /api/timeline
     * Create a new timeline entry
     */
    public function store(Request $request)
    {
        $entry = Timeline::create($this->validated($request));

        return response()->json($entry->fresh(), 201);
    }

    /**
     * PUT /api/timeline/{id}
     * Update an existing timeline entry
     */
    public function update(Request $request, $id)
    {
        $entry = Timeline::findOrFail($id);
        $entry->update($this->validated($request, updating: true));

        return response()->json($entry->fresh());
    }

    /**
     * DELETE /api/timeline/{id}
     * Delete a timeline entry
     */
    public function destroy($id)
    {
        Timeline::findOrFail($id)->delete();

        return response()->json(['message' => 'Timeline entry deleted successfully']);
    }

    /** PUT /api/timeline/reorder */
    public function reorder(Request $request)
    {
        return $this->saveOrder($request, Timeline::class);
    }

    private function validated(Request $request, bool $updating = false): array
    {
        $required = $updating ? 'sometimes' : 'required';

        return $request->validate([
            'type' => [$required, 'in:education,work'],
            'title' => [$required, 'string', 'max:255'],
            'institution' => [$required, 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'start_date' => [$required, 'string', 'max:50'],
            'end_date' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:5000'],
            'order' => ['nullable', 'integer'],
        ]);
    }
}
