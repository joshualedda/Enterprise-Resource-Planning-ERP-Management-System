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

const ACCOUNT_TYPES = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
];

const NORMAL_BALANCES = [
    { value: 'debit', label: 'Debit' },
    { value: 'credit', label: 'Credit' },
];

const TYPE_COLORS = {
    'asset': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'liability': 'bg-rose-50 text-rose-700 border-rose-200',
    'equity': 'bg-violet-50 text-violet-700 border-violet-200',
    'income': 'bg-blue-50 text-blue-700 border-blue-200',
    'expense': 'bg-amber-50 text-amber-700 border-amber-200',
};

function TypeBadge({ type }) {
    const color = TYPE_COLORS[type] || 'bg-slate-50 text-slate-700 border-slate-200';
    return <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${color}`}>{type}</span>;
}

function KpiCard({ label, value, iconPath, iconBg }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
            </div>
            <div>
                <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">{label}</p>
            </div>
        </div>
    );
}

export default function ChartAccount({ accounts, stats, filters: serverFilters = {}, flash }) {
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Filters Dropdown State
    const [search, setSearch] = useState(serverFilters.search ?? '');
    const [typeFilter, setTypeFilter] = useState(serverFilters.account_type ?? 'All');
    const [statusFilter, setStatusFilter] = useState(serverFilters.status ?? 'All');

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(route('staff.accounting.chart-of-accounts.index'), {
                search: search || undefined,
                account_type: typeFilter !== 'All' ? typeFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, typeFilter, statusFilter]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        account_code: '',
        account_name: '',
        account_type: 'asset',
        normal_balance: 'debit',
        is_active: true,
    });

    const openModal = (mode, p = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && p) {
            setData({
                id: p.id,
                account_code: p.account_code || '',
                account_name: p.account_name || '',
                account_type: p.account_type || 'asset',
                normal_balance: p.normal_balance || 'debit',
                is_active: p.is_active ?? true,
            });
        } else {
            reset();
            setData('account_type', 'asset');
            setData('normal_balance', 'debit');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post(route('staff.accounting.chart-of-accounts.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            put(route('staff.accounting.chart-of-accounts.update', data.id), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = (p) => {
        setItemToDelete(p);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.accounting.chart-of-accounts.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
                onFinish: () => setItemToDelete(null),
            });
        }
    };

    const kpis = [
        {
            label: 'Total Accounts', value: stats.total,
            iconPath: 'M3 10h18M3 14h18M3 6h18M3 18h18',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'Assets', value: stats.assets,
            iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Liabilities', value: stats.liabilities,
            iconPath: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
            iconBg: 'bg-rose-50 text-rose-600',
        },
        {
            label: 'Active Accounts', value: stats.active,
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-amber-50 text-amber-600',
        },
    ];

    return (
        <AccountingStaffLayout header="Chart of Accounts">
            <Head title="Chart of Accounts — Accounting" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Chart of Accounts</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Manage the master index of all internal financial accounts.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-sm shadow-amber-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Account
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by account code or name…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none appearance-none cursor-pointer transition capitalize"
                        >
                            <option value="All">All Types</option>
                            {ACCOUNT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none appearance-none cursor-pointer transition capitalize"
                        >
                            <option value="All">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>

                <Table
                    title="🧾 General Ledger Accounts"
                    subtitle="Track your chart of accounts list"
                    badgeCount={accounts.total}
                    columns={['Account Code', 'Account Name', 'Type', 'Normal Balance', 'Status', 'Actions']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl">📂</div>
                            <p className="text-sm font-black text-slate-300">No accounts found</p>
                            <p className="text-xs text-slate-300">Adjust filters or create a new account.</p>
                        </div>
                    }
                    footer={
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                Page {accounts.current_page} of {accounts.last_page} &nbsp;·&nbsp; {accounts.total} accounts
                            </p>
                            <Pagination 
                                currentPage={accounts.current_page} 
                                totalPages={accounts.last_page} 
                                onPageChange={(page) => {
                                    router.get(route(route().current()), {
                                        search,
                                        account_type: typeFilter,
                                        status: statusFilter,
                                        page
                                    }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    }
                >
                    {accounts.data.map(acc => (
                        <Tr key={acc.id}>
                            <Td className="text-sm font-black text-slate-700">{acc.account_code}</Td>
                            <Td className="text-sm font-bold text-slate-800">{acc.account_name}</Td>
                            <Td><TypeBadge type={acc.account_type} /></Td>
                            <Td className="text-sm font-bold text-slate-500 capitalize">{acc.normal_balance}</Td>
                            <Td>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border capitalize ${acc.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                    {acc.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => openModal('edit', acc)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                        Edit
                                    </button>
                                    <button onClick={() => confirmDelete(acc)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                        Delete
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                {/* Form Modal */}
                <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                    <form onSubmit={submitForm} className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">
                            {modalMode === 'add' ? 'Create Account' : 'Edit Account'}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="account_code" value="Account Code *" />
                                <TextInput id="account_code" value={data.account_code} onChange={e => setData('account_code', e.target.value)} className="mt-1 block w-full focus:ring-amber-500 focus:border-amber-500" required />
                                <InputError message={errors.account_code} className="mt-2" />
                            </div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="account_name" value="Account Name *" />
                                <TextInput id="account_name" value={data.account_name} onChange={e => setData('account_name', e.target.value)} className="mt-1 block w-full focus:ring-amber-500 focus:border-amber-500" required />
                                <InputError message={errors.account_name} className="mt-2" />
                            </div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="account_type" value="Account Type *" />
                                <select id="account_type" value={data.account_type} onChange={e => setData('account_type', e.target.value)} className="mt-1 block w-full border-slate-300 focus:border-amber-500 focus:ring-amber-500 rounded-xl shadow-sm text-sm" required>
                                    {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <InputError message={errors.account_type} className="mt-2" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="normal_balance" value="Normal Balance *" />
                                <select id="normal_balance" value={data.normal_balance} onChange={e => setData('normal_balance', e.target.value)} className="mt-1 block w-full border-slate-300 focus:border-amber-500 focus:ring-amber-500 rounded-xl shadow-sm text-sm" required>
                                    {NORMAL_BALANCES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                </select>
                                <InputError message={errors.normal_balance} className="mt-2" />
                            </div>

                            <div className="col-span-2 flex items-center mt-2">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded border-slate-300 text-amber-600 shadow-sm focus:ring-amber-500" />
                                    <span className="ml-2 text-sm font-bold text-slate-700">Account is Active</span>
                                </label>
                                <InputError message={errors.is_active} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500">
                                {modalMode === 'add' ? 'Save Account' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-rose-600 mb-4">Confirm Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete <span className="font-bold text-slate-800">[{itemToDelete?.account_code}] {itemToDelete?.account_name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                onClick={executeDelete}
                                disabled={processing}
                                className="!bg-rose-600 hover:!bg-rose-700 focus:!ring-rose-500 block"
                            >
                                {processing ? 'Deleting...' : 'Delete'}
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </AccountingStaffLayout>
    );
}
