import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Pinagsamang pangalan dahil split ang fields mo sa database
    const fullName = `${user.first_name} ${user.last_name}`;

    // Notification logic - Pwede mong kunin ito sa props kung may real-time data ka na
    const notifications = usePage().props.notifications || [];

    // Build Navigation based on role_id (1=Admin, 2=Staff, 3=Customer)
    const navigation = useMemo(() => {
        const items = [
            { 
                name: 'Dashboard', 
                href: route('dashboard'), 
                icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 
                current: route().current('dashboard') 
            },
        ];

        // Admin Role (role_id === 1)
        if (user.role_id === 1) {
            items.push(
                { name: 'Users', href: route('admin.users.index'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', current: route().current('admin.users.*') },
                { name: 'Products', href: route().has('products.index') ? route('products.index') : '#', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', current: route().current('products.*') },
                { name: 'Reports', href: route().has('admin.reports') ? route('admin.reports') : '#', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0_1-2-2z', current: route().current('admin.reports') },
            );
        } 
        // Staff Role (role_id === 2)
        else if (user.role_id === 2) {
            items.push(
                // FIXED: current: route().current('staff.orders.*')
                { name: 'Orders', href: route().has('staff.orders.index') ? route('staff.orders.index') : '#', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', current: route().current('staff.orders.*') },
                { name: 'Inventory', href: route().has('inventory.index') ? route('inventory.index') : '#', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', current: route().current('inventory.*') },
                { name: 'Tasks', href: route().has('tasks.index') ? route('tasks.index') : '#', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', current: route().current('tasks.*') }
            );
        }
        // Customer Role (role_id === 3)
        else if (user.role_id === 3) {
            items.push(
                { name: 'My Orders', href: route().has('orders.index') ? route('orders.index') : '#', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2', current: route().current('orders.*') },       );
        }
        return items;
    }, [user.role_id]);

    // Helper para ipakita ang label ng role
    const getRoleLabel = (id) => {
        const labels = { 1: 'Administrator', 2: 'Staff Member', 3: 'Customer' };
        return labels[id] || 'User';
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex flex-col h-full">
                    <div className="p-8">
                        <Link href="/">
                            <ApplicationLogo size="sm" className="!items-start" />
                        </Link>
                    </div>

                    <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Main Navigation</div>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 group ${
                                    item.current
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                }`}
                            >
                                <svg className={`mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-40 shrink-0">
                    <button 
                        onClick={() => setSidebarOpen(true)} 
                        className="lg:hidden p-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                        aria-label="Open Menu"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="hidden md:block">
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            {header || 'Resource Overview'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        {/* Notification Bell (Empty State) */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="relative p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h4" />
                                    </svg>
                                    {notifications.length > 0 && (
                                        <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border-2 border-white"></span>
                                        </span>
                                    )}
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right" width="80" className="overflow-hidden rounded-3xl shadow-2xl border-0">
                                <div className="p-5 border-b bg-slate-50/80 backdrop-blur-sm">
                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-900">Notifications</span>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto bg-white py-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                    No new alerts
                                </div>
                            </Dropdown.Content>
                        </Dropdown>

                        <div className="h-10 w-[1px] bg-slate-100 mx-1"></div>

                        {/* User Profile */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-slate-50 transition-all group focus:outline-none">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black text-slate-900 leading-none group-hover:text-indigo-600 transition">{fullName}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-1.5">{getRoleLabel(user.role_id)}</p>
                                    </div>
                                    <img 
                                        className="h-11 w-11 rounded-2xl border-2 border-white shadow-md group-hover:shadow-indigo-100 transition-all object-cover" 
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff&bold=true&font-size=0.33`} 
                                        alt={fullName} 
                                    />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right" width="48" className="rounded-2xl border-0 shadow-2xl overflow-hidden mt-2">
                                <Dropdown.Link href={route('profile.edit')} className="font-bold text-xs py-3">Settings</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="font-bold text-xs py-3 text-rose-600 w-full text-left">Logout</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
                    <div className="container mx-auto px-6 lg:px-10 py-8 lg:py-10 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
}