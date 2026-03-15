<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawProductBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'raw_product_id',
        'batch_code',
        'supplier_id',
        'manufacturing_date',
        'expiry_date',
    ];

    public function product()
    {
        return $this->belongsTo(RawProduct::class, 'raw_product_id');
    }
}
