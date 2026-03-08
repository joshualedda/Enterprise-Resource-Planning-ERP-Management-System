import { useState, useMemo } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, router } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────
// DUMMY DATA — used when no backend data is passed in
// ─────────────────────────────────────────────────────────
const DUMMY_PRODUCTS = [
    { id: 1, product: 'Mulberry Leaves (Fresh)',    category: { name: 'Raw Materials' },  price: 25.00,  status: 'active',   stock_count: 340, image_url: null, created_at: '2026-01-15' },
    { id: 2, product: 'Mulberry Leaves (Dried)',    category: { name: 'Raw Materials' },  price: 60.00,  status: 'active',   stock_count: 120, image_url: null, created_at: '2026-01-15' },
    { id: 3, product: 'Silkworm Eggs (Boxed)',      category: { name: 'Raw Materials' },  price: 450.00, status: 'active',   stock_count: 8,   image_url: null, created_at: '2026-01-20' },
    { id: 4, product: 'Fresh Cocoons (Grade A)',    category: { name: 'Cocoons' },        price: 180.00, status: 'active',   stock_count: 820, image_url: null, created_at: '2026-01-22' },
    { id: 5, product: 'Fresh Cocoons (Grade B)',    category: { name: 'Cocoons' },        price: 120.00, status: 'active',   stock_count: 410, image_url: null, created_at: '2026-01-22' },
    { id: 6, product: 'Dried Cocoons',              category: { name: 'Cocoons' },        price: 250.00, status: 'active',   stock_count: 230, image_url: null, created_at: '2026-01-25' },
    { id: 7, product: 'Raw Silk Thread (Reeled)',   category: { name: 'Silk Products' },  price: 1200.00,status: 'active',   stock_count: 42,  image_url: null, created_at: '2026-02-01' },
    { id: 8, product: 'Silk Yarn Grade A',          category: { name: 'Silk Products' },  price: 1800.00,status: 'active',   stock_count: 156, image_url: null, created_at: '2026-02-01' },
    { id: 9, product: 'Silk Yarn Grade B',          category: { name: 'Silk Products' },  price: 1200.00,status: 'active',   stock_count: 88,  image_url: null, created_at: '2026-02-05' },
    { id: 10, product: 'Degummed Silk',             category: { name: 'Silk Products' },  price: 2400.00,status: 'active',   stock_count: 20,  image_url: null, created_at: '2026-02-08' },
    { id: 11, product: 'Silk Waste (Floss)',        category: { name: 'By-Products' },    price: 80.00,  status: 'active',   stock_count: 600, image_url: null, created_at: '2026-02-10' },
    { id: 12, product: 'Pupae (Dried)',             category: { name: 'By-Products' },    price: 150.00, status: 'active',   stock_count: 0,   image_url: null, created_at: '2026-02-10' },
    { id: 13, product: 'Silk Cocoon Powder',        category: { name: 'By-Products' },    price: 320.00, status: 'archived', stock_count: 55,  image_url: null, created_at: '2026-02-12' },
    { id: 14, product: 'Silk Wax',                  category: { name: 'Supplies' },       price: 210.00, status: 'active',   stock_count: 90,  image_url: null, created_at: '2026-02-14' },
    { id: 15, product: 'Reeling Machine Oil',       category: { name: 'Supplies' },       price: 95.00,  status: 'active',   stock_count: 34,  image_url: null, created_at: '2026-02-18' },
];

const DUMMY_STATS = {
    total: 15,
    active: 13,
    archived: 1,
    low_stock: 3,
};

const DUMMY_CATEGORIES = [
    'Raw Materials', 'Cocoons', 'Silk Products', 'By-Products', 'Supplies',
];

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const phpFmt = (n) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n);

function stockBadge(qty) {
    if (qty === 0)  return { label: 'Out of Stock', cls: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (qty < 10)   return { label: 'Critical',      cls: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (qty < 50)   return { label: 'Low Stock',     cls: 'bg-amber-50 text-amber-600 border-amber-200' };
    return            { label: 'In Stock',           cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
}

function statusBadge(status) {
    return status === 'active'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
        : 'bg-slate-100 text-slate-400 border-slate-200';
}

// Stock bar (0-500 scale for display)
function StockBar({ qty }) {
    const pct = Math.min((qty / 500) * 100, 100);
    const color = qty === 0 ? 'bg-rose-400' : qty < 10 ? 'bg-rose-400' : qty < 50 ? 'bg-amber-400' : 'bg-emerald-500';
    return (
        <div className="flex items-center gap-2 w-32">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-black text-slate-700 w-8 text-right">{qty}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// PRODUCT AVATAR (image or initial-based fallback)
// ─────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
    'Raw Materials': 'from-lime-400 to-green-500',
    'Cocoons':       'from-amber-300 to-orange-400',
    'Silk Products': 'from-violet-400 to-purple-600',
    'By-Products':   'from-sky-400 to-blue-500',
    'Supplies':      'from-slate-300 to-slate-500',
};

function ProductAvatar({ product, category }) {
    const initial = product?.[0]?.toUpperCase() ?? 'P';
    const gradient = CATEGORY_COLORS[category] ?? 'from-emerald-400 to-teal-600';
    return (
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0`}>
            {initial}
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, iconPath, iconBg, badge, badgeColor }) {
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
export default function AllProducts({
    products: serverProducts,
    categories: serverCategories,
    stats: serverStats,
    filters: serverFilters = {},
}) {
    // Use server data if available, else dummy
    const isServer = serverProducts && serverProducts.data !== undefined;
    const rows = isServer ? serverProducts.data : DUMMY_PRODUCTS;
    const stats = serverStats ?? DUMMY_STATS;
    const categories = serverCategories?.length ? serverCategories : DUMMY_CATEGORIES;

    // Local UI state
    const [search, setSearch]     = useState(serverFilters.search ?? '');
    const [catFilter, setCat]     = useState(serverFilters.category ?? 'All');
    const [statusFilter, setStatus] = useState(serverFilters.status ?? 'All');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

    // Client-side filter (used for dummy data only)
    const filtered = useMemo(() => {
        if (isServer) return rows;
        return rows.filter(p => {
            const matchSearch = search === '' || p.product.toLowerCase().includes(search.toLowerCase()) || p.category.name.toLowerCase().includes(search.toLowerCase());
            const matchCat    = catFilter === 'All' || p.category.name === catFilter;
            const matchStatus = statusFilter === 'All' || p.status === statusFilter;
            return matchSearch && matchCat && matchStatus;
        });
    }, [rows, search, catFilter, statusFilter, isServer]);

    // Server-side filter send
    const applyFilters = () => {
        if (!isServer) return;
        router.get(route('staff.inventory.products.index'), {
            search: search || undefined,
            category: catFilter !== 'All' ? catFilter : undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
        }, { preserveState: true, replace: true });
    };

    const kpis = [
        {
            label: 'Total Products', value: stats.total, badge: 'All Items', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'Active Products', value: stats.active, badge: 'Published', badgeColor: 'text-emerald-600 bg-emerald-50',
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Archived', value: stats.archived, badge: 'Hidden', badgeColor: 'text-slate-400 bg-slate-100',
            iconPath: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
            iconBg: 'bg-slate-100 text-slate-500',
        },
        {
            label: 'Low / Out of Stock', value: stats.low_stock, badge: 'Needs Attention', badgeColor: 'text-amber-600 bg-amber-50',
            iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
            iconBg: 'bg-amber-50 text-amber-600',
        },
    ];

    const uniqueCats = ['All', ...categories];
    const uniqueStatuses = ['All', 'active', 'archived'];

    return (
        <InventoryStaffLayout>
            <Head title="All Products — Inventory" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">All Products</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Raw sericulture products catalog — stock levels, pricing, and status.
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* ── SEARCH & FILTER BAR ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">

                        {/* Search */}
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by product name or category…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        {/* Category filter */}
                        <select
                            value={catFilter}
                            onChange={e => { setCat(e.target.value); }}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition"
                        >
                            {uniqueCats.map(c => <option key={c}>{c}</option>)}
                        </select>

                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={e => setStatus(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition"
                        >
                            {uniqueStatuses.map(s => <option key={s}>{s}</option>)}
                        </select>

                        {/* Apply (server) / Reset */}
                        {isServer && (
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-200"
                            >
                                Apply
                            </button>
                        )}

                        {/* View Toggle */}
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 flex-shrink-0">
                            {[
                                { mode: 'table', icon: 'M3 10h18M3 14h18M3 6h18M3 18h18' },
                                { mode: 'grid',  icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                            ].map(v => (
                                <button
                                    key={v.mode}
                                    onClick={() => setViewMode(v.mode)}
                                    className={`p-2 rounded-lg transition ${viewMode === v.mode ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={v.icon} />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results count */}
                    <p className="mt-3 text-[11px] font-bold text-slate-400">
                        Showing <span className="text-slate-700 font-black">{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
                        {catFilter !== 'All' && <> in <span className="text-emerald-600">{catFilter}</span></>}
                        {statusFilter !== 'All' && <> · status: <span className="text-slate-600 capitalize">{statusFilter}</span></>}
                    </p>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🧵 Product Catalog</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">All sericulture raw products and silk goods</p>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                {filtered.length} items
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['#', 'Product', 'Category', 'Price', 'Stock Level', 'Stock Status', 'Status', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.length > 0 ? filtered.map((p, i) => {
                                        const stkBadge = stockBadge(p.stock_count ?? 0);
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                                                {/* # */}
                                                <td className="px-5 py-3.5 text-xs font-bold text-slate-300">{i + 1}</td>

                                                {/* Product */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <ProductAvatar product={p.product} category={p.category?.name} />
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 leading-tight">{p.product}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">ID #{p.id}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td className="px-5 py-3.5">
                                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                                                        {p.category?.name ?? '—'}
                                                    </span>
                                                </td>

                                                {/* Price */}
                                                <td className="px-5 py-3.5 text-sm font-black text-slate-700 whitespace-nowrap">
                                                    {phpFmt(p.price)}
                                                </td>

                                                {/* Stock bar */}
                                                <td className="px-5 py-3.5">
                                                    <StockBar qty={p.stock_count ?? 0} />
                                                </td>

                                                {/* Stock status badge */}
                                                <td className="px-5 py-3.5">
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${stkBadge.cls}`}>
                                                        {stkBadge.label}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-3.5">
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border capitalize ${statusBadge(p.status)}`}>
                                                        {p.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="text-[10px] font-black text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-xl transition">
                                                            View
                                                        </button>
                                                        <button className="text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl transition">
                                                            + Stock
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="text-4xl">📦</div>
                                                    <p className="text-sm font-black text-slate-300">No products found</p>
                                                    <p className="text-xs text-slate-300">Try adjusting your search or filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination (server) */}
                        {isServer && serverProducts.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-400">
                                    Page {serverProducts.current_page} of {serverProducts.last_page}
                                    &nbsp;·&nbsp; {serverProducts.total} total products
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {serverProducts.links?.filter(l => l.url).map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1.5 text-xs font-black rounded-xl transition ${
                                                link.active
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── GRID / CARD VIEW ── */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.length > 0 ? filtered.map(p => {
                            const stkBadge = stockBadge(p.stock_count ?? 0);
                            return (
                                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                    {/* Card top color strip by category */}
                                    <div className={`h-1.5 bg-gradient-to-r ${
                                        p.category?.name === 'Raw Materials'  ? 'from-lime-400 to-green-500' :
                                        p.category?.name === 'Cocoons'        ? 'from-amber-300 to-orange-400' :
                                        p.category?.name === 'Silk Products'  ? 'from-violet-400 to-purple-600' :
                                        p.category?.name === 'By-Products'    ? 'from-sky-400 to-blue-500' :
                                        'from-slate-300 to-slate-400'
                                    }`} />

                                    <div className="p-4 space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start gap-3">
                                            <ProductAvatar product={p.product} category={p.category?.name} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-800 leading-tight truncate">{p.product}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{p.category?.name ?? '—'}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-400">Price</p>
                                            <p className="text-sm font-black text-slate-800">{phpFmt(p.price)}</p>
                                        </div>

                                        {/* Stock */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-xs font-bold text-slate-400">Stock</p>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${stkBadge.cls}`}>{stkBadge.label}</span>
                                            </div>
                                            <StockBar qty={p.stock_count ?? 0} />
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border capitalize ${statusBadge(p.status)}`}>
                                                {p.status}
                                            </span>
                                            <div className="flex gap-1.5">
                                                <button className="text-[10px] font-black text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl transition">
                                                    View
                                                </button>
                                                <button className="text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl transition">
                                                    + Stock
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="text-4xl mb-2">📦</div>
                                <p className="text-sm font-black text-slate-300">No products found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── CATEGORY SUMMARY CARDS ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📊 By Category</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Stock distribution across product types</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-x divide-slate-50">
                        {DUMMY_CATEGORIES.map(cat => {
                            const catRows = (isServer ? rows : DUMMY_PRODUCTS).filter(p => p.category?.name === cat);
                            const totalStock = catRows.reduce((s, p) => s + (p.stock_count ?? 0), 0);
                            const gradient = CATEGORY_COLORS[cat] ?? 'from-slate-300 to-slate-400';
                            return (
                                <div key={cat} className="px-5 py-4 text-center hover:bg-slate-50/60 transition-colors">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} mx-auto mb-2 flex items-center justify-center text-white font-black text-xs shadow-sm`}>
                                        {cat[0]}
                                    </div>
                                    <p className="text-xs font-black text-slate-700">{catRows.length}</p>
                                    <p className="text-[10px] text-slate-400 font-bold leading-tight mt-0.5">{cat}</p>
                                    <p className="text-[10px] font-black text-emerald-600 mt-1">{totalStock.toLocaleString()} units</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </InventoryStaffLayout>
    );
}
