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
import { validateContactNumber } from '@/Components/Utils/Validation';

// DUMMY DATA FOR SUPPLIERS
const DUMMY_SUPPLIERS = [
    { id: 1, name: 'Silk Farms Inc.', contact_person: 'Maria Santos', phone: '0917-123-4567', email: 'maria@silkfarms.com', address: 'Baguio City' },
    { id: 2, name: 'Baguio Mulberry Co.', contact_person: 'Jose Rizal', phone: '0918-987-6543', email: 'jose@mulberry.co', address: 'La Trinidad, Benguet' },
    { id: 3, name: 'Global Threads', contact_person: 'Ana Reyes', phone: '0920-555-1234', email: 'ana@globalthreads.ph', address: 'Manila' },
];

const DUMMY_STATS = {
    total: 3,
    recent: 1,
};

function SupplierAvatar({ name }) {
    const initial = name?.[0]?.toUpperCase() ?? 'S';
    return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
            {initial}
        </div>
    );
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

export default function Suppliers({ suppliers: serverSuppliers, stats: serverStats, filters: serverFilters = {}, flash }) {
    const isServer = serverSuppliers && serverSuppliers.data !== undefined;
    const rows = isServer ? serverSuppliers.data : DUMMY_SUPPLIERS;
    const stats = serverStats ?? DUMMY_STATS;

    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const [search, setSearch] = useState(serverFilters.search ?? '');

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        if (!isServer) return;
        const timeoutId = setTimeout(() => {
            router.get(route('staff.inventory.suppliers.index'), {
                search: search || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, isServer]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
    });

    const openModal = (mode, p = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && p) {
            setData({
                id: p.id,
                name: p.name || '',
                contact_person: p.contact_person || '',
                phone: p.phone || '',
                email: p.email || '',
                address: p.address || '',
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
    };

    const submitForm = (e) => {
        e.preventDefault();

        // Client-side validation for Phone
        const phoneError = validateContactNumber(data.phone);
        if (phoneError) {
            setData('phone', data.phone); // trigger re-render
            errors.phone = phoneError; // Manually set error for display
            return;
        }

        if (modalMode === 'add') {
            post(route('staff.inventory.suppliers.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            put(route('staff.inventory.suppliers.update', data.id), {
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
            destroy(route('staff.inventory.suppliers.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
                onFinish: () => setItemToDelete(null),
            });
        }
    };

    const filtered = useMemo(() => {
        if (isServer) return rows;
        return rows.filter(p => {
            const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase());
            return matchSearch;
        });
    }, [rows, search, isServer]);

    const kpis = [
        {
            label: 'Total Suppliers', value: stats.total, badge: 'All Partners', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'New This Month', value: stats.recent, badge: 'Recent', badgeColor: 'text-emerald-600 bg-emerald-50',
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Suppliers — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Suppliers</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Manage supplier records and contact information.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-200 ml-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Supplier
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
                                placeholder="Search by supplier name…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                            />
                        </div>
                    </div>
                    <p className="mt-3 text-[11px] font-bold text-slate-400">
                        Showing <span className="text-slate-700 font-black">{filtered.length}</span> supplier{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <Table
                    title="🤝 Supplier Directory"
                    subtitle="List of all registered suppliers"
                    badgeCount={filtered.length}
                    columns={['#', 'Supplier Name', 'Contact Person', 'Contact Details', 'Address', 'Actions']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl">🏢</div>
                            <p className="text-sm font-black text-slate-300">No suppliers found</p>
                            <p className="text-xs text-slate-300">Try adjusting your search.</p>
                        </div>
                    }
                    footer={isServer && (
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                Page {serverSuppliers.current_page} of {serverSuppliers.last_page}
                                &nbsp;·&nbsp; {serverSuppliers.total} total
                            </p>
                            <Pagination 
                                currentPage={serverSuppliers.current_page} 
                                totalPages={serverSuppliers.last_page} 
                                onPageChange={(page) => {
                                    router.get(route(route().current()), {
                                        search,
                                        page
                                    }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    )}
                >
                    {filtered.map((p, i) => (
                        <Tr key={p.id}>
                            <Td className="text-xs font-bold text-slate-300">{i + 1}</Td>
                            <Td>
                                <div className="flex items-center gap-3">
                                    <SupplierAvatar name={p.name} />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 leading-tight">{p.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">ID #{p.id}</p>
                                    </div>
                                </div>
                            </Td>
                            <Td>
                                <span className="text-sm text-slate-600 font-medium">{p.contact_person || '—'}</span>
                            </Td>
                            <Td>
                                <div className="flex flex-col gap-0.5">
                                    {p.phone && <span className="text-xs text-slate-600">📞 {p.phone}</span>}
                                    {p.email && <span className="text-xs text-slate-600">✉️ {p.email}</span>}
                                    {!p.phone && !p.email && <span className="text-xs text-slate-400">—</span>}
                                </div>
                            </Td>
                            <Td>
                                <span className="text-xs text-slate-600 truncate max-w-[200px] block">{p.address || '—'}</span>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => isServer ? openModal('edit', p) : null} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                        Edit
                                    </button>
                                    <button onClick={() => isServer ? confirmDelete(p) : null} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                        Delete
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                    <form onSubmit={submitForm} className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">
                            {modalMode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <InputLabel htmlFor="name" value="Supplier Name *" />
                                <TextInput id="name" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="contact_person" value="Contact Person" />
                                <TextInput id="contact_person" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.contact_person} className="mt-2" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="phone" value="Phone (PH Format: 09...)" />
                                <TextInput 
                                    id="phone" 
                                    value={data.phone} 
                                    onChange={e => {
                                        setData('phone', e.target.value);
                                        if (errors.phone) clearErrors('phone');
                                    }} 
                                    onBlur={() => {
                                        const err = validateContactNumber(data.phone);
                                        if (err) errors.phone = err; 
                                        else clearErrors('phone');
                                    }}
                                    className="mt-1 block w-full" 
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>
                            
                            <div className="col-span-2">
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="col-span-2">
                                <InputLabel htmlFor="address" value="Address" />
                                <textarea id="address" value={data.address} onChange={e => setData('address', e.target.value)} className="mt-1 block w-full border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm" rows="3"></textarea>
                                <InputError message={errors.address} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>{modalMode === 'add' ? 'Save Supplier' : 'Save Changes'}</PrimaryButton>
                        </div>
                    </form>
                </Modal>

                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">Confirm Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete the supplier <span className="font-bold text-slate-800">"{itemToDelete?.name}"</span>? This action cannot be undone.
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
