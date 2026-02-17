<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        @font-face {
            font-family: 'DejaVu Sans';
            src: local('DejaVu Sans');
        }
        body { 
            font-family: 'DejaVu Sans', sans-serif; /* Para suportado ang Peso Sign */
            color: #000; 
            margin: 0; 
            padding: 0;
            line-height: 1.4;
        }
        /* Header Layout */
        .header-container {
            width: 100%;
            border-bottom: 1.5px solid #000;
            padding-bottom: 8px;
            margin-bottom: 25px;
        }
        .logo-table {
            width: 100%;
            border: none;
        }
        .logo-table td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }
        .logo { 
            width: 70px; 
            height: 70px; 
        }
        .srdi-info {
            padding-left: 12px;
        }
        .srdi-info .univ-name { 
            margin: 0; 
            font-size: 14px; 
            font-weight: normal;
            text-transform: uppercase;
        }
        .srdi-info .inst-name { 
            margin: 0; 
            font-size: 16px; 
            font-weight: bold;
            text-transform: uppercase;
        }
        .srdi-info .address { 
            margin: 0; 
            font-size: 11px; 
            font-style: italic;
        }

        /* Report Title Section */
        .report-title {
            text-align: center;
            margin-bottom: 20px;
        }
        .report-title h3 {
            margin: 0;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 2px;
            border-bottom: 1px solid #000;
            display: inline-block;
            padding-bottom: 2px;
        }
        .report-date {
            font-size: 10px;
            margin-top: 5px;
            color: #333;
        }

        /* Table Styling */
        table.data-table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px;
        }
        table.data-table th { 
            background-color: #000; 
            color: #fff;
            text-transform: uppercase;
            font-weight: bold;
            border: 1px solid #000;
            padding: 8px 5px;
        }
        table.data-table td { 
            border: 1px solid #000; 
            padding: 6px; 
            text-align: left; 
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Zebra stripes simplified for B&W */
        tr:nth-child(even) { background-color: #f2f2f2; }

        /* Total Section */
        .footer-total {
            margin-top: 20px;
            text-align: right;
        }
        .total-box {
            display: inline-block;
            border: 2px solid #000;
            padding: 8px 15px;
            min-width: 150px;
        }
        .total-label {
            font-size: 9px;
            text-transform: uppercase;
            display: block;
            font-weight: bold;
        }
        .total-amount {
            font-size: 15px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="header-container">
        <table class="logo-table">
            <tr>
                <td width="70">
                    <img src="{{ public_path('img/srdi.png') }}" class="logo">
                </td>
                <td class="srdi-info">
                    <div class="univ-name">Don Mariano Marcos Memorial State University</div>
                    <div class="inst-name">Sericulture Research and Development Institute (SRDI)</div>
                    <div class="address">Sapilang, Bacnotan, La Union</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="report-title">
        <h3>Monthly Sales Report</h3>
        <p class="report-date">Date Generated: {{ $date }}</p>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th width="15%">Ref No.</th>
                <th width="20%">Customer</th>
                <th width="25%">Product</th>
                <th width="10%" class="text-center">Qty</th>
                <th width="15%" class="text-right">Price</th>
                <th width="15%" class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @php $grandTotal = 0; @endphp
            @foreach($orders as $order)
                @php 
                    $subtotal = $order->quantity * $order->price_at_sale;
                    $grandTotal += $subtotal;
                @endphp
                <tr>
                    <td style="font-family: monospace;">{{ $order->transaction->reference_no ?? 'N/A' }}</td>
                    <td>{{ $order->transaction->user->name ?? 'Walk-in' }}</td>
                    <td>{{ $order->product->product ?? 'Deleted Product' }}</td>
                    <td class="text-center">{{ $order->quantity }}</td>
                    <td class="text-right">&#8369;{{ number_format($order->price_at_sale, 2) }}</td>
                    <td class="text-right" style="font-weight: bold;">&#8369;{{ number_format($subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer-total">
        <div class="total-box">
            <span class="total-label">Grand Total (Net Sales)</span>
            <span class="total-amount">&#8369;{{ number_format($grandTotal, 2) }}</span>
        </div>
    </div>

</body>
</html>