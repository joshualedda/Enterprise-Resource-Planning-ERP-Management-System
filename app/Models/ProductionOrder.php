<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'status',
        'order_date',
        'scheduled_start_date',
        'scheduled_end_date',
        'actual_start_date',
        'actual_end_date',
    ];

    protected $casts = [
        'order_date' => 'date',
        'scheduled_start_date' => 'date',
        'scheduled_end_date' => 'date',
        'actual_start_date' => 'date',
        'actual_end_date' => 'date',
    ];

    public function items()
    {
        return $this->hasMany(ProductionOrderItem::class);
    }
}
