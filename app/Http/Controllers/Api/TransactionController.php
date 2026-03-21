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
            // Get wallet first to check balance
            $wallet = Wallet::find($validated['wallet_id']);
            if (!$wallet) {
                return response()->json(['error' => 'Wallet not found'], 404);
            }

            // Check if wallet has sufficient balance for expense transactions
            if ($validated['transaction_type'] === 'expense' && $wallet->balance < $validated['amount']) {
                return response()->json([
                    'error' => 'Insufficient balance',
                    'message' => 'The wallet does not have enough money to complete this transfer.',
                    'balance' => $wallet->balance,
                    'required' => $validated['amount']
                ], 422);
            }

            $transaction = Transaction::create([
                ...$validated,
                'user_id' => $request->user()->id,
            ]);

            // Update wallet balance
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

        // Get the new wallet to check balance before making changes
        $newWallet = Wallet::find($validated['wallet_id']);
        if (!$newWallet) {
            return response()->json(['error' => 'Target wallet not found'], 404);
        }

        // Check if the update would result in negative balance
        $newAmount = $validated['amount'];
        $newType = $validated['transaction_type'];

        // Calculate what the new wallet balance would be after the update
        $newWalletBalance = $newWallet->balance;

        // If it's a different wallet, first revert the old transaction
        if ($oldWallet->id !== $newWallet->id) {
            if ($oldType === 'income') {
                $newWalletBalance += $oldAmount; // Add back the old amount if it was income
            } else {
                $newWalletBalance += $oldAmount; // Add back the old amount if it was expense
            }
        } else {
            // Same wallet, calculate the difference
            if ($oldType === 'income') {
                $newWalletBalance -= $oldAmount; // Remove old income
            } else {
                $newWalletBalance += $oldAmount; // Reverse old expense
            }
        }

        // Apply the new transaction
        if ($newType === 'income') {
            $newWalletBalance += $newAmount;
        } else {
            $newWalletBalance -= $newAmount;
        }

        // Check if balance would go negative
        if ($newWalletBalance < 0) {
            return response()->json([
                'error' => 'Insufficient balance',
                'message' => 'This update would result in a negative balance in the wallet.',
                'current_balance' => $newWallet->balance,
                'resulting_balance' => $newWalletBalance
            ], 422);
        }

        $transaction->update($validated);

        $newWallet = $transaction->fresh()->wallet; // Reload with new wallet if changed

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
