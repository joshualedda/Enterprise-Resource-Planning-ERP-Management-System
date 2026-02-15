<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'image_path',
        'product',
        'status',
    ];

    protected $casts = [
        'category_id' => 'integer',
    ];

    /**
     * Appends the image_url to the JSON response for Inertia.
     */
    protected $appends = ['image_url'];

    /**
     * Get the image URL attribute
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn () => 
            $this->image_path 
                ? Storage::url($this->image_path) 
                : 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=400'
        );
    }

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class);
    }

    public function wips(): HasMany
    {
        return $this->hasMany(WIP::class);
    }
}