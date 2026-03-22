import { useState, useEffect, useRef } from 'react';
import ProductionStaffLayout from '@/Layouts/ProductionStaffLayout';
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

function statusBadge(status) {
    switch (status) {
        case 'scheduled':  return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'in_progress': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'completed':  return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        default:           return 'bg-slate-50 text-slate-400 border-slate-100';
    }
}

function fmtDt(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ProductionRuns({ runs, orderItems = [], filters = {}, flash }) {
    const rows = runs.data || [];
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const t = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(t);
        }
        if (flash?.error) setAlertMessage(flash.error);
    }, [flash]);

    // ── Filters ──
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) { isInitialRender.current = false; return; }
        const id = setTimeout(() => {
            router.get(route('staff.production.runs.index'), {
                search: search || undefined,
                status: statusFilter || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(id);
    }, [search, statusFilter, dateFrom, dateTo]);

    // ── Modal state ──
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        production_order_item_id: '',
        run_number: '',
        start_time: '',
        end_time: '',
        status: 'scheduled',
    });

    const openModal = (mode, r = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && r) {
            setData({
                id: r.id,
                production_order_item_id: r.production_order_item_id,
                run_number: r.run_number || '',
                start_time: r.start_time ? r.start_time.substring(0, 16) : '',
                end_time: r.end_time ? r.end_time.substring(0, 16) : '',
                status: r.status || 'scheduled',
            });
        } else {
            setData({
                id: '',
                production_order_item_id: '',
                run_number: 'RUN-' + Math.floor(100000 + Math.random() * 900000),
                start_time: '',
                end_time: '',
                status: 'scheduled',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); reset(); clearErrors(); };

    const submitForm = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post(route('staff.production.runs.store'), { onSuccess: closeModal });
        } else {
            put(route('staff.production.runs.update', data.id), { onSuccess: closeModal });
        }
    };

    const confirmDelete = (r) => { setItemToDelete(r); setIsDeleteModalOpen(true); };
    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.production.runs.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    return (
        <ProductionStaffLayout>
            <Head title="Production Runs — Production" />
            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Production Runs</h1>
                        <p className="text-slate-500 font-medium mt-1">Log and track individual production run executions.</p>
                    </div>
                    <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Log Run
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Search Run #</label>
                            <input
                                type="text" placeholder="Search RUN..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-3 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none">
                                <option value="">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">From</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">To</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Table
                    title="🏃 Run Logs"
                    subtitle="Execution log for all production runs"
                    badgeCount={runs.total}
                    columns={['Run #', 'Order Item', 'Start Time', 'End Time', 'Status', 'Actions']}
                    footer={runs.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between gap-4">
                            <Pagination
                                currentPage={runs.current_page} totalPages={runs.last_page}
                                onPageChange={(page) => router.get(route('staff.production.runs.index'), { ...filters, page }, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    )}
                >
                    {rows.map((r) => (
                        <Tr key={r.id}>
                            <Td className="text-sm font-black text-slate-800 tracking-tight">{r.run_number}</Td>
                            <Td>
                                <p className="text-xs font-bold text-blue-600">{r.order_item?.production_order?.order_number ?? '—'}</p>
                                <p className="text-[10px] font-medium text-slate-400">{r.order_item?.product?.name ?? '—'}</p>
                            </Td>
                            <Td className="text-xs text-slate-500 font-medium">{fmtDt(r.start_time)}</Td>
                            <Td className="text-xs text-slate-500 font-medium">{fmtDt(r.end_time)}</Td>
                            <Td>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-tighter ${statusBadge(r.status)}`}>
                                    {r.status.replace('_', ' ')}
                                </span>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => openModal('edit', r)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">Edit</button>
                                    <button onClick={() => confirmDelete(r)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">Delete</button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                {/* Create / Edit Modal */}
                <Modal show={isModalOpen} onClose={closeModal} maxWidth="lg">
                    <form onSubmit={submitForm} className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {modalMode === 'add' ? 'Log Production Run' : 'Edit Production Run'}
                            </h2>
                            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="production_order_item_id" value="Production Order Item *" />
                                <select
                                    id="production_order_item_id"
                                    value={data.production_order_item_id}
                                    onChange={e => setData('production_order_item_id', e.target.value)}
                                    className="mt-1 block w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm text-sm"
                                    required
                                >
                                    <option value="">Select order item...</option>
                                    {(orderItems || []).map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.production_order_item_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="run_number" value="Run Number *" />
                                <TextInput
                                    id="run_number" value={data.run_number}
                                    onChange={e => setData('run_number', e.target.value)}
                                    className="mt-1 block w-full" required
                                />
                                <InputError message={errors.run_number} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Start Time" />
                                    <TextInput
                                        type="datetime-local" value={data.start_time}
                                        onChange={e => setData('start_time', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.start_time} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="End Time" />
                                    <TextInput
                                        type="datetime-local" value={data.end_time}
                                        onChange={e => setData('end_time', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.end_time} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="run_status" value="Status *" />
                                <select
                                    id="run_status" value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="mt-1 block w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm text-sm"
                                    required
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                            <SecondaryButton onClick={closeModal} className="!rounded-xl">Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} className="!rounded-xl shadow-lg shadow-blue-100">
                                {modalMode === 'add' ? 'Log Run' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-black text-slate-800 mb-2 tracking-tight">Confirm Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Are you sure you want to delete run <span className="font-bold text-slate-800">"{itemToDelete?.run_number}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} className="!rounded-xl">Cancel</SecondaryButton>
                            <PrimaryButton onClick={executeDelete} disabled={processing} className="!bg-rose-600 !rounded-xl shadow-lg shadow-rose-100">
                                Delete Run
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </ProductionStaffLayout>
    );
}
