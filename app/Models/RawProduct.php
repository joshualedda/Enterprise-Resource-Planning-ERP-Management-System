<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'category_id',
        'unit_id',
        'product_type',
        'description',
        'cost_price',
        'selling_price',
        'reorder_level',
        'is_active',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'reorder_level' => 'integer',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(RawProductCategory::class, 'category_id');
    }

    public function unit()
    {
        return $this->belongsTo(RawProductUnit::class, 'unit_id');
    }
}
