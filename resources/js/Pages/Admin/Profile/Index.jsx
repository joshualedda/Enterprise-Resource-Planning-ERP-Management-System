import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import toast, { Toaster } from 'react-hot-toast';

const tabs = [
    { id: 'profile', label: 'Profile Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'danger', label: 'Danger Zone', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
];

/* ═══════════════════════════════════════════════════════════
   PROFILE INFO TAB
   ═══════════════════════════════════════════════════════════ */
function ProfileInfoPanel({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        email: user.email,
    });

    useEffect(() => {
        if (recentlySuccessful) {
            toast.success('Profile updated successfully!', {
                position: 'top-right',
                style: { borderRadius: '12px', background: '#0B1F3B', color: '#fff' },
            });
        }
    }, [recentlySuccessful]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-[#0B1F3B]">Profile Information</h3>
                <p className="text-sm text-slate-500 mt-0.5">Update your account's public identity and email address.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); patch(route('profile.update')); }} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" className="text-sm font-semibold text-slate-700" />
                        <TextInput id="first_name" className="mt-1.5 block w-full border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35]" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required isFocused />
                        <InputError className="mt-1" message={errors.first_name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" className="text-sm font-semibold text-slate-700" />
                        <TextInput id="last_name" className="mt-1.5 block w-full border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35]" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required />
                        <InputError className="mt-1" message={errors.last_name} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="middle_name" value="Middle Name (Optional)" className="text-sm font-semibold text-slate-700" />
                    <TextInput id="middle_name" className="mt-1.5 block w-full border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35]" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-sm font-semibold text-slate-700" />
                    <div className="relative mt-1.5">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <TextInput id="email" type="email" className="block w-full pl-11 border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35]" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                    </div>
                    <InputError className="mt-1" message={errors.email} />
                </div>

                {mustVerifyEmail && usePage().props.auth.user.email_verified_at === null && (
                    <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-sm text-amber-800 font-medium">
                            Your email is unverified.
                            <Link href={route('verification.send')} method="post" as="button" className="ml-2 underline hover:text-amber-900 font-bold">Resend link</Link>
                        </p>
                        {status === 'verification-link-sent' && <div className="mt-2 text-xs font-bold text-green-600">Verification link sent!</div>}
                    </div>
                )}

                <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button type="submit" disabled={processing} className="px-6 py-2.5 bg-[#0B1F3B] text-white text-sm font-semibold rounded-lg hover:bg-[#0f2c54] hover:shadow-lg transition-all disabled:opacity-60">
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECURITY TAB
   ═══════════════════════════════════════════════════════════ */
function SecurityPanel() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (recentlySuccessful) {
            toast.success('Password updated successfully!', {
                position: 'top-right',
                style: { borderRadius: '12px', background: '#0B1F3B', color: '#fff' },
            });
        }
    }, [recentlySuccessful]);

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) { reset('password', 'password_confirmation'); passwordInput.current?.focus(); }
                if (errors.current_password) { reset('current_password'); currentPasswordInput.current?.focus(); }
                toast.error('Could not update password. Check the form.');
            },
        });
    };

    const EyeToggle = ({ show, onToggle }) => (
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1F3B] p-1 focus:outline-none transition-colors">
            {show ? (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            ) : (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
            )}
        </button>
    );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-[#0B1F3B]">Change Password</h3>
                <p className="text-sm text-slate-500 mt-0.5">Ensure your account uses a strong, unique password.</p>
            </div>

            <form onSubmit={updatePassword} className="space-y-5">
                {/* Current Password */}
                <div>
                    <InputLabel htmlFor="current_password" value="Current Password" className="text-sm font-semibold text-slate-700" />
                    <div className="relative mt-1.5">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <TextInput id="current_password" ref={currentPasswordInput} type={showCurrent ? 'text' : 'password'} value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} placeholder="••••••••" className={`block w-full pl-11 pr-12 border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] ${errors.current_password ? 'border-red-400' : ''}`} />
                        <EyeToggle show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
                    </div>
                    <InputError message={errors.current_password} className="mt-1 text-red-500" />
                </div>

                {/* New + Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="password" value="New Password" className="text-sm font-semibold text-slate-700" />
                        <div className="relative mt-1.5">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                            </div>
                            <TextInput id="password" ref={passwordInput} type={showNew ? 'text' : 'password'} value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="••••••••" className={`block w-full pl-11 pr-12 border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] ${errors.password ? 'border-red-400' : ''}`} />
                            <EyeToggle show={showNew} onToggle={() => setShowNew(!showNew)} />
                        </div>
                        <InputError message={errors.password} className="mt-1 text-red-500" />
                        <p className="mt-1.5 text-xs text-slate-400">Use at least 8 characters with mixed case and numbers.</p>
                    </div>
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-sm font-semibold text-slate-700" />
                        <div className="relative mt-1.5">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <TextInput id="password_confirmation" type={showNew ? 'text' : 'password'} value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="••••••••" className={`block w-full pl-11 border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] ${errors.password_confirmation ? 'border-red-400' : ''}`} />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1 text-red-500" />
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button type="submit" disabled={processing} className="px-6 py-2.5 bg-[#0B1F3B] text-white text-sm font-semibold rounded-lg hover:bg-[#0f2c54] hover:shadow-lg transition-all disabled:opacity-60">
                        {processing ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   DANGER ZONE TAB
   ═══════════════════════════════════════════════════════════ */
function DangerZonePanel() {
    const [expanded, setExpanded] = useState(false);
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const closeModal = () => { setConfirmingUserDeletion(false); clearErrors(); reset(); };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-red-700">Danger Zone</h3>
                <p className="text-sm text-slate-500 mt-0.5">Irreversible actions that affect your account permanently.</p>
            </div>

            {/* Accordion */}
            <div className="border border-red-200 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 bg-red-50/50 hover:bg-red-50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-[18px] h-[18px] text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-red-800">Delete Account</p>
                            <p className="text-xs text-red-600/70">Permanently remove your account and all associated data.</p>
                        </div>
                    </div>
                    <svg className={`w-5 h-5 text-red-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {expanded && (
                    <div className="p-4 bg-white border-t border-red-100">
                        <div className="p-3.5 bg-red-50 rounded-lg border border-red-100 mb-4">
                            <p className="text-xs text-red-700 leading-relaxed">
                                <strong>Warning:</strong> Once your account is deleted, all resources and data will be permanently removed. This action cannot be undone. Please back up any important information before proceeding.
                            </p>
                        </div>
                        <button onClick={() => setConfirmingUserDeletion(true)} className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all">
                            I understand, delete my account
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={(e) => { e.preventDefault(); destroy(route('profile.destroy'), { preserveScroll: true, onSuccess: () => closeModal(), onError: () => passwordInput.current?.focus(), onFinish: () => reset() }); }} className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-[#0B1F3B]">Are you absolutely sure?</h2>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6">This action cannot be undone. All your data, orders, and preferences will be permanently deleted. Please enter your password to confirm.</p>

                    <div>
                        <InputLabel htmlFor="delete_password" value="Enter your password" className="text-sm font-semibold text-slate-700" />
                        <TextInput id="delete_password" type="password" ref={passwordInput} value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1.5 block w-full border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500" isFocused placeholder="Type your password to confirm..." />
                        <InputError message={errors.password} className="mt-1 text-red-500" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Go Back</button>
                        <button type="submit" disabled={processing} className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50">
                            {processing ? 'Deleting...' : 'Yes, Delete My Account'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function Index({ auth, mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('profile');
    const user = auth.user;
    const initials = `${(user.first_name?.[0] || '').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}`;
    const fullName = [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(' ');

    const roleBadge = (role) => {
        const map = {
            admin: { label: 'Administrator', bg: 'bg-[#0B1F3B]', text: 'text-white' },
            inventory_staff: { label: 'Inventory Staff', bg: 'bg-blue-100', text: 'text-blue-800' },
            production_staff: { label: 'Production Staff', bg: 'bg-amber-100', text: 'text-amber-800' },
            cashier_staff: { label: 'Cashier Staff', bg: 'bg-green-100', text: 'text-green-800' },
            marketing_staff: { label: 'Marketing Staff', bg: 'bg-purple-100', text: 'text-purple-800' },
            accounting_staff: { label: 'Accounting Staff', bg: 'bg-teal-100', text: 'text-teal-800' },
        };
        const r = map[role] || { label: role || 'User', bg: 'bg-gray-100', text: 'text-gray-800' };
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${r.bg} ${r.text}`}>{r.label}</span>;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Account Center" />
            <Toaster />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ═══ Profile Summary Header ═══ */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                    {/* Accent bar */}
                    <div className="h-1 bg-[#3BAA35]" />

                    <div className="p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B1F3B] to-[#0f2c54] flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-xl font-extrabold text-white tracking-tight">{initials}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-xl font-bold text-[#0B1F3B] truncate">{fullName}</h1>
                                    {roleBadge(user.role)}
                                </div>
                                <p className="text-sm text-slate-500 mt-0.5 truncate">{user.email}</p>

                                {/* Chips */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-xs font-semibold text-green-700 border border-green-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Active
                                    </span>
                                    {user.last_login_at && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-slate-500 border border-gray-100">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Last login: {new Date(user.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    )}
                                    {user.department && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-slate-500 border border-gray-100">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            {user.department}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 flex-shrink-0 self-start">
                                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'profile' ? 'bg-[#0B1F3B] text-white shadow-lg' : 'border border-gray-200 text-slate-600 hover:bg-gray-50'}`}>
                                    Edit Profile
                                </button>
                                <button onClick={() => setActiveTab('security')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'security' ? 'bg-[#0B1F3B] text-white shadow-lg' : 'border border-gray-200 text-slate-600 hover:bg-gray-50'}`}>
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ Content Area: Side Tabs + Panel ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">

                    {/* ── Sidebar Tabs (desktop vertical / mobile horizontal) ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 lg:p-4 h-fit">
                        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all w-full text-left ${
                                        activeTab === tab.id
                                            ? tab.id === 'danger'
                                                ? 'bg-red-50 text-red-700 border border-red-100'
                                                : 'bg-[#0B1F3B]/5 text-[#0B1F3B] border border-[#0B1F3B]/10'
                                            : 'text-slate-500 hover:bg-gray-50 hover:text-slate-700'
                                    }`}
                                >
                                    <svg className={`w-[18px] h-[18px] flex-shrink-0 ${activeTab === tab.id && tab.id === 'danger' ? 'text-red-500' : activeTab === tab.id ? 'text-[#3BAA35]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                                    </svg>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* ── Active Panel ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                        {activeTab === 'profile' && <ProfileInfoPanel mustVerifyEmail={mustVerifyEmail} status={status} />}
                        {activeTab === 'security' && <SecurityPanel />}
                        {activeTab === 'danger' && <DangerZonePanel />}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
