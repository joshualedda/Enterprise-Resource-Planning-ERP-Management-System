import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// TINY HELPERS
// ---------------------------------------------------------------------------
function useOutsideClick(ref, handler) {
    useEffect(() => {
        const listener = (e) => { if (!ref.current || ref.current.contains(e.target)) return; handler(); };
        document.addEventListener('mousedown', listener);
        return () => document.removeEventListener('mousedown', listener);
    }, [ref, handler]);
}

const roleConfig = {
    1: { label: 'Administrator', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-600' },
    2: { label: 'Staff Member', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    3: { label: 'Customer', color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
};

function getInitials(first, last) {
    return `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}` || '?';
}

function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
    return now;
}

// ---------------------------------------------------------------------------
// NOTIFICATION PANEL (self-contained)
// ---------------------------------------------------------------------------
const sampleNotifs = [
    { id: 1, icon: '📦', title: 'New order placed', body: 'Order SRDI-2026-AB12 is waiting.', time: '2m ago', unread: true },
    { id: 2, icon: '⚠️', title: 'Low stock alert', body: 'Raw Silk Thread is below 10 units.', time: '18m ago', unread: true },
    { id: 3, icon: '✅', title: 'Order marked received', body: 'Order SRDI-2026-XF77 completed.', time: '1h ago', unread: false },
    { id: 4, icon: '👤', title: 'New customer registered', body: 'Maria Santos joined.', time: '3h ago', unread: false },
];

function NotificationPanel({ serverNotifs = [] }) {
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState(serverNotifs.length ? serverNotifs : sampleNotifs);
    const ref = useRef(null);
    useOutsideClick(ref, () => setOpen(false));

    const unread = notifs.filter(n => n.unread).length;

    const markAll = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));
    const dismiss = (id) => setNotifs(n => n.filter(x => x.id !== id));

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${open ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                aria-label="Notifications"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h4" />
                </svg>
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow">
                        {unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/80">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-800 uppercase tracking-wider">Notifications</span>
                            {unread > 0 && (
                                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unread} new</span>
                            )}
                        </div>
                        {unread > 0 && (
                            <button onClick={markAll} className="text-[10px] font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-wider transition-colors">
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifs.map(n => (
                            <div key={n.id} className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group ${n.unread ? 'bg-emerald-50/30' : ''}`}>
                                <div className="text-xl flex-shrink-0 mt-0.5">{n.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-black text-slate-800 leading-tight truncate">{n.title}</p>
                                        {n.unread && <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">{n.body}</p>
                                    <p className="text-[10px] text-slate-300 font-bold mt-1 uppercase tracking-wider">{n.time}</p>
                                </div>
                                <button
                                    onClick={() => dismiss(n.id)}
                                    className="flex-shrink-0 p-1 text-slate-200 hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {notifs.length === 0 && (
                            <div className="py-12 text-center">
                                <div className="text-3xl mb-2">🔔</div>
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">All caught up!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100">
                        <button className="w-full text-center text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider transition-colors">
                            View All Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// USER MENU (self-contained)
// ---------------------------------------------------------------------------
function UserMenu({ user, fullName, roleInfo }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutsideClick(ref, () => setOpen(false));

    const initials = getInitials(user.first_name, user.last_name);

    const logout = () => router.post(route('logout'));

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-all focus:outline-none group"
            >
                {/* Avatar */}
                <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
                        {initials}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${roleInfo.dot}`} />
                </div>
                {/* Name + Role */}
                <div className="text-left hidden lg:block">
                    <p className="text-xs font-black text-slate-800 leading-tight">{fullName}</p>
                    <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${roleInfo.color.split(' ')[1]}`}>{roleInfo.label}</p>
                </div>
                {/* Chevron */}
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden lg:block ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Profile header */}
                    <div className="px-5 py-4 bg-gradient-to-br from-emerald-600 to-green-800 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl">
                                {initials}
                            </div>
                            <div>
                                <p className="font-black text-sm leading-tight">{fullName}</p>
                                <p className="text-[10px] text-emerald-200 font-bold mt-0.5">{user.email}</p>
                                <span className="mt-1.5 inline-flex px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-wider">
                                    {roleInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="py-2 px-2">
                        {[
                            { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'My Profile', href: route('profile.edit') },
                        ].map(item => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all text-sm font-bold group"
                            >
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 py-2 px-2">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all text-sm font-bold group"
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

// ---------------------------------------------------------------------------
// MAIN LAYOUT
// ---------------------------------------------------------------------------
export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const now = useClock();

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'User';
    const roleInfo = roleConfig[user.role_id] || { label: 'User', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };

    const notifications = usePage().props.notifications || [];

    // Build Navigation based on role
    const navigation = useMemo(() => {
        const dashboardHref = user.role_id === 3 ? (route().has('customer.dashboard') ? route('customer.dashboard') : '#') : route('dashboard');
        const dashboardCurrent = user.role_id === 3 ? route().current('customer.dashboard') : route().current('dashboard');

        const items = [
            { name: 'Dashboard', href: dashboardHref, current: dashboardCurrent, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        ];

        if (user.role_id === 1) {
            items.push(
                { name: 'Products', href: route('admin.products.index'), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', current: route().current('admin.products.*') },
                { name: 'Orders', href: route().has('admin.orders.index') ? route('admin.orders.index') : '#', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', current: route().current('admin.orders.*') },
                { name: 'Reports', href: route().has('admin.reports') ? route('admin.reports') : '#', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0_1-2-2z', current: route().current('admin.reports') },
                { separator: 'Inventory Management' },
                { name: 'Inventory', href: route().has('admin.inventory.index') ? route('admin.inventory.index') : '#', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', current: route().current('admin.inventory.*') },
                { separator: 'Users Management' },
                { name: 'Users', href: route('admin.users.index'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', current: route().current('admin.users.*') },
                { name: 'Profile', href: route('profile.edit'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', current: route().current('profile.edit') },
            );
        } else if (user.role_id === 2) {
            items.push(
                { name: 'Orders', href: route().has('staff.orders.index') ? route('staff.orders.index') : '#', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', current: route().current('staff.orders.*') },
                { name: 'Inventory', href: route().has('inventory.index') ? route('inventory.index') : '#', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', current: route().current('inventory.*') },
                { name: 'Tasks', href: route().has('tasks.index') ? route('tasks.index') : '#', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', current: route().current('tasks.*') },
            );
        } else if (user.role_id === 3) {
            items.push(
                { name: 'My Orders', href: route().has('orders.index') ? route('orders.index') : '#', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', current: route().current('orders.*') },
                { name: 'Browse Products', href: route().has('customer.products') ? route('customer.products') : '#', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', current: route().current('customer.products') },
                { name: 'Profile', href: route('profile.edit'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', current: route().current('profile.edit') },
            );
        }
        return items;
    }, [user.role_id]);

    const dayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Dynamic breadcrumb: use the active nav item's name, fall back to the header prop
    const activeNavItem = navigation.find(item => !item.separator && item.current);
    const pageTitle = activeNavItem?.name || header || 'Dashboard';

    return (
        <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-[268px] bg-white border-r border-slate-100 shadow-xl shadow-slate-200/60 flex flex-col transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>

                {/* Logo area */}
                <div className="px-5 pt-6 pb-5">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 flex-shrink-0">
                            <ApplicationLogo size="xs" className="!w-8 !h-8" />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-800 leading-none tracking-tight">D'SERICORE</p>
                        </div>
                    </Link>
                </div>

                {/* Nav section label */}
                <div className="px-7 mb-2">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">Navigation</span>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto pb-4">
                    {navigation.map((item, index) =>
                        item.separator ? (
                            <div key={index} className="pt-5 pb-2 px-3">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">{item.separator}</span>
                            </div>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group ${item.current
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-emerald-50/60 hover:text-emerald-700'
                                    }`}
                            >
                                <svg className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${item.current ? 'text-emerald-200' : 'text-slate-400 group-hover:text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                <span className="truncate">{item.name}</span>
                                {item.current && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0" />}
                            </Link>
                        )
                    )}
                </nav>

                {/* Sidebar Footer – User card */}
                <div className="px-4 pb-5">
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-green-800 rounded-2xl p-4 text-white">
                        {/* decorative blob */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

                        <div className="relative flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-base flex-shrink-0">
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black leading-tight truncate">{fullName}</p>
                                <span className="inline-flex mt-1 items-center gap-1 bg-white/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    {roleInfo.label}
                                </span>
                            </div>
                        </div>

                        <div className="relative mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-200">System Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* ── TOP NAVBAR ── */}
                <header className="flex-shrink-0 h-[70px] bg-white border-b border-slate-100 shadow-sm flex items-center gap-4 px-4 md:px-6 z-30">

                    {/* Hamburger (mobile) */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0"
                        aria-label="Open menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Page title breadcrumb */}
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

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Clock (desktop) */}
                    <div className="hidden xl:flex flex-col items-end flex-shrink-0">
                        <span className="text-sm font-black text-slate-800 leading-none">{timeStr}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5">{dayStr}</span>
                    </div>

                    {/* Divider */}
                    <div className="hidden xl:block h-8 w-px bg-slate-100 flex-shrink-0" />

                    {/* Notification Bell */}
                    <NotificationPanel serverNotifs={notifications} />

                    {/* Divider */}
                    <div className="h-8 w-px bg-slate-100 flex-shrink-0" />

                    {/* User Menu */}
                    <UserMenu user={user} fullName={fullName} roleInfo={roleInfo} />
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
                    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-full">
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
                ::-webkit-scrollbar-thumb:hover { background: #c7d2df; }
            ` }} />
        </div>
    );
}