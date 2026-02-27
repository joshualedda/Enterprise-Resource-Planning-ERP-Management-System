<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    // Note: 'Order' acts as an OrderItem/LineItem
    protected $fillable = [
        'transaction_id', 
        'product_id', 
        'quantity', 
        'price_at_sale', 
        'status'
    ];

    /**
     * Balik sa main transaction header
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Relationship para makuha ang detalye ng produkto
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Shortcut para makuha ang User/Customer. 
     * Kinukuha ito mula sa Transaction parent.
     */
    public function user()
    {
        return $this->transaction->user();
    }
}