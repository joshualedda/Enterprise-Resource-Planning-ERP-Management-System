import { useState, useEffect } from 'react';
import AccountingStaffLayout from '@/Layouts/AccountingStaffLayout';
import { Head, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';

const phpFmt = (n) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);

function KpiCard({ label, value, iconPath, iconBg, overrideColor }) {
    return (
        <div className={`bg-white rounded-2xl border ${overrideColor || 'border-slate-100'} shadow-sm p-4 flex flex-col gap-3 transition-shadow`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
            </div>
            <div>
                <p className={`text-xl font-black leading-none truncate ${overrideColor ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">{label}</p>
            </div>
        </div>
    );
}

export default function ProfitAndLoss({ incomes = [], expenses = [], totalIncome = 0, totalExpense = 0, netProfit = 0, filters = {} }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const isProfitable = netProfit >= 0;

    // Apply period filter safely
    useEffect(() => {
        if (startDate !== filters.start_date || endDate !== filters.end_date) {
            const timeoutId = setTimeout(() => {
                router.get(route('staff.accounting.profit-and-loss.index'), {
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                }, { preserveState: true, replace: true, preserveScroll: true });
            }, 600);
            return () => clearTimeout(timeoutId);
        }
    }, [startDate, endDate, filters]);

    const printReport = () => {
        window.print();
    };

    const kpis = [
        {
            label: 'Total Gross Revenue', value: phpFmt(totalIncome),
            iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', // Up arrow
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Total Operating Expenses', value: phpFmt(totalExpense),
            iconPath: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6', // Down arrow
            iconBg: 'bg-rose-50 text-rose-600',
        },
        {
            label: isProfitable ? 'Net Profit' : 'Net Loss', 
            value: phpFmt(isProfitable ? netProfit : Math.abs(netProfit)),
            iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: isProfitable ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600',
            overrideColor: isProfitable ? 'border-sky-200 shadow-sky-100 shadow-md !text-sky-700' : 'border-rose-200 shadow-rose-100 shadow-md !text-rose-700'
        },
    ];

    const formatDateStr = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});

    return (
        <AccountingStaffLayout header="Profit & Loss">
            <Head title="Income Statement (P&L) — Accounting" />

            <style>{`
                @media print {
                    nav, header, .print-hide { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    .print-show { display: block !important; }
                    .print-border-b { border-bottom: 2px solid #e2e8f0 !important; }
                }
            `}</style>

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header (Hidden on Print) */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 print-hide">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Income Statement</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Analyze operational revenues mapping against expenses over time.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Range</span>
                            <TextInput 
                                type="date" 
                                value={startDate} 
                                onChange={e => setStartDate(e.target.value)}
                                className="border-0 focus:ring-0 text-xs font-bold text-slate-700 py-1 px-1 bg-slate-50 rounded"
                            />
                            <span className="text-slate-300 font-bold">—</span>
                            <TextInput 
                                type="date" 
                                value={endDate} 
                                onChange={e => setEndDate(e.target.value)}
                                className="border-0 focus:ring-0 text-xs font-bold text-slate-700 py-1 px-1 bg-slate-50 rounded"
                            />
                        </div>

                        <button onClick={printReport} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Export Statement
                        </button>
                    </div>
                </div>

                {/* Print Only Header */}
                <div className="hidden print-show text-center pb-6 border-b print-border-b mb-8 mt-10">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Sericulture ERP</h2>
                    <h3 className="text-xl font-bold text-slate-700 mt-1">Statement of Profit & Loss</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">For the Period: {formatDateStr(startDate)} to {formatDateStr(endDate)}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-hide">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* Waterfall Document Body */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-full max-w-4xl p-6 sm:p-10">
                        
                        {/* REVENUE SECTION */}
                        <div className="mb-8">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-3 mb-4">Operating Income / Revenue</h4>
                            {incomes.length === 0 ? (
                                <p className="text-sm text-slate-400 italic py-2">No income recognized within this period.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {incomes.map(inc => (
                                        <li key={inc.id} className="flex justify-between items-center px-2 hover:bg-slate-50 rounded py-1 transition">
                                            <span className="text-sm font-bold text-slate-700">[{inc.account_code}] {inc.account_name}</span>
                                            <span className="text-sm font-mono font-black text-slate-700">{phpFmt(inc.balance)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 px-2 bg-emerald-50/50 rounded-lg py-2">
                                <span className="text-sm font-black text-emerald-800 uppercase tracking-widest">Total Income</span>
                                <span className="text-base font-mono font-black text-emerald-600">{phpFmt(totalIncome)}</span>
                            </div>
                        </div>

                        {/* EXPENSES SECTION */}
                        <div className="mb-8">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-3 mb-4">Operating Expenses</h4>
                            {expenses.length === 0 ? (
                                <p className="text-sm text-slate-400 italic py-2">No expenses recognized within this period.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {expenses.map(exp => (
                                        <li key={exp.id} className="flex justify-between items-center px-2 hover:bg-slate-50 rounded py-1 transition">
                                            <span className="text-sm font-bold text-slate-700">[{exp.account_code}] {exp.account_name}</span>
                                            <span className="text-sm font-mono font-black text-slate-700">{phpFmt(exp.balance)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 px-2 bg-rose-50/50 rounded-lg py-2">
                                <span className="text-sm font-black text-rose-800 uppercase tracking-widest">Total Expenses</span>
                                <span className="text-base font-mono font-black text-rose-600">{phpFmt(totalExpense)}</span>
                            </div>
                        </div>

                        {/* NET PROFIT LINE */}
                        <div className={`mt-8 pt-6 border-t-[3px] flex justify-between items-center px-4 py-5 rounded-xl ${isProfitable ? 'border-sky-500 bg-sky-50' : 'border-rose-500 bg-rose-50'}`}>
                            <div>
                                <h3 className={`text-lg font-black uppercase tracking-widest ${isProfitable ? 'text-sky-800' : 'text-rose-800'}`}>
                                    Net {isProfitable ? 'Profit / Income' : 'Loss'}
                                </h3>
                                <p className={`text-xs font-bold mt-1 ${isProfitable ? 'text-sky-600' : 'text-rose-600'}`}>
                                    After all operating costs are deducted
                                </p>
                            </div>
                            <span className={`text-3xl font-mono font-black ${isProfitable ? 'text-sky-600' : 'text-rose-600'}`}>
                                {isProfitable ? phpFmt(netProfit) : `(${phpFmt(Math.abs(netProfit))})`}
                            </span>
                        </div>

                    </div>
                </div>

                {/* Print Note */}
                <div className="hidden print-show text-center mt-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    --- End of Profit & Loss Statement ---
                </div>

            </div>
        </AccountingStaffLayout>
    );
}
