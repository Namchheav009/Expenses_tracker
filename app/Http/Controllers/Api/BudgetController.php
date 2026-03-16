<?php

namespace App\Http\Controllers\Api;

use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class BudgetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $budgets = Budget::where('user_id', $request->user()->id)
            ->with('category')
            ->get();
        return response()->json($budgets);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000',
        ]);

        $budget = Budget::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($budget->load('category'), 201);
    }

    public function update(Request $request, Budget $budget): JsonResponse
    {
        Gate::authorize('update', $budget);

        $validated = $request->validate([
            'amount' => 'numeric|min:0.01',
        ]);

        $budget->update($validated);
        return response()->json($budget->load('category'));
    }

    public function destroy(Budget $budget): JsonResponse
    {
        Gate::authorize('delete', $budget);
        $budget->delete();
        return response()->json(null, 204);
    }
}
