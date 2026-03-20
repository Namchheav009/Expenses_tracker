<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ai_analyses', function (Blueprint $table) {
            $table->float('confidence_score')->default(0.8)->after('ai_result');
            $table->enum('analysis_type', ['monthly', 'weekly', 'alert', 'quarterly'])->default('monthly')->after('confidence_score');
            $table->json('recommendations')->nullable()->after('analysis_type');
            $table->json('transaction_summary')->nullable()->after('recommendations');
            $table->json('budget_insights')->nullable()->after('transaction_summary');
            $table->json('spending_metrics')->nullable()->after('budget_insights');
            $table->json('trends')->nullable()->after('spending_metrics');
            $table->json('alerts')->nullable()->after('trends');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_analyses', function (Blueprint $table) {
            $table->dropColumn([
                'confidence_score',
                'analysis_type',
                'recommendations',
                'transaction_summary',
                'budget_insights',
                'spending_metrics',
                'trends',
                'alerts',
            ]);
        });
    }
};
