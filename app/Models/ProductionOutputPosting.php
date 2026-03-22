<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionOutputPosting extends Model
{
    use HasFactory;

    protected $table = 'production_output_posting';

    public $timestamps = false; // only has posting_date

    protected $fillable = [
        'production_run_id',
        'product_id',
        'quantity',
        'uom',
        'posted_by',
        'posting_date',
    ];

    protected $casts = [
        'posting_date' => 'datetime',
    ];

    public function run()
    {
        return $this->belongsTo(ProductionRun::class, 'production_run_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function postedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'posted_by');
    }
}
