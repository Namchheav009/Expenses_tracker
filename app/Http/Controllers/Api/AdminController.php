<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        // Basic summary stats for admin dashboard
        $totalUsers = User::count();
        $totalTransactions = Transaction::count();
        $totalWallets = Wallet::count();
        $totalCategories = Category::count();
        $totalBudgets = Budget::count();

        $income = Transaction::where('transaction_type', 'income')->sum('amount');
        $expenses = Transaction::where('transaction_type', 'expense')->sum('amount');

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalTransactions' => $totalTransactions,
            'totalWallets' => $totalWallets,
            'totalCategories' => $totalCategories,
            'totalBudgets' => $totalBudgets,
            'totalRevenue' => $income - $expenses,
        ]);
    }

    public function users(Request $request)
    {
        // Return a simple list of users for admin view
        $users = User::select(['id', 'name', 'email', 'role', 'is_active', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $users]);
    }

    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function updateUser(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|in:admin,user',
            'is_active' => 'nullable|boolean',
        ]);

        $user = User::findOrFail($id);
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (isset($validated['password']) && $validated['password']) {
            $user->password = $validated['password'];
        }
        $user->role = $validated['role'] ?? $user->role;
        if (isset($validated['is_active'])) {
            $user->is_active = $validated['is_active'];
        }
        $user->save();

        return response()->json(['data' => $user]);
    }

    public function updateUserRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:admin,user',
        ]);

        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'User role updated successfully']);
    }

    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'nullable|in:admin,user',
            'is_active' => 'nullable|boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'] ?? 'user',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $user], 201);
    }

    public function updateUserPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user = User::findOrFail($id);
        $user->password = $request->password;
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function updateUserStatus(Request $request, $id)
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user = User::findOrFail($id);
        $user->is_active = $request->is_active;
        $user->save();

        return response()->json(['message' => 'User status updated successfully']);
    }

    // Transaction management methods for admins
    public function transactions(Request $request)
    {
        $query = Transaction::with(['user', 'wallet', 'category']);

        // Admins can see all transactions
        $transactions = $query->orderByDesc('transaction_date')->get();

        return response()->json(['data' => $transactions]);
    }

    public function createTransaction(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'wallet_id' => 'required|exists:wallets,id',
            'category_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'transaction_type' => 'required|in:income,expense',
            'description' => 'nullable|string',
            'note' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        // Convert 'transfer' marker into a real category_id for FK compliance
        if ($validated['category_id'] === 'transfer') {
            $transferCategory = Category::firstOrCreate(
                ['name' => 'Transfer', 'user_id' => $request->user()->id],
                ['type' => 'expense', 'icon' => null, 'color' => '#9ca3af']
            );
            $validated['category_id'] = $transferCategory->id;
        } else {
            $categoryExists = DB::table('categories')
                ->where('id', $validated['category_id'])
                ->exists();
            
            if (!$categoryExists) {
                return response()->json(['error' => 'Invalid category_id'], 422);
            }
        }

        try {
            $transaction = Transaction::create($validated);

            // Update wallet balance
            $wallet = \App\Models\Wallet::find($validated['wallet_id']);
            if (!$wallet) {
                return response()->json(['error' => 'Wallet not found'], 404);
            }

            if ($validated['transaction_type'] === 'income') {
                $wallet->increment('balance', $validated['amount']);
            } else {
                $wallet->decrement('balance', $validated['amount']);
            }

            // Handle 'transfer' category specially
            if ($validated['category_id'] !== 'transfer') {
                return response()->json(['data' => $transaction->load(['user', 'wallet', 'category'])], 201);
            } else {
                return response()->json(['data' => $transaction->load(['user', 'wallet'])], 201);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateTransaction(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'wallet_id' => 'required|exists:wallets,id',
            'category_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'transaction_type' => 'required|in:income,expense',
            'description' => 'nullable|string',
            'note' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        // Convert 'transfer' marker into a real category_id for FK compliance
        if ($validated['category_id'] === 'transfer') {
            $transferCategory = Category::firstOrCreate(
                ['name' => 'Transfer', 'user_id' => $request->user()->id],
                ['type' => 'expense', 'icon' => null, 'color' => '#9ca3af']
            );
            $validated['category_id'] = $transferCategory->id;
        } else {
            $categoryExists = DB::table('categories')
                ->where('id', $validated['category_id'])
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

        $newWallet = $transaction->fresh()->wallet;
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

        // Handle 'transfer' category specially
        if ($validated['category_id'] !== 'transfer') {
            return response()->json(['data' => $transaction->load(['user', 'wallet', 'category'])]);
        } else {
            return response()->json(['data' => $transaction->load(['user', 'wallet'])]);
        }
    }

    public function deleteTransaction(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

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

    // Wallet management methods for admins
    public function wallets(Request $request)
    {
        $wallets = Wallet::with('user')->orderBy('name')->get();
        return response()->json(['data' => $wallets]);
    }

    public function createWallet(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'balance' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:3',
        ]);

        // Ensure we never insert a NULL currency (the DB column is not nullable and defaults to USD)
        if (array_key_exists('currency', $validated) && $validated['currency'] === null) {
            unset($validated['currency']);
        }

        $walletData = [
            'user_id' => $validated['user_id'],
            'name' => $validated['name'],
            'balance' => $validated['balance'],
        ];

        if (!empty($validated['currency'])) {
            $walletData['currency'] = $validated['currency'];
        }

        $wallet = Wallet::create($walletData);

        return response()->json(['data' => $wallet], 201);
    }

    public function updateWallet(Request $request, $id)
    {
        $wallet = Wallet::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'balance' => 'sometimes|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'user_id' => 'sometimes|exists:users,id',
        ]);

        if (array_key_exists('currency', $validated) && $validated['currency'] === null) {
            unset($validated['currency']);
        }

        $wallet->update($validated);

        return response()->json(['data' => $wallet]);
    }

    public function deleteWallet(Request $request, $id)
    {
        $wallet = Wallet::findOrFail($id);
        $wallet->delete();

        return response()->json(null, 204);
    }
}

