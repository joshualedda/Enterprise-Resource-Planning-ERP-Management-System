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

export default function OutputPosting({ postings, runs = [], products = [], filters = {}, flash }) {
    const rows = postings.data || [];
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');

    useEffect(() => {
        if (flash?.success) {
            setAlertType('success');
            setAlertMessage(flash.success);
            const t = setTimeout(() => setAlertMessage(''), 3500);
            return () => clearTimeout(t);
        }
        if (flash?.error) {
            setAlertType('error');
            setAlertMessage(flash.error);
        }
    }, [flash]);

    // ── Filters ──
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) { isInitialRender.current = false; return; }
        const id = setTimeout(() => {
            router.get(route('staff.production.output-posting.index'), {
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
        product_id: '',
        quantity: '',
        uom: 'pcs',
        posting_date: new Date().toISOString().slice(0, 16),
    });

    const openModal = (mode, row = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && row) {
            setData({
                id: row.id,
                production_run_id: row.production_run_id,
                product_id: row.product_id,
                quantity: row.quantity,
                uom: row.uom,
                posting_date: row.posting_date ? row.posting_date.substring(0, 16) : '',
            });
        } else {
            setData({
                id: '',
                production_run_id: '',
                product_id: '',
                quantity: '',
                uom: 'pcs',
                posting_date: new Date().toISOString().slice(0, 16),
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); reset(); clearErrors(); };

    const submitForm = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post(route('staff.production.output-posting.store'), { onSuccess: closeModal });
        } else {
            put(route('staff.production.output-posting.update', data.id), { onSuccess: closeModal });
        }
    };

    const confirmDelete = (row) => { setItemToDelete(row); setIsDeleteModalOpen(true); };
    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.production.output-posting.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    return (
        <ProductionStaffLayout>
            <Head title="Output Posting — Production" />
            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Output Posting</h1>
                        <p className="text-slate-500 font-medium mt-1">Post finished products from production runs — stock updates automatically.</p>
                    </div>
                    <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Post Output
                    </button>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                    </svg>
                    <p className="text-xs font-semibold text-emerald-700">
                        Every output posting automatically updates the product's inventory stock in the e-commerce catalog.
                        Editing or deleting a posting will reverse and re-apply the stock adjustments accordingly.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Search Product / Run</label>
                            <input
                                type="text" placeholder="Search..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-3 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">From</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">To</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Table
                    title="✅ Output Postings"
                    subtitle="Finished goods posted from production runs"
                    badgeCount={postings.total}
                    columns={['Run #', 'Finished Product', 'Qty', 'UoM', 'Posted By', 'Posting Date', 'Actions']}
                    footer={postings.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between gap-4">
                            <Pagination
                                currentPage={postings.current_page} totalPages={postings.last_page}
                                onPageChange={(page) => router.get(route('staff.production.output-posting.index'), { ...filters, page }, { preserveState: true, preserveScroll: true })}
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
                                <p className="text-xs font-bold text-slate-800">{row.product?.product ?? '—'}</p>
                            </Td>
                            <Td className="text-sm font-black text-emerald-600">{Number(row.quantity).toLocaleString()}</Td>
                            <Td>
                                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest">
                                    {row.uom}
                                </span>
                            </Td>
                            <Td className="text-xs text-slate-500 font-medium">{row.posted_by_user?.name ?? '—'}</Td>
                            <Td className="text-xs text-slate-500 font-medium">{fmtDt(row.posting_date)}</Td>
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
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                    {modalMode === 'add' ? 'Post Output' : 'Edit Output Posting'}
                                </h2>
                                {modalMode === 'edit' && (
                                    <p className="text-xs text-amber-600 font-semibold mt-1">⚠ Editing will reverse old stock and apply new stock automatically.</p>
                                )}
                            </div>
                            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Production Run */}
                            <div>
                                <InputLabel htmlFor="run_id" value="Production Run *" />
                                <select
                                    id="run_id"
                                    value={data.production_run_id}
                                    onChange={e => setData('production_run_id', e.target.value)}
                                    className="mt-1 block w-full border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm text-sm"
                                    required
                                >
                                    <option value="">Select production run...</option>
                                    {(runs || []).map(r => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.production_run_id} className="mt-2" />
                            </div>

                            {/* Product */}
                            <div>
                                <InputLabel htmlFor="product_id" value="Finished Product (Catalog) *" />
                                <select
                                    id="product_id"
                                    value={data.product_id}
                                    onChange={e => setData('product_id', e.target.value)}
                                    className="mt-1 block w-full border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm text-sm"
                                    required
                                >
                                    <option value="">Select product...</option>
                                    {(products || []).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.product_id} className="mt-2" />
                            </div>

                            {/* Quantity & UoM */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="out_quantity" value="Quantity *" />
                                    <TextInput
                                        id="out_quantity" type="number" step="0.01" min="0.01"
                                        value={data.quantity}
                                        onChange={e => setData('quantity', e.target.value)}
                                        className="mt-1 block w-full" required
                                    />
                                    <InputError message={errors.quantity} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="out_uom" value="Unit of Measure *" />
                                    <TextInput
                                        id="out_uom" value={data.uom}
                                        onChange={e => setData('uom', e.target.value)}
                                        className="mt-1 block w-full" required
                                    />
                                    <InputError message={errors.uom} className="mt-2" />
                                </div>
                            </div>

                            {/* Posting Date */}
                            <div>
                                <InputLabel htmlFor="posting_date" value="Posting Date" />
                                <TextInput
                                    id="posting_date" type="datetime-local"
                                    value={data.posting_date}
                                    onChange={e => setData('posting_date', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.posting_date} className="mt-2" />
                            </div>

                            {/* Stock update notice */}
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-[11px] font-semibold text-emerald-700">
                                    This will add <strong>{data.quantity || 0} {data.uom}</strong> to the selected product's inventory stock.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                            <SecondaryButton onClick={closeModal} className="!rounded-xl">Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} className="!rounded-xl !bg-emerald-600 hover:!bg-emerald-700 shadow-lg shadow-emerald-100">
                                {modalMode === 'add' ? 'Post Output' : 'Save & Adjust Stock'}
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
                        <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                            Are you sure you want to delete this output posting? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-6">
                            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                            </svg>
                            <p className="text-[11px] font-semibold text-amber-700">
                                <strong>{itemToDelete?.quantity} {itemToDelete?.uom}</strong> will be deducted from <strong>{itemToDelete?.product?.product}</strong>'s stock.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} className="!rounded-xl">Cancel</SecondaryButton>
                            <PrimaryButton onClick={executeDelete} disabled={processing} className="!bg-rose-600 !rounded-xl shadow-lg shadow-rose-100">
                                Delete & Reverse Stock
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </ProductionStaffLayout>
    );
}
