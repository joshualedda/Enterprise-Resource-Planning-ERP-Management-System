<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

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
            get: function () {
                if (!$this->image_path) {
                    return asset('images/default-product.png');
                }

                if (str_starts_with($this->image_path, 'http')) {
                    return $this->image_path;
                }

                // Clean up the path: ensure it doesn't have double slashes and handles singular/plural folder names
                $path = ltrim($this->image_path, '/');
                if (str_starts_with($path, 'products/')) {
                    $path = str_replace('products/', 'product/', $path);
                }

                // Using asset('storage/...') is the most reliable for XAMPP subfolder setups
                return asset('storage/' . $path);
            }
        );
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }
}