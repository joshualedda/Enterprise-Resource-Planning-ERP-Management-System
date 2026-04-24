import React, { useState, useCallback, useRef, useEffect } from 'react';
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

export default function CivilStatus({ statuses, filters: serverFilters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState(null);

    // Filter state
    const [search, setSearch] = useState(serverFilters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(serverFilters.status ?? '');
    const [sortField, setSortField] = useState('');
    const [sortDir, setSortDir] = useState('asc');

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        civil_status_code: '',
        civil_status_name: '',
        status: 'active',
    });

    // Debounced server request
    const isInitial = useRef(true);
    const applyFilters = useCallback((params) => {
        router.get(
            route('staff.hr.civil-status'),
            {
                search: params.search || undefined,
                status: params.status || undefined,
            },
            { preserveState: true, replace: true }
        );
    }, []);

    useEffect(() => {
        if (isInitial.current) { isInitial.current = false; return; }
        const id = setTimeout(() => applyFilters({ search, status: statusFilter }), 350);
        return () => clearTimeout(id);
    }, [search, statusFilter]);

    const handleReset = () => {
        setSearch('');
        setStatusFilter('');
    };

    // Client-side sorting for current page
    const rows = statuses.data ?? [];
    const sorted = [...rows].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = (a[sortField] ?? '').toString().toLowerCase();
        const bVal = (b[sortField] ?? '').toString().toLowerCase();
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
        setEditingStatus(null);
        setData({
            civil_status_code: '',
            civil_status_name: '',
            status: 'active',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleEdit = (statusRecord) => {
        setEditingStatus(statusRecord);
        setData({
            civil_status_code: statusRecord.civil_status_code || '',
            civil_status_name: statusRecord.civil_status_name || '',
            status: statusRecord.status || 'active',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setData({
            civil_status_code: '',
            civil_status_name: '',
            status: 'active',
        });
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();

        if (editingStatus) {
            put(route('staff.hr.civil-status.update', editingStatus.id), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Civil Status updated successfully!');
                },
            });
        } else {
            post(route('staff.hr.civil-status.store'), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Civil Status created successfully!');
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this civil status?')) {
            router.delete(route('staff.hr.civil-status.destroy', id), {
                onSuccess: () => toast.success('Civil Status deleted successfully!'),
            });
        }
    };

    const inputClass = "mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm py-2.5";
    const selectClass = "mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm py-2.5";
    const labelClass = "font-bold text-slate-700 text-[10px] uppercase tracking-widest text-slate-400";

    return (
        <HRStaffLayout>
            <Head title="Civil Status Setup" />
            <Toaster position="top-right" />

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Civil Status</h1>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">Manage employee civil status options.</p>
                    </div>

                    <PrimaryButton
                        onClick={handleAdd}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Add Civil Status
                    </PrimaryButton>
                </div>

                <Filters
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by code or name..."
                    onReset={handleReset}
                    filters={[
                        {
                            key: 'status',
                            label: 'Status',
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: [
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ],
                        },
                    ]}
                />

                <Table
                    title="📋 Civil Status List"
                    subtitle="All configured employee civil statuses"
                    badgeCount={statuses.total}
                    badgeColor="bg-indigo-50 text-indigo-600"
                    columns={[
                        <button key="code" onClick={() => toggleSort('civil_status_code')} className="flex items-center gap-1 hover:text-indigo-600 transition">
                            Code <SortIcon field="civil_status_code" />
                        </button>,
                        <button key="name" onClick={() => toggleSort('civil_status_name')} className="flex items-center gap-1 hover:text-indigo-600 transition">
                            Civil Status Name <SortIcon field="civil_status_name" />
                        </button>,
                        'Status',
                        'Actions'
                    ]}
                >
                    {sorted.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-12 text-slate-400 text-sm font-medium">
                                No civil statuses found matching your filters.
                            </td>
                        </tr>
                    ) : sorted.map((statusItem) => (
                        <Tr key={statusItem.id}>
                            <Td>
                                <span className="text-sm font-bold text-slate-800">{statusItem.civil_status_code}</span>
                            </Td>
                            <Td>
                                <span className="text-sm font-medium text-slate-600">{statusItem.civil_status_name}</span>
                            </Td>
                            <Td>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${statusItem.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                    {statusItem.status}
                                </span>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(statusItem)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(statusItem.id)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                {statuses.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <p className="text-xs text-slate-400 font-medium">
                            Showing <span className="font-black text-slate-600">{statuses.from}–{statuses.to}</span> of{' '}
                            <span className="font-black text-slate-600">{statuses.total}</span> statuses
                        </p>
                        <Pagination
                            currentPage={statuses.current_page}
                            totalPages={statuses.last_page}
                            onPageChange={(page) =>
                                router.get(route('staff.hr.civil-status'), {
                                    search: search || undefined,
                                    status: statusFilter || undefined,
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
                                {editingStatus ? 'Edit Civil Status' : 'Add Civil Status'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel value="Code" className={labelClass} />
                                <TextInput
                                    value={data.civil_status_code}
                                    onChange={e => setData('civil_status_code', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. S"
                                    required
                                />
                                <InputError message={errors.civil_status_code} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Civil Status Name" className={labelClass} />
                                <TextInput
                                    value={data.civil_status_name}
                                    onChange={e => setData('civil_status_name', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Single"
                                    required
                                />
                                <InputError message={errors.civil_status_name} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Active Status" className={labelClass} />
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className={selectClass}
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <InputError message={errors.status} className="mt-1" />
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
                                    {processing ? 'Saving...' : 'Save Civil Status'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </HRStaffLayout>
    );
}
