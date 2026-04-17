import { useState, useMemo, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

// ─── HELPERS ──────────────────────────────────────────────────────────────
function getInitials(first, last) {
    return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase() || '?';
}

function isRouteActive(href, currentUrl) {
    if (!href || href === '#') return false;
    try {
        const path = new URL(href).pathname;
        return currentUrl === path || currentUrl.startsWith(path + '/');
    } catch {
        return currentUrl === href || currentUrl.startsWith(href + '/');
    }
}

// ─── SIDEBAR ITEM ─────────────────────────────────────────────────────────
function SidebarItem({ item, currentUrl }) {
    const isActive = isRouteActive(item.href, currentUrl);
    return (
        <Link
            href={item.href ?? '#'}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
        >
            <svg className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="truncate">{item.name}</span>
        </Link>
    );
}

// ─── SIDEBAR GROUP (with children) ────────────────────────────────────────
function SidebarGroup({ item, currentUrl }) {
    const isChildActive = item.children?.some(c => isRouteActive(c.href, currentUrl));
    const [open, setOpen] = useState(isChildActive);

    return (
        <div className="mb-1 block">
            <button
                onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${isChildActive ? 'text-teal-800 bg-teal-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <svg className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isChildActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span>{item.name}</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="pl-11 pr-3 py-1 space-y-1">
                        {item.children.map(child => {
                            const active = child.href && child.href !== '#' && currentUrl.startsWith(child.href);
                            return (
                                <Link key={child.name} href={child.href ?? '#'}
                                    className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${active
                                        ? 'bg-teal-600 text-white shadow-sm font-bold'
                                        : 'text-slate-500 hover:bg-teal-50 hover:text-teal-700'
                                        }`}
                                >
                                    {child.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── NOTIFICATION PANEL ───────────────────────────────────────────────────
function NotificationPanel({ serverNotifs = [] }) {
    const [open, setOpen] = useState(false);
    const all = serverNotifs;
    const unread = all.filter(n => !n.read_at).length;

    return (
        <div className="relative flex-shrink-0">
            <button onClick={() => setOpen(v => !v)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-800">Notifications</span>
                        {unread > 0 && <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{unread} new</span>}
                    </div>
                    {all.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <svg className="w-8 h-8 text-slate-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-xs font-bold text-slate-400">No notifications</p>
                        </div>
                    ) : (
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                            {all.map((n, i) => (
                                <div key={i} className={`px-4 py-3 text-xs ${!n.read_at ? 'bg-teal-50/40' : ''}`}>
                                    <p className="font-bold text-slate-700">{n.data?.title ?? 'Notification'}</p>
                                    <p className="text-slate-400 mt-0.5">{n.data?.message ?? ''}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── USER MENU ────────────────────────────────────────────────────────────
function UserMenu({ user, fullName, roleInfo }) {
    const [open, setOpen] = useState(false);
    const initials = getInitials(user.first_name, user.last_name);
    const logout = () => router.post(route('logout'));

    return (
        <div className="relative flex-shrink-0">
            <button onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors group"
            >
                <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-teal-200 group-hover:shadow-teal-300 transition-shadow">
                        {initials}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${roleInfo.dot}`} />
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-black text-slate-800 leading-none">{fullName}</p>
                    <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${roleInfo.color.split(' ')[1]}`}>{roleInfo.label}</p>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-sm font-black text-slate-800">{fullName}</p>
                        <p className="text-xs text-slate-400 font-medium truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                        <Link href={route().has('staff.cashierprofile') ? route('staff.cashierprofile') : '#'}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Settings
                        </Link>
                        <button onClick={logout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────
export default function CashierStaffLayout({ children, header }) {
    const { auth, notifications = [] } = usePage().props;
    const user = auth.user;
    const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [now, setNow] = useState(new Date());
    const currentUrl = usePage().url;

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    const roleConfig = {
        7: { label: 'Cashier', color: 'text-teal-100 bg-teal-600', dot: 'bg-teal-400' },
    };
    const roleInfo = roleConfig[user.role_id] ?? { label: 'Staff', color: 'text-slate-100 bg-slate-500', dot: 'bg-slate-400' };

    const navigation = useMemo(() => [
        {
            name: 'Dashboard',
            href: route().has('staff.cashierdashboard') ? route('staff.cashierdashboard') : '#',
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        },
        { separator: 'Main' },
        {
            name: 'Point of Sale',
            icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
            children: [
                { name: 'Held Orders', href: route().has('staff.cashier.pos.held-orders') ? route('staff.cashier.pos.held-orders') : '#' },
                { name: 'Returns / Refunds', href: route().has('staff.cashier.pos.return-refund') ? route('staff.cashier.pos.return-refund') : '#' },
            ],
        },
        {
            name: 'Transactions',
            icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
            children: [
                { name: 'Receipt Reprint', href: '#' },
                { name: 'Void Requests', href: '#' },
            ],
        },
        {
            name: 'Customers',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v2h5M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            children: [
                { name: 'Customer List', href: route().has('staff.cashier.customer-list') ? route('staff.cashier.customer-list') : '#' },
                { name: 'Customer Purchases', href: route().has('staff.cashier.customer-purchases') ? route('staff.cashier.customer-purchases') : '#' },
            ],
        },
        {
            name: 'Cash Management',
            icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
            children: [
                { name: 'Open Cash Session', href: '#' },
                { name: 'Cash In / Cash Out', href: '#' },
                { name: 'Cash Count (End Shift)', href: '#' },
                { name: 'Remittance', href: '#' },
            ],
        },
        {
            name: 'Reports',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            children: [
                { name: 'Daily Sales Report', href: '#' },
                { name: 'Payment Method Summary', href: '#' },
                { name: 'Cashier Performance', href: '#' },
                { name: 'Void / Refund Report', href: '#' },
            ],
        },
        { separator: 'Settings' },
        {
            name: 'Settings',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
            children: [
                { name: 'Payment Methods', href: '#' },
                { name: 'Receipt Format', href: '#' },
                { name: 'POS Permissions', href: '#' },
            ],
        },
        { separator: 'Account' },
        {
            name: 'Profile',
            href: route().has('staff.cashierprofile') ? route('staff.cashierprofile') : '#',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        },
    ], []);

    const dayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let pageTitle = header || 'Cashier Panel';
    const activeItem = navigation.find(n =>
        !n.separator && (n.children
            ? n.children.some(c => c.href && c.href !== '#' && currentUrl.startsWith(c.href))
            : n.href && n.href !== '#' && currentUrl.startsWith(n.href))
    );
    if (activeItem) pageTitle = activeItem.name;

    return (
        <div className="flex h-screen bg-slate-50 font-sans antialiased">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-[268px] bg-white border-r border-slate-100 shadow-xl shadow-slate-200/60 flex flex-col transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shrink-0`}>

                {/* Logo */}
                <div className="px-5 pt-6 pb-5 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 flex-shrink-0">
                            <ApplicationLogo size="xs" className="!w-8 !h-8" />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-800 leading-none tracking-tight">D'SERICORE</p>
                            <p className="text-[9px] font-bold text-teal-500 uppercase tracking-widest mt-0.5">Cashier POS</p>
                        </div>
                    </Link>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto pb-4 pt-1 min-h-0">
                    <div className="px-3 mb-2">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">Navigation</span>
                    </div>
                    {navigation.map((item, index) =>
                        item.separator ? (
                            <div key={index} className="pt-5 pb-2 px-3">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wide">{item.separator}</span>
                            </div>
                        ) : item.children ? (
                            <SidebarGroup key={item.name} item={item} currentUrl={currentUrl} />
                        ) : (
                            <SidebarItem key={item.name} item={item} currentUrl={currentUrl} />
                        )
                    )}
                </nav>

                {/* Sidebar Footer – User card */}
                <div className="px-4 pb-5 flex-shrink-0">
                    <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-4 text-white">
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
                        <div className="relative flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-base flex-shrink-0">
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black leading-tight truncate">{fullName}</p>
                                <span className="inline-flex mt-1 items-center gap-1 bg-white/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-200" />
                                    {roleInfo.label}
                                </span>
                            </div>
                        </div>
                        <div className="relative mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-teal-100">POS Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* ── TOP NAVBAR ── */}
                <header className="flex-shrink-0 h-[70px] bg-white border-b border-slate-100 shadow-sm flex items-center gap-4 px-4 md:px-6 z-30">

                    {/* Hamburger */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0"
                        aria-label="Open menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Breadcrumb title */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
                            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h1 className="text-sm font-black text-slate-700 truncate">{pageTitle}</h1>
                    </div>

                    <div className="flex-1" />

                    {/* Clock */}
                    <div className="hidden xl:flex flex-col items-end flex-shrink-0">
                        <span className="text-sm font-black text-slate-800 leading-none">{timeStr}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5">{dayStr}</span>
                    </div>
                    <div className="hidden xl:block h-8 w-px bg-slate-100 flex-shrink-0" />

                    {/* Notification Bell */}
                    <NotificationPanel serverNotifs={notifications} />

                    <div className="h-8 w-px bg-slate-100 flex-shrink-0" />

                    {/* User Menu */}
                    <UserMenu user={user} fullName={fullName} roleInfo={roleInfo} />
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="w-full px-4 lg:px-6 py-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Scrollbar styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                ::-webkit-scrollbar { width: 5px; height: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #2dd4bf; }
            ` }} />
        </div>
    );
}
