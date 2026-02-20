import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search,
    Filter,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingBag,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Truck
} from 'lucide-react';

// --- COMPONENTS ---

const StatusBadge = ({ status }) => {
    const styles = {
        'pending': 'bg-amber-50 text-amber-600 border-amber-100',
        'in process': 'bg-blue-50 text-blue-600 border-blue-100',
        'ready to pickup': 'bg-purple-50 text-purple-600 border-purple-100',
        'completed': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'cancelled': 'bg-rose-50 text-rose-600 border-rose-100',
    };
    const key = status?.toLowerCase() || 'pending';

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${styles[key] || styles.pending}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${styles[key]?.replace('bg-', 'bg-').replace('text-', 'bg-').replace('border-', '') || 'bg-slate-400'}`} />
            {status}
        </span>
    );
};

export default function Index({ auth, orders = [] }) {
    const { flash } = usePage().props;

    // State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Toast Notifications
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Computed Data
    const processedOrders = useMemo(() => {
        let result = orders.filter(order => {
            const matchesSearch =
                order.reference_no?.toLowerCase().includes(search.toLowerCase()) ||
                order.user?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                order.user?.last_name?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'customer') {
                    aValue = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`;
                    bValue = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [orders, search, statusFilter, sortConfig]);

    // Pagination Logic
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
    const paginatedOrders = processedOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Order Management" />
            <Toaster position="top-right" />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
                {/* 1. Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Manage customer orders and transactions.</p>
                    </div>
                </div>

                {/* 2. Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search reference or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-medium transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex items-center md:w-auto w-full">
                            <Filter size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full md:w-48 pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors appearance-none"
                            >
                                <option value="All">All Status</option>
                                <option value="In Process">In Process</option>
                                <option value="Ready to Pickup">Ready to Pickup</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Orders Table */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th onClick={() => handleSort('reference_no')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none group">
                                        <div className="flex items-center gap-1">Reference {sortConfig.key === 'reference_no' && (sortConfig.direction === 'asc' ? <ArrowUpRight size={12} className="text-indigo-500" /> : <ArrowDownRight size={12} className="text-indigo-500" />)}</div>
                                    </th>
                                    <th onClick={() => handleSort('customer')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none">
                                        <div className="flex items-center gap-1">Customer {sortConfig.key === 'customer' && (sortConfig.direction === 'asc' ? <ArrowUpRight size={12} className="text-indigo-500" /> : <ArrowDownRight size={12} className="text-indigo-500" />)}</div>
                                    </th>
                                    <th onClick={() => handleSort('total_amount')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none">
                                        <div className="flex items-center gap-1">Total {sortConfig.key === 'total_amount' && (sortConfig.direction === 'asc' ? <ArrowUpRight size={12} className="text-indigo-500" /> : <ArrowDownRight size={12} className="text-indigo-500" />)}</div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
                                    <th onClick={() => handleSort('created_at')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none">
                                        <div className="flex items-center gap-1">Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? <ArrowUpRight size={12} className="text-indigo-500" /> : <ArrowDownRight size={12} className="text-indigo-500" />)}</div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-[10px] uppercase font-black tracking-widest text-slate-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedOrders.length > 0 ? (
                                    paginatedOrders.map((order) => (
                                        <tr key={order.id} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-indigo-600 font-mono">#{order.reference_no}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Walk-in / Guest'}</p>
                                                    {order.user && <p className="text-xs text-slate-500">{order.user.email}</p>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-slate-900">{formatCurrency(order.total_amount)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-600">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={route('admin.orders.show', order.id)}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <ShoppingBag size={32} className="text-slate-300" />
                                                </div>
                                                <h3 className="text-slate-900 font-bold mb-1">No orders found</h3>
                                                <p className="text-slate-500 text-xs mb-6 max-w-xs mx-auto">
                                                    {search ? `No matches for "${search}"` : "Orders will appear here once customers make a purchase."}
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
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronDown className="rotate-90 w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition ${currentPage === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={index} className="px-2 text-slate-400 font-bold">...</span>
                                )
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronDown className="-rotate-90 w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
