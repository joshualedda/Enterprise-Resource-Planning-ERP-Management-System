import React, { useEffect, useState, useRef } from 'react';
import HRStaffLayout from '@/Layouts/HRStaffLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import toast, { Toaster } from 'react-hot-toast';
import { validateEmail, validateContactNumber, validateNumber } from '@/Components/Utils/Validation';

export default function CreateEmployee({ employee, departments, positions, civilStatuses, employeeStatuses, regions: allRegions = [] }) {
    const isUpdating = !!employee;
    const [preview, setPreview] = useState(employee?.image_url || null);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        email: employee?.email || '',
        contact: employee?.contact || '',
        department_id: employee?.department_id || '',
        position_id: employee?.position_id || '',
        civil_status_id: employee?.civil_status_id || '',
        employee_status_id: employee?.employee_status_id || '',
        status: employee?.status || 'active',
        region_id: employee?.region_id || '',
        province_id: employee?.province_id || '',
        municipality_id: employee?.municipality_id || '',
        barangay_id: employee?.barangay_id || '',
        birthday: employee?.birthday || '',
        gender: employee?.gender || '',
        date_started: employee?.date_started || '',
        sss: employee?.sss || '',
        tin: employee?.tin || '',
        phil_health: employee?.phil_health || '',
        pag_ibig: employee?.pag_ibig || '',
        remark: employee?.remark || '',
        employee_image: null,
    });

    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const isMountCascade = useRef(true);

    // Helpers for dynamic select
    const getProvinces = (region) => region?.provinces || [];
    const getMunicipalities = (prov) => prov?.municipalities || [];
    const getBarangays = (mun) => mun?.barangays || [];
    const getBarangayName = (b) => b?.brgyDesc || b?.name || b?.barangay_name || '';
    const rId = r => r?.region_id || r?.id;
    const pId = p => p?.province_id || p?.id;
    const mId = m => m?.municipality_id || m?.id;
    const bId = b => b?.barangay_id || b?.id;

    // Load initial cascading dropdowns
    useEffect(() => {
        if (!data.region_id) {
            isMountCascade.current = false;
            return;
        }

        const region = allRegions.find(r => String(rId(r)) === String(data.region_id));
        if (!region) { isMountCascade.current = false; return; }

        const provList = getProvinces(region);
        setProvinces(provList);

        if (data.province_id) {
            const prov = provList.find(p => String(pId(p)) === String(data.province_id));
            if (prov) {
                const munList = getMunicipalities(prov);
                setMunicipalities(munList);

                if (data.municipality_id) {
                    const mun = munList.find(m => String(mId(m)) === String(data.municipality_id));
                    if (mun) setBarangays(getBarangays(mun));
                }
            }
        }

        setTimeout(() => { isMountCascade.current = false; }, 200);
    }, []);

    // Cascade changes
    useEffect(() => {
        if (isMountCascade.current) return;
        const region = allRegions.find(r => String(rId(r)) === String(data.region_id));
        setProvinces(getProvinces(region));
        setMunicipalities([]);
        setBarangays([]);
        setData(prev => ({ ...prev, province_id: '', municipality_id: '', barangay_id: '' }));
    }, [data.region_id]);

    useEffect(() => {
        if (isMountCascade.current) return;
        const prov = provinces.find(p => String(pId(p)) === String(data.province_id));
        setMunicipalities(getMunicipalities(prov));
        setBarangays([]);
        setData(prev => ({ ...prev, municipality_id: '', barangay_id: '' }));
    }, [data.province_id]);

    useEffect(() => {
        if (isMountCascade.current) return;
        const mun = municipalities.find(m => String(mId(m)) === String(data.municipality_id));
        setBarangays(getBarangays(mun));
        setData(prev => ({ ...prev, barangay_id: '' }));
    }, [data.municipality_id]);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('employee_image', file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        let hasError = false;

        const emailError = validateEmail(data.email);
        if (emailError) {
            setError('email', emailError);
            hasError = true;
        } else {
            clearErrors('email');
        }

        const contactError = validateContactNumber(data.contact);
        if (contactError) {
            setError('contact', contactError);
            hasError = true;
        } else {
            clearErrors('contact');
        }

        const fieldsToValidate = [
            { key: 'sss', value: data.sss },
            { key: 'tin', value: data.tin },
            { key: 'phil_health', value: data.phil_health },
            { key: 'pag_ibig', value: data.pag_ibig }
        ];

        fieldsToValidate.forEach(field => {
            const error = validateNumber(field.value);
            if (error) {
                setError(field.key, error);
                hasError = true;
            } else {
                clearErrors(field.key);
            }
        });

        if (hasError) {
            toast.error('Please fix the errors in the form.');
            return;
        }

        const routeName = isUpdating 
            ? route('staff.hr.employees.update', employee.id) 
            : route('staff.hr.employees.store');
        
        post(routeName, {
            forceFormData: true,
            onError: () => {
                toast.error('Failed to save employee. Please check the form.');
            }
        });
    };

    const inputClass = "mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm py-2";
    const selectClass = "mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm py-2 disabled:opacity-40 disabled:cursor-not-allowed";
    const labelClass = "font-bold text-slate-700 text-xs uppercase tracking-widest text-slate-400";

    return (
        <HRStaffLayout>
            <Head title={isUpdating ? "Edit Employee" : "New Employee"} />
            <Toaster position="top-right" />

            <div className="w-full space-y-4 pb-8 animate-in fade-in duration-500">
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('staff.hr.employees')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                            {isUpdating ? 'Edit Employee Record' : 'New Employee Record'}
                        </h1>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Fill out the essential employee information below.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            
                            {/* Left Column: Profile Photo */}
                            <div className="md:col-span-2 space-y-3">
                                <InputLabel value="Employee Photo" className={labelClass} />
                                <div className={`w-full aspect-square rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden relative transition-all ${preview ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-300 bg-slate-50'}`}>
                                    {preview ? (
                                        <>
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <label htmlFor="file-upload" className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs shadow-xl">Change Photo</label>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                                                <svg className="h-5 w-5 text-indigo-400" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            </div>
                                            <label htmlFor="file-upload" className="cursor-pointer text-xs font-black text-indigo-600 hover:text-indigo-700 block">
                                                Click to upload
                                                <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                            <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">PNG/JPG</p>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.employee_image} />
                            </div>

                            {/* Right Column: Form Fields */}
                            <div className="md:col-span-10 space-y-6">
                                
                                {/* Personal Details */}
                                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Personal Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="First Name" className={labelClass} />
                                            <TextInput value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className={inputClass} required />
                                            <InputError message={errors.first_name} />
                                        </div>
                                        <div>
                                            <InputLabel value="Last Name" className={labelClass} />
                                            <TextInput value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className={inputClass} required />
                                            <InputError message={errors.last_name} />
                                        </div>
                                        <div>
                                            <InputLabel value="Email Address" className={labelClass} />
                                            <TextInput type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClass} />
                                            <InputError message={errors.email} />
                                        </div>
                                        <div>
                                            <InputLabel value="Contact No." className={labelClass} />
                                            <TextInput value={data.contact} onChange={(e) => setData('contact', e.target.value)} className={inputClass} />
                                            <InputError message={errors.contact} />
                                        </div>
                                        <div>
                                            <InputLabel value="Birthday" className={labelClass} />
                                            <TextInput type="date" value={data.birthday} onChange={(e) => setData('birthday', e.target.value)} className={inputClass} />
                                            <InputError message={errors.birthday} />
                                        </div>
                                        <div>
                                            <InputLabel value="Gender" className={labelClass} />
                                            <select value={data.gender} onChange={(e) => setData('gender', e.target.value)} className={selectClass} required>
                                                <option value="">Select...</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <InputError message={errors.gender} />
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Details */}
                                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Employment Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <InputLabel value="Date Started" className={labelClass} />
                                            <TextInput type="date" value={data.date_started} onChange={(e) => setData('date_started', e.target.value)} className={inputClass} required />
                                            <InputError message={errors.date_started} />
                                        </div>
                                        <div>
                                            <InputLabel value="Department" className={labelClass} />
                                            <select value={data.department_id} onChange={(e) => setData('department_id', e.target.value)} className={selectClass} required>
                                                <option value="">Select...</option>
                                                {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                                            </select>
                                            <InputError message={errors.department_id} />
                                        </div>
                                        <div>
                                            <InputLabel value="Position" className={labelClass} />
                                            <select value={data.position_id} onChange={(e) => setData('position_id', e.target.value)} className={selectClass} required>
                                                <option value="">Select...</option>
                                                {positions.map(p => <option key={p.id} value={p.id}>{p.position_name}</option>)}
                                            </select>
                                            <InputError message={errors.position_id} />
                                        </div>
                                        <div>
                                            <InputLabel value="Civil Status" className={labelClass} />
                                            <select value={data.civil_status_id} onChange={(e) => setData('civil_status_id', e.target.value)} className={selectClass}>
                                                <option value="">Select...</option>
                                                {civilStatuses.map(cs => <option key={cs.id} value={cs.id}>{cs.civil_status_name}</option>)}
                                            </select>
                                            <InputError message={errors.civil_status_id} />
                                        </div>
                                        <div>
                                            <InputLabel value="Employment Status" className={labelClass} />
                                            <select value={data.employee_status_id} onChange={(e) => setData('employee_status_id', e.target.value)} className={selectClass}>
                                                <option value="">Select...</option>
                                                {employeeStatuses.map(es => <option key={es.id} value={es.id}>{es.employee_status_name}</option>)}
                                            </select>
                                            <InputError message={errors.employee_status_id} />
                                        </div>
                                        <div>
                                            <InputLabel value="Active Status" className={labelClass} />
                                            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={selectClass} required>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                            <InputError message={errors.status} />
                                        </div>
                                    </div>
                                </div>

                                {/* Statutory & Additional Details */}
                                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Statutory & Other Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <InputLabel value="SSS No." className={labelClass} />
                                            <TextInput value={data.sss} onChange={(e) => setData('sss', e.target.value)} className={inputClass} placeholder="Optional" />
                                            <InputError message={errors.sss} />
                                        </div>
                                        <div>
                                            <InputLabel value="TIN No." className={labelClass} />
                                            <TextInput value={data.tin} onChange={(e) => setData('tin', e.target.value)} className={inputClass} placeholder="Optional" />
                                            <InputError message={errors.tin} />
                                        </div>
                                        <div>
                                            <InputLabel value="PhilHealth No." className={labelClass} />
                                            <TextInput value={data.phil_health} onChange={(e) => setData('phil_health', e.target.value)} className={inputClass} placeholder="Optional" />
                                            <InputError message={errors.phil_health} />
                                        </div>
                                        <div>
                                            <InputLabel value="Pag-IBIG No." className={labelClass} />
                                            <TextInput value={data.pag_ibig} onChange={(e) => setData('pag_ibig', e.target.value)} className={inputClass} placeholder="Optional" />
                                            <InputError message={errors.pag_ibig} />
                                        </div>
                                        <div className="sm:col-span-2 lg:col-span-4">
                                            <InputLabel value="Remarks" className={labelClass} />
                                            <TextInput value={data.remark} onChange={(e) => setData('remark', e.target.value)} className={inputClass} placeholder="Any additional notes or remarks" />
                                            <InputError message={errors.remark} />
                                        </div>
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Location / Address</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="Region" className={labelClass} />
                                            <select value={data.region_id} onChange={(e) => setData('region_id', e.target.value)} className={selectClass}>
                                                <option value="">Select Region</option>
                                                {allRegions.map(r => (
                                                    <option key={rId(r)} value={String(rId(r))}>
                                                        {r.regDesc || r.region_description}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.region_id} />
                                        </div>
                                        <div>
                                            <InputLabel value="Province" className={labelClass} />
                                            <select disabled={provinces.length === 0} value={data.province_id} onChange={(e) => setData('province_id', e.target.value)} className={selectClass}>
                                                <option value="">Select Province</option>
                                                {provinces.map(p => (
                                                    <option key={pId(p)} value={String(pId(p))}>{p.provDesc || p.province_name}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.province_id} />
                                        </div>
                                        <div>
                                            <InputLabel value="Municipality / City" className={labelClass} />
                                            <select disabled={municipalities.length === 0} value={data.municipality_id} onChange={(e) => setData('municipality_id', e.target.value)} className={selectClass}>
                                                <option value="">Select Municipality</option>
                                                {municipalities.map(m => (
                                                    <option key={mId(m)} value={String(mId(m))}>{m.citymunDesc || m.municipality_name}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.municipality_id} />
                                        </div>
                                        <div>
                                            <InputLabel value="Barangay" className={labelClass} />
                                            <select disabled={barangays.length === 0} value={data.barangay_id} onChange={(e) => setData('barangay_id', e.target.value)} className={selectClass}>
                                                <option value="">Select Barangay</option>
                                                {barangays.map(b => (
                                                    <option key={bId(b)} value={String(bId(b))}>{getBarangayName(b)}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.barangay_id} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                            <Link href={route('staff.hr.employees')} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition text-sm">
                                Cancel
                            </Link>
                            <PrimaryButton className="px-8 py-2.5 bg-indigo-600 rounded-xl text-sm font-black shadow-md shadow-indigo-200" disabled={processing}>
                                {processing ? 'Saving...' : (isUpdating ? 'Update Employee' : 'Save Employee')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </HRStaffLayout>
    );
}
