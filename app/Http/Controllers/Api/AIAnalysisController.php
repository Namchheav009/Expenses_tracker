<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIAnalysis;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIAnalysisController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $analyses = AIAnalysis::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($analyses);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000',
            'summary_text' => 'required|string',
            'ai_result' => 'required|string',
        ]);

        $analysis = AIAnalysis::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($analysis, 201);
    }
}
