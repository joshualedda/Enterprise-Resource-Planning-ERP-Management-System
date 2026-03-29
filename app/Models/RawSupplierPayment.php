<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawSupplierPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_supplier_id',
        'purchase_order_id',
        'journal_entry_id',
        'payment_date',
        'amount',
        'payment_method',
        'reference',
    ];

    public function supplier()
    {
        return $this->belongsTo(RawProductSupplier::class, 'product_supplier_id');
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(RawPurchaseOrder::class, 'purchase_order_id');
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class, 'journal_entry_id');
    }
}
