<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;

class ResumeController extends Controller
{
    // GET /api/resume
    public function show()
    {
        $resume = Resume::first();
        return response()->json($resume ?? ['pdf_url' => null]);
    }

    // PUT /api/resume
    public function update(Request $request)
    {
        $request->validate([
            'pdf_url' => 'required|string',
        ]);

        $resume = Resume::first();

        if ($resume) {
            $resume->update(['pdf_url' => $request->pdf_url]);
        } else {
            $resume = Resume::create(['pdf_url' => $request->pdf_url]);
        }

        return response()->json($resume);
    }
}
