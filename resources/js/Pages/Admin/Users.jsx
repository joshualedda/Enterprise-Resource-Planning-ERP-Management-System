import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react'; // Dagdag ang router
import { useState, useEffect, useMemo } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

// Libraries
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AdminUsers({ auth, users }) {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // --- NEW STATES FOR SEARCH & PAGINATION ---
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Dito mo i-set kung ilan ang lalabas sa table

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '', 
        email: '', 
        role: 'staff', 
        password: '', 
        password_confirmation: '',
        admin_password: '', 
    });

    // --- FIX: TOAST ALERT LOGIC ---
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // --- SEARCH LOGIC ---
    const filteredUsers = useMemo(() => {
        return users
            .filter(user => user.id !== auth.user.id)
            .filter(user => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [users, auth.user.id, searchQuery]);

    // --- PAGINATION CALCULATION ---
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(start, start + itemsPerPage);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1); // Balik sa page 1 pag nag-search
    }, [searchQuery]);

    const stats = useMemo(() => ({
        total: users.length,
        staff: users.filter(u => u.role === 'staff').length,
        customers: users.filter(u => u.role === 'customer').length
    }), [users]);

    // Avatar Logic
    const getAvatarInfo = (name) => {
        const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
        const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-orange-500'];
        const charCodeSum = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
        return { initials, color: colors[charCodeSum % colors.length] };
    };

    const openModal = (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        clearErrors();
        if (user && mode === 'edit') {
            setData({
                name: user.name,
                email: user.email,
                role: user.role,
                password: '',
                password_confirmation: '',
                admin_password: '',
            });
            setShowModal(true);
        } else if (mode === 'view') {
            setShowViewModal(true);
        } else {
            reset();
            setShowModal(true);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const action = modalMode === 'edit' ? put : post;
        const url = modalMode === 'edit' ? route('admin.users.update', selectedUser.id) : route('admin.users.store');

        action(url, {
            onSuccess: () => { 
                setShowModal(false); 
                reset();
            }
        });
    };

    const initiateDelete = (user) => {
        setSelectedUser(user);
        clearErrors();
        reset('admin_password');

        Swal.fire({
            title: 'Delete User?',
            text: `Are you sure you want to delete this account ${user.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            borderRadius: '24px',
        }).then((result) => {
            if (result.isConfirmed) {
                setShowDeleteModal(true);
            }
        });
    };

    const handleFinalDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.users.destroy', selectedUser.id), {
            data: { admin_password: data.admin_password },
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                reset('admin_password');
                Swal.fire('Deleted!', 'User removed.', 'success');
            },
            onError: () => {
                toast.error("Wrong Password, Try again.");
            }
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-bold text-xl text-slate-800 tracking-tight">User Management</h2>}
        >
            <Head title="System Users" />
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
                {/* STAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard label="Total Users" value={stats.total} color="text-slate-900" />
                    <StatCard label="Total Staff" value={stats.staff} color="text-indigo-500" dot="bg-indigo-400" />
                    <StatCard label="Total Customers" value={stats.customers} color="text-emerald-500" dot="bg-emerald-400" />
                </div>

                {/* SEARCH AND ADD BUTTON */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-2">
                    <div className="relative w-full md:w-96">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                            🔍
                        </span>
                        <input 
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button onClick={() => openModal('create')} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95">
                        + New Member
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedUsers.length > 0 ? paginatedUsers.map((user) => {
                                    const avatar = getAvatarInfo(user.name);
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-11 h-11 rounded-full ${avatar.color} flex items-center justify-center font-black text-white text-xs shadow-md border-2 border-white uppercase`}>
                                                        {avatar.initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                                        <p className="text-xs font-medium text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openModal('view', user)} className="p-2 rounded-xl text-[11px] font-black px-4 border bg-white hover:bg-slate-100 text-slate-600 border-slate-200 transition-all">View</button>
                                                    <button onClick={() => openModal('edit', user)} className="p-2 rounded-xl text-[11px] font-black px-4 border bg-slate-50 hover:bg-indigo-50 text-indigo-600 border-slate-100 transition-all">Edit</button>
                                                    <button onClick={() => initiateDelete(user)} className="bg-slate-50 hover:bg-rose-50 text-rose-600 p-2 rounded-xl text-[11px] font-black px-4 border border-slate-100 transition-all">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-10 text-center text-slate-400 text-sm font-medium">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <SecondaryButton 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="!py-2 !px-4"
                                >
                                    Previous
                                </SecondaryButton>
                                <SecondaryButton 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="!py-2 !px-4"
                                >
                                    Next
                                </SecondaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* VIEW MODAL */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="md">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className={`w-24 h-24 rounded-full ${getAvatarInfo(selectedUser?.name).color} flex items-center justify-center font-black text-white text-2xl shadow-xl mb-4 border-4 border-white`}>
                            {getAvatarInfo(selectedUser?.name).initials}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{selectedUser?.name}</h2>
                        <span className="mt-1 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {selectedUser?.role}
                        </span>
                    </div>

                    <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</p>
                            <p className="text-sm font-bold text-slate-700">{selectedUser?.email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Account Created</p>
                            <p className="text-sm font-bold text-slate-700">{new Date(selectedUser?.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <PrimaryButton onClick={() => setShowViewModal(false)} className="w-full justify-center py-4">
                            Close Profile
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* CREATE / EDIT MODAL */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="md">
                <form onSubmit={submit} className="p-8">
                    <h2 className="text-2xl font-black text-slate-900 capitalize mb-6">{modalMode} Member</h2>
                    <div className="space-y-5">
                        <FormInput label="Full Name" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                        <FormInput label="Email Address" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} />
                        
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Role</label>
                            <select 
                                className="w-full mt-1.5 border-slate-200 rounded-2xl font-bold text-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                value={data.role} 
                                onChange={(e) => setData('role', e.target.value)}
                            >
                                <option value="staff">Staff</option>
                                <option value="customer">Customer</option>
                            </select>
                        </div>

                        {modalMode === 'create' && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} />
                                <FormInput label="Confirm" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                            </div>
                        )}
                    </div>
                    <div className="mt-10 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowModal(false)} type="button">Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>{modalMode === 'edit' ? 'Save Changes' : 'Create Member'}</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* PASSWORD VERIFICATION MODAL */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="md">
                <form onSubmit={handleFinalDelete} className="p-8 text-center">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">🔐</div>
                    <h2 className="text-xl font-black text-slate-900">Security Check</h2>
                    <p className="mt-2 text-sm text-slate-500 px-4">Type your password for confirmation of deletion for <b>{selectedUser?.name}</b>.</p>
                    
                    <div className="mt-6 text-left">
                        <TextInput 
                            type="password" 
                            className="w-full text-center" 
                            value={data.admin_password} 
                            onChange={(e) => setData('admin_password', e.target.value)} 
                            placeholder="••••••••"
                            autoFocus
                        />
                       
                    </div>

                    <div className="mt-8 flex gap-3">
                        <SecondaryButton className="flex-1 justify-center py-3" type="button" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton className="flex-1 justify-center py-3" disabled={processing}>
                            {processing ? 'Deleting...' : 'Confirm'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, color, dot }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
                {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>}
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            </div>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
        </div>
    );
}

function FormInput({ label, type = "text", value, onChange, error, ...props }) {
    return (
        <div className="w-full">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
            <TextInput type={type} className="w-full mt-1.5" value={value} onChange={onChange} {...props} />
            {error && <InputError message={error} className="mt-1" />}
        </div>
    );
}