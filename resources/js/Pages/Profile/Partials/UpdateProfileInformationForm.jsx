import { useForm, usePage, Link } from '@inertiajs/react';
import { useEffect } from 'react'; // Import useEffect
import toast, { Toaster } from 'react-hot-toast'; // Import toast
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        email: user.email,
    });

    // Trigger toast when successfully saved
    useEffect(() => {
        if (recentlySuccessful) {
            toast.success('Profile updated successfully!', {
                duration: 4000,
                position: 'top-right',
                // Custom styling to match your slate/indigo theme
                style: {
                    borderRadius: '12px',
                    background: '#1e293b',
                    color: '#fff',
                },
            });
        }
    }, [recentlySuccessful]);

    return (
        <section className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm ${className}`}>
            {/* Add the Toaster container anywhere in your JSX */}
            <Toaster />

            <header className="mb-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Profile Information</h2>
                <p className="mt-1 text-sm text-slate-500">Update your account's public identity and email address.</p>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); patch(route('profile.update')); }} className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" className="font-bold text-slate-700" />
                        <TextInput id="first_name" className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white transition-all" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required isFocused />
                        <InputError className="mt-2" message={errors.first_name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="middle_name" value="Middle Name (Optional)" className="font-bold text-slate-700" />
                        <TextInput id="middle_name" className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white transition-all" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                        <InputError className="mt-2" message={errors.middle_name} />
                    </div>
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="last_name" value="Last Name" className="font-bold text-slate-700" />
                        <TextInput id="last_name" className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white transition-all" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required />
                        <InputError className="mt-2" message={errors.last_name} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="font-bold text-slate-700" />
                    <TextInput id="email" type="email" className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white transition-all" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-sm text-amber-800 font-medium">
                            Your email is unverified.
                            <Link href={route('verification.send')} method="post" as="button" className="ml-2 underline hover:text-amber-900 font-bold">Resend link</Link>
                        </p>
                        {status === 'verification-link-sent' && <div className="mt-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">Verification link sent!</div>}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700">
                        Save Changes
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}