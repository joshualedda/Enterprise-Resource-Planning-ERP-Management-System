import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import UserList from '@/Components/UserList';
import ProductList from '@/Components/ProductList';
import SimpleChart from '@/Components/SimpleChart';

export default function Dashboard({ auth, users, products }) {
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 font-medium">Welcome back, Administrator. Here's what's happening today.</p>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Users', val: users?.length || 0, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
                        { label: 'Total Products', val: products?.length || 0, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                        { label: 'Active Orders', val: '12', color: 'text-amber-600', bg: 'bg-amber-50', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
                        { label: 'Revenue', val: '₱42.5k', color: 'text-rose-600', bg: 'bg-rose-50', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all duration-300">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Sales Performance</h2>
                        <SimpleChart data={[1200, 1800, 1500, 2200, 2000, 2600, 3000]} />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Recent User Activity</h2>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button>
                        </div>
                        <UserList users={users?.slice(0, 5) || []} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Inventory Status</h2>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Manage Stock</button>
                        </div>
                        <ProductList products={products?.slice(0, 5) || []} />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Live Orders</h2>
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg">LIVE</span>
                        </div>
                        {/* Placeholder for OrderList if needed, or keep empty/dummy */}
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <svg className="w-10 h-10 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            <p className="font-bold text-xs">No active orders right now</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
