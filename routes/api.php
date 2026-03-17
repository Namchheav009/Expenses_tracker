<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\AIAnalysisController;

// Public API routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Simple helper to validate an email exists for login UX
Route::get('/check-email', [AuthController::class, 'checkEmail']);

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

    // AI Analyses API
    Route::get('ai-analyses', [AIAnalysisController::class, 'index']);
    Route::post('ai-analyses', [AIAnalysisController::class, 'store']);

    // Admin-only endpoints
    Route::get('admin/stats', [\App\Http\Controllers\Api\AdminController::class, 'stats'])
        ->middleware(\App\Http\Middleware\EnsureAdmin::class);

    Route::get('admin/users', [\App\Http\Controllers\Api\AdminController::class, 'users'])
        ->middleware(\App\Http\Middleware\EnsureAdmin::class);

    Route::delete('admin/users/{id}', [\App\Http\Controllers\Api\AdminController::class, 'deleteUser'])
        ->middleware(\App\Http\Middleware\EnsureAdmin::class);

    Route::put('admin/users/{id}/role', [\App\Http\Controllers\Api\AdminController::class, 'updateUserRole'])
        ->middleware(\App\Http\Middleware\EnsureAdmin::class);

    Route::put('admin/users/{id}/status', [\App\Http\Controllers\Api\AdminController::class, 'updateUserStatus'])
        ->middleware(\App\Http\Middleware\EnsureAdmin::class);
});
