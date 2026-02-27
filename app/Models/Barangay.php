<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    protected $table = 'barangay';
    protected $fillable = ['municipality_id', 'name'];

    public function municipalities()
    {
        return $this->belongsTo(Municipality::class, 'municipality_id');
    }
}
