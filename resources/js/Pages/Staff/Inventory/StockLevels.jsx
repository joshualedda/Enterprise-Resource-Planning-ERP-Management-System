import { useState, useMemo, useEffect } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Table, { Tr, Td } from '@/Components/Table';

const CATEGORY_COLOR = {
    'Raw Materials': 'from-lime-400 to-green-500',
    'Cocoons': 'from-amber-300 to-orange-400',
    'Silk Products': 'from-violet-400 to-purple-600',
    'By-Products': 'from-sky-400 to-blue-500',
    'Supplies': 'from-slate-400 to-slate-600',
};

function stockStatus(onHand) {
    if (onHand === 0) return { label: 'Out of Stock', cls: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (onHand < 10) return { label: 'Critical', cls: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (onHand < 50) return { label: 'Low Stock', cls: 'bg-amber-50 text-amber-600 border-amber-200' };
    return { label: 'Healthy', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
}

function StockBar({ onHand, max = 1000 }) {
    const pct = Math.min((onHand / max) * 100, 100);
    const color = onHand === 0 ? 'bg-rose-400' : onHand < 10 ? 'bg-rose-400' : onHand < 50 ? 'bg-amber-400' : 'bg-emerald-500';
    return (
        <div className="flex items-center gap-2 w-28">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-black text-slate-700 w-10 text-right tabular-nums">{onHand}</span>
        </div>
    );
}

function CategoryAvatar({ category }) {
    const gradient = CATEGORY_COLOR[category] ?? 'from-slate-300 to-slate-500';
    return (
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-[10px] shadow-sm flex-shrink-0`}>
            {category?.[0] ?? 'P'}
        </div>
    );
}

function KpiCard({ label, value, badge, badgeColor, iconPath, iconBg }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
            </div>
            <div>
                <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">{label}</p>
                <span className={`mt-2 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {badge}
                </span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────
export default function StockLevels({ stocks: serverStocks, stats, warehouses, categories, filters: serverFilters = {} }) {
    const isServer = serverStocks && serverStocks.data !== undefined;
    const rows = isServer ? serverStocks.data : [];

    const [search, setSearch] = useState(serverFilters.search ?? '');
    const [whFilter, setWh] = useState(serverFilters.warehouse ?? 'All');
    const [catFilter, setCat] = useState(serverFilters.category ?? 'All');
    const [statusFilter, setStatus] = useState('All');
    const [viewMode, setViewMode] = useState('table');

    useEffect(() => {
        if (!isServer) return;
        const timer = setTimeout(() => {
            router.get(route('staff.inventory.stock-levels.index'), {
                search,
                warehouse: whFilter === 'All' ? undefined : whFilter,
                category: catFilter === 'All' ? undefined : catFilter,
            }, { preserveState: true, replace: true });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, whFilter, catFilter]);

    const filtered = useMemo(() => {
        if (isServer) return rows;
        return [];
    }, [rows, isServer]);

    const kpis = [
        { label: 'Total SKUs', value: stats.total_sku, badge: 'Product lines', badgeColor: 'text-slate-500 bg-slate-50', iconBg: 'bg-slate-50 text-slate-500', iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { label: 'Total On Hand', value: stats.total_on_hand, badge: 'All warehouses', badgeColor: 'text-emerald-600 bg-emerald-50', iconBg: 'bg-emerald-50 text-emerald-600', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Total Reserved', value: stats.total_reserved, badge: 'eCommerce holds', badgeColor: 'text-blue-600 bg-blue-50', iconBg: 'bg-blue-50 text-blue-600', iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
        { label: 'Out of Stock', value: stats.out_of_stock, badge: 'Needs restock', badgeColor: 'text-rose-600 bg-rose-50', iconBg: 'bg-rose-50 text-rose-600', iconPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
        { label: 'Low Stock', value: stats.low_stock, badge: 'Below reorder', badgeColor: 'text-amber-600 bg-amber-50', iconBg: 'bg-amber-50 text-amber-600', iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { label: 'Warehouses', value: stats.warehouses, badge: 'Locations', badgeColor: 'text-violet-600 bg-violet-50', iconBg: 'bg-violet-50 text-violet-600', iconPath: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Stock Levels — Inventory" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Levels</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Current on-hand snapshot per warehouse, location, and batch.
                        </p>
                    </div>
                </div>

                {/* ── KPI CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* ── FILTER BAR ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">

                        {/* Search */}
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search product, warehouse, batch, location…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        <select value={whFilter} onChange={e => setWh(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition">
                            {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>

                        <select value={catFilter} onChange={e => setCat(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition">
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 flex-shrink-0">
                            {[
                                { mode: 'table', icon: 'M3 10h18M3 14h18M3 6h18M3 18h18' },
                                { mode: 'grid', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                            ].map(v => (
                                <button key={v.mode} onClick={() => setViewMode(v.mode)}
                                    className={`p-2 rounded-lg transition ${viewMode === v.mode ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={v.icon} />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <Table
                        badgeCount={isServer ? serverStocks.total : 0}
                        columns={['#', 'Product', 'Category', 'Warehouse', 'Location', 'Batch', 'Stock Bar', 'Status', 'Reserved']}
                        emptyState={
                            <div className="flex flex-col items-center gap-2 py-12">
                                <div className="text-4xl">📦</div>
                                <p className="text-sm font-black text-slate-300">No stock levels found</p>
                            </div>
                        }
                        footer={isServer && (
                            <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                                <p className="text-xs font-bold text-slate-400">
                                    Page {serverStocks.current_page} of {serverStocks.last_page} · {serverStocks.total} total
                                </p>
                                <Pagination
                                    currentPage={serverStocks.current_page}
                                    totalPages={serverStocks.last_page}
                                    onPageChange={(page) => {
                                        router.get(route(route().current()), {
                                            search,
                                            warehouse: whFilter === 'All' ? undefined : whFilter,
                                            category: catFilter === 'All' ? undefined : catFilter,
                                            page
                                        }, { preserveState: true, preserveScroll: true });
                                    }}
                                />
                            </div>
                        )}
                    >
                        {rows.map((r, i) => {
                            const onHand = Number(r.quantity_on_hand || 0);
                            const reserved = Number(r.quantity_reserved || 0);
                            const status = stockStatus(onHand);
                            return (
                                <Tr key={r.id}>
                                    <Td className="text-xs font-bold text-slate-300">{i + 1}</Td>
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <CategoryAvatar category={r.product?.category?.name} />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{r.product?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">ID #{r.id}</p>
                                            </div>
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                            {r.product?.category?.name || '—'}
                                        </span>
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            <span className="text-xs font-bold text-slate-600">{r.warehouse?.name || '—'}</span>
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="text-xs font-medium text-slate-400">{r.location || '—'}</span>
                                    </Td>
                                    <Td>
                                        {r.batch ? (
                                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">
                                                {r.batch.batch_code}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">—</span>
                                        )}
                                    </Td>
                                    <Td>
                                        <StockBar onHand={onHand} />
                                    </Td>
                                    <Td>
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${status.cls}`}>
                                            {status.label}
                                        </span>
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-xs font-black ${reserved > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                                {reserved}
                                            </span>
                                            {reserved > 0 && <span className="text-[9px] font-bold text-slate-400 uppercase">Reserved</span>}
                                        </div>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Table>
                )}

                {/* ── GRID VIEW ── */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rows.map(r => {
                            const onHand = Number(r.quantity_on_hand || 0);
                            const reserved = Number(r.quantity_reserved || 0);
                            const status = stockStatus(onHand);
                            return (
                                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden p-5 flex flex-col gap-4 relative">
                                    <div className="flex items-start justify-between">
                                        <CategoryAvatar category={r.product?.category?.name} />
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${status.cls}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 leading-tight">{r.product?.name || 'Unknown'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 capitalize">{r.warehouse?.name} · {r.location || 'No Location'}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">On Hand</p>
                                            <StockBar onHand={onHand} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Reserved</p>
                                            <span className={`text-xs font-black ${reserved > 0 ? 'text-blue-600' : 'text-slate-200'}`}>{reserved} units</span>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">
                                            {r.batch?.batch_code ? `Batch: ${r.batch.batch_code}` : 'No Batch'}
                                        </span>
                                        <p className="text-[9px] text-slate-300 font-bold">Updated {new Date(r.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </InventoryStaffLayout>
    );
}
