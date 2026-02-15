<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = ['user_id', 'reference_no', 'total_amount', 'transacted_by', 'status'];

    // Sino ang bumili (optional kung walk-in)
    public function user() {
        return $this->belongsTo(User::class);
    }

    // Listahan ng mga binili sa resibong ito
    public function orders() {
        return $this->hasMany(Order::class);
    }
}
