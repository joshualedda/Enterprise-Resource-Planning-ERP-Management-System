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

function fmtDt(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function MaterialIssues({ issues, runs = [], rawProducts = [], filters = {}, flash }) {
    const rows = issues.data || [];
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
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) { isInitialRender.current = false; return; }
        const id = setTimeout(() => {
            router.get(route('staff.production.material-issues.index'), {
                search: search || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(id);
    }, [search, dateFrom, dateTo]);

    // ── Modal state ──
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        production_run_id: '',
        material_id: '',
        quantity: '',
        uom: 'kg',
        issue_date: new Date().toISOString().slice(0, 16),
    });

    const openModal = (mode, row = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && row) {
            setData({
                id: row.id,
                production_run_id: row.production_run_id,
                material_id: row.material_id,
                quantity: row.quantity,
                uom: row.uom,
                issue_date: row.issue_date ? row.issue_date.substring(0, 16) : '',
            });
        } else {
            setData({
                id: '',
                production_run_id: '',
                material_id: '',
                quantity: '',
                uom: 'kg',
                issue_date: new Date().toISOString().slice(0, 16),
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); reset(); clearErrors(); };

    const submitForm = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post(route('staff.production.material-issues.store'), { onSuccess: closeModal });
        } else {
            put(route('staff.production.material-issues.update', data.id), { onSuccess: closeModal });
        }
    };

    const confirmDelete = (row) => { setItemToDelete(row); setIsDeleteModalOpen(true); };
    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.production.material-issues.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    return (
        <ProductionStaffLayout>
            <Head title="Material Issues — Production" />
            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Material Issues</h1>
                        <p className="text-slate-500 font-medium mt-1">Track raw material consumption issued to production runs.</p>
                    </div>
                    <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Issue Material
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Search Material / Run</label>
                            <input
                                type="text" placeholder="Search..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-3 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                            />
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
                    title="📦 Material Issue Log"
                    subtitle="Raw materials consumed by production runs"
                    badgeCount={issues.total}
                    columns={['Run #', 'Material', 'Quantity', 'UoM', 'Issue Date', 'Actions']}
                    footer={issues.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between gap-4">
                            <Pagination
                                currentPage={issues.current_page} totalPages={issues.last_page}
                                onPageChange={(page) => router.get(route('staff.production.material-issues.index'), { ...filters, page }, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    )}
                >
                    {rows.map((row) => (
                        <Tr key={row.id}>
                            <Td>
                                <p className="text-xs font-black text-blue-600">{row.run?.run_number ?? '—'}</p>
                            </Td>
                            <Td>
                                <p className="text-xs font-bold text-slate-800">{row.material?.name ?? '—'}</p>
                            </Td>
                            <Td className="text-sm font-black text-slate-800">{Number(row.quantity).toLocaleString()}</Td>
                            <Td>
                                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest">
                                    {row.uom}
                                </span>
                            </Td>
                            <Td className="text-xs text-slate-500 font-medium">{fmtDt(row.issue_date)}</Td>
                            <Td>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => openModal('edit', row)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">Edit</button>
                                    <button onClick={() => confirmDelete(row)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">Delete</button>
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
                                {modalMode === 'add' ? 'Issue Material' : 'Edit Material Issue'}
                            </h2>
                            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Production Run */}
                            <div>
                                <InputLabel htmlFor="production_run_id" value="Production Run *" />
                                <select
                                    id="production_run_id"
                                    value={data.production_run_id}
                                    onChange={e => setData('production_run_id', e.target.value)}
                                    className="mt-1 block w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm text-sm"
                                    required
                                >
                                    <option value="">Select run...</option>
                                    {(runs || []).map(r => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.production_run_id} className="mt-2" />
                            </div>

                            {/* Material */}
                            <div>
                                <InputLabel htmlFor="material_id" value="Material (Raw Product) *" />
                                <select
                                    id="material_id"
                                    value={data.material_id}
                                    onChange={e => setData('material_id', e.target.value)}
                                    className="mt-1 block w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm text-sm"
                                    required
                                >
                                    <option value="">Select material...</option>
                                    {(rawProducts || []).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.material_id} className="mt-2" />
                            </div>

                            {/* Quantity & UoM */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="quantity" value="Quantity *" />
                                    <TextInput
                                        id="quantity" type="number" step="0.01" min="0"
                                        value={data.quantity}
                                        onChange={e => setData('quantity', e.target.value)}
                                        className="mt-1 block w-full" required
                                    />
                                    <InputError message={errors.quantity} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="uom" value="Unit of Measure *" />
                                    <TextInput
                                        id="uom" value={data.uom}
                                        onChange={e => setData('uom', e.target.value)}
                                        className="mt-1 block w-full" required
                                    />
                                    <InputError message={errors.uom} className="mt-2" />
                                </div>
                            </div>

                            {/* Issue Date */}
                            <div>
                                <InputLabel htmlFor="issue_date" value="Issue Date *" />
                                <TextInput
                                    id="issue_date" type="datetime-local"
                                    value={data.issue_date}
                                    onChange={e => setData('issue_date', e.target.value)}
                                    className="mt-1 block w-full" required
                                />
                                <InputError message={errors.issue_date} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                            <SecondaryButton onClick={closeModal} className="!rounded-xl">Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} className="!rounded-xl shadow-lg shadow-blue-100">
                                {modalMode === 'add' ? 'Issue Material' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete confirm */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-black text-slate-800 mb-2 tracking-tight">Confirm Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Are you sure you want to delete this material issue record? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} className="!rounded-xl">Cancel</SecondaryButton>
                            <PrimaryButton onClick={executeDelete} disabled={processing} className="!bg-rose-600 !rounded-xl shadow-lg shadow-rose-100">
                                Delete
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </ProductionStaffLayout>
    );
}
