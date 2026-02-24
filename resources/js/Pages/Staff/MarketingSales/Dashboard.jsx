import MarketingSalesStaffLayout from '@/Layouts/MarketingSalesStaffLayout';
import { Head } from '@inertiajs/react';

export default function MarketingSalesDashboard() {
    return (
        <MarketingSalesStaffLayout>
            <Head title="Marketing & Sales Dashboard" />

            <div className="space-y-6">

                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketing & Sales Dashboard</h1>
                    <p className="text-sm text-slate-400 font-medium mt-0.5">Campaign performance, customer growth & promotions overview</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    {[
                        { label: 'Active Campaigns',  value: '4',       delta: '2 launching soon',  icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', iconBg: 'bg-rose-50 text-rose-600',    badge: 'bg-rose-50 text-rose-600' },
                        { label: 'Total Revenue',     value: '₱186K',   delta: '+18% vs last month', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-50 text-emerald-600' },
                        { label: 'Promo Codes Used',   value: '312',     delta: 'This month',         icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', iconBg: 'bg-amber-50 text-amber-500', badge: 'bg-slate-50 text-slate-400' },
                        { label: 'New Customers',      value: '89',      delta: '+24% growth',        icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',                                                                                                          iconBg: 'bg-cyan-50 text-cyan-600',    badge: 'bg-cyan-50 text-cyan-600' },
                        { label: 'Conversion Rate',    value: '3.8%',    delta: '+0.5% this week',    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',                                                                                                                                                                    iconBg: 'bg-indigo-50 text-indigo-600', badge: 'bg-indigo-50 text-indigo-600' },
                        { label: 'Avg Order Value',    value: '₱2,090',  delta: 'Last 30 days',       icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',                                                                                                                                                       iconBg: 'bg-violet-50 text-violet-600', badge: 'bg-slate-50 text-slate-400' },
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

                {/* Active Campaigns */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📢 Active Campaigns</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Currently running promotions</p>
                        </div>
                        <button className="text-xs font-bold text-rose-600 hover:text-rose-700 transition">View All →</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100">
                                    {['Campaign', 'Type', 'Period', 'Budget', 'Conversions', 'Status'].map(h => (
                                        <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[
                                    { name: 'Summer Silk Sale',     type: 'Seasonal',  period: 'Feb 1 – Mar 15',  budget: '₱25,000', conv: 142, status: 'Active' },
                                    { name: 'New Customer Welcome', type: 'Evergreen', period: 'Jan 1 – Dec 31',  budget: '₱10,000', conv: 89,  status: 'Active' },
                                    { name: 'Valentine Bundle',     type: 'Holiday',   period: 'Feb 1 – Feb 14',  budget: '₱15,000', conv: 67,  status: 'Ended' },
                                    { name: 'Loyalty Rewards',      type: 'Ongoing',   period: 'Ongoing',         budget: '₱5,000',  conv: 48,  status: 'Active' },
                                ].map((c, i) => (
                                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-4 py-3 text-sm font-bold text-slate-700">{c.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">{c.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-400">{c.period}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-slate-700">{c.budget}</td>
                                        <td className="px-4 py-3 text-sm font-black text-rose-600">{c.conv}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                                                c.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                                            }`}>{c.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Grid: Top Promos + Customer Growth */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                    {/* Top Promo Codes */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">🏷 Top Promo Codes</h2>
                        <div className="space-y-3">
                            {[
                                { code: 'SILK20',    uses: 142, revenue: '₱42,300',  pct: 85 },
                                { code: 'WELCOME10', uses: 89,  revenue: '₱18,700',  pct: 62 },
                                { code: 'BUNDLE15',  uses: 67,  revenue: '₱15,400',  pct: 48 },
                                { code: 'LOYALTY5',  uses: 48,  revenue: '₱8,200',   pct: 30 },
                            ].map(p => (
                                <div key={p.code} className="flex items-center gap-4">
                                    <code className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg min-w-[80px] text-center">{p.code}</code>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-600">{p.uses} uses</span>
                                            <span className="text-xs font-black text-slate-800">{p.revenue}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all" style={{ width: `${p.pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Growth Summary */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">📈 Customer Growth</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Total Customers',   value: '1,284',  color: 'text-rose-600 bg-rose-50' },
                                { label: 'New This Month',    value: '89',     color: 'text-cyan-600 bg-cyan-50' },
                                { label: 'Repeat Buyers',     value: '412',    color: 'text-emerald-600 bg-emerald-50' },
                                { label: 'Churn Rate',         value: '2.1%',   color: 'text-amber-600 bg-amber-50' },
                                { label: 'Avg Lifetime Value', value: '₱12,400', color: 'text-indigo-600 bg-indigo-50' },
                                { label: 'Referral Signups',   value: '34',     color: 'text-violet-600 bg-violet-50' },
                            ].map(s => (
                                <div key={s.label} className={`p-3.5 rounded-xl ${s.color.split(' ')[1]}`}>
                                    <p className={`text-lg font-black ${s.color.split(' ')[0]} leading-none`}>{s.value}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </MarketingSalesStaffLayout>
    );
}
