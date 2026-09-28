<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Save a new display order: PUT /api/{resource}/reorder  { order: [3, 1, 2] }
     * The first id gets order 0, the next 1, and so on.
     *
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $model
     */
    protected function saveOrder(Request $request, string $model)
    {
        $ids = $request->validate([
            'order' => ['required', 'array', 'list', 'max:500'],
            'order.*' => ['integer', 'distinct'],
        ])['order'];

        foreach ($ids as $index => $id) {
            $model::whereKey($id)->update(['order' => $index]);
        }

        return response()->json(['message' => 'Reordered successfully']);
    }

    /**
     * Drafts are only included for a signed-in admin who asks for them (?drafts=1).
     * Public routes have no auth middleware, so the Sanctum guard is checked directly.
     */
    protected function wantsDrafts(Request $request): bool
    {
        return $request->boolean('drafts') && auth('sanctum')->check();
    }
}
