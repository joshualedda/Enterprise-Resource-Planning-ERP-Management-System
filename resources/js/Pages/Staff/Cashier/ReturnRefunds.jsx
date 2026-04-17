import { useState, useMemo, useEffect, useRef } from 'react';
import CashierStaffLayout from '@/Layouts/CashierStaffLayout';
import { Head, router, Link } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function statusBadge(status) {
    switch (status?.toLowerCase()) {
        case 'completed':
        case 'product received': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
        case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'in process': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'ready to pickup': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'on delivery': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
export default function ReturnRefunds({ transactions, filters = {}, statuses = [], flash = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatus] = useState(filters.status ?? 'All');
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
            router.get(route('staff.cashier.pos.return-refund'), {
                search: search || undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, statusFilter]);

    const handleProcess = (id) => {
        if (confirm('Initiate return/refund process for this transaction?')) {
            router.post(route('staff.cashier.pos.return-refund.process', id));
        }
    };

    return (
        <CashierStaffLayout>
            <Head title="Returns & Refunds — POS" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500 pb-12">
                {/* PAGE HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Returns & Refunds</h1>
                        <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">
                            Manage order reversals, product returns, and money-back processing.
                        </p>
                    </div>
                </div>

                {/* FILTERS SECTION */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Search Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                                Search Reference/Customer
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="POS-0000, Customer Name..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition appearance-none cursor-pointer"
                            >
                                <option value="All">All Transactions</option>
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* TABLE VIEW */}
                <Table
                    title="🔄 Refund Activity"
                    subtitle="Track and manage transaction reversals"
                    badgeCount={transactions.total}
                    columns={['Reference', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2 py-20 text-center">
                            <div className="text-6xl mb-4 opacity-20 bubble-animate">🔄</div>
                            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">No returns or refunds found</h3>
                            <button onClick={() => { setSearch(''); setStatus('All'); }} className="text-xs font-bold text-emerald-500 hover:underline mt-2">Clear filters</button>
                        </div>
                    }
                    footer={
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                                Total: {transactions.total} Transactions
                            </p>
                            <Pagination
                                currentPage={transactions.current_page}
                                totalPages={transactions.last_page}
                                onPageChange={(page) => {
                                    router.get(route('staff.cashier.pos.return-refund'), { search, status: statusFilter, page }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    }
                >
                    {transactions.data.map((tx) => (
                        <Tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                            <Td className="text-xs font-black text-emerald-600 font-mono">
                                #{tx.reference_no}
                            </Td>
                            <Td>
                                <div className="flex flex-col">
                                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                                        {tx.user ? `${tx.user.first_name} ${tx.user.last_name}` : 'Walk-in Customer'}
                                    </p>
                                    <span className="text-[10px] text-slate-400 font-bold lowercase italic">{tx.user?.email || 'N/A'}</span>
                                </div>
                            </Td>
                            <Td className="text-xs font-bold text-slate-500">
                                {tx.order_items?.length || 0} Item(s)
                            </Td>
                            <Td className="text-sm font-black text-slate-900">
                                {formatCurrency(tx.total_amount)}
                            </Td>
                            <Td>
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusBadge(tx.status)}`}>
                                    {tx.status}
                                </span>
                            </Td>
                            <Td className="text-[10px] text-slate-400 font-bold">
                                {new Date(tx.created_at).toLocaleDateString()}
                            </Td>
                            <Td>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleProcess(tx.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all shadow-sm ${tx.status === 'Cancelled' || tx.status === 'Product Received'
                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                                                : 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                                            }`}
                                        disabled={!(tx.status === 'Cancelled' || tx.status === 'Product Received')}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 8V5a2 2 0 00-2-2H6a2 2 0 00-2 2v15a2 2 0 002 2h12a2 2 0 002-2z" />
                                        </svg>
                                        Process
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
