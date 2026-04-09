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

export default function CustomerPayments({ payments, stats, filters: serverFilters = {}, accounts = [], transactions = [], flash }) {
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
                router.get(route('staff.accounting.customer-payments.index'), {
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
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'Cash',
        reference: '',
        debit_account_id: '',
        credit_account_id: '',
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0 && errors.error) {
            setErrorAlert(errors.error);
        } else {
            setErrorAlert('');
        }
    }, [errors]);

    const openModal = (mode, payment = null) => {
        setModalMode(mode);
        clearErrors();
        setErrorAlert('');
        
        if (mode === 'edit' && payment) {
            // Find matched journal entry lines to populate debit/credit selects
            const lines = payment.journal_entry?.lines || [];
            const debLine = lines.find(l => parseFloat(l.debit) > 0);
            const credLine = lines.find(l => parseFloat(l.credit) > 0);

            setData({
                id: payment.id,
                transaction_id: payment.transaction_id || '',
                payment_date: payment.payment_date ? payment.payment_date.split('T')[0] : '',
                amount: payment.amount || '',
                payment_method: payment.payment_method || 'Cash',
                reference: payment.reference || '',
                debit_account_id: debLine?.account_id || '',
                credit_account_id: credLine?.account_id || '',
            });
        } else {
            reset();
            // Optional smart defaults
            const defaultDebit = accounts.find(a => a.account_name.toLowerCase().includes('cash'))?.id || '';
            const defaultCredit = accounts.find(a => a.account_name.toLowerCase().includes('receivable'))?.id || '';
            setData(prev => ({ ...prev, debit_account_id: defaultDebit, credit_account_id: defaultCredit }));
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
            post(route('staff.accounting.customer-payments.store'), {
                onSuccess: () => closeModal(),
                preserveScroll: true,
            });
        } else {
            put(route('staff.accounting.customer-payments.update', data.id), {
                onSuccess: () => closeModal(),
                preserveScroll: true,
            });
        }
    };

    const confirmDelete = (payment) => {
        setItemToDelete(payment);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.accounting.customer-payments.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
                onFinish: () => setItemToDelete(null),
            });
        }
    };

    // Master Stats
    const kpis = [
        {
            label: 'Total Collected', value: phpFmt(stats.total_amount),
            iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Collected This Month', value: phpFmt(stats.this_month_amount),
            iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            iconBg: 'bg-sky-50 text-sky-600',
        },
        {
            label: 'Total Payments Logged', value: stats.total_payments,
            iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'Monthly Payment Count', value: stats.this_month_count,
            iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
            iconBg: 'bg-amber-50 text-amber-600',
        },
    ];

    // Auto-fill amount when transaction selected
    useEffect(() => {
        if (data.transaction_id && modalMode === 'add') {
            const trans = transactions.find(t => t.id == data.transaction_id);
            if (trans && trans.total_amount) {
                setData(prev => ({ ...prev, amount: trans.total_amount }));
            }
        }
    }, [data.transaction_id, transactions, modalMode]);

    return (
        <AccountingStaffLayout header="Customer Payments">
            <Head title="Customer Payments — Accounting" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Payments</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Process incoming revenues and auto-sync to the General Ledger.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Receive Payment
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
                            placeholder="Search by ref, method, client name…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                        />
                    </div>
                </div>

                <Table
                    title="💳 Collections Log"
                    subtitle="History of all registered customer payments"
                    badgeCount={payments.total}
                    columns={['Date', 'Customer', 'Trans Ref', 'Method', 'Payment Amount', 'JE Linked', 'Actions']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl">💰</div>
                            <p className="text-sm font-black text-slate-300">No expected payments mapped.</p>
                        </div>
                    }
                    footer={
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                Page {payments.current_page} of {payments.last_page} &nbsp;·&nbsp; {payments.total} payments
                            </p>
                            <Pagination 
                                currentPage={payments.current_page} 
                                totalPages={payments.last_page} 
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
                    {payments.data.map(payment => (
                        <Tr key={payment.id}>
                            <Td className="text-sm font-black text-slate-500 whitespace-nowrap">
                                {payment.payment_date}
                            </Td>
                            <Td>
                                {payment.customer ? (
                                    <span className="text-sm font-bold text-slate-800">{payment.customer.first_name} {payment.customer.last_name}</span>
                                ) : <span className="text-xs text-slate-400">—</span>}
                            </Td>
                            <Td className="text-sm font-black text-amber-600">
                                {payment.transaction?.reference_no || '—'}
                            </Td>
                            <Td className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {payment.payment_method || '—'}
                            </Td>
                            <Td className="text-sm font-black text-emerald-600">
                                {phpFmt(payment.amount)}
                            </Td>
                            <Td>
                                {payment.journal_entry ? (
                                    <span className="px-2 py-0.5 bg-sky-50 text-sky-600 border border-sky-200 rounded text-[10px] font-black tracking-widest uppercase">
                                        {payment.journal_entry.entry_number}
                                    </span>
                                ) : <span className="text-xs text-slate-400">Unlinked</span>}
                            </Td>
                            <Td>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => openModal('edit', payment)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                        Edit
                                    </button>
                                    <button onClick={() => confirmDelete(payment)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                        Delete
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                {/* Form Modal */}
                <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                    <form onSubmit={submitForm} className="p-0">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-black text-emerald-700 tracking-tight">
                                {modalMode === 'add' ? 'Receive Customer Payment' : 'Edit Customer Payment'}
                            </h2>
                            <p className="mt-1 text-xs font-bold text-slate-400">Recording payments seamlessly triggers an underlying double-entry ledger update.</p>
                            {errorAlert && (
                                <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {errorAlert}
                                </div>
                            )}
                        </div>
                        
                        {/* Transaction & Amount */}
                        <div className="p-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                            <div className="md:col-span-1">
                                <InputLabel htmlFor="transaction_id" value="Select Transaction *" />
                                <select 
                                    id="transaction_id" 
                                    value={data.transaction_id} 
                                    onChange={e => setData('transaction_id', e.target.value)} 
                                    className="mt-1 block w-full text-sm font-bold text-slate-700 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm"
                                    required
                                >
                                    <option value="" disabled>-- Pending Sales --</option>
                                    {transactions.map(t => (
                                        <option key={t.id} value={t.id}>
                                            Ref: {t.reference_no} | {t.user?.first_name} {t.user?.last_name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.transaction_id} className="mt-1" />
                            </div>

                            <div className="md:col-span-1">
                                <InputLabel htmlFor="amount" value="Amount Received (₱) *" />
                                <TextInput 
                                    type="number" step="0.01" min="0.01" id="amount" 
                                    value={data.amount} 
                                    onChange={e => setData('amount', e.target.value)} 
                                    className="mt-1 block w-full focus:ring-emerald-500 font-mono text-emerald-700 font-black text-sm" 
                                    required 
                                />
                                <InputError message={errors.amount} className="mt-1" />
                            </div>

                            <div className="md:col-span-1 border-t border-slate-100 pt-3">
                                <InputLabel htmlFor="payment_date" value="Payment Date *" />
                                <TextInput type="date" id="payment_date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} className="mt-1 block w-full focus:ring-emerald-500 text-sm" required />
                                <InputError message={errors.payment_date} className="mt-1" />
                            </div>

                            <div className="md:col-span-1 border-t border-slate-100 pt-3">
                                <InputLabel htmlFor="payment_method" value="Payment Method" />
                                <select 
                                    id="payment_method" 
                                    value={data.payment_method} 
                                    onChange={e => setData('payment_method', e.target.value)} 
                                    className="mt-1 block w-full text-sm border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank">Bank Deposit/Transfer</option>
                                    <option value="GCash">GCash</option>
                                    <option value="Check">Check</option>
                                </select>
                                <InputError message={errors.payment_method} className="mt-1" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="reference" value="Reference No. (e.g., Check #, GCash Ref)" />
                                <TextInput id="reference" value={data.reference} onChange={e => setData('reference', e.target.value)} className="mt-1 block w-full focus:ring-emerald-500 text-sm placeholder-slate-300" />
                                <InputError message={errors.reference} className="mt-1" />
                            </div>
                        </div>

                        {/* Internal Ledger Mappings */}
                        <div className="p-6 bg-emerald-50/40">
                            <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-4">Required Journal Entry Link</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-black text-[10px]">D</div>
                                        <InputLabel htmlFor="debit_account_id" value="Account to Debit (e.g. Cash)" className="!mb-0 !text-slate-600" />
                                    </div>
                                    <select 
                                        id="debit_account_id" 
                                        value={data.debit_account_id} 
                                        onChange={e => setData('debit_account_id', e.target.value)} 
                                        className="block w-full text-xs font-bold text-slate-700 border-emerald-100 rounded-lg focus:ring-emerald-400 focus:border-emerald-400 py-2.5 appearance-none bg-emerald-50/20"
                                        required
                                    >
                                        <option value="" disabled>Choose Debit Account...</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>[{acc.account_code}] {acc.account_name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.debit_account_id} className="mt-1" />
                                </div>

                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-black text-[10px]">C</div>
                                        <InputLabel htmlFor="credit_account_id" value="Account to Credit (e.g. Receivables)" className="!mb-0 !text-slate-600" />
                                    </div>
                                    <select 
                                        id="credit_account_id" 
                                        value={data.credit_account_id} 
                                        onChange={e => setData('credit_account_id', e.target.value)} 
                                        className="block w-full text-xs font-bold text-slate-700 border-rose-100 rounded-lg focus:ring-rose-400 focus:border-rose-400 py-2.5 appearance-none bg-rose-50/20"
                                        required
                                    >
                                        <option value="" disabled>Choose Credit Account...</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>[{acc.account_code}] {acc.account_name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.credit_account_id} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 bg-slate-50 flex justify-end gap-3 border-t border-slate-100 rounded-b-lg">
                            <SecondaryButton onClick={closeModal} className="!border-slate-200 !text-slate-600">Cancel</SecondaryButton>
                            <PrimaryButton 
                                disabled={processing || !data.transaction_id || !data.debit_account_id || !data.credit_account_id || data.amount <= 0} 
                                className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 transition-all shadow-sm shadow-emerald-200"
                            >
                                {processing ? 'Mapping Ledger...' : modalMode === 'add' ? 'Confirm Payment & Sync Ledger' : 'Update Record'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-rose-600 mb-4">Reconcile Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6 flex flex-col gap-1">
                            <span>Deleting this record will simultaneously erase its linked Journal Entry <strong>{itemToDelete?.journal_entry?.entry_number}</strong> to preserve balance sheets properly.</span>
                            <span className="text-xs text-rose-500 font-bold mt-2">Proceed with cascading deletion?</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                onClick={executeDelete}
                                disabled={processing}
                                className="!bg-rose-600 hover:!bg-rose-700 focus:!ring-rose-500"
                            >
                                {processing ? 'Archiving...' : 'Delete Completely'}
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>

            </div>
        </AccountingStaffLayout>
    );
}
