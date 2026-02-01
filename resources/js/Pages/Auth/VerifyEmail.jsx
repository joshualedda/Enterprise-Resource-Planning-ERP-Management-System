import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="text-center">
                {/* 1. Icon Header para sa Visual Cue */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify your email</h2>
                
                <p className="mb-6 text-sm text-gray-600 leading-relaxed px-4">
                    Thanks for joining us! We've sent a verification link to your email address. 
                    Please click it to activate your account. 
                    <span className="block mt-2 font-medium">Didn't Receive?</span>
                </p>
            </div>

            {/* 2. Success Alert Box */}
            {status === 'verification-link-sent' && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                A new link has been sent to your email.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex flex-col space-y-4 items-center">
                    {/* 3. Primary Action - Malaki at kitang-kita */}
                    <PrimaryButton 
                        disabled={processing} 
                        className="w-full justify-center py-3"
                    >
                        {processing ? 'Sending...' : 'Resend Verification Email'}
                    </PrimaryButton>

                    {/* 4. Secondary Action - Logout */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-gray-500 hover:text-gray-800 transition duration-150 ease-in-out font-medium hover:underline"
                    >
                        Log Out and try again
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}