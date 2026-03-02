import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import {
    Search,
    Filter,
    Package,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    ImageIcon,
    ChevronDown,
    Plus,
    Minus,
} from 'lucide-react';

// ---------------------------------------------------------------------------
const fmt = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n || 0);

const stockBadge = (qty) => {
    if (qty <= 0) return { label: 'Out of Stock', cls: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500' };
    if (qty <= 10) return { label: 'Low Stock', cls: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' };
    return { label: 'In Stock', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' };
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className={`inline-flex p-2.5 rounded-xl ${color} bg-opacity-10 mb-3`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{value}</p>
    </div>
);

// ---------------------------------------------------------------------------
// ADJUST STOCK MODAL
// ---------------------------------------------------------------------------
function AdjustModal({ product, onClose }) {
    const [form, setForm] = useState({
        product_id: product.id,
        quantity: 1,
        type: 'in',
        batch_code: '',
        restock_date: '',
        remarks: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const { errors } = usePage().props;

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('admin.inventory.adjust'), form, {
            onSuccess: () => onClose(),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-7">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Adjust Stock</h2>
                            <p className="text-xs font-bold text-indigo-600 mt-0.5 truncate max-w-[240px]">{product.product}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                            <XCircle size={20} />
                        </button>
                    </div>

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
                                            ? t === 'in'
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-rose-600 text-white border-rose-600'
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
                                <button type="button" onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} className="px-4 py-3 hover:bg-slate-100 transition text-slate-600"><Minus size={14} /></button>
                                <input
                                    type="number" min="1"
                                    value={form.quantity}
                                    onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                                    className="flex-1 text-center font-black text-slate-900 bg-transparent border-none focus:ring-0 text-sm"
                                />
                                <button type="button" onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))} className="px-4 py-3 hover:bg-slate-100 transition text-slate-600"><Plus size={14} /></button>
                            </div>
                            {errors?.quantity && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.quantity}</p>}
                        </div>

                        {/* Batch Code & Restock Date */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Batch Code</label>
                                <input
                                    type="text"
                                    value={form.batch_code}
                                    onChange={e => setForm(f => ({ ...f, batch_code: e.target.value }))}
                                    placeholder="e.g. BATCH-001"
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl text-sm px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Restock Date</label>
                                <input
                                    type="date"
                                    value={form.restock_date}
                                    onChange={e => setForm(f => ({ ...f, restock_date: e.target.value }))}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl text-sm px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                />
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Remarks</label>
                            <textarea
                                value={form.remarks}
                                onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                                placeholder="Optional notes..."
                                rows={2}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl text-sm px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase hover:bg-slate-200 transition">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`flex-1 py-3 rounded-xl text-white font-black text-xs uppercase shadow-lg transition-all active:scale-95 disabled:opacity-60 ${form.type === 'in' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
                            >
                                {submitting ? 'Saving...' : form.type === 'in' ? 'Add Stock' : 'Remove Stock'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
export default function InventoryIndex({ auth, products = [] }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [stockFilter, setStock] = useState('All');
    const [sortKey, setSortKey] = useState('product');
    const [sortDir, setSortDir] = useState('asc');
    const [currentPage, setPage] = useState(1);
    const [adjusting, setAdjusting] = useState(null); // product being adjusted
    const [toast, setToast] = useState(null);
    const ITEMS = 10;

    useEffect(() => {
        if (flash?.success) { setToast({ msg: flash.success, type: 'success' }); setTimeout(() => setToast(null), 3000); }
        if (flash?.error) { setToast({ msg: flash.error, type: 'error' }); setTimeout(() => setToast(null), 3000); }
    }, [flash]);

    useEffect(() => { setPage(1); }, [search, stockFilter]);

    const stats = useMemo(() => ({
        total: products.length,
        inStock: products.filter(p => (p.current_stock ?? 0) > 10).length,
        lowStock: products.filter(p => (p.current_stock ?? 0) > 0 && (p.current_stock ?? 0) <= 10).length,
        outOf: products.filter(p => (p.current_stock ?? 0) <= 0).length,
    }), [products]);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const SortIcon = ({ col }) =>
        sortKey === col
            ? sortDir === 'asc' ? <ArrowUpRight size={12} className="text-indigo-500" /> : <ArrowDownRight size={12} className="text-indigo-500" />
            : null;

    const processed = useMemo(() => {
        return products
            .filter(p => {
                const q = search.toLowerCase();
                const ms = !q || p.product?.toLowerCase().includes(q) || p.category?.category?.toLowerCase().includes(q);
                const qty = p.current_stock ?? 0;
                const mk = stockFilter === 'All'
                    || (stockFilter === 'In Stock' && qty > 10)
                    || (stockFilter === 'Low Stock' && qty > 0 && qty <= 10)
                    || (stockFilter === 'Out of Stock' && qty <= 0);
                return ms && mk;
            })
            .sort((a, b) => {
                let av = sortKey === 'current_stock' ? (a.current_stock ?? 0) : sortKey === 'price' ? parseFloat(a.price) : (a[sortKey] || '');
                let bv = sortKey === 'current_stock' ? (b.current_stock ?? 0) : sortKey === 'price' ? parseFloat(b.price) : (b[sortKey] || '');
                if (typeof av === 'string') av = av.toLowerCase();
                if (typeof bv === 'string') bv = bv.toLowerCase();
                if (av < bv) return sortDir === 'asc' ? -1 : 1;
                if (av > bv) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [products, search, stockFilter, sortKey, sortDir]);

    const totalPages = Math.ceil(processed.length / ITEMS);
    const paginated = processed.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);

    return (
        <AuthenticatedLayout header="Inventory Management">
            <Head title="Inventory Management" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Monitor stock levels and log adjustments per product.</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Products" value={stats.total} icon={Package} color="bg-emerald-500" />
                    <StatCard label="In Stock" value={stats.inStock} icon={CheckCircle2} color="bg-emerald-500" />
                    <StatCard label="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="bg-amber-500" />
                    <StatCard label="Out of Stock" value={stats.outOf} icon={XCircle} color="bg-rose-500" />
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search product or category..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-medium transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex items-center w-full md:w-52">
                            <Filter size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                            <select
                                value={stockFilter}
                                onChange={e => setStock(e.target.value)}
                                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer appearance-none"
                            >
                                <option value="All">All Status</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Product</th>
                                    <th onClick={() => handleSort('category')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none">
                                        <div className="flex items-center gap-1">Category <SortIcon col="category" /></div>
                                    </th>
                                    <th onClick={() => handleSort('price')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none">
                                        <div className="flex items-center gap-1">Price <SortIcon col="price" /></div>
                                    </th>
                                    <th onClick={() => handleSort('current_stock')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none">
                                        <div className="flex items-center gap-1">Stock <SortIcon col="current_stock" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-right text-[10px] uppercase font-black tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginated.length > 0 ? paginated.map(product => {
                                    const qty = product.current_stock ?? 0;
                                    const sb = stockBadge(qty);
                                    return (
                                        <tr key={product.id} className="group hover:bg-slate-50/80 transition-colors">
                                            {/* Product */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                                                        {product.image_url
                                                            ? <img src={product.image_url} alt={product.product} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                            : null}
                                                        <div className="hidden w-full h-full items-center justify-center text-slate-300">
                                                            <ImageIcon size={16} />
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{product.product}</p>
                                                </div>
                                            </td>
                                            {/* Category */}
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                                    {product.category?.category || '—'}
                                                </span>
                                            </td>
                                            {/* Price */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-slate-900">{fmt(product.price)}</span>
                                            </td>
                                            {/* Stock */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-slate-800">{qty.toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">units</span>
                                            </td>
                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${sb.cls}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sb.dot}`} />
                                                    {sb.label}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setAdjusting(product)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase hover:bg-emerald-600 hover:text-white transition-all"
                                                    >
                                                        Adjust
                                                    </button>
                                                    <Link
                                                        href={route('admin.inventory.show', product.id)}
                                                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                                        title="View Log"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <Package size={32} className="text-slate-300" />
                                                </div>
                                                <h3 className="text-slate-900 font-bold mb-1">No products found</h3>
                                                <p className="text-slate-500 text-xs mb-6">Try adjusting your filters.</p>
                                                <button onClick={() => { setSearch(''); setStock('All'); }} className="px-5 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors">
                                                    Clear Filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {processed.length > 0 && (
                        <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/30">
                            <p className="text-[11px] font-bold text-slate-400">
                                Showing {Math.min((currentPage - 1) * ITEMS + 1, processed.length)}–{Math.min(currentPage * ITEMS, processed.length)} of {processed.length} products
                            </p>
                        </div>
                    )}
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {/* Adjust Modal */}
            {adjusting && <AdjustModal product={adjusting} onClose={() => setAdjusting(null)} />}

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                    {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    {toast.msg}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
