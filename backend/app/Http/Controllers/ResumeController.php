<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Support\MediaRules;
use Illuminate\Http\Request;

class ResumeController extends Controller
{
    // GET /api/resume
    public function show()
    {
        $resume = Resume::first();

        return response()->json($resume ?? ['pdf_url' => null, 'pdf' => null]);
    }

    // PUT /api/resume  { pdf_url } and/or { pdf: MediaItem }
    public function update(Request $request)
    {
        $data = $request->validate([
            'pdf_url' => ['required_without:pdf', 'nullable', 'string', 'max:255'],
            ...MediaRules::one('pdf'),
        ]);

        // A pasted URL replaces a previously uploaded PDF (its file gets cleaned up)
        if (! array_key_exists('pdf', $data)) {
            $data['pdf'] = null;
        }

        $resume = Resume::first();
        $resume ? $resume->update($data) : $resume = Resume::create($data);

        return response()->json($resume->fresh());
    }
}
