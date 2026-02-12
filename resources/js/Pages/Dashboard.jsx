import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import OrderList from '@/Components/OrderList';
import UserList from '@/Components/UserList';
import ProductList from '@/Components/ProductList';
import SimpleChart from '@/Components/SimpleChart';

export default function Dashboard({ user, orders, users, products }) {
    const renderDashboard = () => {
        switch (user.role) {
            case 'staff':
                return <StaffDashboard products={products} />;
            case 'customer':
                return <CustomerDashboard orders={orders} />;
            default:
                return <div className="p-8 text-center font-bold text-slate-400">Access Denied: Unknown Role</div>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="animate-in fade-in duration-500">
                {renderDashboard()}
            </div>
        </AuthenticatedLayout>
    );
}

// --- STAFF DASHBOARD ---
function StaffDashboard({ products }) {
    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Operations</h1>
                    <p className="text-slate-500 font-medium">Manage inventory and keep things running smoothly.</p>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
                    + Add New Item
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Products Managed</p>
                    <h3 className="text-4xl font-black mt-2">{products?.length || 0}</h3>
                    <div className="mt-4 h-1 w-full bg-indigo-800 rounded-full overflow-hidden">
                        <div className="bg-white h-full w-2/3"></div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Tasks</p>
                    <h3 className="text-4xl font-black mt-2 text-amber-500">08</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">Requires your attention</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Low Stock Alert</p>
                    <h3 className="text-4xl font-black mt-2 text-rose-500">03</h3>
                    <p className="text-xs font-bold text-rose-500 mt-2 animate-pulse">Needs restocking</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Fast-Moving Inventory</h2>
                <ProductList products={products || []} />
            </div>
        </div>
    );
}

// --- CUSTOMER DASHBOARD ---
function CustomerDashboard({ orders }) {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2">My Account</h1>
                    <p className="text-indigo-100 font-medium">Track your orders and explore our new silk products.</p>
                </div>
                <svg className="absolute right-[-5%] top-[-10%] w-64 h-64 text-white/10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.27 14.3H3.73L12 5.45z" /></svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Orders', val: orders?.length || 0, color: 'text-indigo-600', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
                    { label: 'Pending', val: orders?.filter(o => o.status === 'pending').length || 0, color: 'text-amber-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Completed', val: orders?.filter(o => o.status === 'completed').length || 0, color: 'text-emerald-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                ].map((stat, i) => (
                    <button key={i} onClick={() => window.location.href = route('orders.index')} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
                        <div className={`${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900">{stat.val}</p>
                    </button>
                ))}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => window.location.href = route('orders.index')} className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] hover:bg-indigo-50 transition group">
                        <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:text-indigo-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div>
                        <div className="text-left">
                            <p className="font-black text-slate-900">View Order History</p>
                            <p className="text-xs text-slate-500 font-medium">See all your past purchases</p>
                        </div>
                    </button>
                    <button onClick={() => window.location.href = route('profile.edit')} className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] hover:bg-emerald-50 transition group">
                        <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:text-emerald-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                        <div className="text-left">
                            <p className="font-black text-slate-900">Account Settings</p>
                            <p className="text-xs text-slate-500 font-medium">Update your personal info</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}