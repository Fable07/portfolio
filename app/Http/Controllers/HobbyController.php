<?php

namespace App\Http\Controllers;

use App\Models\Hobby;
use Illuminate\Http\Request;

class HobbyController extends Controller
{
    /**
     * GET /api/hobbies
     * Return all hobbies ordered by display order
     */
    public function index()
    {
        return response()->json(
            Hobby::orderBy('order')->orderBy('created_at')->get()
        );
    }

    /**
     * POST /api/hobbies
     * Create a new hobby
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $hobby = Hobby::create($request->only([
            'name',
            'icon',
            'description',
            'order',
        ]));

        return response()->json($hobby, 201);
    }

    /**
     * PUT /api/hobbies/{id}
     * Update an existing hobby
     */
    public function update(Request $request, $id)
    {
        $hobby = Hobby::findOrFail($id);

        $hobby->update($request->only([
            'name',
            'icon',
            'description',
            'order',
        ]));

        return response()->json($hobby);
    }

    /**
     * DELETE /api/hobbies/{id}
     * Delete a hobby
     */
    public function destroy($id)
    {
        Hobby::findOrFail($id)->delete();

        return response()->json(['message' => 'Hobby deleted successfully']);
    }
}
