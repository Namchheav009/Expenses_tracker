<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIAnalysis extends Model
{
    protected $table = 'ai_analyses';

    protected $fillable = ['user_id', 'month', 'year', 'summary_text', 'ai_result'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
