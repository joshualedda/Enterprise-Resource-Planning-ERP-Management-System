<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeModel extends Model
{
    protected $table = 'employee';
    
    // The schema only has updated_date
    const CREATED_AT = null;
    const UPDATED_AT = 'updated_date';

    protected $fillable = [
        'civil_status_id',
        'department_id',
        'employee_status_id',
        'position_id',
        'barangay_id',
        'municipality_id',
        'province_id',
        'region_id',
        'status',
        'address',
        'birthday',
        'contact',
        'contact_phone',
        'date_started',
        'date_terminated',
        'email',
        'employee_code',
        'employee_image',
        'first_name',
        'gender',
        'last_name',
        'pag_ibig',
        'phil_health',
        'phone',
        'remark',
        'sss',
        'tin',
        'updated_by'
    ];

    public function civilStatus(): BelongsTo
    {
        return $this->belongsTo(CivilStatus::class, 'civil_status_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function employeeStatus(): BelongsTo
    {
        return $this->belongsTo(EmployeeStatus::class, 'employee_status_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id');
    }
}
