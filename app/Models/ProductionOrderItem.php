<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_order_id',
        'raw_product_id',
        'quantity',
        'uom',
        'status',
    ];

    public function productionOrder()
    {
        return $this->belongsTo(ProductionOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(RawProduct::class, 'raw_product_id');
    }

    public function runs()
    {
        return $this->hasMany(ProductionRun::class, 'production_order_item_id');
    }
}
