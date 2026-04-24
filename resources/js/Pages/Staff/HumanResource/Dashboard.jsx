import HRStaffLayout from '@/Layouts/HRStaffLayout';
import { Head } from '@inertiajs/react';

export default function HRDashboard({ stats = {}, departmentHeadcount = [], leaveRequests = [] }) {
    // Map icons and colors for department headcount
    const deptColors = [
        'text-indigo-600 bg-indigo-50',
        'text-rose-600 bg-rose-50',
        'text-emerald-600 bg-emerald-50',
        'text-cyan-600 bg-cyan-50',
        'text-amber-600 bg-amber-50',
        'text-violet-600 bg-violet-50',
    ];

    return (
        <HRStaffLayout>
            <Head title="Human Resources Dashboard" />

            <div className="space-y-6">

                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Human Resources Dashboard</h1>
                    <p className="text-sm text-slate-400 font-medium mt-0.5">Workforce overview, employee activities, and departmental metrics</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {[
                        { 
                            label: 'Total Employees',    
                            value: stats?.totalEmployees || 0,      
                            delta: 'Active workforce',  
                            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', 
                            iconBg: 'bg-indigo-50 text-indigo-600', 
                            badge: 'bg-indigo-50 text-indigo-600' 
                        },
                        { 
                            label: 'Active Now',         
                            value: stats?.activeEmployees || 0,      
                            delta: 'System status',     
                            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',                                                                                                                                                                    
                            iconBg: 'bg-emerald-50 text-emerald-600', 
                            badge: 'bg-emerald-50 text-emerald-600' 
                        },
                        { 
                            label: 'Pending Leaves',     
                            value: stats?.pendingLeaves || 0,       
                            delta: 'Needs approval',    
                            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',                                                                                                                           
                            iconBg: 'bg-amber-50 text-amber-500',   
                            badge: 'bg-amber-50 text-amber-500' 
                        },
                        { 
                            label: 'New Hires',          
                            value: stats?.newHires || 0,        
                            delta: 'Last 30 days',        
                            icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',                                                                                                                               
                            iconBg: 'bg-cyan-50 text-cyan-600',     
                            badge: 'bg-cyan-50 text-cyan-600' 
                        },
                    ].map(k => (
                        <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${k.iconBg}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={k.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 leading-none">{k.value}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{k.label}</p>
                                <span className={`mt-1.5 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${k.badge}`}>
                                    {k.delta}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Recent Activities & Leave Requests */}
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📝 Leave Requests & Activities</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Recent employee requests needing attention</p>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">Manage All →</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100">
                                        {['Employee', 'Type', 'Date/Period', 'Status'].map(h => (
                                            <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {leaveRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs font-medium italic">No pending requests</td>
                                        </tr>
                                    ) : leaveRequests.map((c, i) => (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 text-sm font-bold text-slate-700">{c.employee_name}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{c.type}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-400">{c.start_date} – {c.end_date}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                                                    c.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'
                                                }`}>{c.status.toUpperCase()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Department Headcount Summary */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">🏢 Headcount by Department</h2>
                        <div className="grid grid-cols-1 gap-2.5">
                            {departmentHeadcount.length === 0 ? (
                                <p className="text-xs text-slate-400 font-medium italic p-4 text-center">No departments defined</p>
                            ) : departmentHeadcount.map((s, idx) => (
                                <div key={s.name} className={`flex items-center justify-between p-3.5 rounded-xl ${deptColors[idx % deptColors.length].split(' ')[1]}`}>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{s.name}</p>
                                        <p className={`text-lg font-black ${deptColors[idx % deptColors.length].split(' ')[0]} leading-none mt-0.5`}>{s.count}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                                        <span className={`text-[10px] font-black ${deptColors[idx % deptColors.length].split(' ')[0]}`}>{Math.round((s.count / stats.totalEmployees) * 100 || 0)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">🎉 Upcoming Events & Anniversaries</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: 'Elena Gomez',   event: 'Birthday',        date: 'Tomorrow',      color: 'bg-rose-50 text-rose-600',   icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                            { name: 'Mark Bautista', event: '3rd Anniversary', date: 'In 3 days',     color: 'bg-indigo-50 text-indigo-600', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                            { name: 'Sarah Lee',     event: 'Birthday',        date: 'Next week',     color: 'bg-rose-50 text-rose-600',   icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                            { name: 'David Lim',     event: '1st Anniversary', date: 'Next week',     color: 'bg-indigo-50 text-indigo-600', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                        ].map((e, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${e.color}`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={e.icon} />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-700 truncate">{e.name}</p>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{e.event}</p>
                                        <span className="text-[10px] font-black text-slate-800 whitespace-nowrap">{e.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </HRStaffLayout>
    );
}
