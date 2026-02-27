<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserInformation extends Model
{
    protected $table = 'user_information';
    protected $fillable = [
    'user_id',
    'role_id',
    'phone_number',
    'region_id',
    'province_id',
    'municipality_id',
    'barangay_id',
    'zipcode',
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
