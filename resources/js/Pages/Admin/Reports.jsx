import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import pickBy from 'lodash/pickBy';
import {
    Search,
    Calendar,
    Download,
    FileSpreadsheet,
    FileText,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';

export default function Reports({ auth, orders, filters }) {
    const [values, setValues] = useState({
        search: filters.search || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    // Function to trigger filter/search
    useEffect(() => {
        const query = pickBy(values);
        router.get(route('admin.reports'), query, {
            preserveState: true,
            replace: true,
        });
    }, [values.search, values.start_date, values.end_date]);

    const handleChange = (e) => {
        setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePDF = () => {
        window.open(route('admin.reports.pdf', pickBy(values)), '_blank');
    };

    const handleExcel = () => {
        window.location.href = route('admin.reports.excel', pickBy(values));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reports" />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

                {/* 1. Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Reports</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Generate and export sales data and transaction histories.</p>
                    </div>
                </div>

                {/* 2. Filters & Actions Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">

                    {/* Search & Date Filters */}
                    <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                        {/* Search */}
                        <div className="relative w-full md:w-64 group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                name="search"
                                value={values.search}
                                onChange={handleChange}
                                placeholder="Search ref or product..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-medium transition-all"
                            />
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-40 group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Calendar size={16} />
                                </div>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={values.start_date}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs font-bold text-slate-600 transition-all uppercase"
                                />
                            </div>
                            <span className="text-slate-300 font-bold">-</span>
                            <div className="relative w-full md:w-40 group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Calendar size={16} />
                                </div>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={values.end_date}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs font-bold text-slate-600 transition-all uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-3 w-full xl:w-auto">
                        <button
                            onClick={handlePDF}
                            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            <FileText size={16} />
                            Export PDF
                        </button>
                        <button
                            onClick={handleExcel}
                            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            <FileSpreadsheet size={16} />
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* 3. Table Section */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Ref No</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Product</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Qty</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Price</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Total</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {orders.data && orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-indigo-600 font-mono">#{order.transaction?.reference_no}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-700">{order.product?.product || 'Unknown Product'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-600">{order.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-600">{formatCurrency(order.price_at_sale)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-slate-900">{formatCurrency(order.price_at_sale * order.quantity)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-500">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <Search size={32} className="text-slate-300" />
                                                </div>
                                                <h3 className="text-slate-900 font-bold mb-1">No results found</h3>
                                                <p className="text-slate-500 text-xs mb-6 max-w-xs mx-auto">
                                                    Try adjusting your search or date filters.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        {orders.links.map((link, i) => {
                            // Render specialized buttons for Previous/Next if desired, or just generic
                            const isPrev = link.label.includes('&laquo;');
                            const isNext = link.label.includes('&raquo;');
                            const label = link.label.replace('&laquo; Previous', '').replace('Next &raquo;', '');

                            if (!link.url && !link.active) return null; // Hide disabled empty links if preferred, or render as disabled

                            return (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`
                                        min-w-[40px] h-10 flex items-center justify-center px-3 rounded-lg text-sm font-bold transition-all
                                        ${link.active
                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                                            : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                        }
                                        ${!link.url ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}
                                    `}
                                >
                                    {isPrev ? <ChevronLeft size={20} /> : isNext ? <ChevronRight size={20} /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}