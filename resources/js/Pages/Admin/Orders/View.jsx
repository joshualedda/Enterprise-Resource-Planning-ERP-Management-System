import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft,
    Calendar,
    User,
    CreditCard,
    Package,
    MapPin,
    Printer,
    ImageIcon
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        'pending': 'bg-amber-50 text-amber-600 border-amber-100',
        'in process': 'bg-blue-50 text-blue-600 border-blue-100',
        'ready to pickup': 'bg-purple-50 text-purple-600 border-purple-100',
        'product received': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'cancelled': 'bg-rose-50 text-rose-600 border-rose-100',
    };
    const key = status?.toLowerCase() || 'pending';

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${styles[key] || styles.pending}`}>
            <div className={`w-2 h-2 rounded-full ${styles[key]?.replace('bg-', 'bg-').replace('text-', 'bg-').replace('border-', '') || 'bg-slate-400'}`} />
            {status}
        </span>
    );
};

export default function View({ auth, order }) {
    const [processing, setProcessing] = React.useState(false);

    const updateStatus = (newStatus) => {
        if (processing) return;
        setProcessing(true);

        router.put(route('admin.orders.update', order.id), {
            status: newStatus
        }, {
            onSuccess: () => {
                toast.success('Order status updated successfully.');
                setProcessing(false);
            },
            onError: () => {
                toast.error('Failed to update status.');
                setProcessing(false);
            },
            onFinish: () => setProcessing(false)
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Order #${order.reference_no}`} />
            <Toaster position="top-right" />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

                {/* 1. Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.orders.index')} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order #{order.reference_no}</h1>
                                <StatusBadge status={order.status} />
                            </div>
                            <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-white transition-colors"
                        >
                            <Printer size={16} />
                            Print
                        </button>

                        {/* Status Actions */}
                        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                            {[
                                { label: 'In Process', color: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200', activeRing: 'ring-blue-500' },
                                { label: 'Ready to Pickup', color: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-200', activeRing: 'ring-purple-500' },
                                { label: 'Product Received', color: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200', activeRing: 'ring-emerald-500' },
                                { label: 'Cancelled', color: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200', activeRing: 'ring-rose-500' }
                            ].map((status) => (
                                <button
                                    key={status.label}
                                    onClick={() => updateStatus(status.label)}
                                    disabled={processing || order.status === status.label}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${order.status === status.label
                                        ? `${status.color} shadow-md ring-2 ring-offset-2 ${status.activeRing}`
                                        : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 2. Order Details (Left Column) */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Items Table */}
                        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden p-5">
                            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                <Package className="text-indigo-500" size={20} />
                                Order Items
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Product</th>
                                            <th className="pb-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-center">Qty</th>
                                            <th className="pb-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Price</th>
                                            <th className="pb-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {order.orders?.map((item) => (
                                            <tr key={item.id}>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                                                            {item.product?.image_url ? (
                                                                <img
                                                                    src={item.product.image_url}
                                                                    alt={item.product.product}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300" style={{ display: item.product?.image_url ? 'none' : 'flex' }}>
                                                                <ImageIcon size={20} className="opacity-50" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{item.product?.product || 'Deleted Product'}</p>
                                                            <p className="text-xs text-slate-500">{item.product?.category?.category || 'General'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center font-bold text-slate-700">{item.quantity}</td>
                                                <td className="py-4 text-right font-medium text-slate-600">{formatCurrency(item.price_at_sale)}</td>
                                                <td className="py-4 text-right font-black text-slate-900">{formatCurrency(item.price_at_sale * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="pt-6 text-right font-medium text-slate-500">Total Amount</td>
                                            <td className="pt-6 text-right text-xl font-black text-indigo-600">{formatCurrency(order.total_amount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* 3. Customer & Info Sidebar (Right Column) */}
                    <div className="space-y-4">

                        {/* Customer Info */}
                        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5">
                            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                <User className="text-purple-500" size={20} />
                                Customer Details
                            </h2>
                            {order.user ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
                                            {order.user.first_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{order.user.first_name} {order.user.last_name}</p>
                                            <p className="text-xs text-slate-500">{order.user.email}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-600 font-bold uppercase tracking-wider">
                                                Registered
                                            </span>
                                        </div>
                                    </div>
                                    {/* Assuming potential address fields if added later */}
                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <MapPin className="text-slate-400 shrink-0" size={16} />
                                            <p className="text-sm text-slate-600 font-medium">No address provided</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <CreditCard className="text-slate-400 shrink-0" size={16} />
                                            <p className="text-sm text-slate-600 font-medium capitalize">{order.receipt_path ? 'Payment Uploaded' : 'Pay on Pickup'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="font-bold text-slate-900">Walk-in Customer</p>
                                    <p className="text-sm text-slate-500">Transacted by: {order.transacted_by || 'Staff'}</p>
                                </div>
                            )}
                        </div>

                        {/* Payment Proof (If exists) */}
                        {order.receipt_path && (
                            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5">
                                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="text-emerald-500" size={20} />
                                    Payment Receipt
                                </h2>
                                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                    <img src={`/storage/${order.receipt_path}`} alt="Receipt" className="w-full object-contain max-h-64" />
                                </div>
                                <a href={`/storage/${order.receipt_path}`} target="_blank" className="block text-center mt-3 text-sm font-bold text-indigo-600 hover:underline">
                                    View Full Component
                                </a>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
