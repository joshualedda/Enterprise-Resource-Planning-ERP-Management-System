import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [emailFeedback, setEmailFeedback] = useState({ message: '', type: '' });

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        const checkEmail = async () => {
            if (data.email.length < 5 || !data.email.includes('@') || !data.email.includes('.')) {
                setEmailFeedback({ message: '', type: '' });
                return;
            }
            setIsChecking(true);
            try {
                const response = await axios.post('/api/check-email', { email: data.email });
                if (response.data.exists) {
                    setEmailFeedback({ message: 'This email is already in use.', type: 'error' });
                } else {
                    setEmailFeedback({ message: 'Email is available!', type: 'success' });
                }
            } catch (err) {
                setEmailFeedback({ message: 'Could not verify email.', type: 'error' });
            } finally {
                setIsChecking(false);
            }
        };
        const timeoutId = setTimeout(checkEmail, 600);
        return () => clearTimeout(timeoutId);
    }, [data.email]);

    const submit = (e) => {
        e.preventDefault();
        if (emailFeedback.type === 'error') return;
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Create Account — D'SERICORE" />
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F7F9FB] relative overflow-hidden">

                {/* Background blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#3BAA35]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0B1F3B]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

                {/* ═══ LEFT PANEL — Hero (hidden on mobile) ═══ */}
                <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0B1F3B] via-[#0f2c54] to-[#0B1F3B] relative overflow-hidden p-12">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-10 w-auto" />
                            <span className="text-xl font-extrabold tracking-tight text-white">
                                D'SERI<span className="text-[#3BAA35]">CORE</span>
                            </span>
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div>
                            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
                                Join the Official
                                <br />
                                <span className="text-[#C9A227]">Silk Marketplace.</span>
                            </h2>
                            <p className="text-white/50 text-base mt-4 max-w-sm leading-relaxed">
                                Create your account to browse, order, and track premium silk products from SRDI.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', label: 'Shop Authenticated Silk Products' },
                                { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', label: 'Track Orders in Real-Time' },
                                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Secure & Private' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-[#3BAA35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-white/70 font-medium">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-xs text-white/30 font-medium">
                            © 2026 SRDI — Don Mariano Marcos Memorial State University
                        </p>
                    </div>
                </div>

                {/* ═══ RIGHT PANEL — Register Form ═══ */}
                <div className="flex items-center justify-center p-6 lg:p-12 relative z-10">
                    <div className="w-full max-w-md">

                        {/* Brand Header */}
                        <div className="text-center mb-8">
                            <Link href="/" className="inline-flex items-center gap-2.5 lg:hidden mb-6">
                                <ApplicationLogo className="h-10 w-auto" />
                                <span className="text-xl font-extrabold tracking-tight text-[#0B1F3B]">
                                    D'SERI<span className="text-[#3BAA35]">CORE</span>
                                </span>
                            </Link>
                            <h1 className="text-2xl font-bold text-[#0B1F3B]">Create your account</h1>
                            <p className="text-sm text-slate-500 mt-1">Fill in the details below to get started</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-2">DMMMSU • SRDI Official Portal</p>
                        </div>

                        {/* Auth Card */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
                            <form onSubmit={submit} className="space-y-4">

                                {/* Name Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="first_name" value="First Name" className="text-sm font-semibold text-slate-700" />
                                        <TextInput
                                            id="first_name"
                                            value={data.first_name}
                                            placeholder="Juan"
                                            className={`mt-1.5 block w-full border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] ${errors.first_name ? 'border-red-400' : ''}`}
                                            isFocused={true}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.first_name} className="mt-1 text-red-500" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="last_name" value="Last Name" className="text-sm font-semibold text-slate-700" />
                                        <TextInput
                                            id="last_name"
                                            value={data.last_name}
                                            placeholder="Dela Cruz"
                                            className={`mt-1.5 block w-full border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] ${errors.last_name ? 'border-red-400' : ''}`}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.last_name} className="mt-1 text-red-500" />
                                    </div>
                                </div>

                                {/* Middle Name */}
                                <div>
                                    <InputLabel htmlFor="middle_name" value="Middle Name (Optional)" className="text-sm font-semibold text-slate-700" />
                                    <TextInput
                                        id="middle_name"
                                        value={data.middle_name}
                                        placeholder="Santos"
                                        className="mt-1.5 block w-full border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35]"
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                    />
                                </div>

                                {/* Email with live validation */}
                                <div>
                                    <InputLabel htmlFor="email" value="Email Address" className="text-sm font-semibold text-slate-700" />
                                    <div className="relative mt-1.5">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <TextInput
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            placeholder="name@company.com"
                                            className={`block w-full pl-11 border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] transition-all ${
                                                emailFeedback.type === 'error' ? 'border-red-400' :
                                                emailFeedback.type === 'success' ? 'border-green-400' : ''
                                            }`}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        {isChecking && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-[#3BAA35] border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    {emailFeedback.message && (
                                        <p className={`mt-1.5 text-xs font-semibold ${
                                            emailFeedback.type === 'error' ? 'text-red-500' : 'text-green-600'
                                        }`}>
                                            {emailFeedback.message}
                                        </p>
                                    )}
                                    <InputError message={errors.email} className="mt-1 text-red-500" />
                                </div>

                                {/* Password */}
                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="text-sm font-semibold text-slate-700" />
                                    <div className="relative mt-1.5">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <TextInput
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            placeholder="••••••••"
                                            className={`block w-full pl-11 pr-12 border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] ${errors.password ? 'border-red-400' : ''}`}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1F3B] p-1 focus:outline-none transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            ) : (
                                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1 text-red-500" />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-sm font-semibold text-slate-700" />
                                    <div className="relative mt-1.5">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <TextInput
                                            id="password_confirmation"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            placeholder="••••••••"
                                            className={`block w-full pl-11 border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] ${errors.password_confirmation ? 'border-red-400' : ''}`}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1 text-red-500" />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing || emailFeedback.type === 'error'}
                                    className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                                        emailFeedback.type === 'error'
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-[#0B1F3B] text-white hover:bg-[#0f2c54] hover:shadow-lg'
                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating account...
                                        </span>
                                    ) : 'Create Account'}
                                </button>
                            </form>
                        </div>

                        {/* Footer Link */}
                        <p className="text-center text-sm text-slate-500 font-medium mt-6">
                            Already have an account?{' '}
                            <Link href={route('login')} className="text-[#3BAA35] font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}