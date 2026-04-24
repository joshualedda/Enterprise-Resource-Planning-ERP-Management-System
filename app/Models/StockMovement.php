<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    protected $table = 'raw_stock_movements';

    protected $fillable = [
        'raw_product_id',
        'raw_warehouse_id',
        'raw_batch_id',
        'movement_type',
        'reference_type',
        'reference_id',
        'quantity',
        'unit_cost',
        'movement_date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'movement_date' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(RawProduct::class, 'raw_product_id');
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'raw_warehouse_id');
    }

    public function batch()
    {
        return $this->belongsTo(RawProductBatch::class, 'raw_batch_id');
    }
}
