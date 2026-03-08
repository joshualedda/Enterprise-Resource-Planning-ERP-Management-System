import { useState, useMemo } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────
// DUMMY DATA  (based on product_stocks schema)
// ─────────────────────────────────────────────────────────
const DUMMY_STOCKS = [
    // id | product | warehouse | location | batch | qty_on_hand | qty_reserved | updated_at
    { id: 1,  product: 'Mulberry Leaves (Fresh)',  category: 'Raw Materials',  warehouse: 'WH-01 Main',        location: 'Rack A-01', batch: 'BCH-2026-001', qty_on_hand: 340.00, qty_reserved: 20.00,  updated_at: '2026-03-06 08:12' },
    { id: 2,  product: 'Mulberry Leaves (Dried)',  category: 'Raw Materials',  warehouse: 'WH-02 Cold',        location: 'Rack B-03', batch: 'BCH-2026-002', qty_on_hand: 120.00, qty_reserved: 0.00,   updated_at: '2026-03-06 09:00' },
    { id: 3,  product: 'Silkworm Eggs (Boxed)',    category: 'Raw Materials',  warehouse: 'WH-02 Cold',        location: 'Shelf C-01',batch: 'BCH-2026-003', qty_on_hand: 8.00,   qty_reserved: 2.00,   updated_at: '2026-03-05 14:30' },
    { id: 4,  product: 'Fresh Cocoons (Grade A)',  category: 'Cocoons',        warehouse: 'WH-01 Main',        location: 'Rack A-02', batch: 'BCH-2026-004', qty_on_hand: 820.00, qty_reserved: 50.00,  updated_at: '2026-03-07 07:45' },
    { id: 5,  product: 'Fresh Cocoons (Grade B)',  category: 'Cocoons',        warehouse: 'WH-01 Main',        location: 'Rack A-03', batch: 'BCH-2026-005', qty_on_hand: 410.00, qty_reserved: 30.00,  updated_at: '2026-03-07 07:45' },
    { id: 6,  product: 'Dried Cocoons',            category: 'Cocoons',        warehouse: 'WH-03 Fin. Goods',  location: 'Shelf D-02',batch: 'BCH-2026-006', qty_on_hand: 230.00, qty_reserved: 0.00,   updated_at: '2026-03-05 10:00' },
    { id: 7,  product: 'Raw Silk Thread (Reeled)', category: 'Silk Products',  warehouse: 'WH-03 Fin. Goods',  location: 'Shelf D-01',batch: 'BCH-2026-007', qty_on_hand: 42.00,  qty_reserved: 5.00,   updated_at: '2026-03-06 11:00' },
    { id: 8,  product: 'Silk Yarn Grade A',        category: 'Silk Products',  warehouse: 'WH-03 Fin. Goods',  location: 'Shelf D-03',batch: 'BCH-2026-008', qty_on_hand: 156.00, qty_reserved: 10.00,  updated_at: '2026-03-07 08:00' },
    { id: 9,  product: 'Silk Yarn Grade B',        category: 'Silk Products',  warehouse: 'WH-03 Fin. Goods',  location: 'Shelf D-04',batch: 'BCH-2026-009', qty_on_hand: 88.00,  qty_reserved: 0.00,   updated_at: '2026-03-06 13:30' },
    { id: 10, product: 'Degummed Silk',            category: 'Silk Products',  warehouse: 'WH-03 Fin. Goods',  location: 'Shelf E-01',batch: 'BCH-2026-010', qty_on_hand: 20.00,  qty_reserved: 0.00,   updated_at: '2026-03-05 16:00' },
    { id: 11, product: 'Silk Waste (Floss)',       category: 'By-Products',    warehouse: 'WH-01 Main',        location: 'Rack B-01', batch: 'BCH-2026-011', qty_on_hand: 600.00, qty_reserved: 0.00,   updated_at: '2026-03-06 09:30' },
    { id: 12, product: 'Pupae (Dried)',            category: 'By-Products',    warehouse: 'WH-01 Main',        location: 'Rack B-02', batch: 'BCH-2026-012', qty_on_hand: 0.00,   qty_reserved: 0.00,   updated_at: '2026-03-04 12:00' },
    { id: 13, product: 'Silk Cocoon Powder',       category: 'By-Products',    warehouse: 'WH-02 Cold',        location: 'Shelf C-02',batch: 'BCH-2026-013', qty_on_hand: 55.00,  qty_reserved: 5.00,   updated_at: '2026-03-05 10:45' },
    { id: 14, product: 'Silk Wax',                 category: 'Supplies',       warehouse: 'WH-01 Main',        location: 'Rack A-04', batch: null,            qty_on_hand: 90.00,  qty_reserved: 0.00,   updated_at: '2026-03-03 08:00' },
    { id: 15, product: 'Reeling Machine Oil',      category: 'Supplies',       warehouse: 'WH-01 Main',        location: 'Rack A-05', batch: null,            qty_on_hand: 34.00,  qty_reserved: 0.00,   updated_at: '2026-03-03 08:00' },
];

const DUMMY_STATS = {
    total_sku:    15,
    total_on_hand: 3013,
    total_reserved: 122,
    out_of_stock:   1,
    low_stock:      3,
    warehouses:     3,
};

const WAREHOUSES  = ['All', 'WH-01 Main', 'WH-02 Cold', 'WH-03 Fin. Goods'];
const CATEGORIES  = ['All', 'Raw Materials', 'Cocoons', 'Silk Products', 'By-Products', 'Supplies'];

const CATEGORY_COLOR = {
    'Raw Materials': 'from-lime-400 to-green-500',
    'Cocoons':       'from-amber-300 to-orange-400',
    'Silk Products': 'from-violet-400 to-purple-600',
    'By-Products':   'from-sky-400 to-blue-500',
    'Supplies':      'from-slate-400 to-slate-600',
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function stockStatus(onHand) {
    if (onHand === 0)  return { label: 'Out of Stock', cls: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (onHand < 10)   return { label: 'Critical',     cls: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (onHand < 50)   return { label: 'Low Stock',    cls: 'bg-amber-50 text-amber-600 border-amber-200' };
    return               { label: 'Healthy',           cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
}

function StockBar({ onHand, max = 1000 }) {
    const pct   = Math.min((onHand / max) * 100, 100);
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
export default function StockLevels({ stocks: serverStocks, stats: serverStats }) {
    const rows  = serverStocks ?? DUMMY_STOCKS;
    const stats = serverStats  ?? DUMMY_STATS;

    const [search, setSearch]       = useState('');
    const [whFilter, setWh]         = useState('All');
    const [catFilter, setCat]       = useState('All');
    const [statusFilter, setStatus] = useState('All');
    const [viewMode, setViewMode]   = useState('table');

    const filtered = useMemo(() =>
        rows.filter(r => {
            const q = search.toLowerCase();
            const matchSearch = q === '' ||
                r.product.toLowerCase().includes(q) ||
                r.warehouse.toLowerCase().includes(q) ||
                r.category.toLowerCase().includes(q) ||
                (r.batch ?? '').toLowerCase().includes(q) ||
                (r.location ?? '').toLowerCase().includes(q);
            const matchWh     = whFilter === 'All'     || r.warehouse === whFilter;
            const matchCat    = catFilter === 'All'    || r.category  === catFilter;
            const matchStatus = statusFilter === 'All' ||
                (statusFilter === 'Out of Stock' && r.qty_on_hand === 0) ||
                (statusFilter === 'Low Stock'    && r.qty_on_hand > 0 && r.qty_on_hand < 50) ||
                (statusFilter === 'Healthy'      && r.qty_on_hand >= 50);
            return matchSearch && matchWh && matchCat && matchStatus;
        }),
    [rows, search, whFilter, catFilter, statusFilter]);

    const kpis = [
        { label: 'Total SKUs',      value: stats.total_sku,    badge: 'Product lines',  badgeColor: 'text-slate-500 bg-slate-50',   iconBg: 'bg-slate-50 text-slate-500',   iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { label: 'Total On Hand',   value: stats.total_on_hand,badge: 'All warehouses', badgeColor: 'text-emerald-600 bg-emerald-50',iconBg: 'bg-emerald-50 text-emerald-600',iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Total Reserved',  value: stats.total_reserved,badge: 'eCommerce holds',badgeColor: 'text-blue-600 bg-blue-50',    iconBg: 'bg-blue-50 text-blue-600',     iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
        { label: 'Out of Stock',    value: stats.out_of_stock, badge: 'Needs restock',  badgeColor: 'text-rose-600 bg-rose-50',    iconBg: 'bg-rose-50 text-rose-600',     iconPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
        { label: 'Low Stock',       value: stats.low_stock,    badge: 'Below 50 units', badgeColor: 'text-amber-600 bg-amber-50',  iconBg: 'bg-amber-50 text-amber-600',   iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { label: 'Warehouses',      value: stats.warehouses,   badge: 'Locations',      badgeColor: 'text-violet-600 bg-violet-50',iconBg: 'bg-violet-50 text-violet-600', iconPath: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
    ];

    const availableQty = (r) => Math.max(r.qty_on_hand - r.qty_reserved, 0);

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
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            PDF
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Excel
                        </button>
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

                        {/* Warehouse filter */}
                        <select value={whFilter} onChange={e => setWh(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition">
                            {WAREHOUSES.map(w => <option key={w}>{w}</option>)}
                        </select>

                        {/* Category filter */}
                        <select value={catFilter} onChange={e => setCat(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition">
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>

                        {/* Stock status filter */}
                        <select value={statusFilter} onChange={e => setStatus(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition">
                            {['All', 'Healthy', 'Low Stock', 'Out of Stock'].map(s => <option key={s}>{s}</option>)}
                        </select>

                        {/* View toggle */}
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 flex-shrink-0">
                            {[
                                { mode: 'table', icon: 'M3 10h18M3 14h18M3 6h18M3 18h18' },
                                { mode: 'grid',  icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
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

                    <p className="mt-3 text-[11px] font-bold text-slate-400">
                        Showing <span className="text-slate-700 font-black">{filtered.length}</span> record{filtered.length !== 1 ? 's' : ''}
                        {whFilter !== 'All'     && <> · warehouse: <span className="text-blue-600">{whFilter}</span></>}
                        {catFilter !== 'All'    && <> · category: <span className="text-emerald-600">{catFilter}</span></>}
                        {statusFilter !== 'All' && <> · status: <span className="text-slate-600">{statusFilter}</span></>}
                    </p>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📦 Stock Snapshot</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Per product · warehouse · location · batch</p>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                {filtered.length} records
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['#', 'Product', 'Warehouse', 'Location', 'Batch Code', 'On Hand', 'Reserved', 'Available', 'Status', 'Last Updated', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.length > 0 ? filtered.map((r, i) => {
                                        const status  = stockStatus(r.qty_on_hand);
                                        const avail   = availableQty(r);
                                        return (
                                            <tr key={r.id} className="hover:bg-slate-50/70 transition-colors group">
                                                {/* # */}
                                                <td className="px-4 py-3.5 text-xs font-bold text-slate-300">{i + 1}</td>

                                                {/* Product */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <CategoryAvatar category={r.category} />
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800 whitespace-nowrap leading-tight">{r.product}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{r.category}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Warehouse */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                                        {r.warehouse}
                                                    </span>
                                                </td>

                                                {/* Location */}
                                                <td className="px-4 py-3.5 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                    {r.location ?? <span className="text-slate-300">—</span>}
                                                </td>

                                                {/* Batch */}
                                                <td className="px-4 py-3.5">
                                                    {r.batch
                                                        ? <span className="text-[10px] font-mono font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">{r.batch}</span>
                                                        : <span className="text-slate-300 text-xs font-bold">—</span>}
                                                </td>

                                                {/* On Hand */}
                                                <td className="px-4 py-3.5">
                                                    <StockBar onHand={r.qty_on_hand} />
                                                </td>

                                                {/* Reserved */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-sm font-black tabular-nums ${r.qty_reserved > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                                        {r.qty_reserved.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Available */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-sm font-black tabular-nums ${avail > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                        {avail.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Status badge */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border whitespace-nowrap ${status.cls}`}>
                                                        {status.label}
                                                    </span>
                                                </td>

                                                {/* Updated */}
                                                <td className="px-4 py-3.5 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                    {r.updated_at}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition whitespace-nowrap">
                                                            + Stock In
                                                        </button>
                                                        <button className="text-[10px] font-black text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl transition">
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={11} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="text-4xl">📦</div>
                                                    <p className="text-sm font-black text-slate-300">No stock records found</p>
                                                    <p className="text-xs text-slate-300">Try adjusting your filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {/* Totals footer */}
                                {filtered.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-slate-50/80 border-t border-slate-100">
                                            <td colSpan={5} className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">
                                                Totals ({filtered.length} records)
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-black text-slate-800 tabular-nums">
                                                    {filtered.reduce((s, r) => s + r.qty_on_hand, 0).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-black text-blue-600 tabular-nums">
                                                    {filtered.reduce((s, r) => s + r.qty_reserved, 0).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-black text-emerald-600 tabular-nums">
                                                    {filtered.reduce((s, r) => s + availableQty(r), 0).toFixed(2)}
                                                </span>
                                            </td>
                                            <td colSpan={3} />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                )}

                {/* ── GRID VIEW ── */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.length > 0 ? filtered.map(r => {
                            const status = stockStatus(r.qty_on_hand);
                            const avail  = availableQty(r);
                            const gradient = CATEGORY_COLOR[r.category] ?? 'from-slate-300 to-slate-500';
                            return (
                                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                    <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                                    <div className="p-4 space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <CategoryAvatar category={r.category} />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-800 leading-tight truncate">{r.product}</p>
                                                    <p className="text-[10px] text-slate-400">{r.category}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${status.cls}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Location / batch row */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{r.warehouse}</span>
                                            {r.location && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{r.location}</span>}
                                            {r.batch    && <span className="text-[10px] font-mono font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">{r.batch}</span>}
                                        </div>

                                        {/* Qty breakdown */}
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            {[
                                                { label: 'On Hand',  val: r.qty_on_hand,  color: 'text-slate-700' },
                                                { label: 'Reserved', val: r.qty_reserved, color: 'text-blue-600'  },
                                                { label: 'Available',val: avail,          color: avail > 0 ? 'text-emerald-600' : 'text-rose-500' },
                                            ].map(q => (
                                                <div key={q.label} className="bg-slate-50 rounded-xl py-2">
                                                    <p className={`text-sm font-black tabular-nums ${q.color}`}>{q.val.toFixed(0)}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{q.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Stock bar */}
                                        <StockBar onHand={r.qty_on_hand} />

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                            <span className="text-[10px] text-slate-300 font-bold">{r.updated_at}</span>
                                            <div className="flex gap-1.5">
                                                <button className="text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition">+ Stock In</button>
                                                <button className="text-[10px] font-black text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl transition">View</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="text-4xl mb-2">📦</div>
                                <p className="text-sm font-black text-slate-300">No stock records found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── WAREHOUSE SUMMARY ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🏬 Warehouse Breakdown</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Total on-hand and reserved per warehouse</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    {['Warehouse', 'SKUs', 'Total On Hand', 'Total Reserved', 'Available', 'Utilisation'].map(h => (
                                        <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {['WH-01 Main', 'WH-02 Cold', 'WH-03 Fin. Goods'].map(wh => {
                                    const whRows  = DUMMY_STOCKS.filter(r => r.warehouse === wh);
                                    const onHand  = whRows.reduce((s, r) => s + r.qty_on_hand,  0);
                                    const reserved= whRows.reduce((s, r) => s + r.qty_reserved, 0);
                                    const avail   = Math.max(onHand - reserved, 0);
                                    const pct     = Math.min((onHand / 1500) * 100, 100);
                                    const barColor= pct > 80 ? 'bg-rose-400' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-500';
                                    return (
                                        <tr key={wh} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{wh}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-slate-600">{whRows.length}</td>
                                            <td className="px-5 py-3.5 text-sm font-black text-slate-800 tabular-nums">{onHand.toFixed(2)}</td>
                                            <td className="px-5 py-3.5 text-sm font-black text-blue-600 tabular-nums">{reserved.toFixed(2)}</td>
                                            <td className="px-5 py-3.5 text-sm font-black text-emerald-600 tabular-nums">{avail.toFixed(2)}</td>
                                            <td className="px-5 py-3.5 w-40">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-500 w-8 text-right">{Math.round(pct)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </InventoryStaffLayout>
    );
}
