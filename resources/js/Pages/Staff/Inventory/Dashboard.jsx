import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link } from '@inertiajs/react';
import ProductList from '@/Components/ProductList';

export default function Dashboard({ auth, products }) {
    const lowStockProducts = products?.filter(p => p.stock <= 10) || [];

    return (
        <StaffLayout header="Inventory Overview">
            <Head title="Inventory Dashboard" />

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Operations</h1>
                        <p className="text-slate-500 font-medium mt-1">Monitor stock levels and manage product inventory.</p>
                    </div>
                    <Link
                        href={route().has('products.index') ? route('products.index') : '#'}
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Product
                    </Link>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            label: 'Total Products',
                            val: products?.length || 0,
                            color: 'text-emerald-600',
                            bg: 'bg-emerald-50',
                            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
                        },
                        {
                            label: 'Low Stock Items',
                            val: lowStockProducts.length,
                            color: 'text-rose-600',
                            bg: 'bg-rose-50',
                            icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
                        },
                        {
                            label: 'Pending Tasks',
                            val: '08',
                            color: 'text-amber-600',
                            bg: 'bg-amber-50',
                            icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
                        },
                        {
                            label: 'Categories',
                            val: [...new Set(products?.map(p => p.category?.category).filter(Boolean) || [])].length,
                            color: 'text-indigo-600',
                            bg: 'bg-indigo-50',
                            icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
                        },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all duration-300">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Low Stock Alerts + Pending Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Low Stock Alerts */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">🚨 Low Stock Alerts</h2>
                            <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-1 rounded-lg animate-pulse">
                                {lowStockProducts.length} Items
                            </span>
                        </div>
                        {lowStockProducts.length > 0 ? (
                            <div className="space-y-3">
                                {lowStockProducts.slice(0, 6).map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-rose-100 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{p.product}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase">{p.category?.category || 'Uncategorized'}</p>
                                            </div>
                                        </div>
                                        <span className="text-rose-600 font-black text-sm bg-white px-3 py-1 rounded-xl border border-rose-200">
                                            {p.stock ?? 0} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <svg className="w-10 h-10 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="font-bold text-xs">All stock levels are healthy!</p>
                            </div>
                        )}
                    </div>

                    {/* Pending Tasks */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Pending Tasks</h2>
                            <Link href={route().has('tasks.index') ? route('tasks.index') : '#'} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Restock Mulberry Feeds', priority: 'High', color: 'bg-rose-100 text-rose-700' },
                                { label: 'Update product prices for Q2', priority: 'Medium', color: 'bg-amber-100 text-amber-700' },
                                { label: 'Organize warehouse Shelf B', priority: 'Low', color: 'bg-slate-100 text-slate-600' },
                                { label: 'Review incoming delivery #4402', priority: 'High', color: 'bg-rose-100 text-rose-700' },
                                { label: 'Perform monthly inventory count', priority: 'Medium', color: 'bg-amber-100 text-amber-700' },
                            ].map((task, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
                                        <p className="font-bold text-sm text-slate-700 group-hover:text-slate-900">{task.label}</p>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${task.color}`}>{task.priority}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Full Product Inventory */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Product Inventory</h2>
                        <Link
                            href={route().has('products.index') ? route('products.index') : '#'}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                        >
                            Manage All →
                        </Link>
                    </div>
                    <ProductList products={products || []} />
                </div>
            </div>
        </StaffLayout>
    );
}
