<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawProductCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'symbol',
        'description',
    ];

    public function products()
    {
        return $this->hasMany(RawProduct::class, 'category_id');
    }
}
