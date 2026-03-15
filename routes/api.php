<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\BudgetController;

// Public API routes
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Categories API
    Route::apiResource('categories', CategoryController::class);

    // Wallets API
    Route::apiResource('wallets', WalletController::class);

    // Transactions API
    Route::apiResource('transactions', TransactionController::class);

    // Budgets API
    Route::apiResource('budgets', BudgetController::class);
});
