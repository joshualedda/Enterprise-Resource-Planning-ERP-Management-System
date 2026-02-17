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

public function orders()
{
    // Dahil sa orders table ay 'transaction_id' ang foreign key
    return $this->hasMany(Order::class, 'transaction_id');
}
    
    public function order_items()
    {
        return $this->hasMany(Order::class, 'transaction_id');
    }


}
