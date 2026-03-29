<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'journal_entry_id',
        'customer_id',
        'payment_date',
        'amount',
        'payment_method',
        'reference',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class, 'journal_entry_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
