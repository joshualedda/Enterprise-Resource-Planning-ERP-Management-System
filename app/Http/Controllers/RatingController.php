<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RatingController extends Controller
{
    public function bulkStore(Request $request)
    {
        // 1. Validation
        $request->validate([
            'ratings' => 'required|array',
            'ratings.*.product_id' => 'required|exists:products,id',
            'ratings.*.stars' => 'required|integer|min:1|max:5',
            'ratings.*.comment' => 'nullable|string|max:500',
        ]);

        try {
            DB::transaction(function () use ($request) {
                foreach ($request->ratings as $data) {
                    Rating::updateOrCreate(
                        [
                            'user_id' => Auth::id(), 
                            'product_id' => $data['product_id']
                        ],
                        [
                            'stars' => $data['stars'],
                            'comment' => $data['comment'] ?? null
                        ]
                    );
                }
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Salamat! Your ratings have been submitted.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'May mali sa pag-save ng ratings.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}