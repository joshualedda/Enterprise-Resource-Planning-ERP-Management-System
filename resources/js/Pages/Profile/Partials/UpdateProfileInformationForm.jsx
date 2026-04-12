import { useForm, usePage, Link } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { MapPin, Phone, User, Mail } from 'lucide-react';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, className = '' }) {
    const { auth, regions: allRegions = [], userInformation: savedInfo = null } = usePage().props;
    const user = auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        first_name:      user.first_name   || '',
        middle_name:     user.middle_name  || '',
        last_name:       user.last_name    || '',
        email:           user.email        || '',
        region_id:       savedInfo?.region_id       || '',
        province_id:     savedInfo?.province_id     || '',
        municipality_id: savedInfo?.municipality_id || '',
        barangay_id:     savedInfo?.barangay_id     || '',
        zipcode:         savedInfo?.zipcode         || '',
    });

    const [provinces,      setProvinces]      = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays,      setBarangays]      = useState([]);
    const isMountCascade = useRef(true);

    // Helper: works for both camelCase (Eloquent collection) and snake_case (toArray())
    const getProvinces     = (region) => region?.provinces     || [];
    const getMunicipalities = (prov)  => prov?.municipalities  || [];
    const getBarangays     = (mun)    => mun?.barangays        || [];
    const getBarangayName  = (b)      => b?.brgyDesc || b?.name || b?.barangay_name || '';
    const rId = r => r?.region_id || r?.id;
    const pId = p => p?.province_id || p?.id;
    const mId = m => m?.municipality_id || m?.id;
    const bId = b => b?.barangay_id || b?.id;

    // ── On mount: pre-populate all cascading dropdowns from saved data ───────
    useEffect(() => {
        if (!savedInfo?.region_id) {
            isMountCascade.current = false;
            return;
        }

        const region = allRegions.find(r => String(rId(r)) === String(savedInfo.region_id));
        if (!region) { isMountCascade.current = false; return; }

        const provList = getProvinces(region);
        setProvinces(provList);

        if (savedInfo.province_id) {
            const prov = provList.find(p => String(pId(p)) === String(savedInfo.province_id));
            if (prov) {
                const munList = getMunicipalities(prov);
                setMunicipalities(munList);

                if (savedInfo.municipality_id) {
                    const mun = munList.find(m => String(mId(m)) === String(savedInfo.municipality_id));
                    if (mun) setBarangays(getBarangays(mun));
                }
            }
        }

        setTimeout(() => { isMountCascade.current = false; }, 200);
    }, []);

    // ── Region → load provinces ──────────────────────────────────────────────
    useEffect(() => {
        if (isMountCascade.current) return;
        const region = allRegions.find(r => String(rId(r)) === String(data.region_id));
        setProvinces(getProvinces(region));
        setMunicipalities([]);
        setBarangays([]);
        setData(prev => ({ ...prev, province_id: '', municipality_id: '', barangay_id: '' }));
    }, [data.region_id]);

    // ── Province → load municipalities ──────────────────────────────────────
    useEffect(() => {
        if (isMountCascade.current) return;
        const prov = provinces.find(p => String(pId(p)) === String(data.province_id));
        setMunicipalities(getMunicipalities(prov));
        setBarangays([]);
        setData(prev => ({ ...prev, municipality_id: '', barangay_id: '' }));
    }, [data.province_id]);

    // ── Municipality → load barangays ────────────────────────────────────────
    useEffect(() => {
        if (isMountCascade.current) return;
        const mun = municipalities.find(m => String(mId(m)) === String(data.municipality_id));
        setBarangays(getBarangays(mun));
        setData(prev => ({ ...prev, barangay_id: '' }));
    }, [data.municipality_id]);

    // ── Toast on save ────────────────────────────────────────────────────────
    useEffect(() => {
        if (recentlySuccessful) {
            toast.success('Profile updated successfully!', {
                duration: 4000,
                position: 'top-right',
                style: { borderRadius: '12px', background: '#1e293b', color: '#fff' },
            });
        }
    }, [recentlySuccessful]);

    const inputClass  = "mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-[#3BAA35] focus:border-[#3BAA35] transition-all text-sm";
    const selectClass = "mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-[#3BAA35] focus:border-[#3BAA35] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed";
    const labelClass  = "font-bold text-slate-700 text-sm";

    return (
        <section className={`bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden ${className}`}>
            <Toaster />
            <div className="absolute top-0 left-0 w-2 h-full bg-[#3BAA35]"></div>

            <header className="mb-10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#3BAA35]/10 flex items-center justify-center text-[#3BAA35]">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#0B1F3B] tracking-tight uppercase">Profile Information</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Acquisition Identity Management</p>
                    </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">Update your institutional identity records and verified delivery coordinates.</p>
            </header>

            <form onSubmit={e => { e.preventDefault(); patch(route('profile.update')); }} className="space-y-8">

                {/* Personal Details */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <User size={11} /> Personal Details
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="first_name" value="First Name" className={labelClass} />
                            <TextInput id="first_name" className={inputClass} value={data.first_name} onChange={e => setData('first_name', e.target.value)} required isFocused />
                            <InputError className="mt-1 text-xs" message={errors.first_name} />
                        </div>
                        <div>
                            <InputLabel htmlFor="middle_name" value="Middle Name (Optional)" className={labelClass} />
                            <TextInput id="middle_name" className={inputClass} value={data.middle_name} onChange={e => setData('middle_name', e.target.value)} />
                            <InputError className="mt-1 text-xs" message={errors.middle_name} />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="last_name" value="Last Name" className={labelClass} />
                            <TextInput id="last_name" className={inputClass} value={data.last_name} onChange={e => setData('last_name', e.target.value)} required />
                            <InputError className="mt-1 text-xs" message={errors.last_name} />
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Mail size={11} /> Email Address
                    </p>
                    <div>
                        <InputLabel htmlFor="email" value="Email" className={labelClass} />
                        <TextInput id="email" type="email" className={inputClass} value={data.email} onChange={e => setData('email', e.target.value)} required />
                        <InputError className="mt-1 text-xs" message={errors.email} />
                    </div>
                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <p className="text-sm text-amber-800 font-medium">
                                Your email is unverified.
                                <Link href={route('verification.send')} method="post" as="button" className="ml-2 underline hover:text-amber-900 font-bold">Resend link</Link>
                            </p>
                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">Verification link sent!</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Delivery Address */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={11} /> Delivery Address
                        </p>
                        {savedInfo && (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                                ✓ Saved address loaded
                            </span>
                        )}
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">

                        {/* Region */}
                        <div>
                            <InputLabel htmlFor="region_id" value="Region" className={labelClass} />
                            <select id="region_id" className={selectClass} value={data.region_id} onChange={e => setData('region_id', e.target.value)}>
                                <option value="">— Select Region —</option>
                                {allRegions.map(r => (
                                    <option key={rId(r)} value={String(rId(r))}>
                                        {r.regDesc || r.region_description} ({r.regCode || r.region_name})
                                    </option>
                                ))}
                            </select>
                            <InputError className="mt-1 text-xs" message={errors.region_id} />
                        </div>

                        {/* Province */}
                        <div>
                            <InputLabel htmlFor="province_id" value="Province" className={labelClass} />
                            <select id="province_id" className={selectClass} disabled={provinces.length === 0} value={data.province_id} onChange={e => setData('province_id', e.target.value)}>
                                <option value="">— Select Province —</option>
                                {provinces.map(p => (
                                    <option key={pId(p)} value={String(pId(p))}>{p.provDesc || p.province_name}</option>
                                ))}
                            </select>
                            <InputError className="mt-1 text-xs" message={errors.province_id} />
                        </div>

                        {/* City/Town + ZIP */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="municipality_id" value="City / Town" className={labelClass} />
                                <select id="municipality_id" className={selectClass} disabled={municipalities.length === 0} value={data.municipality_id} onChange={e => setData('municipality_id', e.target.value)}>
                                    <option value="">— Select City / Town —</option>
                                    {municipalities.map(m => (
                                        <option key={mId(m)} value={String(mId(m))}>{m.citymunDesc || m.municipality_name}</option>
                                    ))}
                                </select>
                                <InputError className="mt-1 text-xs" message={errors.municipality_id} />
                            </div>
                            <div>
                                <InputLabel htmlFor="zipcode" value="ZIP Code" className={labelClass} />
                                <TextInput id="zipcode" className={inputClass} value={data.zipcode} onChange={e => setData('zipcode', e.target.value)} placeholder="0000" />
                                <InputError className="mt-1 text-xs" message={errors.zipcode} />
                            </div>
                        </div>

                        {/* Barangay */}
                        <div>
                            <InputLabel htmlFor="barangay_id" value="Barangay" className={labelClass} />
                            <select id="barangay_id" className={selectClass} disabled={barangays.length === 0} value={data.barangay_id} onChange={e => setData('barangay_id', e.target.value)}>
                                <option value="">— Select Barangay —</option>
                                {barangays.map(b => (
                                    <option key={bId(b)} value={String(bId(b))}>{getBarangayName(b)}</option>
                                ))}
                            </select>
                            <InputError className="mt-1 text-xs" message={errors.barangay_id} />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black">
                        {processing ? 'Saving...' : 'Save Changes'}
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}