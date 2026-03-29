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

function SectionHeader({ title }) {
    return (
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-3 mb-4">
            {title}
        </h4>
    );
}

function AccountRow({ code, name, balance }) {
    return (
        <li className="flex justify-between items-center px-2 hover:bg-slate-50 rounded py-1.5 transition">
            <span className="text-sm font-bold text-slate-700">[{code}] {name}</span>
            <span className="text-sm font-mono font-black text-slate-700">{phpFmt(balance)}</span>
        </li>
    );
}

function TotalRow({ label, value, colorClass, bgClass }) {
    return (
        <div className={`flex justify-between items-center mt-4 pt-3 border-t border-slate-200 px-3 ${bgClass} rounded-lg py-2.5`}>
            <span className={`text-sm font-black uppercase tracking-widest ${colorClass}`}>{label}</span>
            <span className={`text-base font-mono font-black ${colorClass}`}>{phpFmt(value)}</span>
        </div>
    );
}

export default function BalanceSheet({ assets = [], liabilities = [], equity = [], totalAssets = 0, totalLiabilities = 0, totalEquity = 0, totalLiabilitiesEquity = 0, filters = {} }) {
    const [asOfDate, setAsOfDate] = useState(filters.as_of || '');

    const isBalanced = Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01;
    const difference = Math.abs(totalAssets - totalLiabilitiesEquity);

    useEffect(() => {
        if (asOfDate !== filters.as_of) {
            const timeoutId = setTimeout(() => {
                router.get(route('staff.accounting.balance-sheet.index'), {
                    as_of: asOfDate || undefined,
                }, { preserveState: true, replace: true, preserveScroll: true });
            }, 600);
            return () => clearTimeout(timeoutId);
        }
    }, [asOfDate, filters]);

    const printReport = () => {
        window.print();
    };

    const kpis = [
        {
            label: 'Total Assets', value: phpFmt(totalAssets),
            iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Total Liabilities', value: phpFmt(totalLiabilities),
            iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
            iconBg: 'bg-rose-50 text-rose-600',
        },
        {
            label: 'Status: ' + (isBalanced ? 'Balanced' : 'Unbalanced'), 
            value: isBalanced ? '✓ In Equilibrium' : `₱${difference.toFixed(2)} Gap`,
            iconPath: isBalanced ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: isBalanced ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600',
            overrideColor: isBalanced ? 'border-sky-200 shadow-sky-100 shadow-md !text-sky-700' : 'border-rose-200 shadow-rose-100 shadow-md !text-rose-700'
        },
    ];

    const formatDateStr = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});

    return (
        <AccountingStaffLayout header="Balance Sheet">
            <Head title="Balance Sheet Statement — Accounting" />

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print-hide">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Balance Sheet</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Current financial standing as of your selected date.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">As of</span>
                            <TextInput 
                                type="date" 
                                value={asOfDate} 
                                onChange={e => setAsOfDate(e.target.value)}
                                className="border-0 focus:ring-0 text-sm font-bold text-slate-700 py-1"
                            />
                        </div>

                        <button onClick={printReport} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Print Only Header */}
                <div className="hidden print-show text-center pb-6 border-b print-border-b mb-8 mt-10">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Sericulture ERP</h2>
                    <h3 className="text-xl font-bold text-slate-700 mt-1">Balance Sheet Statement</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Status as of: {formatDateStr(asOfDate)}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-hide">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* Balance Sheet Waterfall Document */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-full max-w-4xl p-6 sm:p-10">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* ASSETS COLUMN */}
                            <div>
                                <SectionHeader title="Assets" />
                                {assets.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic py-2">No asset accounts recorded.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {assets.map(acc => (
                                            <AccountRow key={acc.code} code={acc.code} name={acc.name} balance={acc.balance} />
                                        ))}
                                    </ul>
                                )}
                                <TotalRow 
                                    label="Total Assets" 
                                    value={totalAssets} 
                                    bgClass="bg-emerald-50/50" 
                                    colorClass="text-emerald-700" 
                                />
                            </div>

                            {/* LIABILITIES & EQUITY COLUMN */}
                            <div className="flex flex-col gap-10">
                                {/* LIABILITIES */}
                                <div>
                                    <SectionHeader title="Liabilities" />
                                    {liabilities.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic py-2">No liability accounts recorded.</p>
                                    ) : (
                                        <ul className="space-y-1">
                                            {liabilities.map(acc => (
                                                <AccountRow key={acc.code} code={acc.code} name={acc.name} balance={acc.balance} />
                                            ))}
                                        </ul>
                                    )}
                                    <TotalRow 
                                        label="Total Liabilities" 
                                        value={totalLiabilities} 
                                        bgClass="bg-rose-50/50" 
                                        colorClass="text-rose-700" 
                                    />
                                </div>

                                {/* EQUITY */}
                                <div>
                                    <SectionHeader title="Equity" />
                                    {equity.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic py-2">No equity accounts recorded.</p>
                                    ) : (
                                        <ul className="space-y-1">
                                            {equity.map(acc => (
                                                <AccountRow key={acc.code} code={acc.code} name={acc.name} balance={acc.balance} />
                                            ))}
                                        </ul>
                                    )}
                                    <TotalRow 
                                        label="Total Equity" 
                                        value={totalEquity} 
                                        bgClass="bg-violet-50/50" 
                                        colorClass="text-violet-700" 
                                    />
                                </div>

                                {/* GRAND TOTAL FOR LIABILITIES + EQUITY */}
                                <div className={`pt-6 border-t-[3px] flex justify-between items-center px-4 py-4 rounded-xl ${isBalanced ? 'border-sky-500 bg-sky-50' : 'border-rose-500 bg-rose-50'}`}>
                                    <span className={`text-xs font-black uppercase tracking-widest ${isBalanced ? 'text-sky-800' : 'text-rose-800'}`}>Total Liab. & Equity</span>
                                    <span className={`text-xl font-mono font-black ${isBalanced ? 'text-sky-600' : 'text-rose-600'}`}>{phpFmt(totalLiabilitiesEquity)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Print Note */}
                <div className="hidden print-show text-center mt-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    --- End of Balance Sheet Statement ---
                </div>

            </div>
        </AccountingStaffLayout>
    );
}
