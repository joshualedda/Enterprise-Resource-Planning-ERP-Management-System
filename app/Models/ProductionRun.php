<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionRun extends Model
{
    use HasFactory;

    protected $table = 'production_runs';

    protected $fillable = [
        'production_order_item_id',
        'run_number',
        'start_time',
        'end_time',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
    ];

    public function orderItem()
    {
        return $this->belongsTo(ProductionOrderItem::class, 'production_order_item_id');
    }
}
