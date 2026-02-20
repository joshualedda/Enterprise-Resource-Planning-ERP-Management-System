import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal'; // Assuming this exists
import TextInput from '@/Components/TextInput'; // Assuming this exists
import InputLabel from '@/Components/InputLabel'; // Assuming this exists
import InputError from '@/Components/InputError'; // Assuming this exists
import SecondaryButton from '@/Components/SecondaryButton'; // Assuming this exists
import PrimaryButton from '@/Components/PrimaryButton'; // Assuming this exists
import DangerButton from '@/Components/DangerButton'; // Assuming this exists
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
    Search,
    Filter,
    Plus,
    Users,
    Shield,
    UserCheck,
    ArrowUpRight,
    ArrowDownRight,
    Mail,
    Trash2,
    Edit3,
    X,
    CheckCircle2,
    AlertCircle,
    ChevronDown
} from 'lucide-react';

// --- COMPONENTS ---

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center text-opacity-100`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend.value}%
                </span>
            )}
        </div>
        <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    </div>
);

const Avatar = ({ name, url }) => {
    const initials = name
        ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : '??';

    return (
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {url ? (
                <img src={url} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span className="text-xs font-black text-slate-500">{initials}</span>
            )}
        </div>
    );
};

const StatusBadge = ({ active }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {active ? 'Active' : 'Inactive'}
    </span>
);

const RoleBadge = ({ role }) => {
    const styles = {
        admin: 'bg-purple-50 text-purple-600 border-purple-100',
        staff: 'bg-blue-50 text-blue-600 border-blue-100',
        customer: 'bg-amber-50 text-amber-600 border-amber-100'
    };
    const roleKey = role?.toLowerCase() || 'customer';

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${styles[roleKey] || styles.customer}`}>
            {role}
        </span>
    );
};

export default function Index({ auth, users = [], roles = [] }) {
    const { flash } = usePage().props;

    // State
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form Handling
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        role_id: '',
        password: '',
        password_confirmation: '',
        admin_password: '', // For delete confirmation
    });

    // Toast Notifications
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Computed Data
    // Computed Data
    const processedUsers = useMemo(() => {
        let result = users.filter(user => {
            const matchesSearch =
                user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase());

            const matchesRole = roleFilter === 'All' || user.role?.name === roleFilter;

            return matchesSearch && matchesRole;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nested properties (e.g., role.name)
                if (sortConfig.key === 'role') {
                    aValue = a.role?.name || '';
                    bValue = b.role?.name || '';
                } else if (sortConfig.key === 'name') {
                    aValue = `${a.first_name} ${a.last_name}`;
                    bValue = `${b.first_name} ${b.last_name}`;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [users, search, roleFilter, sortConfig]);

    // Pagination Logic
    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter]);

    const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
    const paginatedUsers = processedUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const stats = useMemo(() => {
        return {
            total: users.length,
            staff: users.filter(u => u.role_id === 2).length,
            customers: users.filter(u => u.role_id === 3).length
        };
    }, [users]);

    // Handlers
    const openModal = (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        clearErrors();

        if (mode === 'edit' && user) {
            setData({
                first_name: user.first_name,
                middle_name: user.middle_name || '',
                last_name: user.last_name,
                email: user.email,
                role_id: user.role_id,
                password: '',
                password_confirmation: '',
                admin_password: ''
            });
        } else {
            reset();
            // Default to 'Customer' role or fallback to the last role available
            const defaultRole = roles.find(r => r.name.toLowerCase().includes('customer')) || roles[roles.length - 1];
            setData('role_id', defaultRole ? parseInt(defaultRole.id) : '');
        }
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const action = modalMode === 'edit' ? put : post;
        const url = modalMode === 'edit'
            ? route('admin.users.update', selectedUser.id)
            : route('admin.users.store');

        action(url, {
            onSuccess: () => {
                setShowModal(false);
                reset();
                toast.success(`User ${modalMode === 'edit' ? 'updated' : 'created'} successfully.`);
            },
            onError: () => toast.error('Check the form for errors.')
        });
    };

    const initiateDelete = (user) => {
        setSelectedUser(user);
        reset('admin_password');

        Swal.fire({
            title: 'Delete User?',
            text: `Are you sure you want to remove ${user.first_name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                setShowDeleteModal(true);
            }
        });
    };

    const handleFinalDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.users.destroy', selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                Swal.fire('Deleted!', 'User has been removed.', 'success');
            },
            onError: () => toast.error('Failed to delete user.')
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="User Management" />
            <Toaster position="top-right" />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
                {/* 1. Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Manage staff access and customer accounts.</p>
                    </div>
                    <div>
                        <button
                            onClick={() => openModal('create')}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            New Member
                        </button>
                    </div>
                </div>

                {/* 2. Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard label="Total Users" value={stats.total} icon={Users} color="bg-indigo-500" trend={{ isPositive: true, value: 12 }} />
                    <StatCard label="Staff Members" value={stats.staff} icon={Shield} color="bg-purple-500" trend={{ isPositive: true, value: 5 }} />
                    <StatCard label="Active Customers" value={stats.customers} icon={UserCheck} color="bg-emerald-500" trend={{ isPositive: false, value: 2 }} />
                </div>

                {/* 3. Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-medium transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex items-center md:w-auto w-full">
                            <Filter size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full md:w-48 pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors appearance-none"
                            >
                                <option value="All">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Staff">Staff</option>
                                <option value="Customer">Customer</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 4. Users Table */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th onClick={() => handleSort('name')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none group">
                                        <div className="flex items-center gap-1">User {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ArrowUpRight size={12} className="text-indigo-500" /> : <ArrowDownRight size={12} className="text-indigo-500" />)}</div>
                                    </th>
                                    <th onClick={() => handleSort('role')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none">
                                        <div className="flex items-center gap-1">Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? <ArrowUpRight size={12} className="text-indigo-500" /> : <ArrowDownRight size={12} className="text-indigo-500" />)}</div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
                                    <th onClick={() => handleSort('created_at')} className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors select-none">
                                        <div className="flex items-center gap-1">Joined Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? <ArrowUpRight size={12} className="text-indigo-500" /> : <ArrowDownRight size={12} className="text-indigo-500" />)}</div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-[10px] uppercase font-black tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar name={`${user.first_name} ${user.last_name}`} />
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{user.first_name} {user.last_name}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs font-medium text-slate-500">
                                                            <Mail size={12} />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <RoleBadge role={user.role?.name || 'Customer'} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge active={user.id % 5 !== 0} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-600">
                                                    {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <button
                                                        onClick={() => openModal('edit', user)}
                                                        className="p-2 rounded-lg text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => initiateDelete(user)}
                                                        className="p-2 rounded-lg text-slate-400 hover:bg-white hover:text-rose-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <Users size={32} className="text-slate-300" />
                                                </div>
                                                <h3 className="text-slate-900 font-bold mb-1">No users found</h3>
                                                <p className="text-slate-500 text-xs mb-6 max-w-xs mx-auto">
                                                    {search ? `No matches for "${search}"` : "Get started by adding a new member to your team."}
                                                </p>
                                                <button
                                                    onClick={() => { setSearch(''); setRoleFilter('All'); }}
                                                    className="px-5 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                                                >
                                                    Clear Filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronDown className="rotate-90 w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition ${currentPage === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={index} className="px-2 text-slate-400 font-bold">...</span>
                                )
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronDown className="-rotate-90 w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* --- MODALS --- */}

                {/* CREATE/EDIT MODAL */}
                <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                    <form onSubmit={submit} className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 capitalize">
                                    {modalMode} Member
                                </h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    {modalMode === 'create' ? 'Add a new user to the system.' : 'Update user details.'}
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="First Name" className="mb-1.5 !text-slate-500 !text-xs !uppercase !tracking-wider !font-bold" />
                                    <TextInput
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                        className="w-full !rounded-xl !border-slate-200 focus:!ring-indigo-500"
                                        placeholder="John"
                                    />
                                    <InputError message={errors.first_name} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel value="Last Name" className="mb-1.5 !text-slate-500 !text-xs !uppercase !tracking-wider !font-bold" />
                                    <TextInput
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                        className="w-full !rounded-xl !border-slate-200 focus:!ring-indigo-500"
                                        placeholder="Doe"
                                    />
                                    <InputError message={errors.last_name} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Email Address" className="mb-1.5 !text-slate-500 !text-xs !uppercase !tracking-wider !font-bold" />
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <TextInput
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full pl-10 !rounded-xl !border-slate-200 focus:!ring-indigo-500"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="User Role" className="mb-1.5 !text-slate-500 !text-xs !uppercase !tracking-wider !font-bold" />
                                <div className="grid grid-cols-3 gap-3">
                                    {roles.length > 0 ? (
                                        roles.map((role) => {
                                            const style = (() => {
                                                const name = role.name.toLowerCase();
                                                if (name.includes('admin')) return { icon: Shield, color: 'border-purple-200 bg-purple-50 text-purple-700' };
                                                if (name.includes('staff')) return { icon: UserCheck, color: 'border-blue-200 bg-blue-50 text-blue-700' };
                                                return { icon: Users, color: 'border-amber-200 bg-amber-50 text-amber-700' };
                                            })();

                                            return (
                                                <div
                                                    key={role.id}
                                                    onClick={() => setData('role_id', parseInt(role.id))}
                                                    className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all ${data.role_id === parseInt(role.id)
                                                        ? style.color + ' ring-2 ring-offset-1 ring-indigo-500/20'
                                                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                                        }`}
                                                >
                                                    <style.icon size={20} />
                                                    <span className="text-xs font-black capitalize">{role.name}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-red-500 col-span-3">No roles found. Please run seeders.</p>
                                    )}
                                </div>
                                <InputError message={errors.role_id} className="mt-1" />
                            </div>

                            {modalMode === 'create' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <InputLabel value="Password" className="mb-1.5 !text-slate-500 !text-xs !uppercase !tracking-wider !font-bold" />
                                        <TextInput
                                            type="password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            className="w-full !rounded-xl !border-slate-200 focus:!ring-indigo-500 bg-white"
                                            placeholder="••••••••"
                                        />
                                        <InputError message={errors.password} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel value="Confirm" className="mb-1.5 !text-slate-500 !text-xs !uppercase !tracking-wider !font-bold" />
                                        <TextInput
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            className="w-full !rounded-xl !border-slate-200 focus:!ring-indigo-500 bg-white"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <SecondaryButton onClick={() => setShowModal(false)} className="!rounded-xl !px-5">
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton className="!rounded-xl !px-6 !bg-indigo-600 hover:!bg-indigo-700 !text-white" disabled={processing}>
                                {modalMode === 'create' ? 'Create Account' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* DELETE CONFIRMATION MODAL */}
                <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="sm">
                    <form onSubmit={handleFinalDelete} className="p-6 text-center">
                        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Confirm Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Enter your admin password to delete <strong>{selectedUser?.first_name}</strong>. This action cannot be undone.
                        </p>

                        <TextInput
                            type="password"
                            value={data.admin_password}
                            onChange={e => setData('admin_password', e.target.value)}
                            className="w-full mb-4 text-center !rounded-xl !border-slate-200"
                            placeholder="Admin Password"
                            required
                        />

                        <div className="flex gap-2">
                            <SecondaryButton onClick={() => setShowDeleteModal(false)} className="flex-1 justify-center !rounded-xl">
                                Cancel
                            </SecondaryButton>
                            <DangerButton className="flex-1 justify-center !rounded-xl" disabled={processing}>
                                Delete User
                            </DangerButton>
                        </div>
                    </form>
                </Modal>

            </div>
        </AuthenticatedLayout>
    );
}
