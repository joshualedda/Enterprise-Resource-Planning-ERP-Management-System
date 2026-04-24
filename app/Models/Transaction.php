<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'user_id', 
        'barangay_id',
        'municipal_id',
        'province_id',
        'region_id',
        'shipping_address',
        'reference_no', 
        'total_amount', 
        'payment_method', 
        'order_type', 
        'receipt_path',
        'transacted_by',
        'journal_entry_id',
        'posted_at',
        'status',
        'is_rated',
        'cancellation_reason',
    ];

    /**
     * Relationship sa User (Customer)
     */
    public function user(): BelongsTo 
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Main relationship para sa mga items sa loob ng transaction
     */
    public function order_items(): HasMany
    {
        // Mas magandang pangalan ang 'order_items' para hindi malito sa Order model
        return $this->hasMany(Order::class, 'transaction_id');
    }

    /**
     * Helper logic para malaman kung kailangan ng receipt
     */
    public function isOnlinePayment(): bool
    {
        return $this->payment_method === 'Bank' || $this->payment_method === 'GCash';
    }

}
