<?php

namespace App\Http\Controllers;

use App\Models\Hobby;
use App\Support\MediaRules;
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
        $hobby = Hobby::create($this->validated($request));

        return response()->json($hobby, 201);
    }

    /**
     * PUT /api/hobbies/{id}
     * Update an existing hobby
     */
    public function update(Request $request, $id)
    {
        $hobby = Hobby::findOrFail($id);
        $hobby->update($this->validated($request, updating: true));

        return response()->json($hobby->fresh());
    }

    /**
     * DELETE /api/hobbies/{id}
     * Delete a hobby (HasMedia deletes its image file too)
     */
    public function destroy($id)
    {
        Hobby::findOrFail($id)->delete();

        return response()->json(['message' => 'Hobby deleted successfully']);
    }

    private function validated(Request $request, bool $updating = false): array
    {
        return $request->validate([
            'name' => [$updating ? 'sometimes' : 'required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:2000'],
            'order' => ['nullable', 'integer'],
            ...MediaRules::one('image'),
        ]);
    }
}
