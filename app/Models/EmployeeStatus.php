<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeStatus extends Model
{
    protected $table = 'employee_status';
    public $timestamps = false;

    protected $fillable = [
        'employee_status_code',
        'employee_status_name',
        'status'
    ];
}
