<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $workspaceId = session('current_workspace_id');

        $categories = Category::where('workspace_id', $workspaceId)
            ->whereNull('parent_id')
            ->with(['subcategories'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:expense,income'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'icon' => ['required', 'string'],
            'color' => ['required', 'string'],
        ]);

        Category::create([
            'workspace_id' => $workspaceId,
            'user_id' => $user->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'parent_id' => $validated['parent_id'] ?? null,
            'icon' => $validated['icon'],
            'color' => $validated['color'],
        ]);

        return back()->with('success', 'Catégorie créée avec succès !');
    }

    public function update(Request $request, $id)
    {
        $workspaceId = session('current_workspace_id');
        $category = Category::where('workspace_id', $workspaceId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['required', 'string'],
            'color' => ['required', 'string'],
        ]);

        $category->update($validated);

        return back()->with('success', 'Catégorie mise à jour.');
    }

    public function destroy($id)
    {
        $workspaceId = session('current_workspace_id');
        $category = Category::where('workspace_id', $workspaceId)->findOrFail($id);

        $category->delete();

        return back()->with('success', 'Catégorie supprimée.');
    }
}
