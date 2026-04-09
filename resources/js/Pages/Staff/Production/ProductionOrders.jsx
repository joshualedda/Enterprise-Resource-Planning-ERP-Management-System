import { useState, useMemo, useEffect, useRef } from 'react';
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

const phpFmt = (n) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n);

function statusBadge(status) {
    switch (status) {
        case 'planned': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'in_progress': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
        default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
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

export default function ProductionOrders({ orders, products = [], filters = {}, flash }) {
    const rows = orders.data || [];
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setAlertMessage(flash.error);
        }
    }, [flash]);

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(route('staff.production.production-orders.index'), {
                search: search || undefined,
                status: statusFilter || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, dateFrom, dateTo]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        order_number: '',
        status: 'planned',
        order_date: '',
        scheduled_start_date: '',
        scheduled_end_date: '',
        actual_start_date: '',
        actual_end_date: '',
        items: []
    });

    const openModal = (mode, o = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && o) {
            setData({
                id: o.id,
                order_number: o.order_number || '',
                status: o.status || 'planned',
                order_date: o.order_date || '',
                scheduled_start_date: o.scheduled_start_date || '',
                scheduled_end_date: o.scheduled_end_date || '',
                actual_start_date: o.actual_start_date || '',
                actual_end_date: o.actual_end_date || '',
                items: o.items ? o.items.map(i => ({
                    id: i.id,
                    raw_product_id: i.raw_product_id,
                    quantity: i.quantity,
                    uom: i.uom,
                    status: i.status
                })) : []
            });
        } else {
            reset();
            const newOrderNumber = 'PO-' + Math.floor(100000 + Math.random() * 900000);
            setData({
                id: '',
                order_number: newOrderNumber,
                order_date: new Date().toISOString().split('T')[0],
                status: 'planned',
                scheduled_start_date: '',
                scheduled_end_date: '',
                actual_start_date: '',
                actual_end_date: '',
                items: [{ raw_product_id: '', quantity: 1, uom: 'pcs' }]
            });
        }
        setIsModalOpen(true);
    };

    const addItem = () => {
        setData('items', [...data.items, { raw_product_id: '', quantity: 1, uom: 'pcs', status: 'pending' }]);
    };

    const removeItem = (idx) => {
        const newItems = [...data.items];
        newItems.splice(idx, 1);
        setData('items', newItems);
    };

    const updateItem = (idx, field, val) => {
        const newItems = [...data.items];
        newItems[idx][field] = val;
        setData('items', newItems);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post(route('staff.production.production-orders.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            put(route('staff.production.production-orders.update', data.id), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = (o) => {
        setItemToDelete(o);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.production.production-orders.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    return (
        <ProductionStaffLayout>
            <Head title="Production Orders — Production" />
            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Production Orders</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage and track production runs and items.</p>
                    </div>
                    <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Create Order
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                        <div className="relative flex-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Search Order #</label>
                            <input
                                type="text" placeholder="Search PO..." value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-3 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none">
                                <option value="">All Statuses</option>
                                <option value="planned">Planned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
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

                <Table
                    title="🏭 Production Log"
                    subtitle="Track active and planned production orders"
                    badgeCount={orders.total}
                    columns={['Order #', 'Date', 'Items', 'Status', 'Scheduled', 'Actual', 'Actions']}
                    footer={orders.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between gap-4">
                            <Pagination 
                                currentPage={orders.current_page} totalPages={orders.last_page} 
                                onPageChange={(page) => router.get(route('staff.production.production-orders.index'), { ...filters, page }, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    )}
                >
                    {rows.map((o) => (
                        <Tr key={o.id}>
                            <Td className="text-sm font-black text-slate-800 tracking-tight">{o.order_number}</Td>
                            <Td className="text-xs font-medium text-slate-400">{o.order_date}</Td>
                            <Td>
                                <div className="space-y-1">
                                    {o.items?.slice(0, 2).map(i => (
                                        <div key={i.id} className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            {i.product?.name}: {i.quantity} {i.uom}
                                        </div>
                                    ))}
                                    {o.items?.length > 2 && <p className="text-[9px] text-slate-400 italic">+{o.items.length - 2} more items</p>}
                                </div>
                            </Td>
                            <Td>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-tighter ${statusBadge(o.status)}`}>
                                    {o.status.replace('_', ' ')}
                                </span>
                            </Td>
                            <Td>
                                <p className="text-[10px] font-bold text-slate-500">START: {o.scheduled_start_date || '—'}</p>
                                <p className="text-[10px] font-bold text-slate-500">END: {o.scheduled_end_date || '—'}</p>
                            </Td>
                            <Td>
                                <p className="text-[10px] font-bold text-blue-600">START: {o.actual_start_date || '—'}</p>
                                <p className="text-[10px] font-bold text-blue-600">END: {o.actual_end_date || '—'}</p>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => openModal('edit', o)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                        Edit
                                    </button>
                                    <button onClick={() => confirmDelete(o)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                        Delete
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                <Modal show={isModalOpen} onClose={closeModal} maxWidth="4xl">
                    <form onSubmit={submitForm} className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {modalMode === 'add' ? 'Create Production Order' : 'Edit Production Order'}
                            </h2>
                            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Header Info */}
                            <div className="lg:col-span-1 space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <div>
                                        <InputLabel htmlFor="order_number" value="Order Number *" />
                                        <TextInput id="order_number" value={data.order_number} onChange={e => setData('order_number', e.target.value)} className="mt-1 block w-full" required />
                                        <InputError message={errors.order_number} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="order_date" value="Order Date *" />
                                        <TextInput id="order_date" type="date" value={data.order_date} onChange={e => setData('order_date', e.target.value)} className="mt-1 block w-full" required />
                                        <InputError message={errors.order_date} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="status" value="Status *" />
                                        <select id="status" value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm text-sm" required>
                                            <option value="planned">Planned</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 space-y-4">
                                    <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Scheduling</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <InputLabel value="Sched. Start" className="!text-violet-700" />
                                            <TextInput type="date" value={data.scheduled_start_date} onChange={e => setData('scheduled_start_date', e.target.value)} className="mt-1 block w-full border-violet-200" />
                                        </div>
                                        <div>
                                            <InputLabel value="Sched. End" className="!text-violet-700" />
                                            <TextInput type="date" value={data.scheduled_end_date} onChange={e => setData('scheduled_end_date', e.target.value)} className="mt-1 block w-full border-violet-200" />
                                        </div>
                                    </div>
                                </div>

                                {modalMode === 'edit' && (
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-4">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Actual Execution</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <InputLabel value="Actual Start" className="!text-blue-700" />
                                                <TextInput type="date" value={data.actual_start_date} onChange={e => setData('actual_start_date', e.target.value)} className="mt-1 block w-full border-blue-200" />
                                            </div>
                                            <div>
                                                <InputLabel value="Actual End" className="!text-blue-700" />
                                                <TextInput type="date" value={data.actual_end_date} onChange={e => setData('actual_end_date', e.target.value)} className="mt-1 block w-full border-blue-200" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Items management */}
                            <div className="lg:col-span-2 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Production Items</h3>
                                    <button type="button" onClick={addItem} className="text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                        Add Item
                                    </button>
                                </div>

                                <div className="flex-1 min-h-[300px] border border-slate-100 rounded-2xl overflow-hidden bg-white">
                                    <div className="max-h-[450px] overflow-y-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Raw Product</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Qty</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">UoM</th>
                                                    {modalMode === 'edit' && <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">Status</th>}
                                                    <th className="px-4 py-3 w-12 text-center"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {(data.items || []).map((item, idx) => (
                                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={item.raw_product_id}
                                                                onChange={e => updateItem(idx, 'raw_product_id', e.target.value)}
                                                                className="w-full border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
                                                                required
                                                            >
                                                                <option value="">Select product...</option>
                                                                {(products || []).map(p => (
                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                            <InputError message={errors[`items.${idx}.raw_product_id`]} className="mt-1" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <TextInput
                                                                type="number" step="0.01" value={item.quantity}
                                                                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                                className="w-full text-xs font-bold border-slate-200" required
                                                            />
                                                            <InputError message={errors[`items.${idx}.quantity`]} className="mt-1" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <TextInput
                                                                value={item.uom}
                                                                onChange={e => updateItem(idx, 'uom', e.target.value)}
                                                                className="w-full text-xs font-bold border-slate-200" required
                                                            />
                                                        </td>
                                                        {modalMode === 'edit' && (
                                                            <td className="px-4 py-3">
                                                                <select
                                                                    value={item.status}
                                                                    onChange={e => updateItem(idx, 'status', e.target.value)}
                                                                    className="w-full border-slate-200 rounded-xl text-[10px] font-black uppercase bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="issued">Issued</option>
                                                                    <option value="produced">Produced</option>
                                                                </select>
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-3 text-center">
                                                            {data.items.length > 1 && (
                                                                <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {data.items.length === 0 && (
                                        <div className="py-20 text-center">
                                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No items added</p>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.items} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                            <SecondaryButton onClick={closeModal} className="!rounded-xl">Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} className="!rounded-xl shadow-lg shadow-blue-100">
                                {modalMode === 'add' ? 'Create Production Order' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h2 className="text-lg font-black text-slate-800 mb-2 tracking-tight">Confirm Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-slate-800">"{itemToDelete?.order_number}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} className="!rounded-xl">Cancel</SecondaryButton>
                            <PrimaryButton onClick={executeDelete} disabled={processing} className="!bg-rose-600 !rounded-xl shadow-lg shadow-rose-100">Delete Order</PrimaryButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </ProductionStaffLayout>
    );
}
