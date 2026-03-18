<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::query();

        if (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        $categories = $query->get();
        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
            'type' => 'required|in:income,expense',
            'user_id' => 'sometimes|exists:users,id',
        ]);

        $userId = $request->user()->id;
        if ($request->user()->isAdmin() && isset($validated['user_id'])) {
            $userId = $validated['user_id'];
        }

        $category = Category::create([
            ...$validated,
            'user_id' => $userId,
        ]);

        return response()->json($category, 201);
    }

    public function show(Category $category): JsonResponse
    {
        Gate::authorize('view', $category);
        return response()->json($category);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        Gate::authorize('update', $category);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
            'type' => 'in:income,expense',
            'user_id' => 'sometimes|exists:users,id',
        ]);

        if ($request->user()->isAdmin() && isset($validated['user_id'])) {
            $category->user_id = $validated['user_id'];
        }

        $category->update($validated);
        return response()->json($category);
    }

    public function destroy(Category $category): JsonResponse
    {
        Gate::authorize('delete', $category);
        $category->delete();
        return response()->json(null, 204);
    }
}
