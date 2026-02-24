import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
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
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8 text-center">
                <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
                <p className="text-sm text-slate-500 mt-2">Please enter your details to sign in.</p>
            </div>

            {/* --- ALERT SECTION --- */}
            {status && (
                <div className="mb-6 flex items-center p-4 text-emerald-800 border-t-4 border-emerald-500 bg-emerald-50 rounded-lg shadow-sm animate-fade-in-down">
                    <svg className="flex-shrink-0 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3 text-sm font-bold">
                        {/* Kung galing sa Admin 'store' or Registration, ito ang lalabas */}
                        {status}
                    </div>
                </div>
            )}
            {/* --- END ALERT SECTION --- */}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-slate-700 font-bold" />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        placeholder="name@gmail/company.com"
                        className="mt-1 block w-full bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition-all rounded-xl"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex justify-between items-center">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-700 font-bold" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 underline decoration-2 underline-offset-4"
                            >
                                Forgot Password?
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        value={data.password}
                        placeholder="••••••••"
                        className="mt-1 block w-full bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition-all rounded-xl"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                            Remember this device
                        </span>
                    </label>
                </div>

                <PrimaryButton
                    className="w-full justify-center py-3.5 bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-200 transition-all active:scale-[0.98] rounded-xl text-base font-bold"
                    disabled={processing}
                >
                    {processing ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </span>
                    ) : 'Sign In'}
                </PrimaryButton>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    Don't have an account yet?{' '}
                    <Link href={route('register')} className="text-indigo-600 font-black hover:text-indigo-800 transition-colors underline decoration-2 underline-offset-4">
                        Create an Account
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}