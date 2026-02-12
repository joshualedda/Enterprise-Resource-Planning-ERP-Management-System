import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    // Email Validation States
    const [isChecking, setIsChecking] = useState(false);
    const [emailFeedback, setEmailFeedback] = useState({ message: '', type: '' }); // type: 'error' or 'success'

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Real-time Email Unique Check with Debounce
    useEffect(() => {
        const checkEmail = async () => {
            // Basic validation bago tumawag sa server
            if (data.email.length < 5 || !data.email.includes('@') || !data.email.includes('.')) {
                setEmailFeedback({ message: '', type: '' });
                return;
            }

            setIsChecking(true);
            try {
                // Tatawag sa Laravel Route na ginawa natin sa web.php
                const response = await axios.post('/api/check-email', { email: data.email });

                if (response.data.exists) {
                    setEmailFeedback({ message: '❌ This email is already in use.', type: 'error' });
                } else {
                    setEmailFeedback({ message: '✅ Email is available!', type: 'success' });
                }
            } catch (err) {
                console.error("Email validation error:", err);
                setEmailFeedback({ message: '⚠️ Could not verify email at the moment.', type: 'error' });
            } finally {
                setIsChecking(false);
            }
        };

        const timeoutId = setTimeout(checkEmail, 600); // 600ms delay para hindi masyadong mabilis ang request
        return () => clearTimeout(timeoutId);
    }, [data.email]);

    const submit = (e) => {
        e.preventDefault();
        // Pigilan ang submit kung may error sa email check
        if (emailFeedback.type === 'error') return;

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create Account" />

            <div className="mb-8 text-center">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
                <p className="text-sm text-slate-500 mt-1">Please fill in the details to register.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {/* First Name */}
                <div>
                    <InputLabel htmlFor="first_name" value="First Name" className="font-bold text-slate-700" />
                    <TextInput
                        id="first_name"
                        value={data.first_name}
                        className="mt-1 block w-full bg-slate-50 border-slate-200"
                        autoComplete="given-name"
                        isFocused={true}
                        onChange={(e) => setData('first_name', e.target.value)}
                        required
                    />
                    <InputError message={errors.first_name} className="mt-2" />
                </div>

                {/* Middle Name */}
                <div>
                    <InputLabel htmlFor="middle_name" value="Middle Name (Optional)" className="font-bold text-slate-700" />
                    <TextInput
                        id="middle_name"
                        value={data.middle_name}
                        className="mt-1 block w-full bg-slate-50 border-slate-200"
                        autoComplete="additional-name"
                        onChange={(e) => setData('middle_name', e.target.value)}
                    />
                    <InputError message={errors.middle_name} className="mt-2" />
                </div>

                {/* Last Name */}
                <div>
                    <InputLabel htmlFor="last_name" value="Last Name" className="font-bold text-slate-700" />
                    <TextInput
                        id="last_name"
                        value={data.last_name}
                        className="mt-1 block w-full bg-slate-50 border-slate-200"
                        autoComplete="family-name"
                        onChange={(e) => setData('last_name', e.target.value)}
                        required
                    />
                    <InputError message={errors.last_name} className="mt-2" />
                </div>

                {/* Email with Instant Validation */}
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="font-bold text-slate-700" />
                    <div className="relative">
                        <TextInput
                            id="email"
                            type="email"
                            value={data.email}
                            className={`mt-1 block w-full bg-slate-50 transition-all ${emailFeedback.type === 'error' ? 'border-red-500 focus:ring-red-500' :
                                    emailFeedback.type === 'success' ? 'border-emerald-500 focus:ring-emerald-500' : 'border-slate-200'
                                }`}
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {/* Loading Spinner inside input */}
                        {isChecking && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Real-time Feedback Message */}
                    {emailFeedback.message && (
                        <p className={`mt-2 text-[11px] font-black uppercase tracking-wider ${emailFeedback.type === 'error' ? 'text-red-500' : 'text-emerald-600'
                            }`}>
                            {emailFeedback.message}
                        </p>
                    )}
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password with Eye Toggle Icon */}
                <div>
                    <InputLabel htmlFor="password" value="Password" className="font-bold text-slate-700" />
                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            className="block w-full bg-slate-50 pr-12 border-slate-200"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-1 focus:outline-none"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="font-bold text-slate-700" />
                    <TextInput
                        id="password_confirmation"
                        type={showPassword ? 'text' : 'password'}
                        value={data.password_confirmation}
                        className="mt-1 block w-full bg-slate-50 border-slate-200"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <PrimaryButton
                        className={`w-full justify-center py-3.5 rounded-xl shadow-lg transition-all ${emailFeedback.type === 'error'
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                            }`}
                        disabled={processing || emailFeedback.type === 'error'}
                    >
                        {processing ? 'Processing...' : 'Register Account'}
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    Already have an account?{' '}
                    <Link href={route('login')} className="text-indigo-600 font-black hover:underline">
                        Log in here
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}