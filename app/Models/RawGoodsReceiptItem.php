<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawGoodsReceiptItem extends Model
{
    use HasFactory;

    public $timestamps = false; // Add this since table schema specifies 'created_at TIMESTAMP NULL', but wait, schema actually has these fields? If it does, let Eloquent manage them.
    // "created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL" -> Then Eloquent CAN manage them, so $timestamps can be true by default, omitting $timestamps = false;

    protected $table = 'raw_goods_receipt_items';

    protected $fillable = [
        'goods_receipt_id',
        'product_id',
        'batch_id',
        'quantity_received',
        'unit_cost',
    ];

    public function goodsReceipt()
    {
        return $this->belongsTo(RawGoodsReceipt::class, 'goods_receipt_id');
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
