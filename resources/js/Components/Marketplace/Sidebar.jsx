import React from 'react';
import { Link } from '@inertiajs/react';
import { LayoutGrid, ShoppingBag, ClipboardList, Settings, LogOut, ChevronRight } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Sidebar({ activeTab = 'marketplace', user }) {
    const navItems = [
        { id: 'marketplace', label: 'Marketplace', icon: LayoutGrid, href: route('products.all') },
        { id: 'cart', label: 'My Cart', icon: ShoppingBag, href: route('customer.cart.index') },
        { id: 'orders', label: 'My Orders', icon: ClipboardList, href: route('customer.orders.index') },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-72 bg-[#0B1F3B] h-screen sticky top-0 overflow-y-auto border-r border-white/5 shadow-2xl z-[150]">
            {/* Logo Area */}
            <div className="p-8 pb-12">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-white/10 p-2 rounded-xl group-hover:bg-[#3BAA35]/20 transition-colors">
                        <ApplicationLogo className="h-8 w-auto" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-white group-hover:translate-x-1 transition-transform">
                        D'SERI<span className="text-[#3BAA35]">CORE</span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-4 mb-4">Navigation</div>
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                            activeTab === item.id
                                ? 'bg-[#3BAA35] text-white shadow-lg shadow-[#3BAA35]/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-white/30 group-hover:text-white transition-colors'} />
                            {item.label}
                        </div>
                        {activeTab === item.id && <ChevronRight size={14} className="animate-pulse" />}
                    </Link>
                ))}
            </nav>

            {/* User Profile Area */}
            {user && (
                <div className="p-4 mt-auto">
                    <div className="bg-white/5 rounded-[2.5rem] p-4 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#3BAA35]/20 rounded-full flex items-center justify-center text-[#3BAA35] font-black text-xs border border-[#3BAA35]/30">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user.first_name} {user.last_name}</p>
                                <p className="text-[10px] text-white/40 font-semibold truncate uppercase tracking-widest">Customer</p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                    >
                        <LogOut size={14} /> EXIT MARKETPLACE
                    </Link>
                </div>
            )}
        </aside>
    );
}
