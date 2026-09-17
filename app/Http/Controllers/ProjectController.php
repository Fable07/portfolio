<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Support\MediaRules;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // GET /api/projects
    public function index()
    {
        return response()->json(
            Project::orderBy('order')->orderBy('created_at', 'desc')->get()
        );
    }

    // GET /api/projects/{id}
    public function show($id)
    {
        return response()->json(Project::findOrFail($id));
    }

    // POST /api/projects
    public function store(Request $request)
    {
        $project = Project::create($this->validated($request));

        return response()->json($project, 201);
    }

    // PUT /api/projects/{id}
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
        $request->validate(['order' => 'required|array', 'order.*' => 'integer']);

        foreach ($request->input('order') as $index => $id) {
            Project::where('id', $id)->update(['order' => $index]);
        }

        return response()->json(['message' => 'Reordered successfully']);
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
            ...MediaRules::many('media', config('media.max_gallery_items')),
        ]);
    }
}
