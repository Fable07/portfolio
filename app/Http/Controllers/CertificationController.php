<?php

namespace App\Http\Controllers;

use App\Models\Certification;
use App\Support\MediaRules;
use Illuminate\Http\Request;

class CertificationController extends Controller
{
    // GET /api/certifications
    public function index()
    {
        return response()->json(
            Certification::orderBy('order')->orderBy('created_at', 'desc')->get()
        );
    }

    // POST /api/certifications
    public function store(Request $request)
    {
        $certification = Certification::create($this->validated($request));

        return response()->json($certification, 201);
    }

    // PUT /api/certifications/{id}
    public function update(Request $request, $id)
    {
        $certification = Certification::findOrFail($id);
        $certification->update($this->validated($request, updating: true));

        return response()->json($certification->fresh());
    }

    // DELETE /api/certifications/{id}  (HasMedia deletes the badge file too)
    public function destroy($id)
    {
        Certification::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    private function validated(Request $request, bool $updating = false): array
    {
        return $request->validate([
            'title' => [$updating ? 'sometimes' : 'required', 'string', 'max:255'],
            'issuer' => ['nullable', 'string', 'max:255'],
            'date' => ['nullable', 'string', 'max:255'],
            'credential_url' => ['nullable', 'string', 'max:255'],
            'badge_url' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer'],
            ...MediaRules::one('badge'),
        ]);
    }
}
