<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $table = 'department';
    public $timestamps = false;

    protected $fillable = [
        'department_code',
        'department_name',
        'status'
    ];

    public function employees()
    {
        return $this->hasMany(EmployeeModel::class, 'department_id');
    }
}
