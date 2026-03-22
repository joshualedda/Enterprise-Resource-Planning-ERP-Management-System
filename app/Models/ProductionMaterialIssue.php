<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionMaterialIssue extends Model
{
    use HasFactory;

    protected $table = 'production_material_issues';

    public $timestamps = false; // table only has issue_date, no updated_at

    protected $fillable = [
        'production_run_id',
        'material_id',
        'quantity',
        'uom',
        'issue_date',
    ];

    protected $casts = [
        'issue_date' => 'datetime',
    ];

    public function run()
    {
        return $this->belongsTo(ProductionRun::class, 'production_run_id');
    }

    public function material()
    {
        return $this->belongsTo(RawProduct::class, 'material_id');
    }
}
