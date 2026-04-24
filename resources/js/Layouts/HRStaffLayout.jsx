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
    2: { label: 'Human Resources', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-600' },
};

function getInitials(first, last) {
    return `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}` || '?';
}

function isRouteActive(href, currentPath) {
    if (!href || href === '#') return false;
    try {
        const urlObj = new URL(href, window.location.origin);
        return urlObj.pathname === currentPath.split('?')[0];
    } catch {
        return false;
    }
}

function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
    return now;
}

// ---------------------------------------------------------------------------
// NOTIFICATION PANEL
// ---------------------------------------------------------------------------
const sampleNotifs = [
    { id: 1, icon: '📋', title: 'New Leave Request', body: 'Juan Dela Cruz submitted a leave request.', time: '5m ago', unread: true },
    { id: 2, icon: '👤', title: 'Employee Onboarding', body: 'New employee setup for Maria Santos.', time: '15m ago', unread: true },
    { id: 3, icon: '📅', title: 'Training Reminder', body: 'Annual safety training starts tomorrow.', time: '1h ago', unread: false },
    { id: 4, icon: '📄', title: 'Document Updated', body: 'Company policy handbook v2.1 uploaded.', time: '3h ago', unread: false },
];

function NotificationPanel({ serverNotifs = [] }) {
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState(serverNotifs.length ? serverNotifs : sampleNotifs);
    const ref = useRef(null);
    useOutsideClick(ref, () => setOpen(false));

    const unread = notifs.filter(n => n.unread).length;
    const markAll = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(v => !v)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-white" />
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden animated-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-800">HR Notifications</span>
                        {unread > 0 && (
                            <button onClick={markAll} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition">
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifs.map(n => (
                            <div key={n.id} className={`px-4 py-3 flex gap-3 items-start ${n.unread ? 'bg-indigo-50/40' : ''}`}>
                                <span className="text-lg mt-0.5">{n.icon}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-700">{n.title}</p>
                                    <p className="text-[11px] text-slate-400 truncate">{n.body}</p>
                                    <span className="text-[10px] text-slate-300 font-medium">{n.time}</span>
                                </div>
                                {n.unread && <span className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// USER MENU
// ---------------------------------------------------------------------------
function UserMenu({ user }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutsideClick(ref, () => setOpen(false));

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    const initials = getInitials(user.first_name, user.last_name);
    const role = roleConfig[user.role_id] || { label: 'Staff', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
    const logout = () => router.post(route('logout'));

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors group"
            >
                <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                        {initials}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${role.dot}`} />
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-700 leading-none">{fullName}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{role.label}</p>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden animated-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-sm font-bold text-slate-800">{fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                        <Link href={route().has('staff.profile') ? route('staff.profile') : '#'}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Settings
                        </Link>
                        <button onClick={logout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
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
// SIDEBAR COMPONENTS
// ---------------------------------------------------------------------------
function SidebarGroup({ item, currentUrl }) {
    const isActive = item.children.some(child => isRouteActive(child.href, currentUrl));
    const [open, setOpen] = useState(isActive);

    return (
        <div className="mb-1 block">
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive ? 'text-indigo-800 bg-indigo-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <svg className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            const isChildActive = isRouteActive(child.href, currentUrl);
                            return (
                                <Link
                                    key={child.name}
                                    href={child.href}
                                    className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${isChildActive
                                        ? 'bg-indigo-600 text-white shadow-sm font-bold'
                                        : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
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

function SidebarItem({ item, currentUrl }) {
    const isActive = isRouteActive(item.href, currentUrl);
    return (
        <Link
            href={item.href || '#'}
            className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-indigo-50 text-indigo-800'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
        >
            <svg className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span>{item.name}</span>
        </Link>
    );
}

// ---------------------------------------------------------------------------
// MAIN LAYOUT
// ---------------------------------------------------------------------------
export default function HRStaffLayout({ children }) {
    const page = usePage();
    const user = page.props.auth.user;
    const currentUrl = page.url;
    const now = useClock();

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    const role = roleConfig[user.role_id] || { label: 'HR Staff', color: 'bg-indigo-100 text-indigo-600', dot: 'bg-indigo-400' };

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = useMemo(() => [
        {
            name: 'Dashboard',
            href: route().has('staff.hr.dashboard') ? route('staff.hr.dashboard') : '#',
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        },
        { separator: 'Management' },
        {
            name: 'Employees',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            href: route().has('staff.hr.employees') ? route('staff.hr.employees') : '#',
        },
        {
            name: 'Data Management',
            icon: 'M4 6h16M4 12h16M4 18h7',
            children: [
                { name: 'Employee Status', href: route().has('staff.hr.emp-status') ? route('staff.hr.emp-status') : '#' },
                { name: 'Civil Status', href: route().has('staff.hr.civil-status') ? route('staff.hr.civil-status') : '#' },
                { name: 'Department', href: route().has('staff.hr.department') ? route('staff.hr.department') : '#' },
                { name: 'Position', href: route().has('staff.hr.position') ? route('staff.hr.position') : '#' },
            ],
        },
        { separator: 'Account' },
        {
            name: 'Accounts',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            href: route().has('staff.hr.accounts') ? route('staff.hr.accounts') : '#',
        },
        {
            name: 'Profile',
            href: route().has('staff.hr.profile') ? route('staff.hr.profile') : '#',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        },
    ], []);

    const dayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let pageTitle = 'Human Resources';
    const activeItem = navigation.find(n =>
        !n.separator && (n.children
            ? n.children.some(c => isRouteActive(c.href, currentUrl))
            : isRouteActive(n.href, currentUrl))
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
                            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Human Resources</p>
                        </div>
                    </Link>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto pb-4 pt-1 min-h-0">
                    <div className="px-3 mb-2">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">Management</span>
                    </div>
                    {navigation.map((item, idx) =>
                        item.separator ? (
                            <div key={idx} className="pt-5 pb-2 px-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.separator}</span>
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
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-4 text-white">
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
                        <div className="relative flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-base flex-shrink-0">
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black leading-tight truncate">{fullName}</p>
                                <span className="inline-flex mt-1 items-center gap-1 bg-white/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                                    {role.label}
                                </span>
                            </div>
                        </div>
                        <div className="relative mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-100">HR Portal</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Navbar */}
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
                    <NotificationPanel />

                    <div className="h-8 w-px bg-slate-100 flex-shrink-0" />

                    {/* User Menu */}
                    <UserMenu user={user} />
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
                ::-webkit-scrollbar-thumb:hover { background: #6366f1; }
            ` }} />
        </div>
    );
}
