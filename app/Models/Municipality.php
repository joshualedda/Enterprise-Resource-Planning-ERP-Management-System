<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Municipality extends Model
{
    protected $table = 'municipality';
    protected $fillable = ['province_id', 'municipality_name'];

    public function provinces()
    {
        return $this->belongsTo(Province::class, 'province_id');
    }

    public function barangays()
    {
        return $this->hasMany(Barangay::class, 'municipality_id');
    }
}
