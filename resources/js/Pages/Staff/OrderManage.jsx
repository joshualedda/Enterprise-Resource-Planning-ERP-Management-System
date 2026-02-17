import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function OrderManage({ auth, orders }) {
    const [processingId, setProcessingId] = useState(null);
    const [activeTab, setActiveTab] = useState('In Process');

    const handleStatusUpdate = (id, newStatus) => {
        setProcessingId(id);
        router.patch(route('staff.orders.update', { transaction: id }), {
            status: newStatus
        }, {
            onFinish: () => setProcessingId(null),
            preserveScroll: true
        });
    };

    const handlePrint = (order) => {
        const printWindow = window.open('', '_blank');
        const logoUrl = '/img/srdi.png'; // Siguraduhing nasa public/images folder ito

        printWindow.document.write(`
            <html>
                <head>
                    <title>SRDI Official Receipt - ${order.reference_no}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; line-height: 1.2; }
                        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                        .logo { width: 70px; height: 70px; margin-bottom: 5px; }
                        .institute-name { font-size: 14px; font-weight: bold; margin: 0; }
                        .address { font-size: 9px; margin: 2px 0; }
                        .receipt-title { font-size: 16px; font-weight: bold; margin-top: 10px; text-transform: uppercase; border: 1px solid #000; display: inline-block; padding: 2px 10px; }
                        .info { font-size: 11px; margin-bottom: 15px; width: 100%; }
                        .items-table { width: 100%; border-collapse: collapse; font-size: 11px; }
                        .items-table th { border-bottom: 1px solid #000; text-align: left; padding: 5px 0; }
                        .items-table td { padding: 5px 0; }
                        .total-section { margin-top: 15px; border-top: 2px dashed #000; padding-top: 10px; text-align: right; }
                        .footer { text-align: center; margin-top: 25px; font-size: 9px; }
                        @page { size: auto; margin: 0mm; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="${logoUrl}" class="logo" onerror="this.style.display='none'"/>
                        <p class="institute-name">SERICULTURE RESEARCH AND DEVELOPMENT INSTITUTE</p>
                        <p class="address">Sapilang, Bacnotan, La Union</p>
                        <div class="receipt-title">Official Receipt</div>
                    </div>

                    <table class="info">
                        <tr><td><strong>REF:</strong> ${order.reference_no}</td><td style="text-align:right"><strong>DATE:</strong> ${new Date().toLocaleDateString()}</td></tr>
                        <tr><td colspan="2"><strong>CUSTOMER:</strong> ${order.user?.first_name} ${order.user?.last_name}</td></tr>
                    </table>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.order_items.map(item => `
                                <tr>
                                    <td>${item.product?.product}</td>
                                    <td style="text-align: center;">${item.quantity}</td>
                                    <td style="text-align: right;">₱${(item.quantity * item.price_at_sale).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <p style="font-size: 13px;"><strong>TOTAL PAID: ₱${Number(order.total_amount).toLocaleString()}</strong></p>
                    </div>

                    <div class="footer">
                        <p>Issued by: ${auth.user.first_name} ${auth.user.last_name}</p>
                        <p>Thank you for supporting SRDI!</p>
                    </div>

                    <script>
                        window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const filteredOrders = orders.data.filter(order => 
        activeTab === 'All' ? true : order.status === activeTab
    );

    return (
        <AuthenticatedLayout header="Order Management">
            <Head title="Order Management" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Order Processing</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">SRDI Facility Operations</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                    {['In Process', 'Ready to Pickup', 'Product Received', 'All'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-6">
                        <div className="flex-1">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{order.reference_no}</span>
                            <h3 className="text-lg font-black text-slate-800 uppercase mt-2">{order.user?.first_name} {order.user?.last_name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(order.created_at).toDateString()}</p>
                        </div>

                        <div className="flex-[1.5] border-l border-slate-100 pl-6">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Order Items</p>
                            <div className="flex flex-wrap gap-2">
                                {order.order_items.map((item, i) => (
                                    <span key={i} className="text-[10px] font-bold bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-600">
                                        {item.product?.product} (x{item.quantity})
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="text-right px-8 border-l border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Total Paid</p>
                            <p className="text-xl font-black text-indigo-600">₱{Number(order.total_amount).toLocaleString()}</p>
                        </div>

                        <div className="flex gap-2 w-full lg:w-auto">
                            {order.status === 'In Process' && (
                                <button 
                                    onClick={() => handleStatusUpdate(order.id, 'Ready to Pickup')}
                                    disabled={processingId === order.id}
                                    className="flex-1 lg:flex-none px-6 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    {processingId === order.id ? 'Updating...' : 'Set to Ready'}
                                </button>
                            )}

                            {order.status === 'Ready to Pickup' && (
                                <>
                                    <button 
                                        onClick={() => handlePrint(order)}
                                        className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-black transition-all"
                                    >
                                        Print Receipt
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(order.id, 'Product Received')}
                                        disabled={processingId === order.id}
                                        className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                    >
                                        Release Product
                                    </button>
                                </>
                            )}

                            {order.status === 'Product Received' && (
                                <div className="px-6 py-3 bg-slate-100 text-slate-400 text-[10px] font-black rounded-2xl uppercase border border-slate-200">
                                    Released
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="bg-white rounded-[3rem] py-20 text-center border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No orders found in this section</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}