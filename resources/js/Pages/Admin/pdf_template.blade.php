<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SRDI Monthly Report</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #1e293b; margin: 0; padding: 0; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .logo { width: 80px; margin-bottom: 10px; }
        .hospital-name { font-size: 20px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin: 0; }
        .report-title { font-size: 16px; color: #64748b; margin: 5px 0; }
        .date-range { font-size: 12px; color: #94a3b8; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f8fafc; color: #475569; padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left; font-size: 10px; text-transform: uppercase; }
        td { padding: 12px 10px; border: 1px solid #e2e8f0; font-size: 11px; color: #334155; }
        
        .total-section { margin-top: 30px; text-align: right; }
        .total-box { display: inline-block; background: #f1f5f9; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .total-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
        .total-amount { font-size: 18px; font-weight: bold; color: #4f46e5; display: block; }
        
        .footer { position: fixed; bottom: 20px; width: 100%; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/logo.png') }}" class="logo">
        <h1 class="hospital-name">Sericulture Research and Development Institute</h1>
        <p class="report-title">{{ $title }}</p>
        <p class="date-range">Period: {{ $date_range }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Reference No.</th>
                <th>Status</th>
                <th style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $t)
            <tr>
                <td>{{ $t->created_at->format('M d, Y') }}</td>
                <td><span style="font-family: monospace;">{{ $t->reference_no }}</span></td>
                <td>{{ $t->status }}</td>
                <td style="text-align: right; font-weight: bold;">₱{{ number_format($t->total_amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        <div class="total-box">
            <span class="total-label">Grand Total Revenue</span>
            <span class="total-amount">₱{{ number_format($total_sales, 2) }}</span>
        </div>
    </div>

    <div class="footer">
        This is a system-generated report. | Printed by: {{ auth()->user()->name }} | {{ now()->format('F d, Y h:i A') }}
    </div>
</body>
</html>