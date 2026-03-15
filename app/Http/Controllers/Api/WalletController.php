<?php

namespace App\Http\Controllers\Api;

use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WalletController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $wallets = Wallet::where('user_id', $request->user()->id)->get();
        return response()->json($wallets);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'balance' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:3',
        ]);

        $wallet = Wallet::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($wallet, 201);
    }

    public function show(Wallet $wallet): JsonResponse
    {
        $this->authorize('view', $wallet);
        return response()->json($wallet);
    }

    public function update(Request $request, Wallet $wallet): JsonResponse
    {
        $this->authorize('update', $wallet);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'balance' => 'numeric|min:0',
            'currency' => 'nullable|string|max:3',
        ]);

        $wallet->update($validated);
        return response()->json($wallet);
    }

    public function destroy(Wallet $wallet): JsonResponse
    {
        $this->authorize('delete', $wallet);
        $wallet->delete();
        return response()->json(null, 204);
    }
}
