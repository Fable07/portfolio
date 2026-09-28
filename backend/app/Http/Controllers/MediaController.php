<?php

namespace App\Http\Controllers;

use App\Services\Media\MediaManager;
use App\Services\Media\VideoEmbed;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * MediaController — admin-only endpoints for files.
 *
 * Flow: the admin uploads a file here FIRST and gets back a media item (JSON).
 * That JSON is then saved with the project/certification/… like any other field.
 */
class MediaController extends Controller
{
    public function __construct(private readonly MediaManager $media) {}

    /**
     * POST /api/media  (multipart: file, collection)
     * Returns the stored file's media item.
     */
    public function store(Request $request)
    {
        $request->validate([
            'collection' => ['required', Rule::in(array_keys(config('media.collections')))],
            'file' => ['required', 'file'],
        ]);

        $collection = $request->input('collection');
        $file = $request->file('file');
        $kind = $this->kindOf($file->guessExtension() ?? '', $collection);

        $rules = config("media.kinds.{$kind}");
        $request->validate([
            'file' => ['mimes:'.implode(',', $rules['mimes']), "max:{$rules['max_kb']}"],
        ]);

        return response()->json($this->media->uploads()->store($file, $kind, $collection), 201);
    }

    /**
     * POST /api/media/embed  { url }
     * Validates a YouTube/Vimeo link and returns an embed media item (nothing is stored).
     */
    public function embed(Request $request)
    {
        $request->validate(['url' => ['required', 'string', 'max:500']]);

        $item = VideoEmbed::fromUrl($request->input('url'));
        if (! $item) {
            throw ValidationException::withMessages(['url' => 'Use a YouTube or Vimeo video link.']);
        }

        return response()->json($item, 201);
    }

    /**
     * DELETE /api/media  { provider, key, resource_type? }
     * Deletes an uploaded file that was never saved to content (e.g. the admin
     * uploaded then cancelled the form). Saved content cleans up via HasMedia.
     */
    public function destroy(Request $request)
    {
        $item = $request->validate([
            'provider' => ['required', Rule::in(['local', 'cloudinary'])],
            'key' => ['required', 'string', 'max:512'],
            'resource_type' => ['nullable', Rule::in(['image', 'video', 'raw'])],
        ]);

        $this->media->deleteMany([$item]);

        return response()->json(['message' => 'Deleted']);
    }

    /** Work out if a file is an image, video or document, and whether this collection allows it. */
    private function kindOf(string $extension, string $collection): string
    {
        $allowed = config("media.collections.{$collection}");

        foreach ($allowed as $kind) {
            if (in_array(strtolower($extension), config("media.kinds.{$kind}.mimes"), true)) {
                return $kind;
            }
        }

        $accepted = collect($allowed)->flatMap(fn ($kind) => config("media.kinds.{$kind}.mimes"))->implode(', ');
        throw ValidationException::withMessages(['file' => "This file type isn't allowed here. Accepted: {$accepted}."]);
    }
}
