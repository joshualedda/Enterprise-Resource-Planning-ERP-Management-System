<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    protected $table = 'province';
    protected $fillable = ['region_id', 'province_name'];

    public function municipalities()
    {
        return $this->hasMany(Municipality::class, 'province_id');
    }
}
