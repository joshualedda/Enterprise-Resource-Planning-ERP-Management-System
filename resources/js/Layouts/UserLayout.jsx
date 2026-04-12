import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ShoppingBag, LayoutGrid, ClipboardList, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import Chatbot from '@/Components/Chatbot';

export default function UserLayout({ children, activeTab = 'marketplace' }) {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const navItems = [
        { id: 'marketplace', label: 'Marketplace', icon: LayoutGrid, href: route('products.all') },
        { id: 'orders', label: 'My Orders', icon: ClipboardList, href: route('customer.orders.index') },
        { id: 'cart', label: 'My Cart', icon: ShoppingBag, href: route('customer.cart.index') },
    ];

    const getDashboardRoute = () => {
        if (!auth.user) return route('login');
        const role_id = auth.user.role_id;
        
        if (role_id === 1) return route('admin.dashboard');
        if (role_id === 3) return route('products.all');
        
        if (role_id === 2) {
            return route('staff.production.dashboard');
        }
        
        return route('login');
    };

    return (
        <div className="min-h-screen bg-[#F7F9FB] flex flex-col font-sans text-[#1F2937] antialiased">
            {/* Top Utility Bar (Matching Storefront) */}
            <div className="bg-[#0B1F3B] py-2 text-[10px] font-semibold text-white/60 tracking-[0.15em] uppercase">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#3BAA35] rounded-full animate-pulse" />
                        SRDI — Don Mariano Marcos Memorial State University
                    </span>
                    <div className="hidden md:flex gap-8">
                        <span className="hover:text-white cursor-pointer transition-colors">Research Access</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Market Reports</span>
                    </div>
                </div>
            </div>

            {/* Main Navbar (White Theme - Matching Storefront) */}
            <nav className="bg-white sticky top-0 z-[100] shadow-sm border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3 group">
                            <ApplicationLogo className="h-9 w-auto text-[#3BAA35]" />
                            <span className="text-xl font-extrabold tracking-tight text-[#0B1F3B]">
                                D'SERI<span className="text-[#3BAA35]">CORE</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`text-sm font-semibold transition-all duration-300 py-1 border-b-2 ${
                                        activeTab === item.id
                                            ? 'text-[#3BAA35] border-[#3BAA35]'
                                            : 'text-slate-500 border-transparent hover:text-[#3BAA35] hover:border-[#3BAA35]'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Auth / User */}
                    <div className="hidden lg:flex items-center gap-5">
                        {auth.user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="flex items-center gap-3 bg-slate-50 pl-4 pr-3 py-2 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all group"
                                >
                                    <div className="w-8 h-8 bg-[#3BAA35] rounded-full flex items-center justify-center text-white text-[10px] font-black border-2 border-white">
                                        {auth.user.first_name?.[0]}{auth.user.last_name?.[0]}
                                    </div>
                                    <div className="text-left leading-none">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account</p>
                                        <p className="text-sm font-bold text-[#0B1F3B] truncate max-w-[100px]">{auth.user.first_name}</p>
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isUserDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-0" onClick={() => setIsUserDropdownOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-5 bg-slate-50 border-b border-slate-100">
                                                <p className="text-sm font-bold text-[#0B1F3B] truncate">{auth.user.first_name} {auth.user.last_name}</p>
                                                <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{auth.user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link href={route('customer.profile')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                                    <User size={18} className="text-slate-400" />
                                                    Profile
                                                </Link>
                                                <Link href={route('logout')} method="post" as="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                                                    <LogOut size={18} className="text-red-400" />
                                                    Sign Out
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href={route('products.all')} className="bg-[#3BAA35] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#329a2d] transition-all shadow-lg shadow-[#3BAA35]/20">
                                Marketplace
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2.5 bg-slate-50 rounded-xl text-[#0B1F3B] hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Navigation Overlay */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 top-[112px] z-[90] bg-white p-6 animate-in slide-in-from-top duration-300 overflow-y-auto">
                        <nav className="flex flex-col gap-2 mb-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`flex items-center justify-between p-5 rounded-2xl text-lg font-bold transition-all ${
                                        activeTab === item.id
                                            ? 'bg-slate-100 text-[#3BAA35]'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon size={22} className={activeTab === item.id ? 'text-[#3BAA35]' : 'text-slate-400'} />
                                        {item.label}
                                    </div>
                                    <ChevronDown size={18} className="-rotate-90 text-slate-300" />
                                </Link>
                            ))}
                        </nav>

                        {auth.user ? (
                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#3BAA35] rounded-full flex items-center justify-center text-white font-black border-2 border-white shadow-sm">
                                            {auth.user.first_name?.[0]}{auth.user.last_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-[#0B1F3B]">{auth.user.first_name} {auth.user.last_name}</p>
                                            <p className="text-xs text-slate-400 font-medium">Verified Account</p>
                                        </div>
                                    </div>
                                    <Link href={getDashboardRoute()} className="w-full mt-6 py-4 bg-[#0B1F3B] rounded-xl text-white text-sm font-bold uppercase tracking-widest text-center block shadow-lg shadow-[#0B1F3B]/10">
                                        GO TO DASHBOARD
                                    </Link>
                                </div>
                                <Link href={route('logout')} method="post" as="button" className="w-full p-5 border border-red-100 text-red-500 bg-red-50 rounded-[2rem] font-bold text-center">SIGN OUT</Link>
                            </div>
                        ) : (
                            <Link href={route('products.all')} className="block w-full text-center py-5 bg-[#3BAA35] text-white text-xl font-extrabold rounded-[2rem] shadow-lg shadow-[#3BAA35]/20 tracking-tight">MARKETPLACE</Link>
                        )}
                    </div>
                )}
            </nav>

            <main className="flex-1">
                {children}
            </main>
            <Chatbot />
        </div>
    );
}
