<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Budget;
use App\Policies\CategoryPolicy;
use App\Policies\WalletPolicy;
use App\Policies\TransactionPolicy;
use App\Policies\BudgetPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Category::class => CategoryPolicy::class,
        Wallet::class => WalletPolicy::class,
        Transaction::class => TransactionPolicy::class,
        Budget::class => BudgetPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
