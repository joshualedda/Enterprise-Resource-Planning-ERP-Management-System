import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Package, ChevronDown } from 'lucide-react';

// --- FORMAT HELPERS ---
const formatPHP = (price) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price || 0);

// --- STOCK STATUS BADGE ---
const StockBadge = ({ stock }) => {
    const isOut = stock === 0;
    const isLow = stock > 0 && stock <= 10;

    const styles = isOut
        ? 'bg-rose-50 text-rose-600 border-rose-100'
        : isLow
            ? 'bg-amber-50 text-amber-600 border-amber-100'
            : 'bg-emerald-50 text-emerald-600 border-emerald-100';

    const dotColor = isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500';
    const label = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${styles}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {label}
        </span>
    );
};

// --- SORT ICON ---
const SortIcon = ({ sortConfig, column }) =>
    sortConfig.key === column
        ? sortConfig.direction === 'asc'
            ? <ArrowUpRight size={12} className="text-emerald-500" />
            : <ArrowDownRight size={12} className="text-emerald-500" />
        : null;

// --- MAIN COMPONENT ---
export default function ProductList({ products = [] }) {
    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'product', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [search, stockFilter]);

    const processed = useMemo(() => {
        let result = products.filter(p => {
            const name = (p.product || p.name || '').toLowerCase();
            const category = (p.category?.category || p.category || '').toLowerCase();
            const matchesSearch = name.includes(search.toLowerCase()) || category.includes(search.toLowerCase());

            const stock = p.stock ?? p.stock_quantity ?? 0;
            const matchesStock =
                stockFilter === 'All' ? true :
                    stockFilter === 'In Stock' ? stock > 10 :
                        stockFilter === 'Low Stock' ? (stock > 0 && stock <= 10) :
                            stockFilter === 'Out of Stock' ? stock === 0 : true;

            return matchesSearch && matchesStock;
        });

        result.sort((a, b) => {
            let aVal = a[sortConfig.key] ?? '';
            let bVal = b[sortConfig.key] ?? '';
            if (sortConfig.key === 'product') {
                aVal = (a.product || a.name || '').toLowerCase();
                bVal = (b.product || b.name || '').toLowerCase();
            }
            if (sortConfig.key === 'category') {
                aVal = (a.category?.category || a.category || '').toLowerCase();
                bVal = (b.category?.category || b.category || '').toLowerCase();
            }
            if (sortConfig.key === 'stock') {
                aVal = a.stock ?? a.stock_quantity ?? 0;
                bVal = b.stock ?? b.stock_quantity ?? 0;
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [products, search, stockFilter, sortConfig]);

    const totalPages = Math.ceil(processed.length / itemsPerPage);
    const paginated = processed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key) =>
        setSortConfig(cur => ({ key, direction: cur.key === key && cur.direction === 'asc' ? 'desc' : 'asc' }));

    const getPageNumbers = () => {
        const pages = [];
        const max = 5;
        if (totalPages <= max) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push('...'); pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1); pages.push('...');
            for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1); pages.push('...');
            pages.push(currentPage - 1); pages.push(currentPage); pages.push(currentPage + 1);
            pages.push('...'); pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-3 items-center">
                {/* Search */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search product or category..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm font-medium transition-all outline-none"
                    />
                </div>

                {/* Right side: result count + filter */}
                <div className="flex items-center gap-3 md:ml-auto w-full md:w-auto">
                    {/* Result count */}
                    <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex-shrink-0">
                        {processed.length} result{processed.length !== 1 ? 's' : ''}
                    </span>

                    {/* Stock Status Filter */}
                    <div className="relative flex items-center flex-1 md:flex-none">
                        <Filter size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                        <select
                            value={stockFilter}
                            onChange={e => setStockFilter(e.target.value)}
                            className="w-full md:w-48 pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer hover:border-emerald-300 transition-colors appearance-none outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th onClick={() => handleSort('product')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-emerald-600 transition-colors select-none">
                                    <div className="flex items-center gap-1">Product <SortIcon sortConfig={sortConfig} column="product" /></div>
                                </th>
                                <th onClick={() => handleSort('category')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-emerald-600 transition-colors select-none">
                                    <div className="flex items-center gap-1">Category <SortIcon sortConfig={sortConfig} column="category" /></div>
                                </th>
                                <th onClick={() => handleSort('price')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-emerald-600 transition-colors select-none">
                                    <div className="flex items-center gap-1">Price <SortIcon sortConfig={sortConfig} column="price" /></div>
                                </th>
                                <th onClick={() => handleSort('stock')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-emerald-600 transition-colors select-none">
                                    <div className="flex items-center gap-1">Stock <SortIcon sortConfig={sortConfig} column="stock" /></div>
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginated.length > 0 ? paginated.map(product => {
                                const stock = product.stock ?? product.stock_quantity ?? 0;
                                return (
                                    <tr key={product.id} className="group hover:bg-slate-50/80 transition-colors">
                                        {/* Product name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                                    <Package size={16} className="text-emerald-500" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate max-w-[180px]">
                                                    {product.product || product.name || '—'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-500">
                                                {product.category?.category || product.category || '—'}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-slate-900">
                                                {formatPHP(product.price)}
                                            </span>
                                        </td>

                                        {/* Stock count */}
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-black ${stock === 0 ? 'text-rose-600' : stock <= 10 ? 'text-amber-600' : 'text-slate-900'}`}>
                                                {stock}
                                            </span>
                                        </td>

                                        {/* Status badge */}
                                        <td className="px-6 py-4">
                                            <StockBadge stock={stock} />
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <Package size={32} className="text-slate-300" />
                                            </div>
                                            <h3 className="text-slate-900 font-bold mb-1">No products found</h3>
                                            <p className="text-slate-500 text-xs mb-6 max-w-xs mx-auto">
                                                {search ? `No matches for "${search}"` : 'No products match the selected filter.'}
                                            </p>
                                            <button
                                                onClick={() => { setSearch(''); setStockFilter('All'); }}
                                                className="px-5 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        <ChevronDown className="rotate-90 w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, i) =>
                            typeof page === 'number' ? (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition ${currentPage === page ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={i} className="px-2 text-slate-400 font-bold">...</span>
                            )
                        )}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        <ChevronDown className="-rotate-90 w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}