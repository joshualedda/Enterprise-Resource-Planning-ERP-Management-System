import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        {
            name: 'Dashboard',
            href: route('admin.dashboard'),
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            current: route().current('admin.dashboard')
        },
        {
            name: 'Users',
            href: route().has('admin.users.index') ? route('admin.users.index') : '#',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
            current: route().current('admin.users.*')
        },
        {
            name: 'Products',
            href: route().has('products.index') ? route('products.index') : '#',
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            current: route().current('products.*')
        },
        {
            name: 'Reports',
            href: route().has('admin.reports') ? route('admin.reports') : '#',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            current: route().current('admin.reports')
        }
    ];

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
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white border-r border-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl`}>
                <div className="flex flex-col h-full">
                    <div className="p-8 flex items-center gap-3">
                        <ApplicationLogo size="sm" className="!items-start text-white fill-current" />
                        <span className="font-black text-xl tracking-tighter">ADMIN<span className="text-indigo-400">PANEL</span></span>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 mt-4">Main Menu</div>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 group ${item.current
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <svg className={`mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-6 border-t border-slate-800 bg-slate-900">
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-40 shrink-0">
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
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                            {header || 'Dashboard Overview'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        {/* User Profile */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-slate-50 transition-all group focus:outline-none">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black text-slate-900 leading-none group-hover:text-indigo-600 transition">{user.first_name} {user.last_name}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-1.5 align-right">Administrator</p>
                                    </div>
                                    <img
                                        className="h-10 w-10 rounded-xl border-2 border-slate-100 shadow-sm group-hover:shadow-indigo-100 transition-all object-cover"
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=6366f1&color=fff&bold=true&font-size=0.33`}
                                        alt={user.first_name}
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

                <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth bg-slate-50">
                    <div className="container mx-auto px-6 lg:px-10 py-8 lg:py-10 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
