<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    // Note: Sa logic natin, 'Order' ang nagsisilbing OrderItem
    protected $fillable = ['transaction_id', 'product_id', 'quantity', 'price_at_sale',];

public function transaction()
{
    // Dahil may transaction_id sa orders table
    return $this->belongsTo(Transaction::class, 'transaction_id');
}

    // ITO ANG KAILANGAN PARA SA .product NA NASA CONTROLLER
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }


}
