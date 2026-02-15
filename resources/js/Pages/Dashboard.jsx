import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// Mga Shared Components
import OrderList from '@/Components/OrderList';
import UserList from '@/Components/UserList';
import ProductList from '@/Components/ProductList';
import SimpleChart from '@/Components/SimpleChart';

// Import ang hiwalay mong file sa Pages
import StoreView from '@/Pages/StoreView';

export default function Dashboard({ auth, orders, users, products, stats }) {
    const user = auth.user;

    // 1. URL STATE SYNC: Binabasa kung ?tab=store ang nasa URL
    const [activeTab, setActiveTab] = useState(
        new URLSearchParams(window.location.search).get('tab') || 'overview'
    );

    // Update activeTab kapag nag-click sa Sidebar (nagbago ang URL)
    useEffect(() => {
        const currentTab = new URLSearchParams(window.location.search).get('tab') || 'overview';
        setActiveTab(currentTab);
    }, [window.location.search]);

    // 2. ROLE-BASED RENDERING LOGIC
    const renderContent = () => {
        switch (user.role_id) {
            case 1: // Admin
                return <AdminDashboard users={users} products={products} stats={stats} />;
            case 2: // Staff
                return <StaffDashboard products={products} stats={stats} />;
            case 3: // Customer
                return activeTab === 'store' 
                    ? <StoreView products={products} /> 
                    : <CustomerDashboard orders={orders} />;
            default:
                return (
                    <div className="p-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">
                            Access Denied: Role ID {user.role_id}
                        </h3>
                    </div>
                );
        }
    };

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-sm font-black uppercase tracking-widest text-slate-400">
                            {activeTab === 'store' ? 'Marketplace' : 'Dashboard'}
                        </span>
                    </div>

                    {/* Tabs switcher para sa Customer */}
                    {user.role_id === 3 && (
                        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                            <button 
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab !== 'store' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                            >
                                Overview
                            </button>
                            <button 
                                onClick={() => setActiveTab('store')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'store' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                            >
                                Store
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title={activeTab === 'store' ? "Marketplace" : "Dashboard Overview"} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {renderContent()}
            </div>
        </AuthenticatedLayout>
    );
}

// --- 1. ADMIN DASHBOARD VIEW ---
function AdminDashboard({ users, products, stats }) {
    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Overview</h1>
                    <p className="text-slate-500 font-medium">Global system metrics and administrative insights.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Users" value={users?.length || 0} color="bg-indigo-600" icon="👥" />
                <StatCard label="Total Products" value={products?.length || 0} color="bg-emerald-600" icon="📦" />
                <StatCard label="Active Orders" value={stats?.active_orders || 0} color="bg-violet-600" icon="🛍️" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-md">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">User Activity Trend</h2>
                <div className="h-72 w-full"><SimpleChart /></div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-md">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Recent Accounts</h2>
                <UserList users={users?.slice(0, 5) || []} />
            </div>
        </div>
    );
}

// --- 2. STAFF DASHBOARD VIEW ---
function StaffDashboard({ products, stats }) {
    const lowStock = useMemo(() => products?.filter(p => p.stock <= 5).length || 0, [products]);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Operations Hub</h1>
                <p className="text-slate-500 font-medium">Manage inventory and fulfill pending tasks.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Stock Items</p>
                    <h3 className="text-5xl font-black mt-2 tracking-tighter">{products?.length || 0}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Alerts</p>
                    <h3 className="text-5xl font-black mt-2 text-rose-500 tracking-tighter">{lowStock}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Actions</p>
                    <h3 className="text-5xl font-black mt-2 text-amber-500 tracking-tighter">{stats?.pending_tasks || 0}</h3>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-md text-sm">
                <ProductList products={products || []} />
            </div>
        </div>
    );
}

// --- 3. CUSTOMER DASHBOARD VIEW (ON-SITE / PICKUP LOGIC) ---
function CustomerDashboard({ orders }) {
    // I-filter ang orders base sa on-site status
    const pendingPickup = orders?.filter(o => o.status === 'ready' || o.status === 'pending').length || 0;
    const completed = orders?.filter(o => o.status === 'completed' || o.status === 'claimed').length || 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-5xl font-black mb-3 tracking-tighter">Welcome back!</h1>
                    <p className="text-indigo-100 text-lg font-medium opacity-80">Check your order status for on-site pickup.</p>
                </div>
                <div className="absolute top-[-20%] right-[-10%] text-[15rem] opacity-10 group-hover:rotate-12 transition-transform duration-1000">🏪</div>
            </div>

            {/* Stats Section - On-Site Terminology */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatButton 
                    label="Total Bookings" 
                    val={orders?.length || 0} 
                    color="text-indigo-600" 
                    icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
                <StatButton 
                    label="Ready for Pickup" 
                    val={pendingPickup} 
                    color="text-amber-500" 
                    icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
                <StatButton 
                    label="Claimed / Finished" 
                    val={completed} 
                    color="text-emerald-500" 
                    icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
            </div>

            {/* History Table */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-md">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Transactions</h2>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">On-site Collection</span>
                </div>
                
                {orders?.length > 0 ? (
                    <OrderList orders={orders.slice(0, 5)} /> 
                ) : (
                    <div className="py-12 text-center">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- REUSABLE UI COMPONENTS ---
function StatCard({ label, value, color, icon }) {
    return (
        <div className={`${color} p-8 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden group`}>
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
                <h3 className="text-5xl font-black mt-2 tracking-tighter">{value}</h3>
            </div>
            <span className="absolute right-4 bottom-2 text-6xl opacity-20 group-hover:scale-110 transition-transform">{icon}</span>
        </div>
    );
}

function StatButton({ label, val, color, icon }) {
    return (
        <button className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all text-left group w-full">
            <div className={`${color} mb-6 group-hover:scale-110 transition-transform`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} />
                </svg>
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{val}</p>
        </button>
    );
}