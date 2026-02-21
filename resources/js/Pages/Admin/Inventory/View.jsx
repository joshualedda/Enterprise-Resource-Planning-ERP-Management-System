import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    TrendingUp,
    TrendingDown,
    Calendar,
    Hash,
    FileText,
    Trash2,
    CheckCircle2,
    XCircle,
    Plus,
    Minus,
    ImageIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
const fmt = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ---------------------------------------------------------------------------
export default function InventoryView({ auth, product, logs = [], current_stock = 0, total_in = 0, total_out = 0 }) {
    const { errors, flash } = usePage().props;

    const [form, setForm] = useState({
        product_id: product.id,
        quantity: 1,
        type: 'in',
        batch_code: '',
        restock_date: '',
        remarks: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [toastMsg, setToastMsg] = useState(flash?.success || null);

    const isOut = current_stock <= 0;
    const isLow = current_stock > 0 && current_stock <= 10;

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('admin.inventory.adjust'), form, {
            onSuccess: () => {
                setToastMsg('Inventory adjustment saved!');
                setTimeout(() => setToastMsg(null), 3000);
                setForm(f => ({ ...f, quantity: 1, batch_code: '', restock_date: '', remarks: '' }));
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (logId) => {
        if (!confirm('Delete this log entry?')) return;
        router.delete(route('admin.inventory.log.destroy', logId), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header="Inventory Detail">
            <Head title={`Inventory – ${product.product}`} />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* Back */}
                <Link
                    href={route('admin.inventory.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Inventory
                </Link>

                {/* ── Product Hero Card ── */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5">
                        {/* Image */}
                        <div className="md:col-span-2 bg-slate-50 min-h-[280px] flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 relative p-6">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.product}
                                    className="max-h-52 object-contain drop-shadow-lg"
                                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300"
                                style={{ display: product.image_url ? 'none' : 'flex' }}>
                                <ImageIcon size={48} className="opacity-40" />
                                <span className="text-sm font-bold mt-3 text-slate-400">No Image</span>
                            </div>

                            {/* Stock Overlay Badge */}
                            <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border ${isOut ? 'bg-rose-50 text-rose-600 border-rose-100' : isLow ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                </span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                                    {product.category?.category || 'Uncategorized'}
                                </span>
                                <h1 className="text-3xl font-black text-slate-900 mt-3 mb-1 leading-tight">{product.product}</h1>
                                <p className="text-2xl font-bold text-indigo-600 mb-4">{fmt(product.price)}</p>
                                {product.description && (
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-4 mb-4">
                                        {product.description}
                                    </p>
                                )}
                            </div>

                            {/* Stock KPIs */}
                            <div className="grid grid-cols-3 gap-4 mt-2">
                                {[
                                    { label: 'Current Stock', value: current_stock, color: isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-600', bg: isOut ? 'bg-rose-50' : isLow ? 'bg-amber-50' : 'bg-emerald-50' },
                                    { label: 'Total In', value: total_in, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'Total Out', value: total_out, color: 'text-rose-600', bg: 'bg-rose-50' },
                                ].map(({ label, value, color, bg }) => (
                                    <div key={label} className={`${bg} p-4 rounded-2xl text-center`}>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                                        <p className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">units</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Two-Column Layout: Log Form + Log Table ── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* LEFT – Adjust Form */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 sticky top-6">
                            <h2 className="font-black text-slate-800 text-lg mb-5">New Adjustment</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Type Toggle */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['in', 'out'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, type: t }))}
                                                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${form.type === t
                                                    ? t === 'in' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {t === 'in' ? '+ Stock In' : '− Stock Out'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Quantity</label>
                                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                        <button type="button" onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} className="px-4 py-3 hover:bg-slate-100 transition text-slate-600">
                                            <Minus size={14} />
                                        </button>
                                        <input
                                            type="number" min="1"
                                            value={form.quantity}
                                            onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                                            className="flex-1 text-center font-black text-slate-900 bg-transparent border-none focus:ring-0 text-sm"
                                        />
                                        <button type="button" onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))} className="px-4 py-3 hover:bg-slate-100 transition text-slate-600">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    {errors?.quantity && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.quantity}</p>}
                                </div>

                                {/* Batch Code */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Batch Code</label>
                                    <input
                                        type="text"
                                        value={form.batch_code}
                                        onChange={e => setForm(f => ({ ...f, batch_code: e.target.value }))}
                                        placeholder="e.g. BATCH-2026-001"
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl text-sm px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                    />
                                </div>

                                {/* Restock Date */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Restock Date</label>
                                    <input
                                        type="date"
                                        value={form.restock_date}
                                        onChange={e => setForm(f => ({ ...f, restock_date: e.target.value }))}
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl text-sm px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                    />
                                </div>

                                {/* Remarks */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Remarks</label>
                                    <textarea
                                        value={form.remarks}
                                        onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                                        placeholder="Optional notes..."
                                        rows={3}
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl text-sm px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-3.5 rounded-xl text-white font-black text-sm shadow-lg transition-all active:scale-95 disabled:opacity-60 ${form.type === 'in' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
                                >
                                    {submitting ? 'Saving...' : form.type === 'in' ? '+ Add Stock' : '− Remove Stock'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT – Log Table */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <h2 className="font-black text-slate-800 text-lg">Adjustment Log</h2>
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                                    {logs.length} entries
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-5 py-3.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Type</th>
                                            <th className="px-5 py-3.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Qty</th>
                                            <th className="px-5 py-3.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Batch</th>
                                            <th className="px-5 py-3.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Restock Date</th>
                                            <th className="px-5 py-3.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Remarks</th>
                                            <th className="px-5 py-3.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Logged</th>
                                            <th className="px-5 py-3.5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {logs.length > 0 ? logs.map(log => (
                                            <tr key={log.id} className="group hover:bg-slate-50/80 transition-colors">
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${log.type === 'in' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                        {log.type === 'in' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                        {log.type === 'in' ? 'Stock In' : 'Stock Out'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-sm font-black ${log.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {log.type === 'in' ? '+' : '−'}{log.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                                        {log.batch_code || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-bold text-slate-600">{fmtDate(log.restock_date)}</span>
                                                </td>
                                                <td className="px-5 py-4 max-w-[160px]">
                                                    <span className="text-xs text-slate-500 font-medium line-clamp-2">{log.remarks || '—'}</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-bold text-slate-500">{fmtDateTime(log.created_at)}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(log.id)}
                                                        className="p-1.5 hover:bg-rose-50 hover:text-rose-500 text-slate-300 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Delete entry"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="py-16 text-center">
                                                    <FileText size={32} className="mx-auto text-slate-200 mb-3" />
                                                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No adjustment logs yet</p>
                                                    <p className="text-slate-300 text-xs font-medium mt-1">Use the form on the left to record stock movements.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-emerald-600 text-white text-sm font-bold animate-in slide-in-from-right duration-300">
                    <CheckCircle2 size={18} />
                    {toastMsg}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
