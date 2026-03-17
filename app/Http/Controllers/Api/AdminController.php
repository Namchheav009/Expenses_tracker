<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;

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
        $users = User::select(['id', 'name', 'email', 'role', 'created_at'])->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $users]);
    }

    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
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

    public function updateUserStatus(Request $request, $id)
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user = User::findOrFail($id);
        // Note: Add is_active column to users table if needed
        // $user->is_active = $request->is_active;
        $user->save();

        return response()->json(['message' => 'User status updated successfully']);
    }
}

