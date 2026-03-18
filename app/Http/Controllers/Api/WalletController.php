<?php

namespace App\Http\Controllers\Api;

use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class WalletController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Wallet::query();

        if (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        $wallets = $query->get();
        return response()->json($wallets);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'balance' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:3',
        ]);

        // Ensure we never insert a NULL currency (the DB column is not nullable and defaults to USD)
        if (array_key_exists('currency', $validated) && $validated['currency'] === null) {
            unset($validated['currency']);
        }

        $wallet = Wallet::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($wallet, 201);
    }

    public function show(Wallet $wallet): JsonResponse
    {
        Gate::authorize('view', $wallet);
        return response()->json($wallet);
    }

    public function update(Request $request, Wallet $wallet): JsonResponse
    {
        Gate::authorize('update', $wallet);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'balance' => 'numeric|min:0',
            'currency' => 'nullable|string|max:3',
        ]);

        // Do not set currency to NULL; use database default when no value is provided.
        if (array_key_exists('currency', $validated) && $validated['currency'] === null) {
            unset($validated['currency']);
        }

        $wallet->update($validated);
        return response()->json($wallet);
    }

    public function destroy(Wallet $wallet): JsonResponse
    {
        Gate::authorize('delete', $wallet);
        $wallet->delete();
        return response()->json(null, 204);
    }
}
