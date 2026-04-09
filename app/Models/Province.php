<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    protected $table = 'province';
    protected $primaryKey = 'province_id';
    protected $fillable = ['psgcCode', 'provDesc', 'regCode', 'provCode'];

    public function municipalities()
    {
        return $this->hasMany(Municipality::class, 'provCode', 'provCode');
    }
}
