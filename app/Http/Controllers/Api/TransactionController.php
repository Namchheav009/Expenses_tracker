<?php

namespace App\Http\Controllers\Api;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->with(['wallet', 'category'])
            ->orderByDesc('transaction_date')
            ->get();
        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wallet_id' => 'required|exists:wallets,id',
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'transaction_type' => 'required|in:income,expense',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $transaction = Transaction::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        // Update wallet balance
        $wallet = Wallet::find($validated['wallet_id']);
        if ($validated['transaction_type'] === 'income') {
            $wallet->increment('balance', $validated['amount']);
        } else {
            $wallet->decrement('balance', $validated['amount']);
        }

        return response()->json($transaction->load(['wallet', 'category']), 201);
    }

    public function show(Transaction $transaction): JsonResponse
    {
        Gate::authorize('view', $transaction);
        return response()->json($transaction->load(['wallet', 'category']));
    }

    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        Gate::authorize('update', $transaction);

        $validated = $request->validate([
            'wallet_id' => 'required|exists:wallets,id',
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'transaction_type' => 'required|in:income,expense',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

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

        return response()->json($transaction->load(['wallet', 'category']));
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
