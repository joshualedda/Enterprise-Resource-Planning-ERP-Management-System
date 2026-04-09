import { useState, useEffect } from 'react';
import AccountingStaffLayout from '@/Layouts/AccountingStaffLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Alert from '@/Components/Alert';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';

const phpFmt = (n) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);

function KpiCard({ label, value, iconPath, iconBg }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
            </div>
            <div>
                <p className="text-xl font-black text-slate-900 leading-none truncate">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">{label}</p>
            </div>
        </div>
    );
}

export default function JournalEntries({ entries, stats, filters: serverFilters = {}, accounts = [], flash }) {
    const [alertMessage, setAlertMessage] = useState('');
    const [errorAlert, setErrorAlert] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const [search, setSearch] = useState(serverFilters.search ?? '');

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== serverFilters.search) {
                router.get(route('staff.accounting.journal-entries.index'), {
                    search: search || undefined,
                }, { preserveState: true, replace: true });
            }
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        entry_number: '',
        entry_date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        lines: [
            { account_id: '', debit: '', credit: '' },
            { account_id: '', debit: '', credit: '' }
        ],
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0 && errors.lines) {
            setErrorAlert(errors.lines);
        } else if (errors.error) {
            setErrorAlert(errors.error);
        } else {
            setErrorAlert('');
        }
    }, [errors]);

    const openModal = (mode, entry = null) => {
        setModalMode(mode);
        clearErrors();
        setErrorAlert('');
        
        if (mode === 'edit' && entry) {
            setData({
                id: entry.id,
                entry_number: entry.entry_number || '',
                entry_date: entry.entry_date ? entry.entry_date.split('T')[0] : '',
                reference: entry.reference || '',
                description: entry.description || '',
                lines: entry.lines && entry.lines.length > 0 ? entry.lines.map(l => ({
                    account_id: l.account_id,
                    debit: l.debit,
                    credit: l.credit
                })) : [
                    { account_id: '', debit: '', credit: '' },
                    { account_id: '', debit: '', credit: '' }
                ],
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
        setErrorAlert('');
    };

    const submitForm = (e) => {
        e.preventDefault();
        setErrorAlert('');

        if (modalMode === 'add') {
            post(route('staff.accounting.journal-entries.store'), {
                onSuccess: () => closeModal(),
                preserveScroll: true,
            });
        } else {
            put(route('staff.accounting.journal-entries.update', data.id), {
                onSuccess: () => closeModal(),
                preserveScroll: true,
            });
        }
    };

    const confirmDelete = (entry) => {
        setItemToDelete(entry);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.accounting.journal-entries.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
                onFinish: () => setItemToDelete(null),
            });
        }
    };

    // Form logic helpers
    const addLine = () => {
        setData('lines', [...data.lines, { account_id: '', debit: '', credit: '' }]);
    };

    const removeLine = (idx) => {
        const newLines = [...data.lines];
        newLines.splice(idx, 1);
        setData('lines', newLines);
    };

    const updateLine = (idx, field, value) => {
        const newLines = [...data.lines];
        newLines[idx][field] = value;
        
        // Auto-zero the opposite field if they type in one
        if (field === 'debit' && parseFloat(value) > 0) newLines[idx]['credit'] = '';
        if (field === 'credit' && parseFloat(value) > 0) newLines[idx]['debit'] = '';
        
        setData('lines', newLines);
    };

    const totalDebit = data.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
    const totalCredit = data.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && (totalDebit > 0 || totalCredit > 0);
    const balanceDiff = Math.abs(totalDebit - totalCredit);

    // Master Stats
    const kpis = [
        {
            label: 'Total Entries', value: stats.total_entries,
            iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'Entries This Month', value: stats.this_month,
            iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            iconBg: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Total Debits Logged', value: phpFmt(stats.total_debit),
            iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Total Credits Logged', value: phpFmt(stats.total_credit),
            iconPath: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
            iconBg: 'bg-rose-50 text-rose-600',
        },
    ];

    return (
        <AccountingStaffLayout header="Journal Entries">
            <Head title="Journal Entries — Accounting" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Journal Entries</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Record and track double-entry accounting transactions.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-sm shadow-amber-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Journal Entry
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by entry #, reference, or description…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition placeholder-slate-400"
                        />
                    </div>
                </div>

                <Table
                    title="🧾 Entry Ledgers"
                    subtitle="History of all posted accounting entries"
                    badgeCount={entries.total}
                    columns={['Date', 'Entry Number', 'Reference', 'Description', 'Total Amount', 'Posted By', 'Actions']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl">📚</div>
                            <p className="text-sm font-black text-slate-300">No journal entries found</p>
                        </div>
                    }
                    footer={
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                Page {entries.current_page} of {entries.last_page} &nbsp;·&nbsp; {entries.total} entries
                            </p>
                            <Pagination 
                                currentPage={entries.current_page} 
                                totalPages={entries.last_page} 
                                onPageChange={(page) => {
                                    router.get(route(route().current()), {
                                        search,
                                        page
                                    }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    }
                >
                    {entries.data.map(entry => {
                        const entryAmount = entry.lines?.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0) || 0;
                        return (
                            <Tr key={entry.id}>
                                <Td className="text-sm font-black text-slate-500 whitespace-nowrap">
                                    {entry.entry_date}
                                </Td>
                                <Td className="text-sm font-black text-amber-600">
                                    {entry.entry_number}
                                </Td>
                                <Td className="text-sm font-bold text-slate-800">
                                    {entry.reference || <span className="text-slate-300">—</span>}
                                </Td>
                                <Td className="max-w-[200px]">
                                    <p className="text-xs text-slate-600 truncate">{entry.description || '—'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{entry.lines?.length || 0} lines</p>
                                </Td>
                                <Td className="text-sm font-black text-slate-700">
                                    {phpFmt(entryAmount)}
                                </Td>
                                <Td>
                                    {entry.user ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                                                {entry.user.first_name?.[0]}{entry.user.last_name?.[0]}
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{entry.user.first_name} {entry.user.last_name}</span>
                                        </div>
                                    ) : <span className="text-xs text-slate-400">—</span>}
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => openModal('edit', entry)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                            View / Edit
                                        </button>
                                        <button onClick={() => confirmDelete(entry)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                            Delete
                                        </button>
                                    </div>
                                </Td>
                            </Tr>
                        );
                    })}
                </Table>

                {/* Form Modal */}
                <Modal show={isModalOpen} onClose={closeModal} maxWidth="4xl">
                    <form onSubmit={submitForm} className="p-0">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {modalMode === 'add' ? 'New Journal Entry' : 'Edit Journal Entry'}
                            </h2>
                            <p className="mt-1 text-xs font-bold text-slate-400">Record debit and credit lines ensuring total balances match.</p>
                            {errorAlert && (
                                <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {errorAlert}
                                </div>
                            )}
                        </div>
                        
                        {/* Master Fields */}
                        <div className="p-6 pb-2 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <InputLabel htmlFor="entry_date" value="Entry Date *" />
                                <TextInput type="date" id="entry_date" value={data.entry_date} onChange={e => setData('entry_date', e.target.value)} className="mt-1 block w-full focus:ring-amber-500 text-sm" required />
                                <InputError message={errors.entry_date} className="mt-1" />
                            </div>
                            <div className="md:col-span-1">
                                <InputLabel htmlFor="entry_number" value="Entry No. *" />
                                <TextInput id="entry_number" placeholder="JE-2026-001" value={data.entry_number} onChange={e => setData('entry_number', e.target.value)} className="mt-1 block w-full focus:ring-amber-500 font-mono text-sm uppercase placeholder-slate-300" required />
                                <InputError message={errors.entry_number} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="reference" value="Reference" />
                                <TextInput id="reference" placeholder="e.g. Inv# 4001" value={data.reference} onChange={e => setData('reference', e.target.value)} className="mt-1 block w-full focus:ring-amber-500 text-sm placeholder-slate-300" />
                                <InputError message={errors.reference} className="mt-1" />
                            </div>
                            <div className="md:col-span-4 pb-4">
                                <InputLabel htmlFor="description" value="Description / Memo" />
                                <TextInput id="description" value={data.description} onChange={e => setData('description', e.target.value)} className="mt-1 block w-full focus:ring-amber-500 text-sm" />
                                <InputError message={errors.description} className="mt-1" />
                            </div>
                        </div>

                        {/* Details Lines */}
                        <div className="p-6 bg-slate-50/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Entry Lines</h3>
                                <button type="button" onClick={addLine} className="text-xs font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                    Add Line
                                </button>
                            </div>

                            <div className="space-y-2">
                                {/* Table headers */}
                                <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <div className="col-span-1">No.</div>
                                    <div className="col-span-5">Account</div>
                                    <div className="col-span-2 text-right">Debit (₱)</div>
                                    <div className="col-span-2 text-right">Credit (₱)</div>
                                    <div className="col-span-2 text-right">Action</div>
                                </div>
                                
                                {data.lines.map((line, idx) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-3 py-3 bg-white border border-slate-200 rounded-xl items-center shadow-sm relative group">
                                        <div className="hidden sm:block sm:col-span-1 text-xs font-black text-slate-300 pointer-events-none">
                                            {String(idx + 1).padStart(2, '0')}
                                        </div>
                                        <div className="sm:col-span-5 relative">
                                            <select 
                                                value={line.account_id}
                                                onChange={e => updateLine(idx, 'account_id', e.target.value)}
                                                className="block w-full text-xs font-bold text-slate-700 border-slate-200 rounded-lg focus:ring-amber-400 focus:border-amber-400 py-2 pl-3 pr-8 appearance-none bg-slate-50"
                                                required
                                            >
                                                <option value="" disabled>Select Account...</option>
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>
                                                        {acc.account_code} - {acc.account_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <input 
                                                type="number" step="0.01" min="0" placeholder="0.00"
                                                value={line.debit}
                                                onChange={e => updateLine(idx, 'debit', e.target.value)}
                                                className="block w-full text-xs font-mono font-black text-emerald-600 text-right border-slate-200 rounded-lg focus:ring-emerald-400 focus:border-emerald-400 py-2 placeholder-slate-200"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <input 
                                                type="number" step="0.01" min="0" placeholder="0.00"
                                                value={line.credit}
                                                onChange={e => updateLine(idx, 'credit', e.target.value)}
                                                className="block w-full text-xs font-mono font-black text-rose-600 text-right border-slate-200 rounded-lg focus:ring-rose-400 focus:border-rose-400 py-2 placeholder-slate-200"
                                            />
                                        </div>
                                        <div className="sm:col-span-2 text-right">
                                            <button 
                                                type="button" onClick={() => removeLine(idx)}
                                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                                                disabled={data.lines.length <= 2}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Totals line */}
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-3 pt-6 pb-2 items-center text-sm">
                                    <div className="sm:col-span-6 text-right font-black text-slate-400 uppercase tracking-widest hidden sm:block">Total</div>
                                    <div className="sm:col-span-2 text-right font-mono font-black text-slate-800 border-t-2 border-slate-200 pt-2">
                                        {phpFmt(totalDebit)}
                                    </div>
                                    <div className="sm:col-span-2 text-right font-mono font-black text-slate-800 border-t-2 border-slate-200 pt-2">
                                        {phpFmt(totalCredit)}
                                    </div>
                                    <div className="sm:col-span-2"></div>
                                </div>
                                {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
                                    <p className="text-right text-xs font-black text-rose-500 mt-1 uppercase tracking-wider pr-[16.66%]">
                                        Out of balance by {phpFmt(balanceDiff)}
                                    </p>
                                )}
                                {isBalanced && totalDebit > 0 && (
                                    <p className="text-right text-[10px] font-black text-emerald-500 mt-1 uppercase tracking-wider pr-[16.66%]">
                                        ✓ Entry is Balanced
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 bg-slate-50 flex justify-end gap-3 border-t border-slate-100 rounded-b-lg">
                            <SecondaryButton onClick={closeModal} className="!border-slate-200 !text-slate-600">Cancel</SecondaryButton>
                            <PrimaryButton 
                                disabled={processing || !isBalanced || totalDebit === 0} 
                                className={`transition-all duration-300 ${!isBalanced || totalDebit === 0 ? 'bg-slate-300 hover:bg-slate-300 shadow-none' : 'bg-amber-600 hover:bg-amber-700 shadow-sm shadow-amber-200'}`}
                            >
                                {processing ? 'Processing...' : modalMode === 'add' ? 'Post Entry' : 'Update Entry'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-rose-600 mb-4">Confirm Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6 flex flex-col gap-1">
                            <span>Are you sure you want to delete <span className="font-bold text-slate-800">{itemToDelete?.entry_number}</span>?</span>
                            <span className="text-xs bg-rose-50 p-2 rounded text-rose-600 font-bold">Warning: Removing an entry will affect the ledger balance permanently.</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                onClick={executeDelete}
                                disabled={processing}
                                className="!bg-rose-600 hover:!bg-rose-700 focus:!ring-rose-500"
                            >
                                {processing ? 'Deleting...' : 'Delete Permanently'}
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </AccountingStaffLayout>
    );
}
