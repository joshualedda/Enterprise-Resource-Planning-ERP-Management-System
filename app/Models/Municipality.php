<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Municipality extends Model
{
    protected $table = 'municipality';
    protected $primaryKey = 'municipality_id';
    protected $fillable = ['psgcCode', 'citymunDesc', 'regCode', 'provCode', 'citymunCode'];

    public function provinces()
    {
        return $this->belongsTo(Province::class, 'provCode', 'provCode');
    }

    public function barangays()
    {
        return $this->hasMany(Barangay::class, 'citymunCode', 'citymunCode');
    }
}
