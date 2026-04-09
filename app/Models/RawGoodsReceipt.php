<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawGoodsReceipt extends Model
{
    use HasFactory;

    protected $table = 'raw_goods_receipts';

    protected $fillable = [
        'purchase_order_id',
        'warehouse_id',
        'receipt_number',
        'received_date',
        'status',
        'received_by',
        'notes',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(RawPurchaseOrder::class, 'purchase_order_id');
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    // You may want to relate received_by to User/Employee later if needed
    // public function receiver()
    // {
    //     return $this->belongsTo(User::class, 'received_by');
    // }

    public function items()
    {
        return $this->hasMany(RawGoodsReceiptItem::class, 'goods_receipt_id');
    }
}
