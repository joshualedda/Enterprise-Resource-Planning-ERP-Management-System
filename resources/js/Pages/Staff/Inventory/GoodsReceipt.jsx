import { useState, useMemo, useEffect, useRef } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
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
        case 'draft': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'posted': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'void': return 'bg-rose-50 text-rose-600 border-rose-100';
        default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
}

function KpiCard({ label, value, sub, iconPath, iconBg, badge, badgeColor }) {
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
                {badge && (
                    <span className={`mt-2 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function GoodsReceipt({
    goodsReceipts: serverReceipts,
    purchaseOrders: serverPOs,
    warehouses: serverWarehouses,
    products: serverProducts,
    batches: serverBatches,
    stats: serverStats,
    filters: serverFilters = {},
    flash
}) {
    const isServer = serverReceipts && serverReceipts.data !== undefined;
    const rows = isServer ? serverReceipts.data : [];
    const stats = serverStats ?? { total: 0, posted: 0 };
    
    // Lookups
    const purchaseOrders = isServer ? serverPOs : [];
    const warehouses = isServer ? serverWarehouses : [];
    const products = isServer ? serverProducts : [];
    const batches = isServer ? serverBatches : [];

    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const [search, setSearch] = useState(serverFilters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(serverFilters.status ?? 'All');

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        if (!isServer) return;
        const timeoutId = setTimeout(() => {
            router.get(route('staff.inventory.goods-receipts.index'), {
                search: search || undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, isServer]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        purchase_order_id: '',
        warehouse_id: '',
        receipt_number: '',
        status: 'draft',
        received_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [{ product_id: '', batch_id: '', quantity_received: 1, unit_cost: 0 }],
    });

    const openModal = (mode, p = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && p) {
            setData({
                id: p.id,
                purchase_order_id: p.purchase_order_id || '',
                warehouse_id: p.warehouse_id || '',
                receipt_number: p.receipt_number || '',
                status: p.status || 'draft',
                received_date: p.received_date ? p.received_date.split(' ')[0] : '', // Adjust date format if datetime string
                notes: p.notes || '',
                items: p.items && p.items.length > 0 ? p.items.map(i => ({
                    product_id: i.product_id,
                    batch_id: i.batch_id || '',
                    quantity_received: i.quantity_received,
                    unit_cost: i.unit_cost
                })) : [{ product_id: '', batch_id: '', quantity_received: 1, unit_cost: 0 }],
            });
        } else {
            reset();
            setData('receipt_number', `GR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const handlePoChange = (e) => {
        const poId = e.target.value;
        setData('purchase_order_id', poId);
        
        // Auto-fill items from the selected PO
        if (poId && isServer) {
            const selectedPo = purchaseOrders.find(po => String(po.id) === String(poId));
            if (selectedPo && selectedPo.items && selectedPo.items.length > 0) {
                const newItems = selectedPo.items.map(item => ({
                    product_id: item.product_id,
                    batch_id: '',
                    quantity_received: item.quantity, // Default suggestion to ordered quantity
                    unit_cost: item.unit_cost
                }));
                setData(prev => ({ ...prev, purchase_order_id: poId, items: newItems }));
            }
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        
        if(data.items.length === 0 || !data.items[0].product_id) return alert('Please add at least one valid item');

        if (modalMode === 'add') {
            post(route('staff.inventory.goods-receipts.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            put(route('staff.inventory.goods-receipts.update', data.id), {
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
            destroy(route('staff.inventory.goods-receipts.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
                onFinish: () => setItemToDelete(null),
            });
        }
    };

    // Item Management commands
    const addItemRow = () => setData('items', [...data.items, { product_id: '', batch_id: '', quantity_received: 1, unit_cost: 0 }]);
    const updateItemRow = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        
        if (field === 'product_id' && isServer) {
            const prod = products.find(prod => String(prod.id) === String(value));
            if (prod && prod.cost_price) {
                newItems[index]['unit_cost'] = prod.cost_price;
            }
        }
        
        setData('items', newItems);
    };
    const removeItemRow = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const calculateTotal = (items) => {
        if(!items) return 0;
        return items.reduce((sum, current) => sum + (Number(current.quantity_received) * Number(current.unit_cost)), 0);
    };

    const filtered = useMemo(() => {
        if (isServer) return rows;
        return rows.filter(p => {
            const matchSearch = search === '' || p.receipt_number.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === 'All' || p.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [rows, search, statusFilter, isServer]);

    const kpis = [
        {
            label: 'Total Receipts', value: stats.total, badge: 'All Records', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'Posted', value: stats.posted, badge: 'Finalized', badgeColor: 'text-emerald-600 bg-emerald-50',
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
    ];

    const uniqueStatuses = ['All', 'draft', 'posted', 'void'];

    return (
        <InventoryStaffLayout>
            <Head title="Goods Receipts — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Goods Receipts</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Acknowledge delivery and record items into warehouses.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200 ml-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Receive Goods
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
                                placeholder="Search by Receipt #…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none appearance-none cursor-pointer transition capitalize"
                        >
                            {uniqueStatuses.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <p className="mt-3 text-[11px] font-bold text-slate-400">
                        Showing <span className="text-slate-700 font-black">{filtered.length}</span> receipt{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <Table
                    title="📦 Goods Receipts"
                    subtitle="List of all delivery receipts recorded"
                    badgeCount={filtered.length}
                    columns={['#', 'Receipt Details', 'Source (PO)', 'Warehouse', 'Received Date', 'Total Value', 'Status', 'Actions']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl">🧾</div>
                            <p className="text-sm font-black text-slate-300">No goods receipts found</p>
                            <p className="text-xs text-slate-300">Start by receiving items from a purchase order.</p>
                        </div>
                    }
                    footer={isServer && serverReceipts.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                Page {serverReceipts.current_page} of {serverReceipts.last_page}
                                &nbsp;·&nbsp; {serverReceipts.total} total
                            </p>
                            <Pagination 
                                currentPage={serverReceipts.current_page} 
                                totalPages={serverReceipts.last_page} 
                                onPageChange={(page) => {
                                    router.get(route(route().current()), {
                                        search,
                                        status: statusFilter,
                                        page
                                    }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    )}
                >
                    {filtered.map((r, i) => (
                        <Tr key={r.id}>
                            <Td className="text-xs font-bold text-slate-300">{i + 1}</Td>
                            <Td>
                                <div>
                                    <p className="text-sm font-black text-indigo-700 leading-tight">{r.receipt_number}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{r.items?.length || 0} items</p>
                                </div>
                            </Td>
                            <Td>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-bold text-slate-800">{r.purchase_order?.order_number || '—'}</span>
                                    <span className="text-[10px] text-slate-400 truncate w-32">{r.purchase_order?.supplier?.name}</span>
                                </div>
                            </Td>
                            <Td>
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{r.warehouse?.name || '—'}</span>
                            </Td>
                            <Td>
                                <span className="text-xs text-slate-800 font-medium">{r.received_date || '—'}</span>
                            </Td>
                            <Td>
                                <span className="text-sm font-black text-slate-800">{phpFmt(calculateTotal(r.items))}</span>
                            </Td>
                            <Td>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border capitalize ${statusBadge(r.status)}`}>
                                    {r.status}
                                </span>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => isServer ? openModal('edit', r) : null} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                        Edit
                                    </button>
                                    <button onClick={() => isServer ? confirmDelete(r) : null} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                        Delete
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                <Modal show={isModalOpen} onClose={closeModal} maxWidth="3xl">
                    <form onSubmit={submitForm} className="p-0 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h2 className="text-lg font-black text-slate-800">{modalMode === 'add' ? 'Receive Goods' : `Edit Receipt: ${data.receipt_number}`}</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5">Record the physical inventory received against a purchase order.</p>
                        </div>
                        
                        {/* Scrollable Body */}
                        <div className="p-5 max-h-[65vh] overflow-y-auto scroll-smooth">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Left Side - Receipt Details */}
                                <div className="col-span-1 space-y-4">
                                    <h3 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-2 border-b border-indigo-100 pb-2">Record Info</h3>
                                    
                                    <div>
                                        <InputLabel htmlFor="receipt_number" value="Receipt Number *" />
                                        <TextInput id="receipt_number" value={data.receipt_number} onChange={e => setData('receipt_number', e.target.value)} className="mt-1 block w-full bg-slate-50 font-mono text-sm" required />
                                        <InputError message={errors.receipt_number} className="mt-1 text-xs" />
                                    </div>
                                    
                                    <div>
                                        <InputLabel htmlFor="purchase_order_id" value="Source Purchase Order *" />
                                        <select id="purchase_order_id" value={data.purchase_order_id} onChange={handlePoChange} className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-sm" required>
                                            <option value="">-- Select PO --</option>
                                            {purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.order_number} ({po.supplier?.name})</option>)}
                                        </select>
                                        <InputError message={errors.purchase_order_id} className="mt-1 text-xs" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="warehouse_id" value="Destination Warehouse *" />
                                        <select id="warehouse_id" value={data.warehouse_id} onChange={e => setData('warehouse_id', e.target.value)} className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-sm" required>
                                            <option value="">-- Select Warehouse --</option>
                                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                        <InputError message={errors.warehouse_id} className="mt-1 text-xs" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="received_date" value="Received Date *" />
                                        <TextInput type="date" id="received_date" value={data.received_date} onChange={e => setData('received_date', e.target.value)} className="mt-1 block w-full" required />
                                        <InputError message={errors.received_date} className="mt-1 text-xs" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="status" value="Status *" />
                                        <select id="status" value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-sm capitalize" required>
                                            <option value="draft">Draft</option>
                                            <option value="posted">Posted</option>
                                            <option value="void">Void</option>
                                        </select>
                                        <InputError message={errors.status} className="mt-1 text-xs" />
                                        {data.status === 'posted' && (
                                            <p className="text-[10px] text-emerald-600 font-bold mt-1">Posting will affect inventory levels (WIP Logic).</p>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="notes" value="Notes/Remarks" />
                                        <textarea id="notes" value={data.notes} onChange={e => setData('notes', e.target.value)} className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-sm" rows="3"></textarea>
                                        <InputError message={errors.notes} className="mt-1 text-xs" />
                                    </div>
                                </div>

                                {/* Right Side - Items Received */}
                                <div className="col-span-1 border-l border-slate-100 pl-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2 mb-2">
                                        <h3 className="text-xs font-black text-indigo-700 uppercase tracking-widest">Items Received</h3>
                                        <button type="button" onClick={addItemRow} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition">
                                            + Add Item
                                        </button>
                                    </div>

                                    {data.items.length > 0 && (
                                        <div className="grid grid-cols-12 gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                            <div className="col-span-4">Product</div>
                                            <div className="col-span-3">Batch</div>
                                            <div className="col-span-2 text-center">Qty</div>
                                            <div className="col-span-2 text-right">Cost</div>
                                            <div className="col-span-1 text-center"></div>
                                        </div>
                                    )}

                                    {data.items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200 group">
                                            <div className="col-span-4">
                                                <select
                                                    value={item.product_id}
                                                    onChange={e => updateItemRow(index, 'product_id', e.target.value)}
                                                    className="block w-full border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-lg shadow-sm text-xs py-1.5 px-2"
                                                    required
                                                >
                                                    <option value="">Product...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name ?? p.product}</option>)}
                                                </select>
                                                <InputError message={errors[`items.${index}.product_id`]} className="mt-1 text-[10px]" />
                                            </div>
                                            <div className="col-span-3">
                                                <select
                                                    value={item.batch_id}
                                                    onChange={e => updateItemRow(index, 'batch_id', e.target.value)}
                                                    className="block w-full border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-lg shadow-sm text-xs py-1.5 px-2"
                                                >
                                                    <option value="">None...</option>
                                                    {batches.map(b => <option key={b.id} value={b.id}>{b.batch_code}</option>)}
                                                </select>
                                                <InputError message={errors[`items.${index}.batch_id`]} className="mt-1 text-[10px]" />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.quantity_received}
                                                    onChange={e => updateItemRow(index, 'quantity_received', e.target.value)}
                                                    className="block w-full border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-lg shadow-sm text-xs py-1.5 px-2 text-center"
                                                    required
                                                    placeholder="Qty"
                                                />
                                                 <InputError message={errors[`items.${index}.quantity_received`]} className="mt-1 text-[10px]" />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_cost}
                                                    onChange={e => updateItemRow(index, 'unit_cost', e.target.value)}
                                                    className="block w-full border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-lg shadow-sm text-xs py-1.5 px-2 text-right"
                                                    required
                                                    placeholder="Cost"
                                                />
                                                 <InputError message={errors[`items.${index}.unit_cost`]} className="mt-1 text-[10px]" />
                                            </div>
                                            <div className="col-span-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItemRow(index)}
                                                    className="text-slate-300 hover:text-rose-500 p-1 transition opacity-0 group-hover:opacity-100"
                                                >
                                                    <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {data.items.length === 0 && (
                                        <div className="text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 mt-2">
                                            <p className="text-xs font-bold text-slate-400">No items specified for receipt.</p>
                                        </div>
                                    )}

                                    {/* Total Value */}
                                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                                        <div className="bg-indigo-50 px-4 py-2 rounded-xl inline-flex items-center gap-3 border border-indigo-100">
                                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Total Value</span>
                                            <span className="text-lg font-black text-indigo-900">{phpFmt(calculateTotal(data.items))}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal} type="button">Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} className="!bg-indigo-600 hover:!bg-indigo-700 focus:!ring-indigo-500">
                                {processing ? 'Processing...' : (modalMode === 'add' ? 'Confirm Receipt' : 'Save Changes')}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">Confirm Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete Goods Receipt <span className="font-bold text-slate-800">{itemToDelete?.receipt_number}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                onClick={executeDelete}
                                disabled={processing}
                                className="!bg-rose-600 hover:!bg-rose-700 focus:!ring-rose-500"
                            >
                                {processing ? 'Deleting...' : 'Delete'}
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>

            </div>
        </InventoryStaffLayout>
    );
}
