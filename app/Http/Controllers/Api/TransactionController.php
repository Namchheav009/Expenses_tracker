<?php

namespace App\Http\Controllers\Api;

use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with(['wallet', 'category']);

        if (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        $transactions = $query->orderByDesc('transaction_date')->get();
        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wallet_id' => 'required|exists:wallets,id',
            'category_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'transaction_type' => 'required|in:income,expense',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        // Convert 'transfer' marker into a real category_id
        if ($validated['category_id'] === 'transfer') {
            $transferCategory = Category::firstOrCreate(
                ['name' => 'Transfer', 'user_id' => $request->user()->id],
                ['type' => 'expense', 'icon' => null, 'color' => '#9ca3af']
            );
            $validated['category_id'] = $transferCategory->id;
        } else {
            $categoryExists = Category::where('id', $validated['category_id'])
                ->where('user_id', $request->user()->id)
                ->exists();
            if (!$categoryExists) {
                return response()->json(['error' => 'Invalid category_id'], 422);
            }
        }

        try {
            $transaction = Transaction::create([
                ...$validated,
                'user_id' => $request->user()->id,
            ]);

            // Update wallet balance
            $wallet = Wallet::find($validated['wallet_id']);
            if (!$wallet) {
                return response()->json(['error' => 'Wallet not found'], 404);
            }

            if ($validated['transaction_type'] === 'income') {
                $wallet->increment('balance', $validated['amount']);
            } else {
                $wallet->decrement('balance', $validated['amount']);
            }

            // Load relationships, handle 'transfer' specially
            if ($validated['category_id'] !== 'transfer') {
                return response()->json($transaction->load(['wallet', 'category']), 201);
            } else {
                // For transfer transactions, load wallet only (no category relationship)
                return response()->json($transaction->load(['wallet']), 201);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Transaction $transaction): JsonResponse
    {
        Gate::authorize('view', $transaction);
        // Handle 'transfer' category specially (no relationship load)
        if ($transaction->category_id === 'transfer') {
            return response()->json($transaction->load(['wallet']));
        }
        return response()->json($transaction->load(['wallet', 'category']));
    }

    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        Gate::authorize('update', $transaction);

        $validated = $request->validate([
            'wallet_id' => 'required|exists:wallets,id',
            'category_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'transaction_type' => 'required|in:income,expense',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        // Convert 'transfer' marker into a real category_id (update routes and other calls)
        if ($validated['category_id'] === 'transfer') {
            $transferCategory = Category::firstOrCreate(
                ['name' => 'Transfer', 'user_id' => $request->user()->id],
                ['type' => 'expense', 'icon' => null, 'color' => '#9ca3af']
            );
            $validated['category_id'] = $transferCategory->id;
        } else {
            $categoryExists = Category::where('id', $validated['category_id'])
                ->where('user_id', $request->user()->id)
                ->exists();
            if (!$categoryExists) {
                return response()->json(['error' => 'Invalid category_id'], 422);
            }
        }

        // Handle wallet balance changes if wallet or amount/type changed
        $oldWallet = $transaction->wallet;
        $oldAmount = $transaction->amount;
        $oldType = $transaction->transaction_type;

        $transaction->update($validated);

        $newWallet = $transaction->fresh()->wallet; // Reload with new wallet if changed
        $newAmount = $transaction->amount;
        $newType = $transaction->transaction_type;

        // Revert old balance
        if ($oldType === 'income') {
            $oldWallet->decrement('balance', $oldAmount);
        } else {
            $oldWallet->increment('balance', $oldAmount);
        }

        // Apply new balance
        if ($newType === 'income') {
            $newWallet->increment('balance', $newAmount);
        } else {
            $newWallet->decrement('balance', $newAmount);
        }

        // Load relationships, handle 'transfer' specially
        if ($validated['category_id'] !== 'transfer') {
            return response()->json($transaction->load(['wallet', 'category']));
        } else {
            return response()->json($transaction->load(['wallet']));
        }
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        Gate::authorize('delete', $transaction);

        // Revert wallet balance
        $wallet = $transaction->wallet;
        if ($wallet) {
            if ($transaction->transaction_type === 'income') {
                $wallet->decrement('balance', $transaction->amount);
            } else {
                $wallet->increment('balance', $transaction->amount);
            }
        }

        $transaction->delete();
        return response()->json(null, 204);
    }
}
