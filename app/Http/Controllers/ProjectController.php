<?php

namespace App\Http\Controllers;

use App\Models\Project;
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

    // POST /api/projects
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $project = Project::create($request->only([
            'title',
            'description',
            'tech_stack',
            'project_url',
            'github_url',
            'thumbnail_url',
            'order',
        ]));

        return response()->json($project, 201);
    }

    // PUT /api/projects/{id}
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $project->update($request->only([
            'title',
            'description',
            'tech_stack',
            'project_url',
            'github_url',
            'thumbnail_url',
            'order',
        ]));

        return response()->json($project);
    }

    // DELETE /api/projects/{id}
    public function destroy($id)
    {
        Project::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // PUT /api/projects/reorder
    public function reorder(Request $request)
    {
        $order = $request->input('order'); // array of ids in new order
        foreach ($order as $index => $id) {
            Project::where('id', $id)->update(['order' => $index]);
        }
        return response()->json(['message' => 'Reordered successfully']);
    }
}
