import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password — D'SERICORE" />
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
                                Account Recovery.
                                <br />
                                <span className="text-[#C9A227]">Quick & Secure.</span>
                            </h2>
                            <p className="text-white/50 text-base mt-4 max-w-sm leading-relaxed">
                                We'll send a secure link to your email so you can reset your password and regain access.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Reset link sent via email' },
                                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Secure token-based verification' },
                                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Your data stays protected' },
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

                {/* ═══ RIGHT PANEL — Forgot Password Form ═══ */}
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

                            {/* Key icon */}
                            <div className="mx-auto w-14 h-14 bg-[#0B1F3B]/5 rounded-2xl flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-[#0B1F3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-[#0B1F3B]">Forgot your password?</h1>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                No worries — enter your email and we'll send you a secure link to reset it.
                            </p>
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
                                            Sending link...
                                        </span>
                                    ) : 'Send Reset Link'}
                                </button>
                            </form>
                        </div>

                        {/* Footer Link */}
                        <p className="text-center text-sm text-slate-500 font-medium mt-6">
                            <Link href={route('login')} className="text-[#3BAA35] font-bold hover:underline inline-flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}