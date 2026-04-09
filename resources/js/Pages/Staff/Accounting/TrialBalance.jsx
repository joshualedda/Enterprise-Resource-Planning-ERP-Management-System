import { useState, useEffect } from 'react';
import AccountingStaffLayout from '@/Layouts/AccountingStaffLayout';
import { Head, router } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
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

const ACCOUNT_TYPE_STYLES = {
    'asset': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'liability': 'bg-rose-50 text-rose-600 border-rose-200',
    'equity': 'bg-violet-50 text-violet-600 border-violet-200',
    'income': 'bg-sky-50 text-sky-600 border-sky-200',
    'expense': 'bg-amber-50 text-amber-600 border-amber-200',
};

export default function TrialBalance({ trialBalance = [], totalDebit = 0, totalCredit = 0, asOfDate }) {
    const [dateFilter, setDateFilter] = useState(asOfDate);

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    const difference = Math.abs(totalDebit - totalCredit);

    // Apply filter
    useEffect(() => {
        if (dateFilter !== asOfDate) {
            const timeoutId = setTimeout(() => {
                router.get(route('staff.accounting.trial-balance.index'), {
                    as_of: dateFilter || undefined,
                }, { preserveState: true, replace: true, preserveScroll: true });
            }, 600);
            return () => clearTimeout(timeoutId);
        }
    }, [dateFilter, asOfDate]);

    const printReport = () => {
        window.print();
    };

    const kpis = [
        {
            label: 'Total General Debit', value: phpFmt(totalDebit),
            iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Total General Credit', value: phpFmt(totalCredit),
            iconPath: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
            iconBg: 'bg-rose-50 text-rose-600',
        },
        {
            label: 'Balance Status', 
            value: isBalanced ? '✓ Balanced' : `₱${difference.toFixed(2)} Off`,
            iconPath: isBalanced ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: isBalanced ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
            overrideColor: isBalanced ? 'border-emerald-200 shadow-emerald-100 shadow-md' : 'border-rose-200 shadow-rose-100 shadow-md text-rose-700'
        },
    ];

    return (
        <AccountingStaffLayout header="Trial Balance">
            <Head title="Trial Balance — Accounting" />

            {/* Print Styling injected via Tailwind classes mostly, but we add a wrapper to hide elements on print */}
            <style>{`
                @media print {
                    nav, header, .print-hide { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    .print-show { display: block !important; }
                    .print-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print-hide">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trial Balance</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Snapshot of all general ledger account balances.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">As of</span>
                            <TextInput 
                                type="date" 
                                value={dateFilter} 
                                onChange={e => setDateFilter(e.target.value)}
                                className="border-0 focus:ring-0 text-sm font-bold text-slate-700 py-1"
                            />
                        </div>

                        <button onClick={printReport} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print Report
                        </button>
                    </div>
                </div>

                {/* Print Only Header */}
                <div className="hidden print-show text-center pb-6 border-b border-slate-200 mb-6 mt-10">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Sericulture ERP</h2>
                    <h3 className="text-xl font-bold text-slate-700 mt-1">Trial Balance Report</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">As of {new Date(asOfDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-hide">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* Ledger Body */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-200 bg-slate-50/50">
                                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Account Code</th>
                                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Account Details</th>
                                    <th className="py-4 px-6 text-xs font-black text-emerald-600 uppercase tracking-widest text-right">Debit (₱)</th>
                                    <th className="py-4 px-6 text-xs font-black text-rose-600 uppercase tracking-widest text-right">Credit (₱)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {trialBalance.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center">
                                            <div className="text-4xl">📭</div>
                                            <p className="text-sm font-black text-slate-400 mt-2">No active ledger balances found up to this date.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    trialBalance.map(row => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3 px-6 text-sm font-black text-slate-500">
                                                {row.account_code}
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${ACCOUNT_TYPE_STYLES[row.account_type]}`}>
                                                        {row.account_type}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-800">{row.account_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-sm flex-row gap-2 font-mono font-black text-slate-700 text-right">
                                                {row.debit > 0 ? phpFmt(row.debit) : <span className="text-slate-200">—</span>}
                                            </td>
                                            <td className="py-3 px-6 text-sm font-mono font-black text-slate-700 text-right">
                                                {row.credit > 0 ? phpFmt(row.credit) : <span className="text-slate-200">—</span>}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="border-t-4 border-slate-200 bg-slate-50/50">
                                <tr>
                                    <td colSpan="2" className="py-4 px-6 text-sm font-black text-slate-500 uppercase tracking-widest text-right">
                                        Grand Totals
                                    </td>
                                    <td className="py-4 px-6 text-sm font-mono font-black text-emerald-700 text-right border-b-4 border-emerald-500">
                                        {phpFmt(totalDebit)}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-mono font-black text-rose-700 text-right border-b-4 border-rose-500">
                                        {phpFmt(totalCredit)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                
                {/* Print Note */}
                <div className="hidden print-show text-center mt-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    --- End of Report ---
                </div>
            </div>
        </AccountingStaffLayout>
    );
}
