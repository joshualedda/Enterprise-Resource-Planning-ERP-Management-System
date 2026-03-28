<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    protected $table = 'barangay';
    protected $primaryKey = 'barangay_id';
    protected $fillable = ['brgyCode', 'brgyDesc', 'regCode', 'provCode', 'citymunCode'];

    public function municipalities()
    {
        return $this->belongsTo(Municipality::class, 'citymunCode', 'citymunCode');
    }
}
