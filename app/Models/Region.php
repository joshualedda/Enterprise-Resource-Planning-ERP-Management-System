<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $table = 'region';
    protected $fillable = ['region_name', 'region_description'];

    public function provinces()
    {
        return $this->hasMany(Province::class, 'region_id');
    }
}
