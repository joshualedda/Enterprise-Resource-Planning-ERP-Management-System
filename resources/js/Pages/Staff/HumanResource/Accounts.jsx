import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import HRStaffLayout from '@/Layouts/HRStaffLayout';
import { Head, useForm, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import toast, { Toaster } from 'react-hot-toast';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Filters from '@/Components/Utils/Filters';
import SearchableSelect from '@/Components/Utils/SearchableSelect';

export default function Accounts({ accounts, employees, users, filters: serverFilters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    // Filter state for table
    const [search, setSearch] = useState(serverFilters.search ?? '');
    const [accessFilter, setAccessFilter] = useState(serverFilters.access_level ?? '');
    const [sortField, setSortField] = useState('');
    const [sortDir, setSortDir] = useState('asc');

    const getRoleName = (roleId) => {
        const roles = {
            1: 'Customer',
            2: 'Human Resource',
            3: 'Admin',
            4: 'Inventory',
            5: 'Production',
            6: 'Accounting',
            7: 'Cashier',
            8: 'Marketing and Sales'
        };
        return roles[roleId] || 'User';
    };

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        employee_id: '',
        user_id: '',
        access_level: 'Staff',
    });

    // Options for searchable selects
    const employeeOptions = useMemo(() => 
        employees.map(emp => ({ 
            value: emp.id, 
            label: `${emp.last_name}, ${emp.first_name}` 
        })), 
    [employees]);

    const userOptions = useMemo(() => 
        users.map(user => ({ 
            value: user.id, 
            label: `${user.last_name}, ${user.first_name} (${user.email})` 
        })), 
    [users]);

    // Debounced server request for main table
    const isInitial = useRef(true);
    const applyFilters = useCallback((params) => {
        router.get(
            route('staff.hr.accounts'),
            {
                search: params.search || undefined,
                access_level: params.access_level || undefined,
            },
            { preserveState: true, replace: true }
        );
    }, []);

    useEffect(() => {
        if (isInitial.current) { isInitial.current = false; return; }
        const id = setTimeout(() => applyFilters({ search, access_level: accessFilter }), 350);
        return () => clearTimeout(id);
    }, [search, accessFilter]);

    const handleReset = () => {
        setSearch('');
        setAccessFilter('');
    };

    // Client-side sorting
    const rows = accounts.data ?? [];
    const sorted = [...rows].sort((a, b) => {
        if (!sortField) return 0;
        let aVal = '', bVal = '';
        
        if (sortField === 'employee') {
            aVal = `${a.employee?.last_name} ${a.employee?.first_name}`.toLowerCase();
            bVal = `${b.employee?.last_name} ${b.employee?.first_name}`.toLowerCase();
        } else if (sortField === 'user') {
            aVal = `${a.user?.last_name} ${a.user?.first_name}`.toLowerCase();
            bVal = `${b.user?.last_name} ${b.user?.first_name}`.toLowerCase();
        } else {
            aVal = (a[sortField] ?? '').toString().toLowerCase();
            bVal = (b[sortField] ?? '').toString().toLowerCase();
        }

        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }) => (
        <svg className={`inline w-3 h-3 ml-1 transition-transform ${sortField === field && sortDir === 'desc' ? 'rotate-180' : ''} ${sortField === field ? 'text-indigo-500' : 'text-slate-300'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 10l5-5 5 5H5z" />
        </svg>
    );

    const handleAdd = () => {
        setEditingAccount(null);
        setData({
            employee_id: '',
            user_id: '',
            access_level: 'Staff',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setData({
            employee_id: account.employee_id || '',
            user_id: account.user_id || '',
            access_level: account.access_level || 'Staff',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();

        if (editingAccount) {
            put(route('staff.hr.accounts.update', editingAccount.id), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Account updated successfully!');
                },
            });
        } else {
            post(route('staff.hr.accounts.store'), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Account linked successfully!');
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to unlink this account?')) {
            router.delete(route('staff.hr.accounts.destroy', id), {
                onSuccess: () => toast.success('Account unlinked successfully!'),
            });
        }
    };

    const inputClass = "mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm py-2.5";
    const labelClass = "font-bold text-slate-700 text-[10px] uppercase tracking-widest text-slate-400";

    return (
        <HRStaffLayout>
            <Head title="Account Management" />
            <Toaster position="top-right" />

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Accounts</h1>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">Link employees to system user accounts.</p>
                    </div>

                    <PrimaryButton
                        onClick={handleAdd}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Link Account
                    </PrimaryButton>
                </div>

                <Filters
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name or email..."
                    onReset={handleReset}
                    filters={[
                        {
                            key: 'access_level',
                            label: 'Access Level',
                            value: accessFilter,
                            onChange: setAccessFilter,
                            options: [
                                { value: 'admin', label: 'Admin' },
                                { value: 'staff', label: 'Staff' },
                                { value: 'inventory', label: 'Inventory' },
                                { value: 'marketing', label: 'Marketing' },
                                { value: 'production', label: 'Production' },
                            ],
                        },
                    ]}
                />

                <Table
                    title="👤 Account Links"
                    subtitle="Mapping of employees to user logins"
                    badgeCount={accounts.total}
                    badgeColor="bg-indigo-50 text-indigo-600"
                    columns={[
                        <button key="emp" onClick={() => toggleSort('employee')} className="flex items-center gap-1 hover:text-indigo-600 transition">
                            Employee <SortIcon field="employee" />
                        </button>,
                        <button key="user" onClick={() => toggleSort('user')} className="flex items-center gap-1 hover:text-indigo-600 transition">
                            User Account <SortIcon field="user" />
                        </button>,
                        'Access Level',
                        'Actions'
                    ]}
                >
                    {sorted.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-12 text-slate-400 text-sm font-medium">
                                No linked accounts found.
                            </td>
                        </tr>
                    ) : sorted.map((acc) => (
                        <Tr key={acc.id}>
                            <Td>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">{acc.employee?.first_name} {acc.employee?.last_name}</span>
                                    <span className="text-[10px] text-slate-400">{acc.employee?.employee_code}</span>
                                </div>
                            </Td>
                            <Td>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-600">{acc.user?.first_name} {acc.user?.last_name}</span>
                                    <span className="text-[10px] text-slate-400">{acc.user?.email}</span>
                                </div>
                            </Td>
                            <Td>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                    {acc.access_level}
                                </span>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(acc)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(acc.id)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                {accounts.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <p className="text-xs text-slate-400 font-medium">
                            Showing <span className="font-black text-slate-600">{accounts.from}–{accounts.to}</span> of{' '}
                            <span className="font-black text-slate-600">{accounts.total}</span> records
                        </p>
                        <Pagination
                            currentPage={accounts.current_page}
                            totalPages={accounts.last_page}
                            onPageChange={(page) =>
                                router.get(route('staff.hr.accounts'), {
                                    search: search || undefined,
                                    access_level: accessFilter || undefined,
                                    page,
                                }, { preserveState: true })
                            }
                        />
                    </div>
                )}

                <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900">
                                {editingAccount ? 'Edit Account Link' : 'Link New Account'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel value="Employee" className={labelClass} />
                                <SearchableSelect 
                                    options={employeeOptions}
                                    value={data.employee_id}
                                    onChange={val => setData('employee_id', val)}
                                    placeholder="Select Employee"
                                    searchPlaceholder="Search by name..."
                                    error={errors.employee_id}
                                    className="mt-1"
                                />
                                <InputError message={errors.employee_id} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="User Account" className={labelClass} />
                                <SearchableSelect 
                                    options={userOptions}
                                    value={data.user_id}
                                    onChange={val => {
                                        setData('user_id', val);
                                        const selectedUser = users.find(u => String(u.id) === String(val));
                                        if (selectedUser) {
                                            setData(prev => ({
                                                ...prev,
                                                user_id: val,
                                                access_level: getRoleName(selectedUser.role_id)
                                            }));
                                        }
                                    }}
                                    placeholder="Select User Account"
                                    searchPlaceholder="Search by name or email..."
                                    error={errors.user_id}
                                    className="mt-1"
                                />
                                <InputError message={errors.user_id} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Assigned Role" className={labelClass} />
                                <TextInput
                                    value={data.access_level}
                                    className={`${inputClass} bg-slate-100 text-slate-500 font-bold cursor-not-allowed`}
                                    readOnly
                                    placeholder="Auto-selected based on user account"
                                />
                                <p className="text-[10px] text-slate-400 mt-1 italic">This role is managed in the User Settings module.</p>
                                <InputError message={errors.access_level} className="mt-1" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 border-2 border-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
                                >
                                    Cancel
                                </button>
                                <PrimaryButton
                                    className="flex-[2] justify-center py-3 bg-indigo-600 rounded-xl shadow-md shadow-indigo-200 text-sm font-black"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : 'Save Account Link'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </HRStaffLayout>
    );
}

