<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    protected $fillable = ['product_id', 'quantity', 'type', 'batch_code', 'restock_date', 'remarks'];

    public function product() {
        return $this->belongsTo(Product::class);
    }
}