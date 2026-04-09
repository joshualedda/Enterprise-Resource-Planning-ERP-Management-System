<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawStockAdjustmentItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'adjustment_id',
        'product_id',
        'batch_id',
        'quantity',
    ];

    public function adjustment()
    {
        return $this->belongsTo(RawStockAdjustment::class, 'adjustment_id');
    }

    public function product()
    {
        return $this->belongsTo(RawProduct::class, 'product_id');
    }

    public function batch()
    {
        return $this->belongsTo(RawProductBatch::class, 'batch_id');
    }
}
