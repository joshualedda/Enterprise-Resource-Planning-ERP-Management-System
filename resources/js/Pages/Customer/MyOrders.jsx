import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
    Search, Filter, ShoppingBag, CheckCircle, Clock, Truck,
    RefreshCw, ArrowUpRight, ArrowDownRight, ChevronDown, Eye, Package, History,
} from 'lucide-react';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0);

const statusConfig = {
    'In Process':       { classes: 'bg-blue-50 text-blue-600 border-blue-100',                        dot: 'bg-blue-500' },
    'Ready to Pickup':  { classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse', dot: 'bg-emerald-500' },
    'Product Received': { classes: 'bg-slate-100 text-slate-600 border-slate-200',                    dot: 'bg-slate-400' },
    'Cancelled':        { classes: 'bg-rose-50 text-rose-600 border-rose-100',                        dot: 'bg-rose-400' },
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

// ── Reusable Pagination Component ────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
        [1,2,3,4,'...',totalPages].forEach(p => pages.push(p));
    } else if (currentPage >= totalPages - 2) {
        [1,'...',totalPages-3,totalPages-2,totalPages-1,totalPages].forEach(p => pages.push(p));
    } else {
        [1,'...',currentPage-1,currentPage,currentPage+1,'...',totalPages].forEach(p => pages.push(p));
    }

    return (
        <div className="flex justify-center items-center gap-2 py-2">
            <button onClick={() => onPageChange(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronDown className="rotate-90 w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
                {pages.map((page, idx) =>
                    typeof page === 'number' ? (
                        <button key={idx} onClick={() => onPageChange(() => page)}
                            className={`w-9 h-9 rounded-lg text-xs font-bold transition ${currentPage === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}>
                            {page}
                        </button>
                    ) : (
                        <span key={idx} className="px-1 text-slate-400 font-bold text-xs">...</span>
                    )
                )}
            </div>
            <button onClick={() => onPageChange(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronDown className="-rotate-90 w-4 h-4" />
            </button>
        </div>
    );
}

// ── Active Orders Table ───────────────────────────────────────────────────────
function ActiveOrdersTable({ orders, processingId, onViewDetails, onMarkReceived }) {
    const [search,      setSearch]      = useState('');
    const [statusFilter,setStatusFilter]= useState('All');
    const [sortConfig,  setSortConfig]  = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const PER_PAGE = 6;

    useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

    const processed = useMemo(() => {
        let r = orders.filter(o => {
            const q = search.toLowerCase();
            return (!q || o.reference_no?.toLowerCase().includes(q))
                && (statusFilter === 'All' || o.status === statusFilter);
        });
        r.sort((a, b) => {
            const av = a[sortConfig.key], bv = b[sortConfig.key];
            if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
            if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        // Float Ready to Pickup
        r.sort((a, b) => (a.status === 'Ready to Pickup' ? -1 : b.status === 'Ready to Pickup' ? 1 : 0));
        return r;
    }, [orders, search, statusFilter, sortConfig]);

    const totalPages = Math.ceil(processed.length / PER_PAGE);
    const paginated  = processed.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    const handleSort = (key) =>
        setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));

    const SortIcon = ({ col }) => sortConfig.key === col
        ? sortConfig.direction === 'asc'
            ? <ArrowUpRight size={11} className="text-indigo-500" />
            : <ArrowDownRight size={11} className="text-indigo-500" />
        : null;

    return (
        <div>
            {/* Table Controls */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-xl"><RefreshCw size={16} className="text-blue-600" /></div>
                    <div>
                        <p className="font-black text-slate-800 text-sm">Active Orders</p>
                        <p className="text-[10px] text-slate-400 font-bold">{orders.length} order{orders.length !== 1 ? 's' : ''} in progress</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-52">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search ref no..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-xs font-medium transition-all" />
                    </div>
                    <div className="relative">
                        <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="pl-7 pr-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer">
                            <option value="All">All</option>
                            <option value="In Process">In Process</option>
                            <option value="Ready to Pickup">Ready to Pickup</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/60 border-b border-slate-100">
                            {[
                                { label: 'Reference', col: 'reference_no', sortable: true },
                                { label: 'Items',     col: null,           sortable: false },
                                { label: 'Total',     col: 'total_amount', sortable: true },
                                { label: 'Status',    col: null,           sortable: false },
                                { label: 'Date',      col: 'created_at',   sortable: true },
                                { label: 'Actions',   col: null,           sortable: false, right: true },
                            ].map(({ label, col, sortable, right }) => (
                                <th key={label} onClick={sortable ? () => handleSort(col) : undefined}
                                    className={`px-5 py-3.5 text-[10px] uppercase font-black tracking-widest text-slate-400 ${sortable ? 'cursor-pointer hover:text-indigo-600 select-none' : ''} ${right ? 'text-right' : ''}`}>
                                    <div className={`flex items-center gap-1 ${right ? 'justify-end' : ''}`}>
                                        {label} {sortable && <SortIcon col={col} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginated.length > 0 ? paginated.map(order => (
                            <tr key={order.id} className={`hover:bg-slate-50/80 transition-colors ${order.status === 'Ready to Pickup' ? 'bg-emerald-50/40' : ''}`}>
                                <td className="px-5 py-3.5">
                                    <span className="text-xs font-bold text-indigo-600 font-mono">#{order.reference_no}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex -space-x-2">
                                        {order.order_items?.slice(0, 3).map((item, idx) => (
                                            <img key={idx} src={item.product?.image_url || '/placeholder.png'}
                                                className="h-7 w-7 rounded-full border-2 border-white object-cover bg-slate-100 shadow-sm" title={item.product?.product} />
                                        ))}
                                        {(order.order_items?.length || 0) > 3 && (
                                            <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500">
                                                +{order.order_items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                        {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                                    </p>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="text-xs font-black text-slate-900">{formatCurrency(order.total_amount)}</span>
                                </td>
                                <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                                <td className="px-5 py-3.5">
                                    <span className="text-[11px] font-bold text-slate-500">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {order.status === 'Ready to Pickup' && (
                                            <button onClick={() => onMarkReceived(order.id)} disabled={processingId === order.id}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-60">
                                                <Truck size={11} />
                                                {processingId === order.id ? '...' : 'Received'}
                                            </button>
                                        )}
                                        <button onClick={() => onViewDetails(order)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                            <Eye size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="py-16 text-center">
                                    <ShoppingBag size={28} className="text-slate-200 mx-auto mb-2" />
                                    <p className="text-slate-400 text-xs font-bold">No active orders found</p>
                                    {search && <button onClick={() => setSearch('')} className="mt-2 text-[11px] text-indigo-500 font-bold hover:underline">Clear search</button>}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {processed.length > 0 && (
                <div className="px-5 py-2 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400">
                        {Math.min((currentPage-1)*PER_PAGE+1, processed.length)}–{Math.min(currentPage*PER_PAGE, processed.length)} of {processed.length}
                    </p>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
}

// ── Order History Table (Product Received) ────────────────────────────────────
function OrderHistoryTable({ orders, onViewDetails }) {
    const [search,      setSearch]      = useState('');
    const [sortConfig,  setSortConfig]  = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const PER_PAGE = 5;

    useEffect(() => { setCurrentPage(1); }, [search]);

    const processed = useMemo(() => {
        let r = orders.filter(o => !search || o.reference_no?.toLowerCase().includes(search.toLowerCase()));
        r.sort((a, b) => {
            const av = a[sortConfig.key], bv = b[sortConfig.key];
            if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
            if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return r;
    }, [orders, search, sortConfig]);

    const totalPages = Math.ceil(processed.length / PER_PAGE);
    const paginated  = processed.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    const handleSort = (key) =>
        setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));

    const SortIcon = ({ col }) => sortConfig.key === col
        ? sortConfig.direction === 'asc'
            ? <ArrowUpRight size={11} className="text-emerald-500" />
            : <ArrowDownRight size={11} className="text-emerald-500" />
        : null;

    return (
        <div>
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-xl"><History size={16} className="text-emerald-600" /></div>
                    <div>
                        <p className="font-black text-slate-800 text-sm">Order History</p>
                        <p className="text-[10px] text-slate-400 font-bold">{orders.length} completed order{orders.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="relative w-full sm:w-52">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search ref no..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 rounded-xl text-xs font-medium transition-all" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/60 border-b border-slate-100">
                            {[
                                { label: 'Reference', col: 'reference_no', sortable: true },
                                { label: 'Items',     col: null,           sortable: false },
                                { label: 'Total',     col: 'total_amount', sortable: true },
                                { label: 'Type',      col: 'order_type',   sortable: false },
                                { label: 'Received',  col: 'updated_at',   sortable: true },
                                { label: '',          col: null,           sortable: false, right: true },
                            ].map(({ label, col, sortable, right }) => (
                                <th key={label} onClick={sortable ? () => handleSort(col) : undefined}
                                    className={`px-5 py-3.5 text-[10px] uppercase font-black tracking-widest text-slate-400 ${sortable ? 'cursor-pointer hover:text-emerald-600 select-none' : ''} ${right ? 'text-right' : ''}`}>
                                    <div className={`flex items-center gap-1 ${right ? 'justify-end' : ''}`}>
                                        {label} {sortable && <SortIcon col={col} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginated.length > 0 ? paginated.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/60 transition-colors group">
                                <td className="px-5 py-3.5">
                                    <span className="text-xs font-bold text-slate-600 font-mono">#{order.reference_no}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex -space-x-2">
                                        {order.order_items?.slice(0, 3).map((item, idx) => (
                                            <img key={idx} src={item.product?.image_url || '/placeholder.png'}
                                                className="h-7 w-7 rounded-full border-2 border-white object-cover bg-slate-100 shadow-sm grayscale group-hover:grayscale-0 transition-all" />
                                        ))}
                                        {(order.order_items?.length || 0) > 3 && (
                                            <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400">
                                                +{order.order_items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                        {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                                    </p>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="text-xs font-black text-slate-700">{formatCurrency(order.total_amount)}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${order.order_type === 'delivery' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {order.order_type === 'delivery' ? <Truck size={10} /> : <Package size={10} />}
                                        {order.order_type}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="text-[11px] font-bold text-slate-500">
                                        {new Date(order.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    <button onClick={() => onViewDetails(order)}
                                        className="p-1.5 rounded-lg text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-100 transition-all">
                                        <Eye size={15} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="py-12 text-center">
                                    <CheckCircle size={24} className="text-slate-200 mx-auto mb-2" />
                                    <p className="text-slate-400 text-xs font-bold">No completed orders yet</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {processed.length > 0 && (
                <div className="px-5 py-2 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400">
                        {Math.min((currentPage-1)*PER_PAGE+1, processed.length)}–{Math.min(currentPage*PER_PAGE, processed.length)} of {processed.length}
                    </p>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MyOrders({ auth, orders }) {
    const [processingId,     setProcessingId]     = useState(null);
    const [isDetailsOpen,    setIsDetailsOpen]    = useState(false);
    const [viewingOrder,     setViewingOrder]     = useState(null);
    const [confirmModal,     setConfirmModal]     = useState({ open: false, id: null });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRatingModal,  setShowRatingModal]  = useState(false);
    const [ratingData,       setRatingData]       = useState({ items: [], orderId: null, ratings: {} });
    const [hoveredStars,     setHoveredStars]     = useState({});
    const [receiptUrls,      setReceiptUrls]      = useState({});
    const [loadingReceipt,   setLoadingReceipt]   = useState(null);
    const [activeTab,        setActiveTab]        = useState('active');

    const allOrders     = orders?.data || [];
    const activeOrders  = useMemo(() => allOrders.filter(o => o.status !== 'Product Received'), [allOrders]);
    const historyOrders = useMemo(() => allOrders.filter(o => o.status === 'Product Received'), [allOrders]);

    const stats = useMemo(() => ({
        total:    allOrders.length,
        active:   activeOrders.filter(o => o.status !== 'Cancelled').length,
        received: historyOrders.length,
        spend:    historyOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
    }), [allOrders, activeOrders, historyOrders]);

    const handleProductReceived = async () => {
        const transactionId = confirmModal.id;
        const currentOrder  = allOrders.find(o => o.id === transactionId);
        setProcessingId(transactionId);
        setConfirmModal({ open: false, id: null });
        try {
            await axios.patch(route('customer.orders.received', transactionId), { status: 'Product Received' });
            setRatingData({ items: currentOrder.order_items, orderId: transactionId, ratings: {} });
            setShowRatingModal(true);
            router.reload({ preserveScroll: true });
        } catch {
            alert('Update failed. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const fetchReceipt = async (orderId) => {
        if (receiptUrls[orderId] !== undefined) return;
        setLoadingReceipt(orderId);
        try {
            const res = await axios.get(route('customer.orders.receipt', orderId));
            setReceiptUrls(prev => ({ ...prev, [orderId]: res.data.url }));
        } catch {
            setReceiptUrls(prev => ({ ...prev, [orderId]: null }));
        } finally {
            setLoadingReceipt(null);
        }
    };

    const submitRatings = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const ratings  = ratingData.items.map(item => ({
            product_id: item.product_id,
            stars:      ratingData.ratings[item.product_id] || 5,
            comment:    formData.get(`comment-${item.product_id}`),
        }));
        try {
            await axios.post(route('customer.ratings.bulk'), { ratings, order_id: ratingData.orderId });
            setShowRatingModal(false);
            setShowSuccessModal(true);
            router.reload({ preserveScroll: true });
        } catch {
            alert('Could not submit ratings.');
        }
    };

    const openDetails = (order) => {
        setViewingOrder(order);
        setIsDetailsOpen(true);
        if (order.payment_method === 'Bank' && receiptUrls[order.id] === undefined) {
            fetchReceipt(order.id);
        }
    };

    return (
        <AuthenticatedLayout header="My Orders">
            <Head title="My Orders" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Orders</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Track your facility pickups and purchase history.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Orders',    value: stats.total,                 icon: ShoppingBag, color: 'bg-indigo-500' },
                        { label: 'Active Orders',   value: stats.active,                icon: RefreshCw,   color: 'bg-blue-500' },
                        { label: 'Orders Received', value: stats.received,              icon: CheckCircle, color: 'bg-emerald-500' },
                        { label: 'Total Spent',     value: formatCurrency(stats.spend), icon: Package,     color: 'bg-amber-500' },
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

                {/* Tabbed Orders Table */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    {/* Tab Bar */}
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`relative flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
                                activeTab === 'active'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px bg-indigo-50/30'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <RefreshCw size={13} />
                            Not Done
                            {activeOrders.filter(o => o.status !== 'Cancelled').length > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'active' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {activeOrders.filter(o => o.status !== 'Cancelled').length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`relative flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
                                activeTab === 'history'
                                    ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-px bg-emerald-50/30'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <History size={13} />
                            Product Received
                            {historyOrders.length > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'history' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {historyOrders.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'active' ? (
                        <ActiveOrdersTable
                            orders={activeOrders}
                            processingId={processingId}
                            onViewDetails={openDetails}
                            onMarkReceived={(id) => setConfirmModal({ open: true, id })}
                        />
                    ) : (
                        <OrderHistoryTable
                            orders={historyOrders}
                            onViewDetails={openDetails}
                        />
                    )}
                </div>
            </div>

            {/* ── Order Details Modal ─────────────────────────────────────── */}
            {isDetailsOpen && viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase">Order Details</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">REF: {viewingOrder.reference_no}</p>
                                        <StatusBadge status={viewingOrder.status} />
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-2">
                                {viewingOrder.order_items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                                        <img src={item.product?.image_url || '/placeholder.png'} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-white" />
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1">{item.product?.product}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                Qty: {item.quantity} × {formatCurrency(item.price_at_sale)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{formatCurrency(item.quantity * item.price_at_sale)}</p>
                                    </div>
                                ))}
                            </div>

                            {viewingOrder.payment_method === 'Bank' && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Payment Receipt</p>
                                    {loadingReceipt === viewingOrder.id && <p className="text-xs text-slate-400">Loading receipt...</p>}
                                    {receiptUrls[viewingOrder.id] && (
                                        <img src={receiptUrls[viewingOrder.id]} alt="Receipt" className="w-full rounded-xl border border-blue-100 max-h-48 object-contain bg-white" />
                                    )}
                                    {receiptUrls[viewingOrder.id] === null && <p className="text-xs text-slate-400">No receipt found.</p>}
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Grand Total</span>
                                <span className="text-2xl font-black text-indigo-600">{formatCurrency(viewingOrder.total_amount)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button onClick={() => setIsDetailsOpen(false)} className="py-4 bg-slate-100 text-slate-600 font-black text-[10px] rounded-2xl uppercase hover:bg-slate-200 transition-all">Close</button>
                                {viewingOrder.status === 'Product Received' && !viewingOrder.is_rated && (
                                    <button onClick={() => { setRatingData({ items: viewingOrder.order_items, orderId: viewingOrder.id, ratings: {} }); setShowRatingModal(true); setIsDetailsOpen(false); }}
                                        className="py-4 bg-indigo-600 text-white font-black text-[10px] rounded-2xl uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                                        Rate Products
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Rating Modal ─────────────────────────────────────────────── */}
            {showRatingModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <form onSubmit={submitRatings} className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900 uppercase">Rate Your Items</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Tell us what you think about our products.</p>
                        </div>
                        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                            {ratingData.items.map((item) => (
                                <div key={item.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={item.product?.image_url || '/placeholder.png'} className="w-8 h-8 rounded-lg object-cover" />
                                        <p className="text-xs font-black uppercase text-slate-700">{item.product?.product}</p>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        {[1,2,3,4,5].map(star => {
                                            const isSelected = (ratingData.ratings[item.product_id] || 0) >= star;
                                            const isHovered  = (hoveredStars[item.product_id] || 0) >= star;
                                            return (
                                                <label key={star} className="cursor-pointer transition-transform hover:scale-125"
                                                    onMouseEnter={() => setHoveredStars(p => ({ ...p, [item.product_id]: star }))}
                                                    onMouseLeave={() => setHoveredStars(p => ({ ...p, [item.product_id]: 0 }))}>
                                                    <input type="radio" name={`stars-${item.product_id}`} value={star} className="hidden"
                                                        onChange={() => setRatingData(p => ({ ...p, ratings: { ...p.ratings, [item.product_id]: star } }))} />
                                                    <span className={`text-3xl transition-all duration-200 ${isSelected || isHovered ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] grayscale-0' : 'grayscale opacity-30'}`}>⭐</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <textarea name={`comment-${item.product_id}`} placeholder="Optional: How was the quality?"
                                        className="w-full text-xs font-medium rounded-2xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] p-4 bg-white shadow-inner" />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button type="button" onClick={() => setShowRatingModal(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Not now</button>
                            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-100 tracking-widest">Submit Review</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Success Modal ─────────────────────────────────────────────── */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✨</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase">Thank You!</h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Your review has been submitted. We appreciate your feedback!</p>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-black transition-all">Back to My Orders</button>
                    </div>
                </div>
            )}

            {/* ── Confirm Received Modal ────────────────────────────────────── */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📦</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase">Received?</h3>
                        <p className="text-slate-500 text-sm mb-10 font-medium leading-relaxed">Confirming this means you have physically picked up your order from SRDI.</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={handleProductReceived} className="w-full py-4 bg-emerald-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all tracking-widest">Yes, Received</button>
                            <button onClick={() => setConfirmModal({ open: false, id: null })} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 tracking-widest transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}