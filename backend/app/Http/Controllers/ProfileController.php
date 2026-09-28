<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Support\MediaRules;
use Illuminate\Http\Request;

/**
 * ProfileController — the site owner's profile (single record).
 *
 * GET returns null until the profile is saved once from the admin; the frontend then
 * falls back to the defaults in src/config/profile.js.
 */
class ProfileController extends Controller
{
    /** Built-in icon file names shipped with the frontend, e.g. "vue-js.png" */
    private const ICON_KEY = 'regex:/^[a-z0-9-]+\.(png|svg)$/';

    // GET /api/profile
    public function show()
    {
        return response()->json(Profile::first());
    }

    // PUT /api/profile  (whole document)
    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'handle' => ['nullable', 'string', 'max:30', 'regex:/^[a-z0-9_-]+$/'],
            'email' => ['nullable', 'email', 'max:255'],
            'location' => ['nullable', 'string', 'max:120'],
            'availability' => ['nullable', 'string', 'max:80'],

            'roles' => ['nullable', 'array', 'list', 'max:6'],
            'roles.*' => ['required', 'string', 'max:80'],

            'about' => ['nullable', 'array', 'list', 'max:10'],
            'about.*' => ['required', 'string', 'max:2000'],

            ...MediaRules::one('avatar'),

            'skill_groups' => ['nullable', 'array', 'list', 'max:12'],
            'skill_groups.*.title' => ['required', 'string', 'max:60'],
            'skill_groups.*.skills' => ['present', 'array', 'list', 'max:40'],
            'skill_groups.*.skills.*.name' => ['required', 'string', 'max:60'],
            'skill_groups.*.skills.*.icon' => ['nullable', 'string', 'max:80', self::ICON_KEY],
            ...MediaRules::one('skill_groups.*.skills.*.icon_media'),

            'social_links' => ['nullable', 'array', 'list', 'max:15'],
            'social_links.*.label' => ['required', 'string', 'max:40'],
            // Only web and email links — blocks javascript: and other schemes
            'social_links.*.href' => ['required', 'string', 'max:500', 'regex:/^(https?:\/\/|mailto:)\S+$/i'],
            'social_links.*.icon' => ['nullable', 'string', 'max:80', self::ICON_KEY],
        ]);

        $profile = Profile::first();
        $profile ? $profile->update($data) : $profile = Profile::create($data);

        return response()->json($profile->fresh());
    }
}
