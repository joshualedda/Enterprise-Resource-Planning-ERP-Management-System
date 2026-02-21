import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    Filter,
    ShoppingBag,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
    Eye,
    Package,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0);

const statusConfig = {
    'In Process': { classes: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500' },
    'Ready to Pickup': { classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse', dot: 'bg-emerald-500' },
    'Product Received': { classes: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    'Cancelled': { classes: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-400' },
};

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { classes: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${cfg.classes}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </span>
    );
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function MyOrders({ auth, orders }) {
    // --- Existing Logic (preserved) ---
    const [processingId, setProcessingId] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingData, setRatingData] = useState({ items: [], orderId: null, ratings: {} });
    const [hoveredStars, setHoveredStars] = useState({});

    // --- New Table Controls ---
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

    const allOrders = orders?.data || [];

    // KPI stats
    const stats = useMemo(() => ({
        total: allOrders.length,
        active: allOrders.filter(o => !['Product Received', 'Cancelled'].includes(o.status)).length,
        received: allOrders.filter(o => o.status === 'Product Received').length,
        spend: allOrders.filter(o => o.status === 'Product Received').reduce((s, o) => s + Number(o.total_amount || 0), 0),
    }), [allOrders]);

    // Filtered + sorted data
    const processedOrders = useMemo(() => {
        let result = allOrders.filter(o => {
            const q = search.toLowerCase();
            const matchSearch = !q || o.reference_no?.toLowerCase().includes(q);
            const matchStatus = statusFilter === 'All' || o.status === statusFilter;
            return matchSearch && matchStatus;
        });

        result.sort((a, b) => {
            let av = a[sortConfig.key], bv = b[sortConfig.key];
            if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
            if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        // Always float "Ready to Pickup" to the top
        result.sort((a, b) => (a.status === 'Ready to Pickup' ? -1 : b.status === 'Ready to Pickup' ? 1 : 0));

        return result;
    }, [allOrders, search, statusFilter, sortConfig]);

    const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
    const paginated = processedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            [1, 2, 3, 4, '...', totalPages].forEach(p => pages.push(p));
        } else if (currentPage >= totalPages - 2) {
            [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages].forEach(p => pages.push(p));
        } else {
            [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages].forEach(p => pages.push(p));
        }
        return pages;
    };

    const handleSort = (key) =>
        setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));

    const SortIcon = ({ col }) =>
        sortConfig.key === col
            ? sortConfig.direction === 'asc'
                ? <ArrowUpRight size={12} className="text-indigo-500" />
                : <ArrowDownRight size={12} className="text-indigo-500" />
            : null;

    // --- Existing Handlers (preserved) ---
    const handleProductReceived = async () => {
        const transactionId = confirmModal.id;
        const currentOrder = allOrders.find(o => o.id === transactionId);
        setProcessingId(transactionId);
        setConfirmModal({ open: false, id: null });
        try {
            await axios.patch(`/transactions/${transactionId}/status`, { status: 'Product Received' });
            setRatingData({ items: currentOrder.order_items, orderId: transactionId, ratings: {} });
            setShowRatingModal(true);
            router.reload({ preserveScroll: true });
        } catch {
            alert('Update failed.');
        } finally {
            setProcessingId(null);
        }
    };

    const submitRatings = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const ratings = ratingData.items.map(item => ({
            product_id: item.product_id,
            stars: ratingData.ratings[item.product_id] || 5,
            comment: formData.get(`comment-${item.product_id}`)
        }));
        try {
            await axios.post('/ratings/bulk', { ratings, order_id: ratingData.orderId });
            setShowRatingModal(false);
            setShowSuccessModal(true);
            router.reload({ preserveScroll: true });
        } catch {
            alert('Could not submit ratings.');
        }
    };

    const openDetails = (order) => { setViewingOrder(order); setIsDetailsOpen(true); };

    // ---------------------------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------------------------
    return (
        <AuthenticatedLayout header="My Orders">
            <Head title="My Orders" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── 1. Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Orders</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Track your facility pickups and purchase history.</p>
                    </div>
                </div>

                {/* ── 2. KPI Summary Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'bg-indigo-500' },
                        { label: 'Active Orders', value: stats.active, icon: RefreshCw, color: 'bg-blue-500' },
                        { label: 'Orders Received', value: stats.received, icon: CheckCircle, color: 'bg-emerald-500' },
                        { label: 'Total Spent', value: formatCurrency(stats.spend), icon: Package, color: 'bg-amber-500' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`inline-flex p-2.5 rounded-xl ${color} bg-opacity-10 mb-3`}>
                                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                            <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{value}</p>
                        </div>
                    ))}
                </div>

                {/* ── 3. Search & Filter Bar ── */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by reference number..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-medium transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex items-center w-full md:w-56">
                            <Filter size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors appearance-none"
                            >
                                <option value="All">All Status</option>
                                <option value="In Process">In Process</option>
                                <option value="Ready to Pickup">Ready to Pickup</option>
                                <option value="Product Received">Product Received</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── 4. Orders Table ── */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th
                                        onClick={() => handleSort('reference_no')}
                                        className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-1">Reference <SortIcon col="reference_no" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                        Items
                                    </th>
                                    <th
                                        onClick={() => handleSort('total_amount')}
                                        className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-1">Total <SortIcon col="total_amount" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                        Status
                                    </th>
                                    <th
                                        onClick={() => handleSort('created_at')}
                                        className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-1">Date <SortIcon col="created_at" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-[10px] uppercase font-black tracking-widest text-slate-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginated.length > 0 ? paginated.map(order => (
                                    <tr
                                        key={order.id}
                                        className={`group hover:bg-slate-50/80 transition-colors ${order.status === 'Ready to Pickup' ? 'bg-emerald-50/30' : ''}`}
                                    >
                                        {/* Reference */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-indigo-600 font-mono">
                                                #{order.reference_no}
                                            </span>
                                        </td>

                                        {/* Item Avatars */}
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-2">
                                                {order.order_items?.slice(0, 3).map((item, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={item.product?.image_url || '/placeholder.png'}
                                                        className="h-8 w-8 rounded-full border-2 border-white object-cover bg-slate-100 shadow-sm"
                                                        title={item.product?.product}
                                                    />
                                                ))}
                                                {(order.order_items?.length || 0) > 3 && (
                                                    <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                        +{order.order_items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                                                {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                                            </p>
                                        </td>

                                        {/* Total */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-slate-900">
                                                {formatCurrency(order.total_amount)}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-600">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {order.status === 'Ready to Pickup' && (
                                                    <button
                                                        onClick={() => setConfirmModal({ open: true, id: order.id })}
                                                        disabled={processingId === order.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-60"
                                                    >
                                                        <Truck size={12} />
                                                        {processingId === order.id ? '...' : 'Received'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openDetails(order)}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <ShoppingBag size={32} className="text-slate-300" />
                                                </div>
                                                <h3 className="text-slate-900 font-bold mb-1">No orders found</h3>
                                                <p className="text-slate-500 text-xs mb-6 max-w-xs mx-auto">
                                                    {search ? `No matches for "${search}"` : 'Your orders will appear here.'}
                                                </p>
                                                <button
                                                    onClick={() => { setSearch(''); setStatusFilter('All'); }}
                                                    className="px-5 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                                                >
                                                    Clear Filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer */}
                    {processedOrders.length > 0 && (
                        <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                            <p className="text-[11px] font-bold text-slate-400">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, processedOrders.length)}–{Math.min(currentPage * itemsPerPage, processedOrders.length)} of {processedOrders.length} orders
                            </p>
                        </div>
                    )}
                </div>

                {/* ── 5. Pagination ── */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronDown className="rotate-90 w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, idx) =>
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition ${currentPage === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className="px-2 text-slate-400 font-bold">...</span>
                                )
                            )}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronDown className="-rotate-90 w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════ */}
            {/*  MODALS (all preserved from original implementation)  */}
            {/* ══════════════════════════════════════════════════════ */}

            {/* Order Details Modal */}
            {isDetailsOpen && viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase">Order Details</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                            REF: {viewingOrder.reference_no}
                                        </p>
                                        <StatusBadge status={viewingOrder.status} />
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                                {viewingOrder.order_items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                                        <img src={item.product?.image_url || '/placeholder.png'} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-white" />
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1">{item.product?.product}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                Qty: {item.quantity} × ₱{Number(item.price_at_sale).toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">₱{(item.quantity * item.price_at_sale).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Grand Total</span>
                                <span className="text-2xl font-black text-indigo-600">₱{Number(viewingOrder.total_amount).toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <button onClick={() => setIsDetailsOpen(false)} className="py-4 bg-slate-100 text-slate-600 font-black text-[10px] rounded-2xl uppercase hover:bg-slate-200 transition-all">
                                    Close
                                </button>
                                {viewingOrder.status === 'Product Received' && !viewingOrder.is_rated && (
                                    <button
                                        onClick={() => {
                                            setRatingData({ items: viewingOrder.order_items, orderId: viewingOrder.id, ratings: {} });
                                            setShowRatingModal(true);
                                            setIsDetailsOpen(false);
                                        }}
                                        className="py-4 bg-indigo-600 text-white font-black text-[10px] rounded-2xl uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                    >
                                        Rate Products
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <form onSubmit={submitRatings} className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900 uppercase">Rate Your Items</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Tell us what you think about our facility products.</p>
                        </div>

                        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                            {ratingData.items.map((item) => (
                                <div key={item.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={item.product?.image_url || '/placeholder.png'} className="w-8 h-8 rounded-lg object-cover" />
                                        <p className="text-xs font-black uppercase text-slate-700">{item.product?.product}</p>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map(star => {
                                            const isSelected = (ratingData.ratings[item.product_id] || 0) >= star;
                                            const isHovered = (hoveredStars[item.product_id] || 0) >= star;
                                            return (
                                                <label
                                                    key={star}
                                                    className="cursor-pointer transition-transform hover:scale-125"
                                                    onMouseEnter={() => setHoveredStars(p => ({ ...p, [item.product_id]: star }))}
                                                    onMouseLeave={() => setHoveredStars(p => ({ ...p, [item.product_id]: 0 }))}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`stars-${item.product_id}`}
                                                        value={star}
                                                        className="hidden"
                                                        onChange={() => setRatingData(p => ({ ...p, ratings: { ...p.ratings, [item.product_id]: star } }))}
                                                    />
                                                    <span className={`text-3xl transition-all duration-200 ${isSelected || isHovered ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] grayscale-0' : 'grayscale opacity-30'}`}>
                                                        ⭐
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <textarea
                                        name={`comment-${item.product_id}`}
                                        placeholder="Optional: How was the quality?"
                                        className="w-full text-xs font-medium rounded-2xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] p-4 bg-white shadow-inner"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button type="button" onClick={() => setShowRatingModal(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Not now
                            </button>
                            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-100 tracking-widest">
                                Submit Review
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✨</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase">Thank You!</h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Your review has been successfully submitted. We appreciate your feedback!</p>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-black transition-all">
                            Back to My Orders
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Received Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📦</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase">Received?</h3>
                        <p className="text-slate-500 text-sm mb-10 font-medium leading-relaxed">Confirming this means you have physically picked up your order from SRDI.</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={handleProductReceived} className="w-full py-4 bg-emerald-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all tracking-widest">
                                Yes, Received
                            </button>
                            <button onClick={() => setConfirmModal({ open: false, id: null })} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 tracking-widest transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}