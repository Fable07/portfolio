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
        $request->validate([
            'type'        => 'required|in:education,work',
            'title'       => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'start_date'  => 'required|string|max:50',
        ]);

        $entry = Timeline::create($request->only([
            'type',
            'title',
            'institution',
            'location',
            'start_date',
            'end_date',
            'description',
            'order',
        ]));

        return response()->json($entry, 201);
    }

    /**
     * PUT /api/timeline/{id}
     * Update an existing timeline entry
     */
    public function update(Request $request, $id)
    {
        $entry = Timeline::findOrFail($id);

        $entry->update($request->only([
            'type',
            'title',
            'institution',
            'location',
            'start_date',
            'end_date',
            'description',
            'order',
        ]));

        return response()->json($entry);
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
}
