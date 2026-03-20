<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIAnalysis extends Model
{
    protected $table = 'ai_analyses';

    protected $fillable = [
        'user_id',
        'month',
        'year',
        'summary_text',
        'ai_result',
        'confidence_score',
        'analysis_type',
        'recommendations',
        'transaction_summary',
        'budget_insights',
        'spending_metrics',
        'trends',
        'alerts',
    ];

    protected $casts = [
        'recommendations' => 'array',
        'transaction_summary' => 'array',
        'budget_insights' => 'array',
        'spending_metrics' => 'array',
        'trends' => 'array',
        'alerts' => 'array',
        'confidence_score' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
