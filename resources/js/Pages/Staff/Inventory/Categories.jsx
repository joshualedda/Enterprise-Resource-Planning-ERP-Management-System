import { useState, useMemo } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────
// DUMMY DATA
// ─────────────────────────────────────────────────────────
const DUMMY_CATEGORIES = [
    {
        id: 1, name: 'Raw Materials', slug: 'raw-materials',
        description: 'Base inputs for silk production — mulberry leaves, silkworm eggs, and feeds.',
        product_count: 5, total_stock: 508, color: 'from-lime-400 to-green-500',
        icon: '🌿', status: 'active', created_at: '2026-01-10',
    },
    {
        id: 2, name: 'Cocoons', slug: 'cocoons',
        description: 'Fresh and dried cocoons harvested from silkworms, categorized by grade.',
        product_count: 3, total_stock: 1460, color: 'from-amber-300 to-orange-400',
        icon: '🪲', status: 'active', created_at: '2026-01-10',
    },
    {
        id: 3, name: 'Silk Products', slug: 'silk-products',
        description: 'Processed silk outputs including threads, yarns, and degummed silk.',
        product_count: 4, total_stock: 306, color: 'from-violet-400 to-purple-600',
        icon: '🧵', status: 'active', created_at: '2026-01-12',
    },
    {
        id: 4, name: 'By-Products', slug: 'by-products',
        description: 'Secondary outputs from silk processing — pupae, cocoon powder, and floss.',
        product_count: 3, total_stock: 655, color: 'from-sky-400 to-blue-500',
        icon: '♻️', status: 'active', created_at: '2026-01-12',
    },
    {
        id: 5, name: 'Supplies', slug: 'supplies',
        description: 'Consumable materials and maintenance supplies used in sericulture operations.',
        product_count: 2, total_stock: 124, color: 'from-slate-400 to-slate-600',
        icon: '🔧', status: 'active', created_at: '2026-01-15',
    },
    {
        id: 6, name: 'Packaging', slug: 'packaging',
        description: 'Boxes, bags, and wrapping materials for product delivery and storage.',
        product_count: 0, total_stock: 0, color: 'from-pink-400 to-rose-500',
        icon: '📦', status: 'active', created_at: '2026-02-01',
    },
    {
        id: 7, name: 'Equipment Parts', slug: 'equipment-parts',
        description: 'Spare parts and components for reeling machines and processing equipment.',
        product_count: 0, total_stock: 0, color: 'from-cyan-400 to-teal-600',
        icon: '⚙️', status: 'archived', created_at: '2026-02-15',
    },
];

const DUMMY_STATS = {
    total: 7,
    active: 6,
    archived: 1,
    with_products: 5,
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function statusBadge(status) {
    return status === 'active'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
        : 'bg-slate-100 text-slate-400 border-slate-200';
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
export default function Categories({
    categories: serverCategories,
    stats: serverStats,
    filters: serverFilters = {},
}) {
    const rows  = serverCategories ?? DUMMY_CATEGORIES;
    const stats = serverStats      ?? DUMMY_STATS;

    const [search, setSearch]       = useState(serverFilters.search ?? '');
    const [statusFilter, setStatus] = useState(serverFilters.status ?? 'All');
    const [viewMode, setViewMode]   = useState('table'); // 'table' | 'grid'

    const filtered = useMemo(() =>
        rows.filter(c => {
            const matchSearch = search === '' ||
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                (c.description ?? '').toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === 'All' || c.status === statusFilter;
            return matchSearch && matchStatus;
        }),
    [rows, search, statusFilter]);

    const kpis = [
        {
            label: 'Total Categories', value: stats.total, badge: 'All', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'Active', value: stats.active, badge: 'Published', badgeColor: 'text-emerald-600 bg-emerald-50',
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Archived', value: stats.archived, badge: 'Hidden', badgeColor: 'text-slate-400 bg-slate-100',
            iconPath: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
            iconBg: 'bg-slate-100 text-slate-500',
        },
        {
            label: 'With Products', value: stats.with_products, badge: 'Has items', badgeColor: 'text-violet-600 bg-violet-50',
            iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            iconBg: 'bg-violet-50 text-violet-600',
        },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Categories — Inventory" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categories</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Manage product classifications for the sericulture inventory.
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
                        <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-200">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            Add Category
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
                                placeholder="Search by category name or description…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={e => setStatus(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition"
                        >
                            {['All', 'active', 'archived'].map(s => <option key={s}>{s}</option>)}
                        </select>

                        {/* View toggle */}
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

                    <p className="mt-3 text-[11px] font-bold text-slate-400">
                        Showing <span className="text-slate-700 font-black">{filtered.length}</span> categor{filtered.length !== 1 ? 'ies' : 'y'}
                        {statusFilter !== 'All' && <> · status: <span className="text-slate-600 capitalize">{statusFilter}</span></>}
                    </p>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🏷️ Category List</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">All product classifications in the inventory system</p>
                            </div>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                                {filtered.length} categories
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['#', 'Category', 'Description', 'Products', 'Total Stock', 'Status', 'Created', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.length > 0 ? filtered.map((cat, i) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors group">
                                            {/* # */}
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-300">{i + 1}</td>

                                            {/* Category */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-base shadow-sm flex-shrink-0`}>
                                                        {cat.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 leading-tight">{cat.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{cat.slug}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Description */}
                                            <td className="px-5 py-3.5 max-w-xs">
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{cat.description ?? '—'}</p>
                                            </td>

                                            {/* Products */}
                                            <td className="px-5 py-3.5">
                                                <span className={`text-sm font-black ${cat.product_count > 0 ? 'text-violet-600' : 'text-slate-300'}`}>
                                                    {cat.product_count}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium ml-1">items</span>
                                            </td>

                                            {/* Total stock */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-500`}
                                                            style={{ width: `${Math.min((cat.total_stock / 2000) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700">{cat.total_stock.toLocaleString()}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border capitalize ${statusBadge(cat.status)}`}>
                                                    {cat.status}
                                                </span>
                                            </td>

                                            {/* Created */}
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-400 whitespace-nowrap">
                                                {cat.created_at}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-[10px] font-black text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-xl transition">
                                                        Edit
                                                    </button>
                                                    <button className="text-[10px] font-black text-rose-500 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="text-4xl">🏷️</div>
                                                    <p className="text-sm font-black text-slate-300">No categories found</p>
                                                    <p className="text-xs text-slate-300">Try adjusting your search or filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── GRID VIEW ── */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.length > 0 ? filtered.map(cat => (
                            <div key={cat.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                {/* Gradient strip */}
                                <div className={`h-1.5 bg-gradient-to-r ${cat.color}`} />

                                <div className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg shadow-sm flex-shrink-0`}>
                                            {cat.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 leading-tight">{cat.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{cat.slug}</p>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border capitalize ${statusBadge(cat.status)}`}>
                                            {cat.status}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                        {cat.description ?? 'No description added yet.'}
                                    </p>

                                    {/* Stats row */}
                                    <div className="flex items-center gap-4 pt-1">
                                        <div className="text-center">
                                            <p className="text-base font-black text-violet-600">{cat.product_count}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Products</p>
                                        </div>
                                        <div className="h-8 w-px bg-slate-100" />
                                        <div className="text-center">
                                            <p className="text-base font-black text-slate-700">{cat.total_stock.toLocaleString()}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Total Stock</p>
                                        </div>
                                    </div>

                                    {/* Stock bar */}
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-700`}
                                            style={{ width: `${Math.min((cat.total_stock / 2000) * 100, 100)}%` }}
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                        <span className="text-[10px] text-slate-300 font-bold">{cat.created_at}</span>
                                        <div className="flex gap-1.5">
                                            <button className="text-[10px] font-black text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl transition">
                                                Edit
                                            </button>
                                            <button className="text-[10px] font-black text-rose-500 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="text-4xl mb-2">🏷️</div>
                                <p className="text-sm font-black text-slate-300">No categories found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── SUMMARY BAR ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📊 Overview</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Stock spread across all categories</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-x divide-slate-50">
                        {DUMMY_CATEGORIES.map(cat => (
                            <div key={cat.id} className="px-5 py-4 text-center hover:bg-slate-50/60 transition-colors">
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cat.color} mx-auto mb-2 flex items-center justify-center text-sm shadow-sm`}>
                                    {cat.icon}
                                </div>
                                <p className="text-xs font-black text-slate-700">{cat.product_count}</p>
                                <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5 line-clamp-1">{cat.name}</p>
                                <p className="text-[10px] font-black text-emerald-600 mt-1">{cat.total_stock.toLocaleString()} units</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </InventoryStaffLayout>
    );
}
