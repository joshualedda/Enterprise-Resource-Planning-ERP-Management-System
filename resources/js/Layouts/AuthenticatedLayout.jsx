import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';

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
    2: { label: 'Staff Member',  color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500'   },
    3: { label: 'Customer',      color: 'bg-teal-100 text-teal-700',       dot: 'bg-teal-500'   },
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
// RECEIPT REJECTED MODAL
// ---------------------------------------------------------------------------
function ReceiptRejectedModal({ notif, onClose }) {
    if (!notif) return null;
    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-rose-50 border-b border-rose-100 px-5 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-lg shrink-0">❌</div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-rose-700 text-sm leading-tight">{notif.title}</p>
                        <p className="text-[10px] text-rose-400 font-bold mt-0.5">
                            {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Just now'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center text-rose-500 font-black text-sm transition-colors shrink-0"
                    >✕</button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed">{notif.body}</p>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-1">What to do next</p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Please place a new order and make sure to upload a <strong>clear and valid</strong> payment receipt.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-500 hover:bg-slate-50 transition-colors"
                        >Close</button>
                        <Link
                            href={notif.url || '#'}
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black text-center transition-colors"
                        >View My Orders</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// NOTIFICATION PANEL
// ---------------------------------------------------------------------------
function NotificationPanel({ serverNotifs = [], user }) {
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState(serverNotifs);
    const [rejectedNotif, setRejectedNotif] = useState(null);
    const ref = useRef(null);

    useOutsideClick(ref, () => setOpen(false));
    useEffect(() => { setNotifs(serverNotifs); }, [serverNotifs]);

    const unreadCount = notifs.filter(n => !!n.unread).length;

    // ✅ Use axios so no Inertia navigation happens — state stays intact
    const markReadSilent = (notif) => {
        axios.patch(route('notifications.markRead', notif.id))
            .then(() => {
                setNotifs(prev => prev.map(x => x.id === notif.id ? { ...x, unread: false } : x));
            })
            .catch(() => {/* fail silently */});
    };

const handleNotifClick = (notif) => {
    console.log('NOTIF CLICKED:', notif); // ← add this
    setOpen(false);
    markReadSilent(notif);

    if (notif.type === 'receipt_rejected') {
        setRejectedNotif(notif);
        return;
    }

    if (notif.url) {
        window.location.href = notif.url;
    }
};

    const markAllRead = (e) => {
        e.stopPropagation();
        axios.post(route('notifications.markAllRead'))
            .then(() => { setNotifs(n => n.map(x => ({ ...x, unread: false }))); })
            .catch(() => {});
    };

    const viewAllHref = user?.role_id === 1
        ? route('admin.orders.index')
        : route('customer.orders.index');

    return (
        <>
            <ReceiptRejectedModal
                notif={rejectedNotif}
                onClose={() => setRejectedNotif(null)}
            />

            <div ref={ref} className="relative flex items-center justify-center">
                <button
                    onClick={() => setOpen(!open)}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                        open ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'text-slate-400 hover:bg-slate-50 border-transparent'
                    } border focus:outline-none group`}
                >
                    <svg className={`w-5 h-5 ${open ? '' : 'group-hover:rotate-12'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1.5 items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm ring-1 ring-rose-200">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {open && (
                    <div className="absolute right-0 top-[calc(100%+12px)] w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                            <span className="font-black text-[11px] text-slate-500 uppercase tracking-wider">Notifications</span>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[10px] text-emerald-600 font-black hover:text-emerald-700 transition-colors uppercase">
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50">
                            {notifs.length > 0 ? notifs.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotifClick(n)}
                                    className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-slate-50/80 ${n.unread ? 'bg-emerald-50/30' : ''}`}
                                >
                                    <div className="flex-shrink-0 text-xl bg-white w-10 h-10 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                                        {n.icon || '📦'}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-xs font-black text-slate-800 leading-snug">{n.title}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-normal line-clamp-2">{n.body}</p>
                                        {n.type === 'receipt_rejected' && (
                                            <p className="text-[10px] text-rose-500 font-black mt-1 uppercase tracking-wide">
                                                Tap to see full reason →
                                            </p>
                                        )}
                                        <p className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-tight">
                                            {n.created_at ? new Date(n.created_at).toLocaleString() : 'Just now'}
                                        </p>
                                    </div>
                                    {!!n.unread && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />}
                                </div>
                            )) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-3">📭</div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No new notifications</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/30 text-center">
                            <Link href={viewAllHref} className="text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest block py-1">
                                View All Orders Activity
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// USER MENU
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
                <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
                        {initials}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${roleInfo.dot}`} />
                </div>
                <div className="text-left hidden lg:block">
                    <p className="text-xs font-black text-slate-800 leading-tight">{fullName}</p>
                    <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${roleInfo.color.split(' ')[1]}`}>{roleInfo.label}</p>
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden lg:block ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 bg-gradient-to-br from-emerald-600 to-green-800 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl">{initials}</div>
                            <div>
                                <p className="font-black text-sm leading-tight">{fullName}</p>
                                <p className="text-[10px] text-emerald-200 font-bold mt-0.5">{user.email}</p>
                                <span className="mt-1.5 inline-flex px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-wider">{roleInfo.label}</span>
                            </div>
                        </div>
                    </div>
                    <div className="py-2 px-2">
                        <Link href={route('profile.edit')} onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all text-sm font-bold group">
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                        </Link>
                    </div>
                    <div className="border-t border-slate-100 py-2 px-2">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all text-sm font-bold">
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
// ROUTE HELPERS & SIDEBAR COMPONENTS
// ---------------------------------------------------------------------------
function isRouteActive(href, currentUrl) {
    if (!href || href === '#') return false;
    try {
        const targetPath = new URL(href).pathname;
        return currentUrl === targetPath || currentUrl.startsWith(targetPath + '/');
    } catch { return false; }
}

function SidebarGroup({ item, currentUrl, isCollapsed }) {
    const isActive = item.children?.some(child => isRouteActive(child.href, currentUrl));
    const [open, setOpen] = useState(isActive);

    if (isCollapsed) {
        return (
            <div className="mb-1 block group/tooltip relative">
                <button className={`w-full flex items-center justify-center py-2.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                    <svg className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                </button>
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50">{item.name}</div>
            </div>
        );
    }

    return (
        <div className="mb-1 block">
            <button onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive ? 'text-emerald-800 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <div className="flex items-center gap-3">
                    <svg className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        {item.children?.map(child => {
                            const isChildActive = isRouteActive(child.href, currentUrl);
                            return (
                                <Link key={child.name} href={child.href}
                                    className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${isChildActive ? 'bg-emerald-600 text-white shadow-sm font-bold' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}>
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

function SidebarItem({ item, currentUrl, isCollapsed }) {
    const isActive = isRouteActive(item.href, currentUrl);

    if (isCollapsed) {
        return (
            <Link href={item.href}
                className={`flex items-center justify-center py-2.5 rounded-xl transition-all duration-200 group/tooltip relative mb-1 ${isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <svg className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-200' : 'text-slate-400 group-hover:text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50">{item.name}</div>
                {item.badge && !isActive && <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />}
            </Link>
        );
    }

    return (
        <Link href={item.href}
            className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 group mb-1 ${isActive ? 'bg-emerald-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
            <svg className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-emerald-200' : 'text-slate-400 group-hover:text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="truncate flex-1">{item.name}</span>
            {item.badge && (
                <span className={`flex-shrink-0 ml-auto inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

// ---------------------------------------------------------------------------
// MAIN LAYOUT
// ---------------------------------------------------------------------------
export default function AuthenticatedLayout({ header, children }) {
    const { url: currentUrl, props } = usePage();
    const { auth } = props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const now = useClock();

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'User';
    const roleInfo = roleConfig[user.role_id] || { label: 'User', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
    const notifications = props.auth.notifications || [];

    const navigation = useMemo(() => {
        const pendingOrders = props.pendingOrdersCount || null;
        const items = [];

        if (user.role_id === 1) {
            items.push(
                { separator: 'Navigation' },
                { name: 'Dashboard',  href: route().has('admin.dashboard')       ? route('admin.dashboard')       : '#', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { name: 'Products',   href: route().has('admin.products.index')  ? route('admin.products.index')  : '#', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                { name: 'Orders',     href: route().has('admin.orders.index')    ? route('admin.orders.index')    : '#', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', badge: pendingOrders },
                { name: 'Reports',    href: route().has('admin.reports')         ? route('admin.reports')         : '#', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { separator: 'Inventory' },
                { name: 'Inventory',  href: route().has('admin.inventory.index') ? route('admin.inventory.index') : '#', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                { separator: 'Users' },
                { name: 'Users',      href: route().has('admin.users.index')     ? route('admin.users.index')     : '#', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
                { name: 'Profile',    href: route('profile.edit'),                icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            );
        } else if (user.role_id === 3) {
            items.push(
                { name: 'Dashboard',       href: route().has('customer.dashboard')    ? route('customer.dashboard')    : '#', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { name: 'My Orders',       href: route().has('customer.orders.index') ? route('customer.orders.index') : '#', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                { name: 'Browse Products', href: route().has('products.all')     ? route('products.all')     : '#', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
                { name: 'Profile',         href: route('profile.edit'),                icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            );
        } else if (user.role_id === 4) {
            items.push(
                { name: 'Dashboard', href: route().has('staff.inventory.dashboard') ? route('staff.inventory.dashboard') : '#', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            );
        }

        return items;
    }, [user.role_id, props.pendingOrdersCount]);

    const dayStr  = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const pageTitle = header || 'Dashboard';

    return (
        <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 shadow-xl shadow-slate-200/60 flex flex-col transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 ${sidebarCollapsed ? 'w-[88px]' : 'w-[268px]'}`}>
                <div className={`pt-6 pb-5 flex items-center ${sidebarCollapsed ? 'justify-center px-4' : 'px-5 gap-2.5'}`}>
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 flex-shrink-0"><ApplicationLogo size="xs" className="!w-8 !h-8" /></div>
                        {!sidebarCollapsed && (
                            <div>
                                <p className="text-base font-black text-slate-800 leading-none tracking-tight">D'SERICORE</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: user.role_id === 1 ? '#818cf8' : user.role_id === 3 ? '#2dd4bf' : '#60a5fa' }}>
                                    {user.role_id === 1 ? 'Administration' : user.role_id === 3 ? 'Customer Portal' : 'Staff Panel'}
                                </p>
                            </div>
                        )}
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto pb-4 pt-1">
                    {navigation.map((item, index) =>
                        item.separator ? (
                            <div key={index} className={`pt-6 pb-3 ${sidebarCollapsed ? 'px-1 text-center' : 'px-3'}`}>
                                <span className={`font-black text-slate-400 uppercase tracking-widest ${sidebarCollapsed ? 'text-[8px]' : 'text-[10px]'}`}>
                                    {sidebarCollapsed ? '• • •' : item.separator}
                                </span>
                            </div>
                        ) : item.children ? (
                            <SidebarGroup key={item.name} item={item} currentUrl={currentUrl} isCollapsed={sidebarCollapsed} />
                        ) : (
                            <SidebarItem key={item.name} item={item} currentUrl={currentUrl} isCollapsed={sidebarCollapsed} />
                        )
                    )}
                </nav>

                <div className={`px-4 pb-5 transition-all ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-green-800 rounded-2xl p-3.5 text-white flex items-center justify-between">
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
                        <div className="relative flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm flex-shrink-0">
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                            <div className="min-w-0 pr-2">
                                <p className="text-xs font-black leading-tight truncate">{fullName}</p>
                                <span className="inline-flex mt-0.5 text-[9px] font-black uppercase text-emerald-100 tracking-wider truncate">{roleInfo.label}</span>
                            </div>
                        </div>
                        <Link href={route('profile.edit')} className="relative z-10 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="flex-shrink-0 h-[70px] bg-white border-b border-slate-100 shadow-sm flex items-center gap-4 px-4 md:px-6 z-50">
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 border border-slate-100 transition-colors flex-shrink-0 focus:outline-none">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={sidebarCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h8m-8 6h16"} />
                        </svg>
                    </button>
                    <button onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100 transition-colors flex-shrink-0 focus:outline-none">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2 min-w-0">
                        <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h1 className="text-sm font-black text-slate-700 truncate tracking-tight">{pageTitle}</h1>
                    </div>

                    <div className="flex-1" />

                    <div className="hidden xl:flex flex-col items-end justify-center flex-shrink-0">
                        <span className="text-[13px] font-black text-slate-800 leading-none">{timeStr}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{dayStr}</span>
                    </div>
                    <div className="hidden xl:block h-8 w-px bg-slate-100 flex-shrink-0 mx-1" />

                    <div className="flex items-center justify-center">
                        <NotificationPanel serverNotifs={notifications} user={user} />
                    </div>

                    <div className="h-8 w-px bg-slate-100 flex-shrink-0 mx-1" />

                    <div className="flex items-center pl-1">
                        <UserMenu user={user} fullName={fullName} roleInfo={roleInfo} />
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth bg-[#F8FAFC]">
                    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-full">
                        {header && <div className="mb-6">{header}</div>}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</div>
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                ::-webkit-scrollbar { width: 5px; height: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #c7d2df; }
            ` }} />
        </div>
    );
}