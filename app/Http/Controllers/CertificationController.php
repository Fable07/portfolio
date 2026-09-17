<?php

namespace App\Http\Controllers;

use App\Models\Certification;
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
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $certification = Certification::create($request->only([
            'title',
            'issuer',
            'date',
            'credential_url',
            'badge_url',
            'order',
        ]));

        return response()->json($certification, 201);
    }

    // PUT /api/certifications/{id}
    public function update(Request $request, $id)
    {
        $certification = Certification::findOrFail($id);

        $certification->update($request->only([
            'title',
            'issuer',
            'date',
            'credential_url',
            'badge_url',
            'order',
        ]));

        return response()->json($certification);
    }

    // DELETE /api/certifications/{id}
    public function destroy($id)
    {
        Certification::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
