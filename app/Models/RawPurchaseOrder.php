<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawPurchaseOrder extends Model
{
    use HasFactory;

    protected $table = 'raw_purchase_orders';

    protected $fillable = [
        'supplier_id',
        'order_number',
        'status',
        'order_date',
        'expected_date',
        'notes',
    ];

    public function supplier()
    {
        return $this->belongsTo(RawProductSupplier::class, 'supplier_id');
    }

    public function items()
    {
        return $this->hasMany(RawPurchaseOrderItem::class, 'purchase_order_id');
    }
}
