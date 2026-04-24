import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft, Calendar, User, CreditCard, Package,
    MapPin, Printer, ImageIcon, Truck, Store, Phone,
    Building2, XCircle, AlertTriangle
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        'pending':           'bg-amber-50 text-amber-600 border-amber-100',
        'in process':        'bg-blue-50 text-blue-600 border-blue-100',
        'ready to pickup':   'bg-purple-50 text-purple-600 border-purple-100',
        'on delivery':       'bg-sky-50 text-sky-600 border-sky-100',
        'product received':  'bg-emerald-50 text-emerald-600 border-emerald-100',
        'cancelled':         'bg-rose-50 text-rose-600 border-rose-100',
    };
    const key = status?.toLowerCase() || 'pending';
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${styles[key] || styles['pending']}`}>
            <div className="w-2 h-2 rounded-full bg-current opacity-60" />
            {status}
        </span>
    );
};

// ── Reject Receipt Modal ──────────────────────────────────────────────────────
function RejectModal({ open, onConfirm, onCancel, loading }) {
    const [reason, setReason] = React.useState('');

    // Reset reason when modal opens
    React.useEffect(() => {
        if (open) setReason('');
    }, [open]);

    if (!open) return null;

    const handleConfirm = () => {
        if (!reason.trim()) return;
        onConfirm(reason.trim());
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-4">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-rose-500" />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 text-sm">Reject Receipt</p>
                        <p className="text-xs text-slate-500 mt-0.5">Order will be cancelled and stock restored.</p>
                    </div>
                </div>

                {/* Info box */}
                <div className="text-xs text-slate-600 bg-rose-50 border border-rose-100 rounded-xl p-3 leading-relaxed">
                    The customer will be <strong>notified</strong> with your reason. Inventory will be <strong>restored automatically</strong>.
                </div>

                {/* Reason field */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Reason for Rejection <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Invalid receipt, wrong reference number, unreadable image..."
                        rows={3}
                        maxLength={500}
                        className="w-full border border-slate-200 rounded-xl text-xs p-3 resize-none focus:ring-rose-400 focus:border-rose-400 placeholder:text-slate-300"
                    />
                    <p className="text-[10px] text-slate-400 text-right">{reason.length}/500</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !reason.trim()}
                        className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                        <XCircle size={13} />
                        {loading ? 'Rejecting...' : 'Reject Receipt'}
                    </button>
                </div>
            </div>
        </div>
    );
}
// ── Cancellation Modal ────────────────────────────────────────────────────────
function CancellationModal({ open, onConfirm, onCancel, loading }) {
    const [reason, setReason] = React.useState('');
    React.useEffect(() => { if (open) setReason(''); }, [open]);
    if (!open) return null;
    const handleConfirm = () => {
        if (!reason.trim()) return;
        onConfirm(reason.trim());
    };
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                        <XCircle size={20} className="text-rose-500" />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 text-sm">Cancel Order</p>
                        <p className="text-xs text-slate-500 mt-0.5">Please provide a reason for cancelling.</p>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Reason for Cancellation <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Out of stock, customer requested, etc..."
                        rows={3}
                        maxLength={500}
                        className="w-full border border-slate-200 rounded-xl text-xs p-3 resize-none focus:ring-rose-400 focus:border-rose-400 placeholder:text-slate-300"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50">Back</button>
                    <button onClick={handleConfirm} disabled={loading || !reason.trim()} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black disabled:opacity-50 flex items-center justify-center gap-1.5">
                        {loading ? 'Processing...' : 'Confirm Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function View({ auth, order, shippingAddress }) {
    const [processing, setProcessing] = React.useState(false);
    const [rejectModal, setRejectModal] = React.useState(false);
    const [cancelModal, setCancelModal] = React.useState(false);
    const [rejecting, setRejecting] = React.useState(false);
    const [cancelling, setCancelling] = React.useState(false);

    const isDelivery = order.order_type === 'delivery';

    // Status buttons — walk-in: no "On Delivery", delivery: no "Ready to Pickup"
    const statusButtons = [
        { label: 'In Process',       color: 'bg-blue-500 hover:bg-blue-600 text-white',       activeRing: 'ring-blue-500',    show: true },
        { label: 'Ready to Pickup',  color: 'bg-purple-500 hover:bg-purple-600 text-white',   activeRing: 'ring-purple-500',  show: !isDelivery },
        { label: 'On Delivery',      color: 'bg-sky-500 hover:bg-sky-600 text-white',          activeRing: 'ring-sky-500',     show: isDelivery },
        { label: 'Product Received', color: 'bg-emerald-500 hover:bg-emerald-600 text-white',  activeRing: 'ring-emerald-500', show: true },
        { label: 'Cancelled',        color: 'bg-rose-500 hover:bg-rose-600 text-white',        activeRing: 'ring-rose-500',    show: true },
    ].filter(s => s.show);

    const updateStatus = (newStatus, reason = null) => {
        if (processing || cancelling) return;
        if (newStatus === 'Cancelled') setCancelling(true);
        else setProcessing(true);

        const data = { status: newStatus };
        if (reason) data.cancellation_reason = reason;

        router.put(route('admin.orders.update', order.id), data, {
            onSuccess: () => { 
                toast.success('Order status updated.'); 
                setCancelModal(false);
            },
            onError: (err) => {
                toast.error(err.message || 'Failed to update status.');
            },
            onFinish: () => {
                setProcessing(false);
                setCancelling(false);
            },
        });
    };

    const handleRejectReceipt = (reason) => {
        setRejecting(true);
        router.post(route('admin.orders.rejectReceipt', order.id), { reason }, {
            onSuccess: () => {
                toast.success('Receipt rejected. Order cancelled and stock restored.');
                setRejectModal(false);
                setRejecting(false);
            },
            onError: () => {
                toast.error('Failed to reject receipt.');
                setRejectModal(false);
                setRejecting(false);
            },
            onFinish: () => setRejecting(false),
        });
    };

    const fmt = (amount) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Order #${order.reference_no}`} />
            <Toaster position="top-right" />

            <RejectModal
                open={rejectModal}
                onConfirm={handleRejectReceipt}
                onCancel={() => setRejectModal(false)}
                loading={rejecting}
            />

            <CancellationModal
                open={cancelModal}
                onConfirm={(reason) => updateStatus('Cancelled', reason)}
                onCancel={() => setCancelModal(false)}
                loading={cancelling}
            />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.orders.index')}
                            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order #{order.reference_no}</h1>
                                <StatusBadge status={order.status} />
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border
                                    ${isDelivery ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                    {isDelivery ? <Truck size={11} /> : <Store size={11} />}
                                    {isDelivery ? 'Delivery' : 'Walk-in'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                    weekday: 'long', year: 'numeric', month: 'long',
                                    day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-white transition-colors">
                            <Printer size={16} /> Print
                        </button>

                        {/* Status Buttons — hidden if final status */}
                        {order.status !== 'Cancelled' && order.status !== 'Product Received' && (
                            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm flex-wrap gap-0.5">
                                {statusButtons.map((s) => (
                                    <button key={s.label} 
                                        onClick={() => {
                                            if (s.label === 'Cancelled') setCancelModal(true);
                                            else updateStatus(s.label);
                                        }}
                                        disabled={processing || cancelling || order.status === s.label}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            order.status === s.label
                                                ? `${s.color} shadow-md ring-2 ring-offset-2 ${s.activeRing}`
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left — Order Items + Delivery Address */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Order Items */}
                        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5">
                            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                <Package className="text-indigo-500" size={20} /> Order Items
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
                                        {order.order_items?.map((item) => (
                                            <tr key={item.id}>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                                                            {item.product?.image_url ? (
                                                                <img src={item.product.image_url} alt={item.product.product}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                            ) : null}
                                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300"
                                                                style={{ display: item.product?.image_url ? 'none' : 'flex' }}>
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
                                                <td className="py-4 text-right font-medium text-slate-600">{fmt(item.price_at_sale)}</td>
                                                <td className="py-4 text-right font-black text-slate-900">{fmt(item.price_at_sale * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="pt-6 text-right font-medium text-slate-500">Total Amount</td>
                                            <td className="pt-6 text-right text-xl font-black text-indigo-600">{fmt(order.total_amount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {isDelivery && (
                            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5">
                                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <Truck className="text-blue-500" size={20} /> Delivery Address
                                </h2>
                                {shippingAddress ? (
                                    <div className="space-y-3">
                                        {shippingAddress.phone_number && (
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <Phone size={14} className="text-slate-400 shrink-0" />
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                                                    <p className="text-sm font-bold text-slate-800">{shippingAddress.phone_number}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                            <div className="w-full">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Address</p>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                                                    {shippingAddress.barangay && (
                                                        <div><span className="text-slate-400 font-bold">Barangay: </span><span className="text-slate-800 font-bold">{shippingAddress.barangay}</span></div>
                                                    )}
                                                    {shippingAddress.municipality && (
                                                        <div><span className="text-slate-400 font-bold">City/Town: </span><span className="text-slate-800 font-bold">{shippingAddress.municipality}</span></div>
                                                    )}
                                                    {shippingAddress.province && (
                                                        <div><span className="text-slate-400 font-bold">Province: </span><span className="text-slate-800 font-bold">{shippingAddress.province}</span></div>
                                                    )}
                                                    {shippingAddress.region && (
                                                        <div><span className="text-slate-400 font-bold">Region: </span><span className="text-slate-800 font-bold">{shippingAddress.region}</span></div>
                                                    )}
                                                    {shippingAddress.zipcode && (
                                                        <div><span className="text-slate-400 font-bold">ZIP Code: </span><span className="text-slate-800 font-bold">{shippingAddress.zipcode}</span></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <MapPin size={16} className="text-amber-400 shrink-0" />
                                        <p className="text-sm font-bold text-amber-600">No delivery address on file for this customer.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right — Customer + Receipt */}
                    <div className="space-y-4">

                        {/* Customer Info */}
                        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5">
                            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                <User className="text-purple-500" size={20} /> Customer Details
                            </h2>
                            {order.user ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
                                            {order.user.first_name?.[0] || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{order.user.first_name} {order.user.last_name}</p>
                                            <p className="text-xs text-slate-500">{order.user.email}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-600 font-bold uppercase tracking-wider">
                                                Registered
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex gap-3 items-center">
                                            {isDelivery ? <Truck className="text-blue-400 shrink-0" size={16} /> : <Store className="text-slate-400 shrink-0" size={16} />}
                                            <p className="text-sm text-slate-600 font-medium">{isDelivery ? 'Delivery Order' : 'Walk-in / Pickup'}</p>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            {order.payment_method === 'Cash'
                                                ? <CreditCard className="text-slate-400 shrink-0" size={16} />
                                                : <Building2 className="text-green-500 shrink-0" size={16} />
                                            }
                                            <p className="text-sm text-slate-600 font-medium">
                                                {order.payment_method === 'Cash'
                                                    ? 'Cash — Pay on Pickup'
                                                    : `Bank Transfer ${order.receipt_path ? '(Receipt Uploaded)' : '(No Receipt)'}`
                                                }
                                            </p>
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

                        {/* Payment Receipt */}
                        {order.receipt_path && (
                            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5">
                                <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                                    <CreditCard className="text-emerald-500" size={20} /> Payment Receipt
                                </h2>

                                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                    <img src={`/storage/${order.receipt_path}`} alt="Receipt"
                                        className="w-full object-contain max-h-40 cursor-zoom-in"
                                        onClick={() => setReceiptModal({ open: true, src: `/storage/${order.receipt_path}` })} />
                                </div>

                                <div className="mt-3 flex gap-2">
                                    {/* View Receipt */}
                                    <button onClick={() => setReceiptModal({ open: true, src: `/storage/${order.receipt_path}` })}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                                        <ImageIcon size={13} /> View Receipt
                                    </button>

                                    {/* Reject Receipt — visible only if Pending */}
                                    {order.status === 'Pending' && (
                                        <button onClick={() => setRejectModal(true)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors">
                                            <XCircle size={13} /> Reject Receipt
                                        </button>
                                    )}
                                </div>

                                {/* Cancelled notice */}
                                {order.status === 'Cancelled' && (
                                    <div className="mt-3 flex flex-col gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100">
                                        <div className="flex items-center gap-2">
                                            <XCircle size={14} className="text-rose-500 shrink-0" />
                                            <p className="text-xs font-black text-rose-600 uppercase tracking-wider">Cancelled</p>
                                        </div>
                                        {order.cancellation_reason && (
                                            <p className="text-[11px] text-rose-500 font-medium leading-relaxed bg-white/50 p-2 rounded-lg border border-rose-100/50">
                                                <strong>Reason:</strong> {order.cancellation_reason}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Receipt Zoom Modal */}
            {receiptModal.open && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setReceiptModal({ open: false, src: null })}>
                    <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setReceiptModal({ open: false, src: null })}
                            className="absolute -top-3 -right-3 z-50 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors text-sm font-black">
                            ✕
                        </button>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                            <div className="px-4 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <CreditCard size={14} className="text-emerald-500" />
                                <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Payment Receipt</span>
                                <span className="ml-auto text-[10px] text-slate-400 font-medium">#{order.reference_no}</span>
                            </div>
                            <img src={receiptModal.src} alt="Receipt" className="w-full object-contain max-h-[70vh]" />
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}