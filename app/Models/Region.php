<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $table = 'region';
    protected $primaryKey = 'region_id';
    protected $fillable = ['psgcCode', 'regDesc', 'regCode'];

    public function provinces()
    {
        return $this->hasMany(Province::class, 'regCode', 'regCode');
    }
}
