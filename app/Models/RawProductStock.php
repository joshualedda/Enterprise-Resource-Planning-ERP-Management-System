<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RawProductStock extends Model
{
    protected $fillable = [
        'product_id',
        'warehouse_id',
        'batch_id',
        'quantity_on_hand',
        'quantity_reserved',
    ];

    public function product()
    {
        return $this->belongsTo(RawProduct::class, 'product_id');
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function batch()
    {
        return $this->belongsTo(RawProductBatch::class, 'batch_id');
    }
}
