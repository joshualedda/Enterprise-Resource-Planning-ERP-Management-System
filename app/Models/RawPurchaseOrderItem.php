<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawPurchaseOrderItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'raw_purchase_order_items';

    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'quantity',
        'unit_cost',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(RawPurchaseOrder::class, 'purchase_order_id');
    }

    public function product()
    {
        return $this->belongsTo(RawProduct::class, 'product_id');
    }
}
