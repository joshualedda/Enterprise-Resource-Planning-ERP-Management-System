<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id', 
        'product', 
        'description', 
        'price', 
        'image_path', 
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected $appends = [
        'stock_count',
        'image_url', 
        'restock_date'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class)->latestOfMany();
    }
    
    public function getStockCountAttribute()
    {
        // Fallback or use Inventory model if exists, otherwise 0
        $in = Inventory::where('product_id', $this->id)->where('type', 'in')->sum('quantity');
        $out = Inventory::where('product_id', $this->id)->where('type', 'out')->sum('quantity');
        
        return $in - $out;
    }

    protected function restockDate(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->inventory?->restock_date
        );
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image_path 
                ? asset($this->image_path) 
                : asset('images/default-product.png'),
        );
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }
}