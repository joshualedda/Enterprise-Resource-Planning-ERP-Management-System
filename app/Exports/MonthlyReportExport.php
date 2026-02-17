<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MonthlyReportExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        // Kinukuha lahat ng orders kasama ang transaction data
        return Order::with(['transaction', 'product', 'user'])->get();
    }

    public function headings(): array
    {
        return [
            'Reference No',
            'Customer Name',
            'Product Name',
            'Quantity',
            'Price at Sale',
            'Total',
            'Date'
        ];
    }

    public function map($order): array
    {
        return [
            $order->transaction->reference_no ?? 'N/A',
            $order->user->name ?? 'Walk-in',
            $order->product->product ?? 'N/A',
            $order->quantity,
            $order->price_at_sale,
            $order->quantity * $order->price_at_sale,
            $order->created_at->format('Y-m-d'),
        ];
    }
}