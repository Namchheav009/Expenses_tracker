<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Budget;
use Illuminate\Database\Seeder;

class ExpenseTrackerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user (idempotent)
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        // Create categories
        $categories = [
            ['name' => 'Groceries', 'icon' => '🛒', 'color' => '#ec4899', 'type' => 'expense'],
            ['name' => 'Transportation', 'icon' => '🚗', 'color' => '#f59e0b', 'type' => 'expense'],
            ['name' => 'Entertainment', 'icon' => '🎬', 'color' => '#8b5cf6', 'type' => 'expense'],
            ['name' => 'Utilities', 'icon' => '💡', 'color' => '#06b6d4', 'type' => 'expense'],
            ['name' => 'Salary', 'icon' => '💰', 'color' => '#10b981', 'type' => 'income'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'name' => $cat['name'],
                ],
                [...$cat, 'user_id' => $user->id]
            );
        }

        // Create wallets
        $wallets = [
            ['name' => 'Checking', 'balance' => 5000, 'currency' => 'USD'],
            ['name' => 'Savings', 'balance' => 10000, 'currency' => 'USD'],
            ['name' => 'Cash', 'balance' => 500, 'currency' => 'USD'],
        ];

        foreach ($wallets as $wallet) {
            Wallet::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'name' => $wallet['name'],
                ],
                [...$wallet, 'user_id' => $user->id]
            );
        }

        // Create sample transactions
        $wallet = $user->wallets()->first();
        $groceriesCategory = Category::where('user_id', $user->id)->where('name', 'Groceries')->first();
        $transportCategory = Category::where('user_id', $user->id)->where('name', 'Transportation')->first();
        $salaryCategory = Category::where('user_id', $user->id)->where('name', 'Salary')->first();

        Transaction::updateOrCreate(
            [
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'category_id' => $groceriesCategory->id,
                'description' => 'Weekly groceries',
            ],
            [
                'amount' => 75.50,
                'transaction_type' => 'expense',
                'transaction_date' => now()->subDays(5),
            ]
        );

        Transaction::updateOrCreate(
            [
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'category_id' => $transportCategory->id,
                'description' => 'Fuel',
            ],
            [
                'amount' => 50.00,
                'transaction_type' => 'expense',
                'transaction_date' => now()->subDays(3),
            ]
        );

        Transaction::updateOrCreate(
            [
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'category_id' => $salaryCategory->id,
                'description' => 'Monthly salary',
            ],
            [
                'amount' => 5000.00,
                'transaction_type' => 'income',
                'transaction_date' => now()->subDays(10),
            ]
        );

        // Create budgets
        Budget::updateOrCreate(
            [
                'user_id' => $user->id,
                'category_id' => $groceriesCategory->id,
                'month' => now()->month,
                'year' => now()->year,
            ],
            [
                'amount' => 300.00,
            ]
        );

        Budget::updateOrCreate(
            [
                'user_id' => $user->id,
                'category_id' => $transportCategory->id,
                'month' => now()->month,
                'year' => now()->year,
            ],
            [
                'amount' => 200.00,
            ]
        );

        // Generate and output API token for testing
        $token = $user->createToken('auth_token')->plainTextToken;
        $this->command->info("\n✓ Seeding complete!");
        $this->command->warn("\n📌 API Token for testing (use in browser):");
        $this->command->line("$token");
        $this->command->line("\n");
    }
}
