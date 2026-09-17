<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Support\MediaRules;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // GET /api/projects  (?drafts=1 as admin includes unpublished projects)
    public function index(Request $request)
    {
        return response()->json(
            Project::query()
                ->when(! $this->wantsDrafts($request), fn ($query) => $query->where('is_published', true))
                ->orderBy('order')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    // GET /api/projects/{id}  (drafts are 404 for visitors)
    public function show(Request $request, $id)
    {
        return response()->json(
            Project::query()
                ->when(! auth('sanctum')->check(), fn ($query) => $query->where('is_published', true))
                ->findOrFail($id)
        );
    }

    // POST /api/projects
    public function store(Request $request)
    {
        $project = Project::create($this->validated($request));

        return response()->json($project->fresh(), 201);
    }

    // PUT /api/projects/{id}  (partial updates allowed, e.g. { is_featured: true })
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $project->update($this->validated($request, updating: true));

        return response()->json($project->fresh());
    }

    // DELETE /api/projects/{id}  (HasMedia deletes the gallery files too)
    public function destroy($id)
    {
        Project::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    // PUT /api/projects/reorder  { order: [id, id, …] }
    public function reorder(Request $request)
    {
        return $this->saveOrder($request, Project::class);
    }

    private function validated(Request $request, bool $updating = false): array
    {
        return $request->validate([
            'title' => [$updating ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'tech_stack' => ['nullable', 'string', 'max:255'],
            'project_url' => ['nullable', 'string', 'max:255'],
            'github_url' => ['nullable', 'string', 'max:255'],
            'thumbnail_url' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer'],
            'is_published' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            ...MediaRules::many('media', config('media.max_gallery_items')),
        ]);
    }
}
