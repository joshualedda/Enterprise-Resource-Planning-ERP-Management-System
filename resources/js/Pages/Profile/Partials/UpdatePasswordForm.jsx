import { useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react'; // Added useEffect
import toast, { Toaster } from 'react-hot-toast'; // Added toast
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { ShieldCheck } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '', 
        password: '', 
        password_confirmation: '',
    });

    // Handle Toast Notifications
    useEffect(() => {
        if (recentlySuccessful) {
            toast.success('Password updated successfully!', {
                position: 'top-right',
                style: { borderRadius: '12px', background: '#1e293b', color: '#fff' },
            });
        }
    }, [recentlySuccessful]);

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
                // Optional: Notify the user via toast that there were errors
                toast.error('Could not update password. Check the form.');
            },
        });
    };

    return (
        <section className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden ${className}`}>
            <Toaster />
            <div className="absolute top-0 left-0 w-2 h-full bg-[#0B1F3B]"></div>
            
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#0B1F3B]/10 flex items-center justify-center text-[#0B1F3B]">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#0B1F3B] tracking-tight uppercase">Security</h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Credentials Protection</p>
                    </div>
                </div>
                <p className="text-xs text-slate-500 font-medium">Keep your scientific assets safe by utilizing a strong, institutional-grade password.</p>
            </header>

            <form onSubmit={updatePassword} className="space-y-5">
                <div>
                    <InputLabel htmlFor="current_password" value="Current Password" />
                    <TextInput id="current_password" ref={currentPasswordInput} value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} type="password" className="mt-1 block w-full bg-slate-50" />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="password" value="New Password" />
                        <TextInput id="password" ref={passwordInput} value={data.password} onChange={(e) => setData('password', e.target.value)} type="password" className="mt-1 block w-full bg-slate-50" />
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirm New Password" />
                        <TextInput id="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} type="password" className="mt-1 block w-full bg-slate-50" />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <PrimaryButton disabled={processing} className="bg-slate-900 hover:bg-black">
                        Update Password
                    </PrimaryButton>
                    
                    {/* The old Transition logic is removed as the Toast handles the feedback now */}
                </div>
            </form>
        </section>
    );
}