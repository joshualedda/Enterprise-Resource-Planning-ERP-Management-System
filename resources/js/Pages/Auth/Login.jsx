import { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in — D'SERICORE" />
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F7F9FB] relative overflow-hidden">

                {/* Background blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#3BAA35]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0B1F3B]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

                {/* ═══ LEFT PANEL — Hero (hidden on mobile) ═══ */}
                <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0B1F3B] via-[#0f2c54] to-[#0B1F3B] relative overflow-hidden p-12">
                    {/* Subtle pattern overlay */}
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
                                Premium Philippine Silk.
                                <br />
                                <span className="text-[#C9A227]">Research-backed.</span>
                            </h2>
                            <p className="text-white/50 text-base mt-4 max-w-sm leading-relaxed">
                                Access the official sericulture ERP and eCommerce platform of DMMMSU.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Official Institutional Portal' },
                                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Traceable Supply Chain' },
                                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Secure Access' },
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

                {/* ═══ RIGHT PANEL — Login Form ═══ */}
                <div className="flex items-center justify-center p-6 lg:p-12 relative z-10">
                    <div className="w-full max-w-md">

                        {/* Brand Header (visible on mobile, compact on desktop) */}
                        <div className="text-center mb-8">
                            <Link href="/" className="inline-flex items-center gap-2.5 lg:hidden mb-6">
                                <ApplicationLogo className="h-10 w-auto" />
                                <span className="text-xl font-extrabold tracking-tight text-[#0B1F3B]">
                                    D'SERI<span className="text-[#3BAA35]">CORE</span>
                                </span>
                            </Link>
                            <h1 className="text-2xl font-bold text-[#0B1F3B]">Welcome back</h1>
                            <p className="text-sm text-slate-500 mt-1">Sign in to your account to continue</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-2">DMMMSU • SRDI Official Portal</p>
                        </div>

                        {/* Auth Card */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">

                            {/* Status Alert */}
                            {status && (
                                <div className="mb-6 flex items-center gap-3 p-3.5 text-green-800 bg-green-50 border border-green-100 rounded-xl text-sm font-medium">
                                    <svg className="flex-shrink-0 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                {/* Email */}
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
                                            className={`block w-full pl-11 border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] transition-all ${errors.email ? 'border-red-400' : ''}`}
                                            isFocused={true}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-1.5 text-red-500" />
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel htmlFor="password" value="Password" className="text-sm font-semibold text-slate-700" />
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-xs font-semibold text-[#3BAA35] hover:underline"
                                            >
                                                Forgot Password?
                                            </Link>
                                        )}
                                    </div>
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
                                            className={`block w-full pl-11 pr-12 border-gray-200 rounded-lg focus:ring-[#3BAA35] focus:border-[#3BAA35] transition-all ${errors.password ? 'border-red-400' : ''}`}
                                            onChange={(e) => setData('password', e.target.value)}
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
                                    <InputError message={errors.password} className="mt-1.5 text-red-500" />
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center">
                                    <label className="flex items-center cursor-pointer group">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                        />
                                        <span className="ms-2 text-sm text-gray-600 font-medium group-hover:text-slate-900 transition-colors">
                                            Remember this device
                                        </span>
                                    </label>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#0B1F3B] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#0f2c54] hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Signing in...
                                        </span>
                                    ) : 'Sign In'}
                                </button>
                            </form>
                        </div>

                        {/* Footer Link */}
                        <p className="text-center text-sm text-slate-500 font-medium mt-6">
                            Don't have an account?{' '}
                            <Link href={route('register')} className="text-[#3BAA35] font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}