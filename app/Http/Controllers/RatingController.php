<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RatingController extends Controller
{
    public function bulkStore(Request $request)
    {
        $request->validate([
            'ratings'              => 'required|array',
            'ratings.*.product_id' => 'required|exists:products,id',
            'ratings.*.stars'      => 'required|integer|min:1|max:5',
            'ratings.*.comment'    => 'nullable|string|max:500',
            'order_id'             => 'required|exists:transactions,id',
        ]);

        $transaction = Transaction::find($request->input('order_id'));

        if (!$transaction) {
            return response()->json(['status' => 'error', 'message' => 'Order not found.'], 404);
        }

        // ✅ Safe check — kung walang is_rated column, skip lang
        if ($transaction->is_rated ?? false) {
            return response()->json(['status' => 'error', 'message' => 'Order already rated.'], 422);
        }

        // ✅ Make sure the order belongs to the current user
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        }

        try {
            DB::transaction(function () use ($request, $transaction) {
                foreach ($request->ratings as $data) {
                    Rating::updateOrCreate(
                        [
                            'user_id'    => Auth::id(),
                            'product_id' => $data['product_id'],
                        ],
                        [
                            'stars'   => $data['stars'],
                            'comment' => $data['comment'] ?? null,
                        ]
                    );
                }

                // ✅ Only update is_rated if the column exists
                if (\Illuminate\Support\Facades\Schema::hasColumn('transactions', 'is_rated')) {
                    $transaction->is_rated = true;
                    $transaction->save();
                }
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Salamat! Your ratings have been submitted.',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'May mali sa pag-save ng ratings.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}