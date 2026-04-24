<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CivilStatus extends Model
{
    protected $table = 'civil_status';
    public $timestamps = false; // No created_at / updated_at in schema

    protected $fillable = [
        'civil_status_code',
        'civil_status_name',
        'status'
    ];
}
