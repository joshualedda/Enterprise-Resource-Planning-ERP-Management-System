import { useState, useEffect, useRef } from 'react';
import CashierStaffLayout from '@/Layouts/CashierStaffLayout';
import { Head, router, Link } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
export default function HeldOrders({ heldOrders, filters = {}, orderTypes = [], flash = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [orderType, setOrderType] = useState(filters.order_type ?? 'All');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Auto-filter logic
    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(route('staff.cashier.pos.held-orders'), {
                search: search || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                order_type: orderType !== 'All' ? orderType : undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, dateFrom, dateTo, orderType]);

    const handleResume = (id) => {
        if (confirm('Resume this order? This will prepare it in the POS system.')) {
            router.post(route('staff.cashier.pos.held-orders.resume', id));
        }
    };

    const handleCancel = (id) => {
        if (confirm('Are you sure you want to cancel this held order?')) {
            router.delete(route('staff.cashier.pos.held-orders.cancel', id));
        }
    };

    return (
        <CashierStaffLayout>
            <Head title="Held Orders — POS" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500 pb-12">
                {/* PAGE HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Held Orders</h1>
                        <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">
                            Suspended transactions waiting for checkout.
                        </p>
                    </div>
                    <Link
                        href="#"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        New Transaction
                    </Link>
                </div>

                {/* ADVANCED FILTERS SECTION */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Search Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                                Search Reference/User
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                                />
                            </div>
                        </div>

                        {/* Order Type Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                                Order Type
                            </label>
                            <select
                                value={orderType}
                                onChange={e => setOrderType(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition appearance-none cursor-pointer"
                            >
                                <option value="All">All Types</option>
                                {orderTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Date From */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition"
                            />
                        </div>

                        {/* Date To */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition"
                            />
                        </div>
                    </div>

                    {(search || dateFrom || dateTo || orderType !== 'All') && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setOrderType('All'); }}
                                className="text-xs font-black text-rose-500 uppercase tracking-widest hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* TABLE VIEW */}
                <Table
                    title="🕒 Suspended Orders"
                    subtitle="Orders put on hold during processing"
                    badgeCount={heldOrders.total}
                    columns={['Reference', 'Customer', 'Items Count', 'Total Amount', 'Held Since', 'Actions']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2 py-20 text-center">
                            <div className="text-6xl mb-4 opacity-20 bubble-animate">🕒</div>
                            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">No orders currently on hold</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Keep the line moving! Suspended orders will appear here.</p>
                        </div>
                    }
                    footer={
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                                {heldOrders.total} Order(s) Suspended
                            </p>
                            <Pagination
                                currentPage={heldOrders.current_page}
                                totalPages={heldOrders.last_page}
                                onPageChange={(page) => {
                                    router.get(route('staff.cashier.pos.held-orders'), { search, page }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    }
                >
                    {heldOrders.data.map((order) => (
                        <Tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                            <Td className="text-xs font-black text-emerald-600 font-mono tracking-tighter">
                                #{order.reference_no}
                            </Td>
                            <Td>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 uppercase">
                                        {order.user?.first_name?.[0] || 'W'}{order.user?.last_name?.[0] || 'I'}
                                    </div>
                                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                                        {order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Walk-in Customer'}
                                    </p>
                                </div>
                            </Td>
                            <Td className="text-xs font-bold text-slate-500">
                                {order.order_items?.length || 0} Item(s)
                            </Td>
                            <Td className="text-sm font-black text-slate-900">
                                {formatCurrency(order.total_amount)}
                            </Td>
                            <Td className="text-[10px] text-slate-400 font-bold capitalize">
                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <span className="block opacity-60 italic text-[9px] font-medium leading-none mt-0.5">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleResume(order.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Resume
                                    </button>
                                    <button
                                        onClick={() => handleCancel(order.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Cancel Order"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>
            </div>
        </CashierStaffLayout>
    );
}
